'use client';

import { useState } from 'react';

declare global {
  interface Window {
    zaraz?: {
      track: (eventName: string, properties?: Record<string, string>) => Promise<void> | void;
    };
  }
}

type Edition = 'marketplace' | 'independent';

const keys = [
  { label: '01', name: 'Forge', state: 'working', tone: 'blue' },
  { label: '02', name: 'Atlas', state: 'ready', tone: 'mint' },
  { label: '03', name: 'Scout', state: 'thinking', tone: 'violet' },
  { label: '04', name: 'Mender', state: 'attention', tone: 'amber' },
  { label: '05', name: 'Pixel', state: 'idle', tone: 'neutral' },
  { label: '06', name: 'Pilot', state: 'idle', tone: 'neutral' },
  { label: 'STATUS', name: 'Status', state: 'overview', tone: 'slate' },
  { label: 'STOP', name: 'Stop', state: 'interrupt', tone: 'danger' },
  { label: 'ATTACH', name: 'Attach', state: 'newest', tone: 'amber' },
  { label: 'TESTS', name: 'Tests', state: 'workflow', tone: 'violet' },
  { label: 'REVIEW', name: 'Review', state: 'workflow', tone: 'violet' },
  { label: 'DEBUG', name: 'Debug', state: 'workflow', tone: 'violet' },
  { label: 'REFACTOR', name: 'Refactor', state: 'workflow', tone: 'violet' },
  { label: 'SLEEP', name: 'Sleep', state: 'now', tone: 'slate' },
  { label: 'DO IT', name: 'Do it', state: 'send', tone: 'action' },
];

const roomActions = ['STATUS', 'STOP', 'ATTACH', 'TESTS', 'REVIEW', 'DEBUG', 'REFACTOR', 'SLEEP', 'DO IT'];

