(() => {
  const attachStyle = ({ href, media, dataKey }) => {
    if (document.querySelector(`link[data-${dataKey}]`)) return;
    const style = document.createElement("link");
    style.rel = "stylesheet";
    if (media) style.media = media;
    style.href = href;
    style.dataset[dataKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = "true";
    document.head.append(style);
  };

  const attachScript = ({ src, dataKey }) => {
    if (document.querySelector(`script[data-${dataKey}]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset[dataKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = "true";
    document.body.append(script);
  };

  attachStyle({
    href: "/be-a-viewer/hangzhou/hangzhou-mobile.css?v=20260828-mobile-repair",
    media: "(max-width: 760px)",
    dataKey: "hz-mobile-repair"
  });
  attachStyle({
    href: "/be-a-viewer/hangzhou/hangzhou-tablet.css?v=20260828-ipad-repair",
    media: "(min-width: 761px) and (max-width: 1180px), (min-width: 1181px) and (max-width: 1366px) and (pointer: coarse)",
    dataKey: "hz-tablet-repair"
  });
  attachStyle({
    href: "/be-a-viewer/hangzhou/hangzhou-history.css?v=20260828-hz36",
    dataKey: "hz-history-style"
  });

  attachScript({
    src: "/be-a-viewer/hangzhou/hangzhou-core.js?v=20260828-mobile-repair",
    dataKey: "hz-core"
  });
  attachScript({
    src: "/be-a-viewer/hangzhou/hangzhou-history.js?v=20260828-hz36",
    dataKey: "hz-history"
  });
})();