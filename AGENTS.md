# Galok agent contract

This file is the repository entry point for every coding agent, Work session, Codex task, automation, and manual development session.

The goal is simple: source changes must arrive at GitHub as a complete release candidate, not as a partial change that relies on GitHub Actions to discover missing generated files.

## Mandatory development sequence

1. Never develop directly on `main`. Create or reuse a feature/fix/chore branch.
2. Read `docs/engineering/DEVELOPMENT_STANDARD.md`.
3. Read the domain standard for the area you will touch:
   - routes, search, Pagefind, feed, sitemap, Index → `docs/engineering/DISCOVERY_STANDARD.md`
   - Reading Chinese typography or fonts → `docs/engineering/TYPOGRAPHY_STANDARD.md`
   - workflows, CI, release gates → `docs/engineering/CI_STANDARD.md`
   - any failure or red Action → `docs/engineering/FAILURE_PLAYBOOK.md`
4. Make source changes only. Do not invent a task-specific workflow to perform normal development.
5. Before committing, run `npm run galok:prepare`.
6. Review `git diff` and `git status --short`. Source changes and deterministic generated artifacts belong in the same commit.
7. Commit the complete candidate.
8. Run `npm run galok:preflight`.
9. Push the feature branch only after preflight passes. The installed pre-push hook runs the same preflight and blocks an invalid push.
10. Open or update a pull request. Do not merge while required checks are red.
11. When CI fails, diagnose the first real failed gate. Never weaken, bypass, delete, or replace a validator merely to obtain green CI.

## Non-negotiable release rules

- `main` is merge-only for normal development. No direct human/agent push to `main`.
- Pagefind, `feed.xml`, `sitemap.xml`, `index/search-catalog.json`, and other deterministic discovery outputs must be generated before commit and land atomically with the source change that caused them.
- Routine Reading work must not rebuild large frozen base font binaries. Glyph absence in the preferred face is not a failure when the canonical fallback stack resolves it.
- A font failure means the complete project-owned fallback stack cannot resolve a required glyph, a required font asset is invalid/missing, or the semantic font policy was violated.
- Do not create `tmp`, `once`, `preflight`, `retry`, installer, or task-specific GitHub Actions workflows. Reusable logic belongs under `scripts/`.
- Do not embed large base64/gzip/zlib payloads or large executable programs in workflow YAML.
- Validation workflows are read-only. The only repository-writing operational workflow currently approved is the isolated R2 media migration workflow, which writes to a new branch and opens a PR.
- `package.json` and `package-lock.json` are one contract. Dependency changes must update both.
- Generated diffs are evidence, not noise. Never ignore or discard them without understanding why they changed.

## Stable commands

- Prepare a candidate: `npm run galok:prepare`
- Verify a committed candidate before push: `npm run galok:preflight`
- Lightweight release validators: `npm run release:core`
- Discovery rebuild: `npm run build:discovery`
- Reading font coverage: `npm run check:reading-fonts`
- Workflow policy: `npm run check:workflow-policy`
- Package/lock contract: `npm run check:package-contract`

## Failure discipline

Use `docs/engineering/FAILURE_PREVENTION_MATRIX.md` for the historical failure classes and their permanent controls.

A retry is appropriate only for a proven transient platform/network condition. Re-running deterministic failures such as stale Pagefind artifacts, invalid YAML, missing glyph coverage, lockfile mismatch, broken metadata, or failed validators without changing the cause is forbidden.

## Prompting Work / Codex

Use the maintained prompts in `docs/engineering/WORK_CODEX_PROMPTS.md`. They encode this contract and must not be replaced by ad-hoc instructions that permit direct-main pushes, temporary workflows, skipped generation, or validator bypasses.
