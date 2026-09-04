(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stageData = [
    ['FIFTH WATCH / SIGNAL','The first urban event is audible.','Temple attendants strike iron plates or wooden fish and move door to door reporting dawn. Meng adds that each has a territorial section for daytime alms.'],
    ['WAKE / COURT + MARKET','People rise because the signal travels.','Those going to court and those entering the markets hear the dawn signal and get up.'],
    ['OPEN / GATES + BRIDGES','Access is already active before daylight.','Gates, bridges and market streets are open; the predawn city is already spatially connected.'],
    ['FEED / FOOD + WATER','Light, hot food and wash water appear.','Food shops and wine shops are open under lamps and candles. Porridge, rice, snacks, wash water and hot preparations continue until daylight.'],
    ['MOVE / SUPPLY','Livestock, fruit and flour cross the city.','Slaughter-house supply enters market, fruit gathers by major nodes, paper pictures trade, and flour comes through the gates by Taiping cart or pack animal.'],
    ['COURT ROUTE / STREET CRIES','The chapter closes in a field of voices.','Medicine and food vendors serving the court route use many forms of patterned cry — 吟叫百端.']
  ];

  const stageButtons = [...document.querySelectorAll('[data-dj26-stage]')];
  if (stageButtons.length) {
    const kicker = document.querySelector('[data-dj26-readout-kicker]');
    const title = document.querySelector('[data-dj26-readout-title]');
    const copy = document.querySelector('[data-dj26-readout-copy]');
    const selectStage = (index) => {
      stageButtons.forEach((button, i) => button.setAttribute('aria-pressed', i === index ? 'true' : 'false'));
      const data = stageData[index];
      if (!data) return;
      if (kicker) kicker.textContent = data[0];
      if (title) title.textContent = data[1];
      if (copy) copy.textContent = data[2];
    };
    stageButtons.forEach((button, index) => button.addEventListener('click', () => selectStage(index)));
  }

  const strata = [...document.querySelectorAll('[data-dj27-stratum]')];
  const railLinks = [...document.querySelectorAll('.dj27-rail a')];
  if (strata.length) {
    const activate = (index) => {
      strata.forEach((item, i) => item.classList.toggle('is-active', i === index));
      railLinks.forEach((link, i) => link.classList.toggle('is-active', i === index));
    };
    if (reduce || !('IntersectionObserver' in window)) {
      strata.forEach((item) => item.classList.add('is-active'));
      railLinks.forEach((link) => link.classList.add('is-active'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        activate(Number(visible.target.dataset.dj27Stratum || 0));
      }, { threshold: [0.25,0.45,0.65], rootMargin: '-16% 0px -28% 0px' });
      strata.forEach((item) => observer.observe(item));
      activate(0);
    }
  }
})();