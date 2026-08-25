# Digital Capital UI library playbook

## Purpose

Use external UI libraries as a curated source of patterns, not as a pile of runtime dependencies. Digital Capital keeps source ownership, a coherent visual language, accessibility, and predictable performance.

## Approved sources

### shadcn/ui — component architecture
Use for accessible primitives, forms, dialogs, accordions, buttons, cards and composition conventions. Prefer source-owned components in `components/ui` rather than opaque package wrappers.

### 21st.dev — discovery/catalog
Use to discover strong React/Tailwind implementations and compare several solutions before choosing a pattern. Treat every third-party component as untrusted until code, dependency and license review are complete.

### Aceternity UI — landing-page composition
Primary source for section composition ideas: spotlight surfaces, timelines, bento grids, hero backgrounds and restrained hover effects. For Digital Capital prefer subtle variants; do not use cursor hijacking, heavy 3D or continuous large-canvas effects.

### Magic UI — micro-interactions
Use selectively for shine borders, shimmer accents, marquee/logo movement, number transitions and small visual feedback. Maximum one strong animated accent in a viewport.

### Motion Primitives — motion reference
Use as a reference for accessible motion and transitions. Add a motion runtime only when native CSS is insufficient and the value is clear.

## Current implementation policy

The site currently runs Next.js 16, React 19 and Tailwind CSS 3 with a deliberately small dependency surface. DC-31 through DC-34 use source-owned and CSS-first patterns with no new runtime package.

Rules:

1. No library is installed wholesale.
2. Copy/adapt only the component or pattern we need.
3. Review license before importing third-party source.
4. Keep all adopted primitives editable inside the repository.
5. Preserve `prefers-reduced-motion` behavior.
6. No visual effect may block reading, focus, form interaction or scrolling.
7. Avoid layout shift and expensive always-on canvas/WebGL effects.
8. One visual system: Digital Capital colors, typography, radius and spacing always override library defaults.
9. Prefer semantic native elements when they already solve the interaction well; shadcn conventions can be applied without replacing semantics unnecessarily.
10. Every library-inspired pass must improve hierarchy or usability, not just add decoration.
11. Repeated production controls should graduate from selector-based styling into source-owned `components/ui` primitives.
12. Factual placeholders must never be reintroduced visually by CSS when launch configuration is unresolved.
13. Public organizer contacts and legal/privacy contacts are separate concepts and must not silently substitute for each other.
14. Verification labels may only render from already-verified product state; never hard-code an unverified claim.

## Section map

| Site area | Source pattern | Decision |
| --- | --- | --- |
| Top trust bar | 21st compact announcement/contact strips | DC-34: render verified venue/date and resolved public organizer contacts only |
| Hero | Aceternity spotlight / aurora restraint | Keep current composition; only subtle CTA motion |
| Stats | 21st bento cards + shadcn card discipline | DC-32: asymmetric 12-column bento, quieter icon treatment and consistent hover |
| Audience | 21st / Aceternity bento patterns | DC-32: replace five equal tall cards with compact 5/3/4 + 4/8 bento composition |
| Speakers | Aceternity card-hover restraint | DC-31: restrained spotlight hover; no 3D tilt |
| Program | Aceternity Timeline + 21st timeline/card references | DC-31: timeline hierarchy, readable full copy, sticky desktop intro |
| Registration | shadcn source-owned form conventions + restrained Magic UI accents | DC-33: `IconField`, `ChoiceCard`, `ConsentRow`, `StatusLine` moved into repository-owned UI primitives |
| Partners | 21st empty-state discipline; Magic UI marquee only after real logos exist | DC-34 hides empty partner grid and emphasizes the actual partnership CTA; do not animate placeholders |
| FAQ | shadcn accordion conventions | DC-32: native `details` retained, but layout and interaction density follow shadcn-style accordion discipline |
| Location | 21st location/contact references | DC-34: verified venue gets a clear trust badge and denser advantages layout; exact hall/entry details remain unresolved until confirmed |
| Footer | 21st footer references | DC-33: remove absolute CTA placement, simplify grid and suppress legacy fake contact placeholders |

## Source-owned form primitives

`components/ui/form-controls.tsx` is the first production component layer following the shadcn ownership model. It intentionally uses React/Tailwind only and exposes stable `data-ui` hooks.

Current primitives:

- `IconField` — icon + accessible input wrapper;
- `ChoiceCard` — radio choice surface for ticket tiers;
- `ConsentRow` — checkbox consent row;
- `StatusLine` — neutral/success/error form status surface.

These primitives must preserve native form controls and should remain independently editable without requiring an external package upgrade.

## Trust/contact policy

`components/event-trust-bar.tsx` reads public event contacts from `eventData.contacts`, not from `legalConfig`.

Rules:

- organizer email/phone render only when `isResolvedConfigValue()` accepts them;
- TODO/TBD/placeholder contacts fail closed and remain invisible;
- venue verification comes from `eventData.location.verified`;
- verified-location styling applies only to the verified location markup path;
- privacy/legal pages continue to use their own legal configuration and remain independent from event organizer contacts.

## Performance budget

- No WebGL/canvas effect by default.
- No new animation runtime in DC-31/DC-32/DC-33/DC-34.
- CSS animations must disable under `prefers-reduced-motion`.
- Avoid more than one continuous decorative animation per viewport.
- Prefer opacity/transform over layout-changing animation.
- Bento composition must stay CSS-grid based and require no client JavaScript.
- Source-owned form primitives must add no client state beyond the form state already required by the product flow.
- Trust/contact surfaces stay server-rendered and require no client JavaScript.

## Accessibility rules for adopted patterns

- Preserve native keyboard interaction where possible.
- Every focusable control needs a visible `focus-visible` state.
- Decorative glow/spotlight layers must be pointer-events disabled.
- Never depend on animation alone to convey state.
- Accordion content remains accessible without JavaScript.
- Mobile layout cannot rely on hover for essential information.
- Radio/checkbox semantics stay native even when the visual surface is card-like.
- Status messaging must remain `aria-live` compatible.
- Public organizer email and verified venue links must remain usable without JavaScript.

## Release discipline

UI library experiments are merged only after normal project CI. Vercel Git auto-deploy remains disabled; visual batches are deployed together after review instead of consuming deployment quota per experiment.
