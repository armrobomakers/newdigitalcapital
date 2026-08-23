const assert = require("node:assert/strict");

const modulePath = process.argv[2];
if (!modulePath) {
  throw new Error("compiled launch-readiness-core module path is required");
}

const { evaluateLaunchReadiness } = require(modulePath);

const openCapture = {
  open: true,
  reason: "open",
  eventStartsAt: "2026-11-14T12:00:00+03:00",
  opensAt: "2026-10-01T09:00:00+03:00",
  closesAt: "2026-11-14T09:00:00.000Z",
};

const readySalesEvent = {
  id: "future-test",
  slug: "future",
  startsAt: "2026-11-14T12:00:00+03:00",
  attendeeCapture: openCapture,
  locationVerified: true,
  emailPresent: true,
  phonePresent: true,
  speakersCount: 3,
  programCount: 6,
  structuredDataReady: true,
  partnersCount: 2,
  socialsCount: 2,
};

const readyInput = {
  catalogErrors: [],
  salesEvent: readySalesEvent,
  legalReady: true,
  leadStorageReady: true,
  leadStorageSecretReady: true,
  analyticsReady: true,
  brandedSiteUrlReady: true,
  indexingEnabled: true,
};

function codes(items) {
  return items.map((item) => item.code);
}

function expectCode(items, code) {
  assert.ok(codes(items).includes(code), `expected blocker ${code}; got ${codes(items).join(",")}`);
}

{
  const result = evaluateLaunchReadiness(readyInput);
  assert.equal(result.registration_ready, true);
  assert.equal(result.paid_traffic_ready, true);
  assert.deepEqual(result.registration_blockers, []);
  assert.deepEqual(result.paid_traffic_blockers, []);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.active_sales_event.id, "future-test");
}

{
  const result = evaluateLaunchReadiness({ ...readyInput, salesEvent: null });
  expectCode(result.registration_blockers, "sales_event_missing");
  expectCode(result.paid_traffic_blockers, "sales_event_missing");
}

{
  const result = evaluateLaunchReadiness({
    ...readyInput,
    catalogErrors: ["missing_content:future-test"],
  });
  expectCode(result.registration_blockers, "conference_catalog_invalid");
  expectCode(result.paid_traffic_blockers, "conference_catalog_invalid");
}

for (const [reason, blocker] of [
  ["window_not_open", "registration_window_not_open"],
  ["window_closed", "registration_window_closed"],
  ["event_started", "sales_event_started"],
  ["invalid_event_time", "registration_window_invalid"],
  ["invalid_window", "registration_window_invalid"],
  ["page_not_ready", "registration_configuration_closed"],
  ["lead_type_disabled", "registration_configuration_closed"],
  ["status_closed", "registration_configuration_closed"],
]) {
  const result = evaluateLaunchReadiness({
    ...readyInput,
    salesEvent: {
      ...readySalesEvent,
      attendeeCapture: { ...openCapture, open: false, reason },
    },
  });
  expectCode(result.registration_blockers, blocker);
  expectCode(result.paid_traffic_blockers, blocker);
}

{
  const result = evaluateLaunchReadiness({
    ...readyInput,
    salesEvent: {
      ...readySalesEvent,
      locationVerified: false,
      emailPresent: false,
      phonePresent: false,
      speakersCount: 0,
      programCount: 0,
      structuredDataReady: false,
      partnersCount: 0,
      socialsCount: 0,
    },
  });

  for (const code of [
    "venue_unverified",
    "event_email_missing",
    "event_phone_missing",
    "speakers_missing",
    "program_missing",
  ]) {
    expectCode(result.registration_blockers, code);
    expectCode(result.paid_traffic_blockers, code);
  }
  expectCode(result.paid_traffic_blockers, "structured_data_not_ready");
  expectCode(result.warnings, "partners_empty");
  expectCode(result.warnings, "social_links_empty");
}

{
  const result = evaluateLaunchReadiness({
    ...readyInput,
    legalReady: false,
    leadStorageReady: false,
    analyticsReady: false,
    brandedSiteUrlReady: false,
    indexingEnabled: false,
  });

  expectCode(result.registration_blockers, "legal_config_incomplete");
  expectCode(result.registration_blockers, "lead_storage_unavailable");
  expectCode(result.paid_traffic_blockers, "analytics_unavailable");
  expectCode(result.paid_traffic_blockers, "branded_domain_missing");
  expectCode(result.paid_traffic_blockers, "indexing_disabled");
}

{
  const result = evaluateLaunchReadiness({
    ...readyInput,
    leadStorageSecretReady: false,
  });
  expectCode(result.registration_blockers, "lead_storage_signature_missing");
  expectCode(result.paid_traffic_blockers, "lead_storage_signature_missing");
}

console.log("Launch readiness core matrix: PASS");
