export type EventLifecycleStatus = "draft" | "scheduled" | "sales" | "sold_out" | "past";
export type LeadType = "attendee" | "partner" | "speaker" | "media";

export type LeadCaptureRules = Record<LeadType, boolean>;

export type EventLifecycle = {
  id: string;
  slug: string;
  status: EventLifecycleStatus;
  startsAt: string;
  pageReady: boolean;
  leadCapture: LeadCaptureRules;
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
} as const satisfies Record<string, EventLifecycle>;

export type EventId = keyof typeof eventRegistry;

export function getEventLifecycle(eventId: string): EventLifecycle | null {
  return eventRegistry[eventId as EventId] ?? null;
}

export function getEventLifecycleBySlug(slug: string): EventLifecycle | null {
  return Object.values(eventRegistry).find((event) => event.slug === slug) ?? null;
}

export function isLeadCaptureOpen(eventId: string, leadType: LeadType) {
  const event = getEventLifecycle(eventId);
  if (!event || !event.pageReady) {
    return false;
  }

  if (leadType === "attendee") {
    return Boolean(event.leadCapture.attendee && event.status === "sales");
  }

  return Boolean(event.leadCapture[leadType] && event.status !== "past");
}

export function isRegistrationOpen(eventId: string) {
  return isLeadCaptureOpen(eventId, "attendee");
}
