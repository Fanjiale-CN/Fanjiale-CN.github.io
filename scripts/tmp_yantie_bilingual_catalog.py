#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser

INDEX = Path('reading/salt-and-iron/index.html')
BUILD = Path('scripts/build-reading-font-subsets.py')

VOLUMES = {
    1: [
        (1,'本議','Ben Yi / Original Debate','live','The opening conference: hardship, war finance, commerce, junshu and pingzhun.','≈ 22 MIN'),
        (2,'力耕','Li Geng / Farming','live','Agriculture, reserves, relief, trade, luxury goods and competing routes to wealth.','≈ 16 MIN'),
        (3,'通有','Tong You / Circulation','live','Cities, geography, trade routes, circulation and the distribution of abundance.','≈ 17 MIN'),
        (4,'錯幣','Cuo Bi / Coinage','live','Money, private minting, state control, wealth concentration and monetary trust.','≈ 18 MIN'),
        (5,'禁耕','Jin Geng / Restricting Private Production','next','Power over salt and iron, private wealth and the costs of official control.','—'),
        (6,'復古','Fu Gu / Returning to the Old','planned','A closing argument for Volume I over precedent, institutions and political memory.','—'),
    ],
    2: [(7,'非鞅','Fei Yang / In Criticism of Shang Yang'),(8,'晁錯','Chao Cuo / Chao Cuo'),(9,'刺權','Ci Quan / Taunting the Puissant'),(10,'刺復','Ci Fu / Thrust and Parry'),(11,'論儒','Lun Ru / Discoursing on Confucians'),(12,'憂邊','You Bian / Frontiers, the Great Concern')],
    3: [(13,'園池','Yuan Chi / Parks and Ponds'),(14,'輕重','Qing Zhong / The Ratio of Production'),(15,'未通','Wei Tong / Undeveloped Wealth')],
    4: [(16,'地廣','Di Guang / Territorial Expansion'),(17,'貧富','Pin Fu / The Poor and the Rich'),(18,'毀學','Hui Xue / Vilifying the Learned'),(19,'褒賢','Bao Xian / Extolling the Worthy')],
    5: [(20,'相刺','Xiang Ci / Mutual Recriminations'),(21,'殊路','Shu Lu / How Ways Diverge'),(22,'訟賢','Song Xian / Impeaching the Worthy'),(23,'遵道','Zun Dao / Pursuing the Way'),(24,'論誹','Lun Fei / Assertions and Aspersions'),(25,'孝養','Xiao Yang / Filial Piety and Filial Support'),(26,'刺議','Ci Yi / Cutting Exchanges'),(27,'利議','Li Yi / Shrill Polemics'),(28,'國疾','Guo Ji / On National Ills')],
    6: [(29,'散不足','San Bu Zu / Luxurious Life Leading to Insufficiencies'),(30,'救匱','Jiu Kui / Remedies for Deficiency'),(31,'箴石','Zhen Shi / The Diagnostics Stone for Government'),(32,'除狹','Chu Xia / On Escaping Narrow-mindedness'),(33,'疾貪','Ji Tan / Taking Corruption Seriously'),(34,'後刑','Hou Xing / The Minor Importance of the Penal Law'),(35,'授時','Shou Shi / Observing the Seasons'),(36,'水旱','Shui Han / Flood and Drought')],
    7: [(37,'崇禮','Chong Li / Holding High the Rituals'),(38,'備胡','Bei Hu / On Preparedness against the Steppe Peoples'),(39,'執務','Zhi Wu / Holding High the Most Important Tasks'),(40,'能言','Neng Yan / Talking about Matters without Completing Them'),(41,'取下','Qu Xia / On the Fairness to Take Taxes from Those Below'),(42,'擊之','Ji Zhi / Making War against the Steppe Peoples')],
    8: [(43,'結和','Jie He / Concluding Peace with the Steppe Peoples'),(44,'誅秦','Zhu Qin / About the Failure of the Qin Dynasty'),(45,'伐功','Fa Gong / The Advantage of Expansionist Politics'),(46,'西域','Xi Yu / The Usefulness of the Protectorate of the Western Territories'),(47,'世務','Shi Wu / The Political Challenges of the Present Age'),(48,'和親','He Qin / Appeasement by Marriage Alliance')],
    9: [(49,'繇役','Yao Yi / On Tax and Corvée Labour'),(50,'險固','Xian Gu / On Border Defence'),(51,'論勇','Lun Yong / About the Use of Military Bravery'),(52,'論功','Lun Gong / About the Use of Military Force'),(53,'論鄒','Lun Zou / About Zou Yan’s Theory of Governing the Empire'),(54,'論菑','Lun Zai / About Natural Disasters')],
    10: [(55,'刑德','Xing De / Administration by the Penal Law and Government by Virtue'),(56,'申韓','Shen Han / The Doctrines of Shen Buhai and Han Fei'),(57,'周秦','Zhou Qin / The Government Styles of Zhou and Qin'),(58,'詔聖','Zhao Sheng / Exhortation to Follow the Path of the Saints'),(59,'大論','Da Lun / Summary'),(60,'雜論','Za Lun / Miscellaneous Notes to the Book')],
}
ROMAN = {1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X'}
YANTIE_TITLES = ''.join(item[1] for volume in VOLUMES.values() for item in volume)


def row(item):
    n, zh, en, *rest = item
    if rest:
        state, note, time = rest
        tag = 'a' if state == 'live' else 'div'
        href = f' href="/reading/salt-and-iron/{n:02d}/"' if state == 'live' else ''
        state_label = {'live':'LIVE','next':'NEXT','planned':'PLANNED'}[state]
        cls = 'reading-drawer-entry' + ('' if state == 'live' else ' is-queued')
        return f'              <{tag} class="{cls}"{href}><span>{n:02d}</span><span class="reading-drawer-entry-title"><span class="reading-drawer-entry-zh" lang="zh-Hant">{zh}</span><strong>{en}</strong></span><span class="reading-drawer-entry-note">{note}</span><span class="reading-drawer-entry-state">{state_label}</span><span class="reading-drawer-entry-time">{time}</span></{tag}>'
    return f'              <div class="reading-drawer-entry reading-drawer-entry--catalogue is-queued"><span>{n:02d}</span><span class="reading-drawer-entry-title"><span class="reading-drawer-entry-zh" lang="zh-Hant">{zh}</span><strong>{en}</strong></span><span class="reading-drawer-entry-state">QUEUED</span><span class="reading-drawer-entry-time">—</span></div>'


def volume(i):
    items = VOLUMES[i]
    a, b = items[0][0], items[-1][0]
    if i == 1:
        cls, opened = 'reading-volume-drawer is-current', ' open'
        title = 'OPENING ARGUMENTS'
        small = 'IN PROGRESS / POLICY + AGRICULTURE + TRADE + MONEY'
        progress = '4 / 6'
        intro = '<div class="reading-drawer-panel-intro"><h3>The debate opens by defining the state’s economic problem.</h3><p>The first four chapters move from fiscal necessity to farming, circulation and money. Chapters 05–06 remain next in the working sequence.</p></div>'
    else:
        cls, opened = 'reading-volume-drawer', ''
        title = f'CHAPTERS {a:02d}–{b:02d}'
        small = f'QUEUED / {len(items)} CHAPTERS'
        progress = f'0 / {len(items)}'
        intro = f'<div class="reading-drawer-panel-intro reading-drawer-panel-intro--catalogue"><h3>Volume {ROMAN[i]}.</h3><p>All {len(items)} source chapter titles are listed here. Reading pages remain queued until research and edition checking are complete.</p></div>'
    rows = '\n'.join(row(item) for item in items)
    return (
        f'        <details class="{cls}" id="volume-{i}" data-yantie-volume-drawer{opened}>\n'
        f'          <summary><span class="reading-drawer-number">{ROMAN[i]}</span><span class="reading-drawer-title"><b>{title}</b><small>{small}</small></span><span class="reading-drawer-range">{a:02d}–{b:02d}</span><span class="reading-drawer-progress">{progress}</span><span class="reading-drawer-status" aria-hidden="true"></span></summary>\n'
        f'          <div class="reading-drawer-panel">\n'
        f'            {intro}\n'
        f'            <div class="reading-drawer-entries">\n{rows}\n            </div>\n'
        f'          </div>\n'
        f'        </details>'
    )


def patch_index():
    text = INDEX.read_text(encoding='utf-8')
    archive = (
        '    <section class="reading-room-section reading-volume-archive" id="volume-archive" aria-labelledby="archive-title" data-yantie-volume-archive>\n'
        '      <header class="reading-room-section-head"><p>01 / VOLUME ARCHIVE</p><div><h2 id="archive-title">Ten volumes. Sixty chapter titles.</h2><span>Every volume now carries its full bilingual source table of contents. Chinese chapter titles use the same display face as Dongjing Meng Hua Lu; English labels stay in the existing Reading hierarchy.</span></div></header>\n'
        '      <div class="reading-drawer-stack">\n'
        + '\n'.join(volume(i) for i in range(1, 11))
        + '\n      </div>\n    </section>\n\n'
    )
    start = text.index('    <section class="reading-room-section reading-volume-archive"')
    end = text.index('    <section class="reading-room-section" id="reading-status"')
    text = text[:start] + archive + text[end:]
    text = text.replace('/reading/salt-and-iron-drawers.css?v=20260901a', '/reading/salt-and-iron-drawers.css?v=20260901b')
    INDEX.write_text(text, encoding='utf-8')
    return text


def patch_font_builder():
    src = BUILD.read_text(encoding='utf-8')
    marker = '    "潘樓東街巷酒樓飲食果子"\n)'
    if YANTIE_TITLES not in src:
        src = src.replace(marker, f'    "潘樓東街巷酒樓飲食果子"\n    "{YANTIE_TITLES}"\n)')
    corpus_marker = 'def reading_characters() -> set[str]:\n    chars = set(REQUIRED_PUNCTUATION)\n'
    if 'chars.update(TITLE_TEXT)' not in src:
        src = src.replace(corpus_marker, corpus_marker + '    chars.update(TITLE_TEXT)\n')
    BUILD.write_text(src, encoding='utf-8')


def validate(text):
    class Counter(HTMLParser):
        def __init__(self):
            super().__init__(); self.details = 0; self.zh = 0
        def handle_starttag(self, tag, attrs):
            d = dict(attrs)
            if tag == 'details' and 'data-yantie-volume-drawer' in d:
                self.details += 1
            if 'class' in d and 'reading-drawer-entry-zh' in d['class'].split():
                self.zh += 1
    c = Counter(); c.feed(text)
    assert c.details == 10, c.details
    assert c.zh == 60, c.zh


if __name__ == '__main__':
    patched = patch_index()
    patch_font_builder()
    validate(patched)
    print('Yantie catalogue: 10 volumes / 60 bilingual titles')
