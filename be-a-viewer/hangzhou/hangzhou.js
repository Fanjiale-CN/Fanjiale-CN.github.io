(() => {
  const mobileStyle = document.createElement("link");
  mobileStyle.rel = "stylesheet";
  mobileStyle.media = "(max-width: 760px)";
  mobileStyle.href = "/be-a-viewer/hangzhou/hangzhou-mobile.css?v=20260828-mobile-repair";
  mobileStyle.dataset.hzMobileRepair = "true";
  document.head.append(mobileStyle);

  const core = document.createElement("script");
  core.src = "/be-a-viewer/hangzhou/hangzhou-core.js?v=20260828-mobile-repair";
  core.async = false;
  document.body.append(core);
})();
