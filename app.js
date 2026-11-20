import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ==========================================
// SCENE & RENDERERS
// ==========================================
const container = document.getElementById('canvas-container');
const labelsContainer = document.getElementById('labels-container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 6.5, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelsContainer.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 4.5;
controls.maxDistance = 48;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.95,
  0.55,
  0.28
);
composer.addPass(bloomPass);

// Shared interactive registry for touch/click + labels
const interactiveObjects = [];
const labelEntries = [];

function registerInteractive(mesh, info, groupVisibilityFn) {
  mesh.userData.info = info;
  interactiveObjects.push(mesh);

  const div = document.createElement('div');
  div.className = 'cosmic-label';
  div.textContent = info.title;
  div.addEventListener('click', (e) => {
    e.stopPropagation();
    selectBody(info);
  });

  const cssObj = new CSS2DObject(div);
  mesh.add(cssObj);
  labelEntries.push({ div, cssObj, groupVisibilityFn, title: info.title });
}

// ==========================================
// LAYER 1: SOLAR SYSTEM (distance < ~17)
// ==========================================
const solarGroup = new THREE.Group();
scene.add(solarGroup);

const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.95, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffcf70 })
);
solarGroup.add(sunMesh);
registerInteractive(
  sunMesh,
  {
    title: 'Sun (Sol)',
    category: 'SOLAR SYSTEM · STAR',
    subtitle: 'G2V Yellow Dwarf · Center of the Solar System',
    desc: 'Contains 99.86% of the Solar System’s total mass, fusing ~600 million tons of hydrogen into helium every second.',
    meta: [
      ['RADIUS', '696,340 km (109 × Earth)'],
      ['DISTANCE', '0 AU (Origin)'],
      ['ORBITAL PERIOD', '~230M yrs around Milky Way']
    ]
  },
  () => solarGroup.visible
);

const PLANETS = [
  {
    name: 'Mercury', radius: 0.14, dist: 1.8, speed: 0.9, color: 0x9c9891,
    subtitle: 'Terrestrial Planet · Closest to the Sun',
    desc: 'A heavily cratered rocky world with extreme temperature swings and a large metallic core.',
    meta: [['DIST FROM SUN', '0.39 AU'], ['DAY LENGTH', '58.6 Earth days'], ['MOONS', '0']]
  },
  {
    name: 'Venus', radius: 0.22, dist: 2.6, speed: 0.65, color: 0xe3bb76,
    subtitle: 'Terrestrial Planet · Runaway Greenhouse',
    desc: 'Shrouded in thick sulfuric acid clouds with surface temperatures hot enough to melt lead.',
    meta: [['DIST FROM SUN', '0.72 AU'], ['SURFACE TEMP', '~465 °C'], ['MOONS', '0']]
  },
  {
    name: 'Earth', radius: 0.24, dist: 3.6, speed: 0.5, color: 0x4da6ff,
    subtitle: 'Terrestrial Planet · Our Home World',
    desc: 'The only known astronomical body harboring life, protected by a magnetosphere and liquid oceans.',
    meta: [['DIST FROM SUN', '1.00 AU'], ['ATMOSPHERE', '78% N₂, 21% O₂'], ['MOONS', '1 (Luna)']]
  },
  {
    name: 'Mars', radius: 0.18, dist: 4.6, speed: 0.4, color: 0xd96b43,
    subtitle: 'Terrestrial Planet · The Red Planet',
    desc: 'Home to Olympus Mons—the largest volcano in the Solar System—and polar water/CO₂ ice caps.',
    meta: [['DIST FROM SUN', '1.52 AU'], ['GRAVITY', '0.38 g'], ['MOONS', '2 (Phobos, Deimos)']]
  },
  {
    name: 'Jupiter', radius: 0.52, dist: 6.4, speed: 0.24, color: 0xd8a97e,
    subtitle: 'Gas Giant · Largest Planet',
    desc: 'More than twice as massive as all other planets combined, featuring banded clouds and the Great Red Spot.',
    meta: [['DIST FROM SUN', '5.20 AU'], ['RADIUS', '11.2 × Earth'], ['MOONS', '95+ known']]
  },
  {
    name: 'Saturn', radius: 0.43, dist: 8.3, speed: 0.17, color: 0xe8d19b,
    subtitle: 'Gas Giant · Ring System',
    desc: 'Famous for its expansive icy ring system spanning hundreds of thousands of kilometers across.',
    meta: [['DIST FROM SUN', '9.58 AU'], ['DENSITY', '0.687 g/cm³ (lowest)'], ['MOONS', '146+ known']]
  },
  {
    name: 'Uranus', radius: 0.31, dist: 10.1, speed: 0.12, color: 0x7be0e8,
    subtitle: 'Ice Giant · Extreme Axial Tilt',
    desc: 'Rotates nearly on its side (~98° tilt), giving it extreme seasonal variation over an 84-year orbit.',
    meta: [['DIST FROM SUN', '19.2 AU'], ['COMPOSITION', 'Water, Ammonia, Methane ices'], ['MOONS', '28 known']]
  },
  {
    name: 'Neptune', radius: 0.30, dist: 11.7, speed: 0.09, color: 0x4569e8,
    subtitle: 'Ice Giant · Supersonic Winds',
    desc: 'The most distant major planet, swept by high-speed winds exceeding 2,000 km/h.',
    meta: [['DIST FROM SUN', '30.05 AU'], ['ORBITAL PERIOD', '164.8 Earth years'], ['MOONS', '16 known']]
  }
];

