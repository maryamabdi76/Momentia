#!/usr/bin/env node
/**
 * Builds src/features/sky/data/constellation-art.json: simple original figures
 * (a hunter, a bear, a swan …) drawn around the real stars of six well-known
 * constellations, for the "constellation figures" option on the poster.
 *
 *   node scripts/build-constellation-art.mjs            # writes the JSON
 *   node scripts/build-constellation-art.mjs --preview out.html   # also a contact sheet
 *
 * Every figure is anchored to catalog stars (a name that is not within 0.5° of a
 * real catalog star stops the build), so the art always sits on the right stars.
 * Shapes are authored in a flat sky plane around each figure's centre, in
 * degrees, with x pointing east (increasing right ascension) and y north, then
 * mapped back to J2000 right ascension / declination, so the chart can move
 * them with the stars exactly as it moves the constellation lines.
 *
 * The drawings are the project's own work; nothing is traced from any atlas.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const DEG = Math.PI / 180;
const dataDir = new URL('../src/features/sky/data/', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('stars.json', dataDir), 'utf8')).stars;
const linesData = JSON.parse(readFileSync(new URL('constellation-lines.json', dataDir), 'utf8')).lines;

// ── stars the figures hang on (J2000 degrees; checked against the catalog) ─────
const STARS = {
  // Orion
  Betelgeuse: [88.79, 7.41], Bellatrix: [81.28, 6.35], Meissa: [83.78, 9.93],
  Alnitak: [85.19, -1.94], Alnilam: [84.05, -1.2], Mintaka: [83.0, -0.3],
  Saiph: [86.94, -9.67], Rigel: [78.63, -8.2], Pi3: [72.46, 6.96], Pi2: [72.65, 8.9],
  Pi4: [72.8, 5.61], Pi5: [73.56, 2.44], Pi6: [74.64, 1.71], Nu: [91.89, 14.77],
  Xi: [92.98, 14.21], Chi1: [88.6, 20.28], Eta: [81.12, -2.4], Kappa: [86.94, -9.67],
  // Ursa Major
  Dubhe: [165.93, 61.75], Merak: [165.46, 56.38], Phecda: [178.46, 53.69],
  Megrez: [183.86, 57.03], Alioth: [193.51, 55.96], Mizar: [200.98, 54.93],
  Alkaid: [206.89, 49.31], Muscida: [127.57, 60.72], Talitha: [134.8, 48.04],
  Kappa_UMa: [136.0, 47.16], TaniaB: [154.27, 42.91], TaniaA: [155.58, 41.5],
  AlulaB: [169.62, 33.09], AlulaA: [169.55, 31.53], Psi: [167.42, 44.5], Chi_UMa: [176.51, 47.78],
  // Ursa Minor
  Polaris: [37.95, 89.26], Yildun: [263.05, 86.59], Eps_UMi: [251.49, 82.04],
  Zeta_UMi: [236.01, 77.79], Eta_UMi: [244.37, 75.76], Pherkad: [230.18, 71.83], Kochab: [222.68, 74.16],
  // Cassiopeia
  Caph: [2.29, 59.15], Schedar: [10.13, 56.54], Gamma_Cas: [14.18, 60.72],
  Ruchbah: [21.45, 60.24], Segin: [28.6, 63.67],
  // Scorpius
  Antares: [247.35, -26.43], Graffias: [241.36, -19.8], Dschubba: [240.08, -22.62],
  Pi_Sco: [239.71, -26.11], Sigma_Sco: [245.3, -25.59], Tau_Sco: [248.97, -28.22],
  Eps_Sco: [252.54, -34.29], Mu_Sco: [252.97, -38.05], Zeta_Sco: [253.5, -42.36],
  Eta_Sco: [258.04, -43.24], Sargas: [264.33, -43.0], Iota_Sco: [266.9, -40.13],
  Kappa_Sco: [265.62, -39.03], Shaula: [263.4, -37.1],
  // Leo
  Regulus: [152.09, 11.97], Eta_Leo: [151.83, 16.76], Algieba: [154.99, 19.84],
  Zeta_Leo: [154.17, 23.42], Mu_Leo: [148.19, 26.01], Eps_Leo: [146.46, 23.77],
  Zosma: [168.53, 20.52], Theta_Leo: [168.56, 15.43], Denebola: [177.26, 14.57], Iota_Leo: [170.98, 10.53],
  // Taurus
  Aldebaran: [68.98, 16.51], Elnath: [81.57, 28.61], Zeta_Tau: [84.41, 21.14],
  Gamma_Tau: [64.95, 15.63], Delta_Tau: [65.73, 17.54], Eps_Tau: [67.15, 19.18],
  Theta_Tau: [67.17, 15.87], Lambda_Tau: [60.17, 12.49], Alcyone: [56.87, 24.11],
  // Gemini
  Castor: [113.65, 31.89], Pollux: [116.33, 28.03], Alhena: [99.43, 16.4],
  Mebsuta: [100.98, 25.13], Tejat: [95.74, 22.51], Propus: [93.72, 22.51],
  Mekbuda: [106.03, 20.57], Wasat: [110.03, 21.98],
  // Cygnus
  Deneb: [310.36, 45.28], Sadr: [305.56, 40.26], Albireo: [292.68, 27.96],
  Gienah: [311.55, 33.97], Delta_Cyg: [296.24, 45.13],
  // Lyra
  Vega: [279.23, 38.78], Zeta_Lyr: [281.19, 37.6], Sheliak: [282.52, 33.36],
  Sulafat: [284.74, 32.69], Delta_Lyr: [283.63, 36.9],
  // Pegasus
  Markab: [346.19, 15.21], Scheat: [345.94, 28.08], Algenib: [3.31, 15.18],
  Enif: [326.05, 9.88], Matar: [340.75, 30.22], Homam: [340.37, 10.83], Alpheratz: [2.1, 29.09],
  // Canis Major
  Sirius: [101.29, -16.72], Mirzam: [95.67, -17.96], Wezen: [107.1, -26.39],
  Adhara: [104.66, -28.97], Aludra: [111.02, -29.3], Furud: [95.08, -30.06], Muliphein: [105.43, -15.63],
};

const missing = [];
for (const [name, [ra, dec]] of Object.entries(STARS)) {
  const near = Math.min(
    ...catalog.map(([a, d]) => {
      const c = Math.sin(dec * DEG) * Math.sin(d * DEG) +
        Math.cos(dec * DEG) * Math.cos(d * DEG) * Math.cos((ra - a) * DEG);
      return Math.acos(Math.min(1, c)) / DEG;
    }),
  );
  if (near > 0.5) missing.push(`${name} (${ra}, ${dec}) is ${near.toFixed(2)}° from the nearest catalog star`);
}
if (missing.length) throw new Error(missing.join('\n'));

// ── flat-sky helpers ─────────────────────────────────────────────────────────
/** Gnomonic projection onto the plane touching the sky at `center`; degrees. */
function plane(center) {
  const [a0, d0] = [center[0] * DEG, center[1] * DEG];
  const forward = ([ra, dec]) => {
    const [a, d] = [ra * DEG, dec * DEG];
    const c = Math.sin(d0) * Math.sin(d) + Math.cos(d0) * Math.cos(d) * Math.cos(a - a0);
    return [
      ((Math.cos(d) * Math.sin(a - a0)) / c) / DEG,
      ((Math.cos(d0) * Math.sin(d) - Math.sin(d0) * Math.cos(d) * Math.cos(a - a0)) / c) / DEG,
    ];
  };
  const inverse = ([x, y]) => {
    const [px, py] = [x * DEG, y * DEG];
    const rho = Math.hypot(px, py);
    if (rho === 0) return [center[0], center[1]];
    const c = Math.atan(rho);
    const dec = Math.asin(Math.cos(c) * Math.sin(d0) + (py * Math.sin(c) * Math.cos(d0)) / rho);
    const ra = a0 + Math.atan2(px * Math.sin(c), rho * Math.cos(d0) * Math.cos(c) - py * Math.sin(d0) * Math.sin(c));
    return [(((ra / DEG) % 360) + 360) % 360, dec / DEG];
  };
  return { forward, inverse };
}

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const mid = (a, b, t = 0.5) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const unit = (a) => {
  const n = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / n, a[1] / n];
};
const normal = (a) => [-a[1], a[0]];

