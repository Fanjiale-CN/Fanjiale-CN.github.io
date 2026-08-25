const allowedTypes = new Set(["correction", "source", "note", "collaboration"]);
const json = (payload, status = 200) => new Response(JSON.stringify(payload), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

const escapeHTML = (value) => String(value).replace(/[&<>'\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function text(value, max, required = false) {
  if (typeof value !== "string") return required ? null : "";
  const output = escapeHTML(value.trim().replace(/\u0000/g, "").slice(0, max));
  return required && !output ? null : output;
}

function url(value) {
  if (typeof value !== "string") return "";
  const output = value.trim().replace(/\u0000/g, "").slice(0, 2048);
  if (!output) return "";
  try {
    const parsed = new URL(output);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyTurnstile(token, request, env) {
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET);
  form.set("response", token);
  form.set("remoteip", request.headers.get("CF-Connecting-IP") || "");
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const result = await response.json();
  return Boolean(result.success && (!env.TURNSTILE_HOSTNAME || result.hostname === env.TURNSTILE_HOSTNAME));
}

async function deliver(record, env) {
  if (!env.DELIVERY_WEBHOOK_URL) return;
  const headers = { "content-type": "application/json" };
  if (env.DELIVERY_WEBHOOK_AUTH) headers.authorization = `Bearer ${env.DELIVERY_WEBHOOK_AUTH}`;
  await fetch(env.DELIVERY_WEBHOOK_URL, { method: "POST", headers, body: JSON.stringify(record) });
}

export default {
  async fetch(request, env, ctx) {
    const requestURL = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (request.method === "GET" && requestURL.pathname.endsWith("config")) {
      return json({ endpoint: `${requestURL.origin}${requestURL.pathname.slice(0, -"config".length)}`, turnstileSiteKey: env.TURNSTILE_SITEKEY });
    }
    if (request.method !== "POST") return json({ code: "method_not_allowed" }, 405);
    if (origin && origin !== env.ALLOWED_ORIGIN) return json({ code: "invalid_origin" }, 403);
    if (!env.TURNSTILE_SECRET || !env.TURNSTILE_SITEKEY || !env.SUBMISSIONS) return json({ code: "misconfigured" }, 503);
    if ((Number(request.headers.get("content-length")) || 0) > 16384) return json({ code: "payload_too_large" }, 413);

    let body;
    try { body = await request.json(); } catch { return json({ code: "invalid_json" }, 400); }
    if (!body || typeof body !== "object") return json({ code: "invalid_payload" }, 400);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ipHash = await sha256(ip);
    const rateKey = new Request(`https://galok-reader-rate.invalid/${ipHash}`);
    if (await caches.default.match(rateKey)) return json({ code: "rate_limited" }, 429);

    const token = text(body.turnstileToken, 2048, true);
    if (!token || !(await verifyTurnstile(token, request, env))) return json({ code: "verification_failed" }, 400);

    const type = text(body.type, 32, true);
    const message = text(body.message, 6000, true);
    const name = text(body.name, 120);
    const email = text(body.email, 254);
    const relatedUrl = url(body.relatedUrl);
    const sourceUrl = url(body.sourceUrl);
    const context = text(body.context, 180) || "Galok";
    if (!allowedTypes.has(type) || !message || (body.relatedUrl && !relatedUrl) || (body.sourceUrl && !sourceUrl)) return json({ code: "invalid_fields" }, 400);

    const submittedAt = new Date().toISOString();
    const id = crypto.randomUUID();
    const record = { id, submittedAt, context, type, name, email, message, relatedUrl, sourceUrl, ipHash, userAgent: text(request.headers.get("user-agent"), 500) };
    const key = `submissions/${submittedAt.slice(0, 10).replaceAll("-", "/")}/${id}.json`;
    await env.SUBMISSIONS.put(key, JSON.stringify(record), { httpMetadata: { contentType: "application/json" }, customMetadata: { type, context: context.slice(0, 80) } });
    ctx.waitUntil(caches.default.put(rateKey, new Response("1", { headers: { "cache-control": "max-age=600" } })));
    ctx.waitUntil(deliver(record, env).catch(() => {}));
    return json({ ok: true, id }, 201);
  }
};
