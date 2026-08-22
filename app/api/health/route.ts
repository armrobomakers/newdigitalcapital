import { NextResponse } from "next/server";

import { getConferenceIntegrity, listConferences } from "@/data/conferences";
import { isLegalConfigReady } from "@/lib/legal";

export const dynamic = "force-dynamic";

export async function GET() {
  const integrity = getConferenceIntegrity();
  const catalogReady = integrity.length > 0 && integrity.every((record) => record.consistent);
  const events = listConferences().map(({ lifecycle, content }) => ({
    id: lifecycle.id,
    slug: lifecycle.slug,
    name: content.name,
    city: content.cityLabel,
    status: lifecycle.status,
    page_ready: lifecycle.pageReady,
    lead_capture: lifecycle.leadCapture,
    starts_at: lifecycle.startsAt,
  }));

  const legalReady = isLegalConfigReady();
  const leadStorageReady = Boolean(process.env.LEAD_STORAGE_WEBHOOK_URL);
  const analyticsReady = Boolean(process.env.ANALYTICS_WEBHOOK_URL);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const brandedSiteUrl = Boolean(
    siteUrl && !siteUrl.includes("localhost") && !siteUrl.includes("vercel.app")
  );
  const indexingEnabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";
  const salesEventAvailable = events.some(
    (event) => event.page_ready && event.status === "sales" && event.lead_capture.attendee
  );
  const partnerLeadAvailable = events.some(
    (event) => event.page_ready && event.status !== "past" && event.lead_capture.partner
  );

  const readiness = {
    conference_catalog_ready: catalogReady,
    legal_ready: legalReady,
    lead_storage_ready: leadStorageReady,
    analytics_ready: analyticsReady,
    branded_site_url: brandedSiteUrl,
    indexing_enabled: indexingEnabled,
    sales_event_available: salesEventAvailable,
    partner_lead_available: partnerLeadAvailable,
    ready_for_registration:
      catalogReady && legalReady && leadStorageReady && salesEventAvailable,
    ready_for_paid_traffic:
      catalogReady &&
      legalReady &&
      leadStorageReady &&
      analyticsReady &&
      brandedSiteUrl &&
      indexingEnabled &&
      salesEventAvailable,
  };

  return NextResponse.json(
    {
      service: "digitalcapital",
      status: readiness.ready_for_registration ? "ready" : "gated",
      readiness,
      conference_catalog: integrity,
      events,
      checked_at: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
