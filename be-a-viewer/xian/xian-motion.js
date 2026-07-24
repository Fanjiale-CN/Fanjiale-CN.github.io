const scrollRoot = document.scrollingElement || document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const touchNavigation = navigator.maxTouchPoints > 0 ||
  window.matchMedia("(hover: none), (pointer: coarse)").matches;
const subscribers = new Set();

document.documentElement.classList.toggle("xian-touch", touchNavigation);

let viewportWidth = Math.max(1, document.documentElement.clientWidth);
let viewportHeight = Math.max(1, document.documentElement.clientHeight);
let scrollY = readScrollY();
let previousY = scrollY;
let revision = 0;
let frame = 0;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readScrollY() {
  const maximum = Math.max(0, scrollRoot.scrollHeight - viewportHeight);
  return clamp(scrollRoot.scrollTop || window.scrollY || 0, 0, maximum);
}

function snapshot() {
  const nextY = readScrollY();
  const state = Object.freeze({
    scrollY: nextY,
    deltaY: nextY - previousY,
    viewportWidth,
    viewportHeight,
    revision,
    reducedMotion,
    touchNavigation
  });
  previousY = nextY;
  scrollY = nextY;
  return state;
}

function update() {
  frame = 0;
  const state = snapshot();
  subscribers.forEach((subscriber) => subscriber(state));
  window.dispatchEvent(new CustomEvent("xian:motion-frame", { detail: state }));
}

function requestUpdate() {
  if (!frame) frame = requestAnimationFrame(update);
}

function refreshViewport(force = false) {
  const nextWidth = Math.max(1, document.documentElement.clientWidth);
  const widthChanged = Math.abs(nextWidth - viewportWidth) > 1;
  if (!force && !widthChanged && touchNavigation) return;

  const nextHeight = Math.max(1, document.documentElement.clientHeight);
  if (!force && !widthChanged && Math.abs(nextHeight - viewportHeight) <= 1) return;

  viewportWidth = nextWidth;
  viewportHeight = nextHeight;
  revision += 1;
  requestUpdate();
}

export function subscribeToMotion(subscriber) {
  subscribers.add(subscriber);
  requestUpdate();
  return () => subscribers.delete(subscriber);
}

export function getMotionState() {
  return {
    scrollY,
    viewportWidth,
    viewportHeight,
    revision,
    reducedMotion,
    touchNavigation
  };
}

window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", () => refreshViewport(), { passive: true });
window.addEventListener("orientationchange", () => refreshViewport(true), { passive: true });
window.addEventListener("pageshow", () => {
  refreshViewport(true);
  requestUpdate();
}, { passive: true });
