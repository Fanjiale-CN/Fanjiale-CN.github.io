const objectKey = "radar/live-signals.json";
const freshMaxAgeMs = 30 * 60 * 1000;
const staleMaxAgeMs = 24 * 60 * 60 * 1000;

const clean = (value = "") => String(value).replace(/\s+/g, " ").trim();

function responseHeaders(maxAge, cacheState, generatedAt = "") {
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": `public, max-age=${maxAge}`,
    "access-control-allow-origin": "https://www.galok.me",
    "x-radar-cache": cacheState,
    ...(generatedAt ? { "x-radar-generated-at": generatedAt } : {})
  };
}

function validatePayload(data) {
  if (data?.version !== "1.0") throw new Error("invalid_version");
  if (!Array.isArray(data.signals) || !data.signals.length || data.signals.length > 24) throw new Error("invalid_signals");
  if (!Date.parse(data.generatedAt)) throw new Error("invalid_generated_at");

  for (const item of data.signals) {
    if (item.state !== "Signal" || !item.id || !item.headline || !item.summary || !item.context) throw new Error("invalid_signal_schema");
    if (!Array.isArray(item.coverage) || !item.coverage.length) throw new Error("invalid_signal_coverage");
  }

  return data;
}

async function readR2Payload(env) {
  if (!env.RADAR_BUCKET) throw new Error("missing_r2_binding");
  const object = await env.RADAR_BUCKET.get(objectKey);
  if (!object) throw new Error("missing_r2_object");

  let data;
  try {
    data = JSON.parse(await object.text());
  } catch {
    throw new Error("invalid_r2_json");
  }

  validatePayload(data);
  const generated = Date.parse(data.generatedAt);
  const ageMs = Date.now() - generated;
  if (!Number.isFinite(ageMs) || ageMs < -60_000) throw new Error("invalid_feed_age");
  if (ageMs > staleMaxAgeMs) throw new Error("feed_expired");

  return { data, ageMs };
}

function errorLabel(error) {
  return clean(error?.message || error || "unknown_error").slice(0, 120) || "unknown_error";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/signals/") return new Response("Not found", { status: 404 });
    if (!["GET", "HEAD"].includes(request.method)) {
      return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }

    try {
      const { data, ageMs } = await readR2Payload(env);
      const cacheState = ageMs <= freshMaxAgeMs ? "r2-fresh" : "r2-stale";
      const maxAge = ageMs <= freshMaxAgeMs ? 300 : 60;
      const body = JSON.stringify({
        ...data,
        delivery: "cloudflare-r2",
        stale: ageMs > freshMaxAgeMs,
        ageSeconds: Math.max(0, Math.round(ageMs / 1000))
      });
      const headers = responseHeaders(maxAge, cacheState, data.generatedAt);
      return new Response(request.method === "HEAD" ? null : body, { status: 200, headers });
    } catch (error) {
      return Response.json(
        {
          version: "1.0",
          generatedAt: new Date().toISOString(),
          source: "edge unavailable",
          signals: [],
          error: "live_feed_unavailable",
          detail: errorLabel(error)
        },
        { status: 503, headers: responseHeaders(60, "r2-miss") }
      );
    }
  }
};
