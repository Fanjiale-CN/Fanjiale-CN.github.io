(() => {
  "use strict";
  if (!document.body?.classList.contains("search003-paper-page")) return;
  if (document.querySelector('script[src^="/assets/galok-triple-islands-v2.js"]')) return;
  const script = document.createElement("script");
  script.src = "/assets/galok-triple-islands-v2.js?v=20260914c";
  script.defer = true;
  document.head.append(script);
})();
