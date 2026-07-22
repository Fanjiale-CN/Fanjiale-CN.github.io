import * as THREE from "/assets/vendor/three/three.module.min.js";
import { GLTFLoader } from "/assets/vendor/three/loaders/GLTFLoader.js";
import { OrbitControls } from "/assets/vendor/three/controls/OrbitControls.js";

const MODEL_URL = "/assets/models/xian/terracotta-warrior.glb";
const MODEL_BYTES = 15867792;
const SPIN_DURATION = 16000;

const hero = document.querySelector("[data-xian-hero]");
const experienceRoot = hero?.closest(".xian-page-body") || document.body;
const stage = hero?.querySelector("[data-model-stage]");
const status = hero?.querySelector("[data-model-status]");
const progressText = hero?.querySelector("[data-model-progress]");
const progressBar = hero?.querySelector("[data-model-progress-bar]");
const errorMessage = hero?.querySelector("[data-model-error]");
const nav = document.querySelector(".xian-nav");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
let camera;
let controls;
let pivot;
let modelSize;
let ground;
let spotLight;
let ambientLight;
let fillLight;
let rimLight;
let revealStartedAt = null;
let spinStartedAt = null;
let revealComplete = false;
let spinComplete = false;
let userInteracted = false;
let modelLoaded = false;
let heroInView = true;
let initialDistance = 1;
let initialRotation = 0;

const finalLight = {
  spot: 72,
  ambient: 0.24,
  fill: 0.58,
  rim: 0.72,
  exposure: 1.02
};

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutSine(value) {
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function updateProgress(value) {
  const percent = Math.round(clamp(value, 0, 100));
  progressText.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  status.setAttribute("aria-label", `Loading sculpture: ${percent}%`);
}

function showFailure(error) {
  console.error("Xi’an model load failed:", error);
  hero.classList.add("is-failed");
  errorMessage.hidden = false;
  status.setAttribute("aria-hidden", "true");
}

function setRendererSize() {
  if (!renderer || !camera) return;
  const width = Math.max(1, stage.clientWidth);
  const height = Math.max(1, stage.clientHeight);
  const pixelRatioLimit = window.matchMedia("(max-width: 760px)").matches ? 1.35 : 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioLimit));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function fitCamera(resetPosition = true) {
  if (!modelSize || !camera) return;

  setRendererSize();

  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const heightDistance = modelSize.y / (2 * Math.tan(verticalFov / 2));
  const widthDistance = modelSize.x / (2 * Math.tan(horizontalFov / 2));
  const mobile = window.matchMedia("(max-width: 760px)").matches;
  const padding = mobile ? 1.22 : 1.16;
  initialDistance = Math.max(heightDistance, widthDistance) * padding + modelSize.z * 0.52;

  if (resetPosition) {
    const targetHeight = modelSize.y * (mobile ? 0.53 : 0.49);
    camera.position.set(0, modelSize.y * (mobile ? 0.55 : 0.515), initialDistance);
    camera.near = Math.max(0.001, initialDistance / 100);
    camera.far = initialDistance * 100;
    camera.updateProjectionMatrix();

    if (controls) {
      controls.target.set(0, targetHeight, 0);
      controls.minDistance = initialDistance * 0.58;
      controls.maxDistance = initialDistance * 1.48;
      controls.update();
    } else {
      camera.lookAt(0, targetHeight, 0);
    }
  }
}

function makeLitMaterial(source) {
  const map = source?.map || null;
  if (map) {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    map.needsUpdate = true;
  }

  return new THREE.MeshStandardMaterial({
    name: `${source?.name || "terracotta"}-lit`,
    map,
    color: new THREE.Color(0xe4e0d8),
    roughness: 0.94,
    metalness: 0,
    side: source?.side ?? THREE.DoubleSide,
    transparent: source?.transparent || false,
    opacity: source?.opacity ?? 1,
    alphaTest: source?.alphaTest || 0
  });
}

