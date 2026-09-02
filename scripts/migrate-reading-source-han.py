#!/usr/bin/env python3
"""One-time migration from the layered Reading CJK font system to Source Han Serif TC."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
READING = ROOT / "reading"

OLD_LINK_RE = re.compile(r'<link rel="stylesheet" href="/reading/qijic-type-system\.css\?v=[^"]+">')
DISPLAY_LINK_RE = re.compile(r'\s*<link rel="stylesheet" href="/reading/reading-display-20260902\.css\?v=[^"]+">')
NEW_LINK = '<link rel="stylesheet" href="/reading/reading-type-system.css?v=20260902-sourcehan-1">'

LEGACY_FONT_TOKENS = (
    "Galok Reading Serif",
    "Galok Qiji Entry",
    "Galok Qiji V3",
    "Galok Qiji Reading Notes",
)
FONT_FACE_RE = re.compile(r"@font-face\s*\{[^{}]*\}", re.S)
FONT_FAMILY_RE = re.compile(r"font-family\s*:[^;}]+")


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path.relative_to(ROOT)}: expected one match for {old!r}, got {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def migrate_html() -> None:
    linked = 0
    for path in sorted(READING.rglob("*.html")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        new_text, count = OLD_LINK_RE.subn(NEW_LINK, text)
        linked += count
        new_text = DISPLAY_LINK_RE.sub("", new_text)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
    if linked == 0:
        raise RuntimeError("No Reading HTML pages referenced qijic-type-system.css")
    print(f"Migrated {linked} Reading stylesheet links to reading-type-system.css")

    dongjing = READING / "dongjing-meng-hua-lu" / "index.html"
    replace_once(
        dongjing,
        '<h1 class="dj-title-zh" lang="zh-Hant">東京夢華錄</h1>',
        '<h1 class="dj-title-zh reading-book-title-zh" lang="zh-Hant">東京夢華錄</h1>',
    )

    yantie = READING / "salt-and-iron" / "index.html"
    replace_once(
        yantie,
        '<div class="reading-room-title"><p>ANCIENT TEXTS / MODERN QUESTIONS</p><h1>鹽鐵論</h1><h2>YANTIE LUN</h2></div>',
        '<div class="reading-room-title"><p>ANCIENT TEXTS / MODERN QUESTIONS</p><h1 class="reading-book-title-zh" lang="zh-Hant">鹽鐵論</h1><h2>YANTIE LUN</h2></div>',
    )

    reading_index = READING / "index.html"
    replace_once(
        reading_index,
        '<strong data-reading-preview-title>鹽鐵論</strong>',
        '<strong class="reading-book-title-zh" lang="zh-Hant" data-reading-preview-title>鹽鐵論</strong>',
    )


def migrate_reading_js() -> None:
    path = READING / "reading.js"
    text = path.read_text(encoding="utf-8")
    text = text.replace('<span class="reading-book-title-zh" lang="zh-Hant">鹽鐵論</span>', '<span lang="zh-Hant">鹽鐵論</span>')
    text = text.replace('<span class="reading-book-title-zh" lang="zh-Hant">管子</span>', '<span lang="zh-Hant">管子</span>')
    text = text.replace('<span class="reading-book-title-zh" lang="zh-Hant">東京夢華錄</span>', '<span lang="zh-Hant">東京夢華錄</span>')
    old = "if (previewTitle) previewTitle.textContent = item.title;"
    new = "if (previewTitle) { previewTitle.textContent = item.title; previewTitle.classList.add('reading-book-title-zh'); previewTitle.setAttribute('lang', 'zh-Hant'); }"
    if text.count(old) != 1:
        raise RuntimeError(f"reading/reading.js: expected one previewTitle assignment, got {text.count(old)}")
    text = text.replace(old, new, 1)
    path.write_text(text, encoding="utf-8")


def clean_legacy_css() -> None:
    changed = 0
    for path in sorted(READING.glob("*.css")):
        if path.name in {"reading-type-system.css", "qijic-type-system.css", "reading-display-20260902.css"}:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")

        def drop_old_face(match: re.Match[str]) -> str:
            block = match.group(0)
            return "" if any(token in block for token in LEGACY_FONT_TOKENS) else block

        text2 = FONT_FACE_RE.sub(drop_old_face, text)

        def normalize_family(match: re.Match[str]) -> str:
            decl = match.group(0)
            if not any(token in decl for token in LEGACY_FONT_TOKENS):
                return decl
            if "Galok Bagnard" in decl or "Galok Gambetta" in decl:
                return "font-family:var(--reading-display-mixed)"
            return "font-family:var(--reading-cjk)"

        text2 = FONT_FAMILY_RE.sub(normalize_family, text2)
        if text2 != text:
            path.write_text(text2, encoding="utf-8")
            changed += 1
    print(f"Normalized legacy local CJK font declarations in {changed} CSS files")


def clean_obsolete_files() -> None:
    for rel in (
        "reading/qijic-type-system.css",
        "reading/reading-display-20260902.css",
        "scripts/reading-display-glyphs.txt",
    ):
        path = ROOT / rel
        if path.exists():
            path.unlink()
            print(f"Removed {rel}")


def update_validation_workflow() -> None:
    path = ROOT / ".github" / "workflows" / "rebuild-reading-fonts-once.yml"
    text = path.read_text(encoding="utf-8")
    text = text.replace('      - "scripts/reading-display-glyphs.txt"\n', '')
    text = text.replace(
        '          echo "Reading uses three canonical font assets with semantic fallback; routine content must not create supplement fonts."',
        '          echo "Reading uses Source Han Serif TC for all ordinary Chinese, QIJIC only for book-title displays, and HanaMin only for rare fallback."',
    )
    text = text.replace(
        '          echo "If font coverage is genuinely missing, rebuild the canonical GenRyu/QIJIC/HanaMin assets in one typography-maintenance commit."',
        '          echo "If font coverage is genuinely missing, rebuild the canonical Source Han/QIJIC/HanaMin assets in one typography-maintenance commit."',
    )
    path.write_text(text, encoding="utf-8")


def main() -> int:
    migrate_html()
    migrate_reading_js()
    clean_legacy_css()
    clean_obsolete_files()
    update_validation_workflow()
    print("PASS: Reading source tree migrated to the unified Source Han typography contract")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
