# DC-08 Supply Chain Audit

- Initial audit commit: `971ac6d3e8ee8eb77093a74b4f8f298e8bb80b37`
- Node: `v24.19.0`
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

## Initial pending-script inventory

Before strict enforcement, npm reported:

```text
1 package has install scripts not yet covered by allowScripts:
  unrs-resolver@1.12.2 (postinstall: node postinstall.js)
```

This led to an exact-version approval for `unrs-resolver@1.12.2` after reviewing the package purpose and postinstall artifact.

## Strict-mode discovery: fsevents

The first `strict-allow-scripts=true` quality run then failed with:

```text
ESTRICTALLOWSCRIPTS
fsevents@2.3.3 (install: install scripts present)
```

This second package did not appear in the initial read-only pending list on the Linux audit run, but strict `npm ci` treated it as an uncovered install script.

`fsevents@2.3.3` is an optional macOS-only watcher. Upstream source does not declare an install script and ships a prebuilt native module. npm has an open issue describing registry metadata that can synthesize the default `node-gyp rebuild` install action for this version. The project therefore does **not** approve the script and records a permanent deny:

```json
{
  "fsevents": false
}
```

## Final policy discovered by enforcement

```json
{
  "allowScripts": {
    "unrs-resolver@1.12.2": true,
    "fsevents": false
  }
}
```

The final quality gate proves that this policy gives a clean strict install with no unreviewed scripts, while independently removing either the `unrs-resolver` approval or the `fsevents` deny makes npm fail closed on the corresponding package.
