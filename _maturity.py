#!/usr/bin/env python3
"""Inject maturity (planted/growing/evergreen) into content.js essays."""
import re

p = 'content.js'
s = open(p).read()

maturity = {
    'the-curators-curse/': 'growing',
    'the-water-is-rising/': 'growing',
    'peoples-republic-of-ai/': 'evergreen',
    'honor-phone-case-lawsuit/': 'evergreen',
    'xiaohongshu-world-cup/': 'evergreen',
    'tourism-assembly-line/': 'growing',
    'ai-goes-silent-censorship-infrastructure/': 'growing',
    'latte-price-illusion/': 'evergreen',
    'platforms-redesign-choice/': 'growing',
    'goose-leg-official-narrative/': 'planted',
    'rmb-9-9-coffee/': 'evergreen',
    'cyber-audit-proof-economy/': 'growing',
}

n = 0

def add(m):
    global n
    slug = m.group(1)
    if slug in maturity:
        n += 1
        return m.group(0) + '      maturity: "' + maturity[slug] + '",\n'
    return m.group(0)

s2 = re.sub(r'url: "(/essays/[^/]+/)",\n', add, s)
assert s2 != s, 'no replacement made'
open(p, 'w').write(s2)
print('patched:', n)
