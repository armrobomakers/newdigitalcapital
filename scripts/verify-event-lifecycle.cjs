const assert = require("node:assert/strict");

const modulePath = process.argv[2];
if (!modulePath) {
  throw new Error("compiled event-registry module path is required");
}

const {
  evaluateLeadCaptureAvailability,
  validateEventLifecycleConfig,
} = require(modulePath);

const noLeads = {
  attendee: false,
  partner: false,
  speaker: false,
  media: false,
};

const base = {
  id: "future-test",
  slug: "future",
  status: "scheduled",
  startsAt: "2026-11-14T12:00:00+03:00",
  pageReady: true,
  leadCapture: { ...noLeads },
};

function expectErrors(event, expected) {
  assert.deepEqual(validateEventLifecycleConfig(event).sort(), [...expected].sort());
}

expectErrors({ ...base, status: "draft", pageReady: false }, []);
expectErrors({
  ...base,
  status: "scheduled",
  leadCapture: { ...noLeads, partner: true, speaker: true },
}, []);
expectErrors({
  ...base,
  status: "sales",
  leadCapture: { ...noLeads, attendee: true },
}, []);
expectErrors({
  ...base,
  status: "sold_out",
  leadCapture: { ...noLeads, partner: true },
}, []);
expectErrors({ ...base, status: "past" }, []);

expectErrors(
  { ...base, id: "" },
  ["id_missing"]
);
expectErrors(
  { ...base, slug: "" },
  ["slug_missing"]
);
expectErrors(
  { ...base, startsAt: "not-a-date" },
  ["invalid_starts_at"]
);
expectErrors(
  {
    ...base,
    status: "draft",
    pageReady: false,
    leadCapture: { ...noLeads, partner: true },
  },
  ["draft_lead_capture_enabled"]
);
expectErrors(
  {
    ...base,
    status: "scheduled",
    leadCapture: { ...noLeads, attendee: true },
  },
  ["scheduled_attendee_capture_enabled"]
);
expectErrors(
  {
    ...base,
    status: "sales",
    pageReady: false,
    leadCapture: { ...noLeads, attendee: true },
  },
  ["sales_page_not_ready"]
);
expectErrors(
  { ...base, status: "sales" },
  ["sales_attendee_capture_disabled"]
);
expectErrors(
  {
    ...base,
    status: "sold_out",
    leadCapture: { ...noLeads, attendee: true },
  },
  ["sold_out_attendee_capture_enabled"]
);
expectErrors(
  {
    ...base,
    status: "past",
    leadCapture: { ...noLeads, media: true },
  },
  ["past_lead_capture_enabled"]
);

expectErrors(
  {
    ...base,
    leadCaptureWindows: { attendee: { opensAt: "bad-date" } },
  },
  ["invalid_lead_window_open"]
);
expectErrors(
  {
    ...base,
    leadCaptureWindows: { attendee: { closesAt: "bad-date" } },
  },
  ["invalid_lead_window_close"]
);
expectErrors(
  {
    ...base,
    leadCaptureWindows: {
      attendee: {
        opensAt: "2026-11-14T10:00:00+03:00",
        closesAt: "2026-11-14T09:00:00+03:00",
      },
    },
  },
  ["invalid_lead_window_order"]
);
expectErrors(
  {
    ...base,
    leadCaptureWindows: {
      attendee: { closesAt: "2026-11-14T13:00:00+03:00" },
    },
  },
  ["lead_window_after_event_start"]
);

const sales = {
  ...base,
  status: "sales",
  leadCapture: { ...noLeads, attendee: true },
  leadCaptureWindows: {
    attendee: {
      opensAt: "2026-11-01T09:00:00+03:00",
      closesAt: "2026-11-14T11:00:00+03:00",
    },
  },
};

assert.equal(
  evaluateLeadCaptureAvailability(sales, "attendee", "2026-10-31T12:00:00+03:00").reason,
  "window_not_open"
);
assert.equal(
  evaluateLeadCaptureAvailability(sales, "attendee", "2026-11-10T12:00:00+03:00").reason,
  "open"
);
assert.equal(
  evaluateLeadCaptureAvailability(sales, "attendee", "2026-11-14T11:00:00+03:00").reason,
  "window_closed"
);
assert.equal(
  evaluateLeadCaptureAvailability(sales, "attendee", "2026-11-14T12:00:00+03:00").reason,
  "event_started"
);

console.log("Event lifecycle activation matrix: PASS");
