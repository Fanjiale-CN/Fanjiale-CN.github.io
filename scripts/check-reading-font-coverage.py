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
TYPE_SYSTEM = READING_ROOT / "qijic-type-system.css"  # compatibility URL; Source Han canonical rules live here
SOURCE_HAN = FONT_DIR / "source-han-serif-tc-reading.woff2"
QIJIC = FONT_DIR / "qiji-reading-title.woff2"
HANAMIN = FONT_DIR / "hanamin-reading-rare.woff2"
BOOK_TITLE_RESERVE = set("東京夢華錄鹽鐵論管子")
REQUIRED_PUNCTUATION = set("，。！？；：「」『』（）《》〈〉—…·、〔〕【】﹁﹂﹃﹄　")
SKIP_TAGS = {"script", "style", "template", "noscript"}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


def is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return (
        0x3400 <= cp <= 0x4DBF
        or 0x4E00 <= cp <= 0x9FFF
        or 0xF900 <= cp <= 0xFAFF
        or 0x20000 <= cp <= 0x2FA1F
        or 0x30000 <= cp <= 0x323AF
    )


class ReadingTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[bool] = []
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        parent_skip = self.stack[-1] if self.stack else False
        if tag not in VOID_TAGS:
            self.stack.append(parent_skip or tag in SKIP_TAGS)

    def handle_endtag(self, tag: str) -> None:
        if tag not in VOID_TAGS and self.stack:
            self.stack.pop()

    def handle_data(self, data: str) -> None:
        if not (self.stack[-1] if self.stack else False):
            self.parts.append(data)


def collect_corpus() -> tuple[set[str], dict[str, set[str]]]:
    chinese = set(REQUIRED_PUNCTUATION)
    sources: dict[str, set[str]] = defaultdict(set)
    for path in sorted(READING_ROOT.rglob("*.html")):
        parser = ReadingTextParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        rel = str(path.relative_to(ROOT))
        for ch in "".join(parser.parts):
            if is_cjk(ch) or ch in REQUIRED_PUNCTUATION:
                chinese.add(ch)
                sources[ch].add(rel)
    return chinese, sources


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
        '--reading-cjk:',
        'font-family: "Galok QIJIC Book Title"',
        '--reading-book-title-cjk:',
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

    chinese, chinese_sources = collect_corpus()
    reading_stack = source_han_cmap | hanamin_cmap
    chinese_missing = sorted((ch for ch in chinese if ord(ch) not in reading_stack), key=ord)
    source_han_fallback = sorted((ch for ch in chinese if ord(ch) not in source_han_cmap), key=ord)
    title_missing = sorted((ch for ch in BOOK_TITLE_RESERVE if ord(ch) not in qijic_cmap), key=ord)

    print(f"Reading unified Chinese corpus: {len(chinese)} characters")
    print(f"Source Han + HanaMin coverage: {len(chinese)-len(chinese_missing)}/{len(chinese)}")
    print(f"Source Han direct coverage: {len(chinese)-len(source_han_fallback)}/{len(chinese)}")
    print(f"QIJIC book-title corpus: {len(BOOK_TITLE_RESERVE)} characters")
    print(f"QIJIC direct book-title coverage: {len(BOOK_TITLE_RESERVE)-len(title_missing)}/{len(BOOK_TITLE_RESERVE)}")
    if source_han_fallback:
        print("HanaMin rare fallback:", " ".join(f"{ch}(U+{ord(ch):04X})" for ch in source_han_fallback))

    if chinese_missing:
        report_missing("Unified Source Han/HanaMin Chinese stack", chinese_missing, chinese_sources)
    if title_missing:
        report_missing("QIJIC book-title face", title_missing, {})
    if chinese_missing or title_missing:
        return 1

    print("PASS: ordinary Reading Chinese resolves through Source Han Serif TC with HanaMin rare fallback; QIJIC directly covers the reserved large book-title glyphs.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
