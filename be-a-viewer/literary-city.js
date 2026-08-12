(() => {
  const sections = [...document.querySelectorAll("[data-literary-city]")];
  if (!sections.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("literary-motion-ready");

  sections.forEach((section) => {
    const reveals = [...section.querySelectorAll("[data-literary-reveal]")];
    if (reducedMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9%", threshold: .07 });

    reveals.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const isInitiallyVisible = rect.top < window.innerHeight * .92 && rect.bottom > 0;

      if (isInitiallyVisible) {
        node.classList.add("is-visible");
        return;
      }

      observer.observe(node);
    });
  });
})();
