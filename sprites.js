/* Last Ration sprite engine: materials -> 5 tone ramps + outline, shapes as masks, layers back to front, one light top-left, colored outlines, cast shadows, then hand placed detail pixels. All art is drawn in code, no image files. */
const SPN = 32;
const BASE = {
  skin: "#e2a982", hairB: "#5a3a26", jacket: "#6b7a4a", pants: "#4a4f63", boot: "#3e2a1e", bandana: "#c8a030", vaultB: "#3f62a0", vaultP: "#35508a",
  pack: "#8a6a3a", eye: "#2a1a22", cheek: "#d88a7a", leath: "#7a5a3a", steel: "#8a9098", mohawk: "#a83a28", rust: "#9a5a32", rustD: "#6a3a22", kevlar: "#4a5a46", orange: "#d88030",
  zskin: "#8fa68a", zhair: "#3a3a30", rag: "#8a7a60", rag2: "#6a5a7a", ghoul: "#a8c46a", brute: "#7da05a", armor: "#8a8f94",
  bearFur: "#6b4a30", snout: "#4a3a30", bone: "#d8cdb0", roach: "#7a4a22", roachB: "#c08a3a",
  metal: "#c7ced4", dmetal: "#6a7078", wood: "#9a6a3e", dwood: "#5e3a22", grip: "#3a3a40", can: "#b8c4cc",
  labelR: "#c93b30", labelG: "#62a84a", labelY: "#e8c040", labelB: "#5d8ebf", glass: "#d4e6ec", water: "#5d8ebf", dirtyW: "#8a7a4a",
  medw: "#f2f2ec", red: "#c93b30", brass: "#d6a64a", box: "#8a7a4a", apple: "#c93b30", leaf: "#4c9a3a", jerky: "#7a3a22",
  candy: "#e0508a", pill: "#e8a030", bandage: "#e8dcc0", cloth: "#c8b898", paper: "#e8dcb8",
  grass: "#7a8450", dirt: "#a08052", asphalt: "#58544e", sidew: "#a89c84", plank: "#8a6a40", tilef: "#b4ae98", brick: "#8a4e36", metalF: "#6a7078", radg: "#8a9a3a",
  wallT: "#b8a898", lake: "#4a7a78", pineG: "#4a6a44", oakG: "#6a7a3c", deadW: "#6a5848", trunk: "#5e4026", carA: "#9a5038", carB: "#4a6684",
  crate: "#a07a48", shelf: "#7a5a3a", fridge: "#d4d8d4", locker: "#6a7a8a", medbox: "#e0e4e0", glow: "#c8ff40", sheet: "#cfd6c4", canvas: "#a89870", green: "#4a7a40", ember: "#f0a030"
};
function _hsl(hex) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
  }
  return [h, s, l];
}
function _hex(h, s, l) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2; let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  return "#" + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("");
}
const _RC = {};
function ramp(name) {
  if (_RC[name]) return _RC[name];
  const hex = BASE[name] || name; const [h, s, l] = _hsl(hex);
  const warm = d => (h > 200 && h < 330) ? h + d * .6 : h + d;
  return _RC[name] = [_hex(warm(10), s * .85, Math.min(.97, l + .2)), _hex(warm(5), s * .92, Math.min(.95, l + .1)), hex,
    _hex(warm(-6), s * 1.05, l - .12), _hex(warm(-12), s * 1.08, l - .24), _hex(h - 14, Math.min(.6, s * .75), Math.max(.07, l * .26))];
}
const ELL = (cx, cy, rx, ry) => (x, y) => { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; return dx * dx + dy * dy <= 1 };
const RECT = (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
const AND = (...f) => (x, y) => f.every(g => g(x, y));
const OR = (...f) => (x, y) => f.some(g => g(x, y));
const NOT = f => (x, y) => !f(x, y);
const SEG = (x0, y0, x1, y1, w) => (x, y) => {
  const px = x + .5, py = y + .5, dx = x1 - x0, dy = y1 - y0,
    t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy)) <= w / 2;
};
const POLY = pts => (x, y) => {
  const px = x + .5, py = y + .5; let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) c = !c;
  }
  return c;
};
const SUP = (cx, cy, rx, ry, a = 0, p = 4) => {
  const c = Math.cos(a), s = Math.sin(a);
  return (x, y) => { const dx = x + .5 - cx, dy = y + .5 - cy, u = dx * c + dy * s, v = -dx * s + dy * c; return Math.abs(u / rx) ** p + Math.abs(v / ry) ** p <= 1 };
};
const RELL = (cx, cy, rx, ry, a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return (x, y) => { const dx = x + .5 - cx, dy = y + .5 - cy, u = dx * c + dy * s, v = -dx * s + dy * c; return (u / rx) ** 2 + (v / ry) ** 2 <= 1 };
};
function _hash(x, y, s) {
  let n = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16; return ((n >>> 0) / 4294967295) * 2 - 1;
}
const L = (m, c, o = {}) => Object.assign({ m, c, sh: "round", tex: 0, seed: 1, cast: true }, o);

