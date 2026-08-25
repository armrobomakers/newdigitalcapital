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

The site currently runs Next.js 16, React 19 and Tailwind CSS 3 with a deliberately small dependency surface. DC-31 and DC-32 therefore use source-owned, CSS-first patterns and no new runtime package.

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

## Section map

| Site area | Source pattern | Decision |
| --- | --- | --- |
| Hero | Aceternity spotlight / aurora restraint | Keep current composition; only subtle CTA motion |
| Stats | 21st bento cards + shadcn card discipline | DC-32: asymmetric 12-column bento, quieter icon treatment and consistent hover |
| Audience | 21st / Aceternity bento patterns | DC-32: replace five equal tall cards with compact 5/3/4 + 4/8 bento composition |
| Speakers | Aceternity card-hover restraint | DC-31: restrained spotlight hover; no 3D tilt |
| Program | Aceternity Timeline + 21st timeline/card references | DC-31: timeline hierarchy, readable full copy, sticky desktop intro |
| Registration | Magic UI shine-border restraint + shadcn form conventions | DC-30 reduced decorative noise; form primitives remain a later source-owned refactor |
| Partners | Magic UI marquee only after real logos exist | Do not animate placeholders |
| FAQ | shadcn accordion conventions | DC-32: native `details` retained, but layout and interaction density follow shadcn-style accordion discipline |
| Location | 21st location/contact references | Keep stable until exact hall/entry data is confirmed |
| Footer | 21st footer references | Next visual pass: simplify CTA positioning and information density |

## Performance budget

- No WebGL/canvas effect by default.
- No new animation runtime in DC-31/DC-32.
- CSS animations must disable under `prefers-reduced-motion`.
- Avoid more than one continuous decorative animation per viewport.
- Prefer opacity/transform over layout-changing animation.
- Bento composition must stay CSS-grid based and require no client JavaScript.

## Accessibility rules for adopted patterns

- Preserve native keyboard interaction where possible.
- Every focusable control needs a visible `focus-visible` state.
- Decorative glow/spotlight layers must be pointer-events disabled.
- Never depend on animation alone to convey state.
- Accordion content remains accessible without JavaScript.
- Mobile layout cannot rely on hover for essential information.

## Release discipline

UI library experiments are merged only after normal project CI. Vercel Git auto-deploy remains disabled; visual batches are deployed together after review instead of consuming deployment quota per experiment.
