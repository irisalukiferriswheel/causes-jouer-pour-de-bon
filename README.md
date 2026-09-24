# Causes — Jouer pour de bon

- [Wix embed URL](https://irisalukiferriswheel.github.io/causes-jouer-pour-de-bon/)
- [Fictional visual preview](https://irisalukiferriswheel.github.io/causes-jouer-pour-de-bon/preview.html)
- [Database fields and setup](app/README.md)

The React page loads published causes from a Supabase read-only endpoint. Funding goals, amount raised, progress, remaining amount, currency, supporter counts, images and campaign end dates are supported in French and English. No real causes, goals or funding amounts have been entered. Existing placeholders are not published.

Embed the production URL directly in Wix. Data works without a Wix bridge. Optional site-wide language synchronization is in `app/wix/causes-page.js`.

Editable source and database/endpoint definitions are in `app/`. GitHub Pages publishes the prebuilt `docs/` folder from `main`. Follow the [build instructions](app/README.md) to update it.
