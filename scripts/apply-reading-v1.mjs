import { readFileSync, writeFileSync } from 'node:fs';

function read(path){ return readFileSync(path,'utf8'); }
function write(path, value){ writeFileSync(path, value, 'utf8'); }
function replaceOnce(value, from, to, label){
  if (value.includes(to)) return value;
  if (!value.includes(from)) throw new Error(`Reading integration: missing ${label}`);
  return value.replace(from, to);
}

// The global site shell is generated from content.js. Reading must enter that
// source of truth first; sync-site-shell.mjs then materializes it everywhere.
let content = read('content.js');
content = replaceOnce(
  content,
  '      { href: "/data/", label: "Data" },\n      { href: "/work/", label: "Work" },',
  '      { href: "/data/", label: "Data" },\n      { href: "/reading/", label: "Reading" },\n      { href: "/work/", label: "Work" },',
  'primary Reading navigation'
);
content = replaceOnce(
  content,
  '        { href: "/data/", label: "Data" },\n        { href: "/work/", label: "Work" },',
  '        { href: "/data/", label: "Data" },\n        { href: "/reading/", label: "Reading" },\n        { href: "/work/", label: "Work" },',
  'footer Reading navigation'
);
write('content.js', content);

let shell = read('scripts/sync-site-shell.mjs');
shell = replaceOnce(
  shell,
  '  if (path === "data/index.html") return "/data/";\n  if (path === "work/index.html") return "/work/";',
  '  if (path === "data/index.html") return "/data/";\n  if (path.startsWith("reading/")) return "/reading/";\n  if (path === "work/index.html") return "/work/";',
  'Reading current-navigation mapping'
);
write('scripts/sync-site-shell.mjs', shell);

let indexHtml = read('index/index.html');
indexHtml = indexHtml
  .replace('Search the Galok archive across cities, essays, research, data, visual notes and projects.', 'Search the Galok archive across cities, essays, research, data, Reading, visual notes and projects.')
  .replace('Search the public Galok archive across cities, essays, research, data, projects and visual notes.', 'Search the public Galok archive across cities, essays, research, data, Reading, projects and visual notes.')
  .replace('<button type="button" data-archive-filter="data" aria-pressed="false">Data</button>\n          <button type="button" data-archive-filter="project"', '<button type="button" data-archive-filter="data" aria-pressed="false">Data</button>\n          <button type="button" data-archive-filter="reading" aria-pressed="false">Reading</button>\n          <button type="button" data-archive-filter="project"')
  .replace('Four subjects. One index.', 'Five paths. One index.');

if (!indexHtml.includes('Enter Reading →')) {
  const workBlock = '        <div class="archive-index-group">\n          <p class="archive-index-count">3 systems</p>';
  const readingBlock = '        <div class="archive-index-group">\n          <p class="archive-index-count">READING / LIVE DESK</p>\n          <h3>Old texts, live questions</h3>\n          <p>Chinese historical texts are kept beside their editions, historical context, source trails and the points where modern analogy stops working.</p>\n          <a href="/reading/">Enter Reading →</a>\n        </div>\n';
  if (!indexHtml.includes(workBlock)) throw new Error('Reading integration: archive index insertion point missing');
  indexHtml = indexHtml.replace(workBlock, `${readingBlock}${workBlock}`);
}
write('index/index.html', indexHtml);

let discovery = read('scripts/build-discovery.mjs');
discovery = replaceOnce(discovery,
  '  if (relativePath.startsWith("data/")) return "data";\n  if (relativePath.startsWith("visual-notes/")) return "visual";',
  '  if (relativePath.startsWith("data/")) return "data";\n  if (relativePath.startsWith("reading/")) return "reading";\n  if (relativePath.startsWith("visual-notes/")) return "visual";',
  'Reading type mapping');
discovery = replaceOnce(discovery,
  '  return ({ city: "Cities", essay: "Essays", radar: "Radar", research: "Research", data: "Data", project: "Projects", visual: "Visual Notes", site: "Galok" })[type];',
  '  return ({ city: "Cities", essay: "Essays", radar: "Radar", research: "Research", data: "Data", reading: "Reading", project: "Projects", visual: "Visual Notes", site: "Galok" })[type];',
  'Reading type label');
discovery = replaceOnce(discovery,
  '  if (["/cities/", "/essays/", "/radar/", "/research/", "/data/", "/index/"].includes(route)) return ["0.9", "weekly"];\n  if (route.startsWith("/essays/") || route.startsWith("/research/")) return ["0.9", "monthly"];',
  '  if (["/cities/", "/essays/", "/radar/", "/research/", "/data/", "/reading/", "/index/"].includes(route)) return ["0.9", "weekly"];\n  if (route.startsWith("/essays/") || route.startsWith("/research/") || route.startsWith("/reading/")) return ["0.9", "monthly"];',
  'Reading sitemap priority');
discovery = replaceOnce(discovery,
  '    .filter((page) => (page.type === "essay" || page.type === "research") && !["/essays/", "/research/"].includes(page.route))',
  '    .filter((page) => (page.type === "essay" || page.type === "research" || page.type === "reading") && !["/essays/", "/research/", "/reading/"].includes(page.route))',
  'Reading RSS filter');
discovery = discovery
  .replace('<title>Galok — Essays and Research</title>', '<title>Galok — Essays, Research and Reading</title>')
  .replace('<description>Economic observation, city memory and independent empirical research from Galok.</description>', '<description>Economic observation, city memory, historical reading and independent empirical research from Galok.</description>');
write('scripts/build-discovery.mjs', discovery);

let a11y = read('scripts/runtime-accessibility.mjs');
a11y = replaceOnce(a11y,
  'const routes = ["/", "/cities/", "/essays/", "/radar/", "/research/", "/research/fast-metabolism-economy/", "/data/", "/index/"];',
  'const routes = ["/", "/cities/", "/essays/", "/radar/", "/research/", "/research/fast-metabolism-economy/", "/data/", "/reading/", "/index/"];',
  'Reading accessibility route');
write('scripts/runtime-accessibility.mjs', a11y);

let visual = read('scripts/visual-acceptance.mjs');
visual = replaceOnce(visual,
  'const routes = ["/", "/cities/", "/essays/", "/radar/", "/research/", "/data/", "/index/", "/about/", "/be-a-viewer/shanghai/", "/be-a-viewer/hangzhou/", "/be-a-viewer/chongqing/"];',
  'const routes = ["/", "/cities/", "/essays/", "/radar/", "/research/", "/data/", "/reading/", "/index/", "/about/", "/be-a-viewer/shanghai/", "/be-a-viewer/hangzhou/", "/be-a-viewer/chongqing/"];',
  'Reading visual route');
write('scripts/visual-acceptance.mjs', visual);

console.log('Reading v1 integrated into shell source, archive, discovery and runtime checks.');
