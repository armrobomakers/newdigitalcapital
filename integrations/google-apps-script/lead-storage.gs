const DC_TRANSPORT_VERSION = "apps_script_body_hmac.v1";
const DC_SCHEMA_VERSION = "lead.v1";
const DC_MAX_CLOCK_SKEW_SECONDS = 300;
const DC_MIN_SECRET_LENGTH = 32;
const DC_DEFAULT_SHEET_NAME = "Leads";

const DC_HEADERS = [
  "received_at",
  "submitted_at",
  "request_id",
  "event_id",
  "lead_type",
  "ticket",
  "name",
  "contact",
  "email",
  "phone",
  "company",
  "privacy_consent",
  "marketing_consent",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "source",
  "schema_version",
  "payload_sha256",
];

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "";
    if (!raw) {
      return dcJson({ ok: false, error: "empty_body" });
    }

    const wrapper = JSON.parse(raw);
    const verified = dcVerifyWrapper(wrapper);
    if (!verified.ok) {
      return dcJson({ ok: false, error: verified.error });
    }

    return dcStoreEnvelope(verified.envelope, verified.payload);
  } catch (error) {
    console.error("digitalcapital_lead_receiver_failed", String(error));
    return dcJson({ ok: false, error: "receiver_error" });
  }
}

function dcVerifyWrapper(wrapper) {
  if (!wrapper || typeof wrapper !== "object") {
    return { ok: false, error: "invalid_wrapper" };
  }

  if (wrapper.transport !== DC_TRANSPORT_VERSION) {
    return { ok: false, error: "unsupported_transport" };
  }

  const timestamp = String(wrapper.timestamp || "");
  const signature = String(wrapper.signature || "");
  const payload = typeof wrapper.payload === "string" ? wrapper.payload : "";

  if (!/^\d{10,13}$/.test(timestamp) || !/^sha256=[a-f0-9]{64}$/i.test(signature) || !payload) {
    return { ok: false, error: "invalid_auth_wrapper" };
  }

  const timestampSeconds = Number(timestamp);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestampSeconds) || Math.abs(nowSeconds - timestampSeconds) > DC_MAX_CLOCK_SKEW_SECONDS) {
    return { ok: false, error: "stale_timestamp" };
  }

  const properties = PropertiesService.getScriptProperties();
  const secret = String(properties.getProperty("LEAD_STORAGE_WEBHOOK_SECRET") || "");
  if (secret.length < DC_MIN_SECRET_LENGTH) {
    return { ok: false, error: "receiver_secret_not_configured" };
  }

  const expected = "sha256=" + dcHmacHex(timestamp + "." + payload, secret);
  if (!dcConstantTimeEqual(signature.toLowerCase(), expected.toLowerCase())) {
    return { ok: false, error: "invalid_signature" };
  }

  let envelope;
  try {
    envelope = JSON.parse(payload);
  } catch (_error) {
    return { ok: false, error: "invalid_payload_json" };
  }

  if (!dcValidateEnvelope(envelope)) {
    return { ok: false, error: "invalid_envelope" };
  }

  return { ok: true, envelope: envelope, payload: payload };
}

function dcValidateEnvelope(envelope) {
  return Boolean(
    envelope &&
      typeof envelope === "object" &&
      envelope.schema_version === DC_SCHEMA_VERSION &&
      envelope.source === "newdigitalcapital" &&
      typeof envelope.request_id === "string" &&
      /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/.test(envelope.request_id) &&
      typeof envelope.submitted_at === "string" &&
      !Number.isNaN(Date.parse(envelope.submitted_at))
  );
}

function dcStoreEnvelope(envelope, payload) {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = String(properties.getProperty("LEAD_SPREADSHEET_ID") || "");
  const sheetName = String(properties.getProperty("LEAD_SHEET_NAME") || DC_DEFAULT_SHEET_NAME);
  if (!spreadsheetId) {
    return dcJson({ ok: false, error: "spreadsheet_not_configured" });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return dcJson({ ok: false, error: "storage_busy" });
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      return dcJson({ ok: false, error: "lead_sheet_missing" });
    }

    if (!dcHeadersMatch(sheet)) {
      return dcJson({ ok: false, error: "lead_sheet_schema_mismatch" });
    }

    const requestId = envelope.request_id;
    const payloadHash = dcSha256Hex(payload);
    const existing = dcFindRequestId(sheet, requestId);
    if (existing) {
      const existingHash = String(sheet.getRange(existing.getRow(), DC_HEADERS.length).getDisplayValue() || "");
      if (existingHash === payloadHash) {
        return dcJson({ ok: true, request_id: requestId, duplicate: true });
      }
      return dcJson({ ok: false, error: "idempotency_conflict", request_id: requestId });
    }

    const row = [
      new Date(),
      dcText(envelope.submitted_at),
      dcText(envelope.request_id),
      dcText(envelope.event_id),
      dcText(envelope.lead_type),
      dcText(envelope.ticket),
      dcText(envelope.name),
      dcText(envelope.contact),
      dcText(envelope.email),
      dcText(envelope.phone),
      dcText(envelope.company),
      Boolean(envelope.privacy_consent),
      Boolean(envelope.marketing_consent),
      dcText(envelope.utm_source),
      dcText(envelope.utm_medium),
      dcText(envelope.utm_campaign),
      dcText(envelope.utm_content),
      dcText(envelope.utm_term),
      dcText(envelope.source),
      dcText(envelope.schema_version),
      payloadHash,
    ];

    sheet.appendRow(row);
    SpreadsheetApp.flush();
    return dcJson({ ok: true, request_id: requestId });
  } finally {
    lock.releaseLock();
  }
}

function dcHeadersMatch(sheet) {
  const values = sheet.getRange(1, 1, 1, DC_HEADERS.length).getDisplayValues()[0];
  for (let index = 0; index < DC_HEADERS.length; index += 1) {
    if (values[index] !== DC_HEADERS[index]) {
      return false;
    }
  }
  return true;
}

function dcFindRequestId(sheet, requestId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return null;
  }

  return sheet
    .getRange(2, 3, lastRow - 1, 1)
    .createTextFinder(requestId)
    .matchEntireCell(true)
    .findNext();
}

function dcText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  const text = String(value);
  return /^[=+\-@]/.test(text.trimStart()) ? "'" + text : text;
}

function dcHmacHex(value, secret) {
  const bytes = Utilities.computeHmacSha256Signature(value, secret, Utilities.Charset.UTF_8);
  return dcBytesToHex(bytes);
}

function dcSha256Hex(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return dcBytesToHex(bytes);
}

function dcBytesToHex(bytes) {
  return bytes
    .map(function (byte) {
      const normalized = (byte + 256) % 256;
      return normalized.toString(16).padStart(2, "0");
    })
    .join("");
}

function dcConstantTimeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function dcJson(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
