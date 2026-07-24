const MODEL_URL = "/assets/models/xian/terracotta-warrior.glb";
const MODEL_BYTES = 15867792;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const section = document.querySelector("[data-model-scroll]");
const stage = section?.querySelector("[data-model-stage]");
const poster = section?.querySelector("[data-model-poster]");
const status = section?.querySelector("[data-model-status]");
const progressText = section?.querySelector("[data-model-progress]");
const progressBar = section?.querySelector("[data-model-progress-bar]");
const errorMessage = section?.querySelector("[data-model-error]");
const enableButton = section?.querySelector("[data-model-enable]");
const doneButton = section?.querySelector("[data-model-done]");
const mobile = window.matchMedia("(max-width: 700px)");

let THREE;
let OrbitControls;
let GLTFLoader;
let renderer;
let scene;
let camera;
let pivot;
let controls;
let keyLight;
let fillLight;
let rimLight;
let modelSize;
let baseDistance = 1;
let baseTargetY = .5;
let scrollProgress = 0;
let loaded = false;
let loading = false;
let visible = false;
let manual = false;
let renderFrame = 0;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function updateLoadProgress(value) {
  const amount = Math.round(clamp(value, 0, 100));
  if (progressText) progressText.textContent = `${amount}%`;
  if (progressBar) progressBar.style.width = `${amount}%`;
}

function fail() {
  loading = false;
  if (status) status.hidden = true;
  if (errorMessage) errorMessage.hidden = false;
}

function supportsWebGL() {
  if (!window.WebGLRenderingContext) return false;
  const testCanvas = document.createElement("canvas");
  return Boolean(
    testCanvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
    testCanvas.getContext("webgl", { failIfMajorPerformanceCaveat: true })
  );
}

function setSize() {
  if (!renderer || !camera || !stage) return;
  const width = Math.max(1, stage.clientWidth);
  const height = Math.max(1, stage.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile.matches ? 1.25 : 1.75));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function fitCamera() {
  if (!modelSize || !camera) return;
  setSize();
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const heightDistance = modelSize.y / (2 * Math.tan(verticalFov / 2));
  const widthDistance = modelSize.x / (2 * Math.tan(horizontalFov / 2));
  baseDistance = Math.max(heightDistance, widthDistance) * (mobile.matches ? 1.3 : 1.15) + modelSize.z * .52;
  baseTargetY = modelSize.y * (mobile.matches ? .53 : .49);
  camera.position.set(0, modelSize.y * .51, baseDistance);
  camera.near = Math.max(.001, baseDistance / 100);
  camera.far = baseDistance * 100;
  camera.lookAt(0, baseTargetY, 0);
  camera.updateProjectionMatrix();
  if (controls) {
    controls.target.set(0, baseTargetY, 0);
    controls.minDistance = baseDistance * .62;
    controls.maxDistance = baseDistance * 1.45;
    controls.update();
  }
}

function scheduleRender() {
  if (!renderer || !scene || !camera || renderFrame || (!visible && loaded)) return;
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    controls?.update();
    renderer.render(scene, camera);
    if (manual && visible) scheduleRender();
  });
}

function applyScrollProgress(progress) {
  scrollProgress = clamp(progress);
  if (!loaded || !pivot || manual) return;
  pivot.rotation.y = -Math.PI / 2 + Math.PI * 2 * scrollProgress;
  const push = Math.sin(Math.PI * scrollProgress) * .085;
  camera.position.z = baseDistance * (1 - push);
  camera.position.y = modelSize.y * (.51 + Math.sin(Math.PI * 2 * scrollProgress) * .012);
  camera.lookAt(0, baseTargetY, 0);
  keyLight.intensity = 50 + Math.sin(Math.PI * 2 * scrollProgress) * 6;
  fillLight.intensity = .55 + Math.cos(Math.PI * 2 * scrollProgress) * .08;
  rimLight.intensity = .7 + Math.sin(Math.PI * 2 * scrollProgress) * .08;
  scheduleRender();
}

