import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(path, "utf8");
}

function requireMatch(name, source, pattern) {
  if (!pattern.test(source)) {
    throw new Error(`${name}: missing required invariant ${pattern}`);
  }
}

function forbidMatch(name, source, pattern) {
  if (pattern.test(source)) {
    throw new Error(`${name}: forbidden regression matched ${pattern}`);
  }
}

const hook = read("hooks/use-lead-capture-availability.ts");
const landing = read("components/landing.tsx");
const sticky = read("components/sticky-cta.tsx");
const form = read("components/registration-form.tsx");
const registerRoute = read("app/api/register/route.ts");
const analyticsRoute = read("app/api/analytics/route.ts");
const temporalLink = read("components/temporal-registration-link.tsx");
const temporalGate = read("components/temporal-registration-gate.tsx");
const leadDelivery = read("lib/lead-delivery.ts");
const appsScriptLeadStorage = read("integrations/google-apps-script/lead-storage.gs");
const dockerfile = read("Dockerfile");
const dockerignore = read(".dockerignore");
const ci = read(".github/workflows/ci.yml");
const envExample = read(".env.example");
const packageJson = JSON.parse(read("package.json"));
const vercelConfig = JSON.parse(read("vercel.json"));

requireMatch("temporal hook", hook, /LEAD_WINDOW_REFRESH_MS\s*=\s*30_000/);
requireMatch("temporal hook", hook, /window\.setInterval\(refresh,\s*LEAD_WINDOW_REFRESH_MS\)/);
requireMatch("temporal hook", hook, /document\.addEventListener\("visibilitychange",\s*handleVisibilityChange\)/);
requireMatch("temporal hook", hook, /document\.visibilityState\s*===\s*"visible"/);
requireMatch("temporal hook", hook, /return \{ availability, refresh \}/);

