'use client';

import { useState } from 'react';

declare global {
  interface Window {
    zaraz?: {
      track: (eventName: string, properties?: Record<string, string>) => Promise<void> | void;
    };
  }
}

const keys = [
  { label: '01', name: 'Forge', state: 'working', tone: 'lime' },
  { label: '02', name: 'Atlas', state: 'ready', tone: 'blue' },
  { label: '03', name: 'Scout', state: 'thinking', tone: 'violet' },
  { label: '04', name: 'Mender', state: 'attention', tone: 'mint' },
  { label: '05', name: 'Pixel', state: 'idle', tone: 'violet' },
  { label: '06', name: 'Pilot', state: 'idle', tone: 'rose' },
  { label: 'STATUS', name: 'Status', state: 'prompt', tone: 'neutral' },
  { label: 'STOP', name: 'Stop', state: 'halt', tone: 'danger' },
  { label: 'ATTACH', name: 'Attach', state: 'context', tone: 'neutral' },
  { label: 'TESTS', name: 'Tests', state: 'prompt', tone: 'neutral' },
  { label: 'REVIEW', name: 'Review', state: 'prompt', tone: 'neutral' },
  { label: 'DEBUG', name: 'Debug', state: 'prompt', tone: 'neutral' },
  { label: 'REFACTOR', name: 'Refactor', state: 'prompt', tone: 'neutral' },
  { label: 'SLEEP', name: 'Sleep', state: 'now', tone: 'neutral' },
  { label: 'DO IT', name: 'Do it', state: 'send', tone: 'action' },
];

const roomActions = ['STATUS', 'STOP', 'ATTACH', 'TESTS', 'REVIEW', 'DEBUG', 'REFACTOR', 'SLEEP', 'DO IT'];

const installCommands = {
  marketplace: [
    'git clone https://github.com/dion-labs/stream-deck-micro.git',
    'cd stream-deck-micro && npm ci && npm run build && npm link',
    'npm run marketplace:install && npm run marketplace:build',
    'npm --prefix marketplace run link',
    'stream-deck-micro marketplace install',
    '# Import the bundled profile; keep the Elgato app running',
  ],
  independent: [
    'git clone https://github.com/dion-labs/stream-deck-micro.git',
    'cd stream-deck-micro && npm ci',
    'npm run build && npm link',
    'stream-deck-micro shared install',
    '# Fully quit Elgato + restart Codex Desktop once',
    'stream-deck-micro doctor && stream-deck-micro start',
  ],
};

function track(eventName: string, properties?: Record<string, string>) {
  void window.zaraz?.track(eventName, properties);
}

