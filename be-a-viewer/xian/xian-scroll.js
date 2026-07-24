import { getMotionState, subscribeToMotion } from "/be-a-viewer/xian/xian-motion.js?v=1";

const { reducedMotion, touchNavigation } = getMotionState();
const lightTransition = document.querySelector("[data-light-transition]");
const arrival = document.querySelector(".xian-arrival");
const arrivalImage = arrival?.querySelector("img");
const arrivalCopy = arrival?.querySelector(".xian-arrival-copy");

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => {
  const n = clamp(value);
  return n * n * (3 - 2 * n);
};

function updateArrival(viewportHeight) {
  if (!arrival || reducedMotion || touchNavigation) return;
  const rect = arrival.getBoundingClientRect();
  const progress = clamp((viewportHeight - rect.top) / Math.max(1, viewportHeight + rect.height));
  if (arrivalImage) {
    arrivalImage.style.setProperty("--arrival-image-scale", (1.065 - progress * .045).toFixed(4));
    arrivalImage.style.setProperty("--arrival-image-y", `${((progress - .5) * 3.5).toFixed(2)}%`);
  }
  if (arrivalCopy) {
    const exit = smoothstep((progress - .72) / .28);
    arrivalCopy.style.opacity = String(1 - exit * .72);
    arrivalCopy.style.transform = `translate3d(0,${(-exit * 24).toFixed(2)}px,0)`;
  }
}

function updateLight(viewportHeight) {
  if (!lightTransition || reducedMotion || touchNavigation) return;
  const rect = lightTransition.getBoundingClientRect();
  const entry = smoothstep((viewportHeight - rect.top) / Math.max(1, viewportHeight * .72));
  const progress = clamp(-rect.top / Math.max(1, rect.height));
  const image = lightTransition.querySelector("img");
  const copy = lightTransition.querySelector("p");
  const baseScale = Number.parseFloat(getComputedStyle(lightTransition).getPropertyValue("--light-base-scale")) || 1;
  image?.style.setProperty("--light-scale", (baseScale + progress * .045).toFixed(3));
  const exit = smoothstep((progress - .86) / .14);
  const copyOpacity = entry * (1 - exit * .45);
  copy?.style.setProperty("--light-copy-opacity", copyOpacity.toFixed(3));
  copy?.style.setProperty("--light-copy-y", `${((1 - entry) * 22).toFixed(2)}px`);
}

subscribeToMotion(({ viewportHeight }) => {
  updateArrival(viewportHeight);
  updateLight(viewportHeight);
});
