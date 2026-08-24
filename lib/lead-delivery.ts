import { createHmac } from "node:crypto";

import { isResolvedConfigValue } from "@/lib/config-values";

export const LEAD_SCHEMA_VERSION = "lead.v1";
export const PRIMARY_LEAD_TIMEOUT_MS = 8_000;
export const AUXILIARY_DELIVERY_TIMEOUT_MS = 5_000;
export const MIN_LEAD_STORAGE_SECRET_LENGTH = 32;
export const DEFAULT_LEAD_STORAGE_TRANSPORT = "header_hmac" as const;
export const APPS_SCRIPT_BODY_HMAC_VERSION = "apps_script_body_hmac.v1" as const;

export type LeadStorageTransport = "header_hmac" | "apps_script_body_hmac";

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

export type PrimaryLeadRequest = {
  body: string;
  headers: Record<string, string>;
  transport: LeadStorageTransport;
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

export function resolveLeadStorageTransport(value = process.env.LEAD_STORAGE_TRANSPORT) {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    return DEFAULT_LEAD_STORAGE_TRANSPORT;
  }

  if (normalized === "header_hmac" || normalized === "apps_script_body_hmac") {
    return normalized satisfies LeadStorageTransport;
  }

  return null;
}

export function buildPrimaryLeadRequest(
  envelope: LeadEnvelope,
  secret: string,
  transport: LeadStorageTransport,
  timestamp = Math.floor(Date.now() / 1000).toString()
): PrimaryLeadRequest {
  const payload = JSON.stringify(envelope);

  if (transport === "header_hmac") {
    return {
      body: payload,
      headers: buildPrimaryLeadHeaders(payload, envelope.request_id, secret, timestamp),
      transport,
    };
  }

  const signature = signLeadWebhookBody(payload, timestamp, secret);
  const wrapper = {
    transport: APPS_SCRIPT_BODY_HMAC_VERSION,
    timestamp,
    signature: `sha256=${signature}`,
    payload,
  };

  return {
    body: JSON.stringify(wrapper),
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": envelope.request_id,
      "X-DigitalCapital-Schema": LEAD_SCHEMA_VERSION,
      "X-DigitalCapital-Request-Id": envelope.request_id,
    },
    transport,
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
  transport,
}: {
  url: string;
  secret: string;
  envelope: LeadEnvelope;
  transport?: LeadStorageTransport;
}): Promise<PrimaryLeadAck> {
  const configuredTransport = transport ?? resolveLeadStorageTransport();
  if (!configuredTransport) {
    throw new Error("primary_storage_transport_invalid");
  }

  const request = buildPrimaryLeadRequest(envelope, secret, configuredTransport);
  const response = await fetch(url, {
    method: "POST",
    headers: request.headers,
    body: request.body,
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
  const normalized = value.trim();
  return isResolvedConfigValue(normalized) && normalized.length >= MIN_LEAD_STORAGE_SECRET_LENGTH;
}
