(() => {
  const sections = [...document.querySelectorAll('[data-route-focus]')];
  const bands = [...document.querySelectorAll('[data-route-band]')];
  const dots = [...document.querySelectorAll('[data-route-dot]')];
  const stops = [...document.querySelectorAll('[data-route-stop]')];
  if (!sections.length) return;

  function activate(key) {
    bands.forEach((item) => item.classList.toggle('is-active', item.dataset.routeBand === key));
    dots.forEach((item) => item.classList.toggle('is-active', item.dataset.routeDot === key));
    stops.forEach((item) => item.classList.toggle('is-active', item.dataset.routeStop === key));
  }

  activate(sections[0].dataset.routeFocus);

  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) activate(visible.target.dataset.routeFocus);
  }, { rootMargin: '-22% 0px -54% 0px', threshold: [0.08, 0.2, 0.42] });

  sections.forEach((section) => observer.observe(section));
})();
