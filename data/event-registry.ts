export type EventLifecycleStatus = "draft" | "scheduled" | "sales" | "sold_out" | "past";
export type LeadType = "attendee" | "partner" | "speaker" | "media";

export type LeadCaptureRules = Record<LeadType, boolean>;
export type LeadCaptureWindow = {
  opensAt?: string;
  closesAt?: string;
};
export type LeadCaptureWindows = Partial<Record<LeadType, LeadCaptureWindow>>;

export type EventLifecycleConfig = {
  id: string;
  slug: string;
  status: EventLifecycleStatus;
  startsAt: string;
  pageReady: boolean;
  leadCapture: LeadCaptureRules;
  leadCaptureWindows?: LeadCaptureWindows;
};

export type EventLifecycle = EventLifecycleConfig & {
  registrationOpen: boolean;
};

export type LeadCaptureAvailabilityReason =
  | "open"
  | "page_not_ready"
  | "lead_type_disabled"
  | "status_closed"
  | "invalid_event_time"
  | "event_started"
  | "invalid_window"
  | "window_not_open"
  | "window_closed";

export type LeadCaptureAvailability = {
  open: boolean;
  reason: LeadCaptureAvailabilityReason;
  eventStartsAt: string;
  opensAt: string | null;
  closesAt: string;
};

export const eventRegistry = {
  "ekb-2026-06-13": {
    id: "ekb-2026-06-13",
    slug: "ekb",
    status: "past",
    startsAt: "2026-06-13T12:00:00+05:00",
    pageReady: true,
    leadCapture: {
      attendee: false,
      partner: false,
      speaker: false,
      media: false,
    },
  },
} as const satisfies Record<string, EventLifecycleConfig>;

export type EventId = keyof typeof eventRegistry;

function parseTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function normalizeNow(now: Date | number | string) {
  if (now instanceof Date) {
    return Number.isFinite(now.getTime()) ? now.getTime() : null;
  }

  if (typeof now === "number") {
    return Number.isFinite(now) ? now : null;
  }

  return parseTimestamp(now);
}

function statusAllowsLeadType(status: EventLifecycleStatus, leadType: LeadType) {
  if (leadType === "attendee") {
    return status === "sales";
  }

  return status === "scheduled" || status === "sales" || status === "sold_out";
}

function closedAvailability(
  event: EventLifecycleConfig,
  reason: Exclude<LeadCaptureAvailabilityReason, "open">,
  opensAt: string | null,
  closesAt: string
): LeadCaptureAvailability {
  return {
    open: false,
    reason,
    eventStartsAt: event.startsAt,
    opensAt,
    closesAt,
  };
}

export function evaluateLeadCaptureAvailability(
  event: EventLifecycleConfig,
  leadType: LeadType,
  now: Date | number | string = Date.now()
): LeadCaptureAvailability {
  const window = event.leadCaptureWindows?.[leadType];
  const opensAt = window?.opensAt ?? null;
  const configuredClosesAt = window?.closesAt ?? event.startsAt;

  if (!event.pageReady) {
    return closedAvailability(event, "page_not_ready", opensAt, configuredClosesAt);
  }

  if (!event.leadCapture[leadType]) {
    return closedAvailability(event, "lead_type_disabled", opensAt, configuredClosesAt);
  }

  if (!statusAllowsLeadType(event.status, leadType)) {
    return closedAvailability(event, "status_closed", opensAt, configuredClosesAt);
  }

  const nowMs = normalizeNow(now);
  const startsAtMs = parseTimestamp(event.startsAt);
  if (nowMs === null || startsAtMs === null) {
    return closedAvailability(event, "invalid_event_time", opensAt, configuredClosesAt);
  }

  if (nowMs >= startsAtMs) {
    return closedAvailability(event, "event_started", opensAt, event.startsAt);
  }

  const opensAtMs = opensAt ? parseTimestamp(opensAt) : null;
  const configuredClosesAtMs = window?.closesAt ? parseTimestamp(window.closesAt) : null;

  if ((opensAt && opensAtMs === null) || (window?.closesAt && configuredClosesAtMs === null)) {
    return closedAvailability(event, "invalid_window", opensAt, configuredClosesAt);
  }

  const effectiveClosesAtMs = Math.min(configuredClosesAtMs ?? startsAtMs, startsAtMs);
  const effectiveClosesAt = new Date(effectiveClosesAtMs).toISOString();

  if (opensAtMs !== null && opensAtMs >= effectiveClosesAtMs) {
    return closedAvailability(event, "invalid_window", opensAt, effectiveClosesAt);
  }

  if (opensAtMs !== null && nowMs < opensAtMs) {
    return closedAvailability(event, "window_not_open", opensAt, effectiveClosesAt);
  }

  if (nowMs >= effectiveClosesAtMs) {
    return closedAvailability(event, "window_closed", opensAt, effectiveClosesAt);
  }

  return {
    open: true,
    reason: "open",
    eventStartsAt: event.startsAt,
    opensAt,
    closesAt: effectiveClosesAt,
  };
}

function enrichLifecycle(event: EventLifecycleConfig): EventLifecycle {
  return {
    ...event,
    registrationOpen: evaluateLeadCaptureAvailability(event, "attendee").open,
  };
}

export function listEventLifecycles(): EventLifecycle[] {
  return (Object.values(eventRegistry) as EventLifecycleConfig[]).map(enrichLifecycle);
}

export function getEventLifecycle(eventId: string): EventLifecycle | null {
  const event = eventRegistry[eventId as EventId] as EventLifecycleConfig | undefined;
  return event ? enrichLifecycle(event) : null;
}

export function getEventLifecycleBySlug(slug: string): EventLifecycle | null {
  const event = (Object.values(eventRegistry) as EventLifecycleConfig[]).find(
    (candidate) => candidate.slug === slug
  );
  return event ? enrichLifecycle(event) : null;
}

export function getLeadCaptureAvailability(
  eventId: string,
  leadType: LeadType,
  now: Date | number | string = Date.now()
): LeadCaptureAvailability | null {
  const event = eventRegistry[eventId as EventId] as EventLifecycleConfig | undefined;
  return event ? evaluateLeadCaptureAvailability(event, leadType, now) : null;
}

export function isLeadCaptureOpenAt(
  eventId: string,
  leadType: LeadType,
  now: Date | number | string = Date.now()
) {
  return getLeadCaptureAvailability(eventId, leadType, now)?.open ?? false;
}

export function isLeadCaptureOpen(eventId: string, leadType: LeadType) {
  return isLeadCaptureOpenAt(eventId, leadType);
}

export function isRegistrationOpen(eventId: string) {
  return isLeadCaptureOpenAt(eventId, "attendee");
}
