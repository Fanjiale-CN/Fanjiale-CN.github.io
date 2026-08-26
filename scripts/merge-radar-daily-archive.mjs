#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import process from 'node:process';

function arg(name, required = false) {
  const index = process.argv.indexOf(`--${name}`);
  const value = index >= 0 ? process.argv[index + 1] : null;
  if (required && !value) throw new Error(`Missing --${name}`);
  return value;
}

const currentPath = arg('current', true);
const existingPath = arg('existing');
const outputPath = arg('output', true);
const snapshotKey = arg('snapshot-key', true);

const normalizeHeadline = (value = '') => String(value).trim().toLowerCase().replace(/\s+/g, ' ');

function canonicalUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|gclid$|fbclid$|mc_)/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return '';
  }
}

function archiveKey(item) {
  const sourceUrl = canonicalUrl(item?.coverage?.[0]?.url || '');
  if (sourceUrl) return `url:${sourceUrl}`;
  return `headline:${normalizeHeadline(item?.headline)}`;
}

async function readJson(path, optional = false) {
  if (!path && optional) return null;
  try {
    return JSON.parse(await fs.readFile(path, 'utf8'));
  } catch (error) {
    if (optional && error?.code === 'ENOENT') return null;
    throw error;
  }
}

const current = await readJson(currentPath);
if (current.version !== '1.0' || !Date.parse(current.generatedAt) || !Array.isArray(current.signals) || !current.signals.length) {
  throw new Error('Current Radar payload is invalid.');
}

const date = current.generatedAt.slice(0, 10);
const existing = await readJson(existingPath, true);
if (existing) {
  if (existing.version !== '1.0' || existing.type !== 'radar-daily-archive' || existing.date !== date || !Array.isArray(existing.signals)) {
    throw new Error('Existing Radar daily archive is invalid or belongs to another date.');
  }
}

const byKey = new Map();
for (const item of existing?.signals || []) {
  const key = item.archiveKey || archiveKey(item);
  if (!key) continue;
  byKey.set(key, { ...item, archiveKey: key });
}

for (const item of current.signals) {
  const key = archiveKey(item);
  const previous = byKey.get(key);
  const firstSeenAt = previous?.firstSeenAt || current.generatedAt;
  const providers = [...new Set([...(previous?.providers || []), current.provider || current.source || 'unknown'])];
  byKey.set(key, {
    ...item,
    archiveKey: key,
    firstSeenAt,
    lastSeenAt: current.generatedAt,
    seenCount: (previous?.seenCount || 0) + 1,
    providers,
  });
}

const snapshotEntry = {
  key: snapshotKey,
  generatedAt: current.generatedAt,
  provider: current.provider || current.source || 'unknown',
  count: current.signals.length,
};
const snapshots = [...(existing?.snapshots || []).filter((entry) => entry?.key !== snapshotKey), snapshotEntry]
  .sort((a, b) => new Date(a.generatedAt) - new Date(b.generatedAt));

const signals = [...byKey.values()].sort((a, b) => {
  const lastSeen = new Date(b.lastSeenAt) - new Date(a.lastSeenAt);
  if (lastSeen) return lastSeen;
  return new Date(b.publishedAt) - new Date(a.publishedAt);
});

const archive = {
  version: '1.0',
  type: 'radar-daily-archive',
  date,
  createdAt: existing?.createdAt || current.generatedAt,
  updatedAt: current.generatedAt,
  snapshotCount: snapshots.length,
  signalCount: signals.length,
  providers: [...new Set(snapshots.map((entry) => entry.provider))],
  latestSnapshot: snapshotKey,
  snapshots,
  signals,
};

await fs.writeFile(outputPath, `${JSON.stringify(archive, null, 2)}\n`, 'utf8');
console.log(`Merged Radar daily archive ${date}: ${archive.signalCount} unique signals across ${archive.snapshotCount} snapshots.`);
