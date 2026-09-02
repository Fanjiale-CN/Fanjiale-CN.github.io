# Galok development and main push standard

These rules apply to every coding agent, automation, and manual development session in this repository.

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

## Reading font policy

Reading has one Chinese text system. Do not create separate Chinese font stacks for classical text, UI, diagrams, chapter titles, Simplified Chinese, or Traditional Chinese.

Canonical runtime rules:

- **All ordinary Chinese** — Simplified or Traditional, body or UI, classical quotation or modern annotation, chapter title or diagram label — uses `Source Han Serif TC` through `--reading-cjk`.
- **Only explicit book-title display nodes** use QIJIC. Mark those nodes with `.reading-book-title-zh`. Current book titles are `東京夢華錄`, `鹽鐵論`, and `管子`.
- **HanaMin** is a last-resort glyph fallback only for characters absent from Source Han Serif TC. It is not a second design face.
- Latin display remains on the existing Bagnard / Gambetta hierarchy.

Canonical font assets:

- `assets/fonts/source-han-serif-tc-reading.woff2`
- `assets/fonts/qiji-reading-title.woff2`
- `assets/fonts/hanamin-reading-rare.woff2`

The canonical stylesheet is `reading/reading-type-system.css`. Do not reintroduce `qijic-type-system.css`, `reading-display-20260902.css`, GenRyu runtime assets, Entry-specific font families, `fixed` fonts, or `supplement` fonts.

Routine Reading content work must run `npm run check:reading-fonts`. The checker scans the actual Reading HTML corpus. If a new ordinary Chinese glyph is absent from the committed Source Han/HanaMin subset, stop and perform one typography-maintenance rebuild with `scripts/build-reading-font-subsets.py`; do not create a per-entry font. If a future book title is added, mark only the actual book-title display element with `.reading-book-title-zh` and update the book-title reserve/checker deliberately.

`scripts/build-reading-font-subsets.py` is maintenance-only. It downloads the official Source Han Serif TC, QIJIC, and HanaMin sources, rebuilds the canonical subsets, and removes the obsolete GenRyu runtime asset. Do not run it automatically for every content commit.

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

If `check:reading-fonts` fails, inspect the reported glyph and source path. Ordinary Chinese must remain on Source Han Serif TC with HanaMin only for genuinely unsupported rare glyphs; book-title QIJIC coverage must remain direct. Rebuild the three canonical assets in a typography-maintenance commit when needed. Never solve a missing glyph with a supplement, Entry-specific family, or hidden fallback policy.

If GitHub Actions fails after a successful local gate, inspect the exact failed job and fix the root cause. Do not create a temporary workflow to work around it.
