export type EventLifecycleStatus = "draft" | "scheduled" | "sales" | "sold_out" | "past";

export type EventLifecycle = {
  id: string;
  slug: string;
  status: EventLifecycleStatus;
  startsAt: string;
  registrationOpen: boolean;
};

export const eventRegistry = {
  "ekb-2026-06-13": {
    id: "ekb-2026-06-13",
    slug: "ekb",
    status: "past",
    startsAt: "2026-06-13T12:00:00+05:00",
    registrationOpen: false,
  },
} as const satisfies Record<string, EventLifecycle>;

export type EventId = keyof typeof eventRegistry;

export function getEventLifecycle(eventId: string): EventLifecycle | null {
  return eventRegistry[eventId as EventId] ?? null;
}

export function isRegistrationOpen(eventId: string) {
  const event = getEventLifecycle(eventId);
  return Boolean(event?.registrationOpen && event.status === "sales");
}