function prepareModel(gltf) {
  pivot = new THREE.Group();
  const model = gltf.scene;
  const materialCache = new Map();

  model.traverse((object) => {
    if (!object.isMesh) return;

    const convertMaterial = (material) => {
      if (!materialCache.has(material)) materialCache.set(material, makeLitMaterial(material));
      return materialCache.get(material);
    };

    object.material = Array.isArray(object.material)
      ? object.material.map(convertMaterial)
      : convertMaterial(object.material);
    object.castShadow = true;
    object.receiveShadow = true;
    object.frustumCulled = true;
  });

  pivot.add(model);
  scene.add(pivot);
  model.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.y -= bounds.min.y;
  model.position.z -= center.z;
  model.updateMatrixWorld(true);

  initialRotation = -Math.PI / 2;
  pivot.rotation.y = initialRotation;
  pivot.updateMatrixWorld(true);

  const centeredBounds = new THREE.Box3().setFromObject(pivot);
  modelSize = centeredBounds.getSize(new THREE.Vector3());

  const groundSize = Math.max(modelSize.x, modelSize.z) * 8;
  ground = new THREE.Mesh(
    new THREE.PlaneGeometry(groundSize, groundSize),
    new THREE.MeshStandardMaterial({ color: 0x070707, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -modelSize.y * 0.005;
  ground.receiveShadow = true;
  scene.add(ground);

  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(0, modelSize.y * 0.48, 0);
  scene.add(lightTarget);

  spotLight.position.set(-modelSize.x * 1.7, modelSize.y * 2.05, modelSize.z * 1.65);
  spotLight.distance = modelSize.y * 5;
  spotLight.target = lightTarget;
  spotLight.shadow.mapSize.set(
    window.matchMedia("(max-width: 760px)").matches ? 512 : 1024,
    window.matchMedia("(max-width: 760px)").matches ? 512 : 1024
  );
  spotLight.shadow.camera.near = modelSize.y * 0.08;
  spotLight.shadow.camera.far = modelSize.y * 5;
  spotLight.shadow.bias = -0.00035;
  spotLight.shadow.normalBias = 0.015;

  fillLight.position.set(modelSize.x * 1.35, modelSize.y * 1.1, modelSize.z * 1.55);
  fillLight.target = lightTarget;
  rimLight.position.set(modelSize.x * 1.2, modelSize.y * 1.35, -modelSize.z * 1.8);
  rimLight.target = lightTarget;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.rotateSpeed = 0.42;
  controls.zoomSpeed = 0.58;
  controls.minPolarAngle = Math.PI * 0.38;
  controls.maxPolarAngle = Math.PI * 0.61;
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.addEventListener("start", stopAutomaticSpin);

  fitCamera(true);
}

function setFinalLighting() {
  spotLight.intensity = finalLight.spot;
  ambientLight.intensity = finalLight.ambient;
  fillLight.intensity = finalLight.fill;
  rimLight.intensity = finalLight.rim;
  renderer.toneMappingExposure = finalLight.exposure;
}

function startExperience() {
  updateProgress(100);
  modelLoaded = true;

  if (reducedMotion) {
    setFinalLighting();
    hero.classList.add("is-reduced");
    return;
  }

  revealStartedAt = performance.now();
  hero.classList.add("is-ready");
}

function stopAutomaticSpin() {
  userInteracted = true;
  spinStartedAt = null;
}

function updateEntrance(now) {
  if (!modelLoaded || reducedMotion) return;

  if (!revealComplete && revealStartedAt !== null) {
    const progress = clamp((now - revealStartedAt) / 2100);
    const eased = easeOutCubic(progress);
    spotLight.intensity = finalLight.spot * eased;
    ambientLight.intensity = finalLight.ambient * eased;
    fillLight.intensity = finalLight.fill * eased;
    rimLight.intensity = finalLight.rim * eased;
    renderer.toneMappingExposure = 0.08 + (finalLight.exposure - 0.08) * eased;

    if (progress >= 1) {
      revealComplete = true;
      setFinalLighting();
      if (!userInteracted) spinStartedAt = now + 450;
    }
  }

  if (spinStartedAt !== null && !spinComplete && !userInteracted && now >= spinStartedAt) {
    const progress = clamp((now - spinStartedAt) / SPIN_DURATION);
    pivot.rotation.y = initialRotation + Math.PI * 2 * easeInOutSine(progress);
    renderer.shadowMap.needsUpdate = true;

    if (progress >= 1) {
      pivot.rotation.y = initialRotation;
      spinComplete = true;
      spinStartedAt = null;
    }
  }
}

function render(now) {
  updateEntrance(now);
  if (controls) controls.update();
  if (heroInView || !modelLoaded) renderer.render(scene, camera);
  requestAnimationFrame(render);
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setClearColor(0x050505, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = reducedMotion ? finalLight.exposure : 0.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  stage.prepend(renderer.domElement);

  camera = new THREE.PerspectiveCamera(31, 1, 0.01, 100);
  camera.position.set(0, 0.5, 4);

  ambientLight = new THREE.AmbientLight(0xaebbc7, reducedMotion ? finalLight.ambient : 0);
  spotLight = new THREE.SpotLight(0xffefd9, reducedMotion ? finalLight.spot : 0, 0, Math.PI / 5.6, 0.68, 1.4);
  fillLight = new THREE.DirectionalLight(0xc8d5df, reducedMotion ? finalLight.fill : 0);
  rimLight = new THREE.DirectionalLight(0xb8c9d5, reducedMotion ? finalLight.rim : 0);
  spotLight.castShadow = true;
  scene.add(ambientLight, spotLight, fillLight, rimLight);

  setRendererSize();
  requestAnimationFrame(render);

  const loader = new GLTFLoader();
  loader.load(
    MODEL_URL,
    (gltf) => {
      try {
        prepareModel(gltf);
        startExperience();
      } catch (error) {
        showFailure(error);
      }
    },
    (event) => {
      const total = event.total || MODEL_BYTES;
      updateProgress(Math.min(99, (event.loaded / total) * 100));
    },
    showFailure
  );
} catch (error) {
  showFailure(error);
}

stage.addEventListener("contextmenu", (event) => event.preventDefault());
stage.addEventListener("pointerdown", stopAutomaticSpin, { passive: true });
stage.addEventListener("wheel", stopAutomaticSpin, { passive: true });
stage.addEventListener("touchstart", stopAutomaticSpin, { passive: true });

const resizeObserver = new ResizeObserver(() => {
  if (!renderer || !camera) return;
  setRendererSize();
  if (modelLoaded && !userInteracted) fitCamera(true);
});
resizeObserver.observe(stage);

if ("IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(([entry]) => {
    heroInView = entry.isIntersecting;
  }, { threshold: 0.01 });
  heroObserver.observe(hero);
}

function updateNavigation() {
  if (!nav) return;
  nav.classList.toggle("is-scrolled", window.scrollY > 18);
}

if (nav) {
  updateNavigation();
  window.addEventListener("scroll", updateNavigation, { passive: true });
}

const revealSections = [...experienceRoot.querySelectorAll("[data-xian-reveal]")];
if (reducedMotion || !("IntersectionObserver" in window)) {
  revealSections.forEach((section) => section.classList.add("is-visible"));
} else {
  experienceRoot.classList.add("is-reveal-ready");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10%", threshold: 0.08 });
  revealSections.forEach((section) => revealObserver.observe(section));
}
