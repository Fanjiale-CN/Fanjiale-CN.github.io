#!/usr/bin/env python3
"""Reading typography coverage checker (V2 two-layer contract).

Validates, against the fonts actually shipped in assets/fonts:
- ancient layer (blockquote / q / .reading-primary-text / .reading-source-columns
  / .dj-columns) is 100% covered by Source Han Serif TC + HanaMin;
- modern layer (all other Reading Chinese) is 100% covered by Galok QIJIC
  Reading with Source Han + HanaMin as declared fallbacks;
- the canonical type-system CSS keeps the contract tokens.
"""
from __future__ import annotations

import sys
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
READING_ROOT = ROOT / "reading"
FONT_DIR = ROOT / "assets" / "fonts"
TYPE_SYSTEM = READING_ROOT / "qijic-type-system.css"
SOURCE_HAN = FONT_DIR / "source-han-serif-tc-reading.woff2"
QIJIC = FONT_DIR / "qiji-reading-modern.woff2"
HANAMIN = FONT_DIR / "hanamin-reading-rare.woff2"
BOOK_TITLE_RESERVE = set("東京夢華錄鹽鐵論管子")
REQUIRED_PUNCTUATION = set("，。！？；：「」『』（）《》〈〉—…·、〔〕【】﹁﹂﹃﹄　")
EXTRA_PUNCTUATION = set("‘’“”―‐‒–′″‰")
SKIP_TAGS = {"script", "style", "template", "noscript", "title"}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
ANCIENT_TAGS = {"blockquote", "q"}
ANCIENT_CLASSES = {"reading-primary-text", "reading-source-columns", "dj-columns"}


def is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return (
        0x3400 <= cp <= 0x4DBF
        or 0x4E00 <= cp <= 0x9FFF
        or 0xF900 <= cp <= 0xFAFF
        or 0x20000 <= cp <= 0x2FA1F
        or 0x30000 <= cp <= 0x323AF
    )


def is_cjk_punct(ch: str) -> bool:
    cp = ord(ch)
    return (
        0x3000 <= cp <= 0x303F
        or 0xFF01 <= cp <= 0xFF60
        or ch in EXTRA_PUNCTUATION
    )


class ReadingLayerParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.skip_depth = 0
        self.ancient_depth = 0
        self.ancient: set[str] = set()
        self.modern: set[str] = set()
        self.ancient_punct: set[str] = set()
        self.modern_punct: set[str] = set()

    def _ancient(self, tag: str, attrs) -> bool:
        if tag in ANCIENT_TAGS:
            return True
        classes = dict(attrs).get("class", "").split()
        return bool(ANCIENT_CLASSES.intersection(classes))

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in VOID_TAGS:
            return
        if tag in SKIP_TAGS:
            self.skip_depth += 1
        elif not self.skip_depth:
            if self._ancient(tag, attrs):
                self.ancient_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in VOID_TAGS:
            return
        if tag in SKIP_TAGS and self.skip_depth:
            self.skip_depth -= 1
        elif not self.skip_depth and self.ancient_depth and self._ancient(tag, attrs=[]):
            self.ancient_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.skip_depth:
            return
        for ch in data:
            if is_cjk(ch):
                (self.ancient if self.ancient_depth else self.modern).add(ch)
            elif is_cjk_punct(ch):
                (self.ancient_punct if self.ancient_depth else self.modern_punct).add(ch)


def collect() -> tuple[dict[str, set[str]], dict[str, dict[str, set[str]]]]:
    ancient: set[str] = set()
    modern: set[str] = set()
    ancient_sources: dict[str, set[str]] = defaultdict(set)
    modern_sources: dict[str, set[str]] = defaultdict(set)
    for path in sorted(READING_ROOT.rglob("*.html")):
        parser = ReadingLayerParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        ancient |= parser.ancient
        modern |= parser.modern
        rel = str(path.relative_to(ROOT))
        for ch in parser.ancient:
            ancient_sources[ch].add(rel)
        for ch in parser.modern:
            modern_sources[ch].add(rel)
        ancient |= parser.ancient_punct | REQUIRED_PUNCTUATION
        modern |= parser.modern_punct | REQUIRED_PUNCTUATION
    modern |= BOOK_TITLE_RESERVE
    return {"ancient": ancient, "modern": modern}, {"ancient": ancient_sources, "modern": modern_sources}


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
        where = ", ".join(sorted(sources.get(ch, {"reserved typography corpus"})))
        print(f"  {ch}  U+{ord(ch):04X}  {where}")


