# DC-04 Dependency Audit

- Tested commit: `ff095e7d9c52621314b8a7ce86314f5df27e60fa`
- Node: `v24.19.0`
- Full audit counts: `{"info":0,"low":0,"moderate":0,"high":6,"critical":0,"total":6}`
- Production-only audit counts: `{"info":0,"low":0,"moderate":0,"high":4,"critical":0,"total":4}`

## Production dependency findings
- **nanoid** — high; direct=false; range=`<=3.3.17`; fix=available; via=nanoid:nanoid: non-secure generators can loop indefinitely with negative size:<3.3.16; nanoid:nanoid: custom generators can loop indefinitely when size is zero:<3.3.18; effects=
- **next** — high; direct=true; range=`9.3.4-canary.0 - 16.3.0-preview.10`; fix={"name":"next","version":"16.3.2","isSemVerMajor":false}; via=postcss; sharp; effects=
- **postcss** — high; direct=false; range=`<=8.5.22`; fix={"name":"next","version":"16.3.2","isSemVerMajor":false}; via=postcss:PostCSS has XSS via Unescaped </style> in its CSS Stringify Output:<8.5.10; postcss:PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments:<=8.5.11; postcss:PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset:<=8.5.22; postcss:PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure:<=8.5.17; effects=next
- **sharp** — high; direct=false; range=`<0.35.0`; fix={"name":"next","version":"16.3.2","isSemVerMajor":false}; via=sharp:sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591:<0.35.0; effects=next

## Full dependency findings
- **brace-expansion** — high; direct=false; range=`<=1.1.17 || 3.0.0 - 5.0.8`; fix=available; via=brace-expansion:brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups:<1.1.16; brace-expansion:brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups:>=3.0.0 <5.0.7; brace-expansion:brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash:<1.1.17; brace-expansion:brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash:>=4.0.0 <5.0.8; brace-expansion:brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation:>=4.0.0 <5.0.9; brace-expansion:brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation:<1.1.18; effects=
- **js-yaml** — high; direct=false; range=`4.0.0 - 4.3.0`; fix=available; via=js-yaml:js-yaml: YAML merge-key chains can force quadratic CPU consumption:>=4.0.0 <4.3.0; js-yaml:JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported:>=4.0.0 <4.3.1; effects=
- **nanoid** — high; direct=false; range=`<=3.3.17`; fix=available; via=nanoid:nanoid: non-secure generators can loop indefinitely with negative size:<3.3.16; nanoid:nanoid: custom generators can loop indefinitely when size is zero:<3.3.18; effects=
- **next** — high; direct=true; range=`9.3.4-canary.0 - 16.3.0-preview.10`; fix={"name":"next","version":"16.3.2","isSemVerMajor":false}; via=postcss; sharp; effects=
- **postcss** — high; direct=true; range=`<=8.5.22`; fix={"name":"next","version":"16.3.2","isSemVerMajor":false}; via=postcss:PostCSS has XSS via Unescaped </style> in its CSS Stringify Output:<8.5.10; postcss:PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments:<=8.5.11; postcss:PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset:<=8.5.22; postcss:PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure:<=8.5.17; effects=next
- **sharp** — high; direct=false; range=`<0.35.0`; fix={"name":"next","version":"16.3.2","isSemVerMajor":false}; via=sharp:sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591:<0.35.0; effects=next

## Direct package updates visible to npm outdated
- **@types/node** current=`24.13.2` wanted=`24.13.3` latest=`26.2.0` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/@types/node`
- **@types/react** current=`19.2.17` wanted=`19.2.18` latest=`19.2.18` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/@types/react`
- **@types/react-dom** current=`19.2.3` wanted=`19.2.4` latest=`19.2.4` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/@types/react-dom`
- **autoprefixer** current=`10.5.0` wanted=`10.5.4` latest=`10.5.4` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/autoprefixer`
- **eslint** current=`9.39.4` wanted=`9.39.5` latest=`10.9.0` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/eslint`
- **eslint-config-next** current=`16.2.12` wanted=`16.2.12` latest=`16.3.2` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/eslint-config-next`
- **next** current=`16.2.12` wanted=`16.2.12` latest=`16.3.2` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/next`
- **postcss** current=`8.5.15` wanted=`8.5.26` latest=`8.5.26` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/postcss`
- **react** current=`19.2.7` wanted=`19.2.8` latest=`19.2.8` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/react`
- **react-dom** current=`19.2.7` wanted=`19.2.8` latest=`19.2.8` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/react-dom`
- **tailwindcss** current=`3.4.19` wanted=`3.4.19` latest=`4.3.3` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/tailwindcss`
- **typescript** current=`5.9.3` wanted=`5.9.3` latest=`7.0.2` location=`/home/runner/work/newdigitalcapital/newdigitalcapital/node_modules/typescript`
