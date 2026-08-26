const topics = [
  {
    topic: "Economy",
    gdeltQuery: '("China economy" OR "Chinese economy" OR "household demand")',
    rssQuery: "China economy when:1d"
  },
  {
    topic: "Technology",
    gdeltQuery: '("China AI" OR "Chinese AI" OR semiconductor)',
    rssQuery: "China AI semiconductor when:1d"
  },
  {
    topic: "Consumption",
    gdeltQuery: '("China consumer" OR "Chinese consumer" OR retail)',
    rssQuery: "China consumer retail when:1d"
  },
  {
    topic: "Cities",
    gdeltQuery: '("China city" OR "Chinese cities" OR urban)',
    rssQuery: "China cities urban property when:1d"
  }
];

const gdeltEndpoint = "https://api.gdeltproject.org/api/v2/doc/doc";
const googleNewsEndpoint = "https://news.google.com/rss/search";
const upstreamTimeoutMs = 2400;
const secondaryHeadStartMs = 100;

const clean = (value = "") => String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const validUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};
const normalizeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};
const gdeltDate = (value) => {
  const match = String(value || "").match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
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
  if (error?.name === "AbortError") return "timeout";
  const message = clean(error?.message || error || "unknown_error");
  return message.slice(0, 120) || "unknown_error";
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class ProviderError extends Error {
  constructor(provider, detail, diagnostics = []) {
    super(detail);
    this.name = "ProviderError";
    this.provider = provider;
    this.detail = detail;
    this.diagnostics = diagnostics;
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = upstreamTimeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function queryGdeltTopic(item) {
  const startedAt = Date.now();
  const url = new URL(gdeltEndpoint);
  url.searchParams.set("query", item.gdeltQuery);
  url.searchParams.set("mode", "artlist");
  url.searchParams.set("maxrecords", "25");
  url.searchParams.set("format", "json");
  url.searchParams.set("timespan", "2d");
  url.searchParams.set("sort", "datedesc");

  const response = await fetchWithTimeout(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Galok-Radar/1.0 (+https://www.galok.me/radar/)"
    }
  });
  if (!response.ok) throw new Error(`http_${response.status}`);

  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error("invalid_json");
  }

  const articles = (json.articles || [])
    .filter((article) => validUrl(article.url) && article.title)
    .map((article) => ({
      topic: item.topic,
      title: clean(article.title),
      url: article.url,
      outlet: clean(article.domain || article.sourcecountry || "Source"),
      publishedAt: gdeltDate(article.seendate)
    }));

  return { topic: item.topic, elapsedMs: Date.now() - startedAt, articles };
}

function decodeXml(value = "") {
  return String(value)
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/i, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function xmlTag(block, tag) {
  const match = String(block).match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

function parseGoogleNewsFeed(xml, topic) {
  const items = String(xml).match(/<item\b[\s\S]*?<\/item>/gi) || [];
  return items.map((block) => {
    const outlet = clean(xmlTag(block, "source") || "Google News");
    let title = clean(xmlTag(block, "title"));
    const suffix = ` - ${outlet}`;
    if (outlet && title.endsWith(suffix)) title = title.slice(0, -suffix.length).trim();

    const url = xmlTag(block, "link");
    return {
      topic,
      title,
      url,
      outlet,
      publishedAt: normalizeDate(xmlTag(block, "pubDate"))
    };
  }).filter((article) => article.title && validUrl(article.url));
}

async function queryGoogleNewsTopic(item) {
  const startedAt = Date.now();
  const url = new URL(googleNewsEndpoint);
  url.searchParams.set("q", item.rssQuery);
  url.searchParams.set("hl", "en-US");
  url.searchParams.set("gl", "US");
  url.searchParams.set("ceid", "US:en");

  const response = await fetchWithTimeout(url, {
    headers: {
      accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.1",
      "user-agent": "Galok-Radar/1.0 (+https://www.galok.me/radar/)"
    }
  });
  if (!response.ok) throw new Error(`http_${response.status}`);

  const xml = await response.text();
  if (!xml.includes("<rss") && !xml.includes("<feed")) throw new Error("invalid_xml");
  const articles = parseGoogleNewsFeed(xml, item.topic);
  return { topic: item.topic, elapsedMs: Date.now() - startedAt, articles };
}

function normalize(groups, provider) {
  const seen = new Set();
  const prefix = provider === "gdelt" ? "gdelt" : "gnews";
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
      state: "Signal",
      topic: article.topic,
      headline: article.title,
      summary: "Candidate coverage surfaced by an automated news discovery feed. Editorial verification is pending.",
      context: "This automated match remains a Signal until Galok reviews the source and adds corroborating evidence.",
      publishedAt: article.publishedAt,
      updatedAt: article.publishedAt,
      geography: "China / Global",
      coverage: [{ outlet: article.outlet, title: article.title, url: article.url, publishedAt: article.publishedAt }]
    }));
}

async function discoverProvider(provider, queryTopic) {
  const settled = await Promise.allSettled(topics.map(queryTopic));
  const diagnostics = settled.map((result, index) => {
    const topic = topics[index].topic;
    if (result.status === "fulfilled") {
      return { topic, ok: true, count: result.value.articles.length, elapsedMs: result.value.elapsedMs };
    }
    return { topic, ok: false, error: errorLabel(result.reason) };
  });

  const groups = settled
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value.articles);
  if (!groups.length) throw new ProviderError(provider, "all_topic_requests_failed", diagnostics);

  const signals = normalize(groups, provider);
  if (!signals.length) throw new ProviderError(provider, "no_usable_candidates", diagnostics);

  return {
    provider,
    source: provider === "gdelt" ? "GDELT DOC 2.0 discovery candidates" : "Google News RSS discovery fallback",
    partial: diagnostics.some((item) => !item.ok),
    upstream: diagnostics,
    signals
  };
}

async function discoverFast() {
  const gdelt = discoverProvider("gdelt", queryGdeltTopic);
  const googleNews = delay(secondaryHeadStartMs).then(() => discoverProvider("google-news-rss", queryGoogleNewsTopic));

  try {
    return await Promise.any([gdelt, googleNews]);
  } catch (aggregate) {
    const errors = aggregate?.errors || [];
    const diagnostics = errors.map((error) => ({
      provider: error?.provider || "unknown",
      detail: error?.detail || errorLabel(error),
      topics: error?.diagnostics || []
    }));
    throw new ProviderError("all", "all_providers_failed", diagnostics);
  }
}

function responseHeaders(maxAge, cacheState) {
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": `public, max-age=${maxAge}`,
    "access-control-allow-origin": "https://www.galok.me",
    "x-radar-cache": cacheState
  };
}

function serializeDiscovery(discovery) {
  return JSON.stringify({
    version: "1.0",
    generatedAt: new Date().toISOString(),
    source: discovery.source,
    provider: discovery.provider,
    partial: discovery.partial,
    upstream: discovery.upstream,
    signals: discovery.signals
  });
}

async function storeDiscovery(cache, freshKey, staleKey, body) {
  const fresh = new Response(body, { headers: responseHeaders(900, "fresh") });
  const stale = new Response(body, { headers: responseHeaders(86400, "stale-store") });
  await Promise.all([cache.put(freshKey, fresh), cache.put(staleKey, stale)]);
}

async function refreshInBackground(cache, freshKey, staleKey) {
  const discovery = await discoverFast();
  const body = serializeDiscovery(discovery);
  await storeDiscovery(cache, freshKey, staleKey, body);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/signals/") return new Response("Not found", { status: 404 });
    if (!["GET", "HEAD"].includes(request.method)) return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });

    const cache = caches.default;
    const freshKey = new Request(`${url.origin}${url.pathname}?cache=fresh-v2`);
    const staleKey = new Request(`${url.origin}${url.pathname}?cache=stale-v2`);
    const cached = await cache.match(freshKey);
    if (cached) return cached;

    const stale = await cache.match(staleKey);
    if (stale) {
      ctx.waitUntil(refreshInBackground(cache, freshKey, staleKey).catch(() => {}));
      const body = await stale.text();
      return new Response(body, { headers: responseHeaders(60, "stale") });
    }

    try {
      const discovery = await discoverFast();
      const body = serializeDiscovery(discovery);
      ctx.waitUntil(storeDiscovery(cache, freshKey, staleKey, body));
      return new Response(body, { status: 200, headers: responseHeaders(900, "fresh") });
    } catch (error) {
      return Response.json(
        {
          version: "1.0",
          generatedAt: new Date().toISOString(),
          source: "edge unavailable",
          signals: [],
          error: "upstream_unavailable",
          detail: error?.detail || errorLabel(error),
          upstream: error?.diagnostics || []
        },
        { status: 503, headers: responseHeaders(60, "miss") }
      );
    }
  }
};
