from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
page = ROOT / 'reading/dongjing-meng-hua-lu/index.html'
s = page.read_text(encoding='utf-8')

if '/reading/dongjing-drawers.css' not in s:
    s = s.replace(
        '<link rel="stylesheet" href="/reading/dongjing.css?v=20260831c">',
        '<link rel="stylesheet" href="/reading/dongjing.css?v=20260831d">\n  <link rel="stylesheet" href="/reading/dongjing-drawers.css?v=20260831a">'
    )
else:
    s = s.replace('/reading/dongjing.css?v=20260831c', '/reading/dongjing.css?v=20260831d')

s = s.replace('<a href="#volume-one">VOLUME I</a>', '<a href="#volume-2">CURRENT VOLUME</a>')

archive = '''    <section class="dj-section dj-volume-archive" id="volume-archive" aria-labelledby="archive-title" data-volume-archive>
      <header class="dj-section-head"><p>01 / VOLUME ARCHIVE</p><div><h2 id="archive-title">Ten volumes. One drawer at a time.</h2><span>The book now behaves like an archive cabinet: open one volume to see its entries, close it by moving to another. Completed volumes stay compact; the volume currently being built opens by default.</span></div></header>

      <div class="dj-drawer-stack">
        <details class="dj-volume-drawer is-complete" id="volume-1" data-volume-drawer>
          <summary><span class="dj-drawer-number">I</span><span class="dj-drawer-title"><b>URBAN FRAME</b><small>COMPLETE / CITY STRUCTURE + STATE LOGISTICS</small></span><span class="dj-drawer-range">01–06</span><span class="dj-drawer-progress">6 / 6</span><span class="dj-drawer-status" aria-hidden="true"></span></summary>
          <div class="dj-drawer-panel">
            <div class="dj-drawer-panel-intro"><h3>The city's frame is complete.</h3><p>Walls, the inherited old city, waterways, the imperial precinct and the supply bureaucracy establish the physical and logistical ground of Northern Song Kaifeng.</p></div>
            <div class="dj-drawer-entries">
              <a class="dj-drawer-entry" href="/reading/dongjing-meng-hua-lu/01/"><span>01</span><span class="dj-drawer-entry-title"><strong>Outer City</strong><small lang="zh-Hant">東都外城</small></span><span class="dj-drawer-entry-note">Walls, moat, gates, water gates and defense.</span><span class="dj-drawer-entry-state">LIVE</span><span class="dj-drawer-entry-time">≈ 14 MIN</span></a>
              <a class="dj-drawer-entry" href="/reading/dongjing-meng-hua-lu/02/"><span>02</span><span class="dj-drawer-entry-title"><strong>Old City</strong><small lang="zh-Hant">舊京城</small></span><span class="dj-drawer-entry-note">The inherited inner enclosure and Jinglong Gate.</span><span class="dj-drawer-entry-state">LIVE</span><span class="dj-drawer-entry-time">≈ 8 MIN</span></a>
              <a class="dj-drawer-entry" href="/reading/dongjing-meng-hua-lu/03/"><span>03</span><span class="dj-drawer-entry-title"><strong>Waterways</strong><small lang="zh-Hant">河道</small></span><span class="dj-drawer-entry-note">Four rivers, grain transport, bridges and Zhouqiao.</span><span class="dj-drawer-entry-state">LIVE</span><span class="dj-drawer-entry-time">≈ 18 MIN</span></a>
              <a class="dj-drawer-entry" href="/reading/dongjing-meng-hua-lu/04/"><span>04</span><span class="dj-drawer-entry-title"><strong>Imperial Palace</strong><small lang="zh-Hant">大內</small></span><span class="dj-drawer-entry-note">Palace gates, halls, supply routes and Donghua Gate.</span><span class="dj-drawer-entry-state">LIVE</span><span class="dj-drawer-entry-time">≈ 18 MIN</span></a>
              <a class="dj-drawer-entry" href="/reading/dongjing-meng-hua-lu/05/"><span>05</span><span class="dj-drawer-entry-title"><strong>Inner Departments</strong><small lang="zh-Hant">內諸司</small></span><span class="dj-drawer-entry-note">Writing, reception, security, treasuries and court service.</span><span class="dj-drawer-entry-state">LIVE</span><span class="dj-drawer-entry-time">≈ 10 MIN</span></a>
              <a class="dj-drawer-entry" href="/reading/dongjing-meng-hua-lu/06/"><span>06</span><span class="dj-drawer-entry-title"><strong>Outer Departments</strong><small lang="zh-Hant">外諸司</small></span><span class="dj-drawer-entry-note">Workshops, animals, fuel, granaries and fodder yards.</span><span class="dj-drawer-entry-state">LIVE</span><span class="dj-drawer-entry-time">≈ 14 MIN</span></a>
            </div>
          </div>
        </details>

        <details class="dj-volume-drawer is-current" id="volume-2" data-volume-drawer open>
          <summary><span class="dj-drawer-number">II</span><span class="dj-drawer-title"><b>STREETS &amp; FOOD</b><small>IN PROGRESS / ENTRY 07 NEXT</small></span><span class="dj-drawer-range">07–14</span><span class="dj-drawer-progress">0 / 8</span><span class="dj-drawer-status" aria-hidden="true"></span></summary>
          <div class="dj-drawer-panel">
            <div class="dj-drawer-panel-intro"><h3>The city opens onto the street.</h3><p>Volume II moves out from the imperial forecourt into avenues, neighborhoods, night markets, wine houses and food. This is where the capital begins to feel inhabited rather than diagrammed.</p></div>
            <div class="dj-drawer-entries">
              <div class="dj-drawer-entry is-queued"><span>07</span><span class="dj-drawer-entry-title"><strong>Imperial Avenue</strong><small lang="zh-Hant">御街</small></span><span class="dj-drawer-entry-note">Xuande Gate, imperial drains, vermilion barriers and the ceremonial avenue.</span><span class="dj-drawer-entry-state">NEXT</span><span class="dj-drawer-entry-time">—</span></div>
              <div class="dj-drawer-entry is-queued"><span>08</span><span class="dj-drawer-entry-title"><strong>Palace Forecourt</strong><small lang="zh-Hant">宣德樓前省府宮宇</small></span><span class="dj-drawer-entry-note">Government buildings around the forecourt of Xuande Tower.</span><span class="dj-drawer-entry-state">QUEUED</span><span class="dj-drawer-entry-time">—</span></div>
              <div class="dj-drawer-entry is-queued"><span>09</span><span class="dj-drawer-entry-title"><strong>Zhuque Gate Streets</strong><small lang="zh-Hant">朱雀門外街巷</small></span><span class="dj-drawer-entry-note">Street fabric, religious sites, shops and neighborhoods south of the gate.</span><span class="dj-drawer-entry-state">QUEUED</span><span class="dj-drawer-entry-time">—</span></div>
              <div class="dj-drawer-entry is-queued"><span>10</span><span class="dj-drawer-entry-title"><strong>Zhouqiao Night Market</strong><small lang="zh-Hant">州橋夜市</small></span><span class="dj-drawer-entry-note">Night trade, food stalls, opening hours and the excavated bridge district.</span><span class="dj-drawer-entry-state">QUEUED</span><span class="dj-drawer-entry-time">—</span></div>
              <div class="dj-drawer-entry is-queued"><span>11</span><span class="dj-drawer-entry-title"><strong>Dongjiaolou Streets</strong><small lang="zh-Hant">東角樓街巷</small></span><span class="dj-drawer-entry-note">A dense commercial district and its flows of people and goods.</span><span class="dj-drawer-entry-state">QUEUED</span><span class="dj-drawer-entry-time">—</span></div>
              <div class="dj-drawer-entry is-queued"><span>12</span><span class="dj-drawer-entry-title"><strong>Panlou East Streets</strong><small lang="zh-Hant">潘樓東街巷</small></span><span class="dj-drawer-entry-note">Shop names, street geography and the texture of retail concentration.</span><span class="dj-drawer-entry-state">QUEUED</span><span class="dj-drawer-entry-time">—</span></div>
              <div class="dj-drawer-entry is-queued"><span>13</span><span class="dj-drawer-entry-title"><strong>Wine Houses</strong><small lang="zh-Hant">酒樓</small></span><span class="dj-drawer-entry-note">Large drinking establishments, service, entertainment and urban consumption.</span><span class="dj-drawer-entry-state">QUEUED</span><span class="dj-drawer-entry-time">—</span></div>
              <div class="dj-drawer-entry is-queued"><span>14</span><span class="dj-drawer-entry-title"><strong>Food &amp; Fruit</strong><small lang="zh-Hant">飲食果子</small></span><span class="dj-drawer-entry-note">A future menu archive of prepared food, snacks, fruit and everyday appetite.</span><span class="dj-drawer-entry-state">QUEUED</span><span class="dj-drawer-entry-time">—</span></div>
            </div>
          </div>
        </details>

        <details class="dj-volume-drawer" id="volume-3" data-volume-drawer><summary><span class="dj-drawer-number">III</span><span class="dj-drawer-title"><b>SHOPS, MARKETS, LABOR, FIRE</b><small>QUEUED</small></span><span class="dj-drawer-range">15–27</span><span class="dj-drawer-progress">0 / 13</span><span class="dj-drawer-status" aria-hidden="true"></span></summary><div class="dj-drawer-panel"><div class="dj-drawer-empty"><small>ENTRIES 15–27</small><p>This volume is queued. Its entry map will be populated as the Reading project reaches Volume III.</p></div></div></details>
        <details class="dj-volume-drawer" id="volume-4" data-volume-drawer><summary><span class="dj-drawer-number">IV</span><span class="dj-drawer-title"><b>COURT LIFE, RENTALS, RESTAURANTS</b><small>QUEUED</small></span><span class="dj-drawer-range">28–39</span><span class="dj-drawer-progress">0 / 12</span><span class="dj-drawer-status" aria-hidden="true"></span></summary><div class="dj-drawer-panel"><div class="dj-drawer-empty"><small>ENTRIES 28–39</small><p>This volume is queued. Its entry map will be populated as the Reading project reaches Volume IV.</p></div></div></details>
        <details class="dj-volume-drawer" id="volume-5" data-volume-drawer><summary><span class="dj-drawer-number">V</span><span class="dj-drawer-title"><b>CUSTOMS, ENTERTAINMENT, MARRIAGE, CHILDREN</b><small>QUEUED</small></span><span class="dj-drawer-range">40–43</span><span class="dj-drawer-progress">0 / 4</span><span class="dj-drawer-status" aria-hidden="true"></span></summary><div class="dj-drawer-panel"><div class="dj-drawer-empty"><small>ENTRIES 40–43</small><p>This volume is queued. Its entry map will be populated as the Reading project reaches Volume V.</p></div></div></details>
        <details class="dj-volume-drawer" id="volume-6" data-volume-drawer><summary><span class="dj-drawer-number">VI</span><span class="dj-drawer-title"><b>NEW YEAR TO LANTERNS</b><small>QUEUED</small></span><span class="dj-drawer-range">44–51</span><span class="dj-drawer-progress">0 / 8</span><span class="dj-drawer-status" aria-hidden="true"></span></summary><div class="dj-drawer-panel"><div class="dj-drawer-empty"><small>ENTRIES 44–51</small><p>This volume is queued. Its entry map will be populated as the Reading project reaches Volume VI.</p></div></div></details>
        <details class="dj-volume-drawer" id="volume-7" data-volume-drawer><summary><span class="dj-drawer-number">VII</span><span class="dj-drawer-title"><b>QINGMING, GARDENS, IMPERIAL SPECTACLE</b><small>QUEUED</small></span><span class="dj-drawer-range">52–60</span><span class="dj-drawer-progress">0 / 9</span><span class="dj-drawer-status" aria-hidden="true"></span></summary><div class="dj-drawer-panel"><div class="dj-drawer-empty"><small>ENTRIES 52–60</small><p>This volume is queued. Its entry map will be populated as the Reading project reaches Volume VII.</p></div></div></details>
        <details class="dj-volume-drawer" id="volume-8" data-volume-drawer><summary><span class="dj-drawer-number">VIII</span><span class="dj-drawer-title"><b>SPRING TO DOUBLE NINTH</b><small>QUEUED</small></span><span class="dj-drawer-range">61–70</span><span class="dj-drawer-progress">0 / 10</span><span class="dj-drawer-status" aria-hidden="true"></span></summary><div class="dj-drawer-panel"><div class="dj-drawer-empty"><small>ENTRIES 61–70</small><p>This volume is queued. Its entry map will be populated as the Reading project reaches Volume VIII.</p></div></div></details>
        <details class="dj-volume-drawer" id="volume-9" data-volume-drawer><summary><span class="dj-drawer-number">IX</span><span class="dj-drawer-title"><b>TENTH MONTH, BIRTHDAY RITES, WINTER</b><small>QUEUED</small></span><span class="dj-drawer-range">71–74</span><span class="dj-drawer-progress">0 / 4</span><span class="dj-drawer-status" aria-hidden="true"></span></summary><div class="dj-drawer-panel"><div class="dj-drawer-empty"><small>ENTRIES 71–74</small><p>This volume is queued. Its entry map will be populated as the Reading project reaches Volume IX.</p></div></div></details>
        <details class="dj-volume-drawer" id="volume-10" data-volume-drawer><summary><span class="dj-drawer-number">X</span><span class="dj-drawer-title"><b>WINTER SOLSTICE TO NEW YEAR'S EVE</b><small>QUEUED</small></span><span class="dj-drawer-range">75–86</span><span class="dj-drawer-progress">0 / 12</span><span class="dj-drawer-status" aria-hidden="true"></span></summary><div class="dj-drawer-panel"><div class="dj-drawer-empty"><small>ENTRIES 75–86</small><p>This volume is queued. Its entry map will be populated as the Reading project reaches Volume X.</p></div></div></details>
      </div>
    </section>

'''

pattern = re.compile(r'    <section class="dj-section" id="volume-one".*?(?=    <section class="dj-section" id="scroll")', re.S)
if not pattern.search(s):
    raise SystemExit('Could not find old Volume I + Book Map block')
s = pattern.sub(archive, s, count=1)
s = s.replace('<header class="dj-section-head"><p>03 / VISUAL WITNESS</p>', '<header class="dj-section-head"><p>02 / VISUAL WITNESS</p>')
s = s.replace('<header class="dj-section-head"><p>04 / SOURCE ROOM</p>', '<header class="dj-section-head"><p>03 / SOURCE ROOM</p>')
if '/reading/dongjing-drawers.js' not in s:
    s = s.replace(
        '<script src="/reading/reading.js?v=20260831e"></script>',
        '<script src="/reading/reading.js?v=20260831e"></script>\n  <script src="/reading/dongjing-drawers.js?v=20260831a"></script>'
    )
page.write_text(s, encoding='utf-8')

for html in (ROOT / 'reading/dongjing-meng-hua-lu').rglob('*.html'):
    text = html.read_text(encoding='utf-8')
    text = text.replace('/reading/dongjing.css?v=20260831c', '/reading/dongjing.css?v=20260831d')
    html.write_text(text, encoding='utf-8')
