import { NextResponse } from "next/server";

import { eventRegistry } from "@/data/event-registry";
import { isLegalConfigReady } from "@/lib/legal";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = Object.values(eventRegistry).map((event) => ({
    id: event.id,
    slug: event.slug,
    status: event.status,
    registration_open: event.registrationOpen,
    starts_at: event.startsAt,
  }));

  const legalReady = isLegalConfigReady();
  const leadStorageReady = Boolean(process.env.LEAD_STORAGE_WEBHOOK_URL);
  const analyticsReady = Boolean(process.env.ANALYTICS_WEBHOOK_URL);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const brandedSiteUrl = Boolean(siteUrl && !siteUrl.includes("localhost") && !siteUrl.includes("vercel.app"));
  const indexingEnabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";
  const salesEventAvailable = events.some(
    (event) => event.status === "sales" && event.registration_open
  );

  const readiness = {
    legal_ready: legalReady,
    lead_storage_ready: leadStorageReady,
    analytics_ready: analyticsReady,
    branded_site_url: brandedSiteUrl,
    indexing_enabled: indexingEnabled,
    sales_event_available: salesEventAvailable,
    ready_for_registration: legalReady && leadStorageReady && salesEventAvailable,
    ready_for_paid_traffic:
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
