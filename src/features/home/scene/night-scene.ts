// @ts-ignore -- `three` ships without types; `@types/three` is optional
import * as THREE from 'three';
import type { SkyCatalog } from '@/features/sky/lib/types';

/**
 * The home page's WebGL night: the real star catalog wheeling overhead while the
 * Moon drifts closer and goes through its phases as you scroll. Scroll is time:
 * the sky turns 15° an hour, the Moon's light swings round, and the constellations
 * draw themselves in.
 *
 * Pure three.js, no React; `SpaceStage` owns the canvas and feeds it progress.
 */

export type NightScene = {
  /** Scroll progress 0…1 and the pointer in -1…1; the scene eases towards them. */
  setTarget(progress: number, pointerX: number, pointerY: number): void;
  /** Where the scene is now (eased), for the HUD. */
  readonly state: { progress: number; phaseAngle: number; hours: number };
  resize(width: number, height: number): void;
  /** Advance by `dt` seconds and draw. */
  frame(dt: number): void;
  dispose(): void;
};

const DEG = Math.PI / 180;
const SKY_RADIUS = 400;
/** The sky is shown for a Tehran winter evening: the pole sits ~36° above the horizon. */
const LATITUDE = 35.7;
const NIGHT_HOURS = 9; // from 21:00 to 06:00

const STAR_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScale;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vColor = aColor;
    vTwinkle = 0.72 + 0.28 * sin(uTime * (0.8 + aPhase * 1.6) + aPhase * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale * (0.85 + 0.3 * vTwinkle);
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p) * 2.0;
    float core = smoothstep(1.0, 0.0, d);
    float halo = pow(core, 3.0);
    float a = (halo * 0.9 + core * 0.25) * vTwinkle;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * (0.7 + halo), a);
  }
