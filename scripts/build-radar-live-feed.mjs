#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import process from 'node:process';

const topics = [
  { topic: 'Economy', rssQuery: 'China economy when:1d', gdeltQuery: '("China economy" OR "Chinese economy" OR "household demand")' },
  { topic: 'Technology', rssQuery: 'China AI semiconductor when:1d', gdeltQuery: '("China AI" OR "Chinese AI" OR semiconductor)' },
  { topic: 'Consumption', rssQuery: 'China consumer retail when:1d', gdeltQuery: '("China consumer" OR "Chinese consumer" OR retail)' },
  { topic: 'Cities', rssQuery: 'China cities urban property when:1d', gdeltQuery: '("China city" OR "Chinese cities" OR urban)' },
];

const timeoutMs = 12000;
const googleNewsEndpoint = 'https://news.google.com/rss/search';
const gdeltEndpoint = 'https://api.gdeltproject.org/api/v2/doc/doc';
const outputIndex = process.argv.indexOf('--output');
const outputFile = outputIndex >= 0 ? process.argv[outputIndex + 1] : null;

const clean = (value = '') => String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const validUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
const normalizeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};
const gdeltDate = (value) => {
  const match = String(value || '').match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z` : normalizeDate(value);
};
const stableId = (prefix, title, index) => {
  let hash = 2166136261;
  for (const character of String(title)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `${prefix}-${index}-${(hash >>> 0).toString(36)}`;
};
const errorLabel = (error) => {
  if (error?.name === 'AbortError') return 'timeout';
  return clean(error?.message || error || 'unknown_error').slice(0, 120) || 'unknown_error';
};

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function decodeXml(value = '') {
  return String(value)
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/i, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function xmlTag(block, tag) {
  const match = String(block).match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]).trim() : '';
}

function parseGoogleNewsFeed(xml, topic) {
  const items = String(xml).match(/<item\b[\s\S]*?<\/item>/gi) || [];
  return items.map((block) => {
    const outlet = clean(xmlTag(block, 'source') || 'Google News');
    let title = clean(xmlTag(block, 'title'));
    const suffix = ` - ${outlet}`;
    if (outlet && title.endsWith(suffix)) title = title.slice(0, -suffix.length).trim();
    return {
      topic,
      title,
      url: xmlTag(block, 'link'),
      outlet,
      publishedAt: normalizeDate(xmlTag(block, 'pubDate')),
    };
  }).filter((article) => article.title && validUrl(article.url));
}

async function queryGoogleTopic(item) {
  const startedAt = Date.now();
  const url = new URL(googleNewsEndpoint);
  url.searchParams.set('q', item.rssQuery);
  url.searchParams.set('hl', 'en-US');
  url.searchParams.set('gl', 'US');
  url.searchParams.set('ceid', 'US:en');
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.1',
      'user-agent': 'Galok-Radar/1.0 (+https://www.galok.me/radar/)',
    },
  });
  if (!response.ok) throw new Error(`http_${response.status}`);
  const xml = await response.text();
  if (!xml.includes('<rss') && !xml.includes('<feed')) throw new Error('invalid_xml');
  return { topic: item.topic, elapsedMs: Date.now() - startedAt, articles: parseGoogleNewsFeed(xml, item.topic) };
}

async function queryGdeltTopic(item) {
  const startedAt = Date.now();
  const url = new URL(gdeltEndpoint);
  url.searchParams.set('query', item.gdeltQuery);
  url.searchParams.set('mode', 'artlist');
  url.searchParams.set('maxrecords', '25');
  url.searchParams.set('format', 'json');
  url.searchParams.set('timespan', '2d');
  url.searchParams.set('sort', 'datedesc');
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'Galok-Radar/1.0 (+https://www.galok.me/radar/)',
    },
  });
  if (!response.ok) throw new Error(`http_${response.status}`);
  const json = await response.json();
  const articles = (json.articles || [])
    .filter((article) => validUrl(article.url) && article.title)
    .map((article) => ({
      topic: item.topic,
      title: clean(article.title),
      url: article.url,
      outlet: clean(article.domain || article.sourcecountry || 'Source'),
      publishedAt: gdeltDate(article.seendate),
    }));
  return { topic: item.topic, elapsedMs: Date.now() - startedAt, articles };
}

function normalize(groups, provider) {
  const seen = new Set();
  const prefix = provider === 'google-news-rss' ? 'gnews' : 'gdelt';
  return groups
    .flat()
    .filter((article) => {
      const key = `${article.url}|${article.title.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 24)
    .map((article, index) => ({
      id: stableId(prefix, article.title, index),
      state: 'Signal',
      topic: article.topic,
      headline: article.title,
      summary: 'Candidate coverage surfaced by an automated news discovery feed. Editorial verification is pending.',
      context: 'This automated match remains a Signal until Galok reviews the source and adds corroborating evidence.',
      publishedAt: article.publishedAt,
      updatedAt: article.publishedAt,
      geography: 'China / Global',
      coverage: [{ outlet: article.outlet, title: article.title, url: article.url, publishedAt: article.publishedAt }],
    }));
}

async function discoverProvider(provider, queryTopic) {
  const settled = await Promise.allSettled(topics.map(queryTopic));
  const upstream = settled.map((result, index) => {
    const topic = topics[index].topic;
    if (result.status === 'fulfilled') return { topic, ok: true, count: result.value.articles.length, elapsedMs: result.value.elapsedMs };
    return { topic, ok: false, error: errorLabel(result.reason) };
  });
  const groups = settled.filter((result) => result.status === 'fulfilled').map((result) => result.value.articles);
  const signals = normalize(groups, provider);
  if (!signals.length) {
    const error = new Error('no_usable_candidates');
    error.upstream = upstream;
    throw error;
  }
  return { provider, upstream, partial: upstream.some((item) => !item.ok), signals };
}

async function build() {
  const failures = [];
  try {
    const result = await discoverProvider('google-news-rss', queryGoogleTopic);
    return {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      source: 'GitHub scheduled Google News RSS discovery',
      ...result,
    };
  } catch (error) {
    failures.push({ provider: 'google-news-rss', error: errorLabel(error), upstream: error.upstream || [] });
  }

  try {
    const result = await discoverProvider('gdelt', queryGdeltTopic);
    return {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      source: 'GitHub scheduled GDELT fallback discovery',
      ...result,
      fallbackFrom: failures,
    };
  } catch (error) {
    failures.push({ provider: 'gdelt', error: errorLabel(error), upstream: error.upstream || [] });
  }

  const failure = new Error('All scheduled Radar discovery providers failed');
  failure.failures = failures;
  throw failure;
}

try {
  const payload = await build();
  const text = `${JSON.stringify(payload, null, 2)}\n`;
  if (outputFile) {
    await fs.writeFile(outputFile, text, 'utf8');
    console.log(`Wrote ${payload.signals.length} Radar live candidates from ${payload.provider} to ${outputFile}`);
  } else {
    process.stdout.write(text);
  }
} catch (error) {
  console.error(error.message);
  if (error.failures) console.error(JSON.stringify(error.failures, null, 2));
  process.exitCode = 1;
}
