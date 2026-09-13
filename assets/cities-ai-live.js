(() => {
  "use strict";

  if (location.pathname.replace(/index\.html$/, "") !== "/cities/") return;

  const API_URL = "/api/ask";
  const MAX_QUESTION = 600;
  const STREAM_MIME = "text/event-stream";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  let requestToken = 0;
  let activeController = null;

  class GalokAIError extends Error {
    constructor(message, code = "UNKNOWN", retryable = true) {
      super(message);
      this.name = "GalokAIError";
      this.code = code;
      this.retryable = retryable;
    }
  }

  const friendlyError = (code) => {
    switch (code) {
      case "RATE_LIMITED":
        return "Galok AI is busy right now. Try again in a moment.";
      case "TIMEOUT":
        return "This answer took longer than expected. Try again.";
      case "NETWORK_ERROR":
        return "Connection interrupted. Check your connection and try again.";
      case "EMPTY_RESPONSE":
        return "Galok AI couldn’t complete this answer. Try again.";
      case "PROVIDER_ERROR":
        return "The AI provider is temporarily unavailable.";
      case "INVALID_REQUEST":
        return "Galok AI couldn’t process this question.";
      default:
        return "Galok AI is temporarily unavailable.";
    }
  };

  const classifyResponseError = (response, data = {}) => {
    const upstreamStatus = Number(data?.upstream_status || 0);
    const raw = String(data?.error || "").toLowerCase();

    if (response.status === 429 || upstreamStatus === 429) {
      return new GalokAIError(friendlyError("RATE_LIMITED"), "RATE_LIMITED");
    }
    if (response.status === 408 || upstreamStatus === 408 || raw.includes("timeout") || raw.includes("too long")) {
      return new GalokAIError(friendlyError("TIMEOUT"), "TIMEOUT");
    }
    if (raw.includes("empty response") || raw.includes("empty")) {
      return new GalokAIError(friendlyError("EMPTY_RESPONSE"), "EMPTY_RESPONSE");
    }
    if (response.status >= 500 || upstreamStatus >= 500) {
      return new GalokAIError(friendlyError("PROVIDER_ERROR"), "PROVIDER_ERROR");
    }
    if (response.status >= 400) {
      return new GalokAIError(friendlyError("INVALID_REQUEST"), "INVALID_REQUEST", false);
    }
    return new GalokAIError(friendlyError("UNKNOWN"), "UNKNOWN");
  };

  const nextRevealCut = (text, max = 34, min = 12) => {
    if (text.length <= max) return text.length;
    for (let i = max; i >= min; i -= 1) {
      if (/\s|[,.;:!?，。！？；：]/.test(text[i - 1])) return i;
    }
    return max;
  };

  const appendRevealChunk = (node, text) => {
    if (!text) return;
    const span = document.createElement("span");
    span.className = "cities-ai-reveal-chunk";
    span.textContent = text;
    node.append(span);
    if (reducedMotion) {
      span.classList.add("is-visible");
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(() => span.classList.add("is-visible")));
  };

  const createRevealWriter = (node) => {
    let buffer = "";
    let timer = 0;

    const flush = () => {
      timer = 0;
      if (!buffer) return;
      const cut = nextRevealCut(buffer);
      const chunk = buffer.slice(0, cut);
      buffer = buffer.slice(cut);
      appendRevealChunk(node, chunk);
      if (buffer) timer = window.setTimeout(flush, reducedMotion ? 0 : 48);
    };

    return {
      push(text) {
        buffer += String(text || "");
        if (!timer) timer = window.setTimeout(flush, reducedMotion ? 0 : 48);
      },
      async close() {
        if (timer) {
          window.clearTimeout(timer);
          timer = 0;
        }
        while (buffer) {
          const cut = nextRevealCut(buffer);
          appendRevealChunk(node, buffer.slice(0, cut));
          buffer = buffer.slice(cut);
          if (buffer && !reducedMotion) await wait(24);
        }
      }
    };
  };

  const animateFullAnswer = async (node, text, isCurrent) => {
    node.replaceChildren();
    let remaining = String(text || "");
    while (remaining) {
      if (!isCurrent()) return false;
      const cut = nextRevealCut(remaining, 30, 10);
      appendRevealChunk(node, remaining.slice(0, cut));
      remaining = remaining.slice(cut);
      if (!reducedMotion) await wait(42);
    }
    return true;
  };

  const parseSSEBlock = (block) => {
    let event = "message";
    const data = [];
    block.split("\n").forEach((line) => {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
    });
    return { event, data: data.join("\n") };
  };

  const consumeGalokStream = async (response, onDelta) => {
    if (!response.body) throw new GalokAIError(friendlyError("NETWORK_ERROR"), "NETWORK_ERROR");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";

    const handleBlock = (rawBlock) => {
      const block = rawBlock.trim();
      if (!block) return;
      const packet = parseSSEBlock(block);
      if (!packet.data) return;

      let data = {};
      try {
        data = JSON.parse(packet.data);
      } catch {
        return;
      }

      if (packet.event === "delta") {
        const text = String(data.text || "");
        if (!text) return;
        answer += text;
        onDelta(text);
        return;
      }

      if (packet.event === "error") {
        const code = String(data.code || "PROVIDER_ERROR");
        throw new GalokAIError(data.message || friendlyError(code), code, data.retryable !== false);
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done }).replace(/\r\n/g, "\n");

      let separator = buffer.indexOf("\n\n");
      while (separator !== -1) {
        const block = buffer.slice(0, separator);
        buffer = buffer.slice(separator + 2);
        handleBlock(block);
        separator = buffer.indexOf("\n\n");
      }

      if (done) break;
    }

    if (buffer.trim()) handleBlock(buffer);
    return answer;
  };

  const makeShareExcerpt = (text, max = 520) => {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    const sample = clean.slice(0, max + 1);
    let cut = Math.max(
      sample.lastIndexOf("。"),
      sample.lastIndexOf("！"),
      sample.lastIndexOf("？"),
      sample.lastIndexOf(". "),
      sample.lastIndexOf("! "),
      sample.lastIndexOf("? ")
    );
    if (cut < Math.floor(max * .55)) cut = sample.lastIndexOf(" ", max);
    if (cut < Math.floor(max * .45)) cut = max;
    return `${sample.slice(0, cut + 1).trim()}…`;
  };

  const wrapCanvasText = (ctx, text, maxWidth) => {
    const paragraphs = String(text || "").split(/\n+/);
    const lines = [];

    paragraphs.forEach((paragraph, paragraphIndex) => {
      if (!paragraph) {
        lines.push("");
        return;
      }
      let line = "";
      for (const char of Array.from(paragraph)) {
        const test = line + char;
        if (line && ctx.measureText(test).width > maxWidth) {
          lines.push(line.trimEnd());
          line = char;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line.trimEnd());
      if (paragraphIndex < paragraphs.length - 1) lines.push("");
    });

    return lines;
  };

  const createShareCard = async ({ city, question, answer }) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable.");

    const explicitTheme = document.documentElement.dataset.theme;
    const dark = explicitTheme === "dark" || (explicitTheme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const bg = dark ? "#000000" : "#ffffff";
    const ink = dark ? "#f0f0f0" : "#0d0d0d";
    const muted = dark ? "#8f8f8f" : "#707070";
    const line = dark ? "#2d2d2d" : "#dedede";
    const left = 76;
    const right = 1004;
    const width = right - left;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "top";

    ctx.fillStyle = ink;
    ctx.font = '700 31px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    ctx.fillText("GALOK", left, 72);

    ctx.textAlign = "right";
    ctx.fillStyle = muted;
    ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    ctx.fillText("AI / CITIES", right, 80);
    ctx.textAlign = "left";

    ctx.fillStyle = muted;
    ctx.font = '650 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    ctx.fillText(String(city || "CITY").toUpperCase(), left, 184);

    ctx.fillStyle = ink;
    ctx.font = '650 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    const questionLines = wrapCanvasText(ctx, question, width).slice(0, 4);
    let y = 242;
    questionLines.forEach((lineText) => {
      ctx.fillText(lineText, left, y);
      y += 76;
    });

    y += 32;
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    y += 48;

    const excerpt = makeShareExcerpt(answer);
    ctx.fillStyle = ink;
    ctx.font = '400 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    const answerLines = wrapCanvasText(ctx, excerpt, width).slice(0, 13);
    const answerBottom = 1174;
    answerLines.forEach((lineText, index) => {
      if (y > answerBottom) return;
      const isLastVisible = index === 12 && answerLines.length > 13;
      ctx.fillText(isLastVisible ? `${lineText}…` : lineText, left, y);
      y += 55;
    });

    ctx.fillStyle = muted;
    ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    ctx.fillText("GALOK AI", left, 1240);
    ctx.textAlign = "right";
    ctx.fillText("galok.me", right, 1240);
    ctx.textAlign = "left";

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not create share image.")), "image/png", 1);
    });

    return blob;
  };

  const saveBlob = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
  };

  const openShareSheet = async ({ city, question, answer }) => {
    const blob = await createShareCard({ city, question, answer });
    const url = URL.createObjectURL(blob);
    const filename = `galok-ai-${String(city || "city").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

    const sheet = document.createElement("div");
    sheet.className = "galok-ai-share-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", "Share Galok AI answer");
    sheet.innerHTML = `
      <button class="galok-ai-share-sheet__scrim" type="button" data-share-close aria-label="Close share preview"></button>
      <div class="galok-ai-share-sheet__panel">
        <div class="galok-ai-share-sheet__head">
          <div><strong>Share answer</strong><span>1080 × 1350 · PNG</span></div>
          <button type="button" data-share-close aria-label="Close">×</button>
        </div>
        <div class="galok-ai-share-sheet__preview"><img alt="Galok AI share card preview"></div>
        <div class="galok-ai-share-sheet__actions">
          <button type="button" data-share-native>Share</button>
          <button type="button" data-share-save>Save image</button>
        </div>
      </div>`;

    sheet.querySelector("img").src = url;
    document.body.append(sheet);
    requestAnimationFrame(() => sheet.classList.add("is-open"));

    const cleanup = () => {
      sheet.classList.remove("is-open");
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
        sheet.remove();
      }, reducedMotion ? 0 : 180);
      document.removeEventListener("keydown", onKeydown);
    };

    const onKeydown = (event) => {
      if (event.key === "Escape") cleanup();
    };

    sheet.querySelectorAll("[data-share-close]").forEach((button) => button.addEventListener("click", cleanup));
    sheet.querySelector("[data-share-save]").addEventListener("click", () => saveBlob(url, filename));
    sheet.querySelector("[data-share-native]").addEventListener("click", async () => {
      const file = new File([blob], filename, { type: "image/png" });
      try {
        if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
          await navigator.share({ files: [file], title: `Galok AI · ${city}` });
        } else {
          saveBlob(url, filename);
        }
      } catch (error) {
        if (error?.name !== "AbortError") saveBlob(url, filename);
      }
    });
    document.addEventListener("keydown", onKeydown);
  };

  const mount = () => {
    const section = document.querySelector("[data-cities-conversation]");
    if (!section || section.dataset.liveAiReady === "true") return Boolean(section);

    const prompt = section.querySelector(".cities-conversation__prompt");
    const label = section.querySelector(".cities-conversation__label");
    const select = section.querySelector("#cities-conversation-select");
    const askButton = section.querySelector("[data-cities-ask]");
    const answerSlot = section.querySelector("[data-cities-answer]");
    const hint = section.querySelector(".cities-conversation__hint");
    if (!prompt || !label || !select || !askButton || !answerSlot) return false;

    section.dataset.liveAiReady = "true";
    section.classList.add("cities-ai-live");

    const input = document.createElement("input");
    input.className = "cities-ai-input";
    input.dataset.citiesAiInput = "";
    input.type = "text";
    input.maxLength = MAX_QUESTION;
    input.autocomplete = "off";
    input.spellcheck = true;
    input.setAttribute("aria-label", "Ask Galok a question about the selected city");

    const updatePlaceholder = () => {
      const cityName = select.options[select.selectedIndex]?.textContent?.trim() || "this city";
      input.placeholder = `Ask about ${cityName}…`;
    };

    label.textContent = "Ask Galok";
    label.setAttribute("for", input.id = "cities-ai-question");
    prompt.insertBefore(input, askButton);
    updatePlaceholder();

    if (hint) {
      hint.innerHTML = "AI-generated answers may be inaccurate. Galok does not save this as chat history; your question is sent to the AI provider for processing.";
    }

    const getResponseSlot = () => answerSlot.querySelector("[data-cities-followups]") || answerSlot;

    const setBusy = (busy) => {
      input.disabled = busy;
      askButton.disabled = busy;
      askButton.classList.toggle("is-ai-thinking", busy);
      askButton.setAttribute("aria-busy", String(busy));
      section.classList.toggle("is-ai-thinking", busy);
    };

    const renderLoading = (slot, question, cityName) => {
      slot.innerHTML = `
        <section class="cities-ai-response is-loading" data-cities-ai-response aria-live="polite">
          <div class="cities-ai-response__meta"><span>GALOK AI</span><span></span></div>
          <p class="cities-ai-response__question"></p>
          <div class="cities-ai-response__thinking"><span></span>Preparing an answer…</div>
          <div class="cities-ai-response__answer" data-ai-answer></div>
          <div class="cities-ai-response__actions" data-ai-actions hidden>
            <button type="button" data-ai-copy>Copy</button>
            <button type="button" data-ai-share>Share</button>
            <button type="button" data-ai-close>Close</button>
          </div>
          <p class="cities-ai-response__notice" data-ai-notice hidden>AI-generated answer. It may be inaccurate.</p>
        </section>`;

      const response = slot.querySelector("[data-cities-ai-response]");
      response.querySelector(".cities-ai-response__meta span:last-child").textContent = cityName;
      response.querySelector(".cities-ai-response__question").textContent = question;
      return response;
    };

    const beginStreaming = (response) => {
      if (!response || response.classList.contains("is-streaming")) return;
      response.classList.remove("is-loading");
      response.classList.add("is-streaming");
      const thinking = response.querySelector(".cities-ai-response__thinking");
      if (thinking) {
        thinking.classList.add("is-leaving");
        window.setTimeout(() => thinking.remove(), reducedMotion ? 0 : 130);
      }
    };

    const finishAnswer = (response) => {
      response?.classList.remove("is-loading", "is-streaming");
      response?.classList.add("is-complete");
      response?.querySelector(".cities-ai-response__thinking")?.remove();
      const actions = response?.querySelector("[data-ai-actions]");
      const notice = response?.querySelector("[data-ai-notice]");
      if (actions) actions.hidden = false;
      if (notice) notice.hidden = false;
    };

    const renderError = (slot, question, message, code = "UNKNOWN") => {
      slot.innerHTML = `
        <section class="cities-ai-response is-error" data-cities-ai-response>
          <div class="cities-ai-response__meta"><span>GALOK AI</span><span>Error</span></div>
          <p class="cities-ai-response__question"></p>
          <p class="cities-ai-response__answer"></p>
          <div class="cities-ai-response__actions">
            <button type="button" data-ai-retry>Try again</button>
            <button type="button" data-ai-close>Close</button>
          </div>
        </section>`;
      const response = slot.querySelector("[data-cities-ai-response]");
      response.dataset.errorCode = code;
      response.querySelector(".cities-ai-response__question").textContent = question;
      response.querySelector(".cities-ai-response__answer").textContent = message;
      return response;
    };

    const askAI = async (question, options = {}) => {
      const cleanQuestion = String(question || "").trim();
      if (!cleanQuestion) {
        input.focus({ preventScroll: true });
        return;
      }

      activeController?.abort();
      activeController = new AbortController();

      const city = select.value;
      const cityName = select.options[select.selectedIndex]?.textContent?.trim() || city;
      const token = ++requestToken;
      const isCurrent = () => token === requestToken;
      const slot = getResponseSlot();
      const previousQuestion = cleanQuestion;

      setBusy(true);
      let responseView = renderLoading(slot, cleanQuestion, cityName);
      let answerText = "";
      let usedStreaming = false;

      try {
        for (let attempt = 0; attempt < 2; attempt += 1) {
          const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": `${STREAM_MIME}, application/json` },
            cache: "no-store",
            signal: activeController.signal,
            body: JSON.stringify({ city, question: cleanQuestion })
          });

          if (!isCurrent()) return;
          const contentType = response.headers.get("content-type") || "";
          usedStreaming = contentType.includes(STREAM_MIME);
          answerText = "";

          if (usedStreaming) {
            if (!response.ok) {
              const data = await response.json().catch(() => ({}));
              throw classifyResponseError(response, data);
            }

            const answerNode = responseView.querySelector("[data-ai-answer]");
            const writer = createRevealWriter(answerNode);
            let started = false;
            answerText = await consumeGalokStream(response, (delta) => {
              if (!isCurrent()) return;
              if (!started) {
                started = true;
                beginStreaming(responseView);
              }
              writer.push(delta);
            });
            await writer.close();

            if (answerText.trim()) break;
            if (attempt === 0) {
              responseView = renderLoading(slot, cleanQuestion, cityName);
              await wait(300);
              continue;
            }
            throw new GalokAIError(friendlyError("EMPTY_RESPONSE"), "EMPTY_RESPONSE");
          }

          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            const error = classifyResponseError(response, data);
            if (error.code === "EMPTY_RESPONSE" && attempt === 0) {
              await wait(300);
              continue;
            }
            throw error;
          }

          answerText = String(data.answer || "").trim();
          if (!answerText) {
            if (attempt === 0) {
              await wait(300);
              continue;
            }
            throw new GalokAIError(friendlyError("EMPTY_RESPONSE"), "EMPTY_RESPONSE");
          }

          beginStreaming(responseView);
          const animated = await animateFullAnswer(responseView.querySelector("[data-ai-answer]"), answerText, isCurrent);
          if (!animated) return;
          break;
        }

        if (!isCurrent()) return;
        if (!answerText.trim()) throw new GalokAIError(friendlyError("EMPTY_RESPONSE"), "EMPTY_RESPONSE");

        finishAnswer(responseView);
        responseView.dataset.cityName = cityName;
        responseView.dataset.question = cleanQuestion;
        responseView.dataset.answer = answerText;
        if (!options.keepInput) input.value = "";
      } catch (error) {
        if (!isCurrent() || error?.name === "AbortError") return;
        const normalized = error instanceof GalokAIError
          ? error
          : new GalokAIError(friendlyError("NETWORK_ERROR"), "NETWORK_ERROR");
        renderError(slot, cleanQuestion, normalized.message, normalized.code);
        const retry = slot.querySelector("[data-ai-retry]");
        retry?.addEventListener("click", () => askAI(previousQuestion, { keepInput: true }), { once: true });
      } finally {
        if (isCurrent()) {
          setBusy(false);
          activeController = null;
        }
      }
    };

    prompt.addEventListener("click", (event) => {
      const button = event.target.closest("[data-cities-ask]");
      if (!button) return;
      const question = input.value.trim();
      if (!question) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      askAI(question);
    }, true);

    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      if (!askButton.disabled) askAI(input.value);
    });

    select.addEventListener("change", updatePlaceholder);

    answerSlot.addEventListener("click", async (event) => {
      const questionButton = event.target.closest("[data-question]");
      if (questionButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        answerSlot.querySelectorAll("[data-question]").forEach((item) => item.classList.toggle("is-active", item === questionButton));
        askAI(questionButton.textContent.trim(), { keepInput: true });
        return;
      }

      const response = event.target.closest("[data-cities-ai-response]");

      if (event.target.closest("[data-ai-copy]")) {
        const text = response?.querySelector("[data-ai-answer]")?.textContent?.trim();
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
          const copy = event.target.closest("[data-ai-copy]");
          const original = copy.textContent;
          copy.textContent = "Copied";
          window.setTimeout(() => { copy.textContent = original; }, 1200);
        } catch {}
        return;
      }

      if (event.target.closest("[data-ai-share]")) {
        const answer = response?.querySelector("[data-ai-answer]")?.textContent?.trim();
        const question = response?.dataset.question || response?.querySelector(".cities-ai-response__question")?.textContent?.trim();
        const city = response?.dataset.cityName || response?.querySelector(".cities-ai-response__meta span:last-child")?.textContent?.trim();
        if (!answer || !question || !city) return;
        const button = event.target.closest("[data-ai-share]");
        button.disabled = true;
        try {
          await openShareSheet({ city, question, answer });
        } finally {
          button.disabled = false;
        }
        return;
      }

      if (event.target.closest("[data-ai-close]")) {
        requestToken += 1;
        activeController?.abort();
        activeController = null;
        setBusy(false);
        response?.remove();
      }
    }, true);

    return true;
  };

  if (mount()) return;
  const observer = new MutationObserver(() => {
    if (!mount()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
