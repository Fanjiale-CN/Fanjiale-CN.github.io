# Galok Failure Playbook

## First rule: find the first red stage

Classify the failure before changing code.

1. `galok:prepare`
2. `galok:preflight`
3. `git push`
4. GitHub workflow admission
5. fast deterministic CI
6. runtime CI
7. deployment/Cloudflare
8. production verification
9. platform/infrastructure

A red GitHub Action after a successful push is not a Git push failure.

## Deterministic failures: do not rerun unchanged

### Discovery / Pagefind reproducibility

Symptoms:

- generated discovery files changed
- Pagefind page count/source hash changed
- search catalog/feed/sitemap diff

Action:

```bash
npm run galok:prepare
git diff
```

Commit the generated artifacts with the source change, then:

```bash
npm run galok:preflight
```

Do not rerun the same commit.

### Reading font stack

A preferred face may miss a glyph. That is normal when the canonical fallback resolves it.

Only act when the checker reports a **complete project-owned stack miss** or invalid/missing font asset.

Action:

- record character and Unicode code point
- identify source page
- verify whether canonical rare fallback should cover it
- if unresolved, open a dedicated typography-maintenance change
- do not rebuild the whole base font for routine content
- do not create per-entry fontfix CSS

### Package/lock mismatch

Action:

```bash
npm install
npm run check:package-contract
```

Review and commit `package.json` + `package-lock.json` together.

### Workflow policy / admission

If ordinary feature work created a workflow, delete the workflow and move implementation into `scripts/` or normal source.

For an approved stable workflow change:

- keep orchestration small
- inspect exact admission annotation
- fix YAML/step structure
- never embed payloads or giant scripts

### SEO / canonical / publishing

Fix the canonical content/metadata source. Re-run prepare because sitemap/feed/catalog may depend on the correction.

Do not patch only the generated file.

### Observability

Run canonical synchronization:

```bash
npm run galok:prepare
```

Do not manually paste GA4/Clarity/Cloudflare blocks into many pages.

## Runtime failures

### Accessibility

Inspect the specific rule, route, and node count. Fix the new regression. Historical baseline exceptions are not permission to increase the baseline without evidence.

### Visual

Use the saved visual evidence. Identify:

- route
- viewport
- geometry/overflow issue
- asset request issue
- approved benign Chromium media cancellation

Only proven benign media aborts may be ignored.

### Search

If fast discovery was green but runtime search is red, the issue is search behavior/query/runtime wiring rather than stale committed artifacts.

### Lighthouse

Identify the metric that regressed:

- LCP
- CLS
- TBT/INP proxy
- transfer weight
- request count

Fix the source cause. Do not lower thresholds first.

## Operational failures

### Cloudflare credentials

Repair secret/token/account permissions. Do not change site code to hide an authentication failure.

### Media/R2 object missing

Verify object existence and HTTP response before rewriting site references.

### Route propagation

Keep upload/deploy success separate from public-route success. Retry only within the documented propagation window and record HTTP status/body.

## Platform failures

Queued/no-log/platform incidents may be retried once after checking service status.

A platform retry must not be accompanied by random source changes.

## What not to do

- "try another push" without root-cause change
- create a temporary workflow to fix a failed workflow
- disable hooks
- delete a validator
- lower a gate threshold just to get green
- discard generated diffs
- push directly to main
