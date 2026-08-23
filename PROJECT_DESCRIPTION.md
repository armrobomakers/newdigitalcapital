# Project Description

Digital Capital is a Next.js conference platform for «Цифровой капитал».

Core requirements:
- App Router + TypeScript + Tailwind CSS;
- typed multi-event Conference Engine;
- fail-closed lifecycle and lead-capture rules;
- launch-readiness gates for registration and paid traffic;
- archive-safe rendering when business facts are unverified;
- deterministic Node 24 / npm 11 builds;
- supported Docker runtime on port 7485;
- intentional, batched Vercel production deployment rather than per-commit builds.

Current public content is an archive event. Future event facts must be validated through the activation workflow before being added to runtime catalogs.
