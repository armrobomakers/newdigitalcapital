import { getLeadCaptureAvailability } from "@/data/event-registry";
import { listConferences, validateConferenceCatalog } from "@/data/conferences";
import { getEventSeoConfig } from "@/data/event-seo";
import { evaluateLaunchReadiness } from "@/lib/launch-readiness-core";
import { isValidLeadStorageSecret } from "@/lib/lead-delivery";
import { isLegalConfigReady } from "@/lib/legal";

export type { LaunchBlocker, LaunchWarning } from "@/lib/launch-readiness-core";

function isBrandedSiteUrl(siteUrl: string) {
  return Boolean(
    siteUrl &&
      !siteUrl.includes("localhost") &&
      !siteUrl.includes("127.0.0.1") &&
      !siteUrl.includes("vercel.app")
  );
}

function getConfiguredSalesConference() {
  return (
    listConferences()
      .filter(
        ({ lifecycle }) =>
          lifecycle.pageReady && lifecycle.status === "sales" && lifecycle.leadCapture.attendee
      )
      .sort(
        (left, right) => Date.parse(left.lifecycle.startsAt) - Date.parse(right.lifecycle.startsAt)
      )[0] ?? null
  );
}

export function getLaunchReadinessSnapshot() {
  const salesConference = getConfiguredSalesConference();
  const leadStorageReady = Boolean(process.env.LEAD_STORAGE_WEBHOOK_URL?.trim());
  const leadStorageSecret = process.env.LEAD_STORAGE_WEBHOOK_SECRET?.trim() ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

  const salesEvent = salesConference
    ? {
        id: salesConference.lifecycle.id,
        slug: salesConference.lifecycle.slug,
        startsAt: salesConference.lifecycle.startsAt,
        attendeeCapture: getLeadCaptureAvailability(salesConference.lifecycle.id, "attendee"),
        locationVerified: salesConference.content.location.verified,
        emailPresent: Boolean(salesConference.content.contacts.email.trim()),
        phonePresent: Boolean(salesConference.content.contacts.phone.trim()),
        speakersCount: salesConference.content.speakers.length,
        programCount: salesConference.content.program.length,
        structuredDataReady: getEventSeoConfig(salesConference.lifecycle.id).structuredDataReady,
        partnersCount: salesConference.content.partners.length,
        socialsCount: salesConference.content.socials.length,
      }
    : null;

  return evaluateLaunchReadiness({
    catalogErrors: validateConferenceCatalog(),
    salesEvent,
    legalReady: isLegalConfigReady(),
    leadStorageReady,
    leadStorageSecretReady: leadStorageReady && isValidLeadStorageSecret(leadStorageSecret),
    analyticsReady: Boolean(process.env.ANALYTICS_WEBHOOK_URL?.trim()),
    brandedSiteUrlReady: isBrandedSiteUrl(siteUrl),
    indexingEnabled: process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true",
  });
}
