#!/usr/bin/env python3
"""Reading typography corpus builder (V2 two-layer contract).

Layers are classified by scripts/reading_font_corpus.py (shared with
check-reading-font-coverage.py):

- ancient: primary-source Chinese — blockquote, q, .reading-primary-text,
  .reading-source-columns, .dj-columns. Rendered by Source Han Serif TC,
  with HanaMin as the rare-glyph fallback.
- modern: all other Reading Chinese (titles, labels, captions, UI, menus,
  glossary terms). Rendered by Galok QIJIC Reading; glyphs the QIJIC source
  lacks fall back to Source Han, which is why the Source Han subset also
  carries `qiji_missing`.

Classification is structural (container-based), so the corpus is
reproducible from the HTML alone. Normal content work does not run this
builder automatically; run it when the Reading corpus changes and commit
the canonical outputs.
"""
from __future__ import annotations

import hashlib
import os
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

from fontTools.ttLib import TTFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
from reading_font_corpus import REQUIRED_PUNCTUATION, collect_layers, describe  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "assets" / "fonts"

# Source URLs can be overridden per environment (e.g. local file:// mirrors or
# region-reachable mirrors) without changing the canonical defaults.
SOURCE_HAN_URL = os.environ.get("GALOK_SOURCE_HAN_URL", "https://raw.githubusercontent.com/adobe-fonts/source-han-serif/release/OTF/TraditionalChinese/SourceHanSerifTC-Regular.otf")
QIJI_URL = os.environ.get("GALOK_QIJI_URL", "https://github.com/LingDong-/qiji-font/releases/download/0.0.4/qiji-combo.ttf")
HANAMIN_URL = os.environ.get("GALOK_HANAMIN_URL", "https://github.com/cjkvi/HanaMinAFDKO/releases/download/8.030/HanaMinB.otf")


def font_codepoints(path: Path) -> set[int]:
    font = TTFont(path)
    cmap: set[int] = set()
    for table in font["cmap"].tables:
        cmap.update(table.cmap.keys())
    font.close()
    return cmap


def family_names(path: Path) -> list[str]:
    font = TTFont(path)
    out: set[str] = set()
    for rec in font["name"].names:
        if rec.nameID in (1, 4, 6):
            try:
                out.add(rec.toUnicode())
            except Exception:
                pass
    font.close()
    return sorted(out)


def download(url: str, destination: Path) -> Path:
    print(f"Downloading {url}")
    with urllib.request.urlopen(url, timeout=180) as response:
        destination.write_bytes(response.read())
    return destination


def subset(source: Path, chars: set[str], output: Path) -> None:
    if not chars:
        raise RuntimeError(f"Refusing to build empty subset for {output.name}")
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False, suffix=".txt") as handle:
        handle.write("".join(sorted(chars, key=ord)))
        text_path = Path(handle.name)
    try:
        subprocess.run(
            [
                "pyftsubset",
                str(source),
                f"--text-file={text_path}",
                f"--output-file={output}",
                "--flavor=woff2",
                "--layout-features=*",
                "--glyph-names",
                "--symbol-cmap",
                "--legacy-cmap",
                "--notdef-glyph",
                "--notdef-outline",
                "--recommended-glyphs",
                "--name-IDs=*",
                "--name-legacy",
                "--name-languages=*",
            ],
            check=True,
        )
    finally:
        text_path.unlink(missing_ok=True)


