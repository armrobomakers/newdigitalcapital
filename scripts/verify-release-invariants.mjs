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
const temporalLink = read("components/temporal-registration-link.tsx");
const temporalGate = read("components/temporal-registration-gate.tsx");
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

if (vercelConfig?.git?.deploymentEnabled !== false) {
  throw new Error("vercel.json: automatic Git deployments must remain disabled outside an explicit one-shot release trigger");
}

console.log("Release regression invariants: PASS");
