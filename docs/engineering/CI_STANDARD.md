# Galok CI Standard

## One authoritative site validation workflow

Normal site validation is owned by:

```text
.github/workflows/validate-site.yml
```

Do not create a second feature-specific validation workflow for Reading, a city, a patch, a migration, or a preflight.

The historical duplicate `Verify Reading Artifacts` workflow is retired; Reading font/discovery gates belong to the main fast phase.

## Stable workflow allowlist

The repository policy currently permits these workflows:

- `deploy-radar-worker.yml`
- `migrate-galok-media.yml`
- `notify-indexnow.yml`
- `publish-media-health.yml`
- `refresh-radar-live.yml`
- `validate-site.yml`

Adding or retiring a workflow is an engineering-governance change and must update `scripts/validate-workflow-policy.mjs` intentionally.

## Fast phase

The site workflow runs deterministic gates first:

1. package/lock contract
2. stable workflow policy
3. Reading owned font-stack coverage
4. discovery rebuild/reproducibility
5. lightweight release validators
6. experience validator
7. HTML/routes/fragments/R2 validation
8. resource budgets

These steps are fail-fast. If one fails, expensive browser/Lighthouse work must not run.

This means a stale Pagefind build produces one clear red step, not a five-minute run followed by a misleading generic release-gate failure.

## Runtime phase

Only after fast gates pass:

- static server readiness
- computed Reading font resolution
- accessibility
- archive search
- observability runtime
- Radar interaction/reduced motion
- visual acceptance
- Lighthouse

Runtime gates use `continue-on-error` so one run can collect multiple browser regressions. The final runtime enforcement script prints the exact failed gate list and remediation hints.

## Workflow policy

Forbidden:

- `tmp`, `once`, `preflight`, `retry`, installer/finalizer feature workflows
- encoded base64/gzip/zlib payload delivery through YAML
- huge inline scripts in YAML
- `contents: write` on validation workflows
- `git push` from Actions except the explicitly approved isolated migration flow
- direct Action mutation of `main`

The approved R2 media migration creates an isolated branch and opens a PR; it never writes generated changes directly to main.

## Admission/YAML failures

The strongest prevention for historical workflow-parse failures is architectural: normal development cannot create workflows at all.

If a stable workflow genuinely must change, keep the YAML as orchestration only; put implementation logic in `scripts/`. Review the workflow diff as an infrastructure change.

## Red-light interpretation

Record the first red stage:

```text
local prepare
local preflight
git push
workflow admission
fast CI
runtime CI
deployment
production verification
platform/infrastructure
```

Do not call every post-push red light a "Git push failure."
