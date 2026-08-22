import type { ConversionEventName } from "@/lib/conversion-events";

const SESSION_KEY = "dc_conversion_session_id";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

type ConversionProperties = Record<string, string | number | boolean | null | undefined>;

function getSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const created = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

function getUtm() {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    UTM_KEYS.map((key) => [key, params.get(key) ?? ""]).filter(([, value]) => Boolean(value))
  );
}

export function trackConversionEvent(
  eventName: ConversionEventName,
  eventId: string,
  properties: ConversionProperties = {}
) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    event_name: eventName,
    event_id: eventId,
    session_id: getSessionId(),
    path: window.location.pathname,
    occurred_at: new Date().toISOString(),
    properties: {
      ...getUtm(),
      ...properties,
    },
  };

  const body = JSON.stringify(payload);

  try {
    if (navigator.sendBeacon) {
      const queued = navigator.sendBeacon(
        "/api/analytics",
        new Blob([body], { type: "application/json" })
      );
      if (queued) {
        return;
      }
    }

    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Analytics must never block navigation, registration or rendering.
  }
}