`;

/** Rough star colour from B−V: blue-white … yellow … orange. */
function colorFromBV(bv: number): [number, number, number] {
  const t = Math.max(-0.3, Math.min(1.8, bv));
  if (t < 0) return [0.62 + t * 0.2, 0.74 + t * 0.12, 1];
  if (t < 0.6) return [0.7 + t * 0.5, 0.82 + t * 0.15, 1 - t * 0.55];
  return [1, 0.95 - (t - 0.6) * 0.4, 0.67 - (t - 0.6) * 0.45];
}

function radialTexture(stops: Array<[number, string]>, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, color] of stops) grad.addColorStop(o, color);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function vec(ra: number, dec: number, r: number) {
  const a = ra * DEG;
  const d = dec * DEG;
  return [r * Math.cos(d) * Math.cos(a), r * Math.sin(d), -r * Math.cos(d) * Math.sin(a)] as const;
}

const MOON_KEYS: Array<[number, number, number, number]> = [
  [0, 3.4, 0.7, 1.2],
  [0.3, -3.3, 0.2, 3],
  [0.55, -2.6, -0.4, 4.6],
  [0.8, 2.8, -0.2, 4],
  [1, 3.2, 0.3, 5],
];

function moonPath(p: number): [number, number, number] {
  for (let i = 0; i < MOON_KEYS.length - 1; i++) {
    const a = MOON_KEYS[i]!;
    const b = MOON_KEYS[i + 1]!;
    if (p <= b[0]) {
      const t = smooth(a[0], b[0], p);
      return [lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
    }
  }
  const last = MOON_KEYS[MOON_KEYS.length - 1]!;
  return [last[1], last[2], last[3]];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function createNightScene(
  canvas: HTMLCanvasElement,
  opts: { catalog: SkyCatalog; moonTexture: string; pixelRatioCap?: number },
): NightScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, opts.pixelRatioCap ?? 1.75);
  renderer.setPixelRatio(pixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
  camera.position.set(0, 0, 10);
  // look up and a little north-ish, like standing outside at night
  const camBase = new THREE.Euler(0.18, 0, 0);

  // ── the celestial sphere: tilted for the latitude, spun for the hour ──────────
  const tilt = new THREE.Group();
  // the celestial pole ends up due north (-z), LATITUDE° above the horizon
  tilt.rotation.x = -(90 - LATITUDE) * DEG;
  const spin = new THREE.Group();
  tilt.add(spin);
  scene.add(tilt);

  const stars = opts.catalog.stars;
  const positions = new Float32Array(stars.length * 3);
  const sizes = new Float32Array(stars.length);
  const phases = new Float32Array(stars.length);
  const colors = new Float32Array(stars.length * 3);
  stars.forEach(([ra, dec, mag, bv], i) => {
    const [x, y, z] = vec(ra, dec, SKY_RADIUS);
    positions.set([x, y, z], i * 3);
    // brighter (lower magnitude) → bigger; the faintest stay as pinpricks
    sizes[i] = 2.2 + Math.pow(Math.max(0, 6.2 - mag), 1.55) * 1.7;
    phases[i] = Math.random();
    colors.set(colorFromBV(bv), i * 3);
  });
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  starGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  starGeometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  const makeStarMaterial = (strength: number) =>
    new THREE.ShaderMaterial({
      vertexShader: STAR_VERTEX,
      fragmentShader: STAR_FRAGMENT.replace('vTwinkle;\n  }', `vTwinkle * ${strength.toFixed(2)};\n  }`),
      uniforms: { uTime: { value: 0 }, uScale: { value: pixelRatio } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  const starMaterial = makeStarMaterial(1);
  const dustMaterial = makeStarMaterial(0.55);
  spin.add(new THREE.Points(starGeometry, starMaterial));

  // faint background stars, so the sky never looks empty between the catalogued ones
  const dustCount = 2600;
  const dust = new Float32Array(dustCount * 3);
  const dustSize = new Float32Array(dustCount);
  const dustPhase = new Float32Array(dustCount);
  const dustColor = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    dust.set([SKY_RADIUS * s * Math.cos(a), SKY_RADIUS * u, SKY_RADIUS * s * Math.sin(a)], i * 3);
    dustSize[i] = 1.4 + Math.random() * 1.4;
    dustPhase[i] = Math.random();
    dustColor.set([0.8, 0.86, 1], i * 3);
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dust, 3));
  dustGeometry.setAttribute('aSize', new THREE.BufferAttribute(dustSize, 1));
  dustGeometry.setAttribute('aPhase', new THREE.BufferAttribute(dustPhase, 1));
  dustGeometry.setAttribute('aColor', new THREE.BufferAttribute(dustColor, 3));
  spin.add(new THREE.Points(dustGeometry, dustMaterial));

  // constellation figures
  const segs: number[] = [];
  for (const figure of opts.catalog.lines) {
    for (const path of figure.paths) {
      for (let i = 0; i + 1 < path.length; i++) {
        segs.push(...vec(path[i]![0], path[i]![1], SKY_RADIUS * 0.998));
        segs.push(...vec(path[i + 1]![0], path[i + 1]![1], SKY_RADIUS * 0.998));
      }
    }
  }
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xcfb47b,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  spin.add(new THREE.LineSegments(lineGeometry, lineMaterial));

  // soft colour in the dark: three big additive clouds on the sphere
  const clouds: Array<{ sprite: InstanceType<typeof THREE.Sprite>; base: number }> = [];
  const cloudSpecs: Array<[number, number, string, number]> = [
    [80, 20, 'rgba(110,70,200,0.55)', 520],
    [250, -10, 'rgba(40,100,200,0.5)', 560],
    [165, 45, 'rgba(206,150,120,0.4)', 420],
  ];
  for (const [ra, dec, color, size] of cloudSpecs) {
    const tex = radialTexture([
      [0, color],
      [1, color.replace(/[\d.]+\)$/, '0)')],
    ]);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.55,
    });
    const sprite = new THREE.Sprite(mat);
    const [x, y, z] = vec(ra, dec, SKY_RADIUS * 0.96);
    sprite.position.set(x, y, z);
    sprite.scale.setScalar(size);
    spin.add(sprite);
    clouds.push({ sprite, base: 0.55 });
  }

  // ── the Moon ────────────────────────────────────────────────────────────────
  const moonTexture = new THREE.TextureLoader().load(opts.moonTexture);
  moonTexture.colorSpace = THREE.SRGBColorSpace;
  moonTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const moonMaterial = new THREE.MeshStandardMaterial({
    map: moonTexture,
    bumpMap: moonTexture,
    bumpScale: 1.2,
    roughness: 1,
    metalness: 0,
  });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), moonMaterial);
  // longitude 0 (the middle of the map) faces the viewer, north up, east on the right
  moon.rotation.y = -Math.PI / 2;
  const moonGroup = new THREE.Group();
  moonGroup.add(moon);

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTexture([
        [0, 'rgba(255,240,205,0.5)'],
        [0.35, 'rgba(240,215,160,0.16)'],
        [1, 'rgba(240,215,160,0)'],
      ]),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  glow.scale.setScalar(7);
  glow.position.z = -0.5;
  moonGroup.add(glow);
  scene.add(moonGroup);

  const sun = new THREE.DirectionalLight(0xfff4e0, 3.1);
  scene.add(sun);
  scene.add(sun.target);
  const earthshine = new THREE.AmbientLight(0x2a3a66, 0.22);
  scene.add(earthshine);

  // ── state ───────────────────────────────────────────────────────────────────
  const state = { progress: 0, phaseAngle: 1.95, hours: 0 };
  const target = { progress: 0, x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };
  let time = 0;

  function applyProgress(p: number) {
    // the night passes: 21:00 → 06:00, the sky turning 15° an hour
    state.hours = p * NIGHT_HOURS;
    spin.rotation.y = state.hours * 15 * DEG;

    // phase angle 0 = full (light behind the viewer), π = new. Crescent → full → gibbous.
    state.phaseAngle = lerp(1.95, -1.15, smooth(0, 1, p));
    const a = state.phaseAngle;

    // the Moon swings through the page: right → left → close → right again
    const [x, y, z] = moonPath(p);
    moonGroup.position.set(x, y, z);
    // the light follows the Moon
    sun.position.set(Math.sin(a) * 10, 1.2, Math.cos(a) * 10).add(moonGroup.position);
    sun.target.position.copy(moonGroup.position);
    moon.rotation.y = -Math.PI / 2 + p * 0.5;
    moon.rotation.x = 0.12 * Math.sin(p * 6);
    glow.material.opacity = 0.25 + 0.75 * (0.5 + 0.5 * Math.cos(a));

    // constellations draw in through the middle of the journey
    lineMaterial.opacity = 0.5 * smooth(0.12, 0.4, p) * (1 - 0.65 * smooth(0.8, 1, p));
    clouds.forEach((c, i) => {
      c.sprite.material.opacity = c.base * (0.6 + 0.4 * Math.sin(p * 5 + i * 2));
    });
  }

  function resize(width: number, height: number) {
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    // on a tall phone screen the Moon would be huge: pull the camera back
    camera.position.z = width < 720 ? 14 : 10;
  }

  function frame(dt: number) {
    time += dt;
    starMaterial.uniforms.uTime!.value = time;
    dustMaterial.uniforms.uTime!.value = time;
    // ease towards the scroll and the pointer so nothing ever snaps
    state.progress += (target.progress - state.progress) * Math.min(1, dt * 4);
    pointer.x += (target.x - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (target.y - pointer.y) * Math.min(1, dt * 3);
    applyProgress(state.progress);

    camera.rotation.set(camBase.x - pointer.y * 0.05, camBase.y - pointer.x * 0.07, 0);
    moonGroup.position.x += pointer.x * 0.25;
    moonGroup.position.y -= pointer.y * 0.18;
    // a slow drift even when nothing moves
    tilt.rotation.y = Math.sin(time * 0.05) * 0.03;

    renderer.render(scene, camera);
  }

  function dispose() {
    starGeometry.dispose();
    dustGeometry.dispose();
    lineGeometry.dispose();
    starMaterial.dispose();
    dustMaterial.dispose();
    lineMaterial.dispose();
    moonMaterial.dispose();
    moonTexture.dispose();
    moon.geometry.dispose();
    renderer.dispose();
  }

  return {
    setTarget(progress, x, y) {
      target.progress = clamp01(progress);
      target.x = x;
      target.y = y;
    },
    state,
    resize,
    frame,
    dispose,
  };
}
