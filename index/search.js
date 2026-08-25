const typeLabels = {
  city: "Cities",
  essay: "Essays",
  research: "Research",
  data: "Data",
  project: "Projects",
  visual: "Visual Notes",
  site: "Galok"
};

const escapeHtml = (value = "") => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
const normalizeQuery = (value) => value.replace(/[\u3400-\u9fff]/g, (character) => `${character} `).replace(/\s+/g, " ").trim();
const typeForUrl = (url) => {
  const path = new URL(url, window.location.origin).pathname;
  if (path.startsWith("/be-a-viewer/") || path.startsWith("/cities/")) return "city";
  if (path.startsWith("/essays/")) return "essay";
  if (path.startsWith("/research/")) return "research";
  if (path.startsWith("/data/")) return "data";
  if (path.startsWith("/visual-notes/")) return "visual";
  if (path.startsWith("/work/") || path.startsWith("/design/") || path.startsWith("/postcards/")) return "project";
  return "site";
};

const mount = document.querySelector("[data-archive-results]");
const input = document.querySelector("[data-archive-search]");
const indexSection = document.querySelector("[data-archive-index]");
const count = document.querySelector("[data-archive-count]");
const buttons = [...document.querySelectorAll("[data-archive-filter]")];
let activeType = "all";
let catalog = [];
let pagefind;
let timer;
let lastTrackedQuery = "";

const setIndexVisible = (visible) => {
  if (!indexSection) return;
  indexSection.hidden = !visible;
  indexSection.classList.toggle("is-visible", visible);
};

const render = (entries, message = "") => {
  if (count) count.textContent = `${entries.length} ${entries.length === 1 ? "result" : "results"}`;
  mount.innerHTML = entries.length ? entries.map((entry, order) => `
    <a class="archive-result is-entering" data-archive-result-type="${entry.type}" style="--result-order:${order}" href="${escapeHtml(entry.url)}">
      <span>${escapeHtml(typeLabels[entry.type] || entry.label || "Galok")}</span>
      <h2>${escapeHtml(entry.title)}</h2>
      <p>${entry.excerptHtml ? entry.excerpt : escapeHtml(entry.excerpt || "Open the original page →")}</p>
    </a>`).join("") : `<p class="archive-empty is-entering">${message || "No matching entries. Try a city, subject or wider term."}</p>`;
  requestAnimationFrame(() => mount.querySelectorAll(".is-entering").forEach((node) => node.classList.remove("is-entering")));
};

const catalogEntries = () => catalog.filter((entry) => activeType === "all" || entry.type === activeType);
const updateUrl = (query) => {
  const url = new URL(window.location.href);
  if (query) url.searchParams.set("q", query); else url.searchParams.delete("q");
  history.replaceState({}, "", url);
};

async function queryPagefind(query) {
  if (!pagefind) pagefind = await import("/pagefind/pagefind.js");
  const response = await pagefind.search(normalizeQuery(query), {
    filters: activeType === "all" ? {} : { type: typeLabels[activeType] }
  });
  const found = await Promise.all(response.results.slice(0, 48).map((result) => result.data()));
  return found.map((result) => ({
    type: typeForUrl(result.url),
    url: new URL(result.url, window.location.origin).pathname,
    title: result.meta?.title || result.title || "Galok",
    excerpt: result.excerpt || "Open the original page →",
    excerptHtml: true
  })).filter((entry) => activeType === "all" || entry.type === activeType);
}

async function search() {
  const query = input.value.trim();
  updateUrl(query);
  if (query.length >= 2 && query !== lastTrackedQuery) {
    lastTrackedQuery = query;
    window.galokTrack?.("archive_search", { query_length: query.length, filter: activeType });
  }
  if (!query) {
    const entries = catalogEntries();
    setIndexVisible(activeType === "all");
    if (activeType === "all") { mount.innerHTML = ""; if (count) count.textContent = `${catalog.length} entries`; }
    else render(entries, "No entries in this format yet.");
    return;
  }
  setIndexVisible(false);
  mount.innerHTML = '<p class="archive-empty">Searching the full archive…</p>';
  try {
    render(await queryPagefind(query));
  } catch (error) {
    console.error(error);
    render([], "Search is preparing. Refresh in a moment and try again.");
  }
}

async function initialize() {
  try {
    const response = await fetch("/index/search-catalog.json", { cache: "no-cache" });
    catalog = await response.json();
    const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
    input.value = initialQuery;
    await search();
    document.documentElement.dataset.discoveryReady = "true";
  } catch (error) {
    console.error(error);
    render([], "The archive catalog could not load.");
  }
}

input.addEventListener("input", () => { clearTimeout(timer); timer = window.setTimeout(search, 120); });
buttons.forEach((button) => button.addEventListener("click", () => {
  activeType = button.dataset.archiveFilter;
  buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
  search();
}));

mount.addEventListener("click", (event) => {
  const result = event.target.closest("a.archive-result");
  if (!result) return;
  window.galokTrack?.("archive_result_open", {
    result_type: result.dataset.archiveResultType || "site",
    result_title: result.querySelector("h2")?.textContent || "Galok",
    destination: new URL(result.href, window.location.origin).pathname
  });
});

initialize();
