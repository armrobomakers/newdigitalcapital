import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const landing = read("components/landing.tsx");
const uiCss = read("app/ui-library.css");
const layout = read("app/layout.tsx");

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

expect(layout.includes('import "./ui-library.css";'), "ui-library.css must stay loaded from app/layout.tsx");
expect(landing.includes('id="top"'), "hero root #top is required by the curated UI layer");
expect(landing.includes("eventData.stats.map"), "hero stats collection is required by the bento pattern");
expect(landing.includes('id="audience"'), "#audience section is required by the audience bento pattern");
expect(landing.includes("eventData.audience.map"), "audience collection is required by the bento pattern");
expect(landing.includes('id="faq"'), "#faq section is required by the accordion pattern");
expect(landing.includes("<FAQItem"), "FAQItem markup is required by the accordion pattern");
expect(landing.includes("<details"), "FAQ must keep semantic native details interaction");

for (const selector of [
  "#top + div",
  "#audience > .mt-6.grid",
  "#faq > .mt-8.grid",
  "#program ul::before",
  "#speakers article::before",
  "@media (prefers-reduced-motion: reduce)",
]) {
  expect(uiCss.includes(selector), `missing curated UI selector/contract: ${selector}`);
}

expect(!uiCss.includes("cursor: none"), "curated UI layer must not hijack the pointer");
expect(!uiCss.includes("canvas"), "curated UI layer must stay canvas-free by default");

if (failures.length) {
  console.error("ui_pattern_contract_failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("ui_pattern_contract_ok");
console.log("patterns=hero_stats_bento,audience_bento,faq_accordion,program_timeline,speaker_spotlight");
console.log("runtime_dependencies_added=0");
