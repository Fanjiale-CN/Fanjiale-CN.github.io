(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector("[data-research-index-hero]");
  const entries = [...document.querySelectorAll("[data-research-index-entry]")];

  if (reducedMotion || !window.gsap || !hero) return;

  const motion = window.gsap.matchMedia();
  motion.add("(prefers-reduced-motion: no-preference)", () => {
    const heroTimeline = window.gsap.timeline({
      defaults: { ease: "power3.out", overwrite: "auto" },
    });

    heroTimeline
      .from(hero.querySelector(".research-index-hero__meta"), { opacity: 0, y: 18, duration: 0.42 }, 0.1)
      .from(hero.querySelector(".research-index-hero__statement > p"), { opacity: 0, y: 14, duration: 0.36, ease: "power2.out" }, 0.18)
      .from(hero.querySelector("h1"), { opacity: 0, y: 30, duration: 0.68, ease: "expo.out" }, 0.27)
      .from(hero.querySelector(".research-index-hero__statement > span"), { opacity: 0, y: 16, duration: 0.4, ease: "power1.out" }, 0.43);

    const observer = new IntersectionObserver((observed) => {
      observed.forEach((item) => {
        if (!item.isIntersecting) return;
        const entry = item.target;
        const timeline = window.gsap.timeline({ defaults: { overwrite: "auto" } });
        timeline
          .from(entry.querySelector(".research-index-entry__index"), { opacity: 0, x: -12, duration: 0.34, ease: "power2.out" }, 0)
          .from(entry.querySelector("figure"), { opacity: 0, y: 20, duration: 0.58, ease: "power3.out" }, 0.08)
          .from(entry.querySelector(".research-index-card > div"), { opacity: 0, y: 18, duration: 0.5, ease: "power4.out" }, 0.18);
        observer.unobserve(entry);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    entries.forEach((entry) => observer.observe(entry));
    return () => observer.disconnect();
  });
})();
