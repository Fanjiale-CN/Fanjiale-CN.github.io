#!/usr/bin/env python3
"""Build cumulative Reading supplement fonts without rewriting the frozen base fonts."""

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

BASE_SERIF = FONT_DIR / "genryu-reading-tw.woff2"
BASE_RARE = FONT_DIR / "hanamin-reading-rare.woff2"
BASE_DISPLAY = FONT_DIR / "qiji-reading-title.woff2"
SUPPLEMENT_SERIF = FONT_DIR / "genryu-reading-supplement.woff2"
SUPPLEMENT_DISPLAY = FONT_DIR / "qiji-reading-supplement.woff2"

REQUIRED_PUNCTUATION = set("，。！？；：「」『』（）《》〈〉—…·、〔〕【】﹁﹂﹃﹄　")
TITLE_TEXT = (
    "鹽鐵論管子東京夢華錄"
    "東都外城舊京城河道大內內諸司外諸司御街"
    "宣德樓前省府宮宇朱雀門外街巷州橋夜市東角樓街巷"
    "潘樓東街巷酒樓飲食果子"
    "馬行街北諸醫鋪大內西右掖門外街巷大內前州橋東街巷"
    "相國寺內萬姓交易"
    "本議力耕通有錯幣禁耕復古非鞅晁錯刺權刺復論儒憂邊園池輕重未通地廣貧富毀學褒賢相刺殊路訟賢遵道論誹孝養刺議利議國疾散不足救匱箴石除狹疾貪後刑授時水旱崇禮備胡執務能言取下擊之結和誅秦伐功西域世務和親繇役險固論勇論功論鄒論菑刑德申韓周秦詔聖大論雜論"
)


def is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return 0x3400 <= cp <= 0x4DBF or 0x4E00 <= cp <= 0x9FFF or 0xF900 <= cp <= 0xFAFF or 0x20000 <= cp <= 0x2FA1F


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
    for path in sorted(READING_ROOT.rglob("*.html")):
        parser = VisibleTextParser()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        for ch in "".join(parser.parts):
            if is_cjk(ch) or ch in REQUIRED_PUNCTUATION:
                chars.add(ch)
    return chars


def font_codepoints(path: Path) -> set[int]:
    font = TTFont(path)
    cmap: set[int] = set()
    for table in font["cmap"].tables:
        cmap.update(table.cmap.keys())
    return cmap


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


def subset(source: Path, text: str, output: Path) -> None:
    if not text:
        raise RuntimeError(f"Refusing to create an empty supplement: {output.name}")
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".txt", delete=False) as handle:
        handle.write(text)
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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--genryu-source")
    parser.add_argument("--qiji-source")
    args = parser.parse_args()

    for path in (BASE_SERIF, BASE_RARE, BASE_DISPLAY):
        if not path.exists():
            raise FileNotFoundError(f"Frozen Reading base font is missing: {path}")

    corpus = reading_characters()
    frozen_serif_cmap = font_codepoints(BASE_SERIF) | font_codepoints(BASE_RARE)
    missing_serif_chars = {ch for ch in corpus if ord(ch) not in frozen_serif_cmap}
    frozen_display_cmap = font_codepoints(BASE_DISPLAY)
    missing_display_chars = {ch for ch in TITLE_TEXT if is_cjk(ch) and ord(ch) not in frozen_display_cmap}

    print(f"Reading corpus: {len(corpus)} characters")
    print(f"Serif supplement request: {len(missing_serif_chars)} characters")
    print(f"QIJIC supplement request: {len(missing_display_chars)} characters")

    if not missing_serif_chars and not missing_display_chars:
        print("No supplement changes are required.")
        return 0

    with tempfile.TemporaryDirectory(prefix="galok-reading-supplements-") as tmp:
        tmpdir = Path(tmp)
        genryu = source_or_download(args.genryu_source, GENRYU_URL, tmpdir / "GenRyuMin2TW-R.otf")
        qiji = source_or_download(args.qiji_source, QIJI_URL, tmpdir / "qiji-combo.ttf")

        if missing_serif_chars:
            genryu_cmap = font_codepoints(genryu)
            unsupported = sorted(ch for ch in missing_serif_chars if ord(ch) not in genryu_cmap)
            if unsupported:
                formatted = ", ".join(f"{ch} U+{ord(ch):04X}" for ch in unsupported)
                raise RuntimeError(
                    "Frozen HanaMin fallback does not cover new characters and GenRyu lacks them. "
                    f"Add an explicit rare-font supplement before release: {formatted}"
                )
            serif_text = "".join(sorted(missing_serif_chars, key=ord))
            subset(genryu, serif_text, SUPPLEMENT_SERIF)
            print(f"Wrote {SUPPLEMENT_SERIF.relative_to(ROOT)}")

        if missing_display_chars:
            qiji_cmap = font_codepoints(qiji)
            unsupported = sorted(ch for ch in missing_display_chars if ord(ch) not in qiji_cmap)
            if unsupported:
                formatted = ", ".join(f"{ch} U+{ord(ch):04X}" for ch in unsupported)
                raise RuntimeError(f"QIJIC source lacks required display-title characters: {formatted}")
            display_text = "".join(sorted(missing_display_chars, key=ord))
            subset(qiji, display_text, SUPPLEMENT_DISPLAY)
            print(f"Wrote {SUPPLEMENT_DISPLAY.relative_to(ROOT)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