def git_blob_sha(path: Path) -> str:
    data = path.read_bytes()
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def main() -> int:
    ancient, modern, _, _ = collect_layers()
    print(f"Ancient corpus (primary sources): {len(ancient)} chars")
    print(f"Modern corpus (editorial layer):  {len(modern)} chars")

    with tempfile.TemporaryDirectory(prefix="galok-reading-fonts-") as tmp:
        tmpdir = Path(tmp)
        source_han = download(SOURCE_HAN_URL, tmpdir / "SourceHanSerifTC-Regular.otf")
        qiji = download(QIJI_URL, tmpdir / "qiji-combo.ttf")
        hanamin = download(HANAMIN_URL, tmpdir / "HanaMinB.otf")

        print("Source Han source:", source_han.stat().st_size, family_names(source_han))
        print("QIJIC source:", qiji.stat().st_size, family_names(qiji))
        print("HanaMin source:", hanamin.stat().st_size, family_names(hanamin))

        source_han_cmap = font_codepoints(source_han)
        qiji_cmap = font_codepoints(qiji)
        hanamin_cmap = font_codepoints(hanamin)

        # Modern glyphs the QIJIC source itself lacks. They stay modern, but
        # the Source Han subset must carry them because it is the modern
        # stack's first fallback.
        qiji_missing = sorted((ch for ch in modern if ord(ch) not in qiji_cmap), key=ord)

        # Rare glyphs: anything (ancient or modern) absent from Source Han
        # falls to HanaMin — including QIJIC-missing modern chars.
        rare = {ch for ch in (ancient | set(qiji_missing)) if ord(ch) not in source_han_cmap}
        hana_unsupported = sorted((ch for ch in rare if ord(ch) not in hanamin_cmap), key=ord)
        if hana_unsupported:
            raise RuntimeError(
                "Source Han and HanaMin both lack Reading glyphs: "
                + describe(hana_unsupported)
            )

        unsupported_modern = [ch for ch in qiji_missing if ord(ch) not in source_han_cmap and ord(ch) not in hanamin_cmap]
        if unsupported_modern:
            raise RuntimeError(
                "Modern glyphs missing from QIJIC, Source Han and HanaMin: "
                + describe(unsupported_modern)
            )

        FONT_DIR.mkdir(parents=True, exist_ok=True)
        source_han_out = FONT_DIR / "source-han-serif-tc-reading.woff2"
        qiji_out = FONT_DIR / "qiji-reading-modern.woff2"
        hana_out = FONT_DIR / "hanamin-reading-rare.woff2"

        source_han_chars = (ancient | set(qiji_missing) | REQUIRED_PUNCTUATION) - rare
        subset(source_han, source_han_chars, source_han_out)
        subset(qiji, modern, qiji_out)
        subset(hanamin, rare, hana_out)

        source_han_out_cmap = font_codepoints(source_han_out)
        qiji_out_cmap = font_codepoints(qiji_out)
        hana_out_cmap = font_codepoints(hana_out)

        # Actual-glyph guarantee: every modern char that exists in the QIJIC
        # source must exist in the built QIJIC subset (no silent subsetting
        # drops); every fallback char must exist in the fallback face.
        dropped = sorted((ch for ch in modern if ord(ch) in qiji_cmap and ord(ch) not in qiji_out_cmap), key=ord)
        if dropped:
            raise RuntimeError("QIJIC subset dropped glyphs its source contains: " + describe(dropped))
        fallback_missing = sorted((ch for ch in qiji_missing if ord(ch) not in source_han_out_cmap and ord(ch) not in hana_out_cmap), key=ord)
        if fallback_missing:
            raise RuntimeError("Fallback faces lack modern glyphs: " + describe(fallback_missing))

        ancient_missing = sorted((ch for ch in ancient if ord(ch) not in source_han_out_cmap and ord(ch) not in hana_out_cmap), key=ord)
        modern_missing = sorted((ch for ch in modern if ord(ch) not in qiji_out_cmap and ord(ch) not in source_han_out_cmap and ord(ch) not in hana_out_cmap), key=ord)
        if ancient_missing or modern_missing:
            raise RuntimeError(
                f"Post-build coverage failure: ancient={ancient_missing!r} modern={modern_missing!r}"
            )

        for path in (source_han_out, qiji_out, hana_out):
            cmap = font_codepoints(path)
            print(
                f"CANONICAL {path.relative_to(ROOT)} size={path.stat().st_size} cmap={len(cmap)} "
                f"git_blob={git_blob_sha(path)} sha256={hashlib.sha256(path.read_bytes()).hexdigest()}"
            )

        if rare:
            print("HanaMin ancient fallback glyphs:", describe(sorted(rare, key=ord)))
        if qiji_missing:
            print(f"QIJIC source missing {len(qiji_missing)} modern glyph(s), served by Source Han fallback:")
            print(" ", describe(qiji_missing))
        modern_direct = len(modern) - len(qiji_missing)
        print(
            f"PASS: ancient {len(ancient)}/{len(ancient)} via Source Han+HanaMin, "
            f"modern {len(modern)}/{len(modern)} via QIJIC "
            f"({modern_direct} direct, {len(qiji_missing)} Source Han fallback), "
            f"rare fallback {len(rare)}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