const planetEntries = PLANETS.map((p) => {
  const orbitPts = new THREE.EllipseCurve(0, 0, p.dist, p.dist, 0, Math.PI * 2, false, 0)
    .getPoints(96)
    .map((pt) => new THREE.Vector3(pt.x, 0, pt.y));
  const orbitLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(orbitPts),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14 })
  );
  solarGroup.add(orbitLine);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(p.radius, 24, 24),
    new THREE.MeshBasicMaterial({ color: p.color })
  );
  if (p.name === 'Saturn') {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(p.radius * 1.35, p.radius * 2.15, 48),
      new THREE.MeshBasicMaterial({ color: 0xd9c28c, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
    );
    ring.rotation.x = Math.PI * 0.38;
    mesh.add(ring);
  }
  solarGroup.add(mesh);

  registerInteractive(
    mesh,
    {
      title: p.name,
      category: 'SOLAR SYSTEM · PLANET',
      subtitle: p.subtitle,
      desc: p.desc,
      meta: p.meta
    },
    () => solarGroup.visible
  );

  return { ...p, mesh, angle: Math.random() * Math.PI * 2 };
});

// ==========================================
// LAYER 2: MILKY WAY GALAXY (mid zoom)
// ==========================================
const milkyWayGroup = new THREE.Group();
milkyWayGroup.rotation.z = 0.18;
scene.add(milkyWayGroup);

const mwCount = 5500;
const mwPositions = new Float32Array(mwCount * 3);
const mwColors = new Float32Array(mwCount * 3);
const cCore = new THREE.Color(0xffe4b5);
const cArm = new THREE.Color(0x7aa8ff);

for (let i = 0; i < mwCount; i++) {
  const radius = Math.pow(Math.random(), 1.35) * 14;
  const armIndex = i % 4;
  const armAngle = (armIndex * Math.PI) / 2;
  const spinAngle = radius * 0.42;
  const scatter = (Math.random() - 0.5) * (0.45 + radius * 0.06);
  const angle = armAngle + spinAngle + scatter;

  mwPositions[i * 3] = Math.cos(angle) * radius;
  mwPositions[i * 3 + 1] = (Math.random() - 0.5) * (0.65 * Math.exp(-radius * 0.18));
  mwPositions[i * 3 + 2] = Math.sin(angle) * radius;

  const mix = Math.min(1, radius / 11);
  const col = cCore.clone().lerp(cArm, mix);
  mwColors[i * 3] = col.r;
  mwColors[i * 3 + 1] = col.g;
  mwColors[i * 3 + 2] = col.b;
}

