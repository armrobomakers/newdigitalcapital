import { NextResponse } from "next/server";

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

function clipString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function sanitizeProperties(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, MAX_PROPERTIES)
      .map(([key, propertyValue]) => {
        const safeKey = key.replace(/[^a-z0-9_\-]/gi, "").slice(0, 64);
        if (!safeKey) {
          return null;
        }

        if (typeof propertyValue === "boolean" || typeof propertyValue === "number") {
          return [safeKey, propertyValue] as const;
        }

        return [safeKey, clipString(propertyValue, MAX_PROPERTY_LENGTH)] as const;
      })
      .filter((entry): entry is readonly [string, string | number | boolean] => Boolean(entry))
  );
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ accepted: false, error: "payload_too_large" }, { status: 413 });
  }

  let data: AnalyticsPayload;
  try {
    data = (await request.json()) as AnalyticsPayload;
  } catch {
    return NextResponse.json({ accepted: false, error: "invalid_json" }, { status: 400 });
  }

  if (!isConversionEventName(data.event_name)) {
    return NextResponse.json({ accepted: false, error: "invalid_event_name" }, { status: 400 });
  }

  const eventId = clipString(data.event_id, 80);
  const sessionId = clipString(data.session_id, 80);
  if (!eventId || !sessionId) {
    return NextResponse.json({ accepted: false, error: "missing_event_context" }, { status: 400 });
  }

  const event = {
    event_name: data.event_name,
    event_id: eventId,
    session_id: sessionId,
    path: clipString(data.path, 500),
    occurred_at: clipString(data.occurred_at, 64) || new Date().toISOString(),
    properties: sanitizeProperties(data.properties),
    received_at: new Date().toISOString(),
  };

  const webhook = process.env.ANALYTICS_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json({ accepted: true, forwarded: false }, { status: 202 });
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      cache: "no-store",
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

    return NextResponse.json({ accepted: true, forwarded: false }, { status: 202 });
  }

  return NextResponse.json({ accepted: true, forwarded: true }, { status: 202 });
}
