export type EventOperationalDetails = {
  hall: string;
  entryInstructions: string;
};

const eventOperationalDetails: Record<string, EventOperationalDetails> = {
  "ekb-2026-09-26": {
    hall: "TODO_EVENT_HALL",
    entryInstructions: "TODO_ENTRY_INSTRUCTIONS",
  },
};

export function getEventOperationalDetails(eventId: string): EventOperationalDetails | null {
  return eventOperationalDetails[eventId] ?? null;
}
