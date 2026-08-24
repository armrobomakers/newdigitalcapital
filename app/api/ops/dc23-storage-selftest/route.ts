import { NextResponse } from "next/server";

import {
  buildLeadEnvelope,
  deliverPrimaryLead,
  isValidLeadStorageSecret,
  resolveLeadStorageTransport,
} from "@/lib/lead-delivery";

const SELF_TEST_EXPIRES_AT = Date.parse("2026-08-24T08:30:00.000Z");
const SELF_TEST_REQUEST_ID = "dc23-prod-storage-selftest-20260824-v1";

function response(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  if (process.env.VERCEL_ENV !== "production") {
    return response({ ok: false, error: "production_only" }, 404);
  }

  if (Date.now() >= SELF_TEST_EXPIRES_AT) {
    return response({ ok: false, error: "self_test_expired" }, 410);
  }

  const url = process.env.LEAD_STORAGE_WEBHOOK_URL?.trim() ?? "";
  const secret = process.env.LEAD_STORAGE_WEBHOOK_SECRET?.trim() ?? "";
  const transport = resolveLeadStorageTransport();

  if (!url || !isValidLeadStorageSecret(secret) || !transport) {
    return response({ ok: false, error: "storage_configuration_incomplete" }, 503);
  }

  const envelope = buildLeadEnvelope(
    {
      event_id: "ekb-2026-09-26",
      lead_type: "attendee",
      ticket: "standard-1000",
      name: "DC23 Synthetic Storage Test",
      contact: "synthetic",
      email: "dc23-synthetic@example.invalid",
      phone: "+70000000000",
      company: "Digital Capital Self Test",
      privacy_consent: true,
      marketing_consent: false,
      utm_source: "dc23_selftest",
      utm_medium: "ops",
      utm_campaign: "production_storage_acceptance",
      utm_content: "fixed_synthetic_payload",
      utm_term: "",
    },
    SELF_TEST_REQUEST_ID,
    "2026-08-24T07:30:00.000Z"
  );

  try {
    const first = await deliverPrimaryLead({ url, secret, envelope, transport });
    const duplicate = await deliverPrimaryLead({ url, secret, envelope, transport });

    if (duplicate.duplicate !== true) {
      return response({ ok: false, error: "duplicate_ack_missing" }, 502);
    }

    const conflictEnvelope = {
      ...envelope,
      ticket: "business-3000",
    };

    let conflictRejected = false;
    try {
      await deliverPrimaryLead({ url, secret, envelope: conflictEnvelope, transport });
    } catch (error) {
      conflictRejected =
        error instanceof Error && error.message === "primary_storage_invalid_ack";
    }

    if (!conflictRejected) {
      return response({ ok: false, error: "idempotency_conflict_not_rejected" }, 502);
    }

    return response({
      ok: true,
      request_id: SELF_TEST_REQUEST_ID,
      first_duplicate: first.duplicate === true,
      duplicate_confirmed: true,
      conflict_rejected: true,
      transport,
      expires_at: new Date(SELF_TEST_EXPIRES_AT).toISOString(),
    });
  } catch (error) {
    return response(
      {
        ok: false,
        error: error instanceof Error ? error.message : "storage_self_test_failed",
      },
      502
    );
  }
}
