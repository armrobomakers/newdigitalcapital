# DC-02 Quality Gate Result

- Tested commit: `d908176261de388810051162e4af642b8715126a`
- Node: `v24.19.0`
- npm: `11.17.0`
- npm ci: **success**
- lint: **success**
- typecheck: **failure**
- build: **skipped**

## Typecheck diagnostics
```text

> newdigitalcapital@1.0.0 typecheck
> tsc --noEmit

app/api/health/route.ts(25,36): error TS2367: This comparison appears to be unintentional because the types '"past"' and '"sales"' have no overlap.
components/landing.tsx(470,45): error TS2339: Property 'registrationOpen' does not exist on type 'EventLifecycle'.
components/sticky-cta.tsx(8,47): error TS2339: Property 'registrationOpen' does not exist on type 'EventLifecycle'.
```
