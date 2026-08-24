import { readFileSync } from "node:fs";

const files = [
  "app/layout.tsx",
  "app/[slug]/page.tsx",
  "app/robots.ts",
  "app/sitemap.ts",
  "components/event-structured-data.tsx",
];

for (const path of files) {
  const source = readFileSync(path, "utf8");

  if (source.includes("https://digitalcapital.vercel.app")) {
    throw new Error(`${path}: technical Vercel domain must not be an SEO fallback`);
  }

  if (!source.includes("isBrandedPublicUrl")) {
    throw new Error(`${path}: branded-domain guard is required for SEO output`);
  }
}

const layout = readFileSync("app/layout.tsx", "utf8");
const eventPage = readFileSync("app/[slug]/page.tsx", "utf8");
const robots = readFileSync("app/robots.ts", "utf8");
const sitemap = readFileSync("app/sitemap.ts", "utf8");
const structuredData = readFileSync("components/event-structured-data.tsx", "utf8");

if (!layout.includes('process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true" && brandedSiteReady')) {
  throw new Error("app/layout.tsx: indexing must require brandedSiteReady");
}
if (!eventPage.includes("indexingEnabled && brandedSiteReady")) {
  throw new Error("app/[slug]/page.tsx: page indexing must require brandedSiteReady");
}
if (!robots.includes("indexingEnabled && isBrandedPublicUrl(configuredSiteUrl)")) {
  throw new Error("app/robots.ts: robots allow must require branded URL");
}
if (!sitemap.includes("!indexingEnabled || !isBrandedPublicUrl(configuredSiteUrl)")) {
  throw new Error("app/sitemap.ts: sitemap must stay empty without branded URL");
}
if (!structuredData.includes("!isBrandedPublicUrl(config.organizerUrl)")) {
  throw new Error("event structured data must require a resolved organizer URL");
}

console.log("SEO release safety: PASS");
