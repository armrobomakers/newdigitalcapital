import { NextResponse } from "next/server";

import { getEventLifecycle } from "@/data/event-registry";
import { isSecureWebhookUrl } from "@/lib/config-values";
import { isConversionEventName } from "@/lib/conversion-events";

type AnalyticsPayload = {
  event_name?: unknown;
  event_id?: unknown;
  session_id?: unknown;
  path?: unknown;
  occurred_at?: unknown;
  properties?: unknown;
};

const MAX_BODY_BYTES = 8_192;
const MAX_PROPERTIES = 20;
const MAX_PROPERTY_LENGTH = 240;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_MAX_KEYS = 5000;
const ANALYTICS_WEBHOOK_TIMEOUT_MS = 5_000;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function clipString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function sanitizeProperties(value: unknown) {
  const output: Record<string, string | number | boolean> = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return output;
  }

  for (const [key, propertyValue] of Object.entries(value as Record<string, unknown>).slice(
    0,
    MAX_PROPERTIES
  )) {
    const safeKey = key.replace(/[^a-z0-9_\-]/gi, "").slice(0, 64);
    if (!safeKey) {
      continue;
    }

    if (typeof propertyValue === "boolean") {
      output[safeKey] = propertyValue;
      continue;
    }

    if (typeof propertyValue === "number") {
      if (Number.isFinite(propertyValue)) {
        output[safeKey] = propertyValue;
      }
      continue;
    }

    output[safeKey] = clipString(propertyValue, MAX_PROPERTY_LENGTH);
  }

  return output;
}

function normalizeOccurredAt(value: unknown, receivedAt: string) {
  const candidate = clipString(value, 64);
  if (!candidate) {
    return receivedAt;
  }

  const timestamp = Date.parse(candidate);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : receivedAt;
}

function getClientIp(request: Request) {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function pruneRateLimitStore(now: number) {
  if (rateLimitStore.size < RATE_LIMIT_MAX_KEYS) {
    return;
  }

  for (const [key, value] of rateLimitStore) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  if (rateLimitStore.size >= RATE_LIMIT_MAX_KEYS) {
    const oldestKey = rateLimitStore.keys().next().value as string | undefined;
    if (oldestKey) {
      rateLimitStore.delete(oldestKey);
    }
  }
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  pruneRateLimitStore(now);
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(ip, { count: 1, resetAt });
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { limited: false, retryAfterSeconds: 0 };
}

function safeOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isAllowedBrowserOrigin(request: Request) {
  const suppliedOrigin = request.headers.get("origin")?.trim();
  if (!suppliedOrigin) {
    return true;
  }

  const browserOrigin = safeOrigin(suppliedOrigin);
  if (!browserOrigin) {
    return false;
  }

  if (browserOrigin === safeOrigin(request.url)) {
    return true;
  }

  const configuredOrigin = safeOrigin(process.env.NEXT_PUBLIC_SITE_URL?.trim());
  return configuredOrigin !== null && browserOrigin === configuredOrigin;
}

async function readLimitedJson(request: Request): Promise<AnalyticsPayload> {
  const mediaType = (request.headers.get("content-type") ?? "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (mediaType !== "application/json") {
    throw new Error("unsupported_content_type");
  }

  const declaredLength = request.headers.get("content-length")?.trim();
  if (declaredLength) {
    const bytes = Number(declaredLength);
    if (!Number.isFinite(bytes) || bytes < 0) {
      throw new Error("invalid_json");
    }
    if (bytes > MAX_BODY_BYTES) {
      throw new Error("payload_too_large");
    }
  }

  if (!request.body) {
    throw new Error("invalid_json");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (!value) {
        continue;
      }

      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("payload_too_large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let raw: string;
  try {
    raw = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("invalid_json");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("invalid_json");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("invalid_json");
  }

  return parsed as AnalyticsPayload;
}

function json(body: object, status: number, headers: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export async function POST(request: Request) {
  if (!isAllowedBrowserOrigin(request)) {
    return json({ accepted: false, error: "origin_not_allowed" }, 403);
  }

  const rateLimit = checkRateLimit(getClientIp(request));
  if (rateLimit.limited) {
    return json(
      { accepted: false, error: "rate_limited" },
      429,
      { "Retry-After": String(rateLimit.retryAfterSeconds) }
    );
  }

  let data: AnalyticsPayload;
  try {
    data = await readLimitedJson(request);
  } catch (error) {
    const code = error instanceof Error ? error.message : "invalid_json";
    if (code === "payload_too_large") {
      return json({ accepted: false, error: code }, 413);
    }
    if (code === "unsupported_content_type") {
      return json({ accepted: false, error: code }, 415);
    }
    return json({ accepted: false, error: "invalid_json" }, 400);
  }

  if (!isConversionEventName(data.event_name)) {
    return json({ accepted: false, error: "invalid_event_name" }, 400);
  }

  const eventId = clipString(data.event_id, 80);
  const sessionId = clipString(data.session_id, 80);
  if (!eventId || !sessionId) {
    return json({ accepted: false, error: "missing_event_context" }, 400);
  }

  if (!getEventLifecycle(eventId)) {
    return json({ accepted: false, error: "unknown_event" }, 404);
  }

  const receivedAt = new Date().toISOString();
  const event = {
    event_name: data.event_name,
    event_id: eventId,
    session_id: sessionId,
    path: clipString(data.path, 500),
    occurred_at: normalizeOccurredAt(data.occurred_at, receivedAt),
    properties: sanitizeProperties(data.properties),
    received_at: receivedAt,
  };

  const webhook = process.env.ANALYTICS_WEBHOOK_URL?.trim() ?? "";
  if (!isSecureWebhookUrl(webhook)) {
    return json({ accepted: true, forwarded: false }, 202);
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      cache: "no-store",
      signal: AbortSignal.timeout(ANALYTICS_WEBHOOK_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`analytics_webhook_failed:${response.status}`);
    }
  } catch (error) {
    console.warn("analytics_delivery_failed", {
      eventName: event.event_name,
      eventId: event.event_id,
      error: error instanceof Error ? error.message : "unknown",
    });

    return json({ accepted: true, forwarded: false }, 202);
  }

  return json({ accepted: true, forwarded: true }, 202);
}