def main() -> int:
    required = [SOURCE_HAN, QIJIC, HANAMIN, TYPE_SYSTEM]
    missing_files = [path for path in required if not path.exists()]
    if missing_files:
        for path in missing_files:
            print(f"ERROR: Reading typography asset missing: {path.relative_to(ROOT)}")
        return 1

    type_css = TYPE_SYSTEM.read_text(encoding="utf-8", errors="ignore")
    required_tokens = (
        'font-family: "Galok Source Han Serif TC"',
        'font-family: "Galok QIJIC Reading"',
        "--reading-ancient-cjk:",
        "--reading-modern-cjk:",
        "--reading-cjk:",
        'font-family: "Galok QIJIC Book Title"',
        "--reading-book-title-cjk:",
    )
    missing_tokens = [token for token in required_tokens if token not in type_css]
    if missing_tokens:
        for token in missing_tokens:
            print(f"ERROR: canonical Reading type-system contract missing {token!r}: {TYPE_SYSTEM.relative_to(ROOT)}")
        return 1

    try:
        source_han_cmap = font_codepoints(SOURCE_HAN)
        qijic_cmap = font_codepoints(QIJIC)
        hanamin_cmap = font_codepoints(HANAMIN)
    except RuntimeError as exc:
        print(f"ERROR: {exc}")
        return 1

    layers, sources = collect()
    ancient, ancient_sources = layers["ancient"], sources["ancient"]
    modern, modern_sources = layers["modern"], sources["modern"]

    ancient_stack = source_han_cmap | hanamin_cmap
    modern_stack = qijic_cmap | source_han_cmap | hanamin_cmap

    ancient_missing = sorted((ch for ch in ancient if ord(ch) not in ancient_stack), key=ord)
    modern_missing = sorted((ch for ch in modern if ord(ch) not in modern_stack), key=ord)
    qiji_direct = sorted((ch for ch in modern if ord(ch) in qijic_cmap), key=ord)
    qiji_fallback = sorted((ch for ch in modern if ord(ch) not in qijic_cmap), key=ord)
    ancient_rare = sorted((ch for ch in ancient if ord(ch) not in source_han_cmap and ord(ch) in hanamin_cmap), key=ord)

    print(f"Reading ancient corpus (primary sources): {len(ancient)} characters")
    print(f"Reading modern corpus (editorial layer): {len(modern)} characters")
    print(f"Ancient coverage (Source Han + HanaMin): {len(ancient)-len(ancient_missing)}/{len(ancient)}")
    print(f"Ancient via HanaMin rare fallback:      {len(ancient_rare)}")
    print(f"Modern coverage (QIJIC + fallbacks):    {len(modern)-len(modern_missing)}/{len(modern)}")
    print(f"Modern via QIJIC directly:              {len(qiji_direct)}")
    print(f"Modern via Source Han/HanaMin fallback: {len(qiji_fallback)}")
    if ancient_rare:
        print("HanaMin ancient fallback:", " ".join(f"{ch}(U+{ord(ch):04X})" for ch in ancient_rare))
    if qiji_fallback:
        print("QIJIC fallback glyphs:", " ".join(f"{ch}(U+{ord(ch):04X})" for ch in qiji_fallback))

    if ancient_missing:
        report_missing("Ancient layer (Source Han + HanaMin)", ancient_missing, ancient_sources)
    if modern_missing:
        report_missing("Modern layer (QIJIC + fallbacks)", modern_missing, modern_sources)
    if ancient_missing or modern_missing:
        return 1

    print("PASS: ancient Reading Chinese resolves through Source Han Serif TC with HanaMin rare fallback; "
          "modern Reading Chinese renders through Galok QIJIC Reading with Source Han + HanaMin fallbacks.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
