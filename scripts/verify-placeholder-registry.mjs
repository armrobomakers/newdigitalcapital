import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(read(file));

const manifest = readJson("config/event-activation.september-draft.json");
const registry = readJson("config/september-placeholder-registry.json");
const operationalSource = read("data/event-operational-details.ts");
const eventSource = read("data/events.ts");
const trustBar = read("components/event-trust-bar.tsx");
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function isPlaceholder(value) {
  return typeof value === "string" && /^(TODO|TBD|PLACEHOLDER|REPLACE_ME|CHANGE_ME)(?:[_:\s-]|$)/i.test(value.trim());
}

expect(registry.eventId === manifest.lifecycle?.id, "placeholder registry eventId must match activation manifest");
expect(registry.sourceManifest === "config/event-activation.september-draft.json", "registry must point at canonical September activation manifest");
expect(registry.policy?.technicalPlaceholdersMayBeCommitted === true, "registry must explicitly allow committed technical placeholders");
expect(registry.policy?.technicalPlaceholdersMayBePublic === false, "technical placeholders must be forbidden in public UI");
expect(registry.policy?.secretsMayBeStoredHere === false, "registry must explicitly forbid secrets");

const unresolved = manifest.unresolved ?? {};
const items = Array.isArray(registry.items) ? registry.items : [];
const manifestKeys = Object.keys(unresolved).sort();
const registryKeys = items.map((item) => item.key).sort();

expect(
  JSON.stringify(manifestKeys) === JSON.stringify(registryKeys),
  `registry keys must exactly cover manifest unresolved keys: manifest=${manifestKeys.join(",")} registry=${registryKeys.join(",")}`
);

const seenTokens = new Set();
for (const item of items) {
  expect(typeof item.key === "string" && item.key.length > 0, "registry item key is required");
  expect(isPlaceholder(item.token), `registry item ${item.key} must use a technical placeholder token`);
  expect(unresolved[item.key] === item.token, `registry token mismatch for ${item.key}`);
  expect(!seenTokens.has(item.token), `duplicate registry placeholder token: ${item.token}`);
  seenTokens.add(item.token);

  for (const field of ["label", "category", "phase", "fillTarget", "publicFallback"]) {
    expect(typeof item[field] === "string" && item[field].trim().length > 0, `${item.key}.${field} is required`);
  }
  expect(Array.isArray(item.requiredFor) && item.requiredFor.length > 0, `${item.key}.requiredFor must be non-empty`);
  expect(!isPlaceholder(item.publicFallback), `${item.key}.publicFallback must be human-readable, not a technical token`);
  expect(!/TODO_|TBD_|PLACEHOLDER_/i.test(item.publicFallback), `${item.key}.publicFallback must not expose technical placeholder text`);
}

expect(
  operationalSource.includes('hall: "TODO_EVENT_HALL"'),
  "event hall technical placeholder must live in data/event-operational-details.ts"
);
expect(
  operationalSource.includes('entryInstructions: "TODO_ENTRY_INSTRUCTIONS"'),
  "entry instructions technical placeholder must live in data/event-operational-details.ts"
);
expect(
  eventSource.includes('phone: "TODO_ORGANIZER_PHONE"'),
  "organizer phone technical placeholder must stay explicit in September event data"
);
expect(trustBar.includes("getEventOperationalDetails"), "public trust bar must read operational details through the guarded source");
expect(trustBar.includes("isResolvedConfigValue(operationalDetails?.hall)"), "hall must be guarded before public rendering");
expect(trustBar.includes("isResolvedConfigValue(operationalDetails?.entryInstructions)"), "entry instructions must be guarded before public rendering");
expect(!trustBar.includes("TODO_EVENT_HALL"), "public component must not hard-code hall TODO token");
expect(!trustBar.includes("TODO_ENTRY_INSTRUCTIONS"), "public component must not hard-code entry TODO token");

const serializedRegistry = JSON.stringify(registry);
expect(!/(WEBHOOK_SECRET|BOT_TOKEN|PASSWORD|PRIVATE_KEY)/i.test(serializedRegistry), "placeholder registry must not contain secret fields or values");

if (failures.length) {
  console.error("placeholder_registry_contract_failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("placeholder_registry_contract_ok");
console.log(`event=${registry.eventId}`);
console.log(`unresolved=${items.length}`);
console.log(`phases=${[...new Set(items.map((item) => item.phase))].sort().join(",")}`);
console.log("public_technical_placeholders=forbidden");
console.log("secrets_in_registry=forbidden");
