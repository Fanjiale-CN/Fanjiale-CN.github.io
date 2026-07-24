const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const army = document.querySelector("[data-army-scroll]");
const armySteps = [...(army?.querySelectorAll("[data-army-step]") || [])];
const armyMeter = army?.querySelector("[data-army-meter]");
const armyImage = army?.querySelector("figure img");
const modelSection = document.querySelector("[data-model-scroll]");
const lightTransition = document.querySelector("[data-light-transition]");

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => {
  const n = clamp(value);
  return n * n * (3 - 2 * n);
};

function sectionProgress(section) {
  if (!section) return 0;
  const rect = section.getBoundingClientRect();
  return clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
}

function stepOpacity(progress, start, end) {
  const fade = .075;
  const fadeIn = smoothstep((progress - start) / fade);
  const fadeOut = 1 - smoothstep((progress - (end - fade)) / fade);
  return clamp(Math.min(fadeIn, fadeOut));
}

function updateArmy() {
  if (!army || reducedMotion) return;
  const progress = sectionProgress(army);
  const windows = [[0, .34], [.30, .67], [.63, .96]];
  armySteps.forEach((step, index) => {
    step.style.setProperty("--army-step-opacity", stepOpacity(progress, ...windows[index]).toFixed(3));
  });
  if (armyMeter) armyMeter.style.transform = `scaleX(${progress})`;
  if (armyImage) {
    const exit = smoothstep((progress - .82) / .18);
    armyImage.style.setProperty("--army-image-scale", (1.045 - progress * .035).toFixed(4));
    armyImage.style.setProperty("--army-image-x", `${(-exit * 7).toFixed(2)}%`);
  }
}

function updateModel() {
  if (!modelSection) return;
  const progress = reducedMotion ? 0 : sectionProgress(modelSection);
  window.dispatchEvent(new CustomEvent("xian-model-progress", { detail: { progress } }));
}

function updateLight() {
  if (!lightTransition || reducedMotion) return;
  const progress = sectionProgress(lightTransition);
  const image = lightTransition.querySelector("img");
  const copy = lightTransition.querySelector("p");
  image?.style.setProperty("--light-scale", (1.02 + progress * .04).toFixed(3));
  image?.style.setProperty("--light-clip", `${(10 - progress * 10).toFixed(2)}%`);
  const copyOpacity = stepOpacity(progress, .2, .82);
  copy?.style.setProperty("--light-copy-opacity", copyOpacity.toFixed(3));
}

let frame = 0;
function update() {
  frame = 0;
  updateArmy();
  updateModel();
  updateLight();
}

function requestUpdate() {
  if (!frame) frame = requestAnimationFrame(update);
}

window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", requestUpdate, { passive: true });
update();
