(() => {
  const loadStyle = (href) => {
    const pathname = href.split("?")[0];
    if ([...document.styleSheets].some((sheet) => sheet.href?.includes(pathname))) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  };

  const load = (src) => {
    const pathname = src.split("?")[0];
    if ([...document.scripts].some((script) => script.src?.includes(pathname))) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  };

  loadStyle("/be-a-viewer/chongqing/chongqing-tablet-fix.css?v=20260829-cq01");
  loadStyle("/be-a-viewer/chongqing/chongqing-atlas-editorial.css?v=20260829-cq02");
  loadStyle("/assets/galok-dual-islands.css?v=20260914b");
  loadStyle("/assets/city-detail-islands.css?v=20260914b");

  load("/be-a-viewer/chongqing/chongqing-core.js?v=20260828-cq-v9");
  load("/be-a-viewer/chongqing/chongqing-atlas-editorial.js?v=20260829-cq02");
  load("/assets/city-detail-islands.js?v=20260914b");
})();
