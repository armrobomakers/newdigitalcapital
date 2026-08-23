# Digital Capital

Conference platform for «Цифровой капитал», built with Next.js App Router, TypeScript and Tailwind CSS.

The repository currently serves the verified archive event and contains the lifecycle, lead-capture and launch-readiness infrastructure for future events.

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

Open `http://127.0.0.1:7485/ekb`.

## Quality gate

```bash
npm run check
```

This first verifies the environment contract, then runs lint, typecheck and a production build. Pull requests also run lifecycle/readiness matrices, release invariants, runtime/security smoke and a production Docker smoke.

To check only environment documentation drift:

```bash
npm run env:check
```

## Next event activation

Do not invent event facts in runtime catalogs. Start from the activation manifest and validate it first:

```bash
npm run event:check -- config/event-activation.template.json config
```

See `docs/NEXT-EVENT-ACTIVATION.md`.

## Docker

```bash
docker compose up --build
```

The container path is pinned to Node 24 / npm 11.17, runs as a non-root user and exposes `/api/health`.

See `docs/CONTAINER-RUNTIME.md`.

## Architecture

- `data/event-registry.ts` — lifecycle and lead-capture rules.
- `data/events.ts` — event page content.
- `data/conferences.ts` — Conference Engine integrity layer.
- `lib/launch-readiness.ts` — runtime launch gate adapter.
- `lib/launch-readiness-core.ts` — pure launch-readiness evaluator.
- `/api/register` — fail-closed lead submission endpoint.
- `/api/analytics` — privacy-safe conversion ingestion endpoint.
- `/api/health` — operational readiness status.

Vercel Git auto-deploy remains disabled by policy; intermediate development is validated in GitHub CI and deployed only as an intentional release batch.