/** Catmull-Rom through the points, `n` samples per segment. */
function smooth(pts, closed, n = 8) {
  const out = [];
  const count = pts.length;
  const at = (i) => (closed ? pts[((i % count) + count) % count] : pts[Math.max(0, Math.min(count - 1, i))]);
  const segments = closed ? count : count - 1;
  for (let i = 0; i < segments; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!closed) out.push(pts[count - 1]);
  return out;
}

/** A smooth closed blob through the points. Filled. */
const blob = (pts) => ({ closed: true, fill: true, pts: smooth(pts, true) });
/** A smooth open line through the points. */
const line = (pts) => ({ closed: false, fill: false, pts: smooth(pts, false) });
/** A filled circle. */
const disc = (c, r, n = 28) => ({
  closed: true,
  fill: true,
  pts: Array.from({ length: n }, (_, i) => add(c, [r * Math.cos((i / n) * 2 * Math.PI), r * Math.sin((i / n) * 2 * Math.PI)])),
});
/**
 * A limb, neck or tail: a smooth ribbon along the points that is `w[0]` wide at
 * the start and `w[1]` at the end, with rounded ends.
 */
function ribbon(points, w0, w1 = w0) {
  const c = smooth(points, false, 6);
  const total = c.length - 1;
  const left = [];
  const right = [];
  c.forEach((p, i) => {
    const prev = c[Math.max(0, i - 1)];
    const next = c[Math.min(total, i + 1)];
    const nrm = normal(unit(sub(next, prev)));
    const half = (w0 + (w1 - w0) * (i / total)) / 2;
    left.push(add(p, mul(nrm, half)));
    right.push(sub(p, mul(nrm, half)));
  });
  // A round end: a half circle from one side of the ribbon to the other, bulging
  // along `heading` (the way the ribbon points at that end).
  const cap = (centre, from, to, r, heading) => {
    const a0 = Math.atan2(from[1] - centre[1], from[0] - centre[0]);
    const a1 = Math.atan2(to[1] - centre[1], to[0] - centre[0]);
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const sweep = wrap(a1 - a0);
    const viaPlus = Math.abs(wrap(a0 + sweep / 2 - heading));
    const viaMinus = Math.abs(wrap(a0 + (sweep > 0 ? sweep - 2 * Math.PI : sweep + 2 * Math.PI) / 2 - heading));
    const total2 = viaPlus <= viaMinus ? sweep : sweep > 0 ? sweep - 2 * Math.PI : sweep + 2 * Math.PI;
    return Array.from({ length: 7 }, (_, i) => {
      const a = a0 + (total2 * (i + 1)) / 8;
      return [centre[0] + r * Math.cos(a), centre[1] + r * Math.sin(a)];
    });
  };
  const end = c[total];
  const start = c[0];
  const headingEnd = Math.atan2(end[1] - c[total - 1][1], end[0] - c[total - 1][0]);
  const headingStart = Math.atan2(start[1] - c[1][1], start[0] - c[1][0]);
  const pts = [
    ...left,
    ...cap(end, left[total], right[total], w1 / 2, headingEnd),
    ...right.reverse(),
    ...cap(start, right[right.length - 1], left[0], w0 / 2, headingStart),
  ];
  return { closed: true, fill: true, pts };
}

