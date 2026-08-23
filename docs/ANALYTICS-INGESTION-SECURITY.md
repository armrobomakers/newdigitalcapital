# Analytics Ingestion Security

`POST /api/analytics` is a public first-party conversion-event endpoint. Analytics must never become a way to block navigation or registration, but malformed or hostile traffic should be rejected before forwarding.

## Request contract

- media type: `application/json` only;
- maximum request body: 8 KiB, enforced while reading the stream;
- JSON root must be an object;
- browser `Origin`, when present, must match the request origin or `NEXT_PUBLIC_SITE_URL`;
- requests without `Origin` remain possible for trusted operational/server checks.

## Event validation

The endpoint accepts only known conversion event names and known conference event IDs. String fields and property keys are clipped/sanitized. Non-finite numeric properties are discarded. Invalid `occurred_at` values fall back to the server receive timestamp.

## Delivery behavior

If `ANALYTICS_WEBHOOK_URL` is not configured, a valid event is acknowledged with `202` and `forwarded:false`.

If a webhook is configured, forwarding has a 5-second timeout. Webhook errors or timeouts do not fail the visitor flow; the endpoint still returns `202` with `forwarded:false` and writes only metadata to the server warning log.

Responses use `Cache-Control: no-store`.

## Rate limiting

The process-local limiter allows 120 attempts per client key per 10 minutes. A limited request receives `429` with `Retry-After`.

As with the registration limiter, this is best-effort and is not distributed across serverless instances. Before meaningful paid traffic, a shared edge/bot-protection layer should be considered separately rather than treating this in-process map as global enforcement.

## CI coverage

Pull-request smoke tests verify hostile-origin rejection, JSON-only enforcement, chunked oversized-body rejection, malformed JSON handling, a valid archive `page_view`, and no-store response behavior.
