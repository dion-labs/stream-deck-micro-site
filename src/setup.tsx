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

type Edition = 'marketplace' | 'independent';
type CapabilityMode = 'live' | 'navigation-only' | 'offline';
type HealthState = 'ready' | 'navigation-only' | 'action-required' | 'offline' | 'not-required';
type ConnectionState = 'idle' | 'checking' | 'connected' | 'failed';
type OnboardingStep = 1 | 2 | 3 | 4;
type ComponentName = typeof componentOrder[number];

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
const REPOSITORY = 'https://github.com/dion-labs/stream-deck-micro';
const SHARED_GUIDE = `${REPOSITORY}#shared-control-verified-scoped-launch`;

const componentOrder = ['bridge', 'surface', 'plugin', 'codexDesktop', 'sharedControl', 'bindings'] as const;
const componentLabels: Record<ComponentName, string> = {
  bridge: 'Local bridge',
  surface: 'Stream Deck',
  plugin: 'Elgato plugin',
  codexDesktop: 'Codex Desktop',
  sharedControl: 'Live control',
  bindings: 'Saved buttons',
};

const editionDetails: Record<Edition, {
  eyebrow: string;
  title: string;
  summary: string;
  points: string[];
  footnote: string;
}> = {
  marketplace: {
    eyebrow: 'Recommended for most people',
    title: 'Marketplace',
    summary: 'The familiar Elgato workflow, with an editable profile and a background local bridge.',
    points: ['Elgato owns the hardware', 'Profile editor stays available', 'Sleep renders Micro keys black'],
    footnote: 'Requires Stream Deck 7.1+. The public listing is pending review; source installation works today.',
  },
  independent: {
    eyebrow: 'Direct HID',
    title: 'Independent',
    summary: 'A smaller direct-hardware path for people who prefer to keep the Elgato app out of the runtime.',
    points: ['Micro owns the hardware', 'Elgato must remain fully quit', 'Sleep sets brightness to zero'],
    footnote: 'Requires the 15-key Stream Deck MK.2. The daemon runs in the foreground by default.',
  },
};

const baseInstall = [
  'git clone https://github.com/dion-labs/stream-deck-micro.git',
  'cd stream-deck-micro',
  'npm ci',
  'npm run build',
  'npm link',
];