function paint32(def, N) {
  const px = Array.from({ length: N }, () => Array(N).fill(null));
  def.L.forEach((ly, li) => {
    const { m, c, sh, tex, seed, cast } = ly; const pts = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (m(x, y)) pts.push([x, y]);
    if (!pts.length) return;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2, rx = Math.max(1, (x1 - x0 + 1) / 2), ry = Math.max(1, (y1 - y0 + 1) / 2), rp = ramp(c);
    pts.forEach(([x, y]) => {
      let i;
      if (sh === "flat") i = 2; else if (sh === "hi") i = 1; else if (sh === "shade") i = 3; else if (sh === "deep") i = 4;
      else {
        const u = (x + .5 - cx) / rx, v = (y + .5 - cy) / ry;
        let l = sh === "top" ? v * 1.3 : sh === "cyl" ? u * 1.05 + v * .2 : u * .55 + v * .85;
        l += tex * _hash(x, y, seed); i = l < -.85 ? 0 : l < -.32 ? 1 : l < .38 ? 2 : l < .82 ? 3 : 4;
      }
      if (cast && px[y + 1] && px[y + 1][x] && px[y + 1][x].li < li && !m(x, y + 1)) {
        const b = px[y + 1][x]; b.i = Math.min(4, b.i + 2); b.col = b.rp[b.i];
      }
      px[y][x] = { li, i, rp, col: rp[i] };
    });
    if (cast) pts.forEach(([x, y]) => {
      const b = px[y + 1] && px[y + 1][x];
      if (b && b.li < li && !m(x, y + 1)) { const me = px[y][x]; me.i = Math.min(4, me.i + 1); me.col = me.rp[me.i]; }
    });
  });
  const out = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (px[y][x]) continue;
    const n = [[0, 1], [1, 0], [-1, 0], [0, -1]].map(([a, b]) => px[y + b] && px[y + b][x + a]).find(Boolean);
    if (n) out.push([x, y, n.rp[5]]);
  }
  return { px, out };
}
const SPECS = {}; const _SPC = {};
function getSprite(id) {
  if (_SPC[id]) return _SPC[id];
  const def = SPECS[id](); const N = def.size || SPN;
  const cv = document.createElement("canvas"); cv.width = N; cv.height = N; const g = cv.getContext("2d");
  const sh = def.shadow === null ? null : (def.shadow || ELL(16, 29.5, 12, 1.8));
  if (sh) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (sh(x, y)) { g.fillStyle = "rgba(10,8,6,.28)"; g.fillRect(x, y, 1, 1); }
  const { px, out } = paint32(def, N);
  out.forEach(([x, y, c]) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); });
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (px[y][x]) { g.fillStyle = px[y][x].col; g.fillRect(x, y, 1, 1); }
  (def.D || []).forEach(([x, y, c]) => {
    if (x < 0 || y < 0 || x >= N || y >= N) return; let f = c; const m = /^([A-Za-z0-9]+):(\d)$/.exec(c); if (m) f = ramp(m[1])[+m[2]];
    g.fillStyle = f; g.fillRect(x, y, 1, 1);
  });
  return _SPC[id] = cv;
}
const every = (m, N = 32) => { const o = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (m(x, y)) o.push([x, y]); return o; };
const scat = (n, x0, y0, x1, y1, c, seed, test) => {
  const o = [];
  for (let i = 0; o.length < n && i < n * 30; i++) {
    const x = Math.floor(x0 + (x1 - x0 + 1) * ((_hash(i, seed, 11) + 1) / 2)), y = Math.floor(y0 + (y1 - y0 + 1) * ((_hash(seed, i, 13) + 1) / 2));
    if (!test || test(x, y)) o.push([x, y, c]);
  }
  return o;
};