const mwGeo = new THREE.BufferGeometry();
mwGeo.setAttribute('position', new THREE.BufferAttribute(mwPositions, 3));
mwGeo.setAttribute('color', new THREE.BufferAttribute(mwColors, 3));
const mwMat = new THREE.PointsMaterial({
  size: 0.085,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
milkyWayGroup.add(new THREE.Points(mwGeo, mwMat));

const MW_LANDMARKS = [
  {
    name: 'Galactic Center (Sagittarius A*)',
    pos: [0, 0, 0],
    subtitle: 'Supermassive Black Hole · ~4.3M Solar Masses',
    desc: 'Dense central bulge of ancient stars, gas clouds, and Sagittarius A* located ~26,670 light-years from Earth.',
    meta: [['DIAMETER', '~100,000 light-years'], ['STARS', '100–400 billion'], ['TYPE', 'SBbc Barred Spiral']]
  },
  {
    name: 'Orion–Cygnus Arm (Solar Neighborhood)',
    pos: [6.2, 0.1, 2.5],
    subtitle: 'Spiral Spur · Home of the Sun',
    desc: 'A minor spiral arm situated between the Sagittarius and Perseus arms where the Solar System resides.',
    meta: [['GALACTIC RADIUS', '~26.7k light-years'], ['ORBIT SPEED', '~220–230 km/s'], ['NEIGHBORS', 'Orion Nebula, Sirius']]
  },
  {
    name: 'Perseus Arm',
    pos: [-8.5, 0.15, -5.0],
    subtitle: 'Major Spiral Arm · Active Star Formation',
    desc: 'One of the Milky Way’s two major spiral arms, rich in molecular clouds and young luminous stars.',
    meta: [['REGION', 'Outer Galactic Disk'], ['FEATURE', 'High H-II star nurseries'], ['DISTANCE', '~6,400 ly from Sun']]
  }
];

MW_LANDMARKS.forEach((lm) => {
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffe09c, transparent: true, opacity: 0.9 })
  );
  marker.position.set(...lm.pos);
  milkyWayGroup.add(marker);
  registerInteractive(
    marker,
    {
      title: lm.name,
      category: 'MILKY WAY GALAXY',
      subtitle: lm.subtitle,
      desc: lm.desc,
      meta: lm.meta
    },
    () => milkyWayGroup.visible
  );
});

// ==========================================
// LAYER 3: OBSERVABLE UNIVERSE (far zoom)
// ==========================================
const universeGroup = new THREE.Group();
scene.add(universeGroup);

const galaxyNodeCount = 900;
const uniPositions = new Float32Array(galaxyNodeCount * 3);
const uniColors = new Float32Array(galaxyNodeCount * 3);
const cGalA = new THREE.Color(0xffcfa0);
const cGalB = new THREE.Color(0x8ec5ff);

for (let i = 0; i < galaxyNodeCount; i++) {
  // Filamentary / spherical distribution out to radius 22
  const r = Math.cbrt(Math.random()) * 21;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  uniPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  uniPositions[i * 3 + 1] = r * Math.cos(phi);
  uniPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

  const col = cGalA.clone().lerp(cGalB, Math.random());
  uniColors[i * 3] = col.r;
  uniColors[i * 3 + 1] = col.g;
  uniColors[i * 3 + 2] = col.b;
}

const uniGeo = new THREE.BufferGeometry();
uniGeo.setAttribute('position', new THREE.BufferAttribute(uniPositions, 3));
uniGeo.setAttribute('color', new THREE.BufferAttribute(uniColors, 3));
const uniMat = new THREE.PointsMaterial({
  size: 0.18,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
universeGroup.add(new THREE.Points(uniGeo, uniMat));

// Faint Observable Universe Horizon Sphere
const horizonSphere = new THREE.Mesh(
  new THREE.SphereGeometry(22.5, 36, 36),
  new THREE.MeshBasicMaterial({ color: 0x3a4d7a, wireframe: true, transparent: true, opacity: 0.08 })
);
universeGroup.add(horizonSphere);

const COSMIC_STRUCTURES = [
  {
    name: 'Local Group & Virgo Supercluster',
    pos: [2.5, 1.5, 2.0],
    subtitle: 'Galaxy Cluster Hierarchy · ~110M Light-Years Across',
    desc: 'Includes the Milky Way, Andromeda (M31), Triangulum (M33), and thousands of galaxies bound within the broader Laniakea flow.',
    meta: [['LOCAL GROUP', '~10M ly across'], ['VIRGO CLUSTER', '~1,300+ galaxies'], ['ATTRACTION', 'Great Attractor flow']]
  },
  {
    name: 'Cosmic Web Filaments',
    pos: [-9.0, 5.5, -6.0],
    subtitle: 'Large-Scale Structure · Dark Matter & Gas Threads',
    desc: 'Galaxies gather along vast cosmic filaments separated by immense, nearly empty cosmic voids.',
    meta: [['SCALE', 'Hundreds of Mly'], ['COMPOSITION', 'Dark matter, dark energy, baryons'], ['EPOCH', '~13.8 Gyr since Big Bang']]
  },
  {
    name: 'Observable Universe Horizon',
    pos: [0, 0, -21.5],
    subtitle: 'Particle Horizon · ~93 Billion Light-Years Diameter',
    desc: 'The spherical boundary from which light has had time to reach us since the beginning of cosmic expansion.',
    meta: [['COMOVING RADIUS', '~46.5 billion light-years'], ['EST. GALAXIES', '~2 trillion'], ['CMB TEMP', '2.725 K']]
  }
];

COSMIC_STRUCTURES.forEach((st) => {
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0.92 })
  );
  marker.position.set(...st.pos);
  universeGroup.add(marker);
  registerInteractive(
    marker,
    {
      title: st.name,
      category: 'OBSERVABLE UNIVERSE',
      subtitle: st.subtitle,
      desc: st.desc,
      meta: st.meta
    },
    () => universeGroup.visible
  );
});

