# Failure Prevention Matrix

This matrix converts the 123 failed GitHub Actions runs audited for 2026-08-24 through 2026-09-01 into permanent engineering controls. It also records new failure classes discovered while validating the governance system itself.

Problem fingerprints may overlap; counts are impact frequency, not mutually exclusive totals.

| Fingerprint | Audit hits | Permanent prevention | Detection / gate | If it still happens |
| --- | ---: | --- | --- | --- |
| DISCOVERY | 44 | `galok:prepare` rebuilds sitemap/feed/catalog/Pagefind; atomic commit required | discovery reproducibility fast gate + pre-push | rebuild, inspect generated diff, commit source + generated together |
| CONTENT | 18 | domain validators travel with content model changes | `release:core` / site validators | fix content/schema contract; never bypass validator |
| YAML | 16 | normal feature work cannot add workflows; stable workflow allowlist | workflow policy + GitHub admission | fix stable workflow YAML; implementation belongs in `scripts/` |
| SEO_META | 12 | deterministic discovery + canonical publishing validators | publishing/SEO fast validators | fix canonical/metadata source, rebuild discovery |
| OBS | 11 | `galok:prepare` synchronizes observability after candidate sitemap exists | observability check + runtime | run canonical sync; do not hand-edit page-by-page |
| A11Y | 9 | stable runtime baseline and representative routes | runtime accessibility gate | fix real regression; do not raise baseline just to pass |
| PATCH | 7 | no brittle remote text-patch workflows; edits happen in normal source/scripts | workflow policy + review | replace text-anchor surgery with structured source edit |
| VISUAL | 7 | browser evidence on stable viewports; approved benign media-abort handling | visual runtime gate | inspect route+viewport evidence; fix geometry or classify proven benign abort |
| HIDDEN_ADMISSION | 5 | workflow set is frozen/allowlisted for ordinary work | workflow policy + GitHub admission | inspect GitHub annotation; do not guess |
| FONT_COVERAGE | 5 | canonical primary + HanaMin/project fallback; preferred-face miss is allowed | font-stack coverage fast gate | only full owned-stack miss triggers typography maintenance |
| NPM_LOCK | 5 | package and lock metadata are one atomic contract | `check:package-contract` + `npm ci` | run npm install, review and commit lockfile |
| PAYLOAD | 4 | encoded/compressed payloads forbidden in YAML | workflow policy | store assets normally or use artifact/R2 tooling |
| WORKFLOW_STEP | 4 | ordinary work cannot create feature workflows | workflow allowlist | fix stable orchestration; every step needs valid `run`/`uses` semantics |
| FONT_ARTIFACT | 3 | frozen base font assets; routine content does not regenerate binary bases | font policy + git diff review | dedicated typography maintenance only |
| LIGHTHOUSE | 3 | performance baseline remains a real release gate | Lighthouse runtime gate | diagnose LCP/CLS/TBT/bytes; do not lower threshold first |
| PLATFORM_QUEUE | 2 | classified separately from source failures | first-red-stage discipline | retry once and check platform status; no source change unless evidence points to source |
| CF_AUTH | 2 | operational workflows explicitly validate credentials before mutation | Cloudflare credential step | repair secret/permission configuration; do not rewrite site code |
| MEDIA_404 | 2 | R2/link verification in fast gate | HTML/routes/R2 validator | verify object exists before rewriting refs |
| NPM_SCRIPT | 1 | stable package scripts and preflight entry points | preflight + CI | correct script contract; avoid ad-hoc command names |
| BROWSER_RACE | 1 | explicit server readiness and deterministic local runtime | static-server readiness / runtime scripts | wait on real readiness condition, not arbitrary sleep |
| ACTION_PUSH | 1 | validation workflows are read-only; approved migration pushes only isolated branch | workflow policy | use branch + PR; never disable pre-push to force an Action push |
| SCRIPT_SYNTAX | 1 | implementation logic lives in `.mjs/.py` files instead of giant YAML blocks | Node/Python execution + review | fix source script and rerun |
| ASSET_LOAD | 1 | referenced-asset/resource validation before runtime | link/resource gates | fix path, availability, preload or CORS cause |
| CF_ROUTE | 1 | deploy and public route verification are distinct steps | operational smoke tests | inspect route propagation/Worker config and HTTP status |
| DISCOVERY_CLOCK | post-audit | committed feed/sitemap dates cannot derive from runner wall clock or synthetic merge time | `check:discovery-clock` rebuilds at 1999 and 2099 + strict byte-diff gate | fix date provenance; never rerun unchanged across midnight |

## Coverage principle

Every recurring historical fingerprint has one of three controls:

1. **prevent before commit** — prepare/branch/atomicity
2. **block before push** — preflight/pre-push
3. **fail clearly in CI** — fast/runtime/operational gate

P0/P1 deterministic failures must never depend on "remembering" a manual step.

## Success metric

The target is not "Actions can never be red."

The target is:

- stale generated-artifact reds approach zero
- wall-clock-dependent discovery reds are impossible for a committed candidate
- font preferred-face misses no longer create false failures
- temporary-workflow YAML/admission failures approach zero
- duplicate validation workflows disappear
- ordinary feature PRs normally go green in one candidate push
- remaining reds correspond to real regressions, external service failures, or platform incidents
