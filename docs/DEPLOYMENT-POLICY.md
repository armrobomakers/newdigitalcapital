# Digital Capital deployment policy

## Principle

Vercel is not CI. Automatic Git-triggered deployments are disabled in `vercel.json` with `git.deploymentEnabled: false`.

Development and validation happen in GitHub. Vercel is used only after a complete batch of approved changes is ready for release.

## Standard flow

1. Create a feature/stage branch from `main`.
2. Implement the complete batch without Vercel deployments.
3. Open a pull request to `main`.
4. Pass the permanent GitHub CI gate:
   - strict `npm ci`;
   - install-script review check;
   - production/full npm audit;
   - ESLint;
   - TypeScript;
   - production Next.js build;
   - local runtime smoke;
   - security-header smoke;
   - archive/readiness safety checks.
5. Review the cumulative diff and approve the batch.
6. Merge only the approved batch to `main`.
7. Trigger exactly one Vercel deployment manually for the validated `main` commit.
8. Run production smoke against the deployed URL and `/api/health`.

## No-deploy cases

Do not trigger Vercel for:
- intermediate commits;
- documentation-only changes;
- CI/test harness changes;
- stage evidence commits;
- branch cleanup;
- exploratory fixes that have not passed the GitHub gate.

## Release safety

A new conference must stay gated until its real business data and operational dependencies are ready. The platform should remain fail-closed when any required launch dependency is missing.

For the current archive release this means:
- archived EKB event remains `past`;
- all lead capture remains closed;
- indexing remains disabled;
- unverified location/contact data is not presented as confirmed fact.

## Vercel limit handling

If Vercel returns a build-rate-limit error, do not retry repeatedly. Continue work and validation in GitHub. Retry Vercel only when the limit is confirmed available and a complete release batch is ready.
