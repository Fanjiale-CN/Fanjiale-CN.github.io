# Galok Development Standard

## Purpose

Galok is no longer a "edit HTML and upload it" site. Content, discovery, typography, observability, validation, browser behavior, performance, and production routing are connected. The development standard exists to make a change complete before it reaches GitHub.

The governing rule is:

> GitHub Actions is the final auditor, not the first place we discover that a candidate forgot its generated artifacts.

## Standard lifecycle

### 1. Branch

Normal development starts from an up-to-date `main` and runs on a named branch:

- `feat/...`
- `fix/...`
- `chore/...`
- `work/...`

Direct development or push from `main` is forbidden.

### 2. Source work

Edit the intended source files. Keep the change scoped. Do not create a temporary GitHub Actions workflow to perform normal editing, migration, patching, generation, or validation.

Reusable implementation logic belongs in source files or `scripts/`.

### 3. Candidate preparation

Before commit:

```bash
npm run galok:prepare
```

This is the deterministic preparation phase. It synchronizes the shared shell, builds discovery, synchronizes observability against the candidate sitemap, then rebuilds discovery so the final generated state matches the final HTML.

The command is allowed to modify deterministic generated/source-synchronized files.

### 4. Review the complete diff

Inspect:

```bash
git status --short
git diff
```

A content/route change may legitimately include generated changes such as:

- `feed.xml`
- `sitemap.xml`
- `index/search-catalog.json`
- `pagefind/**`
- deterministic observability/shell synchronization

Do not discard these diffs merely because they were generated.

### 5. Atomic commit

Commit the source change and all deterministic artifacts caused by that source change together.

Do not use the historical pattern:

1. commit page
2. push
3. wait for CI to complain about Pagefind
4. commit generated files
5. push again

The correct pattern is one complete candidate commit.

### 6. Preflight

After the complete candidate is committed and before push:

```bash
npm run galok:preflight
```

Preflight verifies:

- branch discipline
- package/lock contract
- workflow policy
- discovery reproducibility
- lightweight repository release validators
- experience platform
- resource budget
- observability markup
- project-owned Reading font-stack coverage

A successful result ends with:

```text
GALOK PREFLIGHT PASSED — READY TO PUSH
```

### 7. Push and PR

Push the branch. The installed pre-push hook runs the same preflight.

Open/update a PR into `main`. Normal changes reach `main` only by merge.

### 8. GitHub CI

The authoritative site workflow has two phases.

**Fast deterministic gates** run first. If any fast gate fails, browser, visual, and Lighthouse work does not run.

**Runtime gates** run only after fast gates pass. Runtime gates collect browser/search/a11y/visual/performance evidence and print an explicit failed-gate list.

### 9. Merge and production

Merge only with required checks green. A successful main validation then runs production-route verification against `https://www.galok.me`.

## What agents must never do

- direct push to `main`
- create a one-off `tmp`, `once`, `preflight`, `retry`, or installer workflow
- put large scripts or encoded binary payloads into workflow YAML
- rerun a deterministic failure without root-cause change
- lower a quality threshold solely to obtain green CI
- ignore Pagefind/discovery generated diffs
- rebuild frozen base fonts for routine text additions
- use a base-font miss as a reason to fail when the canonical fallback stack resolves the glyph
- change `package.json` without a synchronized lockfile
- treat the final red aggregator as the root cause without inspecting the first real failed gate

## Domain standards

- Discovery: `DISCOVERY_STANDARD.md`
- Typography: `TYPOGRAPHY_STANDARD.md`
- CI: `CI_STANDARD.md`
- Historical failure prevention: `FAILURE_PREVENTION_MATRIX.md`
- Failure response: `FAILURE_PLAYBOOK.md`
- Work/Codex prompts: `WORK_CODEX_PROMPTS.md`