/* ---------- characters: one humanoid recipe, tuned per creature ---------- */
function humanoid(o) {
  const hy = o.hunch || 0, w = o.w || 1;
  const head = ELL(16, 9.5 + hy, 5.4, 5.2);
  const hair = o.hair ? AND(OR(ELL(16, 7.2 + hy, 6, 4.6), ELL(16, 6 + hy, 5, 4)), (x, y) => y < 10 + hy) : () => false;
  const coat = OR(SUP(16, 21 + hy / 2, 6.2 * w, 5.2, 0, 3), POLY([[16 - 5 * w, 23], [16 + 5 * w, 23], [16 + 6 * w, 27], [16 - 6 * w, 27]]));
  const aY = o.armsOut ? 19 : 22, aEx = o.armsOut ? 6.5 : 0;
  const armR = SEG(16 + 5.6 * w, 17 + hy, 16 + 6.4 * w + aEx, aY + 1, 3), armL = SEG(16 - 5.6 * w, 17 + hy, 16 - 6.4 * w - aEx, aY + 1, 3);
  const L_ = [];
  if (o.pack) L_.push(L(ELL(23.2, 20, 3, 4.4), "pack", { tex: .2, seed: 3 }));
  L_.push(L(OR(SEG(13, 25, 13, 29, 3), SEG(19, 25, 19, 29, 3)), o.pants, { sh: "cyl" }),
    L(OR(ELL(12.5, 29, 2.6, 1.5), ELL(19.5, 29, 2.6, 1.5)), "boot"),
    L(armR, o.top, { sh: "cyl" }),
    L(coat, o.top, { tex: o.ragged ? .35 : .15, seed: 4 }));
  if (o.belly) L_.push(L(ELL(16, 22, 5.2 * w, 3.6), o.top, { sh: "shade", cast: false }));
  L_.push(L(head, o.skin, { sh: "flat" }), L(AND(head, NOT(ELL(15, 9 + hy, 5.2, 5))), o.skin, { sh: "shade", cast: false }));
  if (o.hair) L_.push(L(hair, o.hair, { sh: "flat", cast: false }), L(AND(hair, NOT(ELL(15, 6 + hy, 6, 4))), o.hair, { sh: "shade", cast: false }));
  if (o.scarf) L_.push(L(ELL(16, 14.6 + hy, 5, 1.3), o.scarf));
  L_.push(L(armL, o.top, { sh: "cyl" }),
    L(ELL(16 - 6.4 * w - aEx, aY + 1.5, 1.7, 1.6), o.skin), L(ELL(16 + 6.4 * w + aEx, aY + 1.5, 1.7, 1.6), o.skin));
  if (o.armor) L_.push(L(OR(ELL(10, 16.5 + hy, 2.6, 2), ELL(22, 16.5 + hy, 2.6, 2)), "armor"), L(ELL(16, 22, 3, 2.4), "armor", { sh: "hi" }));
  const D = [[14, 9 + hy, o.eyeC || "eye:2"], [14, 10 + hy, o.eyeC || "eye:2"], [18, 9 + hy, o.eyeC || "eye:2"], [18, 10 + hy, o.eyeC || "eye:2"],
    [15, 12 + hy, "skin:5"], [16, 12 + hy, "skin:5"], [17, 12 + hy, "skin:4"]];
  if (!o.noCatch) D.push([14, 9 + hy, "#ffffff"], [18, 9 + hy, "#ffffff"]);
  if (!o.noBlush) D.push([13, 11 + hy, "cheek:2"], [19, 11 + hy, "cheek:3"]);
  D.push([13, 6 + hy, "skin:0"], [14, 5 + hy, "skin:0"]);
  every(m => coat(m[0], m[1]) && (m[0] + m[1] * 2) % 7 === 0); // keep deterministic references light
  if (o.ragged) { D.push(...scat(8, 10, 18, 22, 27, o.skin + ":3", 5, coat)); D.push([12, 27, o.top + ":4"], [15, 27, o.top + ":4"], [19, 26, o.top + ":4"]); }
  else D.push([16, 19, o.top + ":1"], [16, 22, o.top + ":4"], [16, 25, o.top + ":4"]);
  if (o.extra) D.push(...o.extra);
  return { size: 32, shadow: ELL(16, 29.4, 11 * w, 1.9), L: L_, D };
}
SPECS.player = () => humanoid({ skin: "skin", hair: "hairB", top: "vaultB", pants: "vaultP", scarf: "bandana", pack: true,
  extra: [[8, 23, "skin:1"], [24, 23, "skin:1"], [16, 18, "bandana:1"], [16, 19, "bandana:1"], [16, 20, "bandana:2"], [15, 24, "bandana:1"], [16, 24, "bandana:1"], [17, 24, "bandana:1"]] });
SPECS.shambler = () => humanoid({ skin: "zskin", hair: "zhair", top: "rag", pants: "rag2", armsOut: true, ragged: true, noBlush: true, noCatch: true, eyeC: "#b02020",
  extra: [[15, 13, "#7a1a1a"], [16, 13, "#7a1a1a"], [11, 22, "#7a1a1a"], [20, 20, "#7a1a1a"]] });
SPECS.ghoul = () => humanoid({ skin: "ghoul", top: "rag", pants: "rag2", armsOut: true, hunch: 1.5, ragged: true, noBlush: true, noCatch: true, eyeC: "#f4ff60",
  extra: [[14, 9, "#ffffff"], [18, 9, "#ffffff"], [11, 12, "ghoul:0"], [21, 12, "ghoul:0"], [16, 9, "ghoul:3"]] });
SPECS.brute = () => humanoid({ skin: "brute", top: "rag2", pants: "rag", armsOut: true, w: 1.45, belly: true, armor: true, noBlush: true, noCatch: true, eyeC: "#f0c030",
  hair: null, extra: [[11, 24, "armor:0"], [21, 24, "armor:0"]] });
