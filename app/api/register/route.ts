import { NextResponse } from "next/server";

import {
  getEventLifecycle,
  getLeadCaptureAvailability,
  type LeadType,
} from "@/data/event-registry";
import {
  AUXILIARY_DELIVERY_TIMEOUT_MS,
  buildLeadEnvelope,
  deliverPrimaryLead,
  isValidIdempotencyKey,
  isValidLeadStorageSecret,
  type LeadEnvelope,
} from "@/lib/lead-delivery";
import { isLegalConfigReady } from "@/lib/legal";

type RegistrationPayload = {
  event_id?: unknown;
  lead_type?: unknown;
  name?: unknown;
  contact?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
  privacy_consent?: unknown;
  marketing_consent?: unknown;
  website?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_content?: unknown;
  utm_term?: unknown;
};

type NormalizedPayload = ReturnType<typeof normalizePayload>;

const MAX_REQUEST_BODY_BYTES = 16_384;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_MAX_KEYS = 5000;
const leadTypes = new Set<LeadType>(["attendee", "partner", "speaker", "media"]);
const supportedMediaTypes = new Set(["application/json", "application/x-www-form-urlencoded"]);
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function clip(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function toBoolean(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "yes";
}

function normalizePayload(data: RegistrationPayload) {
  const email = clip(data.email, 160);
  const phone = clip(data.phone, 32);
  const contact = clip(data.contact, 160) || email || phone;

  return {
    event_id: clip(data.event_id, 80),
    lead_type: clip(data.lead_type, 32) || "attendee",
    name: clip(data.name, 100),
    contact,
    email,
    phone,
    company: clip(data.company, 160),
    privacy_consent: toBoolean(data.privacy_consent),
    marketing_consent: toBoolean(data.marketing_consent),
    website: clip(data.website, 200),
    utm_source: clip(data.utm_source, 120),
    utm_medium: clip(data.utm_medium, 120),
    utm_campaign: clip(data.utm_campaign, 160),
    utm_content: clip(data.utm_content, 160),
    utm_term: clip(data.utm_term, 160),
  };
}

function getMediaType(request: Request) {
  return (request.headers.get("content-type") ?? "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
}

async function readLimitedText(request: Request) {
  const declaredLength = request.headers.get("content-length")?.trim();
  if (declaredLength) {
    const bytes = Number(declaredLength);
    if (!Number.isFinite(bytes) || bytes < 0) {
      throw new Error("invalid_payload");
    }
    if (bytes > MAX_REQUEST_BODY_BYTES) {
      throw new Error("payload_too_large");
    }
  }

  if (!request.body) {
    return "";
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
      if (totalBytes > MAX_REQUEST_BODY_BYTES) {
        await reader.cancel();
        throw new Error("payload_too_large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch {
    throw new Error("invalid_payload");
  }
}

function payloadFromSearchParams(params: URLSearchParams): RegistrationPayload {
  const get = (key: string) => params.get(key) ?? undefined;
  return {
    event_id: get("event_id"),
    lead_type: get("lead_type"),
    name: get("name"),
    contact: get("contact"),
    email: get("email"),
    phone: get("phone"),
    company: get("company"),
    privacy_consent: get("privacy_consent"),
    marketing_consent: get("marketing_consent"),
    website: get("website"),
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_content: get("utm_content"),
    utm_term: get("utm_term"),
  };
}

async function readPayload(request: Request): Promise<RegistrationPayload> {
  const mediaType = getMediaType(request);
  if (!supportedMediaTypes.has(mediaType)) {
    throw new Error("unsupported_content_type");
  }

  const rawBody = await readLimitedText(request);
  if (mediaType === "application/x-www-form-urlencoded") {
    return payloadFromSearchParams(new URLSearchParams(rawBody));
  }

  const parsed = JSON.parse(rawBody || "{}");
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("invalid_payload");
  }

  return parsed as RegistrationPayload;
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isLeadType(value: string): value is LeadType {
  return leadTypes.has(value as LeadType);
}

function isPayloadValid(payload: NormalizedPayload) {
  const phoneDigits = payload.phone.replace(/\D/g, "");
  const eventIdValid = /^[a-z0-9][a-z0-9-]{2,79}$/i.test(payload.event_id);

  return (
    payload.name.length >= 2 &&
    payload.contact.length >= 5 &&
    phoneDigits.length >= 7 &&
    payload.privacy_consent &&
    eventIdValid &&
    isLeadType(payload.lead_type)
  );
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

function resolveRequestId(request: Request) {
  const supplied = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!supplied) {
    return crypto.randomUUID();
  }

  return isValidIdempotencyKey(supplied) ? supplied : null;
}

function buildStoredEnvelope(payload: NormalizedPayload, requestId: string) {
  return buildLeadEnvelope(
    {
      ...payload,
      website: undefined,
    },
    requestId
  );
}

async function postJsonWebhook(
  url: string,
  body: unknown,
  errorPrefix: string,
  timeoutMs = AUXILIARY_DELIVERY_TIMEOUT_MS
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`${errorPrefix}:${response.status}`);
  }
}

async function postToPrimaryStorage(envelope: LeadEnvelope) {
  const webhook = process.env.LEAD_STORAGE_WEBHOOK_URL?.trim();
  const secret = process.env.LEAD_STORAGE_WEBHOOK_SECRET?.trim();

  if (!webhook) {
    throw new Error("primary_storage_not_configured");
  }

  if (!secret || !isValidLeadStorageSecret(secret)) {
    throw new Error("primary_storage_signature_not_configured");
  }

  return deliverPrimaryLead({
    url: webhook,
    secret,
    envelope,
  });
}

async function postToSheetsMirror(envelope: LeadEnvelope) {
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();

  if (!webhook) {
    return;
  }

  await postJsonWebhook(webhook, envelope, "sheets_mirror_delivery_failed");
}

async function postToTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(AUXILIARY_DELIVERY_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`telegram_delivery_failed:${response.status}`);
  }
}

