# Container Runtime

The Docker path is a supported runtime for Digital Capital and must stay aligned with the repository toolchain.

## Runtime contract

- Node.js: 24.x
- npm: 11.17.0 in the image
- dependency install: `npm ci` from `package-lock.json`
- application port: `7485`
- runtime user: non-root `node`
- health endpoint: `/api/health`
- indexing default: disabled
- Vercel Git deployment policy is independent from Docker

## Local container run

```bash
docker compose up --build
```

Then open:

```text
http://127.0.0.1:7485/ekb
```

The default Compose configuration is fail-closed for indexing.

## Build-time public configuration

`NEXT_PUBLIC_*` values are embedded by Next.js during build. For a production container, pass them as build arguments, not only runtime environment variables.

Example:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://example.com \
  --build-arg NEXT_PUBLIC_INDEXING_ENABLED=false \
  -t digitalcapital:release .
```

Do not enable indexing until the branded domain and paid-traffic launch gate are intentionally ready.

## Runtime secrets

Do not bake secrets into the image. `.dockerignore` excludes `.env` files from the build context.

Pass server-side configuration at runtime, for example:

```bash
docker run --rm -p 7485:7485 \
  -e LEAD_STORAGE_WEBHOOK_URL=... \
  -e LEAD_STORAGE_WEBHOOK_SECRET=... \
  digitalcapital:release
```

Only add real production values when they are confirmed.

## CI verification

GitHub CI builds the production image, asserts Node/npm versions and the non-root user, starts the container, then verifies `/api/health` and the archive page. This path does not consume Vercel builds.
