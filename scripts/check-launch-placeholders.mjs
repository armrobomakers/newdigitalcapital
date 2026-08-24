import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_MANIFEST = "config/event-activation.september-draft.json";
const manifestPath = resolve(process.argv.find((arg) => arg.endsWith(".json")) ?? DEFAULT_MANIFEST);
const strict = process.argv.includes("--strict");

const placeholderPatterns = [
  /^TODO(?:[_:\s-]|$)/i,
  /^TBD(?:[_:\s-]|$)/i,
  /^PLACEHOLDER(?:[_:\s-]|$)/i,
  /^REPLACE_ME(?:[_:\s-]|$)/i,
  /^CHANGE_ME(?:[_:\s-]|$)/i,
  /^__REQUIRED_/i,
  /^\[.+\]$/,
  /^<.+>$/,
];

function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`launch_manifest_unreadable:${error instanceof Error ? error.message : String(error)}`);
  }
}

function isPlaceholder(value) {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim();
  return placeholderPatterns.some((pattern) => pattern.test(normalized));
}

function collect(value, path = "$", result = []) {
  if (isPlaceholder(value)) {
    result.push({ path, value });
    return result;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collect(item, `${path}[${index}]`, result));
    return result;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      collect(item, `${path}.${key}`, result);
    }
  }

  return result;
}

const manifest = readJson(manifestPath);
const unresolved = collect(manifest);
const releaseReady = manifest.draft !== true && manifest.template !== true && unresolved.length === 0;

const result = {
  ok: strict ? releaseReady : true,
  manifest: manifestPath.replace(`${process.cwd()}/`, ""),
  draft: manifest.draft === true,
  template: manifest.template === true,
  release_ready: releaseReady,
  unresolved_count: unresolved.length,
  unresolved,
};

console.log(JSON.stringify(result, null, 2));

if (strict && !releaseReady) {
  process.exit(3);
}
