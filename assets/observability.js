(() => {
  "use strict";

  const faviconHref = "/assets/favicon.svg?v=20260907-brand2";
  const syncFavicon = () => {
    const icons = [...document.querySelectorAll('link[rel~="icon"]')];
    if (!icons.length) {
      const icon = document.createElement("link");
      icon.rel = "icon";
      icon.type = "image/svg+xml";
      icon.href = faviconHref;
      document.head.append(icon);
      return;
    }
    icons.forEach((icon) => {
      icon.type = "image/svg+xml";
      if (icon.getAttribute("href") !== faviconHref) icon.setAttribute("href", faviconHref);
    });
  };

  syncFavicon();

  if (!document.querySelector("script[data-galok-observability-core]")) {
    const core = document.createElement("script");
    core.src = "/assets/observability-core.js?v=20260907-brand2";
    core.async = false;
    core.dataset.galokObservabilityCore = "";
    document.head.append(core);
  }
})();
