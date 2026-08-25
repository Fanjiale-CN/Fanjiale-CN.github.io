const MODEL_URL = "https://media.galok.me/models/xian/terracotta-warrior--1aa9c11a60fc.glb";
const MODEL_BYTES = 15867792;
const section = document.querySelector("#warrior");
const stage = section?.querySelector("[data-model-stage]");
const status = section?.querySelector("[data-model-status]");
const progressText = section?.querySelector("[data-model-progress]");
const progressBar = section?.querySelector("[data-model-progress-bar]");
const errorMessage = section?.querySelector("[data-model-error]");
const enableButton = section?.querySelector("[data-model-enable]");
const doneButton = section?.querySelector("[data-model-done]");
const zoomInButton = section?.querySelector("[data-model-zoom-in]");
const zoomOutButton = section?.querySelector("[data-model-zoom-out]");
const resetButton = section?.querySelector("[data-model-reset]");
const mobile = window.matchMedia("(max-width: 700px)");
const touchDevice = window.matchMedia("(hover: none) and (pointer: coarse)");
const touchCapable = navigator.maxTouchPoints > 0 || touchDevice.matches;

let THREE;
let OrbitControls;
let GLTFLoader;
let renderer;
let scene;
let camera;
let pivot;
let controls;
let modelSize;
let baseDistance = 1;
let baseTargetY = .5;
let loaded = false;
let loading = false;
let visible = false;
let interacting = false;
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
  if (enableButton) enableButton.disabled = true;
}

function supportsWebGL() {
  if (!window.WebGLRenderingContext) return false;
  const testCanvas = document.createElement("canvas");
  return Boolean(
    testCanvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
    testCanvas.getContext("webgl", { failIfMajorPerformanceCaveat: true })
  );
}

function scheduleRender() {
  if (!renderer || !scene || !camera || renderFrame || (!visible && loaded)) return;
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    renderer.render(scene, camera);
  });
}

function setSize() {
  if (!renderer || !camera || !stage) return;
  const width = Math.max(1, stage.clientWidth);
  const height = Math.max(1, stage.clientHeight);
  const constrainedGPU = mobile.matches || touchCapable;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, constrainedGPU ? 1.25 : 1.75));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function resetView() {
  if (!modelSize || !camera) return;
  setSize();
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const heightDistance = modelSize.y / (2 * Math.tan(verticalFov / 2));
  const widthDistance = modelSize.x / (2 * Math.tan(horizontalFov / 2));
  baseDistance = Math.max(heightDistance, widthDistance) * (mobile.matches ? 1.28 : 1.14) + modelSize.z * .52;
  baseTargetY = modelSize.y * (mobile.matches ? .53 : .49);
  camera.position.set(0, modelSize.y * .51, baseDistance);
  camera.near = Math.max(.001, baseDistance / 100);
  camera.far = baseDistance * 100;
  camera.lookAt(0, baseTargetY, 0);
  camera.updateProjectionMatrix();
  if (controls) {
    controls.target.set(0, baseTargetY, 0);
    controls.minDistance = baseDistance * .52;
    controls.maxDistance = baseDistance * 1.6;
    controls.update();
  }
  if (pivot) pivot.rotation.y = -Math.PI / 2;
  scheduleRender();
}

function zoomCamera(scale) {
  if (!loaded || !controls || !camera) return;
  const offset = camera.position.clone().sub(controls.target);
  const distance = clamp(offset.length() * scale, controls.minDistance, controls.maxDistance);
  offset.setLength(distance);
  camera.position.copy(controls.target).add(offset);
  camera.lookAt(controls.target);
  controls.update();
  scheduleRender();
}

function syncInteractionButtons() {
  if (enableButton) {
    enableButton.hidden = interacting;
    enableButton.setAttribute("aria-pressed", String(interacting));
  }
  [doneButton, zoomInButton, zoomOutButton, resetButton].forEach((button) => {
    if (button) button.hidden = !interacting;
  });
}

function setInteraction(enabled) {
  if (!loaded || !controls || !stage) return;
  interacting = enabled;
  controls.enabled = enabled;
  stage.classList.toggle("is-manual", enabled);
  syncInteractionButtons();
  scheduleRender();
  if (!enabled) enableButton?.focus({ preventScroll: true });
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
  scene.add(pivot);
  modelSize = new THREE.Box3().setFromObject(pivot).getSize(new THREE.Vector3());

  const target = new THREE.Object3D();
  target.position.set(0, modelSize.y * .48, 0);
  scene.add(target);

  const ambient = new THREE.AmbientLight(0xb8c1c5, .24);
  const keyLight = new THREE.SpotLight(0xfff1df, 50, 0, Math.PI / 5.8, .68, 1.4);
  const fillLight = new THREE.DirectionalLight(0xc8d8df, .55);
  const rimLight = new THREE.DirectionalLight(0xaec2cf, .7);
  keyLight.position.set(-modelSize.x * 1.6, modelSize.y * 2, modelSize.z * 1.5);
  keyLight.target = target;
  keyLight.distance = modelSize.y * 5;
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(touchCapable ? 512 : 1024, touchCapable ? 512 : 1024);
  fillLight.position.set(modelSize.x * 1.25, modelSize.y * 1.1, modelSize.z * 1.4);
  fillLight.target = target;
  rimLight.position.set(modelSize.x * 1.15, modelSize.y * 1.35, -modelSize.z * 1.8);
  rimLight.target = target;
  scene.add(ambient, keyLight, fillLight, rimLight);

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
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.rotateSpeed = .42;
  controls.zoomSpeed = .55;
  controls.enabled = false;
  controls.addEventListener("change", scheduleRender);

  loaded = true;
  loading = false;
  updateLoadProgress(100);
  stage.classList.add("is-loaded");
  if (enableButton) enableButton.disabled = false;
  resetView();
  syncInteractionButtons();
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

enableButton?.addEventListener("click", () => setInteraction(true));
doneButton?.addEventListener("click", () => setInteraction(false));
zoomInButton?.addEventListener("click", () => zoomCamera(.84));
zoomOutButton?.addEventListener("click", () => zoomCamera(1.18));
resetButton?.addEventListener("click", resetView);
stage?.addEventListener("contextmenu", (event) => event.preventDefault());

let resizeFrame = 0;
let stageWidth = 0;
let stageHeight = 0;

function requestStageResize(width, height) {
  if (!loaded || resizeFrame) return;
  if (Math.abs(width - stageWidth) <= 1 && Math.abs(height - stageHeight) <= 1) return;
  stageWidth = width;
  stageHeight = height;
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    resetView();
  });
}

if (stage && "ResizeObserver" in window) {
  const stageObserver = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    requestStageResize(width, height);
  });
  stageObserver.observe(stage);
}

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
