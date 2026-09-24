# Causes — Jouer pour de bon

React embed for https://www.jouerpourdebon.ca/causes.

## Deliverables

- `../causes-preview.html`: self-contained visual preview. It uses the three approved causes read from the project's database on September 21, 2026. Its featured selection is proposed, not a statement that those choices were previously approved by the site owner. No fabricated players, support counts, or donation amounts.
- `../causes-embed.html`: production embed. React and CSS are bundled inside the file, with no CDN or image/font downloads. It waits for live Wix messages and never falls back to the snapshot.
- This directory: editable React source, focused tests, and Wix integration files.

## Implemented

French and English; shared `jpdb-language` preference; featured causes independent of player support; all supported causes without a UI limit; accent-insensitive search; alphabetical and supporter-count sorting; accessible native details dialog; real calendar links; mobile layout; loading, retry, empty, no-results, and support-data-unavailable states. There is no payment or donation action on this page.

## Wix installation

1. On the empty `/causes` page, insert an HTML component and give it ID `causesEmbed`. Paste the complete contents of `causes-embed.html`. Alternatively host that HTML file and use its HTTPS URL as the component's source. A repository is optional for the paste-in version.
2. Make the component stretch to the page's content width. Use an initial height around 1900 px on desktop and 3000 px on mobile, then inspect actual content and Wix's iframe scrolling. The component supports internal scrolling; this package does not claim automatic outer Wix element resizing.
3. Install `wix/causes.web.js` as `backend/causes.web.js`, `wix/causes-bridge.js` as `public/causes-bridge.js`, and `wix/causes-page.js` as this page's code.
4. Reuse the site's `public/jpdb-language.js` coordinator. A copy from the existing language draft is included under `wix/shared/jpdb-language.js` if that draft is not installed. Do not overwrite a newer installed version.
5. Reuse Wix's existing `JPDB_API_BASE_URL` secret. Its value must be the HTTPS shared API base, optionally ending in `/v1`. No privileged key is exposed to the embed.
6. The shared API's existing `GET /v1/causes?lang=fr|en` must return every approved canonical cause, with the additive `supporterCount` described below. API draft #66 supplies the baseline contract; the API owner is integrating the additions. Missing support data is shown as unavailable, not zero.
7. The three initial featured IDs are editable in `public/causes-bridge.js`. An explicit API `featured` boolean takes precedence over this editorial list.
8. Preview both languages, narrow screens, and the live data handshake in Wix before publishing. No Wix publication was performed by this task.

## Public contract

Existing `/v1/causes` response: `{ data: [{ id, name, description, websiteUrl, locale, country, ... }] }`. Preserve canonical approved causes and localized content.

Required additive field: `supporterCount`, a nonnegative integer counting distinct users from confirmed registrations plus confirmed `player_contributions` whose linked registrations are still confirmed. Exclude cancelled/refunded registrations and reversed contributions; deduplicate a user across both sources. No amount is inferred from entry fees. This exact contract is implemented locally by the API owner in `src/routes/causes.ts`, but has not been deployed.

Optional additive field: `featured: boolean`, an editorial choice independent of support. The API omits it when `CAUSE_FEATURED_IDS` is unset, allowing the frontend editorial list to apply; when configured (including an empty string), the API returns explicit booleans that override that list. The integrated backend uses stable 500-row pages and 100-ID batches for causes, allocations, support and aliases. No player identifiers are needed by this frontend.

Iframe request: `{ type:'JPDB_CAUSES_REQUEST', requestId, language }`.

Wix response: `{ type:'JPDB_CAUSES_DATA', requestId, language, payload:{ updatedAt, causes:[{ id,name,description,country,websiteUrl,supporterCount,featured }] } }` or `{type:'JPDB_CAUSES_ERROR',requestId}`.

Language: iframe sends `JPDB_LANGUAGE_READY` and `JPDB_LANGUAGE_CHANGED`; host sends `JPDB_LANGUAGE`, matching the site's coordinator. Responses require an exact trusted parent origin and the parent window, plus a matching request ID. Request retries are bounded, and the bridge deduplicates loads and caches public data for 30 seconds.

## Build and tests

Use Node.js compatible with Vite 8. Install the exact versions in `package.json`, then `npm run build` and `npm test`. The build makes `dist/` plus the two standalone HTML files one directory above the source folder. The checked build used already-installed React 19.3.0, React DOM 19.3.0, and Vite 8.3.0 from the existing player-directory workspace; no GitHub Actions or spending changes were used.

## Verification and deployment state

Thirteen focused frontend/bridge tests passed for filtering, featured separation, bilingual search, sorting, lists over 1,000 causes, untrusted messages/URLs, missing support counts, public projection, retry caching, safe errors, and the integrated API's count/editorial contract. Production build passed. Browser checks passed for language switching, search, details, Escape dismissal with focus restoration, and a 390 px phone layout without horizontal overflow. The API owner separately reports ten passing focused backend checks; this task inspected the source and contract tests without editing the shared backend.

Implemented locally; **not installed in Wix and not deployed**. Live data remains dependent on the shared API deployment and the Wix bridge installation. Production failure is explicit; preview data cannot silently masquerade as current live data.

Documentation checked: https://dev.wix.com/docs/velo/velo-only-apis/%24w/html-component/messaging-between-a-site-page-and-an-html-element and https://dev.wix.com/docs/api-reference/business-management/secrets/get-secret-value?apiView=SDK.
