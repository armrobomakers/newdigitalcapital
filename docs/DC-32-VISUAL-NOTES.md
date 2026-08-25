# DC-32 visual notes

## Goal

Reduce the repeated-card feeling on the landing page and adopt stronger modern section composition without changing event content, registration logic or runtime dependencies.

## Changes

### Hero stats
- Asymmetric 12-column bento on wide screens.
- Keep all four facts visible without carousel or client JavaScript.
- Reduce icon dominance and strengthen numeric hierarchy.
- Subtle hover only; no continuous animation.

### Audience
- Replace five equal tall cards with a denser bento composition.
- Desktop layout: 5/3/4 columns on row one, 4/8 on row two.
- Left-align content for faster scanning.
- Keep all descriptions visible and preserve the existing semantic articles.

### FAQ
- Use a one-column accordion reading flow inspired by shadcn conventions.
- Keep native `details`/`summary` semantics and keyboard behavior.
- Improve open state, focus-visible state and answer spacing.

## Acceptance

- No new runtime dependency.
- No event copy/data changes.
- No API/registration changes.
- No Vercel deployment.
- `prefers-reduced-motion` remains supported.
- Full CI including Docker runtime smoke must pass before merge.
