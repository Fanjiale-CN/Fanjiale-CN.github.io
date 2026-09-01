#!/usr/bin/env python3
"""Build stable Galok Reading font subsets from official upstream sources."""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import tempfile
import urllib.request

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
READING_ROOT = ROOT / "reading"
FONT_DIR = ROOT / "assets" / "fonts"

GENRYU_URL = "https://raw.githubusercontent.com/ButTaiwan/genryu-font/master/otf/TW/GenRyuMin2TW-R.otf"
QIJI_URL = "https://github.com/LingDong-/qiji-font/releases/download/0.0.4/qiji-combo.ttf"
HANAMIN_URL = "https://github.com/cjkvi/HanaMinAFDKO/releases/download/8.030/HanaMinB.otf"

REQUIRED_PUNCTUATION = set("，。！？；：「」『』（）《》〈〉—…·、〔〕【】﹁﹂﹃﹄　")
TITLE_TEXT = (
    "鹽鐵論管子東京夢華錄"
    "東都外城舊京城河道大內內諸司外諸司御街"
    "宣德樓前省府宮宇朱雀門外街巷州橋夜市東角樓街巷"
    "潘樓東街巷酒樓飲食果子"
    "本議力耕通有錯幣禁耕復古非鞅晁錯刺權刺復論儒憂邊園池輕重未通地廣貧富毀學褒賢相刺殊路訟賢遵道論誹孝養刺議利議國疾散不足救匱箴石除狹疾貪後刑授時水旱崇禮備胡執務能言取下擊之結和誅秦伐功西域世務和親繇役險固論勇論功論鄒論菑刑德申韓周秦詔聖大論雜論"
)


def is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return (
        0x3400 <= cp <= 0x4DBF
        or 0x4E00 <= cp <= 0x9FFF
        or 0xF900 <= cp <= 0xFAFF
        or 0x20000 <= cp <= 0x2FA1F
    )


class VisibleTextParser(HTMLParser):
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


def reading_characters() -> set[str]:
    chars = set(REQUIRED_PUNCTUATION)
    chars.update(TITLE_TEXT)
    for path in sorted(READING_ROOT.rglob("*.html")):
        parser = VisibleTextParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        for ch in "".join(parser.parts):
            if is_cjk(ch) or ch in REQUIRED_PUNCTUATION:
                chars.add(ch)
    return chars


def font_codepoints(path: Path) -> set[int]:
    font = TTFont(path)
    result: set[int] = set()
    for table in font["cmap"].tables:
        result.update(table.cmap.keys())
    return result


def download(url: str, destination: Path) -> Path:
    print(f"Downloading {url}")
    with urllib.request.urlopen(url, timeout=120) as response:
        destination.write_bytes(response.read())
    return destination


def source_or_download(value: str | None, url: str, destination: Path) -> Path:
    if value:
        path = Path(value).expanduser().resolve()
        if not path.exists():
            raise FileNotFoundError(path)
        return path
    return download(url, destination)


def subset(source: Path, text_file: Path, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "pyftsubset",
            str(source),
            f"--text-file={text_file}",
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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--genryu-source")
    parser.add_argument("--qiji-source")
    parser.add_argument("--hanamin-source")
    args = parser.parse_args()

    chars = reading_characters()
    print(f"Reading corpus: {len(chars)} characters")

    with tempfile.TemporaryDirectory(prefix="galok-reading-fonts-") as tmp:
        tmpdir = Path(tmp)
        genryu = source_or_download(args.genryu_source, GENRYU_URL, tmpdir / "GenRyuMin2TW-R.otf")
        qiji = source_or_download(args.qiji_source, QIJI_URL, tmpdir / "qiji-combo.ttf")
        hanamin = source_or_download(args.hanamin_source, HANAMIN_URL, tmpdir / "HanaMinB.otf")

        body_chars = tmpdir / "reading-chars.txt"
        body_chars.write_text("".join(sorted(chars, key=ord)), encoding="utf-8")
        title_chars = tmpdir / "reading-title-chars.txt"
        title_chars.write_text(TITLE_TEXT, encoding="utf-8")

        genryu_cmap = font_codepoints(genryu)
        rare = {ch for ch in chars if ord(ch) not in genryu_cmap}
        hanamin_cmap = font_codepoints(hanamin)
        unsupported = sorted(ch for ch in rare if ord(ch) not in hanamin_cmap)
        if unsupported:
            formatted = ", ".join(f"{ch} U+{ord(ch):04X}" for ch in unsupported)
            raise RuntimeError(f"HanaMinB also lacks required Reading characters: {formatted}")

        rare_chars = tmpdir / "reading-rare-chars.txt"
        rare_chars.write_text("".join(sorted(rare, key=ord)), encoding="utf-8")

        subset(genryu, body_chars, FONT_DIR / "genryu-reading-tw.woff2")
        subset(qiji, title_chars, FONT_DIR / "qiji-reading-title.woff2")
        subset(hanamin, rare_chars, FONT_DIR / "hanamin-reading-rare.woff2")

        print(f"GenRyu subset: {FONT_DIR / 'genryu-reading-tw.woff2'}")
        print(f"Qiji subset: {FONT_DIR / 'qiji-reading-title.woff2'}")
        print(f"HanaMin rare fallback: {len(rare)} characters -> {FONT_DIR / 'hanamin-reading-rare.woff2'}")
        if rare:
            print("Rare fallback characters:", " ".join(sorted(rare, key=ord)))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