// ── the figures ──────────────────────────────────────────────────────────────
const FIGURES = [];
const figure = (id, centreStars, build) => FIGURES.push({ id, centreStars, build });

figure('Ori', ['Alnilam'], ({ S, shapes }) => {
  const [bet, bel, mei] = [S('Betelgeuse'), S('Bellatrix'), S('Meissa')];
  const [aln, ali, min] = [S('Alnitak'), S('Alnilam'), S('Mintaka')];
  const [sai, rig] = [S('Saiph'), S('Rigel')];
  const neck = mid(bet, bel);
  // legs first, so the body paints over their tops
  shapes.push(ribbon([mid(aln, ali, 0.2), mid(aln, sai, 0.5), sai], 2.4, 1.3));
  shapes.push(ribbon([mid(min, ali, 0.2), mid(min, rig, 0.5), rig], 2.4, 1.3));
  // torso
  shapes.push(blob([bel, mid(neck, bel, 0.3), neck, mid(neck, bet, 0.3), bet, add(aln, [0.9, 0.5]), add(ali, [0, -0.6]), add(min, [-0.9, 0.5])]));
  // head
  shapes.push(ribbon([neck, add(mei, [0, 0.2])], 1.6, 1.4));
  shapes.push(disc(add(mei, [0, 0.6]), 1.5));
  // club arm: raised to a club above the head
  const hand = S('Nu');
  const tip = S('Chi1');
  shapes.push(ribbon([bet, mid(bet, hand, 0.5), hand], 1.5, 1.1));
  shapes.push(ribbon([mid(hand, tip, 0.15), mid(hand, tip, 0.6), add(tip, [0, 1.6])], 1.2, 2.6));
  // shield arm: the lion's skin hanging from the other shoulder
  const p3 = S('Pi3');
  shapes.push(ribbon([bel, mid(bel, p3, 0.55), p3], 1.5, 1.2));
  shapes.push(blob([S('Pi2'), add(S('Pi2'), [-1.3, -1.6]), add(S('Pi3'), [-1.8, -0.4]), add(S('Pi4'), [-1.5, -1.0]), add(S('Pi5'), [-1.3, -1.3]), S('Pi6'), add(S('Pi4'), [1.0, 0.8])]));
  // belt sword
  shapes.push(ribbon([add(ali, [0.2, -0.8]), add(ali, [0.3, -3.2]), add(ali, [0.2, -5])], 0.9, 0.5));
});

figure('UMa', ['Megrez', 'Merak'], ({ S, shapes }) => {
  const [dub, mer, phe, meg] = [S('Dubhe'), S('Merak'), S('Phecda'), S('Megrez')];
  const [ali, miz, alk] = [S('Alioth'), S('Mizar'), S('Alkaid')];
  const mus = S('Muscida');
  // legs
  shapes.push(ribbon([add(mer, [-3, -1]), S('Psi'), S('TaniaB')], 2.2, 1.4));
  shapes.push(ribbon([add(mer, [-9, 1]), mid(S('Talitha'), S('TaniaB'), 0.45), S('Talitha')], 2.2, 1.4));
  shapes.push(ribbon([add(phe, [-1, -1]), S('Chi_UMa'), S('AlulaB')], 2.2, 1.4));
  // body: the bowl, plus a long back to the tail
  shapes.push(blob([add(dub, [2, 0.8]), add(meg, [1.6, 1.6]), add(phe, [1.4, -1.8]), add(mer, [0, -1.8]), add(mer, [-4, 0]), add(dub, [-2.4, 0.2])]));
  // tail
  shapes.push(ribbon([ali, miz, alk], 1.8, 0.8));
  // neck and head
  const head = add(mus, [-2.2, 0.4]);
  shapes.push(ribbon([add(dub, [-1, 0]), mid(dub, mus, 0.55), mus], 4.0, 3.2));
  shapes.push(blob([add(head, [-1.8, 0.2]), add(head, [-0.6, 2.4]), add(head, [1.8, 2.2]), add(head, [3.2, 0.4]), add(head, [2.6, -2.2]), add(head, [0, -2.6])]));
  shapes.push(disc(add(head, [1.5, 3.2]), 0.9, 14));
});

figure('Sco', ['Antares', 'Eps_Sco'], ({ S, shapes }) => {
  const body = [S('Sigma_Sco'), S('Antares'), S('Tau_Sco'), S('Eps_Sco'), S('Mu_Sco'), S('Zeta_Sco'), S('Eta_Sco'), S('Sargas'), S('Iota_Sco'), S('Kappa_Sco'), S('Shaula')];
  shapes.push(ribbon(body.slice(0, 8), 3.0, 1.4));
  // the curl of the tail up to the sting
  shapes.push(ribbon([S('Sargas'), S('Iota_Sco'), S('Kappa_Sco'), S('Shaula')], 1.5, 0.5));
  // claws
  const [gra, dsc, pis] = [S('Graffias'), S('Dschubba'), S('Pi_Sco')];
  shapes.push(ribbon([S('Sigma_Sco'), dsc, add(gra, [0.5, 1.5])], 1.8, 1.0));
  shapes.push(ribbon([S('Sigma_Sco'), pis, add(pis, [-1.6, 3])], 1.8, 1.0));
  shapes.push(blob([add(gra, [1.4, 2.4]), add(gra, [-1.2, 2.4]), add(gra, [-0.9, 0.4])]));
  shapes.push(blob([add(pis, [-2.8, 4.2]), add(pis, [-4.0, 1.6]), add(pis, [-1.6, 1.4])]));
  // legs
  [S('Sigma_Sco'), S('Antares'), S('Tau_Sco')].forEach((p) => {
    shapes.push(ribbon([p, add(p, [0.5, -2]), add(p, [0.4, -3.4])], 0.7, 0.4));
  });
});

