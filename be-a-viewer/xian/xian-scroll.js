import { getMotionState, subscribeToMotion } from "/be-a-viewer/xian/xian-motion.js?v=1";

const { reducedMotion, touchNavigation } = getMotionState();
const army = document.querySelector("[data-army-scroll]");
const armySteps = [...(army?.querySelectorAll("[data-army-step]") || [])];
const armyMeter = army?.querySelector("[data-army-meter]");
const armyImage = army?.querySelector("figure img");
const modelSection = document.querySelector("[data-model-scroll]");
const lightTransition = document.querySelector("[data-light-transition]");
const arrival = document.querySelector(".xian-arrival");
const arrivalImage = arrival?.querySelector("img");
const arrivalCopy = arrival?.querySelector(".xian-arrival-copy");

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => {
  const n = clamp(value);
  return n * n * (3 - 2 * n);
};

function sectionProgress(section, viewportHeight) {
  if (!section) return 0;
  const rect = section.getBoundingClientRect();
  return clamp(-rect.top / Math.max(1, rect.height - viewportHeight));
}

function stepOpacity(progress, start, end) {
  const fade = .075;
  const fadeIn = smoothstep((progress - start) / fade);
  const fadeOut = 1 - smoothstep((progress - (end - fade)) / fade);
  return clamp(Math.min(fadeIn, fadeOut));
}

function updateArmy(viewportHeight) {
  if (!army || reducedMotion) return;
  const progress = sectionProgress(army, viewportHeight);
  const windows = [[-.06, .34], [.30, .67], [.63, .96]];
  armySteps.forEach((step, index) => {
    step.style.setProperty("--army-step-opacity", stepOpacity(progress, ...windows[index]).toFixed(3));
  });
  if (armyMeter) armyMeter.style.transform = `scaleX(${progress})`;
  if (armyImage && !touchNavigation) {
    const exit = smoothstep((progress - .82) / .18);
    armyImage.style.setProperty("--army-image-scale", (1.045 - progress * .035).toFixed(4));
    armyImage.style.setProperty("--army-image-x", `${(-exit * 7).toFixed(2)}%`);
  }
}

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

function updateModel(viewportHeight) {
  if (!modelSection) return;
  const progress = reducedMotion ? 0 : sectionProgress(modelSection, viewportHeight);
  window.dispatchEvent(new CustomEvent("xian-model-progress", { detail: { progress } }));
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
  updateArmy(viewportHeight);
  updateModel(viewportHeight);
  updateLight(viewportHeight);
});
