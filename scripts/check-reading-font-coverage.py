#!/usr/bin/env python3
"""Fail CI when the Galok Reading serif font cannot render the current Reading CJK corpus."""

from __future__ import annotations

from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
import sys

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
READING_ROOT = ROOT / "reading"
FONT_PATH = ROOT / "assets" / "fonts" / "genryu-reading-tw.woff2"

# Punctuation deliberately expected from the Reading serif subset.
REQUIRED_PUNCTUATION = set("，。！？；：「」『』（）《》〈〉—…·、〔〕【】﹁﹂﹃﹄　")


def is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return (
        0x3400 <= cp <= 0x4DBF
        or 0x4E00 <= cp <= 0x9FFF
        or 0xF900 <= cp <= 0xFAFF
        or 0x20000 <= cp <= 0x2FA1F
    )


class VisibleTextParser(HTMLParser):
    """Collect visible text while ignoring script/style/template contents."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.skip_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in {"script", "style", "template", "noscript"}:
            self.skip_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "template", "noscript"} and self.skip_depth:
            self.skip_depth -= 1

    def handle_data(self, data: str) -> None:
        if not self.skip_depth:
            self.parts.append(data)


def collect_corpus() -> tuple[set[str], dict[str, set[str]]]:
    corpus = set(REQUIRED_PUNCTUATION)
    sources: dict[str, set[str]] = defaultdict(set)

    for path in sorted(READING_ROOT.rglob("*.html")):
        parser = VisibleTextParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        visible = "".join(parser.parts)
        rel = str(path.relative_to(ROOT))
        for ch in visible:
            if is_cjk(ch) or ch in REQUIRED_PUNCTUATION:
                corpus.add(ch)
                sources[ch].add(rel)

    return corpus, sources


def font_codepoints() -> set[int]:
    font = TTFont(FONT_PATH)
    cmap: set[int] = set()
    for table in font["cmap"].tables:
        cmap.update(table.cmap.keys())
    return cmap


def main() -> int:
    if not FONT_PATH.exists():
        print(f"ERROR: Reading font missing: {FONT_PATH.relative_to(ROOT)}")
        return 1

    corpus, sources = collect_corpus()
    cmap = font_codepoints()
    missing = sorted((ch for ch in corpus if ord(ch) not in cmap), key=ord)

    covered = len(corpus) - len(missing)
    coverage = (covered / len(corpus) * 100) if corpus else 100.0
    print(f"Reading CJK corpus: {len(corpus)} characters")
    print(f"GenRyu cmap coverage: {covered}/{len(corpus)} ({coverage:.4f}%)")

    if missing:
        print("\nERROR: Reading font coverage must be 100%. Missing glyphs:")
        for ch in missing:
            where = ", ".join(sorted(sources.get(ch, {"required punctuation set"})))
            print(f"  {ch}  U+{ord(ch):04X}  {where}")
        print("\nRebuild assets/fonts/genryu-reading-tw.woff2 from the official GenRyu TW Regular source before release.")
        return 1

    print("PASS: Reading font cmap coverage is 100%.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
