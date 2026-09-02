#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FINAL_CSS = r'''/* Galok Reading typography — canonical semantic system, 2026-09-02
   Chinese display/UI: QIJIC. Four source-locked glyphs absent from QIJIC fall through
   the same canonical GenRyu/HanaMin source stack; no supplement or per-entry font exists.
   Classical Chinese primary text: GenRyu + HanaMin rare fallback.
   Latin display: existing Bagnard/Gambetta system. */

@font-face {
  font-family: "Galok QIJIC Reading";
  src: url("/assets/fonts/qiji-reading-title.woff2?v=20260902-canonical-1") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: "Galok Reading Serif TW";
  src: url("/assets/fonts/genryu-reading-tw.woff2?v=20260902-canonical-1") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: "Galok HanaMin Reading";
  src: url("/assets/fonts/hanamin-reading-rare.woff2?v=20260902-canonical-1") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

:root {
  --reading-display-latin: "Galok Bagnard", "Galok Gambetta", "EB Garamond", Georgia, "Times New Roman", serif;
  --reading-display-cjk: "Galok QIJIC Reading", "Galok Reading Serif TW", "Galok HanaMin Reading", "Songti TC", STSong, "Noto Serif TC", serif;
  --reading-display-mixed: "Galok Bagnard", "Galok QIJIC Reading", "Galok Reading Serif TW", "Galok HanaMin Reading", "Galok Gambetta", Georgia, "Times New Roman", serif;
  --reading-primary-cjk: "Galok Reading Serif TW", "Galok HanaMin Reading", "Songti TC", STSong, "Noto Serif TC", serif;
}

/* Default Chinese in Reading is display/UI Chinese. */
.dongjing-page :where(:lang(zh-Hans), :lang(zh-Hant)),
.reading-room-page :where(:lang(zh-Hans), :lang(zh-Hant)),
.reading-page :where(:lang(zh-Hans), :lang(zh-Hant)),
.reading-note-page :where(:lang(zh-Hans), :lang(zh-Hant)),
.dj14-page .dj14-ticker,
.dj14-page .dj14-role b,
.dj14-page .dj14-center span {
  font-family: var(--reading-display-cjk) !important;
  font-weight: 400 !important;
  font-synthesis: none;
}

/* Classical source text is the only Chinese exception. */
.dongjing-page blockquote:where(:lang(zh-Hans), :lang(zh-Hant)),
.reading-note-page blockquote:where(:lang(zh-Hans), :lang(zh-Hant)),
.reading-note-page .reading-primary-text,
.reading-note-page .reading-primary-text :where(:lang(zh-Hans), :lang(zh-Hant)),
.dongjing-page .dj-entry-source .dj-columns {
  font-family: var(--reading-primary-cjk) !important;
  font-weight: 400 !important;
  font-synthesis: none;
}

/* Source labels inside otherwise-primary blocks remain display copy. */
.dongjing-page .dj-entry-source .dj-columns span:first-child {
  font-family: var(--reading-display-cjk) !important;
}

/* Legacy entries with untagged diagram labels are normalized here. */
.dj07-page .dj07-lane b,
.dj08-page .dj08-node b,
.dj08-page .dj08-menu-strip span,
.dj08-page .dj08-variant p span,
.dj09-page .dj09-stop b,
.dj09-page .dj09-medicine-mark,
.dj09-page .dj09-later b,
.dj09-page .dj09-variant p span {
  font-family: var(--reading-display-cjk) !important;
  font-weight: 400 !important;
  font-synthesis: none;
}

.dj07-page .dj07-source-full blockquote,
.dj08-page .dj08-source-line blockquote,
.dj09-page .dj09-text-unit blockquote,
.dj09-page .dj09-gate-rule blockquote {
  font-family: var(--reading-primary-cjk) !important;
  font-weight: 400 !important;
  font-synthesis: none;
}

/* Reading Room and article titles. */
.dongjing-page .dj-room-title .dj-title-zh,
.dongjing-page .dj-entry-title .dj-title-zh,
.reading-room-page .reading-room-title h1,
.reading-page .reading-room-title h1,
.reading-room-page .reading-room-map h3,
.reading-page .reading-room-map h3,
.reading-room-page .reading-drawer-entry-title .reading-drawer-entry-zh,
.reading-page .reading-drawer-entry-title .reading-drawer-entry-zh,
.reading-note-page .reading-article-title .reading-note-zh {
  font-family: var(--reading-display-cjk) !important;
  font-weight: 400 !important;
  font-synthesis: none;
  letter-spacing: .055em;
}

.dongjing-page .dj-room-title h2,
.dongjing-page .dj-entry-title h2,
.dongjing-page .dj-v3-section-head h2,
.reading-room-page .reading-room-title h2,
.reading-page .reading-room-title h2,
.reading-note-page .reading-article-title h1 {
  font-family: var(--reading-display-latin) !important;
  font-weight: 400 !important;
  font-synthesis: none;
}

.dongjing-page .dj-room-title .dj-title-zh,
.dongjing-page .dj-entry-title .dj-title-zh { line-height: .9; }
.reading-room-page .reading-room-title h1,
.reading-page .reading-room-title h1 { line-height: .88; }
.dongjing-page .dj-v3-section-head h2 { line-height: .93; letter-spacing: -.042em; }

/* Previous/Next and mixed-script editorial controls keep Latin typography while Chinese resolves to QIJIC. */
.dongjing-page .dj-entry-nav small,
.dongjing-page .dj-entry-nav strong,
.dongjing-page .dj-v3-entry-nav small,
.dongjing-page .dj-v3-entry-nav strong,
.reading-note-page .reading-note-nav small,
.reading-note-page .reading-note-nav strong {
  font-family: var(--reading-display-mixed) !important;
  font-weight: 400 !important;
  font-synthesis: none;
}

/* Explanatory diagrams / visual systems. */
.dongjing-page .dj15-strip :is(small, b, span),
.dongjing-page .dj15-evidence :is(small, b, span),
.dongjing-page .dj16-route :is(small, b, span),
.dongjing-page .dj16-fourfold :is(small, b, span),
.dongjing-page .dj17-landing :is(small, b, span),
.dongjing-page .dj17-people :is(small, b, span),
.dongjing-page .dj17-next :is(small, strong, em),
.dongjing-page .dj18-threshold :is(small, b, span, em, h3),
.dongjing-page .dj18-layer-grid :is(small, b, span),
.dongjing-page .dj18-variant-table :is(small, b, span, td, th),
.dongjing-page .dj18-exit :is(small, strong, em, span) {
  font-family: var(--reading-display-mixed) !important;
  font-weight: 400 !important;
  font-synthesis: none;
}

.dongjing-page .dj15-strip :where(:lang(zh-Hans), :lang(zh-Hant)),
.dongjing-page .dj15-evidence :where(:lang(zh-Hans), :lang(zh-Hant)),
.dongjing-page .dj16-route :where(:lang(zh-Hans), :lang(zh-Hant)),
.dongjing-page .dj16-fourfold :where(:lang(zh-Hans), :lang(zh-Hant)),
.dongjing-page .dj17-landing :where(:lang(zh-Hans), :lang(zh-Hant)),
.dongjing-page .dj17-people :where(:lang(zh-Hans), :lang(zh-Hant)),
.dongjing-page .dj17-next :where(:lang(zh-Hans), :lang(zh-Hant)),
.dongjing-page .dj18-threshold :where(:lang(zh-Hans), :lang(zh-Hant)),
.dongjing-page .dj18-layer-grid :where(:lang(zh-Hans), :lang(zh-Hant)),
.dongjing-page .dj18-variant-table :where(:lang(zh-Hans), :lang(zh-Hant)),
.dongjing-page .dj18-exit :where(:lang(zh-Hans), :lang(zh-Hant)) {
  font-family: var(--reading-display-cjk) !important;
}

@media (prefers-reduced-motion: reduce) {
  .dongjing-page *, .reading-note-page *, .reading-room-page *, .reading-page * { font-synthesis: none; }
}
'''

FINAL_CHECKER = r'''#!/usr/bin/env python3
from __future__ import annotations

import sys
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
READING_ROOT = ROOT / "reading"
FONT_DIR = ROOT / "assets" / "fonts"
DISPLAY_MANIFEST = ROOT / "scripts" / "reading-display-glyphs.txt"
GENRYU = FONT_DIR / "genryu-reading-tw.woff2"
QIJIC = FONT_DIR / "qiji-reading-title.woff2"
HANAMIN = FONT_DIR / "hanamin-reading-rare.woff2"
ALLOWED_DISPLAY_SOURCE_FALLBACK = set("䬴𣜰𤊯𤜱")
REQUIRED_PUNCTUATION = set("，。！？；：「」『』（）《》〈〉—…·、〔〕【】﹁﹂﹃﹄　")
PRIMARY_CLASSES = {"dj-columns", "reading-primary-text"}
SKIP_TAGS = {"script", "style", "template", "noscript"}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
FORBIDDEN_PATHS = [
    ROOT / "scripts" / "build-reading-font-supplements.py",
    ROOT / "reading" / "dongjing-08-fontfix.css",
    ROOT / "reading" / "dongjing-rare-fallback.css",
    ROOT / "scripts" / "helper-rebuild-reading-canonical.py",
    ROOT / "scripts" / "helper-finalize-reading.py",
]
FORBIDDEN_TEXT = (
    "genryu-reading-fixed-v3",
    "qijic-reading-fixed-extra",
    "genryu-reading-supplement",
    "qiji-reading-supplement",
    "dongjing-08-fontfix.css",
    "dongjing-rare-fallback.css",
    "Galok Reading Serif V2 Final",
    "Galok Rare Serif V2 Final",
)


def is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return 0x3400 <= cp <= 0x4DBF or 0x4E00 <= cp <= 0x9FFF or 0xF900 <= cp <= 0xFAFF or 0x20000 <= cp <= 0x2FA1F


class ReadingTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[bool, bool]] = []
        self.primary_parts: list[str] = []
        self.display_parts: list[str] = []

    def _state(self) -> tuple[bool, bool]:
        return self.stack[-1] if self.stack else (False, False)

    def handle_starttag(self, tag: str, attrs) -> None:
        parent_skip, parent_primary = self._state()
        attr_map = {key: value for key, value in attrs}
        classes = set((attr_map.get("class") or "").split())
        lang = (attr_map.get("lang") or "").lower()
        starts_primary = (tag == "blockquote" and lang.startswith("zh")) or bool(classes & PRIMARY_CLASSES)
        if tag not in VOID_TAGS:
            self.stack.append((parent_skip or tag in SKIP_TAGS, parent_primary or starts_primary))

    def handle_endtag(self, tag: str) -> None:
        if tag not in VOID_TAGS and self.stack:
            self.stack.pop()

    def handle_data(self, data: str) -> None:
        skip, primary = self._state()
        if skip:
            return
        (self.primary_parts if primary else self.display_parts).append(data)


