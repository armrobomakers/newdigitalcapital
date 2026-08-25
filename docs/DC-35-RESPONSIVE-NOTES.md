# DC-35 responsive hardening

## Goal

Make the curated UI passes from DC-31 through DC-34 work as a coherent mobile/tablet site, not only as desktop compositions.

## Mobile changes

- hero visual height reduced so the first screen is not dominated by artwork;
- hero metadata and CTA spacing tightened without reducing tap targets;
- statistic cards become significantly shorter and icon surfaces smaller;
- audience cards reduce vertical length while keeping all copy visible;
- speaker cards reduce portrait/card height on phones;
- registration shell and source-owned form primitives receive mobile density rules;
- lower sections share a consistent mobile vertical rhythm;
- location cards and advantages stack cleanly;
- sticky registration CTA respects `safe-area-inset-bottom`;
- very narrow devices (`<=359px`) get an additional program/hero fallback.

## Tablet changes

- speakers use a 2 + centered 1 composition rather than three full-width vertical cards;
- hero visual and registration spacing are reduced;
- navigation menu touch targets remain at least 44px high.

## Non-goals

- no copy changes;
- no API/registration behavior changes;
- no animation runtime;
- no Vercel deployment;
- no invented hall/contact/partner data.

## Acceptance

Full project CI and Docker runtime smoke must pass before merge. `ui:pattern:test` verifies the responsive layer, sticky CTA hook, safe-area handling and breakpoint contracts remain wired.