SPECS.roach = () => ({
  size: 32, shadow: ELL(16, 25, 10, 2),
  L: [L(OR(SEG(10, 20, 6, 25, 1.8), SEG(15, 22, 13, 27, 1.8), SEG(21, 21, 25, 26, 1.8), SEG(24, 19, 29, 22, 1.8)), "roach", { sh: "shade", cast: false }),
    L(ELL(17, 18, 10.5, 6.6), "roach", { tex: .2, seed: 3 }), L(ELL(7, 17, 3.6, 3.4), "roachB"),
    L(AND(ELL(17, 18, 10.5, 6.6), (x, y) => x > 18), "roach", { sh: "shade", cast: false })],
  D: [[17, 12, "roach:4"], [17, 13, "roach:4"], [17, 14, "roach:4"], [17, 15, "roach:4"], [17, 16, "roach:4"], [17, 17, "roach:4"], [17, 18, "roach:4"], [17, 19, "roach:4"], [17, 20, "roach:4"],
    [13, 14, "roach:1"], [12, 15, "roach:1"], [14, 13, "roach:0"], [21, 15, "roach:1"], [6, 15, "glow:2"], [8, 15, "glow:2"], [4, 12, "roach:5"], [3, 11, "roach:5"], [9, 13, "roach:5"], [10, 11, "roach:5"], [11, 10, "roach:5"], [6, 17, "roachB:0"]]
});
SPECS.mauler = () => ({
  size: 32, shadow: ELL(16, 29, 13, 2),
  L: [L(OR(SEG(9, 23, 8, 28, 4), SEG(23, 23, 24, 28, 4)), "bearFur", { sh: "cyl", tex: .3 }),
    L(ELL(16, 19, 11.5, 8.6), "bearFur", { tex: .4, seed: 5 }),
    L(OR(POLY([[8, 13], [10, 7], [13, 12]]), POLY([[14, 11], [16, 5], [18, 11]]), POLY([[19, 12], [22, 7], [24, 13]])), "bone", { cast: false }),
    L(ELL(16, 12, 6.4, 5.6), "bearFur", { tex: .3, seed: 6 }), L(OR(ELL(10.5, 7.5, 2.2, 2.2), ELL(21.5, 7.5, 2.2, 2.2)), "bearFur"),
    L(ELL(16, 14.6, 3.4, 2.6), "snout", { sh: "flat" }), L(OR(SEG(8, 25, 7, 29, 1.8), SEG(24, 25, 25, 29, 1.8)), "bone", { sh: "flat", cast: false })],
  D: [[12, 10, "#ff9020"], [13, 10, "#ffd060"], [19, 10, "#ff9020"], [20, 10, "#ffd060"], [15, 15, "snout:5"], [17, 15, "snout:5"], [16, 16, "#e8c8b0"], [14, 17, "#f0f0e0"], [18, 17, "#f0f0e0"],
    ...scat(14, 7, 14, 25, 25, "bearFur:4", 7, ELL(16, 19, 11, 8)), ...scat(10, 7, 14, 25, 25, "bearFur:1", 8, ELL(16, 19, 11, 8))]
});

