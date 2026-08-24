import type { EventData } from "@/data/events";
import { getEventSeoConfig } from "@/data/event-seo";
import { isBrandedPublicUrl } from "@/lib/config-values";

export function EventStructuredData({ eventData }: { eventData: EventData }) {
  const config = getEventSeoConfig(eventData.eventId);
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

  if (
    !config.structuredDataReady ||
    !isBrandedPublicUrl(configuredSiteUrl) ||
    !isBrandedPublicUrl(config.organizerUrl)
  ) {
    return null;
  }

  const siteUrl = configuredSiteUrl.replace(/\/$/, "");
  const eventUrl = `${siteUrl}/${eventData.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: eventData.name,
    description: eventData.subtitle,
    image: [`${siteUrl}${eventData.assets.heroImage}`],
    url: eventUrl,
    startDate: config.startDate,
    endDate: config.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: config.venueName,
      address: {
        "@type": "PostalAddress",
        streetAddress: config.streetAddress,
        addressLocality: config.addressLocality,
        addressCountry: config.addressCountry,
      },
    },
    offers: {
      "@type": "Offer",
      url: eventUrl,
      price: config.price,
      priceCurrency: config.priceCurrency,
      availability: "https://schema.org/InStock",
    },
    organizer: {
      "@type": "Organization",
      name: config.organizerName,
      url: config.organizerUrl,
    },
    performer: eventData.speakers.map((speaker) => ({
      "@type": "Person",
      name: speaker.name,
    })),
  };

  const serialized = JSON.stringify(schema).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} />;
}
