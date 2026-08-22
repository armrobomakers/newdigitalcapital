export type EventLifecycleStatus = "draft" | "scheduled" | "sales" | "sold_out" | "past";
export type LeadType = "attendee" | "partner" | "speaker" | "media";

export type LeadCaptureRules = Record<LeadType, boolean>;

type StoredEventLifecycle = {
  id: string;
  slug: string;
  status: EventLifecycleStatus;
  startsAt: string;
  pageReady: boolean;
  leadCapture: LeadCaptureRules;
};

export type EventLifecycle = StoredEventLifecycle & {
  registrationOpen: boolean;
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
} as const satisfies Record<string, StoredEventLifecycle>;

export type EventId = keyof typeof eventRegistry;

function enrichLifecycle(event: StoredEventLifecycle): EventLifecycle {
  return {
    ...event,
    registrationOpen: Boolean(
      event.pageReady && event.leadCapture.attendee && event.status === "sales"
    ),
  };
}

export function listEventLifecycles(): EventLifecycle[] {
  return (Object.values(eventRegistry) as StoredEventLifecycle[]).map(enrichLifecycle);
}

export function getEventLifecycle(eventId: string): EventLifecycle | null {
  const event = eventRegistry[eventId as EventId] as StoredEventLifecycle | undefined;
  return event ? enrichLifecycle(event) : null;
}

export function getEventLifecycleBySlug(slug: string): EventLifecycle | null {
  const event = (Object.values(eventRegistry) as StoredEventLifecycle[]).find(
    (candidate) => candidate.slug === slug
  );
  return event ? enrichLifecycle(event) : null;
}

export function isLeadCaptureOpen(eventId: string, leadType: LeadType) {
  const event = getEventLifecycle(eventId);
  if (!event || !event.pageReady) {
    return false;
  }

  if (leadType === "attendee") {
    return event.registrationOpen;
  }

  return Boolean(event.leadCapture[leadType] && event.status !== "past");
}

export function isRegistrationOpen(eventId: string) {
  return isLeadCaptureOpen(eventId, "attendee");
}
