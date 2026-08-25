# Digital Capital visual QA

## Goal

Review UI changes without creating a Vercel deployment. Pull requests generate responsive screenshots from the local production build inside GitHub Actions.

## Workflow

`.github/workflows/visual-review.yml` runs independently from the main release CI and produces the artifact:

`digital-capital-visual-review-<commit-sha>`

The artifact is retained for 14 days and contains:

- `landing-desktop.png` — 1440 × 1000, full page;
- `landing-tablet.png` — 1024 × 900, full page;
- `landing-mobile.png` — 390 × 844, full page;
- `ui-gallery-desktop.png` — source-owned UI gallery, desktop;
- `ui-gallery-mobile.png` — source-owned UI gallery, mobile;
- `manifest.txt` — commit, viewport and screenshot hashes;
- `server.log` — local production server log.

## Internal gallery

`/internal/visual-review` is a runtime-gated visual fixture.

It returns 404 unless:

`VISUAL_REVIEW_ENABLED=true`

The GitHub screenshot workflow sets this value explicitly. Normal production does not.

The gallery may use safe unresolved markers such as:

- `TODO_ORGANIZER_PHONE`
- `TODO_PRIVACY_EMAIL`
- `TODO_BRANDED_SITE_URL`
- `TODO_EVENT_HALL`
- `TODO_ENTRY_INSTRUCTIONS`

These values are visual fixtures only. They must never be treated as confirmed event facts or used to satisfy launch readiness.

## Review order

1. Main `Digital Capital CI` must pass.
2. `Digital Capital Visual Review` must pass.
3. Inspect desktop landing screenshot for hierarchy and overflow.
4. Inspect tablet screenshot for grid transitions and navigation.
5. Inspect mobile screenshot for vertical rhythm, sticky CTA clearance and horizontal overflow.
6. Inspect UI gallery screenshots for form controls, choice cards, consent rows and status surfaces.
7. Merge only after both workflows are green and the screenshot set is visually acceptable.

## Release discipline

Visual review does not call Vercel and must remain independent from Vercel APIs, deployments and preview URLs. Production deployment stays a separate deliberate action after a consolidated, reviewed batch.
