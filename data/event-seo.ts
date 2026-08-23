export type EventSeoConfig =
  | {
      structuredDataReady: false;
    }
  | {
      structuredDataReady: true;
      startDate: string;
      endDate: string;
      venueName: string;
      streetAddress: string;
      addressLocality: string;
      addressCountry: string;
      price: string;
      priceCurrency: string;
      organizerName: string;
      organizerUrl: string;
    };

const eventSeoRegistry: Record<string, EventSeoConfig> = {
  "ekb-2026-06-13": {
    structuredDataReady: false,
  },
  "ekb-2026-09-26": {
    structuredDataReady: false,
  },
};

export function getEventSeoConfig(eventId: string): EventSeoConfig {
  return eventSeoRegistry[eventId] ?? { structuredDataReady: false };
}
