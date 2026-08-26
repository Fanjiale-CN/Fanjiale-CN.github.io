const topics = [
  { topic: "Economy", query: '("China economy" OR "Chinese economy" OR "household demand")' },
  { topic: "Technology", query: '("China AI" OR "Chinese AI" OR semiconductor)' },
  { topic: "Consumption", query: '("China consumer" OR "Chinese consumer" OR retail)' },
  { topic: "Cities", query: '("China city" OR "Chinese cities" OR urban)' }
];

const endpoint = "https://api.gdeltproject.org/api/v2/doc/doc";
const clean = (value = "") => String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const validUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};
const gdeltDate = (value) => {
  const match = String(value || "").match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z` : new Date().toISOString();
};
const stableId = (title, index) => {
  let hash = 2166136261;
  for (const character of String(title)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `gdelt-${index}-${(hash >>> 0).toString(36)}`;
};
const errorLabel = (error) => {
  if (error?.name === "AbortError") return "timeout";
  const message = clean(error?.message || error || "unknown_error");
  return message.slice(0, 120) || "unknown_error";
};

async function queryTopic(item) {
  const startedAt = Date.now();
  const url = new URL(endpoint);
  url.searchParams.set("query", item.query);
  url.searchParams.set("mode", "artlist");
  url.searchParams.set("maxrecords", "25");
  url.searchParams.set("format", "json");
  url.searchParams.set("timespan", "2d");
  url.searchParams.set("sort", "datedesc");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "Galok-Radar/1.0 (+https://www.galok.me/radar/)"
      },
      signal: controller.signal
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

    return {
      topic: item.topic,
      elapsedMs: Date.now() - startedAt,
      articles
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalize(groups) {
  const seen = new Set();
  return groups
    .flat()
    .filter((article) => {
      const key = `${article.url}|${article.title.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 24)
    .map((article, index) => ({
      id: stableId(article.title, index),
      state: "Signal",
      topic: article.topic,
      headline: article.title,
      summary: "Candidate coverage surfaced by the GDELT discovery layer. Editorial verification is pending.",
      context: "This automated match remains a Signal until Galok reviews the source and adds corroborating evidence.",
      publishedAt: article.publishedAt,
      updatedAt: new Date().toISOString(),
      geography: "China / Global",
      coverage: [{ outlet: article.outlet, title: article.title, url: article.url, publishedAt: article.publishedAt }]
    }));
}

function responseHeaders(maxAge, cacheState) {
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": `public, max-age=${maxAge}`,
    "access-control-allow-origin": "https://www.galok.me",
    "x-radar-cache": cacheState
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/signals/") return new Response("Not found", { status: 404 });
    if (!["GET", "HEAD"].includes(request.method)) return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });

    const cache = caches.default;
    const freshKey = new Request(`${url.origin}${url.pathname}?cache=fresh`);
    const staleKey = new Request(`${url.origin}${url.pathname}?cache=stale`);
    const cached = await cache.match(freshKey);
    if (cached) return cached;

    let diagnostics = [];
    try {
      const settled = await Promise.allSettled(topics.map(queryTopic));
      diagnostics = settled.map((result, index) => {
        const topic = topics[index].topic;
        if (result.status === "fulfilled") {
          return {
            topic,
            ok: true,
            count: result.value.articles.length,
            elapsedMs: result.value.elapsedMs
          };
        }
        return { topic, ok: false, error: errorLabel(result.reason) };
      });

      const groups = settled
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value.articles);
      if (!groups.length) throw new Error("all_topic_requests_failed");

      const signals = normalize(groups);
      if (!signals.length) throw new Error("no_usable_candidates");

      const body = JSON.stringify({
        version: "1.0",
        generatedAt: new Date().toISOString(),
        source: "GDELT DOC 2.0 discovery candidates",
        partial: diagnostics.some((item) => !item.ok),
        upstream: diagnostics,
        signals
      });

      const fresh = new Response(body, { headers: responseHeaders(900, "fresh") });
      const stale = new Response(body, { headers: responseHeaders(86400, "stale-store") });
      ctx.waitUntil(Promise.all([cache.put(freshKey, fresh.clone()), cache.put(staleKey, stale)]));
      return fresh;
    } catch (error) {
      const stale = await cache.match(staleKey);
      if (stale) {
        const body = await stale.text();
        return new Response(body, { headers: responseHeaders(60, "stale") });
      }

      return Response.json(
        {
          version: "1.0",
          generatedAt: new Date().toISOString(),
          source: "edge unavailable",
          signals: [],
          error: "upstream_unavailable",
          detail: errorLabel(error),
          upstream: diagnostics
        },
        { status: 503, headers: responseHeaders(60, "miss") }
      );
    }
  }
};
