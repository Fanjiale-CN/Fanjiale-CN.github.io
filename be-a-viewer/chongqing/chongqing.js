(() => {
  const loadStyle = (href) => {
    if ([...document.styleSheets].some((sheet) => sheet.href?.includes("chongqing-tablet-fix.css"))) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  };

  const load = (src) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  };

  loadStyle("/be-a-viewer/chongqing/chongqing-tablet-fix.css?v=20260829-cq01");
  load("/be-a-viewer/chongqing/chongqing-core.js?v=20260828-cq-v9");
})();
