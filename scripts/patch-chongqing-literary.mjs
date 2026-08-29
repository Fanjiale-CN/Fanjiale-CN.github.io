import fs from 'node:fs';

const indexPath = 'be-a-viewer/chongqing/index.html';
const literaryCssPath = 'be-a-viewer/literary-city.css';
const oldCssPath = 'be-a-viewer/chongqing/chongqing-literature.css';

let html = fs.readFileSync(indexPath, 'utf8');
let literaryCss = fs.readFileSync(literaryCssPath, 'utf8');

html = html.replace(/\s*<link rel="stylesheet" href="\/be-a-viewer\/chongqing\/chongqing-literature\.css[^>]*>\n?/, '\n  <link rel="stylesheet" href="/be-a-viewer/literary-city.css?v=cities-in-words-20260829cq">\n');

const literarySection = `    <section class="literary-city literary-city--chongqing" id="writers-chongqing" data-cq-altitude="238" aria-labelledby="writers-chongqing-title" data-literary-city>
      <div class="literary-running"><span>CHONGQING / WARTIME READER 07</span><span>作家笔下的城市</span><span>FOLIO 01—03</span></div>
      <header class="literary-masthead" data-literary-reveal>
        <p class="literary-kicker">CITY IN WORDS / 06<br>CHONGQING · 重庆</p>
        <div class="literary-masthead-copy"><h2 id="writers-chongqing-title"><span>WRITERS ON THE CITY</span><b>重庆</b></h2><p class="literary-deck">先把霓虹和轻轨放下。巴金、张恨水、老舍写下的重庆，更接近一间寒冷的屋子、一份受限的报纸和一座警报之后仍要开场的舞台。</p></div>
      </header>
      <nav class="literary-series literary-series--six" aria-label="作家笔下的城市系列"><a href="/be-a-viewer/hangzhou/#writers-hangzhou"><b>01</b><span>杭州</span></a><a href="/be-a-viewer/beijing/#writers-beijing"><b>02</b><span>北京</span></a><a href="/be-a-viewer/shanghai/#writers-shanghai"><b>03</b><span>上海</span></a><a href="/be-a-viewer/xian/#writers-xian"><b>04</b><span>西安</span></a><a href="/be-a-viewer/xiamen/#writers-xiamen"><b>05</b><span>厦门</span></a><a href="/be-a-viewer/chongqing/#writers-chongqing" aria-current="page"><b>06</b><span>重庆</span></a></nav>
      <figure class="literary-plate" data-literary-reveal><img src="/assets/be-a-viewer/chongqing/old-roofs.webp" width="1600" height="1200" loading="lazy" decoding="async" alt="重庆旧屋顶与山城层叠建筑构成的作家笔下城市主版面"><figcaption><b>PLATE 06 / 雾都书页</b><span>Field Reader / Chongqing</span><span>Fog paper · siren red</span><span>4:3 photographic edition</span></figcaption></figure>
      <div class="literary-spreads">
        <article class="literary-spread" data-literary-reveal><header class="literary-citation"><span>01 / HOME</span><p><b>巴金</b><cite>《寒夜》<br>1944—1945</cite></p></header><div class="literary-quote literary-quote--zh" lang="zh-Hans"><p>一间冷屋，<br>一家人，<br>战争从门外压进日常。</p></div><div class="literary-quote literary-quote--en" lang="en"><p>A cold room and a family under strain: wartime Chongqing enters through domestic life, illness and rising prices rather than spectacle.</p></div><footer class="literary-source"><span>Editorial reading · Galok / 2026</span><a href="https://www.xinhuanet.com/politics/2015-07/30/c_1116085764.htm" target="_blank" rel="noreferrer">作品与重庆 / 新华网 ↗</a></footer></article>
        <article class="literary-spread" data-literary-reveal><header class="literary-citation"><span>02 / PRINT</span><p><b>张恨水</b><cite>《八十一梦》<br>1939</cite></p></header><div class="literary-quote literary-quote--zh" lang="zh-Hans"><p>现实太挤，<br>讽刺只好借梦<br>从报纸缝里穿过去。</p></div><div class="literary-quote literary-quote--en" lang="en"><p>Published in wartime Chongqing, the dream frame gives satire room to move where direct speech had little space.</p></div><footer class="literary-source"><span>Editorial reading · Galok / 2026</span><a href="https://big5.cctv.com/gate/big5/www.cctv.cn/education/special/C13044/20041020/102122.shtml" target="_blank" rel="noreferrer">作品资料 / 央视网 ↗</a></footer></article>
        <article class="literary-spread" data-literary-reveal><header class="literary-citation"><span>03 / STAGE</span><p><b>老舍</b><cite>《残雾》<br>1939</cite></p></header><div class="literary-quote literary-quote--zh" lang="zh-Hans"><p>雾没有遮住城市，<br>它把机关、恐惧和警报<br>一起推上舞台。</p></div><div class="literary-quote literary-quote--en" lang="en"><p>On Lao She’s Chongqing stage, bureaucracy and fear share the same weather; the air-raid siren remains just outside the scene.</p></div><footer class="literary-source"><span>Editorial reading · Galok / 2026</span><a href="https://wyb.chinawriter.com.cn/Pad/content/201811/30/content47281.html" target="_blank" rel="noreferrer">老舍在重庆 / 文艺报 ↗</a></footer></article>
      </div>
      <footer class="literary-colophon"><b>CHONGQING / CITY READER 06</b><p>这里保留的是三种观察城市的方法：家屋、报纸、舞台。它们把重庆从夜景与奇观里拉回当时真实的生活压力，也让“雾都”重新成为人的尺度。</p><a href="#river">CONTINUE TO THE RIVER ↓</a></footer>
    </section>`;

const sectionPattern = /    <section class="cq-literature"[\s\S]*?    <\/section>\n\n    <section class="cq-descend/;
if (!sectionPattern.test(html)) throw new Error('Current Chongqing literature section was not found');
html = html.replace(sectionPattern, `${literarySection}\n\n    <section class="cq-descend`);

if (!html.includes('/be-a-viewer/literary-city.js')) {
  html = html.replace(/(  <script defer src="\/be-a-viewer\/chongqing\/chongqing\.js[^>]*><\/script>)/, `$1\n  <script src="/be-a-viewer/literary-city.js?v=cities-in-words-20260829cq"></script>`);
}

const cqCss = `\n\n/* Chongqing / City in Words — fog paper, old roofs, wartime signal red */\n.literary-city--chongqing {\n  --lit-bg: #d5d5cf;\n  --lit-paper: #eee9df;\n  --lit-ink: #202321;\n  --lit-muted: #626761;\n  --lit-line: rgba(32, 35, 33, .25);\n  --lit-accent: #b33b2f;\n}\n.literary-city--chongqing .literary-plate img { --lit-plate-ratio: 4 / 3; object-position: center 44%; }\n.literary-series--six { grid-template-columns: repeat(6, minmax(0, 1fr)); }\n`;
if (!literaryCss.includes('.literary-city--chongqing')) literaryCss += cqCss;

fs.writeFileSync(indexPath, html);
fs.writeFileSync(literaryCssPath, literaryCss);
if (fs.existsSync(oldCssPath)) fs.rmSync(oldCssPath);

console.log('Chongqing literary section rebuilt on shared literary-city system.');
