import fs from 'node:fs';

const roomPath = 'reading/salt-and-iron/index.html';
const note1Path = 'reading/salt-and-iron/01/index.html';
const note2Path = 'reading/salt-and-iron/02/index.html';

let room = fs.readFileSync(roomPath, 'utf8');
for (const zh of [
  '朝廷首先问了什么？',
  '国家为什么缺钱？',
  '盐和铁为什么值得国家亲自经营？',
  '盐铁专营到底怎么运行？',
  '“与民争利”到底在骂什么？',
  '商人到底扮演了什么角色？',
  '普通人到底付出了什么？',
  '这场争论最后解决了什么？'
]) {
  room = room.replace(`<small>${zh}</small>`, '');
}
room = room.replace('≈ 4 MIN', '≈ 9 MIN').replace('≈ 5 MIN', '≈ 11 MIN');
fs.writeFileSync(roomPath, room);

let note1 = fs.readFileSync(note1Path, 'utf8');
note1 = note1.replace('          <div class="reading-note-zh">朝廷首先问了什么？</div>\n', '');
const note1Article = `      <article class="reading-article-prose">
        <p><i>Yantie Lun</i> opens in the sixth year of the Shiyuan reign, 81 BCE. The court summons senior officials and men recommended as <i>xianliang</i> and <i>wenxue</i>. Before the argument reaches monopoly, prices or military finance, the record gives them a first task: identify the hardships among the people.</p>

        <div class="reading-primary-text">
          <header><span>PRIMARY TEXT / 本議第一</span><span>OPENING SENTENCE</span></header>
          <blockquote lang="zh-Hant">惟始元六年，有詔書使丞相、御史與所舉賢良、文學語。問民間所疾苦。</blockquote>
          <div class="reading-translation">In the sixth year of Shiyuan, an imperial order instructed the chancellor and the imperial secretary to confer with the recommended Worthies and Literati. They were asked what hardships people were suffering.</div>
          <footer><a href="https://ctext.org/yan-tie-lun/ben-yi/zh">Digital transcription: Chinese Text Project ↗</a><span>Translation: Galok / provisional</span></footer>
        </div>

        <h2 id="first-question-title">The opening is already a political choice.</h2>
        <p>“What hardships are people suffering?” sounds broader than the controversy that made the meeting famous. That breadth matters. It turns the conference into a review of government from the viewpoint of burden: what policies are being felt outside the court, where are they biting, and which of them deserve to be reconsidered?</p>

        <p>We should still be careful with the scene. The surviving <i>Yantie Lun</i> was organized and written into its present argumentative form by Huan Kuan after the 81 BCE conference. It is an exceptionally valuable record of the debate, but it is not a stenographic transcript whose every sentence can automatically be treated as untouched speech. The safest reading is to separate two questions: what political conflict does the work preserve, and how has the compiler shaped that conflict into literature?</p>

        <p>That distinction makes the first sentence more interesting, not less. Even after compilation, the book chooses to begin with hardship. The frame tells the reader what the argument is supposed to answer. Fiscal institutions will have to defend themselves against a test that begins with lived consequences rather than revenue alone.</p>

        <h2>The first response widens the charge.</h2>
        <p>The Worthies and Literati do not answer with a list of isolated grievances. They connect the people’s hardships to a cluster of institutions and then to a larger theory of political economy.</p>

        <div class="reading-primary-text">
          <header><span>PRIMARY TEXT / FIRST RESPONSE</span><span>EXCERPT</span></header>
          <blockquote lang="zh-Hant">今郡國有鹽鐵酒榷均輸，與民爭利。</blockquote>
          <div class="reading-translation">Today the commanderies and kingdoms have salt and iron, the alcohol monopoly, and the <i>junshu</i> system, competing with the people for profit.</div>
          <footer><a href="https://ctext.org/yan-tie-lun/ben-yi/zh">《鹽鐵論·本議》 ↗</a><span><i>junshu</i> is left untranslated here; the institution needs its own note.</span></footer>
        </div>

        <p>The phrase “competing with the people for profit” is easy to flatten into a modern argument about public versus private enterprise. The surrounding passage is doing more than that. The critics link salt, iron, alcohol and <i>junshu</i> to a change in incentives and social behavior. In their telling, a government that organizes itself around commercial gain teaches the population to chase gain as well.</p>

        <p>That is why the passage quickly moves into the old vocabulary of <i>ben</i> and <i>mo</i> — “root” and “branch,” or, in economic terms, a preferred agricultural base versus activities treated as secondary pursuits. Their objection therefore has at least three layers. There is a material complaint about burdens, an institutional complaint about the state occupying profitable channels, and a moral complaint about what that arrangement encourages people and officials to value.</p>

        <p>Those layers should stay separate as the dossier grows. A reader may find the moral hierarchy of agriculture over commerce unconvincing while still taking the institutional complaint seriously. Likewise, evidence that a monopoly raised revenue would not by itself answer the claim that its administration imposed costs on producers or consumers. The debate is already telling us that “did it make money?” and “was it good government?” are different questions.</p>

        <h2>Hardship is a claim that still needs evidence.</h2>
        <p>The text gives us a political accusation, not a household survey. When the critics say these policies burdened the people, we learn what they wanted the court to believe and what kinds of effects they considered important. We do not yet know the size of those effects, how evenly they were distributed, or whether every institution named in the sentence worked in the same way.</p>

        <p>This is where the Reading method has to slow down. Later notes will have to ask what salt and iron offices actually did, where they operated, how production and sale were organized, what complaints recur elsewhere in the book, and what independent evidence survives from Han institutions and archaeology. Only then can “hardship” be broken into mechanisms instead of left as a slogan.</p>

        <div class="reading-callout"><small>WHAT THIS NOTE ESTABLISHES</small><p>The dossier begins with a public-burden frame. The first critics bundle salt, iron, alcohol and <i>junshu</i> into a charge that combines economic burden, institutional competition and moral order. That is a map of the dispute, not yet proof that every allegation was correct.</p></div>

        <div class="reading-stop"><span>NEXT NOTE</span><p>The official side answers immediately. Its defense is concrete: the frontier was expensive. Note 02 follows that fiscal claim and asks what kind of state problem the monopolies were supposed to solve.</p></div>
      </article>`;
note1 = note1.replace(/      <article class="reading-article-prose">[\s\S]*?      <\/article>/, note1Article);
const note1Aside = `      <aside class="reading-article-notes" aria-label="Source audit for opening section">
        <p>SOURCE AUDIT / OPENING</p>
        <div class="reading-note-row"><span>DATE</span><b>Shiyuan 6 / 81 BCE</b><em>The date appears in the opening sentence and is the standard date assigned to the Salt and Iron conference.</em></div>
        <div class="reading-note-row"><span>TEXT</span><b>《鹽鐵論·本議》</b><a href="https://ctext.org/yan-tie-lun/ben-yi/zh">Chinese Text Project ↗</a></div>
        <div class="reading-note-row"><span>WITNESS</span><b>Ming printed edition</b><a href="https://commons.wikimedia.org/wiki/File:NLC892-411999030778-149199_%E9%B9%BD%E9%90%B5%E8%AB%96_%E7%AC%AC1%E5%86%8A.pdf">National Library of China scan ↗</a></div>
        <div class="reading-note-row"><span>RECORD STATUS</span><b>A conference record shaped into a later text</b><a href="https://www1.ihp.sinica.edu.tw/Publications/Bulletin/979/Article/414">Tao Tien-yi / Academia Sinica ↗</a><em>The surviving work is highly valuable historical evidence while still requiring attention to Huan Kuan's editorial role.</em></div>
        <div class="reading-note-row"><span>EARLY TRANSLATION</span><b>Esson M. Gale</b><a href="https://xtf.lib.virginia.edu/xtf/view?docId=2003_Q4%2FuvaGenText%2Ftei%2Fz000000040.xml">University of Virginia Library ↗</a></div>
        <div class="reading-note-row"><span>STILL PENDING</span><b>Critical-edition collation</b><em>Quoted wording will be checked against Wang Liqi's 《鹽鐵論校注》 and the scanned witness before final publication.</em></div>
      </aside>`;