// ==========================================
// HUD & INTERACTION
// ==========================================
const scaleBadge = document.getElementById('scale-badge');
const distanceReadout = document.getElementById('distance-readout');
const infoCategory = document.getElementById('info-category');
const infoTitle = document.getElementById('info-title');
const infoSubtitle = document.getElementById('info-subtitle');
const infoDesc = document.getElementById('info-desc');
const infoMeta = document.getElementById('info-meta');
const zoomSlider = document.getElementById('zoom-slider');

let targetDistance = null;

function selectBody(info) {
  infoCategory.textContent = info.category;
  infoTitle.textContent = info.title;
  infoSubtitle.textContent = info.subtitle;
  infoDesc.textContent = info.desc;
  infoMeta.innerHTML = info.meta
    .map(([k, v]) => `<div class="meta-row"><span class="k">${k}</span><span class="v">${v}</span></div>`)
    .join('');

  labelEntries.forEach((entry) => {
    entry.div.classList.toggle('active', entry.title === info.title);
  });
}

function setScaleOverview(mode) {
  if (mode === 'solar') {
    targetDistance = 12.0;
    selectBody({
      title: 'Solar System',
      category: 'SCALE 01 · SOLAR SYSTEM',
      subtitle: 'Sun + 8 Planets · ~10¹³ m scale',
      desc: 'Zoom out past Neptune to transition into the Milky Way galaxy, or tap any planet to inspect its details.',
      meta: [['STAR', 'Sun (G2V)'], ['PLANETS', 'Mercury to Neptune'], ['ZOOM RANGE', 'Close (4.5 – 16)']]
    });
  } else if (mode === 'milkyway') {
    targetDistance = 23.0;
    selectBody({
      title: 'Milky Way Galaxy',
      category: 'SCALE 02 · GALACTIC SCALE',
      subtitle: 'Barred Spiral Galaxy · ~100,000 Light-Years Across',
      desc: 'A vast disk of hundreds of billions of stars and spiral arms. Zoom out further to see galaxy clusters across the observable universe.',
      meta: [['STARS', '100–400 Billion'], ['GALACTIC YEAR', '~230 Million yrs'], ['ZOOM RANGE', 'Mid (14 – 32)']]
    });
  } else if (mode === 'universe') {
    targetDistance = 39.0;
    selectBody({
      title: 'Observable Universe',
      category: 'SCALE 03 · COSMOLOGICAL SCALE',
      subtitle: '~93 Billion Light-Years Observable Diameter',
      desc: 'At the largest scale, galaxies form a cosmic web of filaments and clusters stretching to the observable horizon.',
      meta: [['EST. GALAXIES', '~2 Trillion'], ['AGE', '~13.8 Billion yrs'], ['ZOOM RANGE', 'Far (28 – 48)']]
    });
  }
}

document.querySelectorAll('[data-jump]').forEach((btn) => {
  btn.addEventListener('click', () => setScaleOverview(btn.dataset.jump));
});

document.getElementById('btn-reset').addEventListener('click', () => {
  controls.target.set(0, 0, 0);
  setScaleOverview('solar');
});

zoomSlider.addEventListener('input', (e) => {
  targetDistance = parseFloat(e.target.value);
});

// Touch-safe / Click-safe raycasting
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downPos = { x: 0, y: 0 };

renderer.domElement.addEventListener('pointerdown', (e) => {
  downPos = { x: e.clientX, y: e.clientY };
  targetDistance = null; // Let user drag/pinch freely
});

renderer.domElement.addEventListener('pointerup', (e) => {
  const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
  if (moved > 8) return; // Ignore orbit drags

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const visibleTargets = interactiveObjects.filter((m) => {
    let cur = m;
    while (cur) {
      if (!cur.visible) return false;
      cur = cur.parent;
    }
    return true;
  });

  const hits = raycaster.intersectObjects(visibleTargets, false);
  if (hits.length > 0 && hits[0].object.userData.info) {
    selectBody(hits[0].object.userData.info);
  }
});

// ==========================================
// ANIMATION & SCALE CROSSFADE LOOP
// ==========================================
const clock = new THREE.Clock();

function smoothStep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Smooth zoom transition when jump buttons or slider are used
  if (targetDistance !== null) {
    const dir = camera.position.clone().sub(controls.target).normalize();
    const currentDist = camera.position.distanceTo(controls.target);
    const nextDist = THREE.MathUtils.lerp(currentDist, targetDistance, 0.08);
    camera.position.copy(controls.target).addScaledVector(dir, nextDist);
    if (Math.abs(nextDist - targetDistance) < 0.05) {
      targetDistance = null;
    }
  }

  controls.update();

  const dist = camera.position.distanceTo(controls.target);
  zoomSlider.value = dist.toFixed(1);

  // Crossfade Solar System -> Milky Way -> Observable Universe
  const solarAlpha = 1 - smoothStep(12.5, 19.5, dist);
  const mwIn = smoothStep(11.5, 17.5, dist);
  const mwOut = 1 - smoothStep(27.5, 35.0, dist);
  const mwAlpha = mwIn * mwOut;
  const uniAlpha = smoothStep(26.5, 35.5, dist);

  solarGroup.visible = solarAlpha > 0.02;
  milkyWayGroup.visible = mwAlpha > 0.02;
  universeGroup.visible = uniAlpha > 0.02;

  // Update HUD scale indicator & top pill highlights
  let activeMode = 'solar';
  if (dist >= 29) {
    activeMode = 'universe';
    scaleBadge.textContent = 'SCALE 03 · OBSERVABLE UNIVERSE';
    const bly = (1 + ((dist - 29) / 19) * 92).toFixed(1);
    distanceReadout.textContent = `Scale: ~${bly} Billion Light-Years`;
  } else if (dist >= 15.5) {
    activeMode = 'milkyway';
    scaleBadge.textContent = 'SCALE 02 · MILKY WAY GALAXY';
    const kly = Math.round(5 + ((dist - 15.5) / 13.5) * 100);
    distanceReadout.textContent = `Scale: ~${kly}k Light-Years`;
  } else {
    activeMode = 'solar';
    scaleBadge.textContent = 'SCALE 01 · SOLAR SYSTEM';
    const au = (1 + ((dist - 4.5) / 11) * 39).toFixed(1);
    distanceReadout.textContent = `Scale: ~${au} AU`;
  }

  document.querySelectorAll('[data-jump]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.jump === activeMode);
  });

  // Animate planets
  planetEntries.forEach((p) => {
    p.angle += p.speed * dt * 0.45;
    p.mesh.position.set(Math.cos(p.angle) * p.dist, 0, Math.sin(p.angle) * p.dist);
    p.mesh.rotation.y += 0.6 * dt;
  });
  sunMesh.rotation.y += 0.25 * dt;

  // Gentle galaxy & cosmic web rotation
  milkyWayGroup.rotation.y = elapsed * 0.025;
  universeGroup.rotation.y = elapsed * 0.008;

  // Show/hide 2D labels matching active cosmic layer
  labelEntries.forEach((entry) => {
    const visible = entry.groupVisibilityFn();
    entry.div.style.opacity = visible ? '1' : '0';
    entry.div.style.pointerEvents = visible ? 'auto' : 'none';
  });

  composer.render();
  labelRenderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
