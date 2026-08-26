const stream = document.querySelector("[data-radar-stream]");
const rail = document.querySelector("[data-radar-time-rail]");
const status = document.querySelector("[data-radar-status]");
const filters = [...document.querySelectorAll("[data-radar-filter]")];
const dialog = document.querySelector("[data-radar-dialog]");
const closeDialog = document.querySelector("[data-radar-close]");

let editorialSignals = [];
let liveSignals = [];
let signals = [];
let activeFilter = new URL(location.href).searchParams.get("state") || "all";
let returnFocus;
let rowObserver;
let snapshotState = "loading";
let liveState = "loading";

const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replaceAll(String.fromCharCode(34), "&quot;")
  .replaceAll(String.fromCharCode(39), "&#39;");

const safeUrl = (value) => {
  try {
    const url = new URL(value, location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
};

const canonicalUrl = (value) => {
  try {
    const url = new URL(value, location.origin);
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith("utm_")) url.searchParams.delete(key);
    }
    return url.href;
  } catch {
    return "";
  }
};

const dateLabel = (value) => new Intl.DateTimeFormat("en", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC"
}).format(new Date(value));

function normalizeDataset(data, provenance) {
  if (data?.version !== "1.0" || !Array.isArray(data.signals)) throw new Error("Unsupported Radar data");
  const states = new Set(["Signal", "Brief", "Lead", "Archive"]);
  const normalized = [];

  for (const item of data.signals) {
    if (!item.id || !states.has(item.state) || !item.headline || !item.summary || !item.context || !Date.parse(item.updatedAt) || !Array.isArray(item.coverage) || !item.coverage.length) {
      continue;
    }
    if (provenance === "live" && item.state !== "Signal") continue;
    normalized.push({ ...item, provenance });
  }

  return normalized;
}

function mergeSignals() {
  const seenHeadlines = new Set();
  const seenUrls = new Set();
  const merged = [];

  const add = (item) => {
    const headlineKey = item.headline.toLowerCase().replace(/\s+/g, " ").trim();
    const urls = item.coverage.map((source) => canonicalUrl(source.url)).filter(Boolean);
    if (seenHeadlines.has(headlineKey) || urls.some((url) => seenUrls.has(url))) return;

    seenHeadlines.add(headlineKey);
    urls.forEach((url) => seenUrls.add(url));
    merged.push(item);
  };

  editorialSignals.forEach(add);
  liveSignals.forEach(add);
  signals = merged.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function row(item, index) {
  const provenanceLabel = item.provenance === "live" ? "Live candidate" : "Editorial";
  const timePrefix = item.provenance === "live" ? "Discovered" : "Updated";
  return `<article class="radar-row" data-radar-row data-id="${escapeHtml(item.id)}" data-state="${item.state}" data-provenance="${item.provenance}" style="--row:${index}">
    <div class="radar-row__meta">
      <span class="radar-row__state">${item.state}</span>
      <span>${escapeHtml(item.topic)}<br>${escapeHtml(item.geography)}</span>
      <span class="radar-row__provenance">${provenanceLabel}</span>
    </div>
    <div>
      <h2>${escapeHtml(item.headline)}</h2>
      <p class="radar-row__summary">${escapeHtml(item.summary)}</p>
    </div>
    <div class="radar-row__side">
      <time datetime="${item.updatedAt}">${timePrefix} ${dateLabel(item.updatedAt)} UTC</time>
      <button class="radar-row__evidence" type="button" data-radar-evidence="${escapeHtml(item.id)}">${item.coverage.length} source${item.coverage.length === 1 ? "" : "s"} / evidence</button>
    </div>
  </article>`;
}

function updateStatus() {
  const rows = [...document.querySelectorAll("[data-radar-row]")].filter((node) => !node.hidden);
  const editorial = rows.filter((node) => node.dataset.provenance === "editorial").length;
  const live = rows.filter((node) => node.dataset.provenance === "live").length;
  const scope = activeFilter === "all" ? "all" : activeFilter;

  if (snapshotState === "ready" && liveState === "connected") {
    status.textContent = `${editorial} editorial + ${live} live candidate${live === 1 ? "" : "s"} / ${scope}`;
  } else if (snapshotState === "ready" && liveState === "loading") {
    status.textContent = `${editorial} editorial entr${editorial === 1 ? "y" : "ies"} / ${scope} · checking live discovery`;
  } else if (snapshotState === "ready") {
    status.textContent = `${editorial} editorial entr${editorial === 1 ? "y" : "ies"} / ${scope} · live discovery unavailable`;
  } else if (liveState === "connected") {
    status.textContent = `${live} live candidate${live === 1 ? "" : "s"} / ${scope} · editorial snapshot unavailable`;
  } else {
    status.textContent = "Radar data unavailable. Please return shortly.";
  }
}

function render() {
  stream.innerHTML = signals.map(row).join("");
  rail.innerHTML = signals.map((item) => `<li data-radar-time="${escapeHtml(item.id)}">${dateLabel(item.updatedAt)}<br>${escapeHtml(item.state)}</li>`).join("");
  applyFilter(activeFilter, false);
  observeRows();
  document.documentElement.dataset.radarReady = "true";
}

function applyFilter(value, animate = true) {
  activeFilter = ["Signal", "Brief", "Lead", "Archive"].includes(value) ? value : "all";
  const rows = [...document.querySelectorAll("[data-radar-row]")];
  if (animate) rows.forEach((node) => node.classList.add("is-filtering"));

  setTimeout(() => {
    rows.forEach((node) => {
      const show = activeFilter === "all" || node.dataset.state === activeFilter;
      node.hidden = !show;
      node.classList.remove("is-filtering");
    });
    filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.radarFilter === activeFilter)));
    updateStatus();
    document.documentElement.dataset.radarState = activeFilter.toLowerCase();

    const url = new URL(location.href);
    if (activeFilter === "all") url.searchParams.delete("state");
    else url.searchParams.set("state", activeFilter);
    history.replaceState({}, "", url);
  }, animate ? 160 : 0);
}