/* ---------- world props ---------- */
SPECS.tree_pine = () => ({
  size: 32, shadow: ELL(16, 29, 8, 2),
  L: [L(RECT(14, 23, 17, 29), "trunk", { sh: "cyl" }), L(POLY([[16, 2], [6, 14], [26, 14]]), "pineG", { tex: .25, seed: 2 }),
    L(POLY([[16, 8], [4, 21], [28, 21]]), "pineG", { tex: .25, seed: 3 }), L(POLY([[16, 14], [3, 27], [29, 27]]), "pineG", { tex: .3, seed: 4 })],
  D: [[13, 8, "pineG:0"], [11, 15, "pineG:0"], [8, 22, "pineG:0"], [14, 6, "pineG:1"]]
});
SPECS.tree_oak = () => ({
  size: 32, shadow: ELL(16, 29, 9, 2),
  L: [L(RECT(14, 20, 17, 29), "trunk", { sh: "cyl" }), L(ELL(16, 11, 12, 9.5), "oakG", { tex: .35, seed: 2 }),
    L(OR(ELL(10, 15, 6.5, 5.5), ELL(22, 15, 6.5, 5.5)), "oakG", { tex: .35, seed: 6 })],
  D: [...scat(8, 6, 4, 24, 14, "oakG:0", 4, ELL(16, 11, 11, 8.5)), ...scat(6, 6, 6, 24, 20, "oakG:4", 7, ELL(16, 12, 11, 8.5))]
});
SPECS.tree_dead = () => ({
  size: 32, shadow: ELL(16, 29, 7, 1.8),
  L: [L(RECT(14, 8, 17, 29), "deadW", { sh: "cyl", tex: .3 }), L(SEG(15.5, 14, 8, 6, 2.2), "deadW", { sh: "cyl" }), L(SEG(16.5, 12, 24, 5, 2.2), "deadW", { sh: "cyl" }),
    L(SEG(16, 18, 22, 13, 2), "deadW", { sh: "cyl" })], D: [[15, 3, "deadW:3"], [16, 4, "deadW:3"]]
});
SPECS.bush = () => ({
  size: 32, shadow: null,
  L: [L(OR(ELL(11, 22, 7, 5.5), ELL(20, 21, 8, 6.5), ELL(16, 18, 7, 6)), "leaf", { tex: .4, seed: 9 })],
  D: [...scat(6, 6, 14, 26, 26, "leaf:0", 3, OR(ELL(11, 22, 6, 5), ELL(20, 21, 7, 6))), [18, 17, "#c93b30"], [12, 21, "#c93b30"], [22, 23, "#c93b30"]]
});
function _box(mat, extra) {
  return { size: 32, shadow: ELL(16, 27, 12, 2.4), L: [L(RECT(6, 11, 25, 25), mat, { tex: .1 }), L(RECT(6, 8, 25, 12), mat, { sh: "hi", cast: false })], D: extra || [] };
}
SPECS.c_crate = () => _box("crate", [[6, 17, "crate:4"], [7, 17, "crate:4"], [8, 18, "crate:4"], [25, 17, "crate:4"], [24, 17, "crate:4"], [10, 8, "crate:0"], [11, 8, "crate:0"], [16, 18, "crate:3"], [15, 19, "crate:3"], [17, 17, "crate:3"], [14, 20, "crate:3"], [18, 16, "crate:3"]]);
SPECS.c_shelf = () => ({
  size: 32, shadow: ELL(16, 28, 12, 2), L: [L(RECT(5, 6, 26, 26), "shelf", { tex: .15 }), L(RECT(7, 9, 24, 14), "dwood", { sh: "deep", cast: false }), L(RECT(7, 17, 24, 22), "dwood", { sh: "deep", cast: false })],
  D: [[9, 12, "labelR:2"], [10, 12, "labelR:2"], [13, 11, "labelY:2"], [14, 11, "labelY:2"], [17, 12, "labelG:2"], [18, 12, "labelG:2"], [21, 12, "labelB:2"], [10, 20, "labelB:2"], [14, 20, "labelR:2"], [15, 20, "labelR:2"], [19, 20, "labelY:2"], [20, 20, "labelY:2"], [8, 6, "shelf:0"], [9, 6, "shelf:0"]]
});
SPECS.c_fridge = () => ({
  size: 32, shadow: ELL(16, 28, 9, 2), L: [L(RECT(9, 3, 23, 27), "fridge", { tex: .03 }), L(RECT(9, 3, 23, 12), "fridge", { sh: "hi", cast: false })],
  D: [[9, 13, "fridge:4"], [10, 13, "fridge:4"], [11, 13, "fridge:4"], [12, 13, "fridge:4"], [13, 13, "fridge:4"], [14, 13, "fridge:4"], [15, 13, "fridge:4"], [16, 13, "fridge:4"], [17, 13, "fridge:4"], [18, 13, "fridge:4"], [19, 13, "fridge:4"], [20, 13, "fridge:4"], [21, 13, "fridge:4"], [22, 13, "fridge:4"], [23, 13, "fridge:4"], [20, 7, "metal:2"], [20, 8, "metal:2"], [20, 17, "metal:2"], [20, 18, "metal:2"], [11, 4, "#ffffff"], [10, 5, "#ffffff"]]
});
SPECS.c_medbox = () => ({
  size: 32, shadow: ELL(16, 27, 10, 2), L: [L(RECT(7, 8, 24, 25), "medbox", { tex: .04 }), L(RECT(7, 8, 24, 12), "medbox", { sh: "hi", cast: false })],
  D: [[15, 14, "red:2"], [16, 14, "red:2"], [15, 15, "red:2"], [16, 15, "red:2"], [15, 16, "red:2"], [16, 16, "red:2"], [15, 17, "red:2"], [16, 17, "red:2"], [13, 15, "red:2"], [14, 15, "red:2"], [17, 15, "red:2"], [18, 15, "red:2"], [13, 16, "red:2"], [14, 16, "red:2"], [17, 16, "red:2"], [18, 16, "red:2"]]
});
SPECS.c_locker = () => ({
  size: 32, shadow: ELL(16, 28, 10, 2), L: [L(RECT(8, 4, 24, 27), "locker", { tex: .05 }), L(RECT(8, 4, 24, 9), "locker", { sh: "hi", cast: false })],
  D: [[16, 10, "locker:4"], [16, 11, "locker:4"], [16, 12, "locker:4"], [16, 13, "locker:4"], [16, 14, "locker:4"], [16, 15, "locker:4"], [16, 16, "locker:4"], [16, 17, "locker:4"], [16, 18, "locker:4"], [16, 19, "locker:4"], [16, 20, "locker:4"], [14, 15, "metal:0"], [18, 15, "metal:0"], [11, 6, "locker:0"], [12, 6, "locker:0"]]
});
SPECS.c_wreck = () => ({
  size: 32, shadow: ELL(16, 27, 14, 2.6),
  L: [L(RECT(2, 12, 29, 25), "carA", { tex: .2, seed: 5 }), L(RECT(8, 6, 22, 14), "carA", { sh: "hi", tex: .1, cast: false }), L(RECT(10, 7, 20, 13), "glass", { sh: "deep", cast: false }), L(OR(ELL(8, 25, 3.2, 2.6), ELL(23, 25, 3.2, 2.6)), "grip")],
  D: [[11, 8, "#ffffff"], [12, 8, "#ffffff"], [4, 14, "carA:0"], [5, 14, "carA:0"], [14, 18, "carA:4"], [15, 19, "carA:4"], [22, 17, "#5a2a16"], [23, 18, "#5a2a16"], [6, 20, "#5a2a16"], [3, 24, "#d8a030"], [28, 24, "#d8a030"], [10, 10, "glass:4"], [18, 9, "glass:4"]]
});
SPECS.c_wreck2 = () => { const s = SPECS.c_wreck(); s.L[0] = L(RECT(2, 12, 29, 25), "carB", { tex: .2, seed: 2 }); s.L[1] = L(RECT(8, 6, 22, 14), "carB", { sh: "hi", tex: .1, cast: false }); return s; };
SPECS.loot_spark = () => ({ size: 32, shadow: null, L: [], D: [[16, 14, "#fff6d8"], [15, 14, "#fff6d8"], [17, 14, "#fff6d8"], [16, 13, "#fff6d8"], [16, 15, "#fff6d8"], [12, 20, "#fff6d8"], [20, 10, "#fff6d8"]] });
SPECS.bag_drop = () => ({ size: 32, shadow: ELL(16, 24, 8, 1.8), L: [L(ELL(16, 19, 7, 6), "pack", { tex: .2 }), L(ELL(16, 13.5, 3, 2), "pack")], D: [[13, 17, "pack:0"], [14, 16, "pack:0"], [16, 14, "pack:4"]] });