function prepareModel(gltf) {
  const model = gltf.scene;
  model.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.filter(Boolean).forEach((material) => {
      material.roughness = Math.max(.78, material.roughness ?? .82);
      material.metalness = 0;
      if (material.map) {
        material.map.colorSpace = THREE.SRGBColorSpace;
        material.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      }
      material.needsUpdate = true;
    });
  });

  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -bounds.min.y, -center.z);
  model.updateMatrixWorld(true);

  pivot = new THREE.Group();
  pivot.add(model);
  pivot.rotation.y = -Math.PI / 2;
  scene.add(pivot);

  const centeredBounds = new THREE.Box3().setFromObject(pivot);
  modelSize = centeredBounds.getSize(new THREE.Vector3());

  const target = new THREE.Object3D();
  target.position.set(0, modelSize.y * .48, 0);
  scene.add(target);
  keyLight.position.set(-modelSize.x * 1.6, modelSize.y * 2, modelSize.z * 1.5);
  keyLight.target = target;
  keyLight.distance = modelSize.y * 5;
  fillLight.position.set(modelSize.x * 1.25, modelSize.y * 1.1, modelSize.z * 1.4);
  fillLight.target = target;
  rimLight.position.set(modelSize.x * 1.15, modelSize.y * 1.35, -modelSize.z * 1.8);
  rimLight.target = target;

  const groundSize = Math.max(modelSize.x, modelSize.z) * 7;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(groundSize, groundSize),
    new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -modelSize.y * .004;
  ground.receiveShadow = true;
  scene.add(ground);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .075;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.rotateSpeed = .42;
  controls.zoomSpeed = .55;
  controls.enabled = false;
  controls.addEventListener("change", scheduleRender);
  fitCamera();

  loaded = true;
  loading = false;
  updateLoadProgress(100);
  stage.classList.add("is-loaded");
  applyScrollProgress(reducedMotion ? 0 : scrollProgress);
  scheduleRender();
}

async function loadModel() {
  if (loading || loaded || !stage) return;
  loading = true;
  if (!supportsWebGL()) {
    fail();
    return;
  }
  try {
    const modules = await Promise.all([
      import("/assets/vendor/three/three.module.min.js"),
      import("/assets/vendor/three/loaders/GLTFLoader.js"),
      import("/assets/vendor/three/controls/OrbitControls.js")
    ]);
    THREE = modules[0];
    GLTFLoader = modules[1].GLTFLoader;
    OrbitControls = modules[2].OrbitControls;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    camera = new THREE.PerspectiveCamera(31, 1, .01, 100);
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    stage.prepend(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xb8c1c5, .22);
    keyLight = new THREE.SpotLight(0xfff1df, 50, 0, Math.PI / 5.8, .68, 1.4);
    fillLight = new THREE.DirectionalLight(0xc8d8df, .55);
    rimLight = new THREE.DirectionalLight(0xaec2cf, .7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(mobile.matches ? 512 : 1024, mobile.matches ? 512 : 1024);
    scene.add(ambient, keyLight, fillLight, rimLight);
    setSize();

    new GLTFLoader().load(
      MODEL_URL,
      prepareModel,
      (event) => updateLoadProgress(Math.min(99, event.loaded / (event.total || MODEL_BYTES) * 100)),
      fail
    );
  } catch (error) {
    fail(error);
  }
}

function setManual(enabled) {
  if (!loaded || !controls) return;
  manual = enabled;
  controls.enabled = enabled;
  stage.classList.toggle("is-manual", enabled);
  if (enableButton) enableButton.hidden = enabled;
  if (doneButton) doneButton.hidden = !enabled;
  if (enabled) {
    enableButton?.setAttribute("aria-pressed", "true");
    scheduleRender();
  } else {
    enableButton?.setAttribute("aria-pressed", "false");
    applyScrollProgress(scrollProgress);
    enableButton?.focus({ preventScroll: true });
  }
}

enableButton?.addEventListener("click", () => setManual(true));
doneButton?.addEventListener("click", () => setManual(false));
stage?.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("xian-model-progress", (event) => applyScrollProgress(event.detail?.progress || 0));
window.addEventListener("resize", () => {
  if (!loaded) return;
  fitCamera();
  applyScrollProgress(scrollProgress);
});

if (section && "IntersectionObserver" in window) {
  const nearObserver = new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    loadModel();
    observer.disconnect();
  }, { rootMargin: "100% 0px" });
  nearObserver.observe(section);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) scheduleRender();
  }, { threshold: .01 });
  visibilityObserver.observe(section);
} else {
  loadModel();
  visible = true;
}