export default function Home() {
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [deckMode, setDeckMode] = useState<'awake' | 'asleep'>('awake');
  const [attentionOpen, setAttentionOpen] = useState(true);
  const [deckMessage, setDeckMessage] = useState('Mender completed · acknowledgement required');
  const [roomTab, setRoomTab] = useState<'slots' | 'device'>('slots');
  const [edition, setEdition] = useState<'marketplace' | 'independent'>('marketplace');
  const displayKeys = keys.map((key, index) => index === 3
    ? { ...key, state: attentionOpen ? 'attention' : 'ready', tone: attentionOpen ? 'mint' : 'neutral' }
    : key);
  const active = displayKeys[selected];

  const pressKey = (index: number) => {
    if (deckMode === 'asleep') {
      setDeckMode('awake');
      setDeckMessage('Wake received · press again to run the action');
      track('deck_demo_wake', { source: 'key' });
      return;
    }
    setSelected(index);
    if (index === 13) {
      setDeckMode('asleep');
      setDeckMessage('Deck asleep · any key wakes without executing');
      track('deck_demo_sleep');
      return;
    }
    if (index === 3 && attentionOpen) {
      setAttentionOpen(false);
      setDeckMessage('Mender acknowledged · ready to sleep when quiet');
      track('deck_demo_acknowledge');
      return;
    }
    if (index === 14) {
      setDeckMessage('“lets do it” sent to the selected Codex task');
      track('deck_demo_prompt', { workflow: 'do-it' });
      return;
    }
    setDeckMessage(`${displayKeys[index].name} · ${displayKeys[index].state}`);
  };

  const simulateStatusUpdate = () => {
    setDeckMode('awake');
    setAttentionOpen(true);
    setSelected(3);
    setDeckMessage('Status changed · deck woke · Mender needs attention');
    track('deck_demo_status_update');
  };

  const copyInstall = async () => {
    await navigator.clipboard.writeText(installCommands[edition].join('\n'));
    track('install_commands_copy', { edition });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Stream Deck Micro home">
          <span className="brand-mark" aria-hidden="true">DM</span>
          <span>Stream Deck Micro</span>
        </a>
        <div className="nav-links">
          <a href="#experience">Experience</a>
          <a href="#editions">Editions</a>
          <a href="#control-room">Control Room</a>
          <a href="#install">Install</a>
          <a href="https://github.com/dion-labs/stream-deck-micro" onClick={() => track('cta_click', { target: 'github_nav' })}>GitHub</a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Open source · Two editions · Local first</p>
          <h1>Your agents.<br /><em>One deck.</em></h1>
          <p className="lede">
            Turn the Stream Deck you already own into a tactile command center
            for Codex. See every session. Act without breaking focus.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="https://github.com/dion-labs/stream-deck-micro" onClick={() => track('cta_click', { target: 'github_hero' })}>
              View on GitHub <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href="#editions">Choose your edition</a>
          </div>
          <div className="signal-line" aria-live="polite">
            <span className={`signal-dot ${active.tone}`} />
            <span className="signal-key">{active.label}</span>
            <span>{active.name}</span>
            <span className="signal-state">{active.state}</span>
          </div>
        </div>

        <div className="hardware-stage" aria-label="Interactive Stream Deck preview">
          <div className="glow glow-one" />
          <div className="glow glow-two" />
          <div className="deck-shadow" />
          <div className={`deck-shell ${deckMode === 'asleep' ? 'is-asleep' : ''}`}>
            <div className="deck-topline">
              <span>CODEX / LIVE</span>
              <span className="deck-status"><i /> {deckMode === 'asleep' ? 'sleeping' : '6 sessions'}</span>
            </div>
            <div className="key-grid">
              {displayKeys.map((key, index) => (
                <button
                  className={`deck-key key-${key.tone} ${selected === index ? 'is-selected' : ''} ${index === 3 && attentionOpen ? 'is-attention' : ''}`}
                  key={`${key.label}-${key.name}`}
                  onClick={() => pressKey(index)}
                  type="button"
                  aria-pressed={selected === index}
                  aria-label={`${key.name}: ${key.state}`}
                >
                  <span className="key-label">{key.label}</span>
                  <span className="key-name">{key.name}</span>
                  <span className="key-state">{key.state}</span>
                </button>
              ))}
            </div>
            <div className="deck-footer">
              <span>STREAM DECK</span>
              <strong>MICRO</strong>
              <span>LOCAL / 127.0.0.1</span>
            </div>
          </div>
          <div className="demo-controls">
            <p className="interaction-hint" aria-live="polite">{deckMessage}</p>
            <button type="button" onClick={simulateStatusUpdate}>Simulate status update</button>
          </div>
        </div>
      </section>

      <section className="first-proof shell">
        <p>Built for the way power users run Codex</p>
        <div>
          <span>01 · See</span>
          <span>02 · Act</span>
          <span>03 · Shape</span>
        </div>
      </section>

      <section className="manifesto shell" id="experience">
        <div className="section-index">01 / The physical surface</div>
        <div className="manifesto-copy">
          <p className="section-kicker">Leave the agents running.<br />Keep your head in the work.</p>
          <h2>Less window hunting.<br /><em>More knowing.</em></h2>
          <p>
            Six agent keys mirror the tasks already open in Codex Desktop. Color,
            pulse, wake-on-change, and a few deliberate actions tell you what needs
            attention—before another app can pull you out of flow.
          </p>
        </div>
      </section>

      <section className="capabilities shell" aria-label="Product capabilities">
        <article className="capability capability-see">
          <div className="capability-number">01</div>
          <div className="mini-sessions" aria-hidden="true">
            <span className="session-pill"><i className="mint" /> Forge <b>done</b></span>
            <span className="session-pill"><i className="blue" /> Atlas <b>working</b></span>
            <span className="session-pill"><i className="violet" /> Scout <b>thinking</b></span>
          </div>
          <div>
            <h3>See</h3>
            <p>Read idle, thinking, working, and persistent attention states at a glance.</p>
          </div>
        </article>

        <article className="capability capability-act">
          <div className="capability-number">02</div>
          <div className="action-orbit" aria-hidden="true">
            <span>DO IT</span><span>STOP</span><span>SLEEP</span>
          </div>
          <div>
            <h3>Act</h3>
            <p>Select, prompt, sleep, attach, or interrupt without reaching for another window.</p>
          </div>
        </article>

        <article className="capability capability-shape">
          <div className="capability-number">03</div>
          <div className="prompt-lines" aria-hidden="true">
            <span><i>R</i> Review the current diff</span>
            <span><i>D</i> Find and fix the root cause</span>
            <span><i>T</i> Run the relevant tests</span>
          </div>
          <div>
            <h3>Shape</h3>
            <p>Turn your most useful prompts into durable, one-press workflows.</p>
          </div>
        </article>
      </section>

      <section className="editions shell" id="editions">
        <div className="section-index">02 / Choose your surface</div>
        <div className="editions-heading">
          <div>
            <p className="section-kicker">Same sessions. Same actions.<br />Your comfort level.</p>
            <h2>Official app or<br /><em>direct control.</em></h2>
          </div>
          <p>
            Both editions share one local bridge and behavior model. Pick the
            familiar Elgato workflow or own the hardware directly—without giving
            up prompts, attention, wake-on-change, or the Control Room.
          </p>
        </div>
        <div className="edition-grid">
          <article className="edition-card edition-marketplace">
            <div className="edition-topline"><span>MARKETPLACE</span><b>Official SDK</b></div>
            <div className="edition-symbol" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <h3>Stay inside Elgato.</h3>
            <p>An editable, auto-installed profile with native plugin lifecycle and a background local bridge.</p>
            <ul>
              <li>Elgato app stays open</li>
              <li>Full session and workflow parity</li>
              <li>Black-key simulated sleep</li>
            </ul>
            <button type="button" onClick={() => { setEdition('marketplace'); track('edition_select', { edition: 'marketplace' }); document.querySelector('#install')?.scrollIntoView(); }}>
              Choose Marketplace <span>→</span>
            </button>
            <small>Built and validator-clean · Maker review next</small>
          </article>
          <article className="edition-card edition-independent">
            <div className="edition-topline"><span>INDEPENDENT</span><b>Direct HID</b></div>
            <div className="edition-signal" aria-hidden="true"><span>USB</span><i /><b>HID</b></div>
            <h3>Own the whole path.</h3>
            <p>A minimal standalone runtime that talks to your 15-key MK.2 without the Elgato app.</p>
            <ul>
              <li>Elgato app stays quit</li>
              <li>Full session and workflow parity</li>
              <li>True brightness-zero sleep</li>
            </ul>
            <button type="button" onClick={() => { setEdition('independent'); track('edition_select', { edition: 'independent' }); document.querySelector('#install')?.scrollIntoView(); }}>
              Choose Independent <span>→</span>
            </button>
            <small>Available from source today</small>
          </article>
        </div>
        <p className="edition-truth"><strong>The honest difference:</strong> Elgato's plugin API does not expose global device brightness. Marketplace sleep renders our keys pure black; Independent sleep turns the hardware brightness to zero.</p>
      </section>

      <section className="control-section" id="control-room">
        <div className="control-heading shell">
          <div className="section-index">03 / The Control Room</div>
          <div>
            <p className="section-kicker">The deck stays simple.<br />The details live here.</p>
            <h2>Shape the surface.<br /><em>Stay in control.</em></h2>
          </div>
        </div>

        <div className="control-window shell">
          <div className="window-bar">
            <div className="window-brand"><span>DM</span> Stream Deck Micro</div>
            <div className="window-health"><i /> Device connected</div>
            <div className="window-local">127.0.0.1</div>
          </div>
          <div className="window-body">
            <aside className="window-sidebar">
              <p>Control Room</p>
              <button className={roomTab === 'slots' ? 'active' : ''} type="button" onClick={() => setRoomTab('slots')}><span>⌗</span> Slots</button>
              <button type="button"><span>◫</span> Sessions</button>
              <button type="button"><span>↗</span> Keys</button>
              <button className={roomTab === 'device' ? 'active' : ''} type="button" onClick={() => setRoomTab('device')}><span>◉</span> Device</button>
              <div className="sidebar-note"><i /> Local only<br /><span>Fresh token · secure origin</span></div>
            </aside>
            <div className="window-main">
              <header>
                <div><span>{roomTab === 'slots' ? 'PHYSICAL SURFACE' : 'DEVICE BEHAVIOR'}</span><h3>{roomTab === 'slots' ? 'Your agents, at a glance.' : 'Quiet when it can be. Awake when it matters.'}</h3></div>
                <button type="button">{roomTab === 'slots' ? 'Refresh sessions' : 'Save settings'}</button>
              </header>
              {roomTab === 'slots' ? (
                <div className="room-grid">
                  <div className="room-deck">
                    {[0, 1, 2, 3, 4, 5].map((slot) => (
                      <div className={`room-key room-key-${slot}`} key={slot}>
                        <span>0{slot + 1}</span>
                        <strong>{['Forge', 'Atlas', 'Scout', 'Mender', 'Pixel', 'Pilot'][slot]}</strong>
                        <small>{['working', 'ready', 'thinking', 'attention', 'idle', 'idle'][slot]}</small>
                      </div>
                    ))}
                    {roomActions.map((label) => (
                      <div className={`room-key room-key-action ${label === 'SLEEP' ? 'room-key-sleep' : ''} ${label === 'DO IT' ? 'room-key-doit' : ''}`} key={label}><strong>{label}</strong></div>
                    ))}
                  </div>
                  <aside className="inspector">
                    <div className="inspector-title"><span className="active-ring">04</span><div><b>Mender</b><small>ATTENTION</small></div></div>
                    <dl>
                      <div><dt>Repository</dt><dd>stream-deck-micro</dd></div>
                      <div><dt>Updated</dt><dd>Just now</dd></div>
                      <div><dt>Session</dt><dd>019c…a71f</dd></div>
                    </dl>
                    <button type="button">Open and acknowledge</button>
                    <button className="quiet" type="button">Remove from deck</button>
                  </aside>
                </div>
              ) : (
                <div className="device-panel">
                  <div className="device-state-card"><i /><div><span>DECK MODE</span><strong>Awake</strong><small>Status changes reset the timer</small></div></div>
                  <div className="device-setting device-setting-wide"><div><span>AWAKE BRIGHTNESS</span><strong>70%</strong></div><div className="device-range"><i /></div></div>
                  <div className="device-setting"><span>AUTO SLEEP</span><strong>Enabled</strong><small>Stay awake while a task is active</small></div>
                  <div className="device-setting"><span>IDLE TIMEOUT</span><strong>15 minutes</strong><small>Counted from the latest status update</small></div>
                  <div className="device-setting device-setting-wide"><span>WHEN ATTENTION IS WAITING</span><strong>Keep only that task visible</strong><small>Press its slot to acknowledge; everything else can go dark.</small></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="control-caption shell">
          <p>A localhost workspace for everything that should not crowd the keys.</p>
          <div>
            <span>Rename slots</span><span>Attach sessions</span><span>Edit workflows</span><span>Tune sleep</span>
          </div>
        </div>
      </section>

      <section className="architecture shell">
        <div className="section-index">04 / Under the surface</div>
        <div className="architecture-grid">
          <div className="architecture-copy">
            <p className="section-kicker">Your code. Your machine.<br />Your command center.</p>
            <h2>Local by<br /><em>design.</em></h2>
            <p>
              Codex Desktop and Stream Deck Micro connect to one shared local
              App Server, so either surface can continue the same task. The
              Control Room and WebSocket endpoint bind to loopback; your session
              data is never hosted by Dion Labs.
            </p>
          </div>
          <div className="architecture-map" aria-label="Local architecture diagram">
            <div className="map-node map-codex"><span>01</span><strong>Codex tasks</strong><small>shared session history</small></div>
            <div className="map-rail"><i /><b>WS://127.0.0.1:17532</b><i /></div>
            <div className="map-output map-output-three">
              <div className="map-node"><span>02</span><strong>Codex Desktop</strong><small>read · write</small></div>
              <div className="map-node"><span>03</span><strong>Stream Deck</strong><small>Elgato SDK / HID</small></div>
              <div className="map-node"><span>04</span><strong>Control Room</strong><small>127.0.0.1</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="install-section shell" id="install">
        <div className="section-index">05 / Get started</div>
        <div className="install-grid">
          <div className="install-copy">
            <p className="section-kicker">
              {edition === 'marketplace' ? <>Plugin. Profile. Go.<br />The familiar route.</> : <>Clone. Build. Go.<br />Own the whole path.</>}
            </p>
            <h2>Make it<br /><em>yours.</em></h2>
            <p>
              {edition === 'marketplace'
                ? 'Run inside Elgato Stream Deck 7.1+ with an editable 5×3 profile and a persistent local bridge.'
                : 'Run directly on macOS with Node.js 22+, Codex Desktop, and the 15-key Stream Deck MK.2.'}
            </p>
            <div className="edition-toggle" aria-label="Installation edition">
              <button className={edition === 'marketplace' ? 'active' : ''} type="button" onClick={() => { setEdition('marketplace'); track('edition_select', { edition: 'marketplace', source: 'install' }); }}>Marketplace</button>
              <button className={edition === 'independent' ? 'active' : ''} type="button" onClick={() => { setEdition('independent'); track('edition_select', { edition: 'independent', source: 'install' }); }}>Independent</button>
            </div>
            <a href="https://github.com/dion-labs/stream-deck-micro#install" onClick={() => track('cta_click', { target: 'install_guide' })}>Read the full setup guide <span>↗</span></a>
          </div>
          <div className="terminal" aria-label="Installation commands">
            <div className="terminal-bar"><span><i /><i /><i /></span><b>TERMINAL · ZSH</b><span>{edition.toUpperCase()}</span></div>
            <div className="terminal-code">
              {installCommands[edition].map((command, index) => (
                <p key={command}><span>{String(index + 1).padStart(2, '0')}</span><code><b>{command.startsWith('#') ? '#' : '$'}</b> {command.replace(/^#\s*/, '')}</code></p>
              ))}
              <p className="terminal-result"><span>✓</span><code>{edition === 'marketplace' ? 'Marketplace bridge running in the background' : 'Control Room ready at 127.0.0.1:17531'}</code></p>
            </div>
            <button onClick={copyInstall} type="button">{copied ? 'Copied' : 'Copy install commands'}</button>
          </div>
        </div>
        <p className="power-note"><strong>Power-user default:</strong> the example config runs Codex with full access and no approvals. Review every workflow prompt and choose a narrower sandbox if that does not match your threat model.</p>
      </section>

      <section className="closing shell">
        <p className="eyebrow"><span /> MIT licensed · Built in the open</p>
        <h2>Give your agents<br />a place to <em>land.</em></h2>
        <p>Fork it. Shape it. Put your best workflows under your fingertips.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="https://github.com/dion-labs/stream-deck-micro" onClick={() => track('cta_click', { target: 'github_closing' })}>Explore the repository <span>↗</span></a>
          <a className="button button-secondary" href="https://github.com/sponsors/dion-labs" onClick={() => track('cta_click', { target: 'sponsor' })}>Sponsor Dion Labs <span>♡</span></a>
        </div>
      </section>

      <footer className="footer shell">
        <a className="brand" href="#top"><span className="brand-mark">DM</span><span>Stream Deck Micro</span></a>
        <p>An independent, unofficial interoperability project by <a href="https://dionlabs.ai">Dion Labs</a>.</p>
        <div><a href="https://github.com/dion-labs/stream-deck-micro">GitHub</a><a href="/privacy/">Privacy</a><a href="https://github.com/sponsors/dion-labs">Sponsor</a><a href="#top">Back to top ↑</a></div>
        <small>Not affiliated with or endorsed by OpenAI, Work Louder, or Elgato. Codex, Codex Micro, and Stream Deck are marks of their respective owners.</small>
      </footer>
    </main>
  );
}
