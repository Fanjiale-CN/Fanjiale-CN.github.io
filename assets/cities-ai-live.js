(() => {
  "use strict";

  if (location.pathname.replace(/index\.html$/, "") !== "/cities/") return;

  const API_URL = "/api/ask";
  const MAX_QUESTION = 600;
  let requestToken = 0;

  const escapeText = (value) => String(value ?? "");

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
          <div class="cities-ai-response__meta"><span>GALOK AI</span><span>${escapeText(cityName)}</span></div>
          <p class="cities-ai-response__question"></p>
          <div class="cities-ai-response__thinking"><span></span>Thinking…</div>
        </section>`;
      slot.querySelector(".cities-ai-response__question").textContent = question;
    };

    const renderError = (slot, question, message) => {
      slot.innerHTML = `
        <section class="cities-ai-response is-error" data-cities-ai-response>
          <div class="cities-ai-response__meta"><span>GALOK AI</span><span>Unavailable</span></div>
          <p class="cities-ai-response__question"></p>
          <p class="cities-ai-response__answer"></p>
          <div class="cities-ai-response__actions">
            <button type="button" data-ai-retry>Try again</button>
            <button type="button" data-ai-close>Close</button>
          </div>
        </section>`;
      slot.querySelector(".cities-ai-response__question").textContent = question;
      slot.querySelector(".cities-ai-response__answer").textContent = message;
    };

    const renderAnswer = (slot, cityName, question, answer) => {
      slot.innerHTML = `
        <section class="cities-ai-response" data-cities-ai-response>
          <div class="cities-ai-response__meta"><span>GALOK AI</span><span></span></div>
          <p class="cities-ai-response__question"></p>
          <div class="cities-ai-response__answer" data-ai-answer></div>
          <div class="cities-ai-response__actions">
            <button type="button" data-ai-copy>Copy</button>
            <button type="button" data-ai-again>Ask again</button>
            <button type="button" data-ai-close>Close</button>
          </div>
          <p class="cities-ai-response__notice">AI-generated answer. It may be inaccurate.</p>
        </section>`;
      const meta = slot.querySelector(".cities-ai-response__meta span:last-child");
      const questionNode = slot.querySelector(".cities-ai-response__question");
      const answerNode = slot.querySelector("[data-ai-answer]");
      meta.textContent = cityName;
      questionNode.textContent = question;
      answerNode.textContent = answer;
    };

    const askAI = async (question, options = {}) => {
      const cleanQuestion = String(question || "").trim();
      if (!cleanQuestion) {
        input.focus({ preventScroll: true });
        return;
      }

      const city = select.value;
      const cityName = select.options[select.selectedIndex]?.textContent?.trim() || city;
      const token = ++requestToken;
      const slot = getResponseSlot();
      const previousQuestion = cleanQuestion;

      setBusy(true);
      renderLoading(slot, cleanQuestion, cityName);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ city, question: cleanQuestion })
        });

        const data = await response.json().catch(() => ({}));
        if (token !== requestToken) return;
        if (!response.ok || !data.answer) {
          throw new Error(data.error || "Galok AI is temporarily unavailable.");
        }

        renderAnswer(slot, cityName, cleanQuestion, data.answer);
        if (!options.keepInput) input.value = "";
      } catch (error) {
        if (token !== requestToken) return;
        renderError(slot, cleanQuestion, error?.message || "Galok AI is temporarily unavailable.");
        const retry = slot.querySelector("[data-ai-retry]");
        retry?.addEventListener("click", () => askAI(previousQuestion, { keepInput: true }), { once: true });
      } finally {
        if (token === requestToken) setBusy(false);
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

    answerSlot.addEventListener("click", (event) => {
      const questionButton = event.target.closest("[data-question]");
      if (questionButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        answerSlot.querySelectorAll("[data-question]").forEach((item) => item.classList.toggle("is-active", item === questionButton));
        askAI(questionButton.textContent.trim(), { keepInput: true });
        return;
      }

      const copy = event.target.closest("[data-ai-copy]");
      if (copy) {
        const text = answerSlot.querySelector("[data-ai-answer]")?.textContent?.trim();
        if (!text) return;
        navigator.clipboard?.writeText(text).then(() => {
          const original = copy.textContent;
          copy.textContent = "Copied";
          window.setTimeout(() => { copy.textContent = original; }, 1200);
        }).catch(() => {});
        return;
      }

      if (event.target.closest("[data-ai-again]")) {
        input.focus({ preventScroll: false });
        return;
      }

      if (event.target.closest("[data-ai-close]")) {
        requestToken += 1;
        setBusy(false);
        answerSlot.querySelector("[data-cities-followups]")?.replaceChildren();
        const response = answerSlot.querySelector(":scope > [data-cities-ai-response]");
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
