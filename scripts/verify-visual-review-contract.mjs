import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const route = read("app/internal/visual-review/page.tsx");
const workflow = read(".github/workflows/visual-review.yml");
const capture = read("scripts/capture-visual-screenshot.mjs");
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

expect(route.includes('process.env.VISUAL_REVIEW_ENABLED === "true"'), "visual review route must require VISUAL_REVIEW_ENABLED=true");
expect(route.includes("notFound()"), "visual review route must fail closed with notFound()");
expect(route.includes('export const dynamic = "force-dynamic"'), "visual review route must stay runtime-gated");
expect(route.includes("index: false"), "visual review route must stay noindex");
expect(route.includes("TODO_ORGANIZER_PHONE"), "visual review fixture must use safe placeholder contacts");
expect(route.includes("TODO_PRIVACY_EMAIL"), "visual review fixture must use safe privacy placeholder");
expect(route.includes("TODO_BRANDED_SITE_URL"), "visual review fixture must use safe branded URL placeholder");

expect(workflow.includes("VISUAL_REVIEW_ENABLED: \"true\""), "visual review workflow must explicitly enable the internal route");
expect(workflow.includes("actions/upload-artifact@v4"), "visual review workflow must upload screenshots");
expect(workflow.includes("Resolve runner Chrome"), "visual review workflow must resolve the preinstalled runner browser");
expect(workflow.includes("capture-visual-screenshot.mjs"), "visual review workflow must use the source-owned capture script");
expect(workflow.includes("landing-desktop.png"), "desktop landing screenshot is required");
expect(workflow.includes("landing-tablet.png"), "tablet landing screenshot is required");
expect(workflow.includes("landing-mobile.png"), "mobile landing screenshot is required");
expect(workflow.includes("ui-gallery-desktop.png"), "desktop UI gallery screenshot is required");
expect(workflow.includes("ui-gallery-mobile.png"), "mobile UI gallery screenshot is required");
expect(workflow.includes("/tmp/september-public.html"), "visual review must inspect public September HTML");
expect(workflow.includes("! grep -Eq 'TODO_|TBD_|PLACEHOLDER_|REPLACE_ME_|CHANGE_ME_'"), "public HTML must reject raw technical placeholders");
expect(workflow.includes("будет указан дополнительно"), "public hall fallback must be asserted in visual review");
expect(workflow.includes("схема прохода появится ближе к событию"), "public entry fallback must be asserted in visual review");
expect(workflow.includes("retention-days: 14"), "visual review artifacts must have bounded retention");
expect(!workflow.includes("playwright"), "visual review workflow must not add a temporary browser package");
expect(!workflow.includes("npx"), "visual review workflow must not bypass repository install-script policy through npx");
expect(!workflow.toLowerCase().includes("vercel"), "visual review workflow must remain independent from Vercel");

expect(capture.includes("Page.captureScreenshot"), "capture script must use Chrome DevTools full-page screenshot API");
expect(capture.includes("captureBeyondViewport: true"), "capture script must capture beyond the initial viewport");
expect(capture.includes("horizontal_overflow"), "capture script must fail on horizontal overflow");
expect(capture.includes("Emulation.setDeviceMetricsOverride"), "capture script must set explicit responsive viewport metrics");
expect(capture.includes("window.scrollTo"), "capture script must walk the page before capture to trigger lazy loading");
expect(capture.includes("document.images"), "capture script must settle document images before capture");
expect(capture.includes("image.complete"), "capture script must check lazy image completion");
expect(!capture.includes("playwright"), "capture script must stay dependency-free");

if (failures.length) {
  console.error("visual_review_contract_failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("visual_review_contract_ok");
console.log("viewports=desktop,tablet,mobile");
console.log("capture=chrome-cdp-node24");
console.log("lazy_images=scroll_and_settle");
console.log("horizontal_overflow_gate=enabled");
console.log("public_placeholder_gate=enabled");
console.log("production_route_default=404");
console.log("vercel_dependency=none");
