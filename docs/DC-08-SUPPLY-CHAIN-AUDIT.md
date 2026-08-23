# DC-08 Supply Chain Audit

- Tested commit: `971ac6d3e8ee8eb77093a74b4f8f298e8bb80b37`
- Node: `v24.19.0`
- npm: `unknown`
- unrs-resolver version: `1.12.2`
- package postinstall: `node postinstall.js`
- postinstall.js sha256: `446a0aeed55eeb28eadd9ac31f0b71654265aba8ca5a99dbc22dab0b26a02469`
- napi-postinstall dependency: `^0.3.4`

## Dependency path
```text
unrs-resolver@1.12.2 dev
node_modules/unrs-resolver
  unrs-resolver@"^1.6.2" from eslint-import-resolver-typescript@3.10.1
  node_modules/eslint-import-resolver-typescript
    eslint-import-resolver-typescript@"^3.5.2" from eslint-config-next@16.3.2
    node_modules/eslint-config-next
      dev eslint-config-next@"16.3.2" from the root project
```

## Pending install scripts
```text
1 package has install scripts not yet covered by allowScripts:
  unrs-resolver@1.12.2 (postinstall: node postinstall.js)

Run `npm approve-scripts <pkg>` to allow, or `npm deny-scripts <pkg>` to deny.
```
