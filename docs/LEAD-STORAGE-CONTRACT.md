# Digital Capital — Primary Lead Storage Contract

This contract defines the minimum backend behavior required before lead capture can be enabled for a conference.

## 1. Purpose

`POST /api/register` must not report success until the approved primary lead backend confirms durable storage of the lead.

Google Sheets and Telegram are auxiliary only. Their success or failure never determines whether a lead is accepted.

## 2. Required environment

```text
LEAD_STORAGE_WEBHOOK_URL=https://approved-backend.example/...
LEAD_STORAGE_WEBHOOK_SECRET=<strong random secret>
```

The secret is server-only and must never use a `NEXT_PUBLIC_` prefix.

## 3. Request

Method: `POST`

Content type: `application/json`

Required headers:

```text
Idempotency-Key: <request_id>
X-DigitalCapital-Schema: lead.v1
X-DigitalCapital-Request-Id: <request_id>
X-DigitalCapital-Timestamp: <unix seconds>
X-DigitalCapital-Signature: sha256=<hex hmac>
```

The same `request_id` is also included in the JSON body.

## 4. Signature verification

The sender computes:

```text
signed_payload = "<timestamp>.<exact raw JSON request body>"
signature = HMAC_SHA256(LEAD_STORAGE_WEBHOOK_SECRET, signed_payload)
```

The receiver must:

1. Read the raw body without re-serializing it before signature verification.
2. Recompute HMAC-SHA256 using the shared secret.
3. Compare signatures using a timing-safe comparison.
4. Reject stale timestamps. Recommended maximum skew: 5 minutes.
5. Reject a request if the schema is unsupported.

## 5. Idempotency

The primary backend must enforce uniqueness by `Idempotency-Key` / `request_id`.

For the first durable save:

```json
{
  "ok": true,
  "request_id": "same-id-as-request"
}
```

For a retry of an already stored lead:

```json
{
  "ok": true,
  "request_id": "same-id-as-request",
  "duplicate": true
}
```

A retry with the same idempotency key but a materially different payload should be rejected as an idempotency conflict rather than overwriting the original lead.

## 6. ACK semantics

The site accepts a lead only when all conditions are true:

- HTTP status is 2xx;
- response body is valid JSON;
- `ok === true`;
- `request_id` exactly matches the request id sent by the site.

A 2xx response without this ACK is treated as delivery failure.

## 7. Lead envelope

Current schema: `lead.v1`.

Envelope metadata includes:

```json
{
  "schema_version": "lead.v1",
  "request_id": "...",
  "submitted_at": "ISO-8601 timestamp",
  "source": "newdigitalcapital"
}
```

The remaining fields contain the normalized registration payload: event, lead type, name, contact fields, company, consent flags and UTM attribution.

The honeypot field is never forwarded to primary storage.

## 8. Timeouts and retries

The website uses a bounded timeout for primary storage delivery. If the timeout fires after the backend has already stored the lead, the browser retry reuses the same idempotency key. The backend must therefore return the existing lead as `duplicate:true` rather than create another row.

The website does not treat auxiliary notification delivery as a reason to reject an already stored primary lead.

## 9. Privacy and logging

Application failure logs may contain:

- request id;
- event id;
- lead type;
- technical error/status.

They must not contain name, phone, email, company or the raw lead payload.

Telegram operational notification is metadata-only. Personal data must remain in the approved primary storage. A Google Sheets mirror is optional and must not be configured until its data-processing path is explicitly approved.

## 10. Production acceptance checklist

Before enabling registration:

- primary backend URL configured;
- signing secret configured securely;
- receiver verifies HMAC and timestamp;
- receiver enforces idempotency;
- receiver returns the exact ACK contract;
- durable storage tested end-to-end;
- retry of the same request returns `duplicate:true`;
- mismatched ACK fails closed;
- raw PII is absent from application logs and Telegram notification;
- `/api/health` reports the lead-storage gate as ready.
