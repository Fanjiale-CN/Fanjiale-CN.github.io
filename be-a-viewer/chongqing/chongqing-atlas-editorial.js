(() => {
  const atlas = document.querySelector(".cq-field-atlas");
  if (!atlas || atlas.dataset.editorialReady === "true") return;

  atlas.dataset.editorialReady = "true";
  atlas.classList.add("cq-field-atlas--editorial");
  atlas.setAttribute("aria-labelledby", "cq-atlas-title");
  atlas.removeAttribute("aria-label");

  atlas.innerHTML = `
    <header class="cq-atlas-intro">
      <span>08 / FIELD ATLAS</span>
      <h2 id="cq-atlas-title">ROOF / WINDOW / SHAFT / RIVER.</h2>
      <p>The large view explains Chongqing poorly. The smaller cuts do more: an eave against towers, a hall sitting low in the skyline, a window turning the city into a frame, a shaft making vertical distance physical.</p>
    </header>

    <nav class="cq-atlas-index" aria-label="Field atlas chapters">
      <a href="#cq-atlas-roof" class="is-active" aria-current="true">01 <span>ROOF LINE</span></a>
      <a href="#cq-atlas-frame">02 <span>FRAME</span></a>
      <a href="#cq-atlas-civic">03 <span>CIVIC SCALE</span></a>
      <a href="#cq-atlas-depth">04 <span>DEPTH</span></a>
    </nav>

    <div class="cq-atlas-route">
      <article class="cq-atlas-cut cq-atlas-cut--roof is-active" id="cq-atlas-roof" data-cq-atlas-cut>
        <span class="cq-atlas-cut-number" aria-hidden="true">01</span>
        <div class="cq-atlas-copy">
          <span>ROOF LINE / FOREGROUND</span>
          <h3>EAVES / TOWERS</h3>
          <p>Dense roof ornament stays in the foreground while the high-rise city occupies the distance. The two scales sit in the same frame, so the skyline reads through contrast rather than isolation.</p>
          <small>READING MODE / FOREGROUND FIRST</small>
        </div>
        <figure class="cq-atlas-figure cq-atlas-figure--hero">
          <img src="/assets/be-a-viewer/chongqing/hongyadong-eaves.webp" alt="Traditional eaves in Chongqing" width="1350" height="1800" loading="lazy" decoding="async">
          <figcaption><span>EAVES / LAYER 01</span><p>Roof brackets, tiles and shadow occupy the near field before the city opens behind them.</p></figcaption>
        </figure>
        <figure class="cq-atlas-figure cq-atlas-figure--echo">
          <img src="/assets/be-a-viewer/chongqing/temple-skyline.webp" alt="Traditional roofline against Chongqing skyline" width="1800" height="1200" loading="lazy" decoding="async">
          <figcaption><span>OLD ROOF / NEW HEIGHT</span><p>The roof edge becomes a measuring line for the towers beyond it.</p></figcaption>
        </figure>
      </article>

      <article class="cq-atlas-cut cq-atlas-cut--frame" id="cq-atlas-frame" data-cq-atlas-cut>
        <span class="cq-atlas-cut-number" aria-hidden="true">02</span>
        <figure class="cq-atlas-figure cq-atlas-figure--window">
          <img src="/assets/be-a-viewer/chongqing/city-window.webp" alt="Traditional pavilion window framing Chongqing" width="1200" height="1800" loading="lazy" decoding="async">
          <figcaption><span>WINDOW / FRAME</span><p>A narrow opening compresses towers, haze and distance into one controlled view.</p></figcaption>
        </figure>
        <div class="cq-atlas-copy">
          <span>FRAME / LOOK THROUGH</span>
          <h3>THE CITY INSIDE THE OPENING</h3>
          <p>Here the foreground does the work of a viewfinder. The skyline loses its postcard scale and becomes one layer among timber, roof edges and shadow.</p>
          <small>READING MODE / THROUGH, NOT ACROSS</small>
        </div>
        <figure class="cq-atlas-figure cq-atlas-figure--hall">
          <img src="/assets/be-a-viewer/chongqing/people-hall.webp" alt="Great Hall of the People in Chongqing" width="1800" height="1200" loading="lazy" decoding="async">
          <figcaption><span>PEOPLE'S GREAT HALL / CIVIC AXIS</span><p>The broad civic building sits low in the frame while the surrounding city keeps rising.</p></figcaption>
        </figure>
      </article>

      <article class="cq-atlas-cut cq-atlas-cut--civic" id="cq-atlas-civic" data-cq-atlas-cut>
        <span class="cq-atlas-cut-number" aria-hidden="true">03</span>
        <div class="cq-atlas-copy">
          <span>CIVIC SCALE / STREET SIGNAL</span>
          <h3>LOW HALL / HIGH CITY</h3>
          <p>The Great Hall gives the eye a stable horizontal mass. Move one block, one roof edge or one signal away and the vertical city takes over again.</p>
          <small>READING MODE / SCALE AGAINST HEIGHT</small>
        </div>
        <figure class="cq-atlas-figure cq-atlas-figure--detail">
          <img src="/assets/be-a-viewer/chongqing/people-hall-detail.webp" alt="Architectural detail of Chongqing Great Hall" width="1800" height="1200" loading="lazy" decoding="async">
          <figcaption><span>ROOF / DETAIL</span><p>At close range the building is read through structure, color and repeated roof geometry.</p></figcaption>
        </figure>
        <figure class="cq-atlas-figure cq-atlas-figure--shaft">
          <img src="/assets/be-a-viewer/chongqing/vertical-shaft.webp" alt="Vertical city infrastructure in Chongqing" width="1800" height="1200" loading="lazy" decoding="async">
          <figcaption><span>SHAFT / VERTICAL CUT</span><p>The view collapses into one direction: up. Depth replaces skyline.</p></figcaption>
        </figure>
        <figure class="cq-atlas-figure cq-atlas-figure--signal">
          <img src="/assets/be-a-viewer/chongqing/street-sunset.webp" alt="Road signal against sunset in Chongqing" width="1800" height="1200" loading="lazy" decoding="async">
          <figcaption><span>SIGNAL / 18:42</span><p>A street-scale object brings the eye back down before the page opens toward the river.</p></figcaption>
        </figure>
      </article>

      <article class="cq-atlas-cut cq-atlas-cut--depth" id="cq-atlas-depth" data-cq-atlas-cut>
        <span class="cq-atlas-cut-number" aria-hidden="true">04</span>
        <figure class="cq-atlas-figure cq-atlas-figure--dusk">
          <img src="/assets/be-a-viewer/chongqing/bridge-dusk.webp" alt="Chongqing skyline at dusk" width="1800" height="1200" loading="lazy" decoding="async">
          <figcaption><span>BLUE HOUR / A</span><p>At dusk, building layers separate through light rather than hard outline.</p></figcaption>
        </figure>
        <div class="cq-atlas-copy">
          <span>DEPTH / RIVER AIR</span>
          <h3>SHAFT / HAZE / RIVER</h3>
          <p>The shaft made vertical distance physical. The river reverses the view: depth now stretches outward, with roads, towers and hills fading through humid air.</p>
          <small>READING MODE / DISTANCE IN LAYERS</small>
        </div>
        <figure class="cq-atlas-figure cq-atlas-figure--river">
          <img src="/assets/be-a-viewer/chongqing/river-sunset.webp" alt="River skyline in Chongqing at dusk" width="1800" height="1200" loading="lazy" decoding="async">
          <figcaption><span>BLUE HOUR / B</span><p>The river creates a long horizontal pause after the compressed vertical cuts.</p></figcaption>
        </figure>
        <figure class="cq-atlas-figure cq-atlas-figure--haze">
          <img src="/assets/be-a-viewer/chongqing/river-haze.webp" alt="Chongqing river corridor in haze" width="1800" height="1200" loading="lazy" decoding="async">
          <figcaption><span>RIVER / HAZE</span><p>Near road, middle river, far towers and hill: four depths visible at once.</p></figcaption>
        </figure>
      </article>
    </div>
  `;

  const links = [...atlas.querySelectorAll(".cq-atlas-index a")];
  const cuts = [...atlas.querySelectorAll("[data-cq-atlas-cut]")];
  const activate = (cut) => {
    cuts.forEach((node) => node.classList.toggle("is-active", node === cut));
    links.forEach((link) => {
      const active = link.hash === `#${cut.id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  links.forEach((link) => link.addEventListener("click", () => {
    const target = atlas.querySelector(link.hash);
    if (target) activate(target);
  }));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (active) activate(active.target);
    }, { threshold: [.18, .32, .5], rootMargin: "-18% 0px -52%" });
    cuts.forEach((cut) => observer.observe(cut));
  }
})();
