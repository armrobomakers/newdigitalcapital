import { NextResponse } from "next/server";

import { getEventLifecycle, isRegistrationOpen } from "@/data/event-registry";

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

function isPayloadValid(payload: NormalizedPayload) {
  const phoneDigits = payload.phone.replace(/\D/g, "");
  const eventIdValid = /^[a-z0-9][a-z0-9-]{2,79}$/i.test(payload.event_id);
  const leadTypeValid = ["attendee", "partner", "speaker", "media"].includes(payload.lead_type);

  return (
    payload.name.length >= 2 &&
    payload.contact.length >= 5 &&
    phoneDigits.length >= 7 &&
    payload.privacy_consent &&
    eventIdValid &&
    leadTypeValid
  );
}

function getClientIp(request: Request) {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
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

async function postToTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { configured: false, delivered: false };
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
  });

  if (!response.ok) {
    throw new Error(`telegram_delivery_failed:${response.status}`);
  }

  return { configured: true, delivered: true };
}

async function postToSheets(payload: NormalizedPayload, requestId: string) {
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhook) {
    return { configured: false, delivered: false };
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      request_id: requestId,
      submitted_at: new Date().toISOString(),
      source: "newdigitalcapital",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`sheets_delivery_failed:${response.status}`);
  }

  return { configured: true, delivered: true };
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

  if (!isPayloadValid(payload)) {
    return NextResponse.json({ ok: false, error: "invalid_required_fields" }, { status: 400 });
  }

  const lifecycle = getEventLifecycle(payload.event_id);
  if (!lifecycle) {
    return NextResponse.json({ ok: false, error: "unknown_event" }, { status: 404 });
  }

  if (!isRegistrationOpen(payload.event_id)) {
    return NextResponse.json({ ok: false, error: "registration_closed" }, { status: 409 });
  }

  const sheetsConfigured = Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL);
  const telegramConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

  if (!sheetsConfigured && !telegramConfigured) {
    return NextResponse.json({ ok: false, error: "registration_storage_unavailable" }, { status: 503 });
  }

  const requestId = crypto.randomUUID();
  const safe = (value: string) => escapeHtml(value);
  const message = [
    "<b>Новая заявка на Цифровой капитал</b>",
    `<b>ID:</b> ${safe(requestId)}`,
    `<b>Event:</b> ${safe(payload.event_id)}`,
    `<b>Тип:</b> ${safe(payload.lead_type)}`,
    `Имя: ${safe(payload.name)}`,
    `Контакт: ${safe(payload.contact)}`,
    payload.email ? `Email: ${safe(payload.email)}` : null,
    payload.phone ? `Телефон: ${safe(payload.phone)}` : null,
    payload.company ? `Компания: ${safe(payload.company)}` : null,
    "Согласие на ПД: да",
    `Инфосообщения: ${payload.marketing_consent ? "да" : "нет"}`,
    payload.utm_source ? `UTM Source: ${safe(payload.utm_source)}` : null,
    payload.utm_medium ? `UTM Medium: ${safe(payload.utm_medium)}` : null,
    payload.utm_campaign ? `UTM Campaign: ${safe(payload.utm_campaign)}` : null,
    payload.utm_content ? `UTM Content: ${safe(payload.utm_content)}` : null,
    payload.utm_term ? `UTM Term: ${safe(payload.utm_term)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const [sheetsResult, telegramResult] = await Promise.allSettled([
    postToSheets(payload, requestId),
    postToTelegram(message),
  ]);

  const sheetsDelivered = sheetsResult.status === "fulfilled" && sheetsResult.value.delivered;
  const telegramDelivered = telegramResult.status === "fulfilled" && telegramResult.value.delivered;

  // Google Sheets is treated as primary storage when configured. Telegram is only an
  // operational notification/fallback and must never mask a failed primary write.
  const delivered = sheetsConfigured ? sheetsDelivered : telegramDelivered;

  if (!delivered) {
    console.error("registration_delivery_failed", {
      requestId,
      eventId: payload.event_id,
      leadType: payload.lead_type,
      sheets: sheetsResult.status,
      telegram: telegramResult.status,
    });

    return NextResponse.json(
      { ok: false, error: "registration_delivery_failed", request_id: requestId },
      { status: 502 }
    );
  }

  if (sheetsConfigured && telegramConfigured && !telegramDelivered) {
    console.warn("registration_notification_failed", {
      requestId,
      eventId: payload.event_id,
    });
  }

  return NextResponse.json({
    ok: true,
    message: "registration_received",
    request_id: requestId,
  });
}