function buildTelegramNotification(payload: NormalizedPayload, requestId: string) {
  const safe = (value: string) => escapeHtml(value);
  return [
    "<b>Новая заявка на Цифровой капитал</b>",
    `<b>ID:</b> ${safe(requestId)}`,
    `<b>Event:</b> ${safe(payload.event_id)}`,
    `<b>Тип:</b> ${safe(payload.lead_type)}`,
    payload.utm_source ? `<b>UTM Source:</b> ${safe(payload.utm_source)}` : null,
    payload.utm_campaign ? `<b>UTM Campaign:</b> ${safe(payload.utm_campaign)}` : null,
    "Персональные данные доступны только в основном хранилище заявок.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: Request) {
  if (!isAllowedBrowserOrigin(request)) {
    return NextResponse.json({ ok: false, error: "origin_not_allowed" }, { status: 403 });
  }

  let payload: NormalizedPayload;

  try {
    payload = normalizePayload(await readPayload(request));
  } catch (error) {
    const code = error instanceof Error ? error.message : "invalid_payload";
    if (code === "payload_too_large") {
      return NextResponse.json({ ok: false, error: code }, { status: 413 });
    }
    if (code === "unsupported_content_type") {
      return NextResponse.json({ ok: false, error: code }, { status: 415 });
    }
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const rateLimit = checkRateLimit(getClientIp(request));
  if (rateLimit.limited) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  // Honeypot: acknowledge automated submissions without forwarding personal data.
  if (payload.website) {
    return NextResponse.json({ ok: true, message: "registration_received" });
  }

  if (!isPayloadValid(payload) || !isLeadType(payload.lead_type)) {
    return NextResponse.json({ ok: false, error: "invalid_required_fields" }, { status: 400 });
  }

  const lifecycle = getEventLifecycle(payload.event_id);
  if (!lifecycle) {
    return NextResponse.json({ ok: false, error: "unknown_event" }, { status: 404 });
  }

  const availability = getLeadCaptureAvailability(payload.event_id, payload.lead_type);
  if (!availability?.open) {
    return NextResponse.json(
      {
        ok: false,
        error: payload.lead_type === "attendee" ? "registration_closed" : "lead_capture_closed",
        reason: availability?.reason ?? "status_closed",
      },
      { status: 409 }
    );
  }

  if (!isLegalConfigReady()) {
    return NextResponse.json(
      { ok: false, error: "legal_configuration_incomplete" },
      { status: 503 }
    );
  }

  if (!process.env.LEAD_STORAGE_WEBHOOK_URL?.trim()) {
    return NextResponse.json(
      { ok: false, error: "primary_storage_unavailable" },
      { status: 503 }
    );
  }

  const storageSecret = process.env.LEAD_STORAGE_WEBHOOK_SECRET?.trim() ?? "";
  if (!isValidLeadStorageSecret(storageSecret)) {
    return NextResponse.json(
      { ok: false, error: "primary_storage_signature_unavailable" },
      { status: 503 }
    );
  }

  const requestId = resolveRequestId(request);
  if (!requestId) {
    return NextResponse.json({ ok: false, error: "invalid_idempotency_key" }, { status: 400 });
  }

  const envelope = buildStoredEnvelope(payload, requestId);

  let duplicate = false;
  try {
    const ack = await postToPrimaryStorage(envelope);
    duplicate = ack.duplicate === true;
  } catch (error) {
    console.error("registration_primary_storage_failed", {
      requestId,
      eventId: payload.event_id,
      leadType: payload.lead_type,
      error: error instanceof Error ? error.message : "unknown_error",
    });

    return NextResponse.json(
      { ok: false, error: "registration_delivery_failed", request_id: requestId },
      { status: 502 }
    );
  }

  if (!duplicate) {
    const [sheetsResult, telegramResult] = await Promise.allSettled([
      postToSheetsMirror(envelope),
      postToTelegram(buildTelegramNotification(payload, requestId)),
    ]);

    if (sheetsResult.status === "rejected" || telegramResult.status === "rejected") {
      console.warn("registration_auxiliary_delivery_failed", {
        requestId,
        eventId: payload.event_id,
        sheets: sheetsResult.status,
        telegram: telegramResult.status,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    message: "registration_received",
    request_id: requestId,
    deduplicated: duplicate,
  });
}
