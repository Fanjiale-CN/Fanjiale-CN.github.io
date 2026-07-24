import { getMotionState, subscribeToMotion } from "/be-a-viewer/xian/xian-motion.js?v=1";

const { reducedMotion, touchNavigation } = getMotionState();
const pageBody = document.body;
const siteNav = document.querySelector(".xian-site-nav");
const storyNav = document.querySelector("[data-xian-story-nav]");
const hero = document.querySelector(".xian-hero");
const storyLinks = [...(storyNav?.querySelectorAll("[data-xian-section-link]") || [])];
const storySections = storyLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const storyProgress = storyNav?.querySelector("[data-xian-story-progress]");
let activeStoryHref = "";
let measuredRevision = -1;
let heroThreshold = 1;
let storyMetrics = [];

if (!reducedMotion) {
  pageBody.classList.add("xian-motion");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => pageBody.classList.add("is-motion-ready"));
  });

  const revealSelectors = [
    ".xian-arrival-copy > *",
    ".xian-editorial-section .xian-section-header > *",
    ".xian-first-empire-copy",
    ".xian-changan-copy",
    ".xian-wall-copy",
    ".xian-night-copy",
    ".xian-editorial-section > .xian-photo",
    ".xian-treasure-chapter > *",
    ".xian-city-beyond > *",
    ".xian-model-copy > *",
    ".xian-next-city > *"
  ];
  const revealItems = [...new Set(revealSelectors.flatMap((selector) => [...document.querySelectorAll(selector)]))];
  revealItems.forEach((item, index) => {
    item.classList.add("xian-reveal");
    item.dataset.xianRevealDelay = String(index % 3);
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9%", threshold: .08 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
}

function measureStory(revision) {
  measuredRevision = revision;
  heroThreshold = Math.max(1, (hero?.offsetHeight || 1) * .68);
  storyMetrics = storySections.map((section) => ({
    section,
    top: section.offsetTop,
    bottom: section.offsetTop + section.offsetHeight
  }));
}

function updateSiteNav(scrollY) {
  siteNav?.classList.toggle("is-scrolled", scrollY > heroThreshold);
}

function setActiveSection(section, touchInput = touchNavigation) {
  if (!section) return;
  const href = `#${section.id}`;
  if (href === activeStoryHref) return;
  activeStoryHref = href;
  storyLinks.forEach((link) => {
    const active = link.getAttribute("href") === href;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  const activeLink = storyLinks.find((link) => link.getAttribute("href") === href);
  if (activeLink && storyNav.scrollWidth > storyNav.clientWidth) {
    const targetLeft = activeLink.offsetLeft - (storyNav.clientWidth - activeLink.offsetWidth) / 2;
    const maxLeft = Math.max(0, storyNav.scrollWidth - storyNav.clientWidth);
    storyNav.scrollTo({
      left: Math.min(maxLeft, Math.max(0, targetLeft)),
      behavior: reducedMotion || touchInput ? "auto" : "smooth"
    });
  }
}

function updateStoryNav(scrollY, viewportHeight) {
  if (!storyNav || !storyMetrics.length) return;
  const start = storyMetrics[0].top;
  const end = storyMetrics.at(-1).bottom - viewportHeight;
  const progress = Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, end - start)));
  if (storyProgress) storyProgress.style.transform = `scaleX(${progress})`;
  const readingLine = scrollY + viewportHeight * .42;
  let active = storyMetrics[0].section;
  storyMetrics.forEach((metric) => {
    if (metric.top <= readingLine) active = metric.section;
  });
  setActiveSection(active);
}

storyLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", link.getAttribute("href"));
  });
});

subscribeToMotion(({ scrollY, viewportHeight, revision }) => {
  if (revision !== measuredRevision) measureStory(revision);
  updateSiteNav(scrollY);
  updateStoryNav(scrollY, viewportHeight);
});

window.addEventListener("load", () => {
  const state = getMotionState();
  measureStory(state.revision);
  updateSiteNav(state.scrollY);
  updateStoryNav(state.scrollY, state.viewportHeight);
}, { once: true });

const lightbox = document.querySelector("[data-xian-lightbox]");
const lightboxImage = lightbox?.querySelector("[data-xian-lightbox-image]");
const lightboxCaption = lightbox?.querySelector("[data-xian-lightbox-caption]");
const lightboxCount = lightbox?.querySelector("[data-xian-lightbox-count]");
const figures = [...document.querySelectorAll(".xian-photo")].filter((figure) => figure.querySelector("img"));
let activeImage = 0;
let returnFocus = null;
let swipeStart = null;

function showImage(index) {
  activeImage = (index + figures.length) % figures.length;
  const image = figures[activeImage].querySelector("img");
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.alt;
  lightboxCount.textContent = `${String(activeImage + 1).padStart(2, "0")} / ${String(figures.length).padStart(2, "0")}`;
}

function openLightbox(index, trigger) {
  if (!lightbox) return;
  returnFocus = trigger;
  showImage(index);
  lightbox.showModal();
}

function closeLightbox() {
  lightbox?.close();
}

figures.forEach((figure, index) => {
  figure.tabIndex = 0;
  figure.setAttribute("role", "button");
  figure.setAttribute("aria-label", `View larger photograph: ${figure.querySelector("img").alt}`);
  figure.addEventListener("click", () => openLightbox(index, figure));
  figure.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openLightbox(index, figure);
  });
});

if (lightbox) {
  lightbox.querySelector("[data-xian-lightbox-close]")?.addEventListener("click", closeLightbox);
  lightbox.querySelector("[data-xian-lightbox-previous]")?.addEventListener("click", () => showImage(activeImage - 1));
  lightbox.querySelector("[data-xian-lightbox-next]")?.addEventListener("click", () => showImage(activeImage + 1));
  lightbox.addEventListener("close", () => {
    returnFocus?.focus({ preventScroll: true });
    returnFocus = null;
  });
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showImage(activeImage - 1);
    if (event.key === "ArrowRight") showImage(activeImage + 1);
  });
  lightbox.querySelector("figure")?.addEventListener("pointerdown", (event) => {
    if (event.isPrimary) swipeStart = event.clientX;
  }, { passive: true });
  lightbox.querySelector("figure")?.addEventListener("pointerup", (event) => {
    if (!event.isPrimary || swipeStart === null) return;
    const distance = event.clientX - swipeStart;
    swipeStart = null;
    if (Math.abs(distance) > 55) showImage(activeImage + (distance < 0 ? 1 : -1));
  }, { passive: true });
}

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});