const editionInstall: Record<Edition, string[]> = {
  marketplace: [
    'npm run marketplace:install',
    'npm run marketplace:build',
    'npm --prefix marketplace run link',
    'stream-deck-micro marketplace install',
    'open "marketplace/ai.dionlabs.stream-deck-micro.sdPlugin/profiles/Stream Deck Micro.streamDeckProfile"',
  ],
  independent: [
    '# Fully quit Elgato Stream Deck before continuing',
    'stream-deck-micro marketplace uninstall # only when switching editions',
    'stream-deck-micro doctor',
    'stream-deck-micro start',
  ],
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

function detectedEdition(health: HostedHealth): Edition {
  return health.health.components.plugin?.state === 'not-required' ? 'independent' : 'marketplace';
}

function recoveryCopy(name: ComponentName, component: HealthComponent, edition: Edition): string | null {
  if (component.state === 'ready' || component.state === 'not-required') return null;
  switch (name) {
    case 'bridge':
      return 'Restart the local bridge, then check again.';
    case 'surface':
      return edition === 'marketplace'
        ? 'Open Elgato Stream Deck, connect the MK.2, and make the Micro profile active.'
        : 'Fully quit Elgato Stream Deck, reconnect the MK.2, and restart Micro.';
    case 'plugin':
      return edition === 'marketplace'
        ? 'Open Elgato Stream Deck and confirm the Micro profile and plugin are installed.'
        : null;
    case 'codexDesktop':
      return component.state === 'navigation-only'
        ? 'This is the safe baseline: Codex stays private while saved buttons can open its tasks.'
        : 'Open and sign in to Codex Desktop. Keep it in private mode while resolving setup.';
    case 'sharedControl':
      return 'Optional advanced feature. Enable it only through the verified compatibility guide.';
    case 'bindings':
      return 'Open the local Control Room and assign at least one session button.';
  }
}

function Setup() {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [edition, setEdition] = useState<Edition>('marketplace');
  const [reviewed, setReviewed] = useState<Set<string>>(() => new Set(
    /Macintosh|Mac OS X/.test(navigator.userAgent) ? ['macos'] : [],
  ));
  const [connection, setConnection] = useState<ConnectionState>('idle');
  const [health, setHealth] = useState<HostedHealth | null>(null);
  const [failure, setFailure] = useState<'unreachable' | 'timeout' | 'unsupported'>('unreachable');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const prerequisites = [
    { id: 'macos', title: 'macOS', detail: 'Stream Deck Micro currently targets macOS.' },
    { id: 'node', title: 'Node.js 22+', detail: 'Required to build and run the local bridge.' },
    { id: 'codex', title: 'Codex Desktop', detail: 'Installed, launched, and authenticated.' },
    { id: 'deck', title: '15-key Stream Deck MK.2', detail: 'The supported physical device for this release.' },
    edition === 'marketplace'
      ? { id: 'surface', title: 'Stream Deck 7.1+', detail: 'Keep the Elgato app open for the Marketplace edition.' }
      : { id: 'surface', title: 'Elgato app fully quit', detail: 'Only one process can own the HID device.' },
  ];
  const requirementsReady = prerequisites.every((item) => reviewed.has(item.id));
  const overall = health?.health.overall ?? 'action-required';
  const installedEdition = health ? detectedEdition(health) : null;
  const editionMismatch = installedEdition !== null && installedEdition !== edition;
  const commands = [...baseInstall, ...editionInstall[edition]];

  const chooseEdition = (choice: Edition) => {
    setEdition(choice);
    setReviewed((current) => {
      const next = new Set(current);
      next.delete('surface');
      return next;
    });
    track('setup_edition_select', { edition: choice });
  };

  const toggleRequirement = (id: string) => {
    setReviewed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyInstall = async () => {
    const value = commands.join('\n');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Copy command was rejected');
      }
      setCopyState('copied');
      track('setup_install_copy', { edition });
    } catch {
      setCopyState('failed');
    }
    window.setTimeout(() => setCopyState('idle'), 1800);
  };

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
        data = await requestHealth(controller.signal, false);
      }
      setHealth(data);
      setConnection('connected');
      setStep(4);
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

  const stepClass = (candidate: OnboardingStep) => [
    'setup-step',
    step === candidate ? 'is-active' : '',
    step > candidate ? 'is-complete' : '',
  ].filter(Boolean).join(' ');

  return (
    <main className="setup-page">
      <nav className="setup-nav shell" aria-label="Setup navigation">
        <a className="brand" href="/" aria-label="Stream Deck Micro home">
          <span className="brand-mark" aria-hidden="true">DM</span>
          <span>Stream Deck Micro</span>
        </a>
        <div className="setup-nav-meta"><span>Local setup</span><a href="/">Back to project ↗</a></div>
      </nav>

      <section className="setup-hero shell">
        <div>
          <p className="eyebrow"><span /> Guided onboarding · Local first</p>
          <h1>Set up<br />your <em>deck.</em></h1>
        </div>
        <div className="setup-intro">
          <p>
            Choose your comfort level, prepare the local bridge, and resolve the whole
            health path without sending your tasks or configuration to Dion Labs.
          </p>
          <div className="privacy-chip"><i /> Read-only health · no account · no cloud relay</div>
        </div>
      </section>

      <section className="setup-workspace shell" aria-live="polite">
        <aside className="setup-steps" aria-label="Setup progress">
          <button className={stepClass(1)} type="button" onClick={() => setStep(1)}><span>{step > 1 ? '✓' : '01'}</span><div><b>Choose</b><small>Your edition</small></div></button>
          <button className={stepClass(2)} type="button" onClick={() => step >= 2 && setStep(2)} disabled={step < 2}><span>{step > 2 ? '✓' : '02'}</span><div><b>Prepare</b><small>Mac + install</small></div></button>
          <button className={stepClass(3)} type="button" onClick={() => step >= 3 && setStep(3)} disabled={step < 3}><span>{step > 3 ? '✓' : '03'}</span><div><b>Connect</b><small>Local bridge</small></div></button>
          <button className={stepClass(4)} type="button" disabled={step < 4}><span>04</span><div><b>Resolve</b><small>Health pipeline</small></div></button>
          <div className="setup-boundary"><i /> Browser ↔ this Mac<br /><span>Nothing is relayed through Dion Labs.</span></div>
        </aside>

        <div className="setup-console">
          <header className="setup-console-bar">
            <div><i className={`status-light status-${connection}`} /><span>{connection === 'connected' ? 'MICRO CONNECTED' : 'LOCAL ONBOARDING'}</span></div>
            <code>{edition.toUpperCase()} · 127.0.0.1:17531</code>
          </header>

          {step === 1 && (
            <div className="setup-state setup-state-choose">
              <div className="state-heading">
                <p className="setup-index">01 / Choose your comfort level</p>
                <h2>One core.<br />Two surfaces.</h2>
                <p>Both editions use the same local bridge and Control Room. The difference is who owns the hardware.</p>
              </div>
              <div className="edition-picker">
                {(Object.keys(editionDetails) as Edition[]).map((choice) => {
                  const details = editionDetails[choice];
                  return (
                    <button className={`onboarding-edition ${edition === choice ? 'is-selected' : ''}`} type="button" onClick={() => chooseEdition(choice)} aria-pressed={edition === choice} key={choice}>
                      <span className="edition-radio"><i /></span>
                      <small>{details.eyebrow}</small>
                      <h3>{details.title}</h3>
                      <p>{details.summary}</p>
                      <ul>{details.points.map((point) => <li key={point}>{point}</li>)}</ul>
                      <footer>{details.footnote}</footer>
                    </button>
                  );
                })}
              </div>
              <div className="onboarding-next">
                <button className="setup-primary" type="button" onClick={() => setStep(2)}>Prepare {editionDetails[edition].title} <span>→</span></button>
                <button className="text-action" type="button" onClick={() => setStep(3)}>Already installed? Connect now</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="setup-state setup-state-prepare">
              <div className="state-heading prepare-heading">
                <div><p className="setup-index">02 / Prepare this Mac</p><h2>Check. Install.<br />Keep it local.</h2></div>
                <div className="review-progress"><strong>{reviewed.size}/{prerequisites.length}</strong><span>requirements reviewed</span></div>
              </div>

              <div className="prepare-grid">
                <section className="prerequisite-panel">
                  <h3>Prerequisites</h3>
                  <div className="prerequisite-list">
                    {prerequisites.map((item) => (
                      <button className={reviewed.has(item.id) ? 'is-checked' : ''} type="button" onClick={() => toggleRequirement(item.id)} aria-pressed={reviewed.has(item.id)} key={item.id}>
                        <i>{reviewed.has(item.id) ? '✓' : ''}</i><span><b>{item.title}</b><small>{item.detail}</small></span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="install-panel">
                  <header><div><small>SOURCE INSTALL</small><h3>{editionDetails[edition].title}</h3></div><button type="button" onClick={copyInstall}>{copyState === 'copied' ? 'Copied ✓' : copyState === 'failed' ? 'Copy failed' : 'Copy commands'}</button></header>
                  <div className="install-lines">
                    {commands.map((command, index) => <p className={command.startsWith('#') ? 'is-comment' : ''} key={`${command}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><code>{command}</code></p>)}
                  </div>
                </section>
              </div>

              <div className="advanced-boundary">
                <div><i /> <span><b>Safe baseline first.</b> These commands install the surface and bridge without enabling shared Codex control.</span></div>
                <a href={SHARED_GUIDE}>Read the optional live-control guide ↗</a>
              </div>
              <div className="onboarding-next">
                <button className="setup-primary" type="button" onClick={() => setStep(3)} disabled={!requirementsReady}>Continue to connection <span>→</span></button>
                {!requirementsReady && <small>Review every requirement to continue, or use “Already installed” from step 1.</small>}
              </div>
            </div>
          )}

          {step === 3 && connection !== 'checking' && connection !== 'failed' && (
            <div className="setup-state setup-state-connect">
              <p className="setup-index">03 / Permission and reachability</p>
              <h2>Let this page check<br />your local bridge.</h2>
              <p>
                Your browser may ask whether deck.dionlabs.ai can find devices on your local
                network. Approving exposes only a deliberately redacted health summary.
              </p>
              <button className="setup-primary" type="button" onClick={connect}>Connect this Mac <span>→</span></button>
              <small>Nothing is checked until you press the button.</small>
            </div>
          )}

          {step === 3 && connection === 'checking' && (
            <div className="setup-state setup-state-checking">
              <div className="scan-mark" aria-hidden="true"><i /><i /><i /></div>
              <p className="setup-index">Checking loopback</p>
              <h2>Looking for Micro…</h2>
              <p>Keep an eye out for your browser’s local network permission prompt.</p>
            </div>
          )}

          {step === 3 && connection === 'failed' && (
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
                <button className="setup-secondary" type="button" onClick={() => setStep(2)}>Review install steps</button>
                <a className="setup-secondary" href={BRIDGE_ORIGIN}>Open local Control Room <span>↗</span></a>
              </div>
              <div className="fallback-note"><b>Safe fallback</b><span>The local Control Room keeps working even when a browser cannot connect this hosted page.</span></div>
            </div>
          )}

          {step === 4 && health && (
            <div className="setup-state setup-state-health">
              <div className="health-heading">
                <div>
                  <p className="setup-index">04 / Guided health</p>
                  <h2>{health.capabilities.label}</h2>
                  <p>{health.capabilities.reason}</p>
                </div>
                <div className={`overall-badge overall-${overall}`}><i />{overall.replace('-', ' ')}</div>
              </div>

              <div className={`edition-detection ${editionMismatch ? 'is-mismatch' : ''}`}>
                <div><span>CHOSEN</span><strong>{editionDetails[edition].title}</strong></div>
                <i>→</i>
                <div><span>DETECTED</span><strong>{editionDetails[installedEdition!].title}</strong></div>
                <p>{editionMismatch ? 'The running bridge uses a different surface. Choose that edition or switch it locally before continuing.' : 'Your selected and running editions match.'}</p>
              </div>

              <div className="health-grid">
                {componentOrder.map((name) => {
                  const component = health.health.components[name];
                  if (!component) return null;
                  const guidance = recoveryCopy(name, component, installedEdition!);
                  return (
                    <article className={`health-card health-${component.state} ${guidance ? 'has-guidance' : ''}`} key={name}>
                      <div><i /><span>{componentLabels[name]}</span>{component.version && <code>v{component.version}</code>}</div>
                      <strong>{component.state.replace('-', ' ')}</strong>
                      <p>{component.message}</p>
                      {guidance && <small><b>Next</b>{guidance}</small>}
                    </article>
                  );
                })}
              </div>

              <div className="health-next">
                <div>
                  <span>NEXT BEST ACTION</span>
                  <strong>{editionMismatch ? 'Align the selected and running editions.' : health.health.components.bindings?.state === 'action-required' ? 'Assign your first session button.' : health.capabilities.mode === 'navigation-only' ? 'Open the Control Room—or review optional live control.' : 'Your local control path is ready.'}</strong>
                </div>
                <div className="setup-actions">
                  {editionMismatch && <button className="setup-secondary" type="button" onClick={() => { setEdition(installedEdition!); setStep(1); }}>Use detected edition</button>}
                  <button className="setup-secondary" type="button" onClick={connect}>Check again</button>
                  <a className="setup-primary" href={BRIDGE_ORIGIN}>Open local Control Room <span>↗</span></a>
                </div>
              </div>

              <footer className="health-footer">
                <div><span>Bridge v{health.bridge.version}</span><span>Checked {new Date(health.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                <a href={SHARED_GUIDE}>Optional live-control guide ↗</a>
              </footer>
            </div>
          )}
        </div>
      </section>

      <section className="setup-notes shell">
        <article><span>01</span><div><h3>Deliberately read-only</h3><p>This flow cannot install software, attach tasks, send prompts, change keys, stop work, or read your configuration.</p></div></article>
        <article><span>02</span><div><h3>Safe baseline first</h3><p>Installation does not silently turn on experimental shared control or change how Codex Desktop launches.</p></div></article>
        <article><span>03</span><div><h3>Local authority</h3><p>The bridge remains the source of truth. This page guides and observes; it is not a cloud control plane.</p></div></article>
      </section>

      <footer className="setup-footer shell">
        <p>Stream Deck Micro · Dion Labs</p>
        <div><a href="/privacy/">Privacy</a><a href={REPOSITORY}>GitHub</a><a href={`${REPOSITORY}/issues`}>Support</a></div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Setup />
  </StrictMode>,
);
