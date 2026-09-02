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
SOURCE_HAN = FONT_DIR / "source-han-serif-tc-reading.woff2"
QIJIC = FONT_DIR / "qiji-reading-title.woff2"
HANAMIN = FONT_DIR / "hanamin-reading-rare.woff2"
BOOK_TITLE_CLASS = "reading-book-title-zh"
BOOK_TITLE_RESERVE = set("東京夢華錄鹽鐵論管子")
REQUIRED_PUNCTUATION = set("，。！？；：「」『』（）《》〈〉—…·、〔〕【】﹁﹂﹃﹄　")
SKIP_TAGS = {"script", "style", "template", "noscript"}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

FORBIDDEN_PATHS = [
    FONT_DIR / "genryu-reading-tw.woff2",
    READING_ROOT / "qijic-type-system.css",
    READING_ROOT / "reading-display-20260902.css",
    ROOT / "scripts" / "build-reading-font-supplements.py",
    READING_ROOT / "dongjing-08-fontfix.css",
    READING_ROOT / "dongjing-rare-fallback.css",
    ROOT / "scripts" / "helper-rebuild-reading-canonical.py",
    ROOT / "scripts" / "helper-finalize-reading.py",
]
FORBIDDEN_TEXT = (
    "Galok Reading Serif Entry",
    "Galok Reading Serif V2",
    "Galok Reading Serif V3",
    "Galok Reading Serif Yantie",
    "Galok Qiji Entry",
    "Galok Qiji V3",
    "Galok Qiji Reading Notes",
    "qijic-type-system.css",
    "reading-display-20260902.css",
    "--reading-display-cjk",
    "--reading-primary-cjk",
)


def is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return 0x3400 <= cp <= 0x4DBF or 0x4E00 <= cp <= 0x9FFF or 0xF900 <= cp <= 0xFAFF or 0x20000 <= cp <= 0x2FA1F


class ReadingTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[bool, bool]] = []
        self.book_title_parts: list[str] = []
        self.chinese_parts: list[str] = []

    def _state(self) -> tuple[bool, bool]:
        return self.stack[-1] if self.stack else (False, False)

    def handle_starttag(self, tag: str, attrs) -> None:
        parent_skip, parent_book_title = self._state()
        attr_map = {key: value for key, value in attrs}
        classes = set((attr_map.get("class") or "").split())
        starts_book_title = BOOK_TITLE_CLASS in classes
        if tag not in VOID_TAGS:
            self.stack.append((parent_skip or tag in SKIP_TAGS, parent_book_title or starts_book_title))

    def handle_endtag(self, tag: str) -> None:
        if tag not in VOID_TAGS and self.stack:
            self.stack.pop()

    def handle_data(self, data: str) -> None:
        skip, book_title = self._state()
        if skip:
            return
        (self.book_title_parts if book_title else self.chinese_parts).append(data)


def collect_corpora() -> tuple[set[str], set[str], dict[str, set[str]], dict[str, set[str]]]:
    chinese = set(REQUIRED_PUNCTUATION)
    book_titles = set(BOOK_TITLE_RESERVE)
    chinese_sources: dict[str, set[str]] = defaultdict(set)
    title_sources: dict[str, set[str]] = defaultdict(set)
    for path in sorted(READING_ROOT.rglob("*.html")):
        parser = ReadingTextParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        rel = str(path.relative_to(ROOT))
        for ch in "".join(parser.book_title_parts):
            if is_cjk(ch):
                book_titles.add(ch)
                title_sources[ch].add(rel)
        for ch in "".join(parser.chinese_parts):
            if is_cjk(ch) or ch in REQUIRED_PUNCTUATION:
                chinese.add(ch)
                chinese_sources[ch].add(rel)
    return chinese, book_titles, chinese_sources, title_sources


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


def find_forbidden_artifacts() -> list[Path]:
    hits = [path for path in FORBIDDEN_PATHS if path.exists()]
    for pattern in ("*supplement*.woff2", "*fixed*.woff2"):
        hits.extend(FONT_DIR.glob(pattern))
    return sorted(set(hits))


def find_forbidden_references() -> list[tuple[Path, str]]:
    hits: list[tuple[Path, str]] = []
    roots = [READING_ROOT, ROOT / "scripts", ROOT / ".github" / "workflows"]
    skip_files = {Path(__file__).resolve(), (ROOT / "scripts" / "build-reading-font-subsets.py").resolve()}
    for base in roots:
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if path.resolve() in skip_files:
                continue
            if not path.is_file() or path.suffix.lower() not in {".html", ".css", ".js", ".mjs", ".py", ".yml", ".yaml"}:
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
            for token in FORBIDDEN_TEXT:
                if token in text:
                    hits.append((path, token))
    return hits


def main() -> int:
    required = [SOURCE_HAN, QIJIC, HANAMIN, READING_ROOT / "reading-type-system.css"]
    missing_files = [path for path in required if not path.exists()]
    if missing_files:
        for path in missing_files:
            print(f"ERROR: Reading typography asset missing: {path.relative_to(ROOT)}")
        return 1

    legacy = find_forbidden_artifacts()
    if legacy:
        for path in legacy:
            print(f"ERROR: legacy Reading typography artifact must be removed: {path.relative_to(ROOT)}")
        return 1

    references = find_forbidden_references()
    if references:
        for path, token in references:
            print(f"ERROR: legacy Reading typography reference {token!r}: {path.relative_to(ROOT)}")
        return 1

    try:
        source_han_cmap = font_codepoints(SOURCE_HAN)
        qijic_cmap = font_codepoints(QIJIC)
        hanamin_cmap = font_codepoints(HANAMIN)
    except RuntimeError as exc:
        print(f"ERROR: {exc}")
        return 1

    chinese, book_titles, chinese_sources, title_sources = collect_corpora()
    unexpected_title_chars = sorted(book_titles - BOOK_TITLE_RESERVE, key=ord)
    reading_cmap = source_han_cmap | hanamin_cmap
    chinese_missing = sorted((ch for ch in chinese if ord(ch) not in reading_cmap), key=ord)
    source_han_fallback = sorted((ch for ch in chinese if ord(ch) not in source_han_cmap), key=ord)
    title_missing = sorted((ch for ch in book_titles if ord(ch) not in qijic_cmap), key=ord)

    print(f"Reading unified Chinese corpus: {len(chinese)} characters")
    print(f"Source Han + HanaMin coverage: {len(chinese)-len(chinese_missing)}/{len(chinese)}")
    print(f"Source Han direct coverage: {len(chinese)-len(source_han_fallback)}/{len(chinese)}")
    print(f"QIJIC book-title corpus: {len(book_titles)} characters")
    print(f"QIJIC direct book-title coverage: {len(book_titles)-len(title_missing)}/{len(book_titles)}")
    if source_han_fallback:
        print("HanaMin rare fallback:", " ".join(f"{ch}(U+{ord(ch):04X})" for ch in source_han_fallback))

    if unexpected_title_chars:
        report_missing("Book-title semantic whitelist (only 東京夢華錄 / 鹽鐵論 / 管子 may be QIJIC)", unexpected_title_chars, title_sources)
    if chinese_missing:
        report_missing("Unified Source Han/HanaMin Chinese stack", chinese_missing, chinese_sources)
    if title_missing:
        report_missing("QIJIC book-title face", title_missing, title_sources)

    if unexpected_title_chars or chinese_missing or title_missing:
        return 1

    print("PASS: all non-book-title Chinese resolves through one Source Han Serif TC stack; QIJIC is limited to book titles.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
