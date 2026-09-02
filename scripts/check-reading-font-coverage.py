#!/usr/bin/env python3
"""Validate the frozen Galok Reading font stack plus cumulative supplements."""

from __future__ import annotations

from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
import sys

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
READING_ROOT = ROOT / "reading"
SERIF_PATHS = [
    ROOT / "assets" / "fonts" / "genryu-reading-tw.woff2",
    ROOT / "assets" / "fonts" / "genryu-reading-supplement.woff2",
    ROOT / "assets" / "fonts" / "hanamin-reading-rare.woff2",
]
DISPLAY_PATHS = [
    ROOT / "assets" / "fonts" / "qiji-reading-title.woff2",
    ROOT / "assets" / "fonts" / "qiji-reading-supplement.woff2",
]
REQUIRED_PUNCTUATION = set("，。！？；：「」『』（）《》〈〉—…·、〔〕【】﹁﹂﹃﹄　")
DISPLAY_CLASSES = {"dj-title-zh", "reading-note-zh", "reading-drawer-entry-zh"}


def is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return 0x3400 <= cp <= 0x4DBF or 0x4E00 <= cp <= 0x9FFF or 0xF900 <= cp <= 0xFAFF or 0x20000 <= cp <= 0x2FA1F


class ReadingTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.skip_depth = 0
        self.display_depth = 0
        self.visible_parts: list[str] = []
        self.display_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in {"script", "style", "template", "noscript"}:
            self.skip_depth += 1
            return
        if self.skip_depth:
            return
        classes = set()
        for key, value in attrs:
            if key == "class" and value:
                classes.update(value.split())
        if self.display_depth:
            self.display_depth += 1
        elif classes & DISPLAY_CLASSES:
            self.display_depth = 1

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "template", "noscript"}:
            if self.skip_depth:
                self.skip_depth -= 1
            return
        if not self.skip_depth and self.display_depth:
            self.display_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.skip_depth:
            return
        self.visible_parts.append(data)
        if self.display_depth:
            self.display_parts.append(data)


def collect_corpora() -> tuple[set[str], dict[str, set[str]], set[str], dict[str, set[str]]]:
    corpus = set(REQUIRED_PUNCTUATION)
    sources: dict[str, set[str]] = defaultdict(set)
    display_corpus: set[str] = set()
    display_sources: dict[str, set[str]] = defaultdict(set)

    for path in sorted(READING_ROOT.rglob("*.html")):
        parser = ReadingTextParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        rel = str(path.relative_to(ROOT))
        for ch in "".join(parser.visible_parts):
            if is_cjk(ch) or ch in REQUIRED_PUNCTUATION:
                corpus.add(ch)
                sources[ch].add(rel)
        for ch in "".join(parser.display_parts):
            if is_cjk(ch):
                display_corpus.add(ch)
                display_sources[ch].add(rel)

    return corpus, sources, display_corpus, display_sources


def font_codepoints(path: Path) -> set[int]:
    font = TTFont(path)
    cmap: set[int] = set()
    for table in font["cmap"].tables:
        cmap.update(table.cmap.keys())
    return cmap


def merged_cmap(paths: list[Path]) -> set[int]:
    cmap: set[int] = set()
    for path in paths:
        cmap.update(font_codepoints(path))
    return cmap


def report_missing(label: str, missing: list[str], sources: dict[str, set[str]]) -> None:
    print(f"\nERROR: {label} coverage must be 100%. Missing glyphs:")
    for ch in missing:
        where = ", ".join(sorted(sources.get(ch, {"required corpus"})))
        print(f"  {ch}  U+{ord(ch):04X}  {where}")


def main() -> int:
    required_files = SERIF_PATHS + DISPLAY_PATHS
    missing_files = [path for path in required_files if not path.exists()]
    if missing_files:
        for path in missing_files:
            print(f"ERROR: Reading font asset missing: {path.relative_to(ROOT)}")
        print("Run: npm run build:reading-fonts")
        return 1

    corpus, sources, display_corpus, display_sources = collect_corpora()

    serif_cmap = merged_cmap(SERIF_PATHS)
    serif_missing = sorted((ch for ch in corpus if ord(ch) not in serif_cmap), key=ord)
    serif_covered = len(corpus) - len(serif_missing)
    serif_coverage = (serif_covered / len(corpus) * 100) if corpus else 100.0
    print(f"Reading CJK corpus: {len(corpus)} characters")
    print(f"Reading serif stack coverage: {serif_covered}/{len(corpus)} ({serif_coverage:.4f}%)")

    display_cmap = merged_cmap(DISPLAY_PATHS)
    display_missing = sorted((ch for ch in display_corpus if ord(ch) not in display_cmap), key=ord)
    display_covered = len(display_corpus) - len(display_missing)
    display_coverage = (display_covered / len(display_corpus) * 100) if display_corpus else 100.0
    print(f"Reading Chinese display-title corpus: {len(display_corpus)} characters")
    print(f"Reading QIJIC title coverage: {display_covered}/{len(display_corpus)} ({display_coverage:.4f}%)")

    if serif_missing:
        report_missing("Reading serif stack", serif_missing, sources)
    if display_missing:
        report_missing("Reading QIJIC title", display_missing, display_sources)
    if serif_missing or display_missing:
        print("\nUpdate the cumulative Reading supplement fonts before release; do not rebuild the frozen base fonts for routine content changes.")
        return 1

    print("PASS: frozen Reading base fonts + cumulative supplements cover the current corpus.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
