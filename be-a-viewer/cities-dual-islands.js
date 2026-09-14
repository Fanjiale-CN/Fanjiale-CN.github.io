(() => {
  "use strict";

  if (window.location.pathname.replace(/index\.html$/, "") !== "/cities/") return;

  const normalizeResponseQuestion = (response) => {
    if (!(response instanceof Element) || !response.matches("[data-cities-ai-response]")) return;
    if (!response.hasAttribute("data-question")) return;

    const question = response.getAttribute("data-question");
    if (question && !response.hasAttribute("data-ai-question")) {
      response.setAttribute("data-ai-question", question);
    }
    response.removeAttribute("data-question");
  };

  const sanitizeResponseQuestions = (root = document) => {
    root.querySelectorAll?.("[data-cities-ai-response][data-question]").forEach(normalizeResponseQuestion);
  };

  sanitizeResponseQuestions();
  const responseObserver = new MutationObserver(() => sanitizeResponseQuestions());
  responseObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-question"]
  });

  document.addEventListener("click", (event) => {
    const response = event.target instanceof Element
      ? event.target.closest("[data-cities-ai-response]")
      : null;
    normalizeResponseQuestion(response);
  }, true);

  const scripts = [
    "/assets/cities-conversation.js?v=20260914g",
    "/assets/cities-modernize.js?v=20260914g",
    "/assets/cities-islands-unified.js?v=20260914g",
    "/assets/cities-flat-chat.js?v=20260914g",
    "/assets/cities-ai-session.js?v=20260914g"
  ];

  const scriptPath = (value) => {
    try {
      return new URL(value, window.location.href).pathname;
    } catch {
      return value;
    }
  };

  const hasScript = (src) => {
    const wanted = scriptPath(src);
    return Array.from(document.scripts).some((script) => scriptPath(script.src) === wanted);
  };

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (hasScript(src)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.append(script);
  });

  scripts
    .reduce((chain, src) => chain.then(() => loadScript(src)), Promise.resolve())
    .catch((error) => console.error("[Galok Cities] runtime bootstrap failed", error));
})();
