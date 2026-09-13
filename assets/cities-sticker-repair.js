(() => {
  "use strict";
  if (window.location.pathname.replace(/index\.html$/, "") !== "/cities/") return;

  const replacements = new Map([
    ["shanghai-lujiazui.webp", "/assets/cities/stickers/shanghai-lujiazui-v2.webp"],
    ["xian-dayanta.webp", "/assets/cities/stickers/xian-dayanta-v2.webp"],
    ["beijing-gugong.webp", "/assets/cities/stickers/beijing-gugong-v2.webp"],
    ["xiamen-harbor.webp", "/assets/cities/stickers/xiamen-harbor-v2.webp"],
    ["pagoda.webp", "/assets/cities/stickers/xian-dayanta-v2.webp"]
  ]);

  const repair = (root = document) => {
    const images = [];
    if (root instanceof HTMLImageElement && root.closest(".cities-sticker")) images.push(root);
    root.querySelectorAll?.(".cities-sticker img").forEach((image) => images.push(image));

    images.forEach((image) => {
      const source = image.getAttribute("src") || "";
      const entry = [...replacements.entries()].find(([oldName]) => source.includes(oldName));
      if (!entry) return;
      const next = entry[1];
      if (source === next) return;

      image.alt = "";
      image.loading = "eager";
      image.decoding = "async";
      image.addEventListener("error", () => image.closest(".cities-sticker")?.remove(), { once: true });
      image.setAttribute("src", next);
    });
  };

  repair();

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) repair(node);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("load", () => repair(), { once: true });
})();