(() => {
  "use strict";

  if (window.location.pathname.replace(/index\.html$/, "") !== "/cities/") return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const mobile = window.matchMedia("(max-width: 720px)");
  const storedTheme = localStorage.getItem("galok-theme");

  if (!document.documentElement.dataset.theme && ["light", "dark"].includes(storedTheme)) {
    document.documentElement.dataset.theme = storedTheme;
  }

  const resolveDark = () => {
    const theme = document.documentElement.dataset.theme;
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return systemDark.matches;
  };

  const syncThemeChrome = () => {
    const dark = resolveDark();
    document.documentElement.classList.toggle("cities-dark-resolved", dark);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", dark ? "#000000" : "#f7f9fc");
  };

  const enhance = (section) => {
    if (!section || section.dataset.citiesModernized === "true") return;
    section.dataset.citiesModernized = "true";
    section.id ||= "cities-ask";

    const select = section.querySelector("#cities-conversation-select");
    const ask = section.querySelector("[data-cities-ask]");
    const answerSlot = section.querySelector("[data-cities-answer]");
    if (!select || !ask || !answerSlot) return;

    ask.setAttribute("aria-keyshortcuts", "Enter");

    const syncAskLabel = () => {
      const city = select.options[select.selectedIndex]?.textContent?.trim() || "this city";
      ask.setAttribute("aria-label", `Ask Galok about ${city}`);
      ask.dataset.ready = "true";
      window.setTimeout(() => delete ask.dataset.ready, 180);
    };

    syncAskLabel();
    select.addEventListener("change", syncAskLabel);

    const prepareQuestionNav = () => {
      const questions = [...answerSlot.querySelectorAll(".cities-answer__question")];
      if (!questions.length) return;

      const group = answerSlot.querySelector(".cities-answer__questions");
      group?.setAttribute("role", "group");
      group?.setAttribute("aria-label", "Ask a follow-up question");

      questions.forEach((button, index) => {
        button.dataset.questionIndex = String(index);
        button.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End", "Escape"].includes(event.key)) return;

          if (event.key === "Escape") {
            event.preventDefault();
            select.focus({ preventScroll: true });
            return;
          }

          event.preventDefault();
          const next = event.key === "Home"
            ? 0
            : event.key === "End"
              ? questions.length - 1
              : (index + (event.key === "ArrowRight" ? 1 : -1) + questions.length) % questions.length;
          questions[next]?.focus({ preventScroll: true });
        });
      });
    };

    let lastArticle = null;
    const answerObserver = new MutationObserver(() => {
      const article = answerSlot.querySelector(".cities-answer");
      if (!article || article === lastArticle) return;
      lastArticle = article;
      prepareQuestionNav();

      if (mobile.matches && !reducedMotion.matches) {
        window.setTimeout(() => {
          const rect = article.getBoundingClientRect();
          if (rect.bottom > window.innerHeight - 90) {
            article.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 120);
      }
    });

    answerObserver.observe(answerSlot, { childList: true, subtree: false });

    section.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (document.activeElement?.closest(".cities-answer__questions")) return;
      if (document.activeElement === select || document.activeElement === ask) return;
      select.focus({ preventScroll: true });
    });
  };

  const findAndEnhance = () => {
    const section = document.querySelector("[data-cities-conversation]");
    if (!section) return false;
    enhance(section);
    return true;
  };

  syncThemeChrome();
  systemDark.addEventListener?.("change", syncThemeChrome);

  const themeObserver = new MutationObserver(syncThemeChrome);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  if (!findAndEnhance()) {
    const mountObserver = new MutationObserver(() => {
      if (!findAndEnhance()) return;
      mountObserver.disconnect();
    });
    mountObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