def collect_corpora() -> tuple[set[str], set[str], dict[str, set[str]], dict[str, set[str]]]:
    primary = set(REQUIRED_PUNCTUATION)
    display: set[str] = set()
    primary_sources: dict[str, set[str]] = defaultdict(set)
    display_sources: dict[str, set[str]] = defaultdict(set)
    for path in sorted(READING_ROOT.rglob("*.html")):
        parser = ReadingTextParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        rel = str(path.relative_to(ROOT))
        for ch in "".join(parser.primary_parts):
            if is_cjk(ch) or ch in REQUIRED_PUNCTUATION:
                primary.add(ch); primary_sources[ch].add(rel)
        for ch in "".join(parser.display_parts):
            if is_cjk(ch):
                display.add(ch); display_sources[ch].add(rel)
    if DISPLAY_MANIFEST.exists():
        display.update(ch for ch in DISPLAY_MANIFEST.read_text(encoding="utf-8") if is_cjk(ch))
    return primary, display, primary_sources, display_sources


def font_codepoints(path: Path) -> set[int]:
    try:
        font = TTFont(path)
        cmap: set[int] = set()
        for table in font["cmap"].tables:
            cmap.update(table.cmap.keys())
        font.close()
        return cmap
    except Exception as exc:
        raise RuntimeError(f"invalid Reading font asset {path.relative_to(ROOT)}: {exc}") from exc


