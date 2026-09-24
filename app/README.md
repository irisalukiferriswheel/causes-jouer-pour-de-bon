# Causes page — data setup

The production embed reads `public-causes` in Supabase project `xbyjbgmxgoyzjqlnxmgi`. It works directly on GitHub Pages and inside Wix. No Wix data bridge or backend secret is required; `wix/causes-page.js` is optional language synchronization. The older bridge files remain only as compatibility utilities and are not used by the current page.

## Enter a real cause

Use the existing `causes` table for the name, description, website, country and approval status. Add French and English rows to `cause_translations` (`fr-CA` and `en-CA`). Then create a `cause_page_settings` row using its cause ID:

| Field | Meaning |
|---|---|
| `cause_id` | Link to the real cause |
| `publish_ready` | Defaults false; enable only when the real cause is ready |
| `featured` | Show in Causes we love |
| `image_url` | Optional HTTPS image |
| `funding_goal` | Positive target; leave null until known |
| `currency` | Three-letter currency, default CAD |
| `campaign_start`, `campaign_end` | Optional dates |
| `updated_at` | Administrative update timestamp |

No rows, goals or money were seeded. Existing placeholder causes are excluded because they have no published page settings. The preview uses explicitly fictional causes and no funding amounts.

## Funding

Raised amounts and supporter counts are derived, never editable page settings. The server reads confirmed contribution records linked to confirmed registrations. If the upcoming `cause_funding_allocations` ledger is present, an allocation (including a refunded allocation) supersedes the legacy contribution for the same registration, preventing double counting and stale refunded totals. Only matching currencies are summed. User IDs and individual contributions never reach the browser. No funds are inferred from registration fees.

Goals are lifetime totals per cause. Campaign dates describe the campaign and do not reset funding totals. Multiple separately funded campaigns would require a campaign ledger; this version does not imply that capability. Zero is shown only after a successful data read; unknown goals and unavailable data remain explicit.

The endpoint includes only approved canonical causes with `publish_ready=true`. Cards appear in the featured section when `featured=true`, and in the player-supported section once there is confirmed support. The frontend refreshes every 60 seconds; HTTP caching may add up to another minute. Progress supports overfunding (bar capped at 100%, percentage can exceed 100%).

## Access and deployment

`supabase/schema.sql` records the applied `prepare_cause_page_settings` migration. The table has RLS enabled and no client grants or client policies: manage it using the Supabase dashboard or trusted backend. This deliberate server-only configuration produces the informational RLS-without-policies advisor. Existing unrelated extension/password warnings remain unchanged.

`supabase/index.ts` is deployed as `public-causes` with JWT verification enabled. Its server-side credential stays in Supabase. `src/data.js` contains only the public anon JWT required by the gateway, not a service credential. The server returns a fixed public projection with no private record IDs.

Build: `npm install`, `npm test`, `npm run build` using Node compatible with Vite 8. Build outputs standalone HTML one directory above this app. Copy `causes-embed.html` to `docs/index.html`, and `causes-preview.html` to `docs/preview.html` in the repository. GitHub Pages serves `main` /docs.

Tests cover publication gating, refunds, duplicate ledger representations, currency separation, supporter deduplication, privacy, translations, unknown goals, zero progress and overfunding, plus page/bridge behavior. No test contributions or goals are inserted into the live database.
