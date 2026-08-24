import { getLeadCaptureAvailability } from "@/data/event-registry";
import { listConferences, validateConferenceCatalog } from "@/data/conferences";
import { getEventSeoConfig } from "@/data/event-seo";
import {
  isBrandedPublicUrl,
  isResolvedConfigValue,
  isSecureWebhookUrl,
} from "@/lib/config-values";
import { evaluateLaunchReadiness } from "@/lib/launch-readiness-core";
import {
  isValidLeadStorageSecret,
  resolveLeadStorageTransport,
} from "@/lib/lead-delivery";
import { isLegalConfigReady } from "@/lib/legal";

export type { LaunchBlocker, LaunchWarning } from "@/lib/launch-readiness-core";

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
  const leadStorageTransportReady = resolveLeadStorageTransport() !== null;
  const leadStorageUrl = process.env.LEAD_STORAGE_WEBHOOK_URL?.trim() ?? "";
  const leadStorageReady = isSecureWebhookUrl(leadStorageUrl) && leadStorageTransportReady;
  const leadStorageSecret = process.env.LEAD_STORAGE_WEBHOOK_SECRET?.trim() ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

  const salesEvent = salesConference
    ? {
        id: salesConference.lifecycle.id,
        slug: salesConference.lifecycle.slug,
        startsAt: salesConference.lifecycle.startsAt,
        attendeeCapture: getLeadCaptureAvailability(salesConference.lifecycle.id, "attendee"),
        locationVerified: salesConference.content.location.verified,
        emailPresent: isResolvedConfigValue(salesConference.content.contacts.email),
        phonePresent: isResolvedConfigValue(salesConference.content.contacts.phone),
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
    analyticsReady: isSecureWebhookUrl(process.env.ANALYTICS_WEBHOOK_URL),
    brandedSiteUrlReady: isBrandedPublicUrl(siteUrl),
    indexingEnabled: process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true",
  });
}
