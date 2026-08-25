import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const eventPage = read("app/[slug]/page.tsx");
const trustBar = read("components/event-trust-bar.tsx");
const landing = read("components/landing.tsx");
const registrationForm = read("components/registration-form.tsx");
const formControls = read("components/ui/form-controls.tsx");
const uiCss = read("app/ui-library.css");
const footerCss = read("app/ui-footer.css");
const trustCss = read("app/ui-trust.css");
const layout = read("app/layout.tsx");

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

expect(layout.includes('import "./ui-library.css";'), "ui-library.css must stay loaded from app/layout.tsx");
expect(layout.includes('import "./ui-footer.css";'), "ui-footer.css must stay loaded from app/layout.tsx");
expect(layout.includes('import "./ui-trust.css";'), "ui-trust.css must stay loaded from app/layout.tsx");
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

for (const primitive of ["IconField", "ChoiceCard", "ConsentRow", "StatusLine"]) {
  expect(formControls.includes(`function ${primitive}`), `missing source-owned form primitive: ${primitive}`);
  expect(registrationForm.includes(`<${primitive}`), `registration form must use source-owned primitive: ${primitive}`);
}

expect(formControls.includes('data-ui="icon-field"'), "IconField must expose a stable data-ui hook");
expect(formControls.includes('data-ui="choice-card"'), "ChoiceCard must expose a stable data-ui hook");
expect(formControls.includes('data-ui="consent-row"'), "ConsentRow must expose a stable data-ui hook");
expect(formControls.includes('data-ui="status-line"'), "StatusLine must expose a stable data-ui hook");

expect(footerCss.includes("#footer-contacts > p:last-child::before"), "footer cleanup must override legacy fake contact placeholder");
expect(footerCss.includes("content: none !important"), "footer fake contact placeholder must be disabled");
expect(footerCss.includes("position: static !important"), "footer CTA controls must not stay absolutely positioned");

expect(eventPage.includes("<EventTrustBar eventData={eventData} />"), "event page must render verified trust bar");
expect(trustBar.includes("eventData.contacts.email"), "trust bar must use public event organizer email");
expect(trustBar.includes("eventData.contacts.phone"), "trust bar must use public event organizer phone when resolved");
expect(trustBar.includes("isResolvedConfigValue"), "trust bar must fail closed on TODO contact values");
expect(!trustBar.includes("legalConfig"), "public organizer trust bar must not reuse privacy/legal contact config");
expect(trustBar.includes('data-ui="event-trust-bar"'), "trust bar must expose a stable data-ui hook");

for (const selector of [
  '[data-ui="event-trust-bar"]',
  "#partners > .mt-8.grid:empty",
  "#location > .mt-8.grid > div:first-child::before",
]) {
  expect(trustCss.includes(selector), `missing trust UI selector/contract: ${selector}`);
}

expect(!uiCss.includes("cursor: none"), "curated UI layer must not hijack the pointer");
expect(!uiCss.includes("<canvas"), "curated UI layer must stay canvas-free by default");
expect(!footerCss.includes("placeholder@digitalcapital.ru"), "footer cleanup must not reintroduce fake contact data");
expect(!trustCss.includes("TODO_"), "trust UI CSS must not hard-code unresolved placeholders");
expect(!trustCss.includes("placeholder@"), "trust UI CSS must not hard-code placeholder contacts");

if (failures.length) {
  console.error("ui_pattern_contract_failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("ui_pattern_contract_ok");
console.log("patterns=hero_stats_bento,audience_bento,faq_accordion,program_timeline,speaker_spotlight,source_owned_form,footer_grid,event_trust_bar,verified_location");
console.log("runtime_dependencies_added=0");