requireMatch("registration form", form, /useLeadCaptureAvailability\(/);
requireMatch("registration form", form, /const currentAvailability = refreshAvailability\(\)/);
requireMatch("registration form", form, /if \(!currentAvailability\?\.open\)/);
requireMatch("registration form", form, /response\.status === 409/);
requireMatch("registration form", form, /refreshAvailability\(\)/);

requireMatch("registration API", registerRoute, /MAX_REQUEST_BODY_BYTES\s*=\s*16_384/);
requireMatch("registration API", registerRoute, /request\.body\.getReader\(\)/);
requireMatch("registration API", registerRoute, /totalBytes > MAX_REQUEST_BODY_BYTES/);
requireMatch("registration API", registerRoute, /supportedMediaTypes/);
requireMatch("registration API", registerRoute, /application\/x-www-form-urlencoded/);
requireMatch("registration API", registerRoute, /isAllowedBrowserOrigin\(request\)/);
requireMatch("registration API", registerRoute, /origin_not_allowed/);
requireMatch("registration API", registerRoute, /unsupported_content_type/);
requireMatch("registration API", registerRoute, /"Retry-After"/);
forbidMatch("registration API", registerRoute, /await request\.json\(\)/);
forbidMatch("registration API", registerRoute, /await request\.formData\(\)/);

requireMatch("analytics API", analyticsRoute, /MAX_BODY_BYTES\s*=\s*8_192/);
requireMatch("analytics API", analyticsRoute, /request\.body\.getReader\(\)/);
requireMatch("analytics API", analyticsRoute, /totalBytes > MAX_BODY_BYTES/);
requireMatch("analytics API", analyticsRoute, /mediaType !== "application\/json"/);
requireMatch("analytics API", analyticsRoute, /isAllowedBrowserOrigin\(request\)/);
requireMatch("analytics API", analyticsRoute, /origin_not_allowed/);
requireMatch("analytics API", analyticsRoute, /"Retry-After"/);
requireMatch("analytics API", analyticsRoute, /AbortSignal\.timeout\(ANALYTICS_WEBHOOK_TIMEOUT_MS\)/);
requireMatch("analytics API", analyticsRoute, /"Cache-Control": "no-store"/);
requireMatch("analytics API", analyticsRoute, /Number\.isFinite\(propertyValue\)/);
requireMatch("analytics API", analyticsRoute, /normalizeOccurredAt/);
forbidMatch("analytics API", analyticsRoute, /await request\.json\(\)/);

requireMatch("lead delivery", leadDelivery, /DEFAULT_LEAD_STORAGE_TRANSPORT = "header_hmac"/);
requireMatch("lead delivery", leadDelivery, /APPS_SCRIPT_BODY_HMAC_VERSION = "apps_script_body_hmac\.v1"/);
requireMatch("lead delivery", leadDelivery, /resolveLeadStorageTransport/);
requireMatch("lead delivery", leadDelivery, /transport === "header_hmac"/);
requireMatch("lead delivery", leadDelivery, /signature: `sha256=\$\{signature\}`/);
requireMatch("lead delivery", leadDelivery, /payload,/);
requireMatch("lead delivery", leadDelivery, /primary_storage_transport_invalid/);
requireMatch("Apps Script lead storage", appsScriptLeadStorage, /DC_TRANSPORT_VERSION = "apps_script_body_hmac\.v1"/);
requireMatch("Apps Script lead storage", appsScriptLeadStorage, /Utilities\.computeHmacSha256Signature/);
requireMatch("Apps Script lead storage", appsScriptLeadStorage, /LockService\.getScriptLock\(\)/);
requireMatch("Apps Script lead storage", appsScriptLeadStorage, /createTextFinder\(requestId\)/);
requireMatch("Apps Script lead storage", appsScriptLeadStorage, /payload_sha256/);
requireMatch("Apps Script lead storage", appsScriptLeadStorage, /idempotency_conflict/);
requireMatch("Apps Script lead storage", appsScriptLeadStorage, /lead_sheet_schema_mismatch/);
requireMatch("Apps Script lead storage", appsScriptLeadStorage, /\^\[=\+\\-@\]/);

requireMatch("temporal CTA", temporalLink, /useLeadCaptureAvailability\(eventId, "attendee"\)/);
requireMatch("temporal CTA", temporalLink, /href=\{open \? "#register" : "#program"\}/);
requireMatch("temporal CTA", temporalLink, /data-registration-state=\{open \? "open" : "closed"\}/);

requireMatch("temporal gate", temporalGate, /useLeadCaptureAvailability\(eventId, "attendee"\)/);
requireMatch("temporal gate", temporalGate, /availability\?\.open === true \? openContent : closedContent/);

requireMatch("landing", landing, /TemporalRegistrationLink/);
requireMatch("landing", landing, /TemporalRegistrationGate/);
requireMatch("landing", landing, /eventId=\{eventData\.eventId\}/);
requireMatch("sticky CTA", sticky, /TemporalRegistrationLink/);
requireMatch("sticky CTA", sticky, /eventId=\{eventData\.eventId\}/);

forbidMatch("landing", landing, /getEventLifecycleBySlug/);
forbidMatch("landing", landing, /const registrationOpen\s*=/);
forbidMatch("sticky CTA", sticky, /getEventLifecycleBySlug/);
forbidMatch("sticky CTA", sticky, /const registrationOpen\s*=/);

requireMatch("Dockerfile", dockerfile, /^FROM node:24-alpine AS base$/m);
requireMatch("Dockerfile", dockerfile, /npm install --global npm@11\.17\.0/);
requireMatch("Dockerfile", dockerfile, /^RUN npm ci$/m);
requireMatch("Dockerfile", dockerfile, /^RUN npm ci --omit=dev && npm cache clean --force$/m);
requireMatch("Dockerfile", dockerfile, /^USER node$/m);
requireMatch("Dockerfile", dockerfile, /^HEALTHCHECK .*\\$/m);
forbidMatch("Dockerfile", dockerfile, /^FROM node:20/m);

requireMatch(".dockerignore", dockerignore, /^\.env$/m);
requireMatch(".dockerignore", dockerignore, /^\.env\.\*$/m);
requireMatch(".dockerignore", dockerignore, /^!\.env\.example$/m);
forbidMatch(".dockerignore", dockerignore, /\.env\.local\.example/);
requireMatch(".dockerignore", dockerignore, /^node_modules$/m);
requireMatch(".dockerignore", dockerignore, /^\.next$/m);

requireMatch("environment example", envExample, /^NEXT_PUBLIC_INDEXING_ENABLED=false$/m);
requireMatch("environment example", envExample, /^LEAD_STORAGE_TRANSPORT=header_hmac$/m);
requireMatch("environment example", envExample, /^LEAD_STORAGE_WEBHOOK_SECRET=$/m);
requireMatch("environment example", envExample, /^ANALYTICS_WEBHOOK_URL=$/m);
if (packageJson?.scripts?.["env:check"] !== "node scripts/verify-env-contract.mjs") {
  throw new Error("package.json: env:check must execute the canonical environment contract verifier");
}
if (!packageJson?.scripts?.check?.includes("npm run env:check")) {
  throw new Error("package.json: npm run check must include env:check before build");
}

requireMatch("CI", ci, /- name: Container runtime smoke/);
requireMatch("CI", ci, /docker build/);
requireMatch("CI", ci, /docker inspect digitalcapital:ci --format '\{\{\.Config\.User\}\}'/);
requireMatch("CI", ci, /origin_not_allowed/);
requireMatch("CI", ci, /payload_too_large/);
requireMatch("CI", ci, /unsupported_content_type/);
requireMatch("CI", ci, /analytics-origin\.json/);
requireMatch("CI", ci, /analytics-large-response\.json/);

if (vercelConfig?.git?.deploymentEnabled !== false) {
  throw new Error("vercel.json: automatic Git deployments must remain disabled outside an explicit one-shot release trigger");
}

console.log("Release regression invariants: PASS");
