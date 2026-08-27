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

expect(workflow.includes('VISUAL_REVIEW_ENABLED: "true"'), "visual review workflow must explicitly enable the internal route");
expect(workflow.includes("actions/upload-artifact@v4"), "visual review workflow must upload screenshots");
expect(workflow.includes("Resolve runner Chrome"), "visual review workflow must resolve the preinstalled runner browser");
expect(workflow.includes("capture-visual-screenshot.mjs"), "visual review workflow must use the source-owned capture script");
expect(workflow.includes("landing-pending-desktop.png"), "pending desktop landing screenshot is required");
expect(workflow.includes("landing-pending-mobile.png"), "pending mobile landing screenshot is required");
expect(workflow.includes("landing-sales-desktop.png"), "sales desktop landing screenshot is required");
expect(workflow.includes("landing-sales-tablet.png"), "sales tablet landing screenshot is required");
expect(workflow.includes("landing-sales-mobile.png"), "sales mobile landing screenshot is required");
expect(workflow.includes("ui-gallery-desktop.png"), "desktop UI gallery screenshot is required");
expect(workflow.includes("ui-gallery-mobile.png"), "mobile UI gallery screenshot is required");
expect(workflow.includes("/tmp/september-public.html"), "visual review must inspect public September HTML");
expect(workflow.includes("/tmp/september-sales.html"), "visual review must inspect battle-ready sales HTML");
expect(workflow.includes("?preview=sales"), "visual review must explicitly exercise battle-ready sales preview");
expect(workflow.includes("assert_absent /tmp/september-public.html"), "public HTML must have an explicit absence assertion");
expect(workflow.includes("TODO_|TBD_|PLACEHOLDER_|REPLACE_ME_|CHANGE_ME_"), "public HTML must reject raw technical placeholders");
expect(workflow.includes("Продажи скоро откроются|Регистрация готовится к запуску"), "public pending registration state must be asserted semantically");
expect(workflow.includes("Точный зал.*схем"), "public operational hall/entry fallback must stay human-readable");
expect(workflow.includes("Смотреть архив программы"), "future event archive copy must remain explicitly rejected");
expect(workflow.includes("assert_contains /tmp/september-sales.html 'Выберите билет'"), "sales preview must assert ticket selection");
expect(workflow.includes("assert_contains /tmp/september-sales.html 'Зарегистрироваться'"), "sales preview must assert registration CTA");
expect(workflow.includes("cp /tmp/september-public.html visual-review/september-public.html"), "failed visual runs must preserve public HTML diagnostics");
expect(workflow.includes("cp /tmp/september-sales.html visual-review/september-sales.html"), "failed visual runs must preserve sales HTML diagnostics");
expect(workflow.includes("battle_ready_sales_preview=enabled"), "visual manifest must record battle-ready sales preview");
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
console.log("battle_ready_sales_preview=enabled");
console.log("production_route_default=404");
console.log("vercel_dependency=none");
