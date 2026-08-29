(() => {
  const VERSION = "20260830-beijing-cinema1";
  if (document.querySelector("[data-beijing-time-root]") || document.querySelector('script[data-beijing-time-loader]')) return;

  const loader = document.createElement("script");
  loader.type = "module";
  loader.src = `/be-a-viewer/beijing/beijing-time.js?v=${VERSION}`;
  loader.dataset.beijingTimeLoader = "";
  document.head.append(loader);
})();
