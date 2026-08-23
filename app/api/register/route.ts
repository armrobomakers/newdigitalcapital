import { NextResponse } from "next/server";

import {
  getEventLifecycle,
  isLeadCaptureOpen,
  type LeadType,
} from "@/data/event-registry";
import {
  AUXILIARY_DELIVERY_TIMEOUT_MS,
  buildLeadEnvelope,
  deliverPrimaryLead,
  isValidIdempotencyKey,
  type LeadEnvelope,
} from "@/lib/lead-delivery";
import { isLegalConfigReady } from "@/lib/legal";

type RegistrationPayload = {
  event_id?: string;
  lead_type?: string;
  name?: string;
  contact?: string;
  email?: string;
  phone?: string;
  company?: string;
  privacy_consent?: string | boolean;
  marketing_consent?: string | boolean;
  website?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

type NormalizedPayload = ReturnType<typeof normalizePayload>;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_MAX_KEYS = 5000;
const leadTypes = new Set<LeadType>(["attendee", "partner", "speaker", "media"]);
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function toStringValue(value: FormDataEntryValue | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function clip(value: string | undefined, maxLength: number) {
  return (value ?? "").trim().slice(0, maxLength);
}

function toBoolean(value: string | boolean | undefined) {
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

async function readPayload(request: Request): Promise<RegistrationPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as RegistrationPayload;
  }

  const formData = await request.formData();
  return {
    event_id: toStringValue(formData.get("event_id") ?? undefined),
    lead_type: toStringValue(formData.get("lead_type") ?? undefined),
    name: toStringValue(formData.get("name") ?? undefined),
    contact: toStringValue(formData.get("contact") ?? undefined),
    email: toStringValue(formData.get("email") ?? undefined),
    phone: toStringValue(formData.get("phone") ?? undefined),
    company: toStringValue(formData.get("company") ?? undefined),
    privacy_consent: toStringValue(formData.get("privacy_consent") ?? undefined),
    marketing_consent: toStringValue(formData.get("marketing_consent") ?? undefined),
    website: toStringValue(formData.get("website") ?? undefined),
    utm_source: toStringValue(formData.get("utm_source") ?? undefined),
    utm_medium: toStringValue(formData.get("utm_medium") ?? undefined),
    utm_campaign: toStringValue(formData.get("utm_campaign") ?? undefined),
    utm_content: toStringValue(formData.get("utm_content") ?? undefined),
    utm_term: toStringValue(formData.get("utm_term") ?? undefined),
  };
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

function isRateLimited(ip: string) {
  const now = Date.now();
  pruneRateLimitStore(now);
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return true;
  }

  current.count += 1;
  return false;
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

  if (!secret) {
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
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 16_384) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let payload: NormalizedPayload;

  try {
    payload = normalizePayload(await readPayload(request));
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
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

  if (!isLeadCaptureOpen(payload.event_id, payload.lead_type)) {
    return NextResponse.json(
      {
        ok: false,
        error: payload.lead_type === "attendee" ? "registration_closed" : "lead_capture_closed",
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

  if (!process.env.LEAD_STORAGE_WEBHOOK_SECRET?.trim()) {
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