note1 = note1.replace(/      <aside class="reading-article-notes"[\s\S]*?      <\/aside>/, note1Aside);
fs.writeFileSync(note1Path, note1);

let note2 = fs.readFileSync(note2Path, 'utf8');
note2 = note2.replace('          <div class="reading-note-zh">国家为什么缺钱？</div>\n', '');
const note2Article = `      <article class="reading-article-prose">
        <p>The senior official's reply comes immediately. He does not begin with a general theory that government ought to own profitable industries. He names a pressure that an administrator can point to on a map and in a budget: the northern frontier was expensive to defend.</p>

        <div class="reading-primary-text">
          <header><span>PRIMARY TEXT / OFFICIAL REPLY</span><span>EXCERPT</span></header>
          <blockquote lang="zh-Hant">邊用度不足，故興鹽、鐵，設酒榷，置均輸，蕃貨長財，以佐助邊費。</blockquote>
          <div class="reading-translation">Frontier expenditures were insufficient. Therefore salt and iron were established, the alcohol monopoly was set up, and <i>junshu</i> was instituted, expanding goods and revenue in order to support frontier expenses.</div>
          <footer><a href="https://ctext.org/yan-tie-lun/ben-yi/zh">《鹽鐵論·本議》 ↗</a><span>Translation: Galok / provisional</span></footer>
        </div>

        <h2 id="why-money-title">The official case begins with a budget constraint.</h2>
        <p>The reply is unusually useful because it gives us a causal chain in the official side's own words. The text first describes repeated Xiongnu attacks and the burden of guarding the frontier. It then points to barriers, beacon systems and garrison forces. Those commitments consume resources. Salt, iron, the alcohol monopoly and <i>junshu</i> appear as fiscal instruments designed to keep that security system funded.</p>

        <p>This is more specific than saying “the Han wanted a stronger state.” Frontier defense creates recurring costs. Fortifications have to be built and maintained. Troops have to be provisioned. Horses, weapons, transport and communications have to keep moving even when a major campaign is not under way. A government that accepts those commitments needs revenue that arrives repeatedly as well.</p>

        <p>The official defense therefore presents the economic institutions as a conversion machine: control commercially valuable activities, expand the flow of goods and money into the treasury, and use that fiscal capacity to sustain military commitments at the edge of the empire. Whether the machine worked efficiently is a later question. In Note 02, the important point is that this is how the policy is justified.</p>

        <h2>The institutions were already old by the time of the debate.</h2>
        <p>The 81 BCE meeting was a review of an inherited system. Emperor Wu had died six years earlier. State control over salt and iron had been established decades before the conference; modern archaeological scholarship commonly places the major reorganization in 119 BCE. By the time the Worthies and Literati arrived at court, they were arguing over institutions that had already survived long enough to build offices, interests, routines and defenders.</p>

        <p>That time gap matters. Emergency policies can become administrative systems. Once an institution has employees, supply chains, revenue expectations and political constituencies, the question facing a later government changes. It is no longer only “why was this created?” It becomes “what would break if we removed it, and who has learned to depend on it?” The official side's warning that abolition would empty the treasury and weaken frontier preparedness belongs to that second kind of argument.</p>

        <h2>War explains the pressure; it does not settle the policy debate.</h2>
        <p>A military need can be real while the chosen financing mechanism remains contestable. That is exactly where the two sides diverge. The official side emphasizes the cost of insecurity and the danger of losing a dependable revenue source. The critics emphasize what the same institutions do inside the economy: how they affect producers, traders and households, and what happens when officials become participants in commercial life.</p>

        <p>These positions can talk past each other because they measure different failures. One fears an underfunded state facing an armed frontier threat. The other fears a state that solves its fiscal problem by shifting burdens into ordinary economic life. To understand the argument, we have to keep both balance sheets visible.</p>

        <p>That also prevents a lazy reading of the debate as “big government versus small government.” The immediate issue is narrower and more concrete: given expensive commitments, what revenue institutions are legitimate, what costs do they impose, and how much administrative power should accompany them?</p>

        <h2>We still do not have an audited military budget.</h2>
        <p>The official speech is evidence for the government's justification. It does not tell us what share of frontier expenditure was actually financed by salt and iron, how revenue changed from year to year, or whether the institutions generated the net returns their defenders implied. The chronology supports the broad fiscal story, but chronology alone cannot calculate the size of the effect.</p>

        <p>Those quantitative questions need a wider record: the <i>Shiji</i>, the <i>Hanshu</i>, administrative history, archaeological evidence and specialist work on Han production and finance. Until that layer is built, the language on this page stays deliberately bounded. We can identify the fiscal logic without pretending that the surviving debate is a modern set of public accounts.</p>

        <div class="reading-callout"><small>TEXT CLAIM ≠ FINAL VERDICT</small><p>Frontier finance is the official side's stated justification, and the timing of the monopolies is compatible with that explanation. The dossier has not yet established the precise revenue contribution of salt and iron or the full distribution of their costs.</p></div>

        <div class="reading-stop"><span>NEXT NOTE</span><p>If revenue was the goal, why focus on salt and iron? Note 03 moves from fiscal pressure to the industries themselves: demand, production, strategic usefulness and the reasons these sectors were unusually attractive to the state.</p></div>
      </article>`;
