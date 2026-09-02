# Galok development and main push standard

These rules apply to every coding agent, automation, and manual development session in this repository.

## Required companion standard

Before changing code, content, design, generated assets, workflows, or deployment configuration, read [GALOK_PROJECT_STANDARD.md](GALOK_PROJECT_STANDARD.md). It defines the shared development environment, branch and PR workflow, design system, Reading font pipeline, Discovery/Pagefind ownership, CI meaning, production verification, and cross-chat handoff format.

## Main branch release rule

`main` must only receive a commit after the repository release gate passes locally.

Required order:

1. Make the intended source changes.
2. Run `npm ci` in a fresh environment. This also installs the repository pre-push hook.
3. Run `npm run build:discovery` after any change that can affect routes, canonical URLs, search, feeds, sitemap, Pagefind, or indexable content.
4. Stage all intended source changes and every generated discovery file that belongs to the change.
5. Run `npm run release`.
6. If `npm run release` changes `feed.xml`, `sitemap.xml`, `index/search-catalog.json`, or anything under `pagefind/`, the release gate must fail. Stage the generated changes, rerun the gate, and do not continue until it exits successfully.
7. Inspect `git status --short`. Only intended files may remain.
8. Commit once.
9. Push `main`. The installed pre-push hook runs `npm run release` again and blocks the push if the release gate fails.
10. GitHub Actions remains the authoritative full browser, visual, accessibility, runtime, and Lighthouse validation after push.

## Forbidden workflow patterns

Do not create one-off `*-preflight.yml`, `work/*-preflight.yml`, or task-specific GitHub Actions workflows just to modify, materialize, validate, or push a feature.

Any workflow that must mutate repository contents must work on an isolated branch and open a pull request; never push generated or migrated content directly to `main`.

Do not embed large scripts, compressed blobs, gzip/base64 payloads, or opaque generated code in workflow environment variables. Put executable logic in readable files under `scripts/` and call those files from the stable workflow or package scripts.

Do not give a validation-only workflow `contents: write`. Use read-only permissions unless the workflow genuinely has to write repository contents.

Do not push `main` after only running an individual validator. `npm run release` is the minimum local release gate.

Do not ignore a dirty generated-discovery diff. A changed route, canonical URL, feed entry, sitemap entry, search catalog entry, or Pagefind output must be committed together with the source change that caused it.

Do not bypass, disable, delete, or replace the pre-push release guard to get a commit through.

## Stable CI architecture

Use repository scripts as the single source of development logic. Keep GitHub Actions small and readable: checkout, install dependencies, call repository scripts, publish reports.

Temporary feature logic belongs in normal source or `scripts/`, never in encoded YAML payloads.

The local release gate is intentionally lighter than the final GitHub Actions suite. Full browser, visual, accessibility, runtime, Radar, search, and Lighthouse checks remain in GitHub Actions.

## Failure handling

If `npm run release` fails, stop the push and fix the failing gate.

If the failure is `check:generated-clean`, run or inspect `npm run build:discovery`, stage the resulting generated files, and rerun `npm run release`.

If GitHub Actions fails after a successful local gate, inspect the exact failed job and fix the root cause. Do not create a temporary workflow to work around it.
