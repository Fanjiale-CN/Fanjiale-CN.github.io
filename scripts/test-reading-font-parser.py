#!/usr/bin/env python3
"""Deterministic regression tests for the Reading font-corpus classifier.

Covers the layer rules shared by build-reading-font-subsets.py and
check-reading-font-coverage.py via scripts/reading_font_corpus.py.
Run: py -3 scripts/test-reading-font-parser.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from reading_font_corpus import ReadingLayerParser  # noqa: E402

CJK = set("，。！？；：「」『』（）—…·、〈〉《》")


def classify(html: str) -> tuple[set[str], set[str]]:
    parser = ReadingLayerParser()
    parser.feed(html)
    parser.close()
    assert parser.skip_depth >= 0, "skip_depth went negative"
    assert parser.ancient_depth >= 0, "ancient_depth went negative"
    assert not parser.stack, f"frames leaked: {parser.stack}"
    return parser.ancient, parser.modern


def check(name: str, html: str, expect_ancient: set[str], expect_modern: set[str]) -> None:
    ancient, modern = classify(html)
    problems = []
    if ancient != expect_ancient:
        problems.append(f"ancient {sorted(ancient)} != expected {sorted(expect_ancient)}")
    if modern != expect_modern:
        problems.append(f"modern {sorted(modern)} != expected {sorted(expect_modern)}")
    if problems:
        print(f"FAIL {name}: " + "; ".join(problems))
        sys.exit(1)
    print(f"PASS {name}")


# CASE 1 — class-based ancient container, closed correctly; following text is modern.
check(
    "CASE 1 class container closes, later text stays modern",
    '<div class="reading-primary-text"><blockquote>古文甲</blockquote></div><p>現代乙</p>',
    set("古文甲"),
    set("現代乙"),
)

# CASE 2 — self-closing-text ancient container; following div is modern.
check(
    "CASE 2 source-columns closes",
    '<div class="reading-source-columns">古文甲</div><div>現代乙</div>',
    set("古文甲"),
    set("現代乙"),
)

# CASE 3 — dj-columns with nested span.
check(
    "CASE 3 dj-columns nested span",
    '<div class="dj-columns"><span>古文甲</span></div><p>現代乙</p>',
    set("古文甲"),
    set("現代乙"),
)

# CASE 4 — nested ancient containers restore depth exactly; no leaks, no negatives.
check(
    "CASE 4 nested ancient containers",
    '<blockquote>外甲<div class="dj-columns">內乙</div>外丙</blockquote><p>現代丁</p>',
    set("外甲內乙外丙"),
    set("現代丁"),
)

# CASE 5 — skip containers never pollute either corpus, even after close.
check(
    "CASE 5 skip containers excluded",
    '<script>腳本甲</script><style>樣式乙</style><template>模板丙</template><noscript>無腳本丁</noscript><title>題名戊</title><p>現代己</p>',
    set(),
    set("現代己"),
)

# CASE 6 — tag-based ancient (q) plus tag imbalance tolerance: an ancient <q>
# closed while later modern text follows on the same level.
check(
    "CASE 6 q restores, stray close tolerated",
    '<p>前甲<q>古文乙</q>後丙</p></div><p>現代丁</p>',
    set("古文乙"),
    set("前甲後丙現代丁"),
)

# CASE 7 — plain markup between ancient blocks does not keep the layer open.
check(
    "CASE 7 blockquote then plain paragraphs",
    '<blockquote>古文甲</blockquote><p>釋義乙</p><h2>標題丙</h2><span lang="zh-Hant">標籤丁</span>',
    set("古文甲"),
    set("釋義乙標題丙標籤丁"),
)

# CASE 8 — void tags and self-closing syntax never open frames.
check(
    "CASE 8 void and self-closing tags",
    '<div class="dj-columns">古文甲<br><img src="x.png"><source/>現代乙不在此</div><p>現代丙</p>',
    set("古文甲現代乙不在此"),
    set("現代丙"),
)

# CASE 9 — implicit closes (unclosed <p>) do not leak the ancient state.
check(
    "CASE 9 unclosed paragraph inside ancient container",
    '<div class="reading-primary-text"><p>古文甲<p>古文乙</div><p>現代丙</p>',
    set("古文甲古文乙"),
    set("現代丙"),
)

print("PASS all parser regression cases")
