(() => {
  "use strict";
  if (window.location.pathname.replace(/index\.html$/, "") !== "/cities/") return;
  if (document.querySelector('script[src^="/assets/cities-islands-unified.js"]')) return;
  const script = document.createElement("script");
  script.src = "/assets/cities-islands-unified.js?v=20260914b";
  script.async = false;
  document.head.append(script);
})();
