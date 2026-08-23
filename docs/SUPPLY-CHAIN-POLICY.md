# Digital Capital — Supply Chain Policy

## Purpose

The repository treats dependency install scripts as executable supply-chain code. A dependency is not allowed to gain a new `preinstall`, `install`, `postinstall`, or registry `prepare` script silently during a normal dependency update.

## Supported toolchain

- Node.js: `24.x`
- npm: `>=11.17.0 <12`

The repository declares this in `engines` and `devEngines`. `.npmrc` enables `engine-strict=true`, so an unsupported toolchain is an installation error instead of a warning.

Vercel project `digitalcapital` is also configured for Node.js `24.x`.

## Install-script policy

`.npmrc` enables:

```text
strict-allow-scripts=true
```

`package.json` contains the reviewed `allowScripts` policy. Required scripts are approved only for reviewed versions; unwanted scripts are explicitly denied.

Current policy:

```json
{
  "allowScripts": {
    "unrs-resolver@1.12.2": true,
    "fsevents": false
  }
}
```

No wildcard or name-only **approval** is permitted without a separate review. A name-only `false` entry is intentional: npm deny rules are designed to survive future blanket approvals and keep that package's install scripts disabled.

## Why unrs-resolver is approved

The current dependency tree contains this development dependency path:

```text
eslint-config-next@16.3.2
└─ eslint-import-resolver-typescript@3.10.1
   └─ unrs-resolver@1.12.2
```

It is used by the ESLint TypeScript import resolver. The package declares:

```text
postinstall: node postinstall.js
```

The script uses `napi-postinstall` to check and prepare the platform-specific N-API binding used by the resolver.

Reviewed artifact for `unrs-resolver@1.12.2`:

```text
postinstall.js sha256 = 446a0aeed55eeb28eadd9ac31f0b71654265aba8ca5a99dbc22dab0b26a02469
napi-postinstall dependency = ^0.3.4
```

A future `unrs-resolver` version must not inherit this approval. Strict install must stop until the new version is reviewed and explicitly pinned.

## Why fsevents is denied

The first strict-policy run on npm `11.17.0` exposed `fsevents@2.3.3` as another package npm considered to have an install script.

`fsevents` is an optional macOS-only file-system watcher. Its upstream `2.3.3` package source does not declare an install script and ships a prebuilt `fsevents.node`, but npm has an open issue where registry metadata can synthesize a default `node-gyp rebuild` install step for this package.

Digital Capital does not need to approve that synthetic build step. The policy therefore records:

```json
{
  "fsevents": false
}
```

This is a deliberate deny, not an approval. The final DC-08 gate proved that removing this deny causes strict npm installation to block on `fsevents@2.3.3`.

See `docs/DC-08-SUPPLY-CHAIN-AUDIT.md` and `docs/DC-08-QUALITY-RESULT.md` for captured evidence.

## Update procedure

When `package-lock.json` changes:

1. Run `npm ci` with the repository `.npmrc`.
2. If npm reports an unreviewed install script, do not use a blanket approval.
3. Run `npm approve-scripts --allow-scripts-pending` (or the equivalent read-only npm install-script listing command).
4. Identify why the package is present with `npm explain <package>` or inspect the lockfile for optional/platform-specific entries.
5. Inspect the package manifest and install script.
6. Record the exact package version and, where practical, a SHA-256 of the reviewed script.
7. Decide whether the script is required. Prefer removing the dependency if it is unnecessary.
8. If approval is required, add only an exact-version `true` entry.
9. If the script is unwanted or synthetic, use an explicit `false` deny rather than approving it.
10. Run production/full `npm audit`, lint, typecheck, and production build.
11. Commit the lockfile only if it was intentionally changed by the dependency operation.

## Prohibited shortcuts

Do not use these as routine fixes:

- `npm approve-scripts --all`
- name-only approvals that silently cover future versions
- `dangerously-allow-all-scripts`
- `--ignore-scripts` as a way to make a broken native dependency appear installed
- `npm audit fix --force` without a separate dependency review

## Quality gate expectation

A release-quality dependency install must prove:

- supported Node/npm versions;
- `npm ci` succeeds with strict script policy;
- no pending/unreviewed install scripts remain;
- the exact `unrs-resolver@1.12.2` approval is present;
- `fsevents` remains explicitly denied;
- removing the `unrs-resolver` approval makes strict installation fail on `unrs-resolver@1.12.2`;
- removing the `fsevents` deny makes strict installation fail on `fsevents@2.3.3`;
- production and full npm audits pass;
- lint, typecheck, and production build pass.
