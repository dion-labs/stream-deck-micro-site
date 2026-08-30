import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../app/globals.css';
import '../app/setup.css';

declare global {
  interface Window {
    zaraz?: {
      track: (eventName: string, properties?: Record<string, string>) => Promise<void> | void;
    };
  }
}

type CapabilityMode = 'live' | 'navigation-only' | 'offline';
type HealthState = 'ready' | 'navigation-only' | 'action-required' | 'offline' | 'not-required';
type ConnectionState = 'idle' | 'checking' | 'connected' | 'failed';

interface HealthComponent {
  state: HealthState;
  message: string;
  version?: string;
}

interface HostedHealth {
  schemaVersion: number;
  generatedAt: string;
  privacy: string;
  bridge: { reachable: true; version: string };
  capabilities: {
    mode: CapabilityMode;
    label: string;
    reason: string;
    canNavigateSessions: boolean;
    canConfigure: boolean;
    canControlSessions: boolean;
    canListSessions: boolean;
  };
  health: {
    overall: 'ready' | 'degraded' | 'action-required';
    components: Record<string, HealthComponent>;
  };
}

const BRIDGE_ORIGIN = 'http://127.0.0.1:17531';
const BRIDGE_HEALTH_URL = `${BRIDGE_ORIGIN}/api/hosted/health`;
const componentOrder = ['bridge', 'surface', 'plugin', 'codexDesktop', 'sharedControl', 'bindings'] as const;
const componentLabels: Record<(typeof componentOrder)[number], string> = {
  bridge: 'Local bridge',
  surface: 'Stream Deck',
  plugin: 'Elgato plugin',
  codexDesktop: 'Codex Desktop',
  sharedControl: 'Live control',
  bindings: 'Saved buttons',
};

function track(eventName: string, properties?: Record<string, string>) {
  void window.zaraz?.track(eventName, properties);
}

function looksLikeHostedHealth(value: unknown): value is HostedHealth {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<HostedHealth>;
  return data.schemaVersion === 1
    && data.bridge?.reachable === true
    && typeof data.bridge.version === 'string'
    && typeof data.capabilities?.mode === 'string'
    && typeof data.health?.components === 'object';
}

async function requestHealth(signal: AbortSignal, annotateLoopback: boolean): Promise<HostedHealth> {
  const init: RequestInit & { targetAddressSpace?: 'loopback' } = {
    method: 'GET',
    cache: 'no-store',
    mode: 'cors',
    credentials: 'omit',
    signal,
    ...(annotateLoopback ? { targetAddressSpace: 'loopback' as const } : {}),
  };
  const response = await fetch(BRIDGE_HEALTH_URL, init);
  if (!response.ok) throw new Error(`bridge-${response.status}`);
  const data: unknown = await response.json();
  if (!looksLikeHostedHealth(data)) throw new Error('unsupported-health-contract');
  return data;
}

