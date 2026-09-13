(() => {
  "use strict";

  if (location.pathname.replace(/index\.html$/, "") !== "/cities/") return;

  const arrowMarkup = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19V5"></path>
      <path d="m6.5 10.5 5.5-5.5 5.5 5.5"></path>
    </svg>`;

  const enhance = (section) => {
    if (!section || section.dataset.flatChatReady === "true") return;
    section.dataset.flatChatReady = "true";

    const eyebrow = section.querySelector(".cities-conversation__eyebrow");
    const label = section.querySelector(".cities-conversation__label");
    const hint = section.querySelector(".cities-conversation__hint");
    const ask = section.querySelector("[data-cities-ask]");

    if (eyebrow) eyebrow.textContent = "GALOK";
    if (label) label.textContent = "Ask Galok about";
    if (hint) hint.textContent = "Choose a city to explore Galok’s notes.";

    const syncAskIcon = () => {
      if (!ask || ask.disabled) return;
      if (ask.querySelector("svg")) return;
      if (ask.textContent.trim() !== "OK") return;
      ask.innerHTML = arrowMarkup;
    };

    syncAskIcon();

    if (ask) {
      const observer = new MutationObserver(syncAskIcon);
      observer.observe(ask, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });
    }
  };

  const mount = () => {
    const section = document.querySelector("[data-cities-conversation]");
    if (!section) return false;
    enhance(section);
    return true;
  };

  if (mount()) return;

  const observer = new MutationObserver(() => {
    if (!mount()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
