from pathlib import Path
import subprocess

BASE = 'd980ca754e52db2dea8260c27e43c8202c66372e'

old_data = subprocess.check_output(['git', 'show', f'{BASE}:data/index.html'], text=True)
essay = old_data
essay = essay.replace('https://www.galok.me/data/', 'https://www.galok.me/essays/china-in-more-than-one-number/')
essay = essay.replace('<title>Data — Galok</title>', '<title>China, in More Than One Number — Galok</title>')
essay = essay.replace("A source-auditable reading of China's growth, household life, employment, property, public finance and external balance.", "A data-led essay on why China's production, prices, property and household experience can move in different directions.")
essay = essay.replace('<meta property="og:title" content="Data — Galok">', '<meta property="og:title" content="China, in More Than One Number — Galok">')
essay = essay.replace('<meta name="twitter:title" content="Data — Galok">', '<meta name="twitter:title" content="China, in More Than One Number — Galok">')
essay = essay.replace('<a href="/essays/">Essays</a>', '<a href="/essays/" aria-current="page">Essays</a>')
essay = essay.replace('<a href="/data/" aria-current="page">Data</a>', '<a href="/data/">Data</a>')
essay = essay.replace('<main class="data-page-main" id="top" tabindex="-1">', '<main class="data-page-main" id="top" tabindex="-1"><aside class="data-essay-origin"><span>DATA INSIGHT / ESSAY</span><a href="/data/">Open the Data desk →</a></aside>')
essay = essay.replace('</head>', '<style>.data-essay-origin{display:flex;justify-content:space-between;gap:20px;margin:32px 0 0;padding:12px 0;border-block:1px solid #1c1a17;font:700 .68rem/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.08em}.data-essay-origin a{color:inherit;text-underline-offset:3px}@media(max-width:700px){.data-essay-origin{margin-top:18px;flex-direction:column}}</style></head>')
Path('essays/china-in-more-than-one-number').mkdir(parents=True, exist_ok=True)
Path('essays/china-in-more-than-one-number/index.html').write_text(essay)

content_path = Path('content.js')
content = content_path.read_text()
if '/essays/china-in-more-than-one-number/' not in content:
    marker = '\n  ]\n};'
    entry = '''
    ,{
      series: "frame",
      anchor: "\\u6846",
      issue: 13,
      deck: "One economy, several measurements, different directions.",
      title: "China, in More Than One Number",
      date: "2026",
      readingTime: "12 min",
      url: "/essays/china-in-more-than-one-number/",
      maturity: "growing",
      cover: {
        src: "https://media.galok.me/shared/editorial/data/household-line-zine--313d77ad5263.webp",
        alt: "The Household Line — Galok data edition cover"
      },
      excerpt: "GDP grew, prices barely moved and property investment fell. This essay asks what each measure sees — and what it misses."
    }
'''
    idx = content.rfind(marker)
    if idx == -1:
        raise SystemExit('could not locate end of essays array')
    content = content[:idx] + entry + content[idx:]
    content_path.write_text(content)

workflow = Path('.github/workflows/build-data-desk-v1-once.yml')
if workflow.exists():
    workflow.unlink()

print('Data desk v1 migration materialized')
