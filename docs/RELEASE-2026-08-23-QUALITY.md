# Digital Capital Release Quality — 2026-08-23

## Release candidate

- Release PR: `#10`
- Base: `main`
- Tested commit: `62e3e69387c73741a2914b30edcf4225aa8831ca`
- GitHub Actions run: `32627161665`
- Node: `24.x`
- npm: `11.17.x`

## Final cumulative gate

- strict `npm ci`: **success**
- pending/unreviewed install scripts: **none**
- production npm audit: **success — 0 vulnerabilities**
- full npm audit: **success — 0 vulnerabilities**
- release source invariants: **success**
- ESLint: **success**
- TypeScript: **success**
- Next.js 16.3.2 production build: **success**
- HTTP runtime smoke: **success**
- security-header smoke: **success**

## Safe archive assertions

- EKB event lifecycle is `past`: **confirmed**
- attendee / partner / speaker / media capture disabled: **confirmed**
- unverified historical venue/address is not published as a confirmed fact: **confirmed**
- stale `6 900 ₽` ticket price removed from archive output: **confirmed**
- stale archive ticket benefits removed: **confirmed**
- Event JSON-LD remains disabled for the unverified archive: **confirmed**
- indexing remains fail-closed: **confirmed**

## Runtime routes checked

- `/` redirects to the primary archive route: **success**
- `/ekb`: **200**
- `/legal/privacy`: **200**
- `/legal/offer`: **200**
- `/thanks`: **200**
- `/apply/partner/ekb`: **200**, capture closed by lifecycle
- unknown event route: **404**
- `/manifest.webmanifest`: **200**
- `/robots.txt`: **200**, disallow-all while indexing is disabled
- `/sitemap.xml`: **200**
- `/api/health`: **200**, intentionally `gated`
- `/api/analytics`: **202**, valid first-party event accepted without requiring a backend
- `/api/register`: **409** for archived attendee registration, with temporal/lifecycle reason

## Security assertions

- `Content-Security-Policy-Report-Only`: **present**
- `X-Content-Type-Options: nosniff`: **present**
- `X-Frame-Options: DENY`: **present**
- `X-Powered-By`: **absent**
- strict dependency install-script policy: **confirmed**

## Expected launch blockers after archive release

These are expected configuration/business blockers for activating a future sales event, not blockers for publishing the safe archive platform:

Registration:
- `sales_event_missing`
- `legal_config_incomplete`
- `lead_storage_unavailable`

Paid traffic additionally requires:
- `analytics_unavailable`
- `branded_domain_missing`
- `indexing_disabled`

A future event must also pass its event-specific readiness checks such as verified venue, contacts and structured data.
