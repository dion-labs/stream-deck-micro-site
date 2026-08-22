import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../app/globals.css';
import '../app/privacy.css';

function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      <header className="privacy-nav shell">
        <a className="brand" href="/" aria-label="Stream Deck Micro home">
          <span className="brand-mark">DM</span>
          <span>Stream Deck Micro</span>
        </a>
        <a className="privacy-back" href="/">Back to project <span aria-hidden="true">↗</span></a>
      </header>

      <main className="privacy-main shell">
        <header className="privacy-hero">
          <p className="eyebrow"><span /> Privacy / local-first</p>
          <h1>Your sessions stay<br />on <em>your machine.</em></h1>
          <p className="privacy-lede">
            Stream Deck Micro is designed to coordinate software already running on your Mac.
            It does not send your prompts, session contents, or usage telemetry to Dion Labs.
          </p>
          <p className="privacy-date">Effective August 22, 2026</p>
        </header>

        <div className="privacy-layout">
          <aside className="privacy-summary" aria-label="Privacy summary">
            <p>At a glance</p>
            <ul>
              <li><span>01</span>No Dion Labs account</li>
              <li><span>02</span>No app telemetry</li>
              <li><span>03</span>No advertising</li>
              <li><span>04</span>Local configuration</li>
            </ul>
          </aside>

          <article className="privacy-copy">
            <section>
              <p className="privacy-index">01 / Scope</p>
              <h2>What this policy covers</h2>
              <p>
                This policy covers the Stream Deck Micro application, its Elgato Marketplace
                plugin and local bridge, and the website at <a href="https://deck.dionlabs.ai">deck.dionlabs.ai</a>.
                “Dion Labs,” “we,” and “us” refer to the independent developer publishing Stream Deck Micro.
              </p>
            </section>

            <section>
              <p className="privacy-index">02 / Application data</p>
              <h2>The plugin and bridge operate locally</h2>
              <p>
                Stream Deck Micro reads the session identifiers, labels, working directories,
                status updates, and message context needed to display and control sessions in
                Codex Desktop. Commands you trigger are sent to the locally connected Codex and
                Stream Deck software. Dion Labs does not receive this information.
              </p>
              <p>
                Configuration, session mappings, and operational logs are stored on your Mac,
                primarily under <code>~/.stream-deck-micro</code> and in the configuration file
                you select. Stream Deck may separately store plugin and profile settings. You can
                inspect, edit, or delete these local files at any time.
              </p>
              <p>
                The application does not include Dion Labs analytics, advertising identifiers,
                crash reporting, or a Dion Labs cloud service. It does not sell or share app data.
              </p>
            </section>

            <section>
              <p className="privacy-index">03 / Website</p>
              <h2>Privacy-first website measurement</h2>
              <p>
                The project website is delivered through Cloudflare. Cloudflare processes network
                requests to deliver and protect the site. We use Cloudflare Web Analytics for
                aggregate traffic and performance measurement. Cloudflare describes this service
                as privacy-first: it does not collect or use visitors’ personal data, use cookies
                or local storage for analytics, or track people across websites.
              </p>
              <p>
                We do not run advertising, build visitor profiles, or use analytics to identify
                individual visitors. Cloudflare’s handling of infrastructure data is governed by
                its own <a href="https://www.cloudflare.com/privacypolicy/">Privacy Policy</a>.
              </p>
            </section>

            <section>
              <p className="privacy-index">04 / Other services</p>
              <h2>Services you choose to use</h2>
              <p>
                Stream Deck Micro interoperates with Codex Desktop and Elgato Stream Deck. Your
                use of those products—and their processing of data—is governed by their respective
                terms and privacy policies. Following links to GitHub, including for installation,
                source code, sponsorship, or support, is governed by GitHub’s policies.
              </p>
              <p>
                Stream Deck Micro does not add an additional remote recipient to the prompts and
                session data already handled by the software you connect to it.
              </p>
            </section>

            <section>
              <p className="privacy-index">05 / Retention and control</p>
              <h2>You control local records</h2>
              <p>
                Local configuration and logs remain on your Mac until you change or remove them.
                Uninstalling Stream Deck Micro does not automatically delete every configuration
                or log file, so you may remove <code>~/.stream-deck-micro</code> separately if you
                want to erase the application’s local records.
              </p>
              <p>
                Cloudflare controls the retention of data it processes for hosting, security, and
                aggregate analytics. Dion Labs does not maintain a separate database of visitors
                or Stream Deck Micro users.
              </p>
            </section>

            <section>
              <p className="privacy-index">06 / Children</p>
              <h2>No child-directed service</h2>
              <p>
                Stream Deck Micro is a developer tool and is not directed to children. We do not
                knowingly collect personal information from children through the application.
              </p>
            </section>

            <section>
              <p className="privacy-index">07 / Updates and contact</p>
              <h2>Questions or changes</h2>
              <p>
                We may update this policy when the product or its data practices change. The
                effective date above identifies the current version. Material changes will be
                reflected on this page and, where appropriate, in release notes.
              </p>
              <p>
                For privacy questions, use the project’s <a href="https://github.com/dion-labs/stream-deck-micro/issues">support tracker</a>.
                GitHub issues are public, so please do not include prompts, session contents,
                credentials, or other sensitive information.
              </p>
            </section>
          </article>
        </div>
      </main>

      <footer className="privacy-footer shell">
        <p>Stream Deck Micro · Dion Labs</p>
        <div><a href="/">Project</a><a href="https://github.com/dion-labs/stream-deck-micro">GitHub</a><a href="https://github.com/dion-labs/stream-deck-micro/issues">Support</a></div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivacyPolicy />
  </StrictMode>,
);
