const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const manifestPath = process.argv[2];
const mode = process.argv[3] ?? "config";
const allowedModes = new Set(["config", "registration", "paid-traffic"]);
const placeholderPatterns = [
  /^__REQUIRED_/i,
  /^TODO(?:[_:\s-]|$)/i,
  /^TBD(?:[_:\s-]|$)/i,
  /^PLACEHOLDER(?:[_:\s-]|$)/i,
  /^REPLACE_ME(?:[_:\s-]|$)/i,
  /^CHANGE_ME(?:[_:\s-]|$)/i,
  /^\[.+\]$/,
  /^<.+>$/,
];

if (!manifestPath || !allowedModes.has(mode)) {
  console.error("Usage: npm run event:check -- <manifest.json> [config|registration|paid-traffic]");
  process.exit(64);
}

function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`activation_manifest_unreadable:${error instanceof Error ? error.message : String(error)}`);
  }
}

function isPlaceholder(value) {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim();
  return placeholderPatterns.some((pattern) => pattern.test(normalized));
}

function collectPlaceholders(value, prefix = "$", result = []) {
  if (isPlaceholder(value)) {
    result.push(prefix);
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectPlaceholders(item, `${prefix}[${index}]`, result));
    return result;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      collectPlaceholders(item, `${prefix}.${key}`, result);
    }
  }
  return result;
}

function expectObject(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`activation_manifest_invalid:${field}_must_be_object`);
  }
  return value;
}

function expectBoolean(value, field) {
  if (typeof value !== "boolean") {
    fail(`activation_manifest_invalid:${field}_must_be_boolean`);
  }
}

function expectNonNegativeInteger(value, field) {
  if (!Number.isInteger(value) || value < 0) {
    fail(`activation_manifest_invalid:${field}_must_be_non_negative_integer`);
  }
}

function compileRuntimeModules() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "digital-capital-activation-"));
  const tsc = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    process.platform === "win32" ? "tsc.cmd" : "tsc"
  );

  if (!fs.existsSync(tsc)) {
    fail("activation_checker_requires_npm_ci:first run npm ci");
  }

  const args = [
    "data/event-registry.ts",
    "lib/launch-readiness-core.ts",
    "--target",
    "ES2022",
    "--module",
    "commonjs",
    "--moduleResolution",
    "node",
    "--skipLibCheck",
    "--rootDir",
    ".",
    "--outDir",
    tempDir,
  ];

  const result = spawnSync(tsc, args, { cwd: process.cwd(), encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    fail("activation_checker_compile_failed");
  }

  return {
    registry: require(path.join(tempDir, "data", "event-registry.js")),
    readiness: require(path.join(tempDir, "lib", "launch-readiness-core.js")),
  };
}

const manifest = readJson(path.resolve(manifestPath));
const placeholders = collectPlaceholders(manifest);
if (manifest.template === true || manifest.draft === true || placeholders.length > 0) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: "activation_manifest_is_template",
        draft: manifest.draft === true,
        template: manifest.template === true,
        placeholders,
      },
      null,
      2
    )
  );
  process.exit(2);
}

const lifecycle = expectObject(manifest.lifecycle, "lifecycle");
const content = expectObject(manifest.content, "content");
const infrastructure = expectObject(manifest.infrastructure, "infrastructure");
const leadCapture = expectObject(lifecycle.leadCapture, "lifecycle.leadCapture");

for (const leadType of ["attendee", "partner", "speaker", "media"]) {
  expectBoolean(leadCapture[leadType], `lifecycle.leadCapture.${leadType}`);
}
expectBoolean(lifecycle.pageReady, "lifecycle.pageReady");

for (const field of [
  "locationVerified",
  "emailPresent",
  "phonePresent",
  "structuredDataReady",
]) {
  expectBoolean(content[field], `content.${field}`);
}
for (const field of ["speakersCount", "programCount", "partnersCount", "socialsCount"]) {
  expectNonNegativeInteger(content[field], `content.${field}`);
}
for (const field of [
  "legalReady",
  "leadStorageReady",
  "leadStorageSecretReady",
  "analyticsReady",
  "brandedSiteUrlReady",
  "indexingEnabled",
]) {
  expectBoolean(infrastructure[field], `infrastructure.${field}`);
}
if (!Array.isArray(infrastructure.catalogErrors)) {
  fail("activation_manifest_invalid:infrastructure.catalogErrors_must_be_array");
}

const { registry, readiness } = compileRuntimeModules();
const lifecycleErrors = registry.validateEventLifecycleConfig(lifecycle);
const checkAt = manifest.checkAt ?? Date.now();
const attendeeCapture = registry.evaluateLeadCaptureAvailability(lifecycle, "attendee", checkAt);
const isConfiguredSalesEvent =
  lifecycle.pageReady === true && lifecycle.status === "sales" && lifecycle.leadCapture.attendee === true;

const salesEvent = isConfiguredSalesEvent
  ? {
      id: lifecycle.id,
      slug: lifecycle.slug,
      startsAt: lifecycle.startsAt,
      attendeeCapture,
      locationVerified: content.locationVerified,
      emailPresent: content.emailPresent,
      phonePresent: content.phonePresent,
      speakersCount: content.speakersCount,
      programCount: content.programCount,
      structuredDataReady: content.structuredDataReady,
      partnersCount: content.partnersCount,
      socialsCount: content.socialsCount,
    }
  : null;

const snapshot = readiness.evaluateLaunchReadiness({
  catalogErrors: infrastructure.catalogErrors,
  salesEvent,
  legalReady: infrastructure.legalReady,
  leadStorageReady: infrastructure.leadStorageReady,
  leadStorageSecretReady: infrastructure.leadStorageSecretReady,
  analyticsReady: infrastructure.analyticsReady,
  brandedSiteUrlReady: infrastructure.brandedSiteUrlReady,
  indexingEnabled: infrastructure.indexingEnabled,
});

const result = {
  ok: lifecycleErrors.length === 0,
  mode,
  lifecycle_errors: lifecycleErrors,
  attendee_capture: attendeeCapture,
  readiness: snapshot,
};

console.log(JSON.stringify(result, null, 2));

if (lifecycleErrors.length > 0) {
  process.exit(2);
}
if (mode === "registration" && !snapshot.registration_ready) {
  process.exit(3);
}
if (mode === "paid-traffic" && !snapshot.paid_traffic_ready) {
  process.exit(4);
}
