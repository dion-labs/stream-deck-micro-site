# Stream Deck Micro showcase

The public project site for [Stream Deck Micro](https://deck.dionlabs.ai), an
open-source local command center for Codex sessions and the 15-key Elgato
Stream Deck MK.2.

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

## License

MIT
