import {
  eventRegistry,
  getEventLifecycle,
  getEventLifecycleBySlug,
  listEventLifecycles,
  validateEventLifecycleConfig,
  type EventLifecycle,
  type EventLifecycleConfig,
  type EventLifecycleStatus,
} from "@/data/event-registry";
import {
  eventContentCatalog,
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

function parseTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function findDuplicateValues(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  }

  return [...duplicates].sort();
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

export function getPrimaryConference(): ConferenceRecord | null {
  const priority: EventLifecycleStatus[] = ["sales", "scheduled", "sold_out", "past", "draft"];
  const conferences = listPageReadyConferences();

  for (const status of priority) {
    const match = conferences
      .filter((conference) => conference.lifecycle.status === status)
      .sort(
        (left, right) => Date.parse(right.lifecycle.startsAt) - Date.parse(left.lifecycle.startsAt)
      )[0];

    if (match) {
      return match;
    }
  }

  return null;
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

  for (const [key, lifecycle] of Object.entries(eventRegistry) as Array<
    [string, EventLifecycleConfig]
  >) {
    if (key !== lifecycle.id) {
      errors.push(`lifecycle_key_mismatch:${key}:${lifecycle.id}`);
    }
  }

  for (const [key, content] of Object.entries(eventContentCatalog)) {
    if (key !== content.eventId) {
      errors.push(`content_key_mismatch:${key}:${content.eventId}`);
    }
  }

  for (const slug of findDuplicateValues(
    (Object.values(eventRegistry) as EventLifecycleConfig[]).map((event) => event.slug)
  )) {
    errors.push(`duplicate_lifecycle_slug:${slug}`);
  }

  for (const slug of findDuplicateValues(Object.values(eventContentCatalog).map((event) => event.slug))) {
    errors.push(`duplicate_content_slug:${slug}`);
  }

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

  for (const lifecycle of listEventLifecycles()) {
    const lifecycleErrors = validateEventLifecycleConfig(lifecycle).filter(
      (error) =>
        ![
          "invalid_starts_at",
          "invalid_lead_window_open",
          "invalid_lead_window_close",
          "invalid_lead_window_order",
          "lead_window_after_event_start",
        ].includes(error)
    );

    for (const error of lifecycleErrors) {
      errors.push(`${error}:${lifecycle.id}`);
    }

    const startsAtMs = parseTimestamp(lifecycle.startsAt);
    if (startsAtMs === null) {
      errors.push(`invalid_starts_at:${lifecycle.id}`);
      continue;
    }

    for (const [leadType, window] of Object.entries(lifecycle.leadCaptureWindows ?? {})) {
      if (!window) {
        continue;
      }

      const opensAtMs = window.opensAt ? parseTimestamp(window.opensAt) : null;
      const closesAtMs = window.closesAt ? parseTimestamp(window.closesAt) : null;

      if (window.opensAt && opensAtMs === null) {
        errors.push(`invalid_lead_window_open:${lifecycle.id}:${leadType}`);
      }
      if (window.closesAt && closesAtMs === null) {
        errors.push(`invalid_lead_window_close:${lifecycle.id}:${leadType}`);
      }
      if (opensAtMs !== null && closesAtMs !== null && opensAtMs >= closesAtMs) {
        errors.push(`invalid_lead_window_order:${lifecycle.id}:${leadType}`);
      }
      if (closesAtMs !== null && closesAtMs > startsAtMs) {
        errors.push(`lead_window_after_event_start:${lifecycle.id}:${leadType}`);
      }
    }
  }

  return [...new Set(errors)];
}

export function assertConferenceCatalog() {
  const errors = validateConferenceCatalog();
  if (errors.length > 0) {
    throw new Error(`conference_catalog_invalid:${errors.join(",")}`);
  }
}

// Fail fast in every environment, including previews with indexing disabled.
assertConferenceCatalog();
