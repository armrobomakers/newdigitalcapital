import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const route = read("app/internal/visual-review/page.tsx");
const workflow = read(".github/workflows/visual-review.yml");
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
expect(workflow.includes("playwright@1.55.0"), "visual review workflow must pin the screenshot runtime");
expect(workflow.includes("landing-desktop.png"), "desktop landing screenshot is required");
expect(workflow.includes("landing-tablet.png"), "tablet landing screenshot is required");
expect(workflow.includes("landing-mobile.png"), "mobile landing screenshot is required");
expect(workflow.includes("ui-gallery-desktop.png"), "desktop UI gallery screenshot is required");
expect(workflow.includes("ui-gallery-mobile.png"), "mobile UI gallery screenshot is required");
expect(workflow.includes("--full-page"), "visual review screenshots must capture full pages");
expect(workflow.includes("retention-days: 14"), "visual review artifacts must have bounded retention");
expect(!workflow.includes("vercel"), "visual review workflow must remain independent from Vercel");

if (failures.length) {
  console.error("visual_review_contract_failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("visual_review_contract_ok");
console.log("viewports=desktop,tablet,mobile");
console.log("production_route_default=404");
console.log("vercel_dependency=none");
