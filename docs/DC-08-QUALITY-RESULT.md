# DC-08 Quality Gate Result

- Tested commit: `dd27b73c483ff6d3a9820ecea62a5245e2d7317a`
- GitHub Actions run: `32622793431`
- Node: `v24.19.0`
- npm: `11.17.0`
- toolchain policy: **success**
- strict npm ci: **success**
- pending install scripts: **none**
- approved script: `unrs-resolver@1.12.2` — **success**
- denied script: `fsevents` — **success**
- production audit: **success — 0 vulnerabilities**
- full audit: **success — 0 vulnerabilities**
- lint: **success**
- typecheck: **success**
- Next.js production build: **success**
- negative test without `unrs-resolver@1.12.2` approval: **success — install blocked**
- negative test without `fsevents` denial: **success — install blocked**

## Notes

The first strict-policy attempt surfaced an additional npm edge case: `fsevents@2.3.3` was treated by npm 11.17.0 as having an install script even on the Linux runner. The project does not approve that script. It records `fsevents: false`, while the reviewed native resolver script is allowed only for the exact `unrs-resolver@1.12.2` version.

The successful run reported `No packages with unreviewed install scripts.` after `npm ci`.
