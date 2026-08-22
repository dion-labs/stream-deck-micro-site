'use client';

import { useState } from 'react';

const keys = [
  { label: '01', name: 'Forge', state: 'working', tone: 'lime' },
  { label: '02', name: 'Atlas', state: 'ready', tone: 'blue' },
  { label: '03', name: 'Scout', state: 'waiting', tone: 'amber' },
  { label: '04', name: 'Mender', state: 'done', tone: 'mint' },
  { label: '05', name: 'Pixel', state: 'idle', tone: 'violet' },
  { label: '06', name: 'Pilot', state: 'idle', tone: 'rose' },
  { label: 'DO', name: 'Do it', state: 'send', tone: 'action' },
  { label: 'STOP', name: 'Stop', state: 'halt', tone: 'danger' },
  { label: 'ATTACH', name: 'Attach', state: 'context', tone: 'neutral' },
  { label: 'REVIEW', name: 'Review', state: 'prompt', tone: 'neutral' },
  { label: 'DEBUG', name: 'Debug', state: 'prompt', tone: 'neutral' },
  { label: 'REFACTOR', name: 'Refactor', state: 'prompt', tone: 'neutral' },
  { label: 'TESTS', name: 'Tests', state: 'prompt', tone: 'neutral' },
  { label: 'SEL', name: 'Selection', state: 'scope', tone: 'neutral' },
  { label: 'MICRO', name: 'Control', state: 'local', tone: 'brand' },
];

