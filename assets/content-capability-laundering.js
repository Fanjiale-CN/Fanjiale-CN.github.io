(() => {
  const entry = {
    series: "scene",
    anchor: "察",
    issue: 14,
    deck: "The model name on screen is no longer proof of who did the thinking.",
    title: "Capability Laundering",
    date: "2026",
    readingTime: "11 min",
    url: "/essays/capability-laundering/",
    maturity: "growing",
    cover: {
      src: "/assets/views/articles/capability-laundering-cover.avif",
      alt: "A Press Print collage featuring the Anthropic wordmark with silhouetted figures"
    },
    excerpt: "Anthropic says Chinese AI labs secretly routed, extracted and trained on Claude. The deeper question is what domestic capability means when provenance disappears inside the pipeline."
  };
  const essays = window.GALOK_CONTENT?.essays;
  if (!Array.isArray(essays)) return;
  const existing = essays.find((item) => item.url === entry.url);
  if (existing) {
    Object.assign(existing, entry);
    existing.cover = { ...entry.cover };
    return;
  }
  essays.push(entry);
})();
