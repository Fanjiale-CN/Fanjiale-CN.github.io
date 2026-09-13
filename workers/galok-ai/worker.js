const CITY_CONTEXT = {
  beijing:
    "Galok observes Beijing through axes, enclosures, ceremonial scale, trees, walls, courtyards and everyday movement.",
  shanghai:
    "Galok observes Shanghai through river light, compressed streets, vertical ambition, spectacle and dense everyday life.",
  xian:
    "Galok observes Xi'an through stone, brick, ritual scale, historical structures and contemporary urban movement.",
  xiamen:
    "Galok observes Xiamen through coastline, humidity, harbour edges, hills, roads and softer coastal light.",
  hangzhou:
    "Galok observes Hangzhou through water, foliage, reflection, landscape and the relationship between scenic order and contemporary city life.",
  shenzhen:
    "Galok observes Shenzhen through infrastructure, glass, speed, transition, bay edges and recently built urban space.",
  chongqing:
    "Galok observes Chongqing through topography, river level, bridges, rail, stacked streets and vertical circulation."
};

const GLM_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const MODEL = "glm-4.7-flash";
const MAX_QUESTION = 600;
const encoder = new TextEncoder();

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }
});

const sse = (event, data) => encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const friendlyError = (status) => {
  if (status === 429) {
    return {
      code: "RATE_LIMITED",
      retryable: true,
      message: "Galok AI is busy right now. Try again in a moment."
    };
  }
  if (status === 408 || status === 504) {
    return {
      code: "TIMEOUT",
      retryable: true,
      message: "This answer took longer than expected. Try again."
    };
  }
  return {
    code: "PROVIDER_ERROR",
    retryable: true,
    message: "The AI provider is temporarily unavailable."
  };
};

const systemPrompt = `
You are Galok AI, the contextual explanation layer of galok.me.

Galok is an independent visual research and publishing project.

Your role is to help visitors understand the city and the material they are currently viewing.

Rules:
- Answer the user's actual question directly.
- Use the supplied Galok context as the primary frame.
- Never invent Galok articles, photographs, observations or sources.
- Distinguish Galok's supplied observations from general knowledge.
- If the supplied context is insufficient, say so clearly.
- Do not claim to have searched the web.
- Do not claim to represent the author's personal opinion unless explicitly supplied.
- Do not write like a tourist guide or use marketing language.
- Prefer spatial, visual, historical and everyday-life explanations.
- Be concise, calm and useful.
- Answer in the same language as the user.
- Usually answer in 2 to 5 short paragraphs.
`.trim();

const buildPayload = (city, question) => ({
  model: MODEL,
  messages: [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: `
Current city: ${city}

Galok context:
${CITY_CONTEXT[city]}

Visitor question:
${question}
      `.trim()
    }
  ],
  thinking: {
    type: "disabled"
  },
  stream: true,
  max_tokens: 800,
  temperature: 0.5
});

const callProvider = async (env, city, question) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    return await fetch(GLM_ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "Authorization": `Bearer ${env.GLM_API_KEY}`
      },
      body: JSON.stringify(buildPayload(city, question))
    });
  } finally {
    clearTimeout(timer);
  }
};

const consumeProviderStream = async (upstream, controller) => {
  const contentType = upstream.headers.get("content-type") || "";

  if (!contentType.includes("text/event-stream")) {
    const data = await upstream.json().catch(() => ({}));
    const text = String(data?.choices?.[0]?.message?.content || "");
    if (text) controller.enqueue(sse("delta", { text }));
    return text.trim().length > 0;
  }

  if (!upstream.body) return false;

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let emitted = false;

  const handleLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === "[DONE]") return;

    let data;
    try {
      data = JSON.parse(payload);
    } catch {
      return;
    }

    const text = String(data?.choices?.[0]?.delta?.content || "");
    if (!text) return;
    emitted = true;
    controller.enqueue(sse("delta", { text }));
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done }).replace(/\r\n/g, "\n");

    let newline = buffer.indexOf("\n");
    while (newline !== -1) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      handleLine(line);
      newline = buffer.indexOf("\n");
    }

    if (done) break;
  }

  if (buffer.trim()) handleLine(buffer);
  return emitted;
};

const streamAnswer = (env, city, question) => new Response(new ReadableStream({
  async start(controller) {
    controller.enqueue(sse("meta", { model: MODEL, city }));

    try {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        let upstream;
        try {
          upstream = await callProvider(env, city, question);
        } catch (error) {
          const timeout = error?.name === "AbortError";
          const detail = timeout
            ? { code: "TIMEOUT", retryable: true, message: "This answer took longer than expected. Try again." }
            : { code: "PROVIDER_ERROR", retryable: true, message: "The AI provider is temporarily unavailable." };
          controller.enqueue(sse("error", detail));
          controller.close();
          return;
        }

        if (!upstream.ok) {
          if (upstream.status === 429 && attempt === 0) {
            await delay(1400);
            continue;
          }
          controller.enqueue(sse("error", friendlyError(upstream.status)));
          controller.close();
          return;
        }

        const emitted = await consumeProviderStream(upstream, controller);
        if (emitted) {
          controller.enqueue(sse("done", { ok: true }));
          controller.close();
          return;
        }

        if (attempt === 0) {
          await delay(300);
          continue;
        }

        controller.enqueue(sse("error", {
          code: "EMPTY_RESPONSE",
          retryable: true,
          message: "Galok AI couldn’t complete this answer. Try again."
        }));
        controller.close();
        return;
      }
    } catch {
      controller.enqueue(sse("error", {
        code: "PROVIDER_ERROR",
        retryable: true,
        message: "The AI provider is temporarily unavailable."
      }));
      controller.close();
    }
  }
}), {
  headers: {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-store",
    "X-Content-Type-Options": "nosniff"
  }
});

export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return json({
        ok: true,
        service: "galok-ai",
        model: MODEL,
        streaming: true,
        thinking: false
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405);
    }

    if (!env.GLM_API_KEY) {
      return json({ error: "GLM_API_KEY is not configured." }, 503);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON." }, 400);
    }

    const city = String(body?.city || "").toLowerCase().trim();
    const question = String(body?.question || "").trim();

    if (!CITY_CONTEXT[city]) {
      return json({ error: "Unknown city." }, 400);
    }
    if (!question) {
      return json({ error: "Question is required." }, 400);
    }
    if (question.length > MAX_QUESTION) {
      return json({ error: "Question is too long." }, 400);
    }

    return streamAnswer(env, city, question);
  }
};