const installCommands: Record<Edition, string[]> = {
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
  const [edition, setEdition] = useState<Edition>('marketplace');
  const displayKeys = keys.map((key, index) => index === 3
    ? { ...key, state: attentionOpen ? 'attention' : 'ready', tone: attentionOpen ? 'amber' : 'mint' }
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
    try {
      await navigator.clipboard.writeText(installCommands[edition].join('\n'));
      track('install_commands_copy', { edition });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const chooseEdition = (choice: Edition, source: string) => {
    setEdition(choice);
    track('edition_select', { edition: choice, source });
    document.querySelector('#install')?.scrollIntoView();
  };

  return (
    <main className="site-main">
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Stream Deck Micro home">
          <span className="brand-mark brand-spirit" aria-hidden="true"><img src="/crew/curator-headshot.webp" alt="" /></span>
          <span>Stream Deck Micro</span>
        </a>
        <div className="nav-links">
          <a href="#experience">Experience</a>
          <a href="#crew">Crew</a>
          <a href="#control-room">Control Room</a>
          <a href="#editions">Editions</a>
          <a href="/setup/">Setup</a>
          <a className="nav-github" href="https://github.com/dion-labs/stream-deck-micro" onClick={() => track('cta_click', { target: 'github_nav' })}>GitHub ↗</a>
        </div>
      </nav>

      <a className="native-announcement shell" href="#native-app"><span>NEW · MACOS PREVIEW</span> Your Control Center now lives in the Dock. <b>Meet the native app ↗</b></a>

      <section className="crew-hero shell" id="top">
        <div className="crew-hero-copy">
          <p className="eyebrow"><span /> Open source · Local first · Built for Codex</p>
          <h1>Your agents.<br /><em>One deck.</em></h1>
          <p className="crew-lede">A tactile command center for the tasks already running in Codex. See what changed, send the next move, and stay in flow.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="/setup/" onClick={() => track('cta_click', { target: 'setup_hero' })}>Get the macOS app <span>↓</span></a>
            <a className="button button-secondary" href="https://github.com/dion-labs/stream-deck-micro" onClick={() => track('cta_click', { target: 'github_hero' })}>View source <span>↗</span></a>
          </div>
          <div className="hero-proof"><span><i /> 15 programmable keys</span><span><i /> Shared live tasks</span><span><i /> No cloud relay</span></div>
        </div>
        <div className="crew-hero-art" aria-label="The Micro crew orchestrating live agent sessions">
          <img src="/crew/hero.webp" alt="A synthetic curator, human operator, and small console spirit coordinating agent sessions" />
          <div className="crew-caption"><span>THE MICRO CREW</span><b>Operator · Curator · Console Spirit</b></div>
        </div>
      </section>

      <section className="native-release shell" id="native-app">
        <div className="native-release-copy">
          <p className="eyebrow"><span /> Native macOS app · out now</p>
          <h2>A home for<br />your <em>control center.</em></h2>
          <p>One app for your sessions, deck layout, prompts, and device settings. Open it from your Dock and let Micro prepare the local connection.</p>
          <ul><li><b>Your full Control Center.</b> Slots, Sessions, Keys, Library, and Device in one native window.</li><li><b>Ready when you return.</b> Local service at login, compatibility checks, and connection status in the menu bar.</li><li><b>A simpler first run.</b> Node and the Elgato plugin installer are included. No checkout required.</li></ul>
          <div className="hero-actions"><a className="button button-primary" href="https://github.com/dion-labs/stream-deck-micro/releases/download/v0.2.0-alpha.1/Codex-Stream-Deck-0.2.0-alpha.1-macOS-arm64.zip" onClick={() => track('native_download')}>Download for macOS <span>↓</span></a><a className="button button-secondary" href="/setup/">Setup guide →</a></div>
          <small>v0.2.0-alpha.1 · Apple Silicon · macOS 14+<br />Unnotarized preview. <a href="https://github.com/dion-labs/stream-deck-micro/releases/tag/v0.2.0-alpha.1">Requirements, installation & release notes ↗</a></small>
        </div>
        <figure className="native-release-visual"><div className="native-window-bar"><i /><i /><i /><span>Codex + Stream Deck</span></div><img src="/native-control-center.webp" alt="Micro’s native Control Center showing a 15-key deck, live task states, session controls, and its five workspace tabs" loading="lazy" width="1400" height="1000" /><figcaption>The real Control Center, shown with illustrative demo tasks.</figcaption></figure>
      </section>

      <section className="deck-experience shell" id="experience">
        <div className="deck-story">
          <p className="section-index">01 / The physical surface</p><p className="section-kicker">The actual 5 × 3 experience.<br />Alive, accurate, interactive.</p><h2>Know without<br /><em>window hunting.</em></h2><p>Each task keeps its place. State is color, motion, and light; deliberate actions live where your fingers remember them.</p>
          <div className="live-signal" aria-live="polite"><i className={`tone-${active.tone}`} /><span>{active.label}</span><strong>{active.name}</strong><small>{active.state}</small></div>
          <button className="text-trigger" type="button" onClick={simulateStatusUpdate}>Simulate a status change <span>↻</span></button>
        </div>
        <div className="precision-stage">
          <img className="stage-spirit" src="/crew/console-spirit.webp" alt="" aria-hidden="true" />
          <div className={`precision-device ${deckMode === 'asleep' ? 'is-asleep' : ''}`}>
            <div className="device-ridge"><i /><span>STREAM DECK MK.2</span><b>MICRO / LIVE</b></div>
            <div className="precision-grid">
              {displayKeys.map((key, index) => (
                <button className={`precision-key tone-${key.tone} ${selected === index ? 'is-selected' : ''} ${index === 3 && attentionOpen ? 'is-attention' : ''}`} key={`${key.label}-${key.name}`} onClick={() => pressKey(index)} type="button" aria-pressed={selected === index} aria-label={`${key.name}: ${key.state}`}>
                  <span className="precision-cap"><span className="key-label">{key.label}</span><strong>{key.name}</strong><small>{key.state}</small></span>
                </button>
              ))}
            </div>
            <div className="device-foot"><span><i /> {deckMode === 'asleep' ? 'sleeping' : 'connected'}</span><b>127.0.0.1</b></div>
          </div>
          <p className="deck-message" aria-live="polite">{deckMessage}</p>
        </div>
      </section>

      <section className="crew-section shell" id="crew">
        <div className="crew-heading"><div><p className="section-index">02 / Meet the crew</p><h2>One system.<br /><em>Three points of view.</em></h2></div><p>They are not decoration. Each character owns a layer of the experience: you, the orchestration layer, and the state that quietly keeps watch.</p></div>
        <div className="crew-grid">
          <article className="crew-card crew-card-operator"><img src="/crew/operator.webp" alt="The Operator holding a compact control pad" /><div><span>01 / HUMAN SURFACE</span><h3>The Operator</h3><p>Your proxy in the system: practical, deliberate, and always in control of what executes.</p></div></article>
          <article className="crew-card crew-card-curator"><img src="/crew/curator.webp" alt="The synthetic Curator orchestrating session tiles" /><div><span>02 / ORCHESTRATION</span><h3>The Curator</h3><p>Micro’s primary guide—holding many live tasks together without taking ownership away from you.</p></div></article>
          <article className="crew-card crew-card-spirit"><img src="/crew/console-spirit.webp" alt="The winged Console Spirit with key-grid wings" /><div><span>03 / SYSTEM STATE</span><h3>The Console Spirit</h3><p>The glanceable pulse of attention, sleep, connectivity, recovery, and everything in between.</p></div></article>
        </div>
      </section>

      <section className="capability-band shell" aria-label="Product capabilities"><article><span>01</span><div><h3>See</h3><p>Idle, thinking, working, complete, error, and persistent attention at a glance.</p></div></article><article><span>02</span><div><h3>Act</h3><p>Select, prompt, attach, interrupt, sleep, or bring the exact Codex task forward.</p></div></article><article><span>03</span><div><h3>Shape</h3><p>Drag any action anywhere and turn the prompts you trust into one-press workflows.</p></div></article></section>

      <section className="control-showcase" id="control-room">
        <div className="control-intro shell"><div><p className="section-index">03 / The local Control Room</p><h2>The detail layer<br /><em>your keys deserve.</em></h2></div><p>Configure safely by default. Inspect and rearrange without triggering anything, then deliberately arm Live control when you want the browser to behave like the hardware.</p></div>
        <div className="cr-window shell">
          <div className="cr-bar"><div><img src="/crew/console-spirit.webp" alt="" /><strong>Stream Deck Micro</strong></div><span><i /> Local · healthy</span><b>127.0.0.1</b></div>
          <div className="cr-body">
            <aside className="cr-nav"><span>CONTROL ROOM</span><button className={roomTab === 'slots' ? 'active' : ''} type="button" onClick={() => setRoomTab('slots')}>Deck layout</button><button type="button">Sessions</button><button type="button">Workflows</button><button className={roomTab === 'device' ? 'active' : ''} type="button" onClick={() => setRoomTab('device')}>Device</button><small><i /> Local authority<br />Nothing leaves this Mac.</small></aside>
            <div className="cr-main">
              <header><div><span>{roomTab === 'slots' ? 'PHYSICAL LAYOUT / 5 × 3' : 'DEVICE BEHAVIOR'}</span><h3>{roomTab === 'slots' ? 'Arrange your surface.' : 'Quiet when it can be.'}</h3></div><button type="button">{roomTab === 'slots' ? 'Configure mode' : 'Save settings'}</button></header>
              {roomTab === 'slots' ? (
                <div className="cr-layout">
                  <div className="cr-deck">{[0, 1, 2, 3, 4, 5].map((slot) => <div className={`cr-key cr-key-${slot}`} key={slot}><span>0{slot + 1}</span><strong>{['Forge', 'Atlas', 'Scout', 'Mender', 'Pixel', 'Pilot'][slot]}</strong><small>{['working', 'ready', 'thinking', 'attention', 'idle', 'idle'][slot]}</small></div>)}{roomActions.map((label) => <div className={`cr-key cr-action ${label === 'SLEEP' ? 'cr-sleep' : ''} ${label === 'DO IT' ? 'cr-doit' : ''}`} key={label}><strong>{label}</strong><small>action</small></div>)}</div>
                  <aside className="cr-inspector"><img src="/crew/curator.webp" alt="" /><span>KEY INSPECTOR</span><div><b>04</b><h4>Mender</h4><small>ATTENTION</small></div><dl><dt>Function</dt><dd>Session slot 4</dd><dt>Attached task</dt><dd>stream-deck-micro</dd></dl><button type="button">Open and acknowledge</button></aside>
                </div>
              ) : (
                <div className="cr-settings"><div className="setting-hero"><img src="/crew/operator.webp" alt="" /><span>DECK MODE</span><strong>Awake</strong><small>Status changes restart the timer.</small></div><div><span>AWAKE BRIGHTNESS</span><strong>70%</strong><i className="setting-range" /></div><div><span>AUTO SLEEP</span><strong>Enabled</strong><small>Stay awake while a task is active.</small></div><div><span>IDLE TIMEOUT</span><strong>15 minutes</strong><small>Counted from the latest state change.</small></div></div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="editions-v3 shell" id="editions">
        <div className="editions-v3-heading"><div><p className="section-index">04 / Choose your surface</p><h2>Same core.<br /><em>Your comfort level.</em></h2></div><p>Pick the familiar Elgato lifecycle or let Micro own the hardware directly. The local bridge and Control Room remain yours either way.</p></div>
        <div className="edition-v3-grid"><article><div><span>MARKETPLACE</span><b>Recommended</b></div><h3>Stay inside Elgato.</h3><p>An editable profile, native plugin lifecycle, and a persistent local bridge.</p><ul><li>Elgato app stays open</li><li>Profile editor stays available</li><li>Black-key simulated sleep</li></ul><button type="button" onClick={() => chooseEdition('marketplace', 'edition_card')}>Choose Marketplace <span>→</span></button></article><article><div><span>INDEPENDENT</span><b>Direct HID</b></div><h3>Own the whole path.</h3><p>A smaller runtime that talks directly to the 15-key Stream Deck MK.2.</p><ul><li>Elgato app stays quit</li><li>Micro owns the hardware</li><li>True brightness-zero sleep</li></ul><button type="button" onClick={() => chooseEdition('independent', 'edition_card')}>Choose Independent <span>→</span></button></article></div>
      </section>

      <section className="local-architecture shell"><div><p className="section-index">05 / Local by design</p><p className="section-kicker">Your code. Your machine.<br />Your command center.</p><h2>No cloud<br /><em>control plane.</em></h2><p>The deck and browser talk to a bridge bound to loopback. Dion Labs hosts the showcase and guides—not your prompts, task names, configuration, or session history.</p></div><div className="local-map"><article><span>01</span><strong>Codex tasks</strong><small>live local sessions</small></article><i /><section><article><span>02</span><strong>Codex Desktop</strong><small>read · write</small></article><article><span>03</span><strong>Stream Deck</strong><small>SDK / HID</small></article><article><span>04</span><strong>Control Room</strong><small>127.0.0.1</small></article></section></div></section>

      <section className="install-v3 shell" id="install">
        <div className="install-v3-copy"><p className="section-index">06 / Build from source</p><p className="section-kicker">{edition === 'marketplace' ? 'Plugin. Profile. Go.' : 'Clone. Build. Go.'}<br />Keep the authority local.</p><h2>Prefer to<br /><em>build?</em></h2><p>{edition === 'marketplace' ? 'Run inside Elgato Stream Deck 7.1+ with an editable 5×3 profile and persistent local bridge.' : 'Run directly on macOS with Node.js 22+, Codex Desktop, and the 15-key Stream Deck MK.2.'}</p><div className="edition-toggle"><button className={edition === 'marketplace' ? 'active' : ''} type="button" onClick={() => { setEdition('marketplace'); track('edition_select', { edition: 'marketplace', source: 'install' }); }}>Marketplace</button><button className={edition === 'independent' ? 'active' : ''} type="button" onClick={() => { setEdition('independent'); track('edition_select', { edition: 'independent', source: 'install' }); }}>Independent</button></div><a href="/setup/">Open guided setup <span>→</span></a></div>
        <div className="terminal" aria-label="Installation commands"><div className="terminal-bar"><span><i /><i /><i /></span><b>TERMINAL · ZSH</b><span>{edition.toUpperCase()}</span></div><div className="terminal-code">{installCommands[edition].map((command, index) => <p key={command}><span>{String(index + 1).padStart(2, '0')}</span><code><b>{command.startsWith('#') ? '#' : '$'}</b> {command.replace(/^#\s*/, '')}</code></p>)}<p className="terminal-result"><span>✓</span><code>{edition === 'marketplace' ? 'Marketplace bridge ready in the background' : 'Control Room ready at 127.0.0.1:17531'}</code></p></div><button onClick={copyInstall} type="button">{copied ? 'Copied ✓' : 'Copy install commands'}</button></div>
      </section>

      <section className="crew-closing shell"><img src="/crew/console-spirit.webp" alt="The Console Spirit" /><div><p className="eyebrow"><span /> MIT licensed · Built in the open</p><h2>Give your agents<br />a place to <em>land.</em></h2><p>Fork it. Shape it. Put your best workflows under your fingertips.</p><div className="hero-actions"><a className="button button-primary" href="https://github.com/dion-labs/stream-deck-micro" onClick={() => track('cta_click', { target: 'github_closing' })}>Explore the repository <span>↗</span></a><a className="button button-secondary" href="https://github.com/sponsors/dion-labs" onClick={() => track('cta_click', { target: 'sponsor' })}>Sponsor Dion Labs <span>♡</span></a></div></div></section>

      <footer className="footer shell"><a className="brand" href="#top"><span className="brand-mark brand-spirit"><img src="/crew/curator-headshot.webp" alt="" /></span><span>Stream Deck Micro</span></a><p>An independent, unofficial interoperability project by <a href="https://dionlabs.ai">Dion Labs</a>.</p><div><a href="https://github.com/dion-labs/stream-deck-micro">GitHub</a><a href="/privacy/">Privacy</a><a href="https://github.com/sponsors/dion-labs">Sponsor</a><a href="#top">Back to top ↑</a></div><small>Not affiliated with or endorsed by OpenAI or Elgato. Codex and Stream Deck are marks of their respective owners.</small></footer>
    </main>
  );
}
