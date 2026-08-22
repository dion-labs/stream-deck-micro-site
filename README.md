# Stream Deck Micro showcase

The public project site for [Stream Deck Micro](https://deck.dionlabs.ai), an
open-source local command center for Codex sessions and the 15-key Elgato
Stream Deck MK.2. The site presents both the official-SDK Marketplace edition
and the Independent direct-HID edition with their explicit feature differences.

- [Live showcase](https://deck.dionlabs.ai)
- [Application repository](https://github.com/dion-labs/stream-deck-micro)
- [Sponsor Dion Labs](https://github.com/sponsors/dion-labs)

## Local development

Requires Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Run `npm run check` for the TypeScript check and `npm run build` for the
production build.

## Deployment

Cloudflare Pages builds the `main` branch automatically with:

- Build command: `npm run build`
- Output directory: `dist`
- Custom domain: `deck.dionlabs.ai`

## Analytics

Enable privacy-first page and Core Web Vital reporting from the Cloudflare
Pages project's **Metrics → Web Analytics** control. Cloudflare injects its
beacon into the next deployment, so no analytics token is stored in this
repository.

The UI also emits optional Cloudflare Zaraz events when Zaraz is enabled:

- `cta_click` with a `target` property;
- `install_commands_copy`;
- `deck_demo_sleep`, `deck_demo_wake`, and `deck_demo_status_update`;
- `deck_demo_acknowledge` and `deck_demo_prompt`.

Without Zaraz these calls are inert. They do not add cookies or send data to a
third-party analytics service from the application code.

Metrics/Web Analytics needs no further setup after it is enabled; Cloudflare
injects the beacon on the next production deployment. Zaraz is separate. To
retain or forward the custom events, enable Zaraz and create triggers whose
**Event Name** equals the event names above, then attach those triggers to an
action in the analytics tool you choose. Use Zaraz Monitoring first to verify
events and action outcomes before adding another analytics destination.

## License

MIT
