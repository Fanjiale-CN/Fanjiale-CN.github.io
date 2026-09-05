#!/usr/bin/env python3
"""Reading typography coverage checker (V2 two-layer contract).

Validates, against the fonts actually shipped in assets/fonts:
- the ancient layer is 100% covered by Source Han Serif TC + HanaMin;
- the modern layer is 100% covered by Galok QIJIC Reading with Source Han +
  HanaMin as declared fallbacks, including an actual-glyph spot check of the
  built QIJIC subset cmap for representative pages;
- the canonical type-system CSS keeps the contract tokens.

Classification comes from scripts/reading_font_corpus.py — the same module
the builder uses, so the two can never drift.
"""
from __future__ import annotations

import sys
from pathlib import Path

from fontTools.ttLib import TTFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
from reading_font_corpus import (  # noqa: E402
    BOOK_TITLE_RESERVE,
    READING_ROOT,
    collect_layers,
    describe,
)

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "assets" / "fonts"
TYPE_SYSTEM = READING_ROOT / "qijic-type-system.css"
SOURCE_HAN = FONT_DIR / "source-han-serif-tc-reading.woff2"
QIJIC = FONT_DIR / "qiji-reading-modern.woff2"
HANAMIN = FONT_DIR / "hanamin-reading-rare.woff2"

# Actual-glyph spot samples: representative pages per area, checked against
# the built QIJIC subset cmap (deterministic: first modern chars in document
# order, sorted by codepoint).
SPOT_PAGES = [
    ("Reading Room", [READING_ROOT / "index.html"]),
    ("Dongjing Meng Hua Lu", sorted((READING_ROOT / "dongjing-meng-hua-lu").glob("*/index.html"))),
    ("Yantie Lun", sorted((READING_ROOT / "salt-and-iron").glob("*/index.html"))),
]
SPOT_SAMPLE_SIZE = 14


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


def spot_check(pages: list[Path], label: str, qijic_out: set[int], qiji_fallback: set[str]) -> list[str]:
    """Verifies sampled modern glyphs actually exist in the built QIJIC cmap.
    Chars in the declared fallback list are reported, not failed."""
    from reading_font_corpus import ReadingLayerParser

    chars: set[str] = set()
    for path in pages:
        parser = ReadingLayerParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        parser.close()
        chars |= parser.modern
    sample = sorted(chars)[:SPOT_SAMPLE_SIZE]
    missing = [ch for ch in sample if ord(ch) not in qijic_out and ch not in BOOK_TITLE_RESERVE]
    declared = [ch for ch in missing if ch in qiji_fallback]
    undeclared = [ch for ch in missing if ch not in qiji_fallback]
    status = ", ".join(f"{ch}({'OK' if ord(ch) in qijic_out else 'FALLBACK' if ch in declared else 'MISSING'})" for ch in sample)
    print(f"QIJIC actual-glyph spot check [{label}]: {status}")
    return undeclared


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

    ancient, modern, ancient_sources, modern_sources = collect_layers()

    ancient_stack = source_han_cmap | hanamin_cmap
    modern_stack = qijic_cmap | source_han_cmap | hanamin_cmap

    ancient_missing = sorted((ch for ch in ancient if ord(ch) not in ancient_stack), key=ord)
    modern_missing = sorted((ch for ch in modern if ord(ch) not in modern_stack), key=ord)
    qiji_fallback = sorted((ch for ch in modern if ord(ch) not in qijic_cmap), key=ord)
    ancient_rare = sorted((ch for ch in ancient if ord(ch) not in source_han_cmap and ord(ch) in hanamin_cmap), key=ord)

    print(f"Reading ancient corpus (primary sources): {len(ancient)} characters")
    print(f"Reading modern corpus (editorial layer): {len(modern)} characters")
    print(f"Ancient coverage (Source Han + HanaMin): {len(ancient)-len(ancient_missing)}/{len(ancient)}")
    print(f"Ancient via HanaMin rare fallback:      {len(ancient_rare)}")
    print(f"Modern coverage (QIJIC + fallbacks):    {len(modern)-len(modern_missing)}/{len(modern)}")
    print(f"Modern via QIJIC directly:              {len(modern)-len(qiji_fallback)}")
    print(f"Modern via Source Han/HanaMin fallback: {len(qiji_fallback)}")
    if ancient_rare:
        print("HanaMin ancient fallback:", describe(ancient_rare))
    if qiji_fallback:
        print("QIJIC fallback glyphs:", describe(qiji_fallback))

    if ancient_missing:
        report_missing("Ancient layer (Source Han + HanaMin)", ancient_missing, ancient_sources)
    if modern_missing:
        report_missing("Modern layer (QIJIC + fallbacks)", modern_missing, modern_sources)
    if ancient_missing or modern_missing:
        return 1

    undeclared_spots: list[str] = []
    for label, pages in SPOT_PAGES:
        undeclared_spots.extend(spot_check(pages, label, qijic_cmap, set(qiji_fallback)))
    if undeclared_spots:
        print("ERROR: spot-check glyphs missing from the QIJIC subset without a declared fallback:")
        print(" ", describe(sorted(set(undeclared_spots))))
        return 1

    print("PASS: ancient Reading Chinese resolves through Source Han Serif TC with HanaMin rare fallback; "
          "modern Reading Chinese renders through Galok QIJIC Reading with Source Han + HanaMin fallbacks; "
          "spot-checked glyphs verified against the built QIJIC cmap.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
