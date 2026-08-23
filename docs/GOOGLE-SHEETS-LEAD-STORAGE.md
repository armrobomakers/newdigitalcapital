# Digital Capital — Google Sheets primary lead storage

This runbook wires the conference registration flow to a Google Sheet through a Google Apps Script Web App while keeping the primary-storage ACK, HMAC and idempotency guarantees.

## Architecture

```text
Browser registration
  -> POST /api/register
  -> primary delivery (HMAC + request_id)
  -> Google Apps Script Web App
  -> Google Sheet / Leads
  -> exact ACK back to /api/register
  -> Telegram metadata-only notification
```

The registration API reports success only after the Apps Script receiver returns:

```json
{
  "ok": true,
  "request_id": "same-request-id"
}
```

A retry of an already stored identical payload returns `duplicate:true`.

## Why this transport is different

The default `header_hmac` transport signs the exact JSON body and sends the timestamp/signature in HTTP headers.

Google Apps Script Web App `doPost(e)` exposes the POST body and request parameters but not arbitrary inbound HTTP headers. For Apps Script, use `apps_script_body_hmac`: the sender signs the exact serialized lead envelope and sends a wrapper containing:

```json
{
  "transport": "apps_script_body_hmac.v1",
  "timestamp": "<unix-seconds>",
  "signature": "sha256=<hmac>",
  "payload": "<exact serialized lead.v1 JSON>"
}
```

The HMAC input remains:

```text
<timestamp>.<exact payload string>
```

The Apps Script receiver verifies the HMAC before parsing or storing the lead.

## Receiver source

Use:

```text
integrations/google-apps-script/lead-storage.gs
```

The receiver:

- verifies transport version;
- rejects timestamps outside a 5-minute window;
- verifies HMAC-SHA256 with a constant-time comparison loop;
- accepts only `lead.v1` from `newdigitalcapital`;
- validates `request_id`;
- takes a script lock before idempotency/storage work;
- deduplicates by `request_id`;
- stores and compares `payload_sha256` to detect idempotency conflicts;
- prefixes spreadsheet-formula-like user strings so lead data cannot become a formula;
- verifies the exact Sheet header contract before every write;
- returns the primary ACK expected by the site.

## Google Sheet schema

The target tab must be named `Leads` and have these columns in row 1, in this exact order:

```text
received_at
submitted_at
request_id
event_id
lead_type
ticket
name
contact
email
phone
company
privacy_consent
marketing_consent
utm_source
utm_medium
utm_campaign
utm_content
utm_term
source
schema_version
payload_sha256
```

`payload_sha256` may be hidden from the normal operating view, but it must remain present because it is used for idempotency conflict detection.

## Apps Script properties

In Apps Script Project Settings -> Script properties, configure:

```text
LEAD_STORAGE_WEBHOOK_SECRET=<same strong secret used by the site>
LEAD_SPREADSHEET_ID=<target Google Sheet id>
LEAD_SHEET_NAME=Leads
```

The secret must be at least 32 characters and must not be committed to GitHub or stored in a Sheet cell.

## Deploy the Web App

Create an Apps Script project attached to the lead spreadsheet or a standalone Apps Script project, paste `lead-storage.gs`, then deploy it as a Web App.

The execution URL must accept server-to-server POST requests without an interactive Google sign-in. The Digital Capital HMAC is the application-level authentication mechanism.

Keep the `/exec` deployment URL private from marketing/public copy even though possession of the URL alone is not sufficient to forge a valid signed request.

## Site environment

Configure the production runtime:

```text
LEAD_STORAGE_TRANSPORT=apps_script_body_hmac
LEAD_STORAGE_WEBHOOK_URL=https://script.google.com/macros/s/<deployment-id>/exec
LEAD_STORAGE_WEBHOOK_SECRET=<same strong secret>
```

When Google Sheets itself is the approved primary storage, leave this empty unless a second separately approved PII mirror is intentionally required:

```text
GOOGLE_SHEETS_WEBHOOK_URL=
```

Telegram remains optional:

```text
TELEGRAM_BOT_TOKEN=<bot token>
TELEGRAM_CHAT_ID=<operations chat id>
```

The Telegram message contains request/event/ticket/UTM metadata only. Name, phone, email and company remain in primary storage.

## Acceptance test

Before registration is treated as production-ready, verify all of the following:

1. Submit one synthetic lead with a stable idempotency key.
2. Confirm exactly one new row appears in `Leads`.
3. Confirm `/api/register` receives the matching ACK and returns success.
4. Retry the exact same request/idempotency key.
5. Confirm no second row is created and the receiver returns `duplicate:true`.
6. Retry the same request id with a changed payload and confirm the sender fails closed because the receiver returns an idempotency conflict instead of a valid ACK.
7. Change the signing secret on one side only and confirm the lead is rejected.
8. Confirm raw PII is absent from application logs and Telegram.
9. Confirm `/api/health` no longer reports the lead-storage blocker after the correct transport, URL and secret are configured.

Do not enable paid traffic only because lead storage is ready. Legal contacts, analytics, branded domain, structured data and indexing have separate launch gates.
