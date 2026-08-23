import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const ENV_EXAMPLE = join(ROOT, ".env.example");
const LEGACY_ENV_EXAMPLE = join(ROOT, ".env.local.example");
const SOURCE_ROOTS = ["app", "components", "data", "hooks", "lib"];
const SOURCE_FILES = ["next.config.mjs", "next.config.js", "next.config.ts"];
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);
const PLATFORM_ENV = new Set(["NODE_ENV", "VERCEL", "VERCEL_ENV", "CI"]);
const SECRET_NAME = /(SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY)/i;

function walk(path) {
  if (!existsSync(path)) {
    return [];
  }

  const stats = statSync(path);
  if (stats.isFile()) {
    return SOURCE_EXTENSIONS.has(extname(path)) ? [path] : [];
  }

  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
      return [];
    }
    return walk(join(path, entry.name));
  });
}

function parseEnvExample(source) {
  const keys = new Set();
  const duplicates = new Set();
  const values = new Map();

  for (const [index, rawLine] of source.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!match) {
      throw new Error(`.env.example:${index + 1}: invalid env declaration`);
    }

    const [, key, value] = match;
    if (keys.has(key)) {
      duplicates.add(key);
    }
    keys.add(key);
    values.set(key, value);
  }

  return { keys, duplicates, values };
}

function findEnvReferences(source) {
  const references = new Set();
  const patterns = [
    /process\.env\.([A-Z][A-Z0-9_]*)/g,
    /process\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      references.add(match[1]);
    }
  }

  return references;
}

if (!existsSync(ENV_EXAMPLE)) {
  throw new Error("canonical .env.example is missing");
}

if (existsSync(LEGACY_ENV_EXAMPLE)) {
  throw new Error("legacy .env.local.example must be removed; .env.example is the single source of truth");
}

const env = parseEnvExample(readFileSync(ENV_EXAMPLE, "utf8"));
if (env.duplicates.size > 0) {
  throw new Error(`duplicate .env.example keys: ${[...env.duplicates].sort().join(",")}`);
}

const files = [
  ...SOURCE_ROOTS.flatMap((root) => walk(join(ROOT, root))),
  ...SOURCE_FILES.flatMap((file) => walk(join(ROOT, file))),
];

const usedByKey = new Map();
for (const file of files) {
  const source = readFileSync(file, "utf8");
  for (const key of findEnvReferences(source)) {
    if (!usedByKey.has(key)) {
      usedByKey.set(key, new Set());
    }
    usedByKey.get(key).add(relative(ROOT, file));
  }
}

const missing = [...usedByKey.keys()]
  .filter((key) => !PLATFORM_ENV.has(key) && !env.keys.has(key))
  .sort();
if (missing.length > 0) {
  const details = missing
    .map((key) => `${key} (${[...(usedByKey.get(key) ?? [])].sort().join(", ")})`)
    .join("; ");
  throw new Error(`undocumented environment variables: ${details}`);
}

const exposedSecrets = [...env.keys]
  .filter((key) => key.startsWith("NEXT_PUBLIC_") && SECRET_NAME.test(key))
  .sort();
if (exposedSecrets.length > 0) {
  throw new Error(`secret-like variables must not be NEXT_PUBLIC_: ${exposedSecrets.join(",")}`);
}

if (env.values.get("NEXT_PUBLIC_INDEXING_ENABLED") !== "false") {
  throw new Error("NEXT_PUBLIC_INDEXING_ENABLED must default to false in .env.example");
}

const documentedServerSecrets = ["LEAD_STORAGE_WEBHOOK_SECRET", "TELEGRAM_BOT_TOKEN"];
for (const key of documentedServerSecrets) {
  if (!env.keys.has(key)) {
    throw new Error(`required server-side configuration key is missing from .env.example: ${key}`);
  }
}

console.log(`Environment contract: PASS (${env.keys.size} documented keys, ${usedByKey.size} source references)`);
