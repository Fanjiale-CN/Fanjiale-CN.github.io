# Galok Typography Standard

## Goal

Typography must preserve Galok's visual identity without turning every new historical glyph into a release incident.

The governing rule is:

> Preferred-face coverage is aesthetic. Complete project-owned stack coverage is correctness.

A missing glyph in the preferred font is not a CI failure if an approved fallback resolves it.

## Reading font roles

The active Reading type system defines three semantic roles.

### 1. Primary Chinese serif

The canonical project-owned primary face for ordinary Reading Chinese. On the current main baseline this is the GenRyu Reading subset. A dedicated typography migration may replace the primary face, but it must preserve the fallback contract in this document.

### 2. Rare-glyph fallback

`HanaMin` is the project-owned rare CJK fallback. It is intentionally allowed to resolve glyphs absent from the primary face.

### 3. Book-title/display face

`QIJIC` is a visual display/book-title face. It is not required to contain every Chinese glyph. When QIJIC lacks a required glyph, the canonical serif stack may resolve it.

Platform fonts such as Noto/宋体/system serif may remain at the end of CSS font stacks as last-resort rendering safety, but deterministic CI must not depend on an unknown operating-system font. The project-owned stack must cover every required glyph.

## CI semantics

### PASS

```text
Primary face: MISS
HanaMin: HIT
=> PASS
```

or:

```text
QIJIC display face: MISS
Canonical serif stack: HIT
=> PASS
```

The checker should report that fallback occurred so typography remains observable, but it must not fail.

### FAIL

```text
Primary: MISS
HanaMin: MISS
=> FAIL
```

or any required project font file is missing/corrupt, or a semantic typography rule is violated.

## Routine content development

Routine Reading content must not rebuild large frozen base font assets simply because a new glyph appears.

The normal process is:

1. add/edit Reading text
2. run `npm run galok:prepare`
3. run `npm run galok:preflight`
4. font checker scans the complete Reading corpus
5. direct misses that resolve through fallback are reported and pass
6. only a full owned-stack miss requires typography maintenance

## Typography maintenance

A genuine unresolved glyph requires a dedicated typography-maintenance change. The maintainer must:

- identify the code point and source page
- choose an approved project-owned fallback with compatible licensing
- add/subset it intentionally
- update font license/source documentation
- run font coverage and browser font-resolution tests
- avoid per-entry "fontfix" CSS or endless supplement chains

Do not solve one missing glyph by replacing the entire site's font system.

## CJK range

Coverage checks must include BMP CJK, compatibility ideographs, Extension B–F ranges represented in the current corpus, and the modern Extension G/H area (`U+30000` and above) rather than silently ignoring newer historical characters.
