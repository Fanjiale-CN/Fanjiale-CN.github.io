(() => {
  "use strict";
  if (!document.body?.classList.contains("search003-paper-page")) return;
  if (document.querySelector('script[src^="/assets/galok-triple-islands.js"]')) return;
  const script = document.createElement("script");
  script.src = "/assets/galok-triple-islands.js?v=20260914a";
  script.defer = true;
  document.head.append(script);
})();