export default function Home() {
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const active = keys[selected];

  const copyInstall = async () => {
    await navigator.clipboard.writeText('npm install --global stream-deck-micro');
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
          <a href="#control-room">Control Room</a>
          <a href="#install">Install</a>
          <a href="https://github.com/dion-labs/stream-deck-micro">GitHub</a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Open source · Local first</p>
          <h1>Your agents.<br /><em>One deck.</em></h1>
          <p className="lede">
            Turn the Stream Deck you already own into a tactile command center
            for Codex. See every session. Act without breaking focus.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="https://github.com/dion-labs/stream-deck-micro">
              View on GitHub <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href="#install">Install locally</a>
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
          <div className="deck-shell">
            <div className="deck-topline">
              <span>CODEX / LIVE</span>
              <span className="deck-status"><i /> 6 sessions</span>
            </div>
            <div className="key-grid">
              {keys.map((key, index) => (
                <button
                  className={`deck-key key-${key.tone} ${selected === index ? 'is-selected' : ''}`}
                  key={`${key.label}-${key.name}`}
                  onClick={() => setSelected(index)}
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
          <p className="interaction-hint">Press a key to inspect its state</p>
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
            Six agent keys mirror the sessions already running in Codex. Color,
            pulse, and a few deliberate actions tell you what needs attention—
            before another app can pull you out of flow.
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
            <p>Read idle, thinking, working, complete, and error states at a glance.</p>
          </div>
        </article>

        <article className="capability capability-act">
          <div className="capability-number">02</div>
          <div className="action-orbit" aria-hidden="true">
            <span>DO IT</span><span>STOP</span><span>ATTACH</span>
          </div>
          <div>
            <h3>Act</h3>
            <p>Select, prompt, attach, or interrupt without reaching for another window.</p>
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

      <section className="control-section" id="control-room">
        <div className="control-heading shell">
          <div className="section-index">02 / The Control Room</div>
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
              <button className="active" type="button"><span>⌗</span> Deck</button>
              <button type="button"><span>◫</span> Sessions</button>
              <button type="button"><span>↗</span> Workflows</button>
              <div className="sidebar-note"><i /> Local only<br /><span>Fresh token · secure origin</span></div>
            </aside>
            <div className="window-main">
              <header>
                <div><span>PHYSICAL SURFACE</span><h3>Your agents, at a glance.</h3></div>
                <button type="button">Refresh sessions</button>
              </header>
              <div className="room-grid">
                <div className="room-deck">
                  {[0, 1, 2, 3, 4, 5].map((slot) => (
                    <div className={`room-key room-key-${slot}`} key={slot}>
                      <span>0{slot + 1}</span>
                      <strong>{['Forge', 'Atlas', 'Scout', 'Mender', 'Pixel', 'Pilot'][slot]}</strong>
                      <small>{['working', 'ready', 'waiting', 'done', 'idle', 'idle'][slot]}</small>
                    </div>
                  ))}
                  {['DO IT', 'STOP', 'ATTACH', 'REVIEW', 'DEBUG', 'REFACTOR', 'TESTS', 'SEL', 'MICRO'].map((label) => (
                    <div className="room-key room-key-action" key={label}><strong>{label}</strong></div>
                  ))}
                </div>
                <aside className="inspector">
                  <div className="inspector-title"><span className="active-ring">01</span><div><b>Forge</b><small>WORKING</small></div></div>
                  <dl>
                    <div><dt>Repository</dt><dd>stream-deck-micro</dd></div>
                    <div><dt>Updated</dt><dd>Just now</dd></div>
                    <div><dt>Session</dt><dd>019c…a71f</dd></div>
                  </dl>
                  <button type="button">Stop turn</button>
                  <button className="quiet" type="button">Remove from deck</button>
                </aside>
              </div>
            </div>
          </div>
        </div>

        <div className="control-caption shell">
          <p>A localhost workspace for everything that should not crowd the keys.</p>
          <div>
            <span>Rename slots</span><span>Attach sessions</span><span>Edit workflows</span><span>Review activity</span>
          </div>
        </div>
      </section>

      <section className="architecture shell">
        <div className="section-index">03 / Under the surface</div>
        <div className="architecture-grid">
          <div className="architecture-copy">
            <p className="section-kicker">Your code. Your machine.<br />Your command center.</p>
            <h2>Local by<br /><em>design.</em></h2>
            <p>
              Stream Deck Micro talks to the official Codex app-server and your
              deck from one local daemon. The Control Room binds to loopback;
              your session data is never hosted by Dion Labs.
            </p>
          </div>
          <div className="architecture-map" aria-label="Local architecture diagram">
            <div className="map-node map-codex"><span>01</span><strong>Codex</strong><small>app · CLI · IDE</small></div>
            <div className="map-rail"><i /><b>LOCAL DAEMON</b><i /></div>
            <div className="map-output">
              <div className="map-node"><span>02</span><strong>Stream Deck</strong><small>USB / HID</small></div>
              <div className="map-node"><span>03</span><strong>Control Room</strong><small>127.0.0.1</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="install-section shell" id="install">
        <div className="section-index">04 / Get started</div>
        <div className="install-grid">
          <div className="install-copy">
            <p className="section-kicker">Three commands.<br />One less dashboard.</p>
            <h2>Make it<br /><em>yours.</em></h2>
            <p>Built for macOS, Node.js 22+, Codex CLI, and the 15-key Stream Deck MK.2.</p>
            <a href="https://github.com/dion-labs/stream-deck-micro#install">Read the full setup guide <span>↗</span></a>
          </div>
          <div className="terminal" aria-label="Installation commands">
            <div className="terminal-bar"><span><i /><i /><i /></span><b>TERMINAL · ZSH</b><span>LOCAL</span></div>
            <div className="terminal-code">
              <p><span>01</span><code><b>$</b> npm install --global stream-deck-micro</code></p>
              <p><span>02</span><code><b>$</b> stream-deck-micro doctor</code></p>
              <p><span>03</span><code><b>$</b> stream-deck-micro start</code></p>
              <p className="terminal-result"><span>✓</span><code>Control Room ready at 127.0.0.1:17531</code></p>
            </div>
            <button onClick={copyInstall} type="button">{copied ? 'Copied' : 'Copy install command'}</button>
          </div>
        </div>
        <p className="power-note"><strong>Power-user default:</strong> the example config runs Codex with full access and no approvals. Review every workflow prompt and choose a narrower sandbox if that does not match your threat model.</p>
      </section>

      <section className="closing shell">
        <p className="eyebrow"><span /> MIT licensed · Built in the open</p>
        <h2>Give your agents<br />a place to <em>land.</em></h2>
        <p>Fork it. Shape it. Put your best workflows under your fingertips.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="https://github.com/dion-labs/stream-deck-micro">Explore the repository <span>↗</span></a>
          <a className="button button-secondary" href="https://github.com/sponsors/dion-labs">Sponsor Dion Labs <span>♡</span></a>
        </div>
      </section>

      <footer className="footer shell">
        <a className="brand" href="#top"><span className="brand-mark">DM</span><span>Stream Deck Micro</span></a>
        <p>An independent, unofficial interoperability project by <a href="https://dionlabs.ai">Dion Labs</a>.</p>
        <div><a href="https://github.com/dion-labs/stream-deck-micro">GitHub</a><a href="https://github.com/sponsors/dion-labs">Sponsor</a><a href="#top">Back to top ↑</a></div>
        <small>Not affiliated with or endorsed by OpenAI, Work Louder, or Elgato. Codex, Codex Micro, and Stream Deck are marks of their respective owners.</small>
      </footer>
    </main>
  );
}
