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
const temporalLink = read("components/temporal-registration-link.tsx");
const temporalGate = read("components/temporal-registration-gate.tsx");
const dockerfile = read("Dockerfile");
const dockerignore = read(".dockerignore");
const ci = read(".github/workflows/ci.yml");
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
requireMatch(".dockerignore", dockerignore, /^node_modules$/m);
requireMatch(".dockerignore", dockerignore, /^\.next$/m);

requireMatch("CI", ci, /- name: Container runtime smoke/);
requireMatch("CI", ci, /docker build/);
requireMatch("CI", ci, /docker inspect digitalcapital:ci --format '\{\{\.Config\.User\}\}'/);
requireMatch("CI", ci, /origin_not_allowed/);
requireMatch("CI", ci, /payload_too_large/);
requireMatch("CI", ci, /unsupported_content_type/);

if (vercelConfig?.git?.deploymentEnabled !== false) {
  throw new Error("vercel.json: automatic Git deployments must remain disabled outside an explicit one-shot release trigger");
}

console.log("Release regression invariants: PASS");
