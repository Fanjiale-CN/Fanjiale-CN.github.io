(() => {
  const load = (src) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  };
  load("/be-a-viewer/chongqing/chongqing-core.js?v=20260828-cq-v7");
})();
