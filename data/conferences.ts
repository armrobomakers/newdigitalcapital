import {
  getEventLifecycle,
  getEventLifecycleBySlug,
  listEventLifecycles,
  type EventLifecycle,
} from "@/data/event-registry";
import {
  getEventContent,
  getEventContentBySlug,
  listEventContent,
  type EventData,
} from "@/data/events";

export type ConferenceRecord = {
  lifecycle: EventLifecycle;
  content: EventData;
};

export type ConferenceIntegrityRecord = {
  eventId: string;
  slug: string;
  lifecycleReady: boolean;
  contentReady: boolean;
  consistent: boolean;
};

function isConsistent(lifecycle: EventLifecycle, content: EventData) {
  return lifecycle.id === content.eventId && lifecycle.slug === content.slug;
}

export function getConferenceById(eventId: string): ConferenceRecord | null {
  const lifecycle = getEventLifecycle(eventId);
  const content = getEventContent(eventId);
  if (!lifecycle || !content || !isConsistent(lifecycle, content)) {
    return null;
  }

  return { lifecycle, content };
}

export function getConferenceBySlug(slug: string): ConferenceRecord | null {
  const lifecycle = getEventLifecycleBySlug(slug);
  const content = getEventContentBySlug(slug);
  if (!lifecycle || !content || !isConsistent(lifecycle, content)) {
    return null;
  }

  return { lifecycle, content };
}

export function listConferences(): ConferenceRecord[] {
  return listEventLifecycles()
    .map((lifecycle) => getConferenceById(lifecycle.id))
    .filter((conference): conference is ConferenceRecord => Boolean(conference));
}

export function listPageReadyConferences(): ConferenceRecord[] {
  return listConferences().filter((conference) => conference.lifecycle.pageReady);
}

export function getConferenceIntegrity(): ConferenceIntegrityRecord[] {
  const lifecycleById = new Map(listEventLifecycles().map((event) => [event.id, event]));
  const contentById = new Map(listEventContent().map((event) => [event.eventId, event]));
  const ids = new Set([...lifecycleById.keys(), ...contentById.keys()]);

  return [...ids].map((eventId) => {
    const lifecycle = lifecycleById.get(eventId);
    const content = contentById.get(eventId);
    const slug = lifecycle?.slug ?? content?.slug ?? "";
    const lifecycleReady = Boolean(lifecycle);
    const contentReady = Boolean(content);
    const consistent = Boolean(lifecycle && content && isConsistent(lifecycle, content));

    return {
      eventId,
      slug,
      lifecycleReady,
      contentReady,
      consistent,
    };
  });
}

export function validateConferenceCatalog() {
  const errors: string[] = [];

  for (const record of getConferenceIntegrity()) {
    if (!record.lifecycleReady) {
      errors.push(`missing_lifecycle:${record.eventId}`);
    }
    if (!record.contentReady) {
      errors.push(`missing_content:${record.eventId}`);
    }
    if (record.lifecycleReady && record.contentReady && !record.consistent) {
      errors.push(`id_or_slug_mismatch:${record.eventId}`);
    }
  }

  return errors;
}

export function assertConferenceCatalog() {
  const errors = validateConferenceCatalog();
  if (errors.length > 0) {
    throw new Error(`conference_catalog_invalid:${errors.join(",")}`);
  }
}
