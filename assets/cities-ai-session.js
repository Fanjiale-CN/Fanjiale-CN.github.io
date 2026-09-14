(() => {
  "use strict";

  if (location.pathname.replace(/index\.html$/, "") !== "/cities/") return;

  const API_URL = "/api/ask";
  const MAX_QUESTION = 600;
  const MAX_TURNS = 10;
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
      case "VISITOR_MINUTE_LIMIT":
        return "You’re asking a little too quickly. Try again in a minute.";
      case "VISITOR_DAILY_LIMIT":
        return "You’ve reached today’s Galok AI limit. Come back tomorrow.";
      case "GLOBAL_DAILY_LIMIT":
        return "Galok AI has reached today’s public usage limit. It will be back tomorrow.";
      case "PROVIDER_RATE_LIMITED":
      case "RATE_LIMITED":
        return "Galok AI is busy right now. Try again in a moment.";
      case "TIMEOUT":
        return "This answer took longer than expected. Try again.";
      case "NETWORK_ERROR":
        return "Connection interrupted. Check your connection and try again.";
      case "EMPTY_RESPONSE":
        return "Galok AI couldn’t complete this answer. Try again.";
      case "PROVIDER_BILLING_UNAVAILABLE":
        return "Galok AI is temporarily offline.";
      case "PROVIDER_ERROR":
      case "PROVIDER_AUTH_ERROR":
        return "The AI provider is temporarily unavailable.";
      case "INVALID_REQUEST":
        return "Galok AI couldn’t process this question.";
      default:
        return "Galok AI is temporarily unavailable.";
    }
  };

  const classifyResponseError = (response, data = {}) => {
    const code = String(data?.code || "");
    if (code) return new GalokAIError(data?.error || data?.message || friendlyError(code), code, data?.retryable !== false);

    const upstreamStatus = Number(data?.upstream_status || 0);
    const raw = String(data?.error || "").toLowerCase();
    if (response.status === 429 || upstreamStatus === 429) return new GalokAIError(friendlyError("RATE_LIMITED"), "RATE_LIMITED");
    if (response.status === 408 || upstreamStatus === 408 || raw.includes("timeout") || raw.includes("too long")) return new GalokAIError(friendlyError("TIMEOUT"), "TIMEOUT");
    if (raw.includes("empty response") || raw.includes("empty")) return new GalokAIError(friendlyError("EMPTY_RESPONSE"), "EMPTY_RESPONSE");
    if (response.status >= 500 || upstreamStatus >= 500) return new GalokAIError(friendlyError("PROVIDER_ERROR"), "PROVIDER_ERROR");
    if (response.status >= 400) return new GalokAIError(friendlyError("INVALID_REQUEST"), "INVALID_REQUEST", false);
    return new GalokAIError(friendlyError("UNKNOWN"), "UNKNOWN");
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
      try { data = JSON.parse(packet.data); } catch { return; }

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

  const wrapCanvasText = (ctx, text, maxWidth) => {
    const lines = [];
    const paragraphs = String(text || "").replace(/\r/g, "").split("\n");
    paragraphs.forEach((paragraph, paragraphIndex) => {
      if (!paragraph) {
        lines.push("");
      } else {
        let line = "";
        for (const char of Array.from(paragraph)) {
          const next = line + char;
          if (line && ctx.measureText(next).width > maxWidth) {
            lines.push(line.trimEnd());
            line = char;
          } else {
            line = next;
          }
        }
        if (line) lines.push(line.trimEnd());
      }
      if (paragraphIndex < paragraphs.length - 1) lines.push("");
    });
    return lines;
  };

  const saveBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  };

  const filenamePart = (value) => String(value || "city").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "city";

  const createConversationImage = async ({ city, turns }) => {
    const width = 1600;
    const left = 112;
    const right = width - 112;
    const maxWidth = right - left;
    const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';

    const measureCanvas = document.createElement("canvas");
    measureCanvas.width = width;
    measureCanvas.height = 1;
    const measure = measureCanvas.getContext("2d");
    if (!measure) throw new Error("Canvas is unavailable.");

    let bodySize = 25;
    let lineHeight = 38;
    const buildLayout = () => {
      const blocks = [];
      let height = 250;
      turns.forEach((turn) => {
        measure.font = `700 22px ${fontFamily}`;
        const userLabelHeight = 34;
        measure.font = `500 ${bodySize}px ${fontFamily}`;
        const userLines = wrapCanvasText(measure, turn.question, maxWidth);
        const userHeight = Math.max(lineHeight, userLines.length * lineHeight);
        measure.font = `700 22px ${fontFamily}`;
        const aiLabelHeight = 34;
        measure.font = `400 ${bodySize}px ${fontFamily}`;
        const aiLines = wrapCanvasText(measure, turn.answer, maxWidth);
        const aiHeight = Math.max(lineHeight, aiLines.length * lineHeight);
        blocks.push({ userLines, aiLines });
        height += userLabelHeight + userHeight + 30 + aiLabelHeight + aiHeight + 62;
      });
      height += 120;
      return { blocks, height };
    };

    let layout = buildLayout();
    if (layout.height > 15000) {
      bodySize = 20;
      lineHeight = 31;
      layout = buildLayout();
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = Math.max(900, Math.ceil(layout.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable.");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);
    ctx.textBaseline = "top";

    ctx.fillStyle = "#111111";
    ctx.font = `700 34px ${fontFamily}`;
    ctx.fillText("GALOK AI / CITIES", left, 86);

    ctx.fillStyle = "#666666";
    ctx.font = `600 22px ${fontFamily}`;
    ctx.fillText(`${String(city || "City")} · ${turns.length} / ${MAX_TURNS} turns`, left, 140);

    let y = 220;
    layout.blocks.forEach((block, index) => {
      ctx.fillStyle = "#111111";
      ctx.font = `700 22px ${fontFamily}`;
      ctx.fillText("user", left, y);
      y += 34;
      ctx.font = `500 ${bodySize}px ${fontFamily}`;
      block.userLines.forEach((line) => {
        ctx.fillText(line, left, y);
        y += lineHeight;
      });

      y += 30;
      ctx.font = `700 22px ${fontFamily}`;
      ctx.fillText("galok ai", left, y);
      y += 34;
      ctx.font = `400 ${bodySize}px ${fontFamily}`;
      block.aiLines.forEach((line) => {
        ctx.fillText(line, left, y);
        y += lineHeight;
      });

      if (index < layout.blocks.length - 1) {
        y += 30;
        ctx.strokeStyle = "#d7d7d7";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();
      }
      y += 32;
    });

    ctx.fillStyle = "#777777";
    ctx.font = `600 20px ${fontFamily}`;
    ctx.fillText("galok.me", left, canvas.height - 92);

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create conversation image.")), "image/png", 1);
    });
  };

  const mount = () => {
    const section = document.querySelector("[data-cities-conversation]");
    if (!section || section.dataset.aiSessionReady === "true") return Boolean(section);

    const inner = section.querySelector(".cities-conversation__inner");
    const eyebrow = section.querySelector(".cities-conversation__eyebrow");
    const prompt = section.querySelector(".cities-conversation__prompt");
    const label = section.querySelector(".cities-conversation__label");
    const select = section.querySelector("#cities-conversation-select");
    const askButton = section.querySelector("[data-cities-ask]");
    const transcript = section.querySelector("[data-cities-answer]");
    const hint = section.querySelector(".cities-conversation__hint");
    if (!inner || !prompt || !label || !select || !askButton || !transcript) return false;

    section.dataset.aiSessionReady = "true";
    section.dataset.liveAiReady = "true";
    section.classList.add("cities-ai-session");

    const input = document.createElement("input");
    input.className = "cities-ai-input";
    input.id = "cities-ai-question";
    input.type = "text";
    input.maxLength = MAX_QUESTION;
    input.autocomplete = "off";
    input.spellcheck = true;
    input.setAttribute("aria-label", "Ask Galok a question about the selected city");

    const toolbar = document.createElement("div");
    toolbar.className = "cities-ai-session__toolbar";
    toolbar.innerHTML = `
      <span class="cities-ai-session__count" data-session-count>0 / ${MAX_TURNS}</span>
      <div class="cities-ai-session__exports" data-session-exports hidden>
        <button type="button" data-export-image>Long image</button>
        <button type="button" data-export-md>MD</button>
      </div>`;

    if (eyebrow) eyebrow.after(toolbar);
    else inner.prepend(toolbar);

    transcript.className = "cities-ai-session__transcript";
    transcript.setAttribute("aria-live", "polite");
    transcript.setAttribute("aria-label", "Galok AI conversation");
    transcript.innerHTML = `
      <div class="cities-ai-session__empty" data-session-empty>
        <strong>Ask about ${select.options[select.selectedIndex]?.textContent?.trim() || "this city"}</strong>
        <span>Follow up naturally. This session keeps up to ${MAX_TURNS} turns.</span>
      </div>`;

    prompt.before(transcript);
    label.textContent = "Ask Galok";
    label.setAttribute("for", input.id);
    prompt.insertBefore(input, askButton);

    const arrowMarkup = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 19V5"></path>
        <path d="m6.5 10.5 5.5-5.5 5.5 5.5"></path>
      </svg>`;
    askButton.innerHTML = arrowMarkup;
    askButton.setAttribute("aria-label", "Send question");

    if (hint) {
      hint.textContent = "Up to 10 turns. Galok does not save this chat history; recent messages are sent to the AI provider to keep replies coherent. Refresh the page to start over.";
    }

    const turns = [];
    let sessionCity = select.value;
    let followTail = true;

    const countNode = toolbar.querySelector("[data-session-count]");
    const exportsNode = toolbar.querySelector("[data-session-exports]");
    const exportImageButton = toolbar.querySelector("[data-export-image]");
    const exportMdButton = toolbar.querySelector("[data-export-md]");

    const cityName = () => select.options[select.selectedIndex]?.textContent?.trim() || select.value;
    const updatePlaceholder = () => { input.placeholder = `Ask about ${cityName()}…`; };

    const updateCount = () => {
      countNode.textContent = `${turns.length} / ${MAX_TURNS}`;
      exportsNode.hidden = turns.length === 0;
    };

    const scrollToBottom = (behavior = "smooth") => {
      transcript.scrollTo({ top: transcript.scrollHeight, behavior: reducedMotion ? "auto" : behavior });
    };

    transcript.addEventListener("scroll", () => {
      followTail = transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight < 120;
    }, { passive: true });

    const ensureTail = () => {
      if (followTail) requestAnimationFrame(() => scrollToBottom("smooth"));
    };

    const setBusy = (busy) => {
      input.disabled = busy;
      select.disabled = busy;
      askButton.disabled = busy;
      askButton.classList.toggle("is-ai-thinking", busy);
      askButton.setAttribute("aria-busy", String(busy));
      section.classList.toggle("is-ai-thinking", busy);
    };

    const clearLimitNotice = () => transcript.querySelector("[data-session-limit]")?.remove();

    const renderLimitNotice = () => {
      clearLimitNotice();
      const notice = document.createElement("div");
      notice.className = "cities-ai-session__limit";
      notice.dataset.sessionLimit = "";
      notice.innerHTML = `<strong>10-turn limit reached.</strong><span>Start a new conversation by refreshing this page.</span><button type="button">Refresh</button>`;
      notice.querySelector("button").addEventListener("click", () => location.reload());
      transcript.append(notice);
      followTail = true;
      scrollToBottom();
    };

    const historyPayload = () => turns.flatMap((turn) => ([
      { role: "user", content: turn.question },
      { role: "assistant", content: turn.answer }
    ]));

    const createTurnView = (question) => {
      transcript.querySelector("[data-session-empty]")?.remove();
      clearLimitNotice();

      const turn = document.createElement("article");
      turn.className = "cities-ai-session__turn";
      turn.innerHTML = `
        <div class="cities-ai-session__message cities-ai-session__message--user">
          <span>USER</span>
          <p></p>
        </div>
        <div class="cities-ai-session__message cities-ai-session__message--ai">
          <span>GALOK AI</span>
          <div class="cities-ai-session__thinking"><i></i>Preparing an answer…</div>
          <div class="cities-ai-session__answer" data-session-answer></div>
          <div class="cities-ai-session__error" data-session-error hidden></div>
        </div>`;
      turn.querySelector(".cities-ai-session__message--user p").textContent = question;
      transcript.append(turn);
      followTail = true;
      scrollToBottom("auto");
      return turn;
    };

    const startStreaming = (turn) => {
      turn.classList.add("is-streaming");
      turn.querySelector(".cities-ai-session__thinking")?.remove();
    };

    const appendDelta = (node, text) => {
      node.append(document.createTextNode(text));
      ensureTail();
    };

    const renderTurnError = (turn, message, retry) => {
      turn.classList.remove("is-streaming");
      turn.querySelector(".cities-ai-session__thinking")?.remove();
      const error = turn.querySelector("[data-session-error]");
      error.hidden = false;
      error.replaceChildren();
      const text = document.createElement("span");
      text.textContent = message;
      error.append(text);
      if (retry) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Try again";
        button.addEventListener("click", retry, { once: true });
        error.append(button);
      }
      followTail = true;
      scrollToBottom();
    };

    const askAI = async (question, options = {}) => {
      const cleanQuestion = String(question || "").trim();
      if (!cleanQuestion) {
        input.focus({ preventScroll: true });
        return;
      }

      if (turns.length >= MAX_TURNS) {
        renderLimitNotice();
        return;
      }

      activeController?.abort();
      activeController = new AbortController();
      const token = ++requestToken;
      const isCurrent = () => token === requestToken;
      const city = select.value;
      const currentCityName = cityName();
      const turnView = options.turnView || createTurnView(cleanQuestion);
      const answerNode = turnView.querySelector("[data-session-answer]");
      answerNode.textContent = "";
      turnView.querySelector("[data-session-error]")?.setAttribute("hidden", "");
      if (!turnView.querySelector(".cities-ai-session__thinking")) {
        const thinking = document.createElement("div");
        thinking.className = "cities-ai-session__thinking";
        thinking.innerHTML = "<i></i>Preparing an answer…";
        answerNode.before(thinking);
      }

      setBusy(true);
      if (!options.keepInput) input.value = "";
      let answerText = "";
      let started = false;

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": `${STREAM_MIME}, application/json` },
          cache: "no-store",
          signal: activeController.signal,
          body: JSON.stringify({ city, question: cleanQuestion, history: historyPayload() })
        });

        if (!isCurrent()) return;
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes(STREAM_MIME)) {
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw classifyResponseError(response, data);
          }
          answerText = await consumeGalokStream(response, (delta) => {
            if (!isCurrent()) return;
            if (!started) {
              started = true;
              startStreaming(turnView);
            }
            appendDelta(answerNode, delta);
          });
        } else {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw classifyResponseError(response, data);
          answerText = String(data.answer || "").trim();
          if (answerText) {
            started = true;
            startStreaming(turnView);
            answerNode.textContent = answerText;
          }
        }

        if (!isCurrent()) return;
        if (!answerText.trim()) throw new GalokAIError(friendlyError("EMPTY_RESPONSE"), "EMPTY_RESPONSE");

        turnView.classList.remove("is-streaming");
        turnView.classList.add("is-complete");
        turns.push({ city, cityName: currentCityName, question: cleanQuestion, answer: answerText.trim() });
        updateCount();
        followTail = true;
        scrollToBottom();
      } catch (error) {
        if (!isCurrent() || error?.name === "AbortError") return;
        const normalized = error instanceof GalokAIError ? error : new GalokAIError(friendlyError("NETWORK_ERROR"), "NETWORK_ERROR");
        renderTurnError(turnView, normalized.message, normalized.retryable ? () => askAI(cleanQuestion, { keepInput: true, turnView }) : null);
      } finally {
        if (isCurrent()) {
          setBusy(false);
          activeController = null;
        }
      }
    };

    const resetConversation = () => {
      requestToken += 1;
      activeController?.abort();
      activeController = null;
      turns.splice(0, turns.length);
      transcript.innerHTML = `
        <div class="cities-ai-session__empty" data-session-empty>
          <strong>Ask about ${cityName()}</strong>
          <span>Follow up naturally. This session keeps up to ${MAX_TURNS} turns.</span>
        </div>`;
      updateCount();
      setBusy(false);
      followTail = true;
    };

    prompt.addEventListener("click", (event) => {
      const button = event.target.closest("[data-cities-ask]");
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      askAI(input.value);
    }, true);

    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      if (!askButton.disabled) askAI(input.value);
    });

    select.addEventListener("keydown", (event) => {
      if (event.key === "Enter") event.stopImmediatePropagation();
    }, true);

    select.addEventListener("change", () => {
      updatePlaceholder();
      if (select.value !== sessionCity) {
        sessionCity = select.value;
        resetConversation();
      }
    });

    exportMdButton.addEventListener("click", () => {
      if (!turns.length) return;
      const lines = ["# GALOK AI / CITIES", "", `City: ${turns[0].cityName}`, ""];
      turns.forEach((turn) => {
        lines.push(`user：${turn.question}`, "", `galok ai：${turn.answer}`, "");
      });
      const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
      saveBlob(blob, `galok-ai-${filenamePart(turns[0].cityName)}-conversation.md`);
    });

    exportImageButton.addEventListener("click", async () => {
      if (!turns.length || exportImageButton.disabled) return;
      exportImageButton.disabled = true;
      const original = exportImageButton.textContent;
      exportImageButton.textContent = "Preparing…";
      try {
        const blob = await createConversationImage({ city: turns[0].cityName, turns });
        saveBlob(blob, `galok-ai-${filenamePart(turns[0].cityName)}-conversation.png`);
      } catch {
        exportImageButton.textContent = "Image failed";
        await wait(1200);
      } finally {
        exportImageButton.disabled = false;
        exportImageButton.textContent = original;
      }
    });

    updatePlaceholder();
    updateCount();
    return true;
  };

  if (mount()) return;
  const observer = new MutationObserver(() => {
    if (!mount()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