/* ---------- item icons ---------- */
const _gun = (id, L_, D) => { SPECS["i_" + id] = () => ({ size: 32, shadow: null, L: L_, D: D || [] }); };
_gun("pistol", [L(RECT(8, 11, 24, 15), "metal", { tex: .05 }), L(RECT(8, 15, 13, 23), "grip"), L(RECT(14, 15, 17, 17), "dmetal")], [[10, 11, "metal:0"], [11, 11, "metal:0"], [24, 12, "dmetal:4"]]);
_gun("shotgun", [L(RECT(3, 19, 10, 24), "wood", { tex: .1 }), L(RECT(10, 13, 30, 15), "metal"), L(RECT(10, 16, 28, 18), "dmetal"), L(RECT(14, 18, 21, 21), "wood", { tex: .1 }), L(RECT(9, 15, 14, 20), "dmetal")], [[12, 13, "metal:0"], [13, 13, "metal:0"]]);
_gun("smg", [L(RECT(6, 12, 25, 16), "dmetal", { tex: .05 }), L(RECT(14, 16, 18, 25), "grip"), L(RECT(8, 16, 11, 22), "grip"), L(RECT(25, 13, 30, 14), "metal"), L(SEG(2, 14, 7, 14, 2), "metal", { sh: "flat" })], [[8, 12, "dmetal:0"], [9, 12, "dmetal:0"]]);
_gun("rifle_auto", [L(RECT(3, 12, 9, 17), "wood"), L(RECT(9, 12, 22, 16), "dmetal"), L(RECT(22, 13, 31, 14), "metal"), L(RECT(14, 16, 18, 25), "grip"), L(RECT(10, 16, 12, 21), "grip"), L(RECT(16, 9, 22, 11), "dmetal")], [[10, 12, "dmetal:0"], [11, 12, "dmetal:0"]]);
_gun("rifle", [L(RECT(2, 19, 10, 24), "wood", { tex: .1 }), L(RECT(10, 15, 31, 17), "metal"), L(RECT(10, 17, 22, 20), "wood", { tex: .1 }), L(RECT(12, 11, 21, 13), "dmetal"), L(RECT(11, 13, 13, 15), "dmetal"), L(RECT(19, 13, 21, 15), "dmetal")], [[13, 11, "dmetal:0"], [14, 11, "dmetal:0"], [12, 15, "metal:0"]]);
_gun("bat", [L(SEG(7, 25, 26, 6, 4.2), "wood", { sh: "cyl", tex: .1 }), L(SEG(5, 27, 9, 23, 3), "grip", { sh: "flat" })], [[24, 6, "wood:0"], [25, 7, "wood:0"]]);
_gun("knife", [L(POLY([[10, 22], [12, 7], [22, 20]]), "metal", { sh: "cyl" }), L(RECT(7, 19, 15, 25), "grip")], [[12, 9, "#ffffff"], [12, 11, "metal:0"]]);
_gun("machete", [L(POLY([[8, 26], [12, 6], [25, 7], [23, 16], [12, 26]]), "metal", { sh: "cyl", tex: .05 }), L(SEG(5, 28, 11, 22, 3.4), "grip", { sh: "flat" })], [[14, 8, "#ffffff"], [15, 8, "#ffffff"]]);
_gun("pipe", [L(SEG(7, 25, 25, 7, 3.6), "dmetal", { sh: "cyl" }), L(SEG(6, 26, 10, 22, 4), "metal", { sh: "cyl" })], [[22, 8, "metal:0"], [23, 9, "metal:0"]]);
const _can = (id, lab, extra) => { SPECS["i_" + id] = () => ({ size: 32, shadow: ELL(16, 27, 8, 1.8), L: [L(RECT(9, 9, 22, 26), "can", { sh: "cyl", tex: .05 }), L(ELL(15.5, 9, 6.6, 2), "metal", { sh: "hi", cast: false }), L(RECT(9, 14, 22, 21), lab, { sh: "cyl", cast: false })], D: [[11, 11, "#ffffff"], [12, 12, "#ffffff"], ...(extra || [])] }); };
_can("beans", "labelR", [[14, 17, "#f4e0b0"], [15, 17, "#f4e0b0"], [16, 18, "#f4e0b0"]]); _can("soup", "labelY"); _can("soda", "labelB"); _can("petfood", "labelG");
SPECS.i_crackers = () => ({ size: 32, shadow: ELL(16, 27, 9, 1.8), L: [L(RECT(8, 7, 23, 26), "labelY", { tex: .05 }), L(RECT(10, 12, 21, 20), "paper", { sh: "flat", cast: false })], D: [[12, 15, "box:3"], [13, 15, "box:3"], [16, 16, "box:3"], [17, 16, "box:3"], [10, 8, "labelY:0"], [11, 8, "labelY:0"]] });
SPECS.i_apple = () => ({ size: 32, shadow: ELL(16, 27, 8, 1.8), L: [L(ELL(16, 18, 8, 7.6), "apple", { tex: .06 }), L(SEG(16, 11, 17, 7, 1.6), "trunk", { sh: "flat" }), L(ELL(20, 8, 3, 1.6), "leaf", { sh: "flat" })], D: [[12, 14, "#ffffff"], [13, 13, "#ffffff"], [12, 15, "apple:0"]] });
SPECS.i_candy = () => ({ size: 32, shadow: ELL(16, 26, 9, 1.6), L: [L(RECT(9, 12, 23, 20), "candy", { sh: "cyl" }), L(POLY([[9, 12], [5, 10], [5, 22], [9, 20]]), "candy", { sh: "shade" }), L(POLY([[23, 12], [27, 10], [27, 22], [23, 20]]), "candy", { sh: "shade" })], D: [[11, 14, "#ffffff"], [12, 14, "#ffffff"], [16, 16, "candy:0"], [18, 17, "candy:4"]] });
SPECS.i_jerky = () => ({ size: 32, shadow: ELL(16, 26, 10, 1.8), L: [L(RELL(16, 17, 10, 4.2, -.4), "jerky", { tex: .35, seed: 4 }), L(RELL(15, 22, 9, 3.6, -.3), "jerky", { tex: .35, seed: 7 })], D: [[11, 18, "jerky:0"], [14, 16, "jerky:0"], [19, 13, "jerky:0"], [13, 22, "jerky:0"], [18, 20, "jerky:0"]] });
const _bottle = (id, mat, fill) => { SPECS["i_" + id] = () => ({ size: 32, shadow: ELL(16, 27, 6, 1.6), L: [L(RECT(11, 11, 20, 26), "glass", { sh: "cyl", tex: .02 }), L(RECT(13, 5, 18, 11), "glass", { sh: "cyl" }), L(RECT(11, 14, 20, 25), fill, { sh: "cyl", cast: false }), L(RECT(13, 3, 18, 6), mat, { sh: "flat" })], D: [[12, 13, "#ffffff"], [12, 16, "#ffffff"], [13, 7, "#ffffff"]] }); };
_bottle("water", "labelB", "water"); _bottle("dirty", "dwood", "dirtyW");
SPECS.i_bandage = () => ({ size: 32, shadow: ELL(16, 26, 8, 1.8), L: [L(ELL(16, 17, 9, 8), "bandage", { tex: .08 }), L(ELL(16, 17, 4, 3.6), "paper", { sh: "deep", cast: false })], D: [[11, 12, "#ffffff"], [12, 11, "#ffffff"], [16, 17, "#2a1a22"], [14, 22, "red:2"], [15, 22, "red:2"], [16, 22, "red:2"]] });
SPECS.i_splint = () => ({ size: 32, shadow: ELL(16, 26, 10, 1.6), L: [L(SEG(6, 24, 26, 8, 3.4), "wood", { sh: "cyl" }), L(SEG(8, 27, 28, 11, 3.4), "wood", { sh: "cyl" }), L(OR(SEG(12, 18, 14, 25, 3), SEG(19, 12, 21, 19, 3)), "bandage", { sh: "cyl", cast: false })], D: [[24, 9, "wood:0"], [25, 10, "wood:0"]] });
const _pill = (id, cap, body) => { SPECS["i_" + id] = () => ({ size: 32, shadow: ELL(16, 27, 7, 1.6), L: [L(RECT(10, 11, 21, 26), body, { sh: "cyl" }), L(RECT(10, 7, 21, 11), cap, { sh: "cyl" }), L(RECT(11, 15, 20, 22), "paper", { sh: "flat", cast: false })], D: [[12, 13, "#ffffff"], [13, 9, "#ffffff"], [15, 18, "red:2"], [16, 18, "red:2"], [15, 19, "red:2"], [16, 19, "red:2"], [13, 18, "red:2"], [18, 18, "red:2"]] }); };
_pill("antibio", "labelB", "pill"); _pill("radaway", "glow", "pill");
SPECS.i_medkit = () => ({ size: 32, shadow: ELL(16, 27, 11, 2), L: [L(RECT(5, 10, 26, 25), "medw", { tex: .03 }), L(RECT(12, 7, 19, 11), "dmetal", { sh: "flat" })], D: [[15, 14, "red:2"], [16, 14, "red:2"], [15, 15, "red:2"], [16, 15, "red:2"], [15, 16, "red:2"], [16, 16, "red:2"], [15, 17, "red:2"], [16, 17, "red:2"], [15, 18, "red:2"], [16, 18, "red:2"], [13, 16, "red:2"], [14, 16, "red:2"], [17, 16, "red:2"], [18, 16, "red:2"], [7, 11, "#ffffff"], [8, 11, "#ffffff"]] });
const _ammo = (id, lab) => { SPECS["i_" + id] = () => ({ size: 32, shadow: ELL(16, 26, 10, 1.8), L: [L(RECT(7, 12, 24, 24), "box", { tex: .1 }), L(RECT(7, 9, 24, 13), "box", { sh: "hi", cast: false }), L(RECT(10, 15, 21, 21), lab, { sh: "flat", cast: false })], D: [[12, 17, "brass:1"], [13, 17, "brass:1"], [15, 17, "brass:1"], [16, 17, "brass:1"], [18, 17, "brass:1"], [19, 17, "brass:1"], [12, 18, "brass:3"], [15, 18, "brass:3"], [18, 18, "brass:3"]] }); };
_ammo("ammo9", "labelY"); _ammo("ammoShell", "labelR"); _ammo("ammoRifle", "labelG");

