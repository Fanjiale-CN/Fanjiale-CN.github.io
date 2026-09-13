(() => {
  "use strict";
  if (!document.body?.classList.contains("search003-paper-page")) return;
  if (document.querySelector('script[src^="/assets/galok-dual-islands.js"]')) return;
  const script = document.createElement("script");
  script.src = "/assets/galok-dual-islands.js?v=20260914b";
  script.defer = true;
  document.head.append(script);
})();
