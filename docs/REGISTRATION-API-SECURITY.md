# Registration API Security Boundary

`POST /api/register` is a public lead-ingestion endpoint. It must fail closed before any lead is forwarded to primary storage.

## Accepted request formats

Only these media types are accepted:

- `application/json`
- `application/x-www-form-urlencoded`

The first-party registration UI sends JSON.

## Request body limit

The maximum body size is 16 KiB. The limit is enforced while reading the request stream, not only from `Content-Length`, so chunked requests cannot bypass it.

## Browser origin guard

When a browser sends an `Origin` header, it must match either:

- the incoming request origin; or
- the configured `NEXT_PUBLIC_SITE_URL` origin.

Requests without an `Origin` header remain possible for trusted server-to-server checks and operational tooling. This is not an authentication mechanism; it is an abuse-reduction boundary for browsers.

## Honeypot

The hidden `website` field is a honeypot. Non-empty submissions are acknowledged but are not forwarded to lead storage.

## Rate limiting

The built-in limiter allows five parsed requests per client key in ten minutes and returns `429` with `Retry-After` after the limit is exceeded.

The built-in store is process-local and therefore best-effort only. It is useful for local, Docker and single-instance deployments, but it must not be treated as a distributed anti-abuse service for high-volume traffic. If paid traffic becomes material, add an external shared rate-limit / bot-protection layer and make that an explicit launch requirement.

## Other fail-closed gates

A valid request still cannot be accepted unless:

- the event exists;
- the lead type is open at the current time;
- legal configuration is ready;
- primary lead storage is configured;
- the storage signing secret is valid;
- the primary storage acknowledges the exact request ID.

CI exercises cross-origin rejection, unsupported content type, chunked oversized body, archive closure and rate-limit headers on every pull request.
