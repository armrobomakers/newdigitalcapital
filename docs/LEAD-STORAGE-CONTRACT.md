# Digital Capital — Primary Lead Storage Contract

This contract defines the minimum backend behavior required before lead capture can be enabled for a conference.

## 1. Purpose

`POST /api/register` must not report success until the approved primary lead backend confirms durable storage of the lead.

Telegram is auxiliary only. A separate Google Sheets mirror is also auxiliary unless Google Sheets is explicitly configured as the approved primary backend through the Apps Script transport described below.

## 2. Required environment

```text
LEAD_STORAGE_TRANSPORT=header_hmac
LEAD_STORAGE_WEBHOOK_URL=https://approved-backend.example/...
LEAD_STORAGE_WEBHOOK_SECRET=<strong random secret>
```

Supported transports:

- `header_hmac` — default generic webhook contract;
- `apps_script_body_hmac` — Google Apps Script Web App compatibility contract.

The secret is server-only and must never use a `NEXT_PUBLIC_` prefix.

## 3. Lead envelope

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

The remaining fields contain the normalized registration payload: event, lead type, ticket, name, contact fields, company, consent flags and UTM attribution.

The honeypot field is never forwarded to primary storage.

## 4. Transport A — `header_hmac`

Method: `POST`

Content type: `application/json`

The exact serialized lead envelope is the HTTP body.

Required headers:

```text
Idempotency-Key: <request_id>
X-DigitalCapital-Schema: lead.v1
X-DigitalCapital-Request-Id: <request_id>
X-DigitalCapital-Timestamp: <unix seconds>
X-DigitalCapital-Signature: sha256=<hex hmac>
```

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

## 5. Transport B — `apps_script_body_hmac`

Google Apps Script Web App `doPost(e)` does not expose arbitrary inbound HTTP headers, so the signature material is carried in a JSON wrapper while preserving the same exact-payload HMAC semantics.

The HTTP body is:

```json
{
  "transport": "apps_script_body_hmac.v1",
  "timestamp": "<unix seconds>",
  "signature": "sha256=<hex hmac>",
  "payload": "<exact serialized lead.v1 JSON string>"
}
```

The sender computes:

```text
signed_payload = "<timestamp>.<exact payload string>"
signature = HMAC_SHA256(LEAD_STORAGE_WEBHOOK_SECRET, signed_payload)
```

The receiver must verify transport version, timestamp and HMAC before parsing `payload`.

The repository receiver implementation is:

```text
integrations/google-apps-script/lead-storage.gs
```

Setup details are documented in `docs/GOOGLE-SHEETS-LEAD-STORAGE.md`.

## 6. Idempotency

The primary backend must enforce uniqueness by `request_id`.

For the first durable save:

```json
{
  "ok": true,
  "request_id": "same-id-as-request"
}
```

For a retry of an already stored identical lead:

```json
{
  "ok": true,
  "request_id": "same-id-as-request",
  "duplicate": true
}
```

A retry with the same idempotency key but a materially different payload must be rejected as an idempotency conflict rather than overwriting the original lead.

For the provided Google Sheets receiver, `payload_sha256` is stored with each row and compared on duplicates to enforce that conflict behavior.

## 7. ACK semantics

The site accepts a lead only when all conditions are true:

- HTTP status is 2xx;
- response body is valid JSON;
- `ok === true`;
- `request_id` exactly matches the request id sent by the site.

A 2xx response without this ACK is treated as delivery failure. This is important for Apps Script because receiver-level errors may still be returned as a normal JSON response; `{ok:false}` never counts as an accepted lead.

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

Telegram operational notification is metadata-only. Personal data must remain in the approved primary storage.

If Google Sheets is configured as primary storage, do not also configure the same destination as `GOOGLE_SHEETS_WEBHOOK_URL`; that variable is reserved for an optional separately approved auxiliary mirror.

## 10. Production acceptance checklist

Before enabling registration:

- supported `LEAD_STORAGE_TRANSPORT` configured;
- primary backend URL configured;
- signing secret configured securely;
- receiver verifies HMAC and timestamp;
- receiver enforces idempotency;
- receiver returns the exact ACK contract;
- durable storage tested end-to-end;
- retry of the same request returns `duplicate:true`;
- same request id with changed payload fails as an idempotency conflict;
- mismatched ACK fails closed;
- raw PII is absent from application logs and Telegram notification;
- `/api/health` reports the lead-storage gate as ready.
