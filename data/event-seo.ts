export type EventSeoFields = {
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

export type EventSeoConfig =
  | {
      structuredDataReady: false;
      draft?: Partial<EventSeoFields>;
    }
  | ({
      structuredDataReady: true;
    } & EventSeoFields);

const eventSeoRegistry: Record<string, EventSeoConfig> = {
  "ekb-2026-06-13": {
    structuredDataReady: false,
  },
  "ekb-2026-09-26": {
    structuredDataReady: false,
    draft: {
      startDate: "2026-09-26T12:00:00+05:00",
      endDate: "2026-09-26T17:00:00+05:00",
      venueName: "БЦ «Саммит»",
      streetAddress: "ул. 8 Марта, 51",
      addressLocality: "Екатеринбург",
      addressCountry: "RU",
      price: "1000",
      priceCurrency: "RUB",
      organizerName: "ООО «Родственные Души»",
      organizerUrl: "TODO_BRANDED_SITE_URL",
    },
  },
};

export function getEventSeoConfig(eventId: string): EventSeoConfig {
  return eventSeoRegistry[eventId] ?? { structuredDataReady: false };
}
