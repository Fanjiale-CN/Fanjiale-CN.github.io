#!/usr/bin/env python3
"""Shared Reading font-corpus classifier (V2 two-layer contract).

Single source of truth for the ancient/modern layer split, imported by both
build-reading-font-subsets.py and check-reading-font-coverage.py so the two
can never drift.

Layer rules:
- ancient: text inside blockquote, q, or an element carrying one of the
  ANCIENT_CLASSES (.reading-primary-text, .reading-source-columns,
  .dj-columns);
- modern: all other text;
- SKIP_TAGS content (script/style/template/noscript/title) never enters any
  corpus.

The parser keeps a frame stack: every non-void start tag records what state
it entered, and the matching end tag restores that state from the frame —
closing tags never need attributes, so class-based ancient containers close
correctly.
"""
from __future__ import annotations

from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
READING_ROOT = ROOT / "reading"

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
    """Splits Reading text into the ancient layer (primary sources) and the
    modern editorial layer (everything else) by DOM ancestry.

    State lives in a frame stack. Each non-void start tag pushes a frame
    recording whether that element entered skip mode or incremented the
    ancient depth; the matching end tag (found by tag name, tolerating
    implicitly closed elements above it) pops frames and restores state.
    Closing tags are never re-guessed from attributes.
    """

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.skip_depth = 0
        self.ancient_depth = 0
        self.stack: list[dict] = []
        self.ancient: set[str] = set()
        self.modern: set[str] = set()
        self.ancient_punct: set[str] = set()
        self.modern_punct: set[str] = set()

    def _is_ancient(self, tag: str, attrs) -> bool:
        if tag in ANCIENT_TAGS:
            return True
        classes = dict(attrs).get("class", "").split()
        return bool(ANCIENT_CLASSES.intersection(classes))

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in VOID_TAGS:
            return
        entering_skip = tag in SKIP_TAGS and self.skip_depth == 0
        entering_ancient = (not entering_skip) and self.skip_depth == 0 and self._is_ancient(tag, attrs)
        if entering_skip:
            self.skip_depth += 1
        if entering_ancient:
            self.ancient_depth += 1
        self.stack.append({"tag": tag, "entered_skip": entering_skip, "entered_ancient": entering_ancient})

    def handle_startendtag(self, tag: str, attrs) -> None:
        # Self-closing non-void syntax contributes no text and no state change.
        return

    def handle_endtag(self, tag: str) -> None:
        if tag in VOID_TAGS:
            return
        idx = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]["tag"] == tag:
                idx = i
                break
        if idx is None:
            return  # stray closing tag; nothing to restore
        for frame in reversed(self.stack[idx:]):
            if frame["entered_skip"]:
                self.skip_depth -= 1
            if frame["entered_ancient"]:
                self.ancient_depth -= 1
        del self.stack[idx:]

    def handle_data(self, data: str) -> None:
        if self.skip_depth:
            return
        ancient = self.ancient_depth > 0
        for ch in data:
            if is_cjk(ch):
                (self.ancient if ancient else self.modern).add(ch)
            elif is_cjk_punct(ch):
                (self.ancient_punct if ancient else self.modern_punct).add(ch)

    def close(self) -> None:
        super().close()
        # Any frames left open (implicitly closed elements) must not leak state.
        for frame in reversed(self.stack):
            if frame["entered_skip"]:
                self.skip_depth -= 1
            if frame["entered_ancient"]:
                self.ancient_depth -= 1
        self.stack.clear()
        assert self.skip_depth >= 0 and self.ancient_depth >= 0


def pages() -> list[Path]:
    return sorted(p for p in READING_ROOT.rglob("*.html"))


def collect_layers() -> tuple[set[str], set[str], dict[str, set[str]], dict[str, set[str]]]:
    """Returns (ancient_chars, modern_chars, ancient_sources, modern_sources).

    Punctuation: each layer carries the CJK punctuation it actually uses plus
    the shared REQUIRED_PUNCTUATION display/UI reserve; the modern layer also
    carries BOOK_TITLE_RESERVE.
    """
    ancient: set[str] = set()
    modern: set[str] = set()
    ancient_sources: dict[str, set[str]] = defaultdict(set)
    modern_sources: dict[str, set[str]] = defaultdict(set)
    for path in pages():
        parser = ReadingLayerParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        parser.close()
        rel = str(path.relative_to(ROOT))
        for ch in parser.ancient:
            ancient.add(ch)
            ancient_sources[ch].add(rel)
        for ch in parser.modern:
            modern.add(ch)
            modern_sources[ch].add(rel)
        ancient |= parser.ancient_punct | REQUIRED_PUNCTUATION
        modern |= parser.modern_punct | REQUIRED_PUNCTUATION
    modern |= BOOK_TITLE_RESERVE
    return ancient, modern, ancient_sources, modern_sources


def collect() -> tuple[set[str], set[str]]:
    ancient, modern, _, _ = collect_layers()
    return ancient, modern


def describe(chars: list[str]) -> str:
    return " ".join(f"{ch}(U+{ord(ch):04X})" for ch in chars)