function Setup() {
  const [connection, setConnection] = useState<ConnectionState>('idle');
  const [health, setHealth] = useState<HostedHealth | null>(null);
  const [failure, setFailure] = useState<'unreachable' | 'timeout' | 'unsupported'>('unreachable');

  const connect = async () => {
    setConnection('checking');
    setHealth(null);
    track('setup_connect');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    try {
      let data: HostedHealth;
      try {
        data = await requestHealth(controller.signal, true);
      } catch (firstError) {
        if (controller.signal.aborted) throw firstError;
        // Older engines may reject the experimental dictionary value before
        // sending a request. Loopback itself is still potentially trustworthy,
        // so retry once without the annotation.
        data = await requestHealth(controller.signal, false);
      }
      setHealth(data);
      setConnection('connected');
    } catch (error) {
      const code = controller.signal.aborted
        ? 'timeout'
        : error instanceof Error && error.message === 'unsupported-health-contract'
          ? 'unsupported'
          : 'unreachable';
      setFailure(code);
      setConnection('failed');
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const overall = health?.health.overall ?? 'action-required';

  return (
    <main className="setup-page">
      <nav className="setup-nav shell" aria-label="Setup navigation">
        <a className="brand" href="/" aria-label="Stream Deck Micro home">
          <span className="brand-mark" aria-hidden="true">DM</span>
          <span>Stream Deck Micro</span>
        </a>
        <div className="setup-nav-meta"><span>Setup preview</span><a href="/">Back to project ↗</a></div>
      </nav>

      <section className="setup-hero shell">
        <div>
          <p className="eyebrow"><span /> Local-first onboarding · Phase 1A</p>
          <h1>Connect<br />this <em>Mac.</em></h1>
        </div>
        <div className="setup-intro">
          <p>
            Check whether Stream Deck Micro, your Stream Deck, and Codex are ready—without
            uploading a prompt, task, path, or configuration value to Dion Labs.
          </p>
          <div className="privacy-chip"><i /> Read-only · loopback only · no account</div>
        </div>
      </section>

      <section className="setup-workspace shell" aria-live="polite">
        <aside className="setup-steps" aria-label="Setup progress">
          <div className="setup-step is-active"><span>01</span><div><b>Find Micro</b><small>Local bridge</small></div></div>
          <div className={`setup-step ${connection === 'connected' ? 'is-active' : ''}`}><span>02</span><div><b>Read health</b><small>Safe status only</small></div></div>
          <div className={`setup-step ${connection === 'connected' && overall === 'ready' ? 'is-active' : ''}`}><span>03</span><div><b>Ready</b><small>Open Control Room</small></div></div>
          <div className="setup-boundary"><i /> Browser ↔ this Mac<br /><span>Nothing is relayed through Dion Labs.</span></div>
        </aside>

        <div className="setup-console">
          <header className="setup-console-bar">
            <div><i className={`status-light status-${connection}`} /><span>LOCAL CONNECTION</span></div>
            <code>127.0.0.1:17531</code>
          </header>

          {connection === 'idle' && (
            <div className="setup-state setup-state-connect">
              <p className="setup-index">01 / Permission and reachability</p>
              <h2>Let this page check<br />your local bridge.</h2>
              <p>
                Your browser may ask whether deck.dionlabs.ai can find devices on your local
                network. Approving lets this page read a deliberately redacted health summary.
              </p>
              <button className="setup-primary" type="button" onClick={connect}>Connect this Mac <span>→</span></button>
              <small>Nothing is checked until you press the button.</small>
            </div>
          )}

          {connection === 'checking' && (
            <div className="setup-state setup-state-checking">
              <div className="scan-mark" aria-hidden="true"><i /><i /><i /></div>
              <p className="setup-index">Checking loopback</p>
              <h2>Looking for Micro…</h2>
              <p>Keep an eye out for your browser’s local network permission prompt.</p>
            </div>
          )}

          {connection === 'failed' && (
            <div className="setup-state setup-state-failed">
              <p className="setup-index">Connection not available</p>
              <h2>{failure === 'timeout' ? 'The bridge took too long.' : failure === 'unsupported' ? 'The bridge needs an update.' : 'We could not reach Micro.'}</h2>
              <p>
                {failure === 'unsupported'
                  ? 'Micro answered, but it does not support this setup page’s health contract yet.'
                  : 'The bridge may be stopped, this browser may have blocked loopback access, or local network permission may have been denied.'}
              </p>
              <div className="setup-actions">
                <button className="setup-primary" type="button" onClick={connect}>Try again <span>↻</span></button>
                <a className="setup-secondary" href={BRIDGE_ORIGIN}>Open local Control Room <span>↗</span></a>
              </div>
              <div className="fallback-note"><b>Safe fallback</b><span>The local Control Room keeps working even when a browser cannot connect this hosted page.</span></div>
            </div>
          )}

          {connection === 'connected' && health && (
            <div className="setup-state setup-state-health">
              <div className="health-heading">
                <div>
                  <p className="setup-index">02 / Read-only health</p>
                  <h2>{health.capabilities.label}</h2>
                  <p>{health.capabilities.reason}</p>
                </div>
                <div className={`overall-badge overall-${overall}`}><i />{overall.replace('-', ' ')}</div>
              </div>

              <div className="health-grid">
                {componentOrder.map((name) => {
                  const component = health.health.components[name];
                  if (!component) return null;
                  return (
                    <article className={`health-card health-${component.state}`} key={name}>
                      <div><i /><span>{componentLabels[name]}</span>{component.version && <code>v{component.version}</code>}</div>
                      <strong>{component.state.replace('-', ' ')}</strong>
                      <p>{component.message}</p>
                    </article>
                  );
                })}
              </div>

              <footer className="health-footer">
                <div><span>Bridge v{health.bridge.version}</span><span>Checked {new Date(health.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="setup-actions">
                  <button className="setup-secondary" type="button" onClick={connect}>Check again</button>
                  <a className="setup-primary" href={BRIDGE_ORIGIN}>Open local Control Room <span>↗</span></a>
                </div>
              </footer>
            </div>
          )}
        </div>
      </section>

      <section className="setup-notes shell">
        <article><span>01</span><div><h3>Deliberately read-only</h3><p>This preview cannot attach tasks, send prompts, change keys, stop work, or read your configuration.</p></div></article>
        <article><span>02</span><div><h3>Browser-mediated</h3><p>Chrome may show a local network prompt. Safari and Firefox support is still evolving, so the local fallback remains permanent.</p></div></article>
        <article><span>03</span><div><h3>Local authority</h3><p>The bridge remains the source of truth. This page is a view, not a cloud control plane.</p></div></article>
      </section>

      <footer className="setup-footer shell">
        <p>Stream Deck Micro · Dion Labs</p>
        <div><a href="/privacy/">Privacy</a><a href="https://github.com/dion-labs/stream-deck-micro">GitHub</a><a href="https://github.com/dion-labs/stream-deck-micro/issues">Support</a></div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Setup />
  </StrictMode>,
);