figure('Gem', ['Mebsuta', 'Wasat'], ({ S, shapes }) => {
  const [cas, pol, alh, meb, tej, pro, mek, was] = [S('Castor'), S('Pollux'), S('Alhena'), S('Mebsuta'), S('Tejat'), S('Propus'), S('Mekbuda'), S('Wasat')];
  // Castor
  shapes.push(ribbon([add(cas, [-1.4, -1.6]), meb, mid(tej, pro, 0.3), pro], 2.6, 1.4));
  shapes.push(disc(add(cas, [0.2, 1.6]), 1.5));
  // Pollux
  shapes.push(ribbon([add(pol, [-0.4, -1.6]), was, mek, alh], 2.6, 1.4));
  shapes.push(disc(add(pol, [0.6, 1.6]), 1.5));
  // the twins hold hands
  shapes.push(ribbon([add(meb, [2, 1.4]), mid(meb, was, 0.5), add(was, [-1, 0.6])], 1.0, 1.0));
});

figure('Cyg', ['Sadr'], ({ S, shapes }) => {
  const [den, sad, alb, gie, dlt] = [S('Deneb'), S('Sadr'), S('Albireo'), S('Gienah'), S('Delta_Cyg')];
  // wings
  shapes.push(blob([add(sad, [0, 1.4]), add(gie, [0.8, 2.6]), add(gie, [-1.2, -0.2]), add(gie, [-4.2, 2.4]), add(sad, [3, 2.4])]));
  shapes.push(blob([add(sad, [0, 1.8]), add(dlt, [-2.2, 0.6]), add(dlt, [-0.4, -2.6]), add(dlt, [4.6, -2.6]), add(sad, [-3.4, 2.8])]));
  // body, tail and the long neck
  shapes.push(ribbon([add(den, [1.4, 1.4]), mid(den, sad, 0.5), sad], 1.8, 3.0));
  shapes.push(ribbon([sad, mid(sad, alb, 0.45), add(mid(sad, alb, 0.75), [-1.2, 0.4]), add(alb, [0.4, 1.2])], 3.0, 1.2));
  shapes.push(blob([add(alb, [0.8, 2.0]), add(alb, [-0.8, 1.2]), add(alb, [-2.8, -1.4]), add(alb, [0.4, 0.2])]));
  shapes.push(blob([add(den, [0.2, 0.6]), add(den, [2.2, 2.6]), add(den, [1.6, -1.2])]));
});

figure('CMa', ['Sirius', 'Wezen'], ({ S, shapes }) => {
  const [sir, mir, wez, adh, alu, fur, mul_] = [S('Sirius'), S('Mirzam'), S('Wezen'), S('Adhara'), S('Aludra'), S('Furud'), S('Muliphein')];
  // legs
  shapes.push(ribbon([add(mir, [0.4, -1.6]), add(fur, [0.8, 3.4]), fur], 2.0, 1.1));
  shapes.push(ribbon([add(wez, [-1, 0.8]), add(adh, [-1.6, 2]), add(adh, [-1.4, -1.2])], 2.2, 1.1));
  shapes.push(ribbon([add(wez, [3, 1.4]), alu], 2.2, 1.1));
  // body
  shapes.push(blob([add(mir, [-1.2, 0.4]), add(sir, [0.6, 2.2]), add(wez, [3.4, 2.8]), add(alu, [2.2, 0.6]), add(wez, [2, -3.4]), add(mir, [-0.6, -3])]));
  // neck, head and ears
  shapes.push(ribbon([add(sir, [0, 0.6]), add(mul_, [-1.6, -0.2]), add(mul_, [-3.8, 0.4])], 4.2, 3.2));
  shapes.push(blob([add(mul_, [-3.6, 1.6]), add(mul_, [-6.6, 0.2]), add(mul_, [-6.2, -1.6]), add(mul_, [-3.4, -1.8])]));
  shapes.push(blob([add(mul_, [-3.4, 1.6]), add(mul_, [-3.8, 3.6]), add(mul_, [-2, 2.4])]));
  // tail
  shapes.push(ribbon([add(alu, [2.4, 0.4]), add(alu, [4.4, 1.6]), add(alu, [5.6, 4])], 1.2, 0.5));
});

