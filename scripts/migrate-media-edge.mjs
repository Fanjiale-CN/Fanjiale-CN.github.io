#!/usr/bin/env node

/**
 * Upload the audited R2 batch first, verify public delivery, then rewrite only
 * the current production references.  No Git source asset is deleted here.
 *
 * Required for --apply: CLOUDFLARE_API_TOKEN with Account > Workers R2 Storage
 * > Edit. The token is intentionally not read from a repository file.
 */

import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = process.cwd();
const inventoryFile = path.join(root, 'reports/media-edge-inventory.json');
const publicOrigin = 'https://media.galok.me';
const bucket = 'galok-media';
const cacheControl = 'public, max-age=31536000, immutable';
const apply = process.argv.includes('--apply');
const verifyOnly = process.argv.includes('--verify');
const textExt = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.cjs', '.json', '.xml', '.webmanifest', '.ts', '.tsx']);
const mimeTypes = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif',
  mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', glb: 'model/gltf-binary', gltf: 'model/gltf+json',
};
const ignoredDirs = new Set(['.git', 'node_modules', 'reports', 'scripts', 'video', '_archive-film-v1', '_research-source', 'design-plans', 'plans']);

const slash = (value) => value.split(path.sep).join('/');
const rel = (file) => slash(path.relative(root, file));
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function walk(directory, found = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(full, found);
    else if (entry.isFile() && textExt.has(path.extname(entry.name).toLowerCase())) found.push(full);
  }
  return found;
}

async function request(url, method = 'HEAD') {
  const response = await fetch(url, { method, redirect: 'follow' });
  return { status: response.status, headers: Object.fromEntries(response.headers.entries()) };
}

async function verifyObject(asset) {
  const url = `${publicOrigin}/${asset.r2_key}`;
  const result = await request(url);
  if (result.status < 200 || result.status >= 400) throw new Error(`${url} returned ${result.status}`);
  const expected = mimeTypes[asset.extension];
  if (expected && !(result.headers['content-type'] || '').toLowerCase().startsWith(expected)) {
    throw new Error(`${url} has ${result.headers['content-type'] || 'no content-type'}; expected ${expected}`);
  }
  return { url, ...result };
}

function rewrite(content, asset) {
  const replacement = `${publicOrigin}/${asset.r2_key}`;
  const source = escape(asset.source_path);
  let next = content;
  next = next.replace(new RegExp(`https://www\\.galok\\.me/${source}`, 'g'), replacement);
  next = next.replace(new RegExp(`(?:\\.\\.\\/|\\.\\/)+${source}`, 'g'), replacement);
  next = next.replace(new RegExp(`/${source}`, 'g'), replacement);
  return next;
}

const inventory = JSON.parse(await fs.readFile(inventoryFile, 'utf8'));
const batch = inventory.assets.filter((asset) => asset.r2.suitable && asset.production_used);
if (!batch.length) throw new Error('No production-referenced R2 candidates in reports/media-edge-inventory.json.');

if (!apply && !verifyOnly) {
  console.log(JSON.stringify({ mode: 'plan', bucket, public_origin: publicOrigin, objects: batch.length, bytes: batch.reduce((sum, asset) => sum + asset.size_bytes, 0) }, null, 2));
  process.exit(0);
}

const results = [];
if (apply) {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    throw new Error('CLOUDFLARE_API_TOKEN is required for --apply. No reference files were changed.');
  }
  for (const asset of batch) {
    const sourceFile = path.join(root, asset.source_path);
    const args = ['--yes', 'wrangler', 'r2', 'object', 'put', `${bucket}/${asset.r2_key}`, '--file', sourceFile, '--content-type', mimeTypes[asset.extension] || 'application/octet-stream', '--cache-control', cacheControl];
    await run('npx', args, {
      cwd: root,
      env: {
        ...process.env,
        NPM_CONFIG_CACHE: process.env.NPM_CONFIG_CACHE || '/tmp/galok-npm-cache',
        XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME || '/tmp/galok-wrangler-config',
      },
      maxBuffer: 4 * 1024 * 1024,
    });
    results.push(await verifyObject(asset));
  }

  const changed = [];
  for (const file of await walk(root)) {
    const before = await fs.readFile(file, 'utf8');
    const after = batch.reduce(rewrite, before);
    if (after !== before) {
      await fs.writeFile(file, after);
      changed.push(rel(file));
    }
  }
  const leftovers = [];
  for (const file of await walk(root)) {
    const text = await fs.readFile(file, 'utf8');
    for (const asset of batch) {
      if (text.includes(`/${asset.source_path}`) || text.includes(`https://www.galok.me/${asset.source_path}`)) leftovers.push(`${rel(file)} -> ${asset.source_path}`);
    }
  }
  if (leftovers.length) throw new Error(`Reference rewrite incomplete:\n${leftovers.join('\n')}`);
  await fs.writeFile(path.join(root, 'reports/media-edge-migration-result.json'), `${JSON.stringify({ generated_at: new Date().toISOString(), bucket, public_origin: publicOrigin, cache_control: cacheControl, uploaded: results, changed_files: changed, deleted_github_assets: [] }, null, 2)}\n`);
  console.log(JSON.stringify({ mode: 'applied', uploaded: results.length, changed_files: changed.length }, null, 2));
  process.exit(0);
}

for (const asset of batch) results.push(await verifyObject(asset));
console.log(JSON.stringify({ mode: 'verify', verified: results.length }, null, 2));