def report_missing(label: str, missing: list[str], sources: dict[str, set[str]]) -> None:
    print(f"\nERROR: {label} coverage must be 100%. Missing glyphs:")
    for ch in missing:
        where = ", ".join(sorted(sources.get(ch, {"reserved display manifest"})))
        print(f"  {ch}  U+{ord(ch):04X}  {where}")


def find_forbidden_artifacts() -> list[Path]:
    hits = [path for path in FORBIDDEN_PATHS if path.exists()]
    for pattern in ("*supplement*.woff2", "*fixed*.woff2"):
        hits.extend(FONT_DIR.glob(pattern))
    return sorted(set(hits))


def find_forbidden_references() -> list[tuple[Path, str]]:
    hits: list[tuple[Path, str]] = []
    roots = [READING_ROOT, ROOT / "scripts", ROOT / ".github" / "workflows"]
    for base in roots:
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in {".html", ".css", ".js", ".mjs", ".py", ".yml", ".yaml"}:
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
            for token in FORBIDDEN_TEXT:
                if token in text:
                    hits.append((path, token))
    return hits


def main() -> int:
    required = [GENRYU, QIJIC, HANAMIN, DISPLAY_MANIFEST]
    missing_files = [path for path in required if not path.exists()]
    if missing_files:
        for path in missing_files:
            print(f"ERROR: Reading typography asset missing: {path.relative_to(ROOT)}")
        return 1

    legacy = find_forbidden_artifacts()
    if legacy:
        for path in legacy:
            print(f"ERROR: legacy Reading font artifact must be removed: {path.relative_to(ROOT)}")
        return 1

    references = find_forbidden_references()
    if references:
        for path, token in references:
            print(f"ERROR: legacy Reading font reference {token!r}: {path.relative_to(ROOT)}")
        return 1

    try:
        genryu_cmap = font_codepoints(GENRYU)
        qijic_cmap = font_codepoints(QIJIC)
        hanamin_cmap = font_codepoints(HANAMIN)
    except RuntimeError as exc:
        print(f"ERROR: {exc}")
        return 1

    serif_cmap = genryu_cmap | hanamin_cmap
    display_stack_cmap = qijic_cmap | serif_cmap
    primary, display, primary_sources, display_sources = collect_corpora()
    primary_missing = sorted((ch for ch in primary if ord(ch) not in serif_cmap), key=ord)
    display_missing = sorted((ch for ch in display if ord(ch) not in display_stack_cmap), key=ord)
    qijic_fallback = {ch for ch in display if ord(ch) not in qijic_cmap}
    unexpected_fallback = sorted(qijic_fallback - ALLOWED_DISPLAY_SOURCE_FALLBACK, key=ord)

    print(f"Reading primary/source corpus: {len(primary)} characters")
    print(f"GenRyu + HanaMin coverage: {len(primary)-len(primary_missing)}/{len(primary)}")
    print(f"Reading display/UI corpus: {len(display)} characters")
    print(f"QIJIC direct coverage: {len(display)-len(qijic_fallback)}/{len(display)}")
    print(f"Display stack coverage: {len(display)-len(display_missing)}/{len(display)}")
    if qijic_fallback:
        print("Source-glyph display fallback:", " ".join(f"{ch}(U+{ord(ch):04X})" for ch in sorted(qijic_fallback, key=ord)))

    if primary_missing:
        report_missing("Reading primary-text serif stack", primary_missing, primary_sources)
    if display_missing:
        report_missing("Reading display stack", display_missing, display_sources)
    if unexpected_fallback:
        report_missing("QIJIC direct display coverage (unexpected fallback)", unexpected_fallback, display_sources)
        print("Only source-locked glyphs explicitly absent from upstream QIJIC may use the canonical serif fallback.")

    if primary_missing or display_missing or unexpected_fallback:
        return 1

    print("PASS: canonical Reading fonts are valid; semantic Chinese coverage is 100% with no supplement fonts.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
'''

FINAL_WORKFLOW = r'''name: Verify Reading Artifacts

on:
  pull_request:
    branches: [main]
    paths:
      - "reading/**/*.html"
      - "reading/**/*.css"
      - "reading/**/*.js"
      - "assets/fonts/**"
      - "scripts/check-reading-font-coverage.py"
      - "scripts/reading-display-glyphs.txt"
      - "scripts/build-reading-font-subsets.py"
      - "scripts/build-discovery.mjs"
      - "scripts/run-discovery-build.mjs"
      - "scripts/verify-generated-discovery.mjs"
      - "scripts/runtime-discovery-search.mjs"
      - "scripts/validate-discovery.mjs"
      - ".github/workflows/rebuild-reading-fonts-once.yml"
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: verify-reading-artifacts-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout pull request
        uses: actions/checkout@v7
        with:
          fetch-depth: 0

      - name: Install font tools
        run: python -m pip install --disable-pip-version-check --upgrade fonttools brotli

      - name: Set up Node
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm

      - name: Install site tools
        run: npm ci --ignore-scripts --no-audit --no-fund

      - name: Verify canonical Reading font coverage
        run: python scripts/check-reading-font-coverage.py

      - name: Rebuild and verify discovery assets
        run: |
          npm run build:discovery
          node scripts/verify-generated-discovery.mjs

      - name: Explain Reading artifact failures
        if: failure()
        run: |
          echo "Reading uses three canonical font assets; routine content must not create supplement fonts."
          echo "Before pushing a Reading change, run:"
          echo "  npm run check:reading-fonts"
          echo "  npm run build:discovery"
          echo "  node scripts/verify-generated-discovery.mjs"
          echo "If upstream glyph coverage changes, run npm run maintenance:reading-fonts in a dedicated typography-maintenance commit."
'''


def write(path: str, content: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")
    print("WRITE", path)


def remove(path: str) -> None:
    target = ROOT / path
    if target.exists():
        target.unlink()
        print("REMOVE", path)


def replace_exact(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one occurrence in {path}: {old!r}; found {count}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")
    print("PATCH", path)


def main() -> int:
    write("reading/qijic-type-system.css", FINAL_CSS)
    write("scripts/check-reading-font-coverage.py", FINAL_CHECKER)
    helper_builder = ROOT / "scripts" / "helper-rebuild-reading-canonical.py"
    if not helper_builder.exists():
        raise RuntimeError("helper canonical builder missing")
    builder = helper_builder.read_text(encoding="utf-8")
    builder = builder.replace("#!/usr/bin/env python3\n", "#!/usr/bin/env python3\n\"\"\"Maintenance-only builder for the three canonical Galok Reading fonts.\"\"\"\n", 1)
    write("scripts/build-reading-font-subsets.py", builder)
    write(".github/workflows/rebuild-reading-fonts-once.yml", FINAL_WORKFLOW)

    replace_exact("reading/dongjing-meng-hua-lu/18/index.html", '  <meta name="galok:search" content="include">\n', "")
    for entry in ("12", "13", "14"):
        path = f"reading/dongjing-meng-hua-lu/{entry}/index.html"
        replace_exact(path, '  <link rel="stylesheet" href="/reading/dongjing-rare-fallback.css?v=20260901b">\n', "")

    for path in (
        "assets/fonts/genryu-reading-fixed-v3.woff2",
        "assets/fonts/qijic-reading-fixed-extra.woff2",
        "assets/fonts/genryu-reading-supplement.woff2",
        "assets/fonts/qiji-reading-supplement.woff2",
        "scripts/build-reading-font-supplements.py",
        "reading/dongjing-08-fontfix.css",
        "reading/dongjing-rare-fallback.css",
        "scripts/helper-rebuild-reading-canonical.py",
        "scripts/helper-finalize-reading.py",
    ):
        remove(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
