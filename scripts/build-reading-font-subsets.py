#!/usr/bin/env python3
"""Reading typography corpus builder (V2 two-layer contract).

Layers:
- ancient: primary-source Chinese — blockquote, q, .reading-primary-text,
  .reading-source-columns, .dj-columns. Rendered by Source Han Serif TC,
  with HanaMin as the rare-glyph fallback.
- modern: all other Reading Chinese (titles, labels, captions, UI, menus,
  glossary terms). Rendered by Galok QIJIC Reading; glyphs the QIJIC source
  lacks fall back to Source Han, which is why the Source Han subset also
  carries `qiji_missing`.

The classification is structural (container-based), so the corpus is
reproducible from the HTML alone and independent of machine state. Normal
content work does not run this builder automatically; run it when the
Reading corpus changes and commit the canonical outputs.
"""
from __future__ import annotations

import hashlib
import os
import subprocess
import tempfile
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
READING_ROOT = ROOT / "reading"
FONT_DIR = ROOT / "assets" / "fonts"

# Source URLs can be overridden per environment (e.g. local file:// mirrors or
# region-reachable mirrors) without changing the canonical defaults.
SOURCE_HAN_URL = os.environ.get("GALOK_SOURCE_HAN_URL", "https://raw.githubusercontent.com/adobe-fonts/source-han-serif/release/OTF/TraditionalChinese/SourceHanSerifTC-Regular.otf")
QIJI_URL = os.environ.get("GALOK_QIJI_URL", "https://github.com/LingDong-/qiji-font/releases/download/0.0.4/qiji-combo.ttf")
HANAMIN_URL = os.environ.get("GALOK_HANAMIN_URL", "https://github.com/cjkvi/HanaMinAFDKO/releases/download/8.030/HanaMinB.otf")

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
    modern editorial layer (everything else) by DOM ancestry."""

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


def pages() -> list[Path]:
    return sorted(p for p in READING_ROOT.rglob("*.html"))


def collect() -> tuple[set[str], set[str]]:
    ancient: set[str] = set()
    modern: set[str] = set()
    for path in pages():
        parser = ReadingLayerParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        ancient |= parser.ancient
        modern |= parser.modern
        # Punctuation: each layer carries the punctuation it actually uses,
        # plus the shared required set as a display/UI reserve.
        ancient |= parser.ancient_punct | REQUIRED_PUNCTUATION
        modern |= parser.modern_punct | REQUIRED_PUNCTUATION
    modern |= BOOK_TITLE_RESERVE
    return ancient, modern


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


def describe(chars: list[str]) -> str:
    return " ".join(f"{ch}(U+{ord(ch):04X})" for ch in chars)


def main() -> int:
    ancient, modern = collect()
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

        # Rare ancient glyphs: absent from Source Han, covered by HanaMin.
        rare = {ch for ch in ancient if ord(ch) not in source_han_cmap}
        hana_unsupported = sorted((ch for ch in rare if ord(ch) not in hanamin_cmap), key=ord)
        if hana_unsupported:
            raise RuntimeError(
                "Source Han and HanaMin both lack ancient Reading glyphs: "
                + describe(hana_unsupported)
            )

        # Modern glyphs the QIJIC source itself lacks. They stay modern, but
        # the Source Han subset must carry them because it is the modern
        # stack's first fallback.
        qiji_missing = sorted((ch for ch in modern if ord(ch) not in qiji_cmap), key=ord)
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
