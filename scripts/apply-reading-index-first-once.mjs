import fs from 'node:fs';

const htmlPath = 'reading/index.html';
const jsPath = 'reading/reading.js';
const libraryCssPath = 'reading/reading-library.css';

let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/\n?\s*<link rel="stylesheet" href="\/reading\/reading-library\.css\?v=[^"]+">/, '');
html = html.replace(
  '<a href="#reading-library">Enter the library <span aria-hidden="true">↓</span></a>',
  '<a href="#reading-index">Browse the index <span aria-hidden="true">↓</span></a>'
);

const libraryStart = html.indexOf('    <section class="reading-library"');
const timeStartAfterLibrary = html.indexOf('    <section class="reading-time"', libraryStart);
if (libraryStart === -1 || timeStartAfterLibrary === -1) {
  throw new Error('Could not locate the Reading library block to remove.');
}
html = html.slice(0, libraryStart) + html.slice(timeStartAfterLibrary);

const indexStart = html.indexOf('    <section class="reading-index"');
const sourcesStart = html.indexOf('    <section class="reading-sources"', indexStart);
if (indexStart === -1 || sourcesStart === -1) {
  throw new Error('Could not locate the Reading index/source boundary.');
}
let indexBlock = html.slice(indexStart, sourcesStart).trimEnd();
html = html.slice(0, indexStart) + html.slice(sourcesStart);
indexBlock = indexBlock.replace('<p>04 / READING INDEX</p>', '<p>01 / READING INDEX</p>');

const timeStart = html.indexOf('    <section class="reading-time"');
if (timeStart === -1) throw new Error('Could not locate the Reading timeline after library removal.');
html = html.slice(0, timeStart) + indexBlock + '\n\n' + html.slice(timeStart);
html = html.replace('<p>05 / SOURCE SHELF</p>', '<p>04 / SOURCE SHELF</p>');
html = html.replace('<p>06 / HOW WE READ</p>', '<p>05 / HOW WE READ</p>');

if (html.includes('reading-library') || html.includes('Choose a text.')) {
  throw new Error('Reading library card markup still remains after migration.');
}
if (html.indexOf('id="reading-index"') > html.indexOf('class="reading-time"')) {
  throw new Error('Reading index was not promoted above the timeline.');
}

fs.writeFileSync(htmlPath, html);

let js = fs.readFileSync(jsPath, 'utf8');
const previewMarker = '  const previewData = {';
const previewIndex = js.indexOf(previewMarker);
if (previewIndex === -1) throw new Error('Could not find Reading preview data marker.');
if (js.includes('function mountReadingLibrary()')) {
  js = '(() => {\n' + js.slice(previewIndex);
}
if (js.includes('mountReadingLibrary') || js.includes('reading-library.css')) {
  throw new Error('Runtime Reading library injection still remains.');
}
fs.writeFileSync(jsPath, js);

if (fs.existsSync(libraryCssPath)) fs.rmSync(libraryCssPath);

console.log('Reading landing simplified: library cards removed and Reading Index promoted to section 01.');
