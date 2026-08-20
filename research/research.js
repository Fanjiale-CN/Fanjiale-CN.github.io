(() => {
  const number = new Intl.NumberFormat("en", { maximumFractionDigits: 2, signDisplay: "exceptZero" });

  function cleanLabel(value) {
    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .replace("Alt 1982 Shifter", "1982 shifter")
      .replace("Exclude Automotive", "Excluding automotive")
      .replace("Exclude Electronics", "Excluding electronics")
      .replace("Baseline Employment", "Baseline employment")
      .replace("Full Baseline", "Full baseline composition")
      .replace("Log Primary Job Income", "Log primary-job income")
      .replace("Weekly Hours", "Weekly hours")
      .replace("Labor Contract", "Labor contract")
      .replace("Insurance Count", "Insurance count")
      .replace("Employed 2012", "Employment")
      .replace("Age 2012", "Age")
      .replace("Male 2012", "Male share")
      .replace("Edu 2012", "Education")
      .replace("Urban 2012", "Urban share");
  }

  function tooltip(mount) {
    const node = document.createElement("div");
    node.className = "research-chart-tooltip";
    node.setAttribute("aria-live", "polite");
    mount.append(node);
    return (entries) => {
      node.innerHTML = entries.map(([key, value]) => `<span>${key}<br><b>${value}</b></span>`).join("");
    };
  }

  function bindRows(mount, update) {
    const rows = [...mount.querySelectorAll("button")];
    rows.forEach((row) => {
      const show = () => update(JSON.parse(row.dataset.detail));
      row.addEventListener("mouseenter", show);
      row.addEventListener("focus", show);
      row.addEventListener("click", show);
    });
    rows[0]?.focus({ preventScroll: true });
    rows[0]?.blur();
  }

  function renderBars(mount, data, figureNumber) {
    const specs = {
      1: { key: "change_pct", label: "indicator", extent: 20, unit: "%", evidence: "Descriptive" },
      2: { key: "rmb_trillion", label: "item", extent: 12, unit: " RMB tn", evidence: "Different financing concepts" },
      3: { key: "published_effect_pct", label: "outcome", extent: 10, unit: "%", evidence: "Published benchmark" },
      5: { key: "effect_pp_per_sd", label: "outcome", extent: 4, unit: " pp / SD", evidence: "Qualified; mortgage fragile" },
    };
    const spec = specs[figureNumber];
    const rows = data.map((item) => {
      const value = Number(item[spec.key]);
      const end = 50 + (value / spec.extent) * 50;
      const left = value < 0 ? end : 50;
      const width = Math.abs(end - 50);
      const detail = JSON.stringify({ label: item[spec.label], value, unit: spec.unit, evidence: spec.evidence, ...item });
      return `<button class="research-bar-row ${value < 0 ? "is-negative" : "is-positive"}" type="button" data-detail='${detail.replaceAll("'", "&#39;")}'>
        <span>${item[spec.label]}</span>
        <span class="research-bar-track" style="--bar-left:${left}%;--bar-width:${width}%;--bar-color:${value < 0 ? "var(--research-red)" : "var(--research-blue)"}"><i></i></span>
        <strong>${number.format(value)}${spec.unit}</strong>
      </button>`;
    }).join("");
    mount.innerHTML = `<div class="research-bars">${rows}</div>`;
    const update = tooltip(mount);
    bindRows(mount, (item) => update([
      ["Measure", item.label],
      ["Estimate", `${number.format(item.value)}${item.unit}`],
      ["Evidence", item.evidence],
      ["Source", figureNumber === 1 ? "NBS" : figureNumber === 2 ? "PBC" : figureNumber === 3 ? "Giuntella, Lu & Wang" : "Galok / CFPS public-use"],
    ]));
  }

  function renderCoefficients(mount, data) {
    const min = -5;
    const max = 2;
    const position = (value) => ((Number(value) - min) / (max - min)) * 100;
    const rows = data.map((item) => {
      const label = `${cleanLabel(item.variant)} / ${cleanLabel(item.controls)}`;
      const detail = JSON.stringify({ label, ...item });
      return `<button class="research-coefficient-row" type="button" data-detail='${detail.replaceAll("'", "&#39;")}'>
        <span>${label}</span>
        <span class="research-coefficient-track" style="--ci-left:${position(item.ci95_low_pp)}%;--ci-right:${position(item.ci95_high_pp)}%;--point:${position(item.effect_pp_per_sd)}%"></span>
        <strong>${number.format(item.effect_pp_per_sd)} pp</strong>
      </button>`;
    }).join("");
    mount.innerHTML = `<div class="research-coefficients">${rows}</div>`;
    const update = tooltip(mount);
    bindRows(mount, (item) => update([
      ["Specification", item.label],
      ["Estimate", `${number.format(item.effect_pp_per_sd)} pp / SD`],
      ["95% CI", `${number.format(item.ci95_low_pp)} to ${number.format(item.ci95_high_pp)}`],
      ["Evidence", "QUALIFIED"],
    ]));
  }

  function renderDots(mount, data) {
    const position = (value) => ((Number(value) + 1) / 2) * 100;
    const rows = data.map((item) => {
      const label = cleanLabel(item.baseline_covariate);
      const detail = JSON.stringify({ label, ...item });
      return `<button class="research-dot-row" type="button" data-detail='${detail.replaceAll("'", "&#39;")}'>
        <span>${label}</span>
        <span class="research-dot-track" style="--point:${position(item.pearson_r)}%"></span>
        <strong>r ${number.format(item.pearson_r)}</strong>
      </button>`;
    }).join("");
    mount.innerHTML = `<div class="research-dots">${rows}</div>`;
    const update = tooltip(mount);
    bindRows(mount, (item) => update([
      ["Baseline covariate", item.label],
      ["Pearson r", number.format(item.pearson_r)],
      ["p-value", Number(item.pearson_p).toPrecision(3)],
      ["Evidence", "Identification diagnostic"],
    ]));
  }

  function appendAccessibleTable(mount, data, figureNumber) {
    const columns = {
      4: ["variant", "controls", "effect_pp_per_sd", "ci95_low_pp", "ci95_high_pp", "first_stage_F"],
      5: ["outcome", "effect_pp_per_sd", "p_all", "p_no_municipalities", "bh_q_all"],
      6: ["outcome", "beta_security_sd", "ci_low", "ci_high", "p", "n_obs"],
      7: ["baseline_covariate", "pearson_r", "pearson_p", "ols_beta", "ols_p_hc1", "n_province"],
    }[figureNumber];
    if (!columns) return;
    const details = document.createElement("details");
    details.className = "research-chart-data";
    details.innerHTML = `<summary>Accessible figure data</summary><div><table><thead><tr>${columns.map((column) => `<th>${cleanLabel(column)}</th>`).join("")}</tr></thead><tbody>${data.map((item) => `<tr>${columns.map((column) => `<td>${typeof item[column] === "number" ? number.format(item[column]) : cleanLabel(item[column])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    mount.after(details);
  }

  async function initCharts() {
    const figures = [...document.querySelectorAll("[data-research-figure]")];
    await Promise.all(figures.map(async (figure) => {
      const mount = figure.querySelector("[data-research-chart]");
      const status = figure.querySelector("[data-chart-status]");
      const figureNumber = Number(figure.dataset.researchFigure);
      try {
        const response = await fetch(mount.dataset.chartSrc);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if ([1, 2, 3, 5].includes(figureNumber)) renderBars(mount, data, figureNumber);
        if (figureNumber === 4) renderCoefficients(mount, data);
        if (figureNumber === 7) renderDots(mount, data);
        appendAccessibleTable(mount, data, figureNumber);
        if (status) status.textContent = figureNumber === 6
          ? "Static SVG coefficient plot. Open the accessible data table for exact values."
          : "Hover, focus or tap a row for estimate, source and evidence detail.";
      } catch (error) {
        if (status) status.textContent = "Interactive layer unavailable. The static figure or manuscript table remains visible.";
      }
    }));
  }

  function initReadingProgress() {
    const bar = document.querySelector("[data-research-progress]");
    if (!bar) return;
    const update = () => {
      const maximum = document.documentElement.scrollHeight - innerHeight;
      const progress = maximum > 0 ? Math.min(100, (scrollY / maximum) * 100) : 0;
      bar.style.setProperty("--reading-progress", `${progress}%`);
      bar.style.width = `${progress}%`;
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }

  function initToc() {
    const links = [...document.querySelectorAll("[data-toc-link]")];
    const sections = links.map((link) => document.getElementById(link.dataset.tocLink)).filter(Boolean);
    if (!sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      links.forEach((link) => link.classList.toggle("is-active", link.dataset.tocLink === visible.target.id));
    }, { rootMargin: "-16% 0px -74%", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
  }

  document.querySelectorAll(".research-manuscript a[href^='http']").forEach((link) => {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  initReadingProgress();
  initToc();
  initCharts();
})();
