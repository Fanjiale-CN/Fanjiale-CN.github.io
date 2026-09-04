#!/usr/bin/env python3
"""Maintenance-only builder for Galok Reading Chinese fonts.

Typography contract:
- ordinary Reading Chinese -> Source Han Serif TC;
- explicit large book titles -> QIJIC;
- HanaMin -> last-resort fallback for glyphs absent from Source Han Serif TC.

Normal content work does not run this builder automatically. When a new Reading entry
introduces uncovered glyphs, run this maintenance command and commit the canonical
font outputs together with the content that requires them.
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


def collect_corpus() -> set[str]:
    chinese = set(REQUIRED_PUNCTUATION)
    for path in sorted(READING_ROOT.rglob("*.html")):
        parser = ReadingTextParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        for ch in "".join(parser.parts):
            if is_cjk(ch) or ch in REQUIRED_PUNCTUATION:
                chinese.add(ch)
    return chinese


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
    source_han_chars = collect_corpus()
    book_title_chars = set(BOOK_TITLE_RESERVE)
    print(f"Unified Source Han Chinese corpus: {len(source_han_chars)} chars")
    print(f"QIJIC book-title corpus: {len(book_title_chars)} chars")

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

        book_title_missing = sorted(ch for ch in book_title_chars if ord(ch) not in qiji_cmap)
        if book_title_missing:
            raise RuntimeError(
                "QIJIC source lacks reserved book-title glyphs: "
                + " ".join(f"{ch}(U+{ord(ch):04X})" for ch in book_title_missing)
            )

        rare = {ch for ch in source_han_chars if ord(ch) not in source_han_cmap}
        hana_unsupported = sorted(ch for ch in rare if ord(ch) not in hanamin_cmap)
        if hana_unsupported:
            raise RuntimeError(
                "Source Han and HanaMin both lack Reading glyphs: "
                + " ".join(f"{ch}(U+{ord(ch):04X})" for ch in hana_unsupported)
            )

        FONT_DIR.mkdir(parents=True, exist_ok=True)
        source_han_out = FONT_DIR / "source-han-serif-tc-reading.woff2"
        qiji_out = FONT_DIR / "qiji-reading-title.woff2"
        hana_out = FONT_DIR / "hanamin-reading-rare.woff2"

        subset(source_han, source_han_chars - rare, source_han_out)
        subset(qiji, book_title_chars, qiji_out)
        subset(hanamin, rare, hana_out)

        source_han_out_cmap = font_codepoints(source_han_out)
        qiji_out_cmap = font_codepoints(qiji_out)
        hana_out_cmap = font_codepoints(hana_out)

        reading_stack = source_han_out_cmap | hana_out_cmap
        chinese_missing = sorted(ch for ch in source_han_chars if ord(ch) not in reading_stack)
        title_missing = sorted(ch for ch in book_title_chars if ord(ch) not in qiji_out_cmap)
        if chinese_missing or title_missing:
            raise RuntimeError(f"Post-build coverage failure: Chinese={chinese_missing!r} book_titles={title_missing!r}")

        for path in (source_han_out, qiji_out, hana_out):
            cmap = font_codepoints(path)
            print(
                f"CANONICAL {path.relative_to(ROOT)} size={path.stat().st_size} cmap={len(cmap)} "
                f"git_blob={git_blob_sha(path)} sha256={hashlib.sha256(path.read_bytes()).hexdigest()}"
            )

        if rare:
            print("HanaMin rare fallback glyphs:", " ".join(f"{ch}(U+{ord(ch):04X})" for ch in sorted(rare, key=ord)))
        print(
            f"PASS: Source Han/HanaMin {len(source_han_chars)}/{len(source_han_chars)}, "
            f"QIJIC book titles {len(book_title_chars)}/{len(book_title_chars)}, rare fallback {len(rare)}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
