(() => {
  const DATA = window.GALOK_DATA;
  if (!DATA?.indicators?.length) return;

  const YEAR_START = DATA.range.start;
  const YEAR_END = DATA.range.end;
  const YEARS = Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, index) => YEAR_START + index);
  const SVG_NS = "http://www.w3.org/2000/svg";

  const svgElement = (tag, attrs = {}) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };

  const formatValue = (value, digits = 1) => `${Number(value).toFixed(digits)}%`;

  function seriesColor(seriesKey) {
    const colors = {
      macro: "#b52d27",
      frame: "#315f76",
      scene: "#9b7624",
      observe: "#4e6750"
    };
    return colors[seriesKey] || "#1c1a17";
  }

  function linePath(points) {
    return points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  }

  function profileIndicator(indicator) {
    const entries = YEARS.map((year) => ({ year, value: indicator.values[year] }));
    const known = entries.filter((entry) => Number.isFinite(entry.value));
    const latest = known.at(-1);
    const average = known.reduce((sum, entry) => sum + entry.value, 0) / known.length;
    const high = known.reduce((best, entry) => entry.value > best.value ? entry : best, known[0]);
    const low = known.reduce((best, entry) => entry.value < best.value ? entry : best, known[0]);
    return { entries, known, latest, average, high, low };
  }

  function downloadCsv(indicators, filename) {
    const headings = ["year", ...indicators.map((indicator) => indicator.indicatorCode)];
    const rows = YEARS.map((year) => [
      year,
      ...indicators.map((indicator) => Number.isFinite(indicator.values[year]) ? indicator.values[year].toFixed(3) : "")
    ]);
    const notes = indicators.map((indicator) => `# ${indicator.indicatorCode}: ${indicator.nameEn}`).join("\n");
    const csv = `${notes}\n# Source: ${DATA.source}; updated ${DATA.lastUpdated}; ${DATA.license}\n${[headings, ...rows].map((row) => row.join(",")).join("\n")}\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  class DataHub {
    constructor(mount) {
      this.mount = mount;
      this.width = 1040;
      this.height = 440;
      this.padding = { top: 52, right: 28, bottom: 42, left: 58 };
      this.activeId = DATA.indicators[0].id;
      this.selectedYear = YEAR_END;
      this.build();
      this.render();
    }

    build() {
      this.mount.innerHTML = `
        <header class="data-hub-header">
          <div>
            <p class="data-hub-overline">SELECT A SERIES</p>
            <h2>Annual change / percent</h2>
          </div>
          <span>${DATA.range.label}</span>
        </header>
        <div class="data-hub-controls" aria-label="Choose an economic indicator"></div>
        <div class="data-hub-panel" data-series-panel>
        <div class="data-hub-reading" aria-live="polite">
          <div class="data-hub-reading-title"><span data-active-code></span><h3 data-active-name></h3><p data-active-note></p></div>
          <dl class="data-hub-stat-grid">
            <div><dt>Latest</dt><dd data-stat-latest></dd><small data-stat-latest-year></small></div>
            <div><dt>Period average</dt><dd data-stat-average></dd><small>2000—2024</small></div>
            <div><dt>High</dt><dd data-stat-high></dd><small data-stat-high-year></small></div>
            <div><dt>Low</dt><dd data-stat-low></dd><small data-stat-low-year></small></div>
          </dl>
        </div>
        <div class="data-hub-chart-wrap" tabindex="0" role="group" aria-label="Chart. Use left and right arrow keys to inspect years.">
          <svg class="data-hub-svg" viewBox="0 0 ${this.width} ${this.height}" role="img"></svg>
          <div class="data-hub-tooltip" hidden></div>
        </div>
        <div class="data-hub-year-readout" aria-live="polite"><span data-readout-year></span><strong data-readout-value></strong><span data-readout-context></span></div>
        <div class="data-hub-meta"></div>
        <details class="data-hub-table-wrap">
          <summary>View the complete year-by-year series</summary>
          <div class="data-hub-table"></div>
        </details></div>
      `;

      this.controls = this.mount.querySelector(".data-hub-controls");
      this.svg = this.mount.querySelector(".data-hub-svg");
      this.chartWrap = this.mount.querySelector(".data-hub-chart-wrap");
      this.tooltip = this.mount.querySelector(".data-hub-tooltip");
      this.metaEl = this.mount.querySelector(".data-hub-meta");
      this.tableWrap = this.mount.querySelector(".data-hub-table");
      this.tooltipShowFrame = 0;
      this.tooltipHideTimer = 0;

      DATA.indicators.forEach((indicator, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "data-hub-tab";
        button.dataset.id = indicator.id;
        button.setAttribute("aria-pressed", "false");
        button.style.setProperty("--series-color", seriesColor(indicator.series));
        button.innerHTML = `<span>0${index + 1}</span><b>${indicator.name}</b>`;
        button.addEventListener("click", () => this.selectIndicator(indicator.id));
        button.addEventListener("keydown", (event) => this.handleTabKey(event, index));
        this.controls.appendChild(button);
      });

      this.chartWrap.addEventListener("keydown", (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Home") this.selectedYear = YEAR_START;
        else if (event.key === "End") this.selectedYear = YEAR_END;
        else this.selectedYear = Math.max(YEAR_START, Math.min(YEAR_END, this.selectedYear + (event.key === "ArrowRight" ? 1 : -1)));
        this.updateSelection(true);
      });

      this.svg.addEventListener("pointermove", (event) => {
        const rect = this.svg.getBoundingClientRect();
        const { left, right } = this.padding;
        const plotWidth = this.width - left - right;
        const x = ((event.clientX - rect.left) / rect.width) * this.width;
        const ratio = Math.max(0, Math.min(1, (x - left) / plotWidth));
        this.selectedYear = Math.round(YEAR_START + ratio * (YEAR_END - YEAR_START));
        this.updateSelection(event.pointerType !== "touch");
      });
      this.svg.addEventListener("pointerleave", () => this.hideTooltip());
      this.svg.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "touch") this.updateSelection(false);
      });

      this.tableWrap.addEventListener("click", (event) => {
        if (event.target.closest("[data-download-current]")) {
          const indicator = this.currentIndicator();
          downloadCsv([indicator], `galok-${indicator.id}-${YEAR_START}-${YEAR_END}.csv`);
        }
      });
    }

    handleTabKey(event, index) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = DATA.indicators.length - 1;
      else next = (index + (event.key === "ArrowRight" ? 1 : -1) + DATA.indicators.length) % DATA.indicators.length;
      this.selectIndicator(DATA.indicators[next].id);
      this.controls.children[next]?.focus();
    }

    selectIndicator(id) {
      this.activeId = id;
      this.selectedYear = YEAR_END;
      this.render();
    }

    currentIndicator() {
      return DATA.indicators.find((indicator) => indicator.id === this.activeId);
    }

    render() {
      const indicator = this.currentIndicator();
      const profile = profileIndicator(indicator);
      const color = seriesColor(indicator.series);

      [...this.controls.children].forEach((button) => {
        const active = button.dataset.id === indicator.id;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
        button.tabIndex = active ? 0 : -1;
      });

      this.mount.querySelector("[data-active-code]").textContent = indicator.indicatorCode;
      this.mount.querySelector("[data-active-name]").textContent = indicator.nameEn;
      this.mount.querySelector("[data-active-note]").textContent = indicator.note;
      this.mount.querySelector("[data-stat-latest]").textContent = formatValue(profile.latest.value);
      this.mount.querySelector("[data-stat-latest-year]").textContent = profile.latest.year;
      this.mount.querySelector("[data-stat-average]").textContent = formatValue(profile.average);
      this.mount.querySelector("[data-stat-high]").textContent = formatValue(profile.high.value);
      this.mount.querySelector("[data-stat-high-year]").textContent = profile.high.year;
      this.mount.querySelector("[data-stat-low]").textContent = formatValue(profile.low.value);
      this.mount.querySelector("[data-stat-low-year]").textContent = profile.low.year;

      this.svg.replaceChildren();
      const title = svgElement("title");
      title.textContent = `${indicator.nameEn}, ${YEAR_START} to ${YEAR_END}`;
      const description = svgElement("desc");
      description.textContent = `${profile.known.length} annual percentage-change observations. Latest value ${formatValue(profile.latest.value)} in ${profile.latest.year}.`;
      this.svg.append(title, description);

      const { top, right, bottom, left } = this.padding;
      const plotWidth = this.width - left - right;
      const plotHeight = this.height - top - bottom;
      const values = profile.known.map((entry) => entry.value);
      let minimum = Math.min(...values, 0);
      let maximum = Math.max(...values, 0);
      const rawSpan = maximum - minimum || 1;
      minimum -= rawSpan * 0.12;
      maximum += rawSpan * 0.12;

      this.xFor = (year) => left + ((year - YEAR_START) / (YEAR_END - YEAR_START)) * plotWidth;
      this.yFor = (value) => top + plotHeight - ((value - minimum) / (maximum - minimum)) * plotHeight;

      const bandStart = this.xFor(DATA.disruptionRange.start) - plotWidth / (YEARS.length - 1) / 2;
      const bandEnd = this.xFor(DATA.disruptionRange.end) + plotWidth / (YEARS.length - 1) / 2;
      this.svg.appendChild(svgElement("rect", {
        x: bandStart,
        y: top,
        width: bandEnd - bandStart,
        height: plotHeight,
        class: "data-hub-band"
      }));

      const bandLabel = svgElement("text", {
        x: (bandStart + bandEnd) / 2,
        y: top - 18,
        "text-anchor": "middle",
        class: "data-hub-band-label"
      });
      bandLabel.textContent = DATA.disruptionRange.label;
      this.svg.appendChild(bandLabel);

      for (let index = 0; index < 5; index += 1) {
        const value = minimum + ((maximum - minimum) * index) / 4;
        const y = this.yFor(value);
        this.svg.appendChild(svgElement("line", { x1: left, x2: left + plotWidth, y1: y, y2: y, class: "data-hub-grid-line" }));
        const label = svgElement("text", { x: left - 12, y: y + 4, "text-anchor": "end", class: "data-hub-axis-label" });
        label.textContent = formatValue(value);
        this.svg.appendChild(label);
      }

      YEARS.filter((year) => year % 5 === 0 || year === YEAR_END).forEach((year) => {
        const x = this.xFor(year);
        const label = svgElement("text", { x, y: top + plotHeight + 28, "text-anchor": "middle", class: "data-hub-axis-label" });
        label.textContent = year;
        this.svg.appendChild(label);
      });

      const points = profile.known.map((entry) => ({ ...entry, x: this.xFor(entry.year), y: this.yFor(entry.value) }));
      this.svg.appendChild(svgElement("path", {
        d: linePath(points),
        fill: "none",
        stroke: color,
        "stroke-width": "3",
        class: "data-hub-line"
      }));
      points.forEach((point) => {
        this.svg.appendChild(svgElement("circle", {
          cx: point.x,
          cy: point.y,
          r: "3.5",
          fill: "#f1eee7",
          stroke: color,
          "stroke-width": "2",
          class: "data-hub-dot"
        }));
      });

      this.selectionLine = svgElement("line", { class: "data-hub-selection-line" });
      this.selectionDot = svgElement("circle", { r: "6", fill: color, class: "data-hub-selection-dot" });
      this.svg.append(this.selectionLine, this.selectionDot);

      this.metaEl.innerHTML = `
        <div><span>Source</span><a href="${indicator.sourceUrl}" target="_blank" rel="noopener">${indicator.source} ↗</a></div>
        <div><span>Indicator</span><b>${indicator.indicatorCode}</b></div>
        <div><span>Coverage</span><b>${profile.known.length} / ${YEARS.length} years · complete</b></div>
        <p>${indicator.sourceDetail}</p>
      `;

      this.tableWrap.innerHTML = `
        <div class="data-hub-table-actions"><p>${indicator.nameEn} · values retain three decimal places</p><button type="button" data-download-current>Download this series (.csv)</button></div>
        <table>
          <thead><tr><th scope="col">Year</th><th scope="col">${indicator.name} (${indicator.unit})</th><th scope="col">Window</th></tr></thead>
          <tbody>${profile.entries.map((entry) => `
            <tr class="${entry.year >= DATA.disruptionRange.start && entry.year <= DATA.disruptionRange.end ? "is-disruption" : ""}">
              <th scope="row">${entry.year}</th><td>${entry.value.toFixed(3)}</td><td>${entry.year >= DATA.disruptionRange.start && entry.year <= DATA.disruptionRange.end ? "Disruption" : "—"}</td>
            </tr>`).join("")}</tbody>
        </table>
      `;

      this.updateSelection(false);
      window.requestAnimationFrame(() => {
        if (window.matchMedia("(max-width: 640px)").matches) {
          this.chartWrap.scrollLeft = this.chartWrap.scrollWidth - this.chartWrap.clientWidth;
        }
      });
    }

    updateSelection(showTooltip) {
      const indicator = this.currentIndicator();
      const value = indicator.values[this.selectedYear];
      if (!Number.isFinite(value)) return;
      const x = this.xFor(this.selectedYear);
      const y = this.yFor(value);
      const chartBottom = this.height - this.padding.bottom;
      this.selectionLine.setAttribute("x1", x);
      this.selectionLine.setAttribute("x2", x);
      this.selectionLine.setAttribute("y1", this.padding.top);
      this.selectionLine.setAttribute("y2", chartBottom);
      this.selectionDot.setAttribute("cx", x);
      this.selectionDot.setAttribute("cy", y);

      this.mount.querySelector("[data-readout-year]").textContent = this.selectedYear;
      this.mount.querySelector("[data-readout-value]").textContent = formatValue(value);
      this.mount.querySelector("[data-readout-context]").textContent = `${indicator.name} · annual change`;

      if (showTooltip) this.showTooltip(this.selectedYear, value, x, y);
      else this.hideTooltip();
    }

    showTooltip(year, value, x, y) {
      const rect = this.svg.getBoundingClientRect();
      this.tooltip.style.left = `${this.svg.offsetLeft + (x / this.width) * rect.width}px`;
      this.tooltip.style.top = `${this.svg.offsetTop + (y / this.height) * rect.height}px`;
      this.tooltip.innerHTML = `<b>${year}</b><span>${formatValue(value)}</span>`;
      window.clearTimeout(this.tooltipHideTimer);
      this.tooltipHideTimer = 0;
      if (this.tooltip.hidden) {
        this.tooltip.hidden = false;
        this.tooltipShowFrame = window.requestAnimationFrame(() => {
          this.tooltip.classList.add("is-visible");
          this.tooltipShowFrame = 0;
        });
      } else if (!this.tooltipShowFrame) {
        this.tooltip.classList.add("is-visible");
      }
    }

    hideTooltip() {
      if (this.tooltip.hidden) return;
      window.cancelAnimationFrame(this.tooltipShowFrame);
      this.tooltipShowFrame = 0;
      this.tooltip.classList.remove("is-visible");
      window.clearTimeout(this.tooltipHideTimer);
      this.tooltipHideTimer = window.setTimeout(() => {
        if (!this.tooltip.classList.contains("is-visible")) this.tooltip.hidden = true;
        this.tooltipHideTimer = 0;
      }, 160);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const mount = document.querySelector("[data-hub]");
    if (mount) new DataHub(mount);
    document.querySelector("[data-download-all]")?.addEventListener("click", () => {
      downloadCsv(DATA.indicators, `galok-china-data-${YEAR_START}-${YEAR_END}.csv`);
    });

    const articleNav = document.querySelector(".data-article-nav");
    const navLinks = [...document.querySelectorAll(".data-article-nav a[href^='#']")];
    const sections = [...document.querySelectorAll("[data-section]")];
    const progress = document.querySelector("[data-reading-progress]");
    if (articleNav && navLinks.length && sections.length) {
      const updateReadingState = () => {
        const marker = Math.min(window.innerHeight * 0.38, 340);
        let current = sections[0].id;
        sections.forEach((section) => {
          if (section.getBoundingClientRect().top <= marker) current = section.id;
        });
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${current}`;
          link.classList.toggle("is-active", active);
          if (active) {
            link.setAttribute("aria-current", "location");
            if (!articleNav.classList.contains("chapter-rail") && articleNav.scrollWidth > articleNav.clientWidth) {
              const linkStart = link.offsetLeft;
              const linkEnd = linkStart + link.offsetWidth;
              const viewStart = articleNav.scrollLeft;
              const viewEnd = viewStart + articleNav.clientWidth;
              if (linkStart < viewStart || linkEnd > viewEnd) {
                articleNav.scrollTo({ left: Math.max(0, linkStart - articleNav.clientWidth / 2 + link.offsetWidth / 2), behavior: "auto" });
              }
            }
          }
          else link.removeAttribute("aria-current");
        });
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
        progress?.style.setProperty("--reading-progress", `${(ratio * 100).toFixed(2)}%`);
      };
      let ticking = false;
      const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          updateReadingState();
          ticking = false;
        });
      };
      updateReadingState();
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate);
    }

    if ("IntersectionObserver" in window) {
      const revealTargets = [...document.querySelectorAll("[data-section] .data-wide-figure figcaption")];
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealObserver.unobserve(entry.target);
          const bounds = entry.target.getBoundingClientRect();
          if (bounds.bottom <= 0 || bounds.top < window.innerHeight * 0.35) {
            entry.target.classList.remove("data-reveal-once");
            return;
          }
          entry.target.classList.add("is-revealing");
          entry.target.getBoundingClientRect();
          window.requestAnimationFrame(() => {
            entry.target.classList.add("is-revealed");
            window.setTimeout(() => {
              entry.target.classList.remove("data-reveal-once", "is-revealing", "is-revealed");
            }, 180);
          });
        });
      }, { rootMargin: "0px 0px -12%", threshold: 0.15 });

      revealTargets.forEach((target) => {
        if (target.getBoundingClientRect().top < window.innerHeight) return;
        target.classList.add("data-reveal-once");
        revealObserver.observe(target);
      });
    }
  });
})();
