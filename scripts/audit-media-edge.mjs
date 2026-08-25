#!/usr/bin/env node

/**
 * Read-only inventory for the first Galok R2 migration batch.
 *
 * Usage:
 *   node scripts/audit-media-edge.mjs
 *
 * It deliberately keeps the source assets in Git.  The report is based on
 * current-tree references only; it never labels an asset "historical" from a
 * filename or a directory name.
 */

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const reportDir = path.join(root, 'reports');
const mediaExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.mp4', '.webm', '.mp3', '.wav', '.m4a', '.glb', '.gltf']);
const textExt = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.cjs', '.json', '.xml', '.md', '.txt', '.webmanifest', '.ts', '.tsx', '.py', '.sh']);
const ignoredDirs = new Set(['.git', 'node_modules', 'reports']);
const cityNames = new Set(['beijing', 'dali', 'hangzhou', 'shanghai', 'shenzhen', 'tibet-plateau', 'xiamen', 'xian']);

const slash = (value) => value.split(path.sep).join('/');
const rel = (file) => slash(path.relative(root, file));
const isProductionSource = (file) => {
  const value = slash(file);
  if (!['.html', '.htm', '.css', '.js', '.mjs', '.cjs', '.json', '.xml', '.webmanifest'].includes(path.extname(value).toLowerCase())) return false;
  return !/^(?:scripts|video\/|_archive|_research-source|design-plans|plans|data\/research\/|reports)\//.test(value);
};
const sha256 = async (file) => createHash('sha256').update(await fs.readFile(file)).digest('hex');

async function walk(directory, found = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(full, found);
    else if (entry.isFile()) found.push(full);
  }
  return found;
}

function destinationFor(source, hash) {
  const parsed = path.posix.parse(source);
  const versionedName = `${parsed.name}--${hash.slice(0, 12)}${parsed.ext.toLowerCase()}`;
  const parts = source.split('/');
  let category = 'shared';
  let rest = parts.slice(1, -1);

  if (source.startsWith('assets/hero/video/')) {
    category = 'hero/video'; rest = [];
  } else if (source.startsWith('assets/hero/')) {
    category = 'hero'; rest = [];
  } else if (source.startsWith('assets/be-a-viewer/video/mobile/')) {
    category = 'cities/carousel/mobile'; rest = [];
  } else if (source.startsWith('assets/be-a-viewer/video/')) {
    category = 'cities/carousel'; rest = [];
  } else if (source.startsWith('assets/be-a-viewer/')) {
    const city = parts[2];
    category = cityNames.has(city) ? `cities/${city}` : 'cities/shared';
    rest = cityNames.has(city) ? parts.slice(3, -1) : parts.slice(2, -1);
  } else if (source.startsWith('assets/editorial/') && parts.includes('postcard')) {
    category = `postcards/${parts[2] || 'shared'}`;
    rest = parts.slice(parts.indexOf('postcard') + 1, -1);
  } else if (source.startsWith('assets/audio/')) {
    category = 'audio'; rest = [];
  } else if (source.startsWith('assets/models/')) {
    category = `models/${parts[2] || 'shared'}`; rest = parts.slice(3, -1);
  } else if (source.startsWith('assets/research/') || source.startsWith('assets/consumption/') || source.startsWith('assets/zine/')) {
    category = 'research/002'; rest = parts.slice(2, -1);
  } else if (source.startsWith('research/who-captures-growth/')) {
    category = 'research/001'; rest = parts.slice(2, -1);
  } else if (source.startsWith('research/fast-metabolism-economy/')) {
    category = 'research/002'; rest = parts.slice(2, -1);
  } else if (source.startsWith('assets/views/') || source.startsWith('assets/visual-notes/')) {
    category = 'essays'; rest = parts.slice(2, -1);
  } else if (source.startsWith('images/')) {
    category = 'shared/images'; rest = parts.slice(1, -1);
  } else if (source.startsWith('assets/')) {
    category = 'shared'; rest = parts.slice(1, -1);
  }
  return [category, ...rest, versionedName].filter(Boolean).join('/');
}

