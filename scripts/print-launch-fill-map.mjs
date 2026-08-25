import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "config/event-activation.september-draft.json"), "utf8")
);
const registry = JSON.parse(
  fs.readFileSync(path.join(root, "config/september-placeholder-registry.json"), "utf8")
);

const jsonMode = process.argv.includes("--json");
const unresolved = manifest.unresolved ?? {};
const items = registry.items.map((item) => ({
  ...item,
  unresolved: unresolved[item.key] === item.token,
}));

const result = {
  event_id: registry.eventId,
  draft: manifest.draft === true,
  unresolved_count: items.filter((item) => item.unresolved).length,
  items,
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const phaseOrder = ["registration", "paid_traffic", "event_ops", "content_polish"];
const phaseLabels = {
  registration: "REGISTRATION — нужно до открытия регистрации",
  paid_traffic: "PAID TRAFFIC — нужно до рекламы / индексации",
  event_ops: "EVENT OPS — нужно до инструкций участникам",
  content_polish: "CONTENT — заполнить после подтверждения или явно оставить пустым",
};

console.log(`September launch fill map · ${registry.eventId}`);
console.log(`Draft: ${manifest.draft === true ? "YES" : "NO"} · unresolved: ${result.unresolved_count}`);

for (const phase of phaseOrder) {
  const phaseItems = items.filter((item) => item.phase === phase);
  if (!phaseItems.length) continue;

  console.log(`\n${phaseLabels[phase] ?? phase.toUpperCase()}`);
  for (const item of phaseItems) {
    const state = item.unresolved ? "TODO" : "READY";
    console.log(`\n[${state}] ${item.label}`);
    console.log(`  token: ${item.token}`);
    console.log(`  fill:  ${item.fillTarget}`);
    console.log(`  public fallback: ${item.publicFallback}`);
    console.log(`  required for: ${item.requiredFor.join(", ")}`);
  }
}

const unknownPhases = [...new Set(items.map((item) => item.phase))].filter(
  (phase) => !phaseOrder.includes(phase)
);
for (const phase of unknownPhases) {
  console.log(`\n${phase.toUpperCase()}`);
  for (const item of items.filter((candidate) => candidate.phase === phase)) {
    console.log(`[${item.unresolved ? "TODO" : "READY"}] ${item.label} -> ${item.fillTarget}`);
  }
}

console.log("\nPolicy: TODO_* may exist in source/config, but raw technical placeholders must never be rendered publicly.");
console.log("Policy: never put secrets into the placeholder registry or activation manifest.");
