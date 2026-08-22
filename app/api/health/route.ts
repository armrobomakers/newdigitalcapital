import { NextResponse } from "next/server";

import { getConferenceIntegrity, listConferences } from "@/data/conferences";
import { getEventSeoConfig } from "@/data/event-seo";
import { getLaunchReadinessSnapshot } from "@/lib/launch-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const integrity = getConferenceIntegrity();
  const launch = getLaunchReadinessSnapshot();
  const events = listConferences().map(({ lifecycle, content }) => ({
    id: lifecycle.id,
    slug: lifecycle.slug,
    name: content.name,
    city: content.cityLabel,
    status: lifecycle.status,
    page_ready: lifecycle.pageReady,
    location_verified: content.location.verified,
    contacts_ready: Boolean(content.contacts.email.trim() && content.contacts.phone.trim()),
    structured_data_ready: getEventSeoConfig(lifecycle.id).structuredDataReady,
    lead_capture: lifecycle.leadCapture,
    starts_at: lifecycle.startsAt,
  }));

  return NextResponse.json(
    {
      service: "digitalcapital",
      status: launch.registration_ready ? "ready" : "gated",
      readiness: {
        ready_for_registration: launch.registration_ready,
        ready_for_paid_traffic: launch.paid_traffic_ready,
      },
      blockers: {
        registration: launch.registration_blockers,
        paid_traffic: launch.paid_traffic_blockers,
      },
      warnings: launch.warnings,
      active_sales_event: launch.active_sales_event,
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
