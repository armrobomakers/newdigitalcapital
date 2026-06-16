import { NextResponse } from "next/server";

type RegistrationPayload = {
  name?: string;
  contact?: string;
  email?: string;
  phone?: string;
  company?: string;
  consent?: string | boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

function toStringValue(value: FormDataEntryValue | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePayload(data: RegistrationPayload) {
  const email = (data.email ?? "").trim();
  const phone = (data.phone ?? "").trim();
  const contact = (data.contact ?? "").trim() || email || phone;

  return {
    name: (data.name ?? "").trim(),
    contact,
    email,
    phone,
    company: (data.company ?? "").trim(),
    consent:
      data.consent === true ||
      data.consent === "true" ||
      data.consent === "on" ||
      data.consent === "yes",
    utm_source: (data.utm_source ?? "").trim(),
    utm_medium: (data.utm_medium ?? "").trim(),
    utm_campaign: (data.utm_campaign ?? "").trim(),
    utm_content: (data.utm_content ?? "").trim(),
    utm_term: (data.utm_term ?? "").trim(),
  };
}

async function readPayload(request: Request): Promise<RegistrationPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as RegistrationPayload;
  }

  const formData = await request.formData();
  return {
    name: toStringValue(formData.get("name") ?? undefined),
    contact: toStringValue(formData.get("contact") ?? undefined),
    email: toStringValue(formData.get("email") ?? undefined),
    phone: toStringValue(formData.get("phone") ?? undefined),
    company: toStringValue(formData.get("company") ?? undefined),
    consent: toStringValue(formData.get("consent") ?? undefined) || "on",
    utm_source: toStringValue(formData.get("utm_source") ?? undefined),
    utm_medium: toStringValue(formData.get("utm_medium") ?? undefined),
    utm_campaign: toStringValue(formData.get("utm_campaign") ?? undefined),
    utm_content: toStringValue(formData.get("utm_content") ?? undefined),
    utm_term: toStringValue(formData.get("utm_term") ?? undefined),
  };
}

async function postToTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return;
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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
  });
}

async function postToSheets(payload: ReturnType<typeof normalizePayload>) {
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhook) {
    return;
  }

  await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      submittedAt: new Date().toISOString(),
      source: "newdigitalcapital",
    }),
  });
}

export async function POST(request: Request) {
  const payload = normalizePayload(await readPayload(request));

  if (!payload.name || !payload.contact || !payload.consent) {
    return NextResponse.json(
      { ok: false, error: "missing_required_fields" },
      { status: 400 }
    );
  }

  const message = [
    "<b>Новая заявка на Цифровой капитал</b>",
    `Имя: ${payload.name}`,
    `Контакт: ${payload.contact}`,
    payload.email ? `Email: ${payload.email}` : null,
    payload.phone ? `Телефон: ${payload.phone}` : null,
    payload.company ? `Компания: ${payload.company}` : null,
    payload.utm_source ? `UTM Source: ${payload.utm_source}` : null,
    payload.utm_medium ? `UTM Medium: ${payload.utm_medium}` : null,
    payload.utm_campaign ? `UTM Campaign: ${payload.utm_campaign}` : null,
    payload.utm_content ? `UTM Content: ${payload.utm_content}` : null,
    payload.utm_term ? `UTM Term: ${payload.utm_term}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await Promise.allSettled([postToTelegram(message), postToSheets(payload)]);

  return NextResponse.json({
    ok: true,
    message: "registration_received",
  });
}
