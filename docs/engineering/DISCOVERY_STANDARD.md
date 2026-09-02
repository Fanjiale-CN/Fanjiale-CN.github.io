# Galok Discovery Standard

## What "Discovery" means

Discovery is the set of deterministic files that let Galok content be found by people, site search, feed readers, and external search engines.

The canonical chain is:

```text
HTML / route / metadata
        ↓
Discovery build
        ├── sitemap.xml
        ├── feed.xml
        ├── index/search-catalog.json
        └── pagefind/**
```

These outputs are different products of the same candidate.

- **Pagefind**: full-text site-search index.
- **Search Catalog**: Galok's structured content cards/metadata for the Index experience.
- **Sitemap**: canonical public URL inventory for search engines.
- **Feed**: machine-readable publication/update feed.

## The invariant

After a candidate is committed:

```bash
npm run build:discovery
node scripts/verify-generated-discovery.mjs
```

must produce no deterministic discovery diff.

The strict committed contract includes:

```text
sitemap.xml
feed.xml
index/search-catalog.json
pagefind/build.json
```

If rebuild changes one of those files, the candidate is incomplete and must not be pushed.

## Clock independence

A committed candidate must generate the same Discovery output regardless of when CI happens to run.

This is forbidden:

```text
same commit
23:59 → one feed/sitemap date
00:01 → a different feed/sitemap date
```

Publication and last-modified dates follow this precedence:

- explicit content metadata where appropriate (`datePublished` / `dateModified`)
- already committed feed/sitemap dates for unchanged content
- the candidate release date only for genuinely changed/new working-tree content during preparation
- stable Git path history only as a fallback

A synthetic PR merge commit, runner clock, timezone boundary, file mtime, or runner image must never silently rewrite committed Discovery output.

CI proves this by rebuilding the same committed candidate under deliberately different synthetic release dates:

```bash
npm run check:discovery-clock
```

The check currently uses both `1999-01-01` and `2099-12-31`. Both rebuilds must remain byte-stable.

## Required workflow

Before commit:

```bash
npm run galok:prepare
```

The prepare command performs discovery build, observability synchronization, and a final discovery rebuild.

Then review and commit the source + generated output atomically.

After commit:

```bash
npm run galok:preflight
```

Preflight rebuilds discovery, verifies the committed output, and proves clock independence. If the commit is complete, every rebuild is reproducible and clean.

## What changes should make an agent think "Discovery"

Always prepare discovery when changing:

- an indexable HTML page
- route/path/canonical URL
- title, excerpt, or searchable article text
- publication/indexability state
- sitemap/feed/search/catalog/discovery scripts
- the Index/search experience
- public-page observability markup that changes HTML

Agents do not need to manually guess which generated files changed. Run the canonical preparation command and inspect its diff.

## Why Pagefind is not a separate manual task

Do not "tell Pagefind that an article is coming." Pagefind indexes the future candidate after that candidate exists on the development branch.

The correct model is:

```text
candidate source exists
        ↓
Pagefind scans candidate
        ↓
future search index is generated
        ↓
source + future index are committed together
```

## Failure classes prevented

This standard directly targets the historical `DISCOVERY` family: stale Pagefind output, search catalog drift, sitemap/feed drift, source hashes/page counts that no longer match the candidate, plus the post-audit `DISCOVERY_CLOCK` failure where the same commit changed after midnight.

A deterministic discovery failure is not transient. Re-running without updating the commit is useless.
