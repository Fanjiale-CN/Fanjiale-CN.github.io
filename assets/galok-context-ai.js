(() => {
  "use strict";

  if (window.__GALOK_CONTEXT_AI__) return;
  window.__GALOK_CONTEXT_AI__ = true;

  const API = "/api/ask";
  const MAX_QUESTION = 600;
  const MAX_CONTEXT = 10000;
  const MAX_SELECTION = 1600;
  const route = window.location.pathname.replace(/index\.html$/, "");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const detectSurface = () => {
    if (/^\/essays\/[^/]+\/?$/.test(route)) return "essay";
    if (/^\/research\/[^/]+\/?$/.test(route)) return "research";
    if (route.startsWith("/reading/") && route !== "/reading/") return "reading";
    return null;
  };

  const surface = detectSurface();
  if (!surface) return;

  const ROOT_SELECTORS = {
    essay: [".article-content", ".batch-article-content", "main article", "article"],
    research: ["[data-research-manuscript]", ".research-manuscript", "main article", "article"],
    reading: [".dj-prose", "[data-reading-entry]", ".reading-prose", "main article", "main"]
  };

  const root = ROOT_SELECTORS[surface].map((selector) => document.querySelector(selector)).find(Boolean);
  if (!root) return;

  const text = (value, limit = Infinity) => String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, limit);

  const pageTitle = text(document.querySelector("h1")?.textContent || document.title, 240);
  const headings = [...root.querySelectorAll("h2, h3")];
  let selectedPassage = "";
  let currentHeading = "";
  let currentHeadingNode = null;
  let activeController = null;
  let requestSerial = 0;

  const labels = {
    essay: { eyebrow: "ESSAY", empty: "Ask about this essay", chip: "Essay" },
    research: { eyebrow: "RESEARCH", empty: "Ask about this research", chip: "Research" },
    reading: { eyebrow: "READING", empty: "Ask while you read", chip: "Reading" }
  }[surface];

  const shell = document.createElement("section");
  shell.className = "galok-context-ai";
  shell.dataset.surface = surface;
  shell.innerHTML = `
    <button class="galok-context-ai__launcher" type="button" aria-expanded="false" aria-controls="galok-context-ai-panel">
      <span class="galok-context-ai__launcher-mark" aria-hidden="true">G</span>
      <span class="galok-context-ai__launcher-copy"><b>ASK GALOK</b><small data-gca-launcher-state>${labels.chip} · this page</small></span>
      <span class="galok-context-ai__launcher-arrow" aria-hidden="true">↗</span>
    </button>
    <div class="galok-context-ai__panel" id="galok-context-ai-panel" role="dialog" aria-label="Galok AI" aria-modal="false" hidden>
      <header class="galok-context-ai__head">
        <div class="galok-context-ai__identity">
          <span class="galok-context-ai__mark" aria-hidden="true">G</span>
          <div><b>GALOK AI</b><small>${labels.eyebrow} / CONTEXT LAYER</small></div>
        </div>
        <button class="galok-context-ai__close" type="button" aria-label="Close Galok AI">×</button>
      </header>
      <div class="galok-context-ai__context" data-gca-context>
        <span class="galok-context-ai__context-dot" aria-hidden="true"></span>
        <div><small>READING THIS PAGE</small><b data-gca-context-title>${pageTitle}</b></div>
      </div>
      <div class="galok-context-ai__stage" data-gca-stage>
        <div class="galok-context-ai__welcome" data-gca-welcome>
          <p>${labels.empty}. Galok AI can use the page you are reading, the section on screen, or text you select.</p>
          <div class="galok-context-ai__prompts" data-gca-prompts></div>
        </div>
        <div class="galok-context-ai__exchange" data-gca-exchange hidden>
          <p class="galok-context-ai__question" data-gca-question></p>
          <div class="galok-context-ai__answer" data-gca-answer aria-live="polite"></div>
          <div class="galok-context-ai__answer-actions" data-gca-answer-actions hidden>
            <button type="button" data-gca-copy>Copy</button>
            <button type="button" data-gca-reset>Ask another</button>
          </div>
        </div>
      </div>
      <form class="galok-context-ai__composer" data-gca-form>
        <label class="sr-only" for="galok-context-ai-input">Ask Galok about this page</label>
        <textarea id="galok-context-ai-input" data-gca-input rows="1" maxlength="${MAX_QUESTION}" placeholder="Ask about this page…"></textarea>
        <button class="galok-context-ai__send" type="submit" aria-label="Send question"><span>Ask</span><span aria-hidden="true">↑</span></button>
      </form>
      <footer class="galok-context-ai__foot">AI-generated answers may be inaccurate. Galok does not save this as chat history. Your question and relevant page context are sent to the AI provider.</footer>
    </div>`;

  document.body.append(shell);

  const launcher = shell.querySelector(".galok-context-ai__launcher");
  const launcherState = shell.querySelector("[data-gca-launcher-state]");
  const panel = shell.querySelector(".galok-context-ai__panel");
  const close = shell.querySelector(".galok-context-ai__close");
  const contextBox = shell.querySelector("[data-gca-context]");
  const contextTitle = shell.querySelector("[data-gca-context-title]");
  const welcome = shell.querySelector("[data-gca-welcome]");
  const prompts = shell.querySelector("[data-gca-prompts]");
  const exchange = shell.querySelector("[data-gca-exchange]");
  const questionView = shell.querySelector("[data-gca-question]");
  const answerView = shell.querySelector("[data-gca-answer]");
  const answerActions = shell.querySelector("[data-gca-answer-actions]");
  const form = shell.querySelector("[data-gca-form]");
  const input = shell.querySelector("[data-gca-input]");
  const send = shell.querySelector(".galok-context-ai__send");

  const suggestionSets = {
    essay: ["What is the core argument?", "Explain the section I’m reading", "What should I question here?"],
    research: ["Explain the main finding", "Walk me through the evidence", "What are the key limitations?"],
    reading: ["Explain this passage", "Give me the historical context", "What should I notice here?"]
  };

  const renderPrompts = () => {
    const suggestions = selectedPassage
      ? ["Explain the selected passage", "Put this passage in context", "What is easy to miss here?"]
      : suggestionSets[surface];
    prompts.replaceChildren(...suggestions.map((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => ask(label));
      return button;
    }));
  };

  const openPanel = () => {
    panel.hidden = false;
    shell.classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    document.body.classList.add("galok-context-ai-open");
    window.requestAnimationFrame(() => input.focus({ preventScroll: true }));
  };

  const closePanel = () => {
    panel.hidden = true;
    shell.classList.remove("is-open", "is-loading");
    launcher.setAttribute("aria-expanded", "false");
    document.body.classList.remove("galok-context-ai-open");
    requestSerial += 1;
    activeController?.abort();
    activeController = null;
    input.disabled = false;
    send.disabled = false;
    input.placeholder = "Ask about this page…";
    launcher.focus({ preventScroll: true });
  };

  const isInsideRoot = (node) => node && (node === root || root.contains(node));

  const syncSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !isInsideRoot(selection.anchorNode) || !isInsideRoot(selection.focusNode)) {
      return;
    }
    const next = text(selection.toString(), MAX_SELECTION);
    if (next.length < 12) return;
    selectedPassage = next;
    contextBox.classList.add("has-selection");
    contextBox.querySelector("small").textContent = "SELECTED PASSAGE";
    contextTitle.textContent = next.length > 96 ? `${next.slice(0, 96).trim()}…` : next;
    launcherState.textContent = "Selected passage";
    renderPrompts();
  };

  const currentSection = () => {
    if (!headings.length) return null;
    const threshold = Math.max(140, window.innerHeight * 0.38);
    let candidate = headings[0];
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= threshold) candidate = heading;
      else break;
    }
    return candidate;
  };

  const syncSection = () => {
    if (selectedPassage) return;
    const heading = currentSection();
    if (!heading) return;
    currentHeadingNode = heading;
    currentHeading = text(heading.textContent, 240);
    contextBox.classList.remove("has-selection");
    contextBox.querySelector("small").textContent = "CURRENT SECTION";
    contextTitle.textContent = currentHeading || pageTitle;
    launcherState.textContent = `${labels.chip} · ${currentHeading || "this page"}`;
  };

  const collectSectionText = () => {
    const heading = currentHeadingNode || currentSection();
    if (!heading || !root.contains(heading)) return "";
    const chunks = [text(heading.textContent)];
    let node = heading.nextElementSibling;
    while (node) {
      if (/^H[23]$/.test(node.tagName)) break;
      const value = text(node.innerText || node.textContent);
      if (value) chunks.push(value);
      if (chunks.join("\n\n").length >= 7200) break;
      node = node.nextElementSibling;
    }
    return text(chunks.join("\n\n"), 7600);
  };

  const buildContext = () => {
    const intro = text(root.innerText || root.textContent, 2400);
    const section = collectSectionText();
    const combined = section && !intro.includes(section.slice(0, 160))
      ? `${intro}\n\nCURRENT SECTION:\n${section}`
      : (section || intro);
    return text(combined, MAX_CONTEXT);
  };

  const parseSSE = async (response, onEvent) => {
    if (!response.body) throw new Error("EMPTY_STREAM");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done }).replace(/\r\n/g, "\n");
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const event = block.match(/^event:\s*(.+)$/m)?.[1]?.trim() || "message";
        const dataLine = block.match(/^data:\s*(.+)$/m)?.[1];
        let data = {};
        if (dataLine) {
          try { data = JSON.parse(dataLine); } catch { data = { text: dataLine }; }
        }
        onEvent(event, data);
        boundary = buffer.indexOf("\n\n");
      }
      if (done) break;
    }
  };

  const finishAnswer = () => {
    shell.classList.remove("is-loading");
    input.disabled = false;
    send.disabled = false;
    answerActions.hidden = false;
    input.placeholder = "Ask about this page…";
  };

  const showError = (message) => {
    answerView.textContent = message || "Galok AI could not complete this answer. Try again.";
    answerView.classList.add("is-error");
    finishAnswer();
  };

  async function ask(rawQuestion) {
    const question = text(rawQuestion || input.value, MAX_QUESTION);
    if (!question) return;
    openPanel();
    requestSerial += 1;
    const serial = requestSerial;
    activeController?.abort();
    activeController = new AbortController();

    welcome.hidden = true;
    exchange.hidden = false;
    questionView.textContent = question;
    answerView.textContent = "";
    answerView.classList.remove("is-error");
    answerActions.hidden = true;
    shell.classList.add("is-loading");
    input.value = "";
    input.disabled = true;
    send.disabled = true;
    input.placeholder = "Galok AI is reading…";

    const payload = {
      scope: surface,
      path: route,
      title: pageTitle,
      section: currentHeading || text(currentSection()?.textContent, 240),
      context: buildContext(),
      selection: selectedPassage,
      question,
      language: document.documentElement.lang || "en"
    };

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
        body: JSON.stringify(payload),
        signal: activeController.signal
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/event-stream")) {
        const data = await response.json();
        answerView.textContent = text(data?.answer || data?.text || "");
      } else {
        await parseSSE(response, (event, data) => {
          if (serial !== requestSerial) return;
          if (event === "delta") answerView.textContent += String(data?.text || "");
          if (event === "error") throw new Error(data?.message || "AI provider error");
        });
      }

      if (serial !== requestSerial) return;
      if (!answerView.textContent.trim()) throw new Error("EMPTY_RESPONSE");
      finishAnswer();
    } catch (error) {
      if (error?.name === "AbortError" || serial !== requestSerial) return;
      showError(error?.message === "EMPTY_RESPONSE" ? "Galok AI returned an empty answer. Try again." : error?.message);
    }
  }

  launcher.addEventListener("click", () => panel.hidden ? openPanel() : closePanel());
  close.addEventListener("click", closePanel);
  form.addEventListener("submit", (event) => { event.preventDefault(); ask(); });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(128, input.scrollHeight)}px`;
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  shell.querySelector("[data-gca-copy]").addEventListener("click", async () => {
    const value = answerView.textContent.trim();
    if (!value) return;
    try { await navigator.clipboard.writeText(value); } catch { /* no-op */ }
  });
  shell.querySelector("[data-gca-reset]").addEventListener("click", () => {
    exchange.hidden = true;
    welcome.hidden = false;
    answerView.textContent = "";
    questionView.textContent = "";
    answerActions.hidden = true;
    input.focus({ preventScroll: true });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closePanel();
  });
  document.addEventListener("selectionchange", () => {
    clearTimeout(syncSelection._timer);
    syncSelection._timer = setTimeout(syncSelection, 90);
  });

  let scrollFrame = 0;
  window.addEventListener("scroll", () => {
    if (selectedPassage || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; syncSection(); });
  }, { passive: true });

  renderPrompts();
  syncSection();
  if (!reduceMotion) requestAnimationFrame(() => shell.classList.add("is-ready"));
  else shell.classList.add("is-ready");
})();