function openEvidence(id, trigger) {
  const item = signals.find((entry) => entry.id === id);
  if (!item) return;
  returnFocus = trigger;
  const provenanceLabel = item.provenance === "live" ? "LIVE CANDIDATE" : "EDITORIAL";
  dialog.querySelector("[data-radar-dialog-state]").textContent = `${provenanceLabel} / ${item.state} / ${item.topic} / ${item.geography}`;
  dialog.querySelector("[data-radar-dialog-title]").textContent = item.headline;
  dialog.querySelector("[data-radar-dialog-context]").textContent = item.context;
  dialog.querySelector("[data-radar-dialog-sources]").innerHTML = item.coverage.map((source) => `<li><span>${escapeHtml(source.outlet)}</span><a href="${safeUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)} ↗</a></li>`).join("");
  dialog.showModal();
  dialog.querySelector("[data-radar-dialog-title]").focus();
  window.galokTrack?.("radar_evidence_open", { signal_id: item.id, state: item.state, provenance: item.provenance });
}

function observeRows() {
  rowObserver?.disconnect();
  if (!("IntersectionObserver" in window)) return;
  rowObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll("[data-radar-time]").forEach((node) => node.classList.toggle("is-current", node.dataset.radarTime === entry.target.dataset.id));
  }), { rootMargin: "-25% 0px -60%", threshold: 0.1 });
  document.querySelectorAll("[data-radar-row]").forEach((node) => rowObserver.observe(node));
}

async function fetchDataset(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { cache: "no-cache", signal: controller.signal });
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

filters.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.radarFilter)));
stream.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-radar-evidence]");
  if (trigger) openEvidence(trigger.dataset.radarEvidence, trigger);
});
closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => returnFocus?.focus());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

const snapshotRequest = fetchDataset("/radar/signals.json", 4000).then(
  (data) => ({ ok: true, data }),
  (error) => ({ ok: false, error })
);
const liveRequest = fetchDataset("/api/signals/", 3500).then(
  (data) => ({ ok: true, data }),
  (error) => ({ ok: false, error })
);

const snapshotResult = await snapshotRequest;
if (snapshotResult.ok) {
  editorialSignals = normalizeDataset(snapshotResult.data, "editorial");
  snapshotState = editorialSignals.length ? "ready" : "failed";
  mergeSignals();
  if (signals.length) render();
} else {
  snapshotState = "failed";
  console.error(snapshotResult.error);
}

const liveResult = await liveRequest;
if (liveResult.ok) {
  liveSignals = normalizeDataset(liveResult.data, "live").slice(0, 12);
  liveState = liveSignals.length ? "connected" : "offline";
} else {
  liveState = "offline";
  console.info("Radar live discovery unavailable; editorial snapshot remains active.", liveResult.error);
}

mergeSignals();
if (signals.length) {
  render();
} else {
  status.textContent = "Radar data unavailable. Please return shortly.";
  stream.innerHTML = '<p class="radar-error">The signal ledger could not be loaded.</p>';
}
