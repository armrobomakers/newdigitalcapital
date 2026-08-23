import { createHmac } from "node:crypto";

export const LEAD_SCHEMA_VERSION = "lead.v1";
export const PRIMARY_LEAD_TIMEOUT_MS = 8_000;
export const AUXILIARY_DELIVERY_TIMEOUT_MS = 5_000;
export const MIN_LEAD_STORAGE_SECRET_LENGTH = 32;

export type PrimaryLeadAck = {
  ok: true;
  request_id: string;
  duplicate?: boolean;
};

export type LeadEnvelope = Record<string, unknown> & {
  schema_version: typeof LEAD_SCHEMA_VERSION;
  request_id: string;
  submitted_at: string;
  source: "newdigitalcapital";
};

export function buildLeadEnvelope(
  payload: Record<string, unknown>,
  requestId: string,
  submittedAt = new Date().toISOString()
): LeadEnvelope {
  return {
    ...payload,
    schema_version: LEAD_SCHEMA_VERSION,
    request_id: requestId,
    submitted_at: submittedAt,
    source: "newdigitalcapital",
  };
}

export function signLeadWebhookBody(body: string, timestamp: string, secret: string) {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`, "utf8").digest("hex");
}

export function buildPrimaryLeadHeaders(
  body: string,
  requestId: string,
  secret: string,
  timestamp = Math.floor(Date.now() / 1000).toString()
) {
  const signature = signLeadWebhookBody(body, timestamp, secret);

  return {
    "Content-Type": "application/json",
    "Idempotency-Key": requestId,
    "X-DigitalCapital-Schema": LEAD_SCHEMA_VERSION,
    "X-DigitalCapital-Request-Id": requestId,
    "X-DigitalCapital-Timestamp": timestamp,
    "X-DigitalCapital-Signature": `sha256=${signature}`,
  };
}

function isPrimaryLeadAck(value: unknown, requestId: string): value is PrimaryLeadAck {
  if (!value || typeof value !== "object") {
    return false;
  }

  const ack = value as Record<string, unknown>;
  return ack.ok === true && ack.request_id === requestId;
}

export async function deliverPrimaryLead({
  url,
  secret,
  envelope,
}: {
  url: string;
  secret: string;
  envelope: LeadEnvelope;
}): Promise<PrimaryLeadAck> {
  const body = JSON.stringify(envelope);
  const response = await fetch(url, {
    method: "POST",
    headers: buildPrimaryLeadHeaders(body, envelope.request_id, secret),
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(PRIMARY_LEAD_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`primary_storage_delivery_failed:${response.status}`);
  }

  const ack = (await response.json().catch(() => null)) as unknown;
  if (!isPrimaryLeadAck(ack, envelope.request_id)) {
    throw new Error("primary_storage_invalid_ack");
  }

  return ack;
}

export function isValidIdempotencyKey(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/.test(value);
}

export function isValidLeadStorageSecret(value: string) {
  return value.trim().length >= MIN_LEAD_STORAGE_SECRET_LENGTH;
}