function resolveCandidate(raw, sourceFile, known) {
  const clean = raw.replace(/[?#].*$/, '').replace(/^https?:\/\/[^/]+\//i, '').replace(/^\/+/, '');
  if (!clean) return null;
  const rootCandidate = path.posix.normalize(clean);
  if (known.has(rootCandidate)) return rootCandidate;
  const fromFile = path.posix.normalize(path.posix.join(path.posix.dirname(sourceFile), clean));
  if (known.has(fromFile)) return fromFile;
  return null;
}

function sourceReferences(content, sourceFile, known) {
  const found = new Set();
  // Matches URLs in HTML attributes, CSS url(), JS strings, srcset and config data.
  const pattern = /(?:https?:\/\/[^\s"'`()]+)?(?:\.\.\/|\.\/|\/)?(?:assets|images|research)\/[A-Za-z0-9_@.\-\/]+/g;
  for (const match of content.matchAll(pattern)) {
    const resolved = resolveCandidate(match[0], sourceFile, known);
    if (resolved) found.add(resolved);
  }
  return found;
}

function r2Decision(asset) {
  if (asset.references.production.length === 0) return { suitable: false, reason: 'No current production reference; retained in Git pending historical review.' };
  if (['mp4', 'webm', 'mp3', 'wav', 'm4a', 'glb', 'gltf'].includes(asset.extension)) {
    return { suitable: true, reason: 'Production-referenced video, audio, or 3D media; migrate in the priority R2 batch.' };
  }
  if (asset.size_bytes < 131072) return { suitable: false, reason: 'Below the 128 KiB migration threshold; small static media stays in Git for this batch.' };
  return { suitable: true, reason: 'Production-referenced media over 128 KiB; upload with immutable content-hash filename.' };
}

const files = await walk(root);
const mediaFiles = files.filter((file) => mediaExt.has(path.extname(file).toLowerCase()));
const sourceFiles = files.filter((file) => textExt.has(path.extname(file).toLowerCase()));
const known = new Set(mediaFiles.map(rel));
const refs = new Map([...known].map((item) => [item, { production: new Set(), all: new Set() }]));

for (const file of sourceFiles) {
  const source = rel(file);
  const content = await fs.readFile(file, 'utf8');
  for (const target of sourceReferences(content, source, known)) {
    refs.get(target).all.add(source);
    if (isProductionSource(source)) refs.get(target).production.add(source);
  }
}

const byHash = new Map();
const assets = [];
for (const file of mediaFiles.sort((a, b) => rel(a).localeCompare(rel(b)))) {
  const source = rel(file);
  const stat = await fs.stat(file);
  const hash = await sha256(file);
  if (!byHash.has(hash)) byHash.set(hash, []);
  byHash.get(hash).push(source);
  const referenceData = refs.get(source);
  const item = {
    source_path: source,
    extension: path.extname(source).slice(1).toLowerCase(),
    size_bytes: stat.size,
    sha256: hash,
    references: {
      production: [...referenceData.production].sort(),
      all_current_tree: [...referenceData.all].sort(),
    },
    production_used: referenceData.production.size > 0,
    historical_status: referenceData.all.size ? 'Referenced in current tree' : 'Unreferenced in current tree; Git history not inferred',
    duplicate_of: null,
    r2_key: destinationFor(source, hash),
    github_retention: 'Retain original in Git for this migration batch (rollback source).',
  };
  item.r2 = r2Decision(item);
  assets.push(item);
}

for (const item of assets) {
  const siblings = byHash.get(item.sha256);
  if (siblings.length > 1) item.duplicate_of = siblings.filter((candidate) => candidate !== item.source_path);
}

const candidates = assets.filter((item) => item.r2.suitable);
const totalBytes = (items) => items.reduce((sum, item) => sum + item.size_bytes, 0);
const report = {
  generated_at: new Date().toISOString(),
  repository: 'Fanjiale-CN/Fanjiale-CN.github.io',
  scope: 'Current-tree media extensions only; no deletion action is included.',
  migration_policy: {
    public_origin: 'https://media.galok.me',
    immutable_naming: '<filename>--<sha256-12>.<ext>',
    cache_control: 'public, max-age=31536000, immutable',
    github_originals: 'Retained for rollback until a later, separately confirmed cleanup.',
  },
  totals: {
    asset_count: assets.length,
    asset_bytes: totalBytes(assets),
    r2_candidate_count: candidates.length,
    r2_candidate_bytes: totalBytes(candidates),
    production_referenced_count: assets.filter((item) => item.production_used).length,
    duplicate_group_count: [...byHash.values()].filter((group) => group.length > 1).length,
  },
  assets,
};

await fs.mkdir(reportDir, { recursive: true });
await fs.writeFile(path.join(reportDir, 'media-edge-inventory.json'), `${JSON.stringify(report, null, 2)}\n`);
const lines = [
  '# GALOK MEDIA EDGE — asset inventory',
  '',
  `Generated: ${report.generated_at}`,
  '',
  `- Media files: ${report.totals.asset_count}`,
  `- Total size: ${report.totals.asset_bytes} bytes`,
  `- Production-referenced: ${report.totals.production_referenced_count}`,
  `- R2 batch candidates: ${report.totals.r2_candidate_count} (${report.totals.r2_candidate_bytes} bytes)`,
  `- Duplicate hash groups: ${report.totals.duplicate_group_count}`,
  '',
  'All source originals are retained in Git for rollback. “Unreferenced” means only that no current-tree textual reference was found; no historical inference is made.',
  '',
  '| Source | Bytes | Production refs | R2 key | R2 decision |',
  '| --- | ---: | ---: | --- | --- |',
  ...assets.map((item) => `| \`${item.source_path}\` | ${item.size_bytes} | ${item.references.production.length} | \`${item.r2_key}\` | ${item.r2.suitable ? 'upload' : 'retain'} |`),
  '',
];
await fs.writeFile(path.join(reportDir, 'media-edge-inventory.md'), lines.join('\n'));
console.log(JSON.stringify(report.totals, null, 2));