// ── build ────────────────────────────────────────────────────────────────────
const round = (n) => Math.round(n * 100) / 100;
const out = [];
const preview = [];
for (const { id, centreStars, build } of FIGURES) {
  const centreRaDec = centreStars
    .map((n) => STARS[n])
    .reduce((acc, [ra, dec], _i, all) => [acc[0] + ra / all.length, acc[1] + dec / all.length], [0, 0]);
  const { forward, inverse } = plane(centreRaDec);
  const S = (name) => {
    if (!STARS[name]) throw new Error(`unknown star ${name}`);
    return forward(STARS[name]);
  };
  const shapes = [];
  build({ S, shapes });
  out.push({
    id,
    shapes: shapes.map((s) => ({
      closed: s.closed,
      fill: s.fill,
      points: s.pts.map((p) => inverse(p).map(round)),
    })),
  });
  preview.push({ id, centreRaDec, forward, shapes });
}

writeFileSync(new URL('constellation-art.json', dataDir), JSON.stringify({ figures: out }) + '\n');
const bytes = JSON.stringify({ figures: out }).length;
console.log(`${out.length} figures, ${bytes} bytes`);

// ── contact sheet for eyeballing ─────────────────────────────────────────────
const flag = process.argv.indexOf('--preview');
if (flag > 0) {
  const SIZE = 560;
  const panels = preview.map(({ id, centreRaDec, forward, shapes }) => {
    const all = shapes.flatMap((s) => s.pts);
    const xs = all.map((p) => p[0]);
    const ys = all.map((p) => p[1]);
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) + 8;
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    const k = SIZE / span;
    // east on the left, like the poster
    const px = (p) => (SIZE / 2 - (p[0] - cx) * k).toFixed(1);
    const py = (p) => (SIZE / 2 - (p[1] - cy) * k).toFixed(1);
    const d = (pts, closed) => pts.map((p, i) => `${i ? 'L' : 'M'}${px(p)} ${py(p)}`).join('') + (closed ? 'Z' : '');
    const stars = catalog
      .filter((s) => s[2] < 5.2)
      .map((s) => ({ s, p: forward([s[0], s[1]]) }))
      .filter(({ p }) => Math.abs(p[0] - cx) < span / 2 && Math.abs(p[1] - cy) < span / 2)
      .map(({ s, p }) => `<circle cx="${px(p)}" cy="${py(p)}" r="${(0.7 + (5.4 - s[2]) * 0.9).toFixed(1)}" fill="#fff"/>`)
      .join('');
    const lines = linesData
      .filter((l) => l.id === id)
      .flatMap((l) => l.paths)
      .map((path) => {
        const pts = path.map(([ra, dec]) => forward([ra, dec]));
        return `<path d="${d(pts, false)}" fill="none" stroke="#9db4ff" stroke-opacity=".55" stroke-width="1"/>`;
      })
      .join('');
    const art = shapes
      .map((s) => `<path d="${d(s.pts, s.closed)}" fill="${s.fill ? '#9db4ff' : 'none'}" fill-opacity=".14" stroke="#cdd9ff" stroke-opacity=".75" stroke-width="1.2"/>`)
      .join('');
    return `<div><b>${id}</b><svg width="${SIZE}" height="${SIZE}" style="background:#0c142b"><defs><clipPath id="c${id}"><rect width="${SIZE}" height="${SIZE}"/></clipPath></defs><g clip-path="url(#c${id})">${art}${lines}${stars}</g></svg></div>`;
  });
  writeFileSync(process.argv[flag + 1], `<!doctype html><meta charset=utf-8><body style="margin:0;background:#222;color:#fff;font:14px sans-serif;display:grid;grid-template-columns:repeat(3,${SIZE}px);gap:8px">${panels.join('')}`);
}
