(() => {
  const load = (src, onload) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    if (onload) script.addEventListener("load", onload, { once: true });
    document.head.appendChild(script);
  };
  load("/be-a-viewer/chongqing/chongqing-core.js?v=20260828-cq-v6", () => {
    load("/be-a-viewer/chongqing/chongqing-enhance.js?v=20260828-cq-v6");
  });
})();
