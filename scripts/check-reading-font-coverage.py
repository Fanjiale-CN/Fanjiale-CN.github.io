#!/usr/bin/env python3
from __future__ import annotations

import sys
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
READING_ROOT = ROOT / "reading"
DISPLAY_MANIFEST = ROOT / "scripts" / "reading-display-glyphs.txt"
SERIF_PATHS = [
    ROOT / "assets" / "fonts" / "genryu-reading-fixed-v3.woff2",
    ROOT / "assets" / "fonts" / "genryu-reading-tw.woff2",
    ROOT / "assets" / "fonts" / "hanamin-reading-rare.woff2",
]
DISPLAY_PATHS = [
    ROOT / "assets" / "fonts" / "qijic-reading-fixed-extra.woff2",
    ROOT / "assets" / "fonts" / "qiji-reading-title.woff2",
]
LEGACY_ARTIFACTS = [
    ROOT / "assets" / "fonts" / "genryu-reading-supplement.woff2",
    ROOT / "assets" / "fonts" / "qiji-reading-supplement.woff2",
    ROOT / "scripts" / "build-reading-font-supplements.py",
    ROOT / "reading" / "dongjing-08-fontfix.css",
]
REQUIRED_PUNCTUATION = set("，。！？；：「」『』（）《》〈〉—…·、〔〕【】﹁﹂﹃﹄　")
PRIMARY_CLASSES = {"dj-columns", "reading-primary-text"}
SKIP_TAGS = {"script", "style", "template", "noscript"}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


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


def merged_cmap(paths: list[Path]) -> set[int]:
    cmap: set[int] = set()
    for path in paths:
        cmap.update(font_codepoints(path))
    return cmap


def report_missing(label: str, missing: list[str], sources: dict[str, set[str]]) -> None:
    print(f"\nERROR: {label} coverage must be 100%. Missing glyphs:")
    for ch in missing:
        where = ", ".join(sorted(sources.get(ch, {"reserved display manifest"})))
        print(f"  {ch}  U+{ord(ch):04X}  {where}")


def main() -> int:
    required = SERIF_PATHS + DISPLAY_PATHS + [DISPLAY_MANIFEST]
    missing_files = [path for path in required if not path.exists()]
    if missing_files:
        for path in missing_files:
            print(f"ERROR: Reading typography asset missing: {path.relative_to(ROOT)}")
        return 1

    legacy = [path for path in LEGACY_ARTIFACTS if path.exists()]
    if legacy:
        for path in legacy:
            print(f"ERROR: legacy Reading font artifact must be removed: {path.relative_to(ROOT)}")
        return 1

    try:
        serif_cmap = merged_cmap(SERIF_PATHS)
        display_cmap = merged_cmap(DISPLAY_PATHS)
    except RuntimeError as exc:
        print(f"ERROR: {exc}")
        return 1

    primary, display, primary_sources, display_sources = collect_corpora()
    primary_missing = sorted((ch for ch in primary if ord(ch) not in serif_cmap), key=ord)
    display_missing = sorted((ch for ch in display if ord(ch) not in display_cmap), key=ord)

    print(f"Reading primary-text corpus: {len(primary)} characters")
    print(f"GenRyu + HanaMin coverage: {len(primary)-len(primary_missing)}/{len(primary)}")
    print(f"Reading display/UI corpus: {len(display)} characters")
    print(f"Fixed QIJIC coverage: {len(display)-len(display_missing)}/{len(display)}")

    if primary_missing:
        report_missing("Reading primary-text serif stack", primary_missing, primary_sources)
    if display_missing:
        report_missing("Reading QIJIC display/UI stack", display_missing, display_sources)
    if primary_missing or display_missing:
        print("\nDo not create supplement fonts. Maintain the fixed assets in one typography commit.")
        return 1

    print("PASS: fixed Reading fonts are valid and semantic Chinese coverage is 100%.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