note2 = note2.replace(/      <article class="reading-article-prose">[\s\S]*?      <\/article>/, note2Article);
const note2Aside = `      <aside class="reading-article-notes" aria-label="Source audit for fiscal section">
        <p>SOURCE AUDIT / FISCAL SETTING</p>
        <div class="reading-note-row"><span>TEXTUAL CLAIM</span><b>Frontier costs justified the revenue system</b><a href="https://ctext.org/yan-tie-lun/ben-yi/zh">《鹽鐵論·本議》 ↗</a></div>
        <div class="reading-note-row"><span>CHRONOLOGY</span><b>Salt and iron reorganization / 119 BCE</b><a href="https://www.cambridge.org/core/journals/antiquity/article/iron-production-and-trading-in-lingnan-during-the-qin-and-han-dynasties/9EB822B1E9CE3B15A1DB1B6AC54B7970">Antiquity / Cambridge ↗</a></div>
        <div class="reading-note-row"><span>BROAD CONTEXT</span><b>Economic and social history of Former Han</b><a href="https://www.cambridge.org/core/books/abs/cambridge-history-of-china/economic-and-social-history-of-former-han/2C38C79DC7D76BDA4A073CAE0572086C">The Cambridge History of China ↗</a></div>
        <div class="reading-note-row"><span>EARLY SCHOLARLY EDITION</span><b>Historical background and translation</b><a href="https://xtf.lib.virginia.edu/xtf/view?docId=2003_Q4%2FuvaGenText%2Ftei%2Fz000000040.xml">Esson M. Gale / UVA Library ↗</a></div>
        <div class="reading-note-row"><span>STILL PENDING</span><b>Revenue scale and institutional mechanics</b><em>The next research pass will cross-check the Shiji, Hanshu and specialist scholarship before adding quantitative claims.</em></div>
      </aside>`;
note2 = note2.replace(/      <aside class="reading-article-notes"[\s\S]*?      <\/aside>/, note2Aside);
fs.writeFileSync(note2Path, note2);

for (const [path, mustContain] of [[roomPath, '≈ 9 MIN'], [note1Path, 'The opening is already a political choice.'], [note2Path, 'The institutions were already old by the time of the debate.']]) {
  const value = fs.readFileSync(path, 'utf8');
  if (!value.includes(mustContain)) throw new Error(`Expected migrated content missing in ${path}`);
}
if (/reading-room-toc[\s\S]*?<small>[\s\S]*?[\u3400-\u9fff]/.test(room.slice(room.indexOf('reading-room-toc'), room.indexOf('</section>', room.indexOf('reading-room-toc'))))) {
  throw new Error('Chinese editorial subtitles remain in the Reading Room contents block.');
}
console.log('Reading 001 notes expanded and English-only contents labels applied.');