/* ---------- ground tiles: 32x32, drawn per pixel from a ramp with hashed noise ---------- */
const TILES = {};
function tileCanvas(kind, v) {
  const key = kind + v; if (TILES[key]) return TILES[key];
  const cv = document.createElement("canvas"); cv.width = cv.height = 32; const g = cv.getContext("2d");
  const mat = { grass: "grass", dirt: "dirt", road: "asphalt", side: "sidew", wood: "plank", tilef: "tilef", wall: "brick", lake: "lake", sand: "dirt", radg: "radg", metal: "metalF" }[kind] || "grass";
  const r = ramp(mat);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const n = _hash(x, y, v * 7 + kind.length); let i = 2;
    if (kind === "grass") i = n > .55 ? 1 : n < -.5 ? 3 : 2;
    else if (kind === "dirt" || kind === "sand") i = n > .6 ? 1 : n < -.4 ? 3 : 2;
    else if (kind === "radg") { i = n > .55 ? 1 : n < -.45 ? 3 : 2; if (n > .93) i = 0; }
    else if (kind === "metal") { i = (x % 16 === 0 || y % 16 === 0) ? 4 : n > .8 ? 1 : n < -.8 ? 3 : 2; if ((x % 16 === 2 || x % 16 === 13) && (y % 16 === 2 || y % 16 === 13)) i = 0; }
    else if (kind === "road") { i = n > .78 ? 1 : n < -.7 ? 3 : 2; if (_hash(x >> 1, y >> 1, v + 17) > .93 && n < .3) i = 4; if (v === 1 && y >= 15 && y <= 16 && (x % 12) < 7) i = -1; if (v === 2 && x >= 15 && x <= 16 && (y % 12) < 7) i = -2; }
    else if (kind === "side") { i = (x % 16 === 0 || y % 16 === 0) ? 3 : n > .7 ? 1 : 2; }
    else if (kind === "wood") { i = (y % 8 === 0) ? 3 : n > .8 ? 1 : (((x + (y >> 3) * 11) % 24) === 0 ? 3 : 2); }
    else if (kind === "tilef") { i = (x % 16 === 0 || y % 16 === 0) ? 3 : ((x >> 4) + (y >> 4)) % 2 ? 1 : 2; if (n > .85) i = 0; }
    else if (kind === "wall") {
      const row = y >> 3, off = (row % 2) * 8; i = (y % 8 === 0 || (x + off) % 16 === 0) ? 3 : n > .6 ? 1 : n < -.6 ? 3 : 2;
      if (y < 3) i = n > 0 ? 0 : 1; if (y >= 30) i = 4; else if (y >= 28) i = 3;
    } else if (kind === "lake") { i = n > .75 ? 0 : n < -.4 ? 3 : (((x + y * 3 + v * 5) % 11) === 0 ? 1 : 2); }
    g.fillStyle = i === -1 ? "#d8b040" : i === -2 ? "#d8b040" : r[i]; g.fillRect(x, y, 1, 1);
  }
  if (kind === "grass" && v % 2 === 0) { g.fillStyle = r[0]; [[6, 8], [7, 7], [22, 20], [23, 19], [14, 26]].forEach(([x, y]) => g.fillRect(x, y, 1, 1)); }
  return TILES[key] = cv;
}
