import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const checker = join(process.cwd(), "scripts", "check-launch-placeholders.mjs");
const activationChecker = join(process.cwd(), "scripts", "check-event-activation.cjs");
const draftPath = join(process.cwd(), "config", "event-activation.september-draft.json");

function runScript(script, args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function run(args) {
  return runScript(checker, args);
}

function fail(message, result) {
  console.error(message);
  if (result?.stdout) console.error(result.stdout);
  if (result?.stderr) console.error(result.stderr);
  process.exit(1);
}

const status = run([draftPath]);
if (status.status !== 0) {
  fail("launch:todo style check must exit 0 for a draft manifest", status);
}

let parsed;
try {
  parsed = JSON.parse(status.stdout);
} catch {
  fail("launch placeholder status must return JSON", status);
}

if (parsed.release_ready !== false || parsed.draft !== true || parsed.unresolved_count < 4) {
  fail("draft launch status did not expose unresolved placeholders", status);
}

const unresolvedValues = new Set(parsed.unresolved.map((item) => item.value));
for (const required of [
  "TODO_ORGANIZER_PHONE",
  "TODO_PRIVACY_EMAIL",
  "TODO_BRANDED_SITE_URL",
  "TODO_ANALYTICS_WEBHOOK_URL",
]) {
  if (!unresolvedValues.has(required)) {
    fail(`missing expected unresolved placeholder: ${required}`, status);
  }
}

const strictDraft = run([draftPath, "--strict"]);
if (strictDraft.status !== 3) {
  fail("strict launch check must reject draft/unresolved manifest with exit 3", strictDraft);
}

const activationDraft = runScript(activationChecker, [draftPath, "config"]);
if (activationDraft.status !== 2) {
  fail("event activation checker must reject September draft before compilation", activationDraft);
}
if (!activationDraft.stderr.includes("activation_manifest_is_template")) {
  fail("event activation checker must label draft as activation_manifest_is_template", activationDraft);
}
if (!activationDraft.stderr.includes("$.unresolved.organizerPhone")) {
  fail("event activation checker must report TODO placeholder paths", activationDraft);
}

const tempDir = mkdtempSync(join(tmpdir(), "digital-capital-launch-check-"));
try {
  const resolvedPath = join(tempDir, "resolved.json");
  const resolved = JSON.parse(readFileSync(draftPath, "utf8"));
  resolved.draft = false;
  delete resolved.unresolved;
  writeFileSync(resolvedPath, JSON.stringify(resolved, null, 2));

  const strictResolved = run([resolvedPath, "--strict"]);
  if (strictResolved.status !== 0) {
    fail("strict launch check must pass a manifest without draft/template/placeholders", strictResolved);
  }

  const resolvedResult = JSON.parse(strictResolved.stdout);
  if (resolvedResult.release_ready !== true || resolvedResult.unresolved_count !== 0) {
    fail("resolved launch manifest did not report release_ready=true", strictResolved);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

console.log("Launch placeholder check contract: PASS");
