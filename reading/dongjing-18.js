(() => {
  const root = document.querySelector("[data-dj18-threshold]");
  if (!root) return;

  const tabs = [...root.querySelectorAll("[data-dj18-tab]")];
  const panels = [...root.querySelectorAll("[data-dj18-panel]")];
  if (!tabs.length || tabs.length !== panels.length) return;

  root.classList.add("is-enhanced");

  const activate = (index, { focus = false } = {}) => {
    const next = Math.max(0, Math.min(index, tabs.length - 1));

    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === next;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel, panelIndex) => {
      const active = panelIndex === next;
      if (!active) {
        panel.hidden = true;
        panel.classList.remove("is-entering");
        return;
      }
      panel.hidden = false;
      panel.classList.add("is-entering");
      requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.remove("is-entering")));
    });

    if (focus) tabs[next].focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(index));
    tab.addEventListener("keydown", (event) => {
      let next = null;
      if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % tabs.length;
      if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      activate(next, { focus: true });
    });
  });

  activate(0);
})();
