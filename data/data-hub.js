(() => {
  const DATA = window.GALOK_DATA;
  const YEAR_START = 2000;
  const YEAR_END = 2025;
  const YEARS = Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, i) => YEAR_START + i);

  const svgNS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}) => {
    const node = document.createElementNS(svgNS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  };

  function catmullRomPath(points) {
    // points: [{x,y}], returns a smooth SVG path "d" string
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  function seriesColor(seriesKey) {
    const map = { macro: "#9e2a2b", frame: "#2f5d7c", scene: "#c9a227" };
    return map[seriesKey] || "#171717";
  }

  class DataHub {
    constructor(mount) {
      this.mount = mount;
      this.width = 880;
      this.height = 380;
      this.padding = { top: 24, right: 24, bottom: 36, left: 44 };
      this.activeId = DATA.indicators[0].id;
      this.build();
      this.render();
      window.addEventListener("resize", () => this.render());
    }

    build() {
      this.mount.innerHTML = `
        <div class="data-hub-controls" role="tablist" aria-label="选择指标"></div>
        <div class="data-hub-chart-wrap">
          <svg class="data-hub-svg" viewBox="0 0 ${this.width} ${this.height}" preserveAspectRatio="none" role="img"></svg>
          <div class="data-hub-tooltip" hidden></div>
        </div>
        <div class="data-hub-meta"></div>
        <details class="data-hub-table-wrap">
          <summary>View year-by-year data</summary>
          <div class="data-hub-table"></div>
        </details>
      `;
      this.controls = this.mount.querySelector(".data-hub-controls");
      this.svg = this.mount.querySelector(".data-hub-svg");
      this.tooltip = this.mount.querySelector(".data-hub-tooltip");
      this.metaEl = this.mount.querySelector(".data-hub-meta");
      this.tableWrap = this.mount.querySelector(".data-hub-table");

      DATA.indicators.forEach((ind) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "data-hub-pill";
        btn.dataset.id = ind.id;
        btn.setAttribute("role", "tab");
        btn.style.setProperty("--dot", seriesColor(ind.series));
        btn.innerHTML = `<span class="data-hub-pill-dot"></span>${ind.name}`;
        btn.addEventListener("click", () => {
          this.activeId = ind.id;
          this.render();
        });
        this.controls.appendChild(btn);
      });
    }

    currentIndicator() {
      return DATA.indicators.find((i) => i.id === this.activeId);
    }

    render() {
      const ind = this.currentIndicator();
      const color = seriesColor(ind.series);

      // update pills
      [...this.controls.children].forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.id === ind.id);
      });

      // clear svg
      while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

      const { top, right, bottom, left } = this.padding;
      const plotW = this.width - left - right;
      const plotH = this.height - top - bottom;

      const entries = YEARS.map((y) => ({ year: y, value: ind.values[y] }));
      const known = entries.filter((e) => e.value !== undefined);
      const values = known.map((e) => e.value);
      let min = Math.min(...values, 0);
      let max = Math.max(...values, 0);
      const span = max - min || 1;
      min -= span * 0.12;
      max += span * 0.12;

      const xFor = (year) => left + ((year - YEAR_START) / (YEAR_END - YEAR_START)) * plotW;
      const yFor = (value) => top + plotH - ((value - min) / (max - min)) * plotH;

      // pandemic band
      const bandX1 = xFor(DATA.pandemicRange.start) - (plotW / (YEARS.length - 1)) / 2;
      const bandX2 = xFor(DATA.pandemicRange.end) + (plotW / (YEARS.length - 1)) / 2;
      this.svg.appendChild(el("rect", {
        x: bandX1, y: top, width: bandX2 - bandX1, height: plotH,
        fill: "#9e2a2b", "fill-opacity": "0.08"
      }));
      const bandLabel = el("text", {
        x: (bandX1 + bandX2) / 2, y: top + 14, "text-anchor": "middle",
        class: "data-hub-band-label"
      });
      bandLabel.textContent = DATA.pandemicRange.label;
      this.svg.appendChild(bandLabel);

      // zero line if in range
      if (min < 0 && max > 0) {
        this.svg.appendChild(el("line", {
          x1: left, x2: left + plotW, y1: yFor(0), y2: yFor(0),
          class: "data-hub-zero-line"
        }));
      }

      // x axis ticks every 5 years
      YEARS.filter((y) => y % 5 === 0).forEach((y) => {
        const x = xFor(y);
        this.svg.appendChild(el("line", { x1: x, x2: x, y1: top + plotH, y2: top + plotH + 5, class: "data-hub-tick" }));
        const label = el("text", { x, y: top + plotH + 20, "text-anchor": "middle", class: "data-hub-axis-label" });
        label.textContent = y;
        this.svg.appendChild(label);
      });

      // y axis labels (min/mid/max)
      [min + span * 0.12, (min + max) / 2, max - span * 0.12].forEach((v) => {
        const y = yFor(v);
        const label = el("text", { x: left - 8, y: y + 4, "text-anchor": "end", class: "data-hub-axis-label" });
        label.textContent = `${v.toFixed(1)}%`;
        this.svg.appendChild(label);
      });

      // build path only across contiguous known points, breaking gaps
      const segments = [];
      let current = [];
      entries.forEach((e) => {
        if (e.value !== undefined) {
          current.push({ x: xFor(e.year), y: yFor(e.value), year: e.year, value: e.value });
        } else if (current.length) {
          segments.push(current);
          current = [];
        }
      });
      if (current.length) segments.push(current);

      segments.forEach((seg) => {
        const path = el("path", {
          d: catmullRomPath(seg), fill: "none", stroke: color,
          "stroke-width": "2", class: "data-hub-line"
        });
        this.svg.appendChild(path);
        seg.forEach((p) => {
          this.svg.appendChild(el("circle", {
            cx: p.x, cy: p.y, r: "3.2", fill: "#f7f4ef",
            stroke: color, "stroke-width": "1.6",
            class: "data-hub-dot", "data-year": p.year, "data-value": p.value
          }));
        });
      });

      // invisible hover targets (wider hit area per year)
      const stepW = plotW / (YEARS.length - 1);
      entries.forEach((e) => {
        const hit = el("rect", {
          x: xFor(e.year) - stepW / 2, y: top, width: stepW, height: plotH,
          fill: "transparent", "data-year": e.year
        });
        hit.addEventListener("mouseenter", () => this.showTooltip(e, xFor(e.year), yFor(e.value ?? min)));
        hit.addEventListener("mouseleave", () => this.hideTooltip());
        this.svg.appendChild(hit);
      });

      // meta / source line
      this.metaEl.innerHTML = `<span>${ind.nameEn}</span><span class="data-hub-meta-dot">·</span><span>${ind.note}</span>`;

      // table
      this.tableWrap.innerHTML = `
        <table>
          <thead><tr><th>Year</th><th>${ind.name} (${ind.unit})</th></tr></thead>
          <tbody>
            ${entries.map((e) => `
              <tr class="${e.year >= DATA.pandemicRange.start && e.year <= DATA.pandemicRange.end ? "is-pandemic" : ""}">
                <td>${e.year}</td><td>${e.value === undefined ? "—" : e.value.toFixed(1)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
        <p class="data-hub-source">Source: <a href="${ind.sourceUrl}" target="_blank" rel="noopener">${ind.source}</a></p>
      `;
    }

    showTooltip(entry, x, y) {
      if (entry.value === undefined) { this.hideTooltip(); return; }
      const rect = this.svg.getBoundingClientRect();
      const scaleX = rect.width / this.width;
      const scaleY = rect.height / this.height;
      this.tooltip.hidden = false;
      this.tooltip.style.left = `${x * scaleX}px`;
      this.tooltip.style.top = `${y * scaleY}px`;
      const pandemic = entry.year >= DATA.pandemicRange.start && entry.year <= DATA.pandemicRange.end;
      this.tooltip.innerHTML = `<b>${entry.year}</b><span>${entry.value.toFixed(1)}%</span>${pandemic ? '<em>Pandemic window</em>' : ""}`;
    }

    hideTooltip() {
      this.tooltip.hidden = true;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const mount = document.querySelector("[data-hub]");
    if (mount) new DataHub(mount);
  });
})();
