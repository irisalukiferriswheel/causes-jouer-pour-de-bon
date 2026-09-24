# Causes — Jouer pour de bon

Bilingual React page designed to embed in the Wix causes page.

- **Embed URL:** https://irisalukiferriswheel.github.io/causes-jouer-pour-de-bon/
- **Visual preview:** https://irisalukiferriswheel.github.io/causes-jouer-pour-de-bon/preview.html

The production embed requires the Wix data bridge in `app/wix/`. When opened alone, it cannot load live causes. The visual preview uses a dated snapshot and is not a live player-support feed.

## Install in Wix

Use the embed URL as the source of an HTML component named `causesEmbed`. Install the page, public bridge, and backend files as described in [the integration guide](app/README.md). Live data requires the shared causes API and Wix bridge; GitHub Pages only hosts the frontend.

## Update

Editable source is in `app/`; prebuilt static files are in `docs/`. GitHub Pages publishes `main` → `/docs`.

With a Node.js version compatible with Vite 8:

```sh
cd app
npm install
npm test
npm run build
cd ..
node -e "const fs=require('node:fs');fs.copyFileSync('causes-embed.html','docs/index.html');fs.copyFileSync('causes-preview.html','docs/preview.html')"
```

Commit the updated source and `docs/` files to publish. No credentials are needed by the static frontend.
