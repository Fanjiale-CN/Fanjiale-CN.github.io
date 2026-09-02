#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import subprocess
import tempfile
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
READING_ROOT = ROOT / "reading"
FONT_DIR = ROOT / "assets" / "fonts"
DISPLAY_MANIFEST = ROOT / "scripts" / "reading-display-glyphs.txt"

GENRYU_URL = "https://raw.githubusercontent.com/ButTaiwan/genryu-font/master/otf/TW/GenRyuMin2TW-R.otf"
QIJI_URL = "https://github.com/LingDong-/qiji-font/releases/download/0.0.4/qiji-combo.ttf"
HANAMIN_URL = "https://github.com/cjkvi/HanaMinAFDKO/releases/download/8.030/HanaMinB.otf"

REQUIRED_PUNCTUATION = set("，。！？；：「」『』（）《》〈〉—…·、〔〕【】﹁﹂﹃﹄　")
PRIMARY_CLASSES = {"dj-columns", "reading-primary-text"}
SKIP_TAGS = {"script", "style", "template", "noscript"}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


def is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return (
        0x3400 <= cp <= 0x4DBF
        or 0x4E00 <= cp <= 0x9FFF
        or 0xF900 <= cp <= 0xFAFF
        or 0x20000 <= cp <= 0x2FA1F
    )


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


def collect_corpora() -> tuple[set[str], set[str]]:
    primary = set(REQUIRED_PUNCTUATION)
    display: set[str] = set()
    for path in sorted(READING_ROOT.rglob("*.html")):
        parser = ReadingTextParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        for ch in "".join(parser.primary_parts):
            if is_cjk(ch) or ch in REQUIRED_PUNCTUATION:
                primary.add(ch)
        for ch in "".join(parser.display_parts):
            if is_cjk(ch):
                display.add(ch)
    if DISPLAY_MANIFEST.exists():
        display.update(ch for ch in DISPLAY_MANIFEST.read_text(encoding="utf-8") if is_cjk(ch))
    return primary, display


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
    primary, display = collect_corpora()
    print(f"Primary/source corpus: {len(primary)} chars")
    print(f"Display/UI corpus: {len(display)} chars")

    with tempfile.TemporaryDirectory(prefix="galok-canonical-fonts-") as tmp:
        tmpdir = Path(tmp)
        genryu = download(GENRYU_URL, tmpdir / "GenRyuMin2TW-R.otf")
        qiji = download(QIJI_URL, tmpdir / "qiji-combo.ttf")
        hanamin = download(HANAMIN_URL, tmpdir / "HanaMinB.otf")

        print("GenRyu source:", genryu.stat().st_size, family_names(genryu))
        print("QIJIC source:", qiji.stat().st_size, family_names(qiji))
        print("HanaMin source:", hanamin.stat().st_size, family_names(hanamin))

        genryu_cmap = font_codepoints(genryu)
        qiji_cmap = font_codepoints(qiji)
        hanamin_cmap = font_codepoints(hanamin)

        qiji_unsupported = sorted(ch for ch in display if ord(ch) not in qiji_cmap)
        if qiji_unsupported:
            raise RuntimeError("QIJIC source lacks display chars: " + " ".join(f"{ch}(U+{ord(ch):04X})" for ch in qiji_unsupported))

        rare = {ch for ch in primary if ord(ch) not in genryu_cmap}
        hana_unsupported = sorted(ch for ch in rare if ord(ch) not in hanamin_cmap)
        if hana_unsupported:
            raise RuntimeError("HanaMin source also lacks primary chars: " + " ".join(f"{ch}(U+{ord(ch):04X})" for ch in hana_unsupported))

        FONT_DIR.mkdir(parents=True, exist_ok=True)
        genryu_out = FONT_DIR / "genryu-reading-tw.woff2"
        qiji_out = FONT_DIR / "qiji-reading-title.woff2"
        hana_out = FONT_DIR / "hanamin-reading-rare.woff2"

        subset(genryu, primary - rare, genryu_out)
        subset(qiji, display, qiji_out)
        subset(hanamin, rare, hana_out)

        gen_out_cmap = font_codepoints(genryu_out)
        qiji_out_cmap = font_codepoints(qiji_out)
        hana_out_cmap = font_codepoints(hana_out)

        primary_missing = sorted(ch for ch in primary if ord(ch) not in (gen_out_cmap | hana_out_cmap))
        display_missing = sorted(ch for ch in display if ord(ch) not in qiji_out_cmap)
        if primary_missing or display_missing:
            raise RuntimeError(f"Post-build coverage failure: primary={primary_missing!r} display={display_missing!r}")

        for path in (genryu_out, qiji_out, hana_out):
            cmap = font_codepoints(path)
            print(f"CANONICAL {path.relative_to(ROOT)} size={path.stat().st_size} cmap={len(cmap)} git_blob={git_blob_sha(path)} sha256={hashlib.sha256(path.read_bytes()).hexdigest()}")

        print(f"PASS: primary {len(primary)}/{len(primary)}, display {len(display)}/{len(display)}, rare fallback {len(rare)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
