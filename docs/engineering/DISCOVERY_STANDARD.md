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

If rebuild changes a committed generated file, the candidate is incomplete and must not be pushed.

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

Preflight rebuilds discovery again. If the commit is complete, the rebuild is reproducible and clean.

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

This standard directly targets the historical `DISCOVERY` family: stale Pagefind output, search catalog drift, sitemap/feed drift, and source hashes/page counts that no longer match the candidate.

A deterministic discovery failure is not transient. Re-running without updating the commit is useless.
