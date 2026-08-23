import { createHmac, randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

const SCHEMA_VERSION = "lead.v1";
const APPS_SCRIPT_TRANSPORT_VERSION = "apps_script_body_hmac.v1";
const TIMEOUT_MS = 8_000;
const MIN_SECRET_LENGTH = 32;
const VALID_TRANSPORTS = new Set(["header_hmac", "apps_script_body_hmac"]);

export function sign(body, timestamp, secret) {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`, "utf8").digest("hex");
}

export function buildEnvelope(requestId, overrides = {}) {
  return {
    event_id: "storage-contract-check",
    lead_type: "attendee",
    ticket: "synthetic-check",
    name: "DC Storage Contract Check",
    contact: "+70000000000",
    email: "storage-check@example.invalid",
    phone: "+70000000000",
    company: "synthetic-check",
    privacy_consent: true,
    marketing_consent: false,
    utm_source: "storage-check",
    utm_medium: "ops",
    utm_campaign: "primary-storage-acceptance",
    utm_content: "",
    utm_term: "",
    schema_version: SCHEMA_VERSION,
    request_id: requestId,
    submitted_at: new Date().toISOString(),
    source: "newdigitalcapital",
    ...overrides,
  };
}

export function buildRequest(envelope, secret, transport, timestamp = Math.floor(Date.now() / 1000).toString()) {
  const payload = JSON.stringify(envelope);
  const signature = sign(payload, timestamp, secret);

  if (transport === "header_hmac") {
    return {
      body: payload,
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": envelope.request_id,
        "X-DigitalCapital-Schema": SCHEMA_VERSION,
        "X-DigitalCapital-Request-Id": envelope.request_id,
        "X-DigitalCapital-Timestamp": timestamp,
        "X-DigitalCapital-Signature": `sha256=${signature}`,
      },
    };
  }

  if (transport === "apps_script_body_hmac") {
    return {
      body: JSON.stringify({
        transport: APPS_SCRIPT_TRANSPORT_VERSION,
        timestamp,
        signature: `sha256=${signature}`,
        payload,
      }),
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": envelope.request_id,
        "X-DigitalCapital-Schema": SCHEMA_VERSION,
        "X-DigitalCapital-Request-Id": envelope.request_id,
      },
    };
  }

  throw new Error(`unsupported_transport:${transport}`);
}

function validAck(value, requestId) {
  return Boolean(value && typeof value === "object" && value.ok === true && value.request_id === requestId);
}

async function send(url, request) {
  const response = await fetch(url, {
    method: "POST",
    headers: request.headers,
    body: request.body,
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "follow",
  });

  const raw = await response.text();
  let json = null;
  try {
    json = JSON.parse(raw);
  } catch {
    // The caller reports the invalid ACK without exposing any submitted PII.
  }

  return { status: response.status, ok: response.ok, json };
}

function requireConfig(env = process.env) {
  const url = env.LEAD_STORAGE_WEBHOOK_URL?.trim() ?? "";
  const secret = env.LEAD_STORAGE_WEBHOOK_SECRET?.trim() ?? "";
  const transport = env.LEAD_STORAGE_TRANSPORT?.trim() || "header_hmac";

  if (!url) {
    throw new Error("LEAD_STORAGE_WEBHOOK_URL is required");
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") {
      throw new Error("non_https");
    }
  } catch {
    throw new Error("LEAD_STORAGE_WEBHOOK_URL must be a valid HTTPS URL");
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`LEAD_STORAGE_WEBHOOK_SECRET must be at least ${MIN_SECRET_LENGTH} characters`);
  }
  if (!VALID_TRANSPORTS.has(transport)) {
    throw new Error(`LEAD_STORAGE_TRANSPORT must be one of: ${[...VALID_TRANSPORTS].join(", ")}`);
  }

  return { url, secret, transport };
}

export async function runAcceptanceCheck(config = requireConfig()) {
  const requestId = `dc-storage-check:${randomUUID()}`;
  const envelope = buildEnvelope(requestId);
  const first = await send(config.url, buildRequest(envelope, config.secret, config.transport));

  if (!first.ok || !validAck(first.json, requestId) || first.json.duplicate === true) {
    throw new Error(`first_write_failed:status=${first.status}`);
  }

  const duplicate = await send(config.url, buildRequest(envelope, config.secret, config.transport));
  if (!duplicate.ok || !validAck(duplicate.json, requestId) || duplicate.json.duplicate !== true) {
    throw new Error(`duplicate_check_failed:status=${duplicate.status}`);
  }

  const conflictEnvelope = { ...envelope, company: "synthetic-conflict-check" };
  const conflict = await send(
    config.url,
    buildRequest(conflictEnvelope, config.secret, config.transport)
  );
  if (validAck(conflict.json, requestId)) {
    throw new Error("idempotency_conflict_was_accepted");
  }

  return {
    ok: true,
    transport: config.transport,
    request_id: requestId,
    first_write: "acknowledged",
    duplicate_retry: "deduplicated",
    changed_payload_retry: "rejected",
    note: "One synthetic acceptance-check row is intentionally retained in primary storage.",
  };
}

async function main() {
  try {
    const result = await runAcceptanceCheck();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: error instanceof Error ? error.message : "unknown_error",
        },
        null,
        2
      )
    );
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedPath) {
  await main();
}
