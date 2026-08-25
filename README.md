# Digital Capital

Conference platform for «Цифровой капитал», built with Next.js App Router, TypeScript and Tailwind CSS.

The repository serves the conference platform and contains lifecycle, lead-capture, launch-readiness and release-safety infrastructure for the September 2026 event.

## Toolchain

- Node.js 24.x
- npm >= 11.17.0 < 12
- deterministic install via `npm ci`

## Local run

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Keep `.env.example` as the single documented environment-variable source of truth. Never commit real secrets to `.env.local`.

Open `http://127.0.0.1:7485/ekb-2026-09-26` for the active September event.

## Quality gate

```bash
npm run check
```

This verifies the environment contract, lead-storage checker, launch-placeholder contract, SEO release safety, lint, typecheck and a production build. Pull requests additionally run lifecycle/readiness matrices, release invariants, runtime/security smoke and a production Docker smoke.

To check only environment documentation drift:

```bash
npm run env:check
```

## September launch TODO

The current source of truth for unresolved launch data is:

`config/event-activation.september-draft.json`

Show the remaining placeholders without failing development:

```bash
npm run launch:todo
```

The output includes JSON paths and values such as `TODO_ORGANIZER_PHONE`, `TODO_PRIVACY_EMAIL`, `TODO_BRANDED_SITE_URL` and `TODO_ANALYTICS_WEBHOOK_URL`.

Before a release candidate is considered complete, run the strict gate:

```bash
npm run launch:check
```

This command intentionally exits non-zero while the manifest is marked `draft`, `template`, or contains unresolved placeholders. Removing a TODO from the manifest is not enough by itself: the real value must also be wired into the corresponding runtime config/content and the regular readiness checks must pass.

## Event activation

Generic future events start from:

`config/event-activation.template.json`

The September working draft is:

`config/event-activation.september-draft.json`

Validate a final, fully resolved activation manifest with:

```bash
npm run event:check -- <resolved-manifest.json> registration
npm run event:check -- <resolved-manifest.json> paid-traffic
```

`event:check` rejects draft/template manifests and recognizes `TODO_*`, `TBD_*`, placeholder markers and `__REQUIRED_*` values before any release-readiness evaluation.

See `docs/NEXT-EVENT-ACTIVATION.md` and `docs/CONFERENCE-LAUNCH-RUNBOOK.md`.

## Release order

1. Replace only confirmed public placeholders; never invent production contacts, partners, domains or legal data.
2. Run `npm run launch:todo` until the remaining list is understood.
3. Run `npm run check`.
4. Prepare a resolved activation manifest and run both `event:check` release modes.
5. Verify `/api/health` is ready for the intended launch level.
6. Keep Vercel Git auto-deploy disabled until a reviewed batch is intentionally released.
7. Deploy once, then run production smoke and compare `/api/health` with the pre-release baseline.

## Docker

```bash
docker compose up --build
```

The container path is pinned to Node 24 / npm 11.17, runs as a non-root user and exposes `/api/health`.

See `docs/CONTAINER-RUNTIME.md`.

## Architecture

- `data/event-registry.ts` — lifecycle and lead-capture rules.
- `data/events.ts` — event page content and public contact placeholders.
- `data/conferences.ts` — Conference Engine integrity layer.
- `data/event-seo.ts` — Event JSON-LD readiness and draft fields.
- `lib/config-values.ts` — placeholder / secure URL / branded URL validation.
- `lib/launch-readiness.ts` — runtime launch gate adapter.
- `lib/launch-readiness-core.ts` — pure launch-readiness evaluator.
- `/api/register` — fail-closed lead submission endpoint.
- `/api/analytics` — privacy-safe conversion ingestion endpoint.
- `/api/health` — operational readiness status.

Vercel Git auto-deploy remains disabled by policy; intermediate development is validated in GitHub CI and deployed only as an intentional release batch.
