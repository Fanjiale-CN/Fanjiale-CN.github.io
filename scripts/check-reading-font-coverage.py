#!/usr/bin/env python3
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
            if path.resolve() == Path(__file__).resolve():
                continue
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
