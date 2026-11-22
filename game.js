"use strict";
/* Last Ration: game logic and input. Drawing and menus live in ui.js. See README.md for the design rules. */
const DAYSEC = 600, HOLD_MS = 220, START_MIN = 8 * 60, SAVEKEY = "lastration_v5";
const NAMES = ["Wren", "Cole", "Mara", "Jonah", "Tess", "Silas", "Nora", "Dale", "Ivy", "Hank", "Ruth", "Gus", "June", "Abe", "Lena", "Moss", "Pearl", "Reed"];
const SK = ["str", "per", "end", "agi", "int", "lck"], SN = { str: "STR", per: "PER", end: "END", agi: "AGI", int: "INT", lck: "LCK" };
const SDESC = { str: "Melee damage, bag slots", per: "Sight range, accuracy", end: "Max health, radiation guard", agi: "Speed, roll, reload", int: "Experience, repairs", lck: "Crits, better loot" };
const PERKS = {
  gunslinger: { n: "Gunslinger", d: "+15% damage with guns." }, ironfist: { n: "Iron Fist", d: "+25% melee damage." }, toughness: { n: "Toughness", d: "+20 max health." },
  hardy: { n: "Camel Hump", d: "Hunger and thirst drain 25% slower." }, radres: { n: "Rad Resistant", d: "Take 35% less radiation." }, ghost: { n: "Ghost", d: "Enemies spot you from 25% less far." },
  quick: { n: "Quick Hands", d: "Reload 30% faster." }, fleet: { n: "Fleet Foot", d: "+10% speed, quicker roll." }, medic: { n: "Field Medic", d: "Healing items heal 50% more." },
  fixit: { n: "Mr. Fix-It", d: "Weapons wear 40% slower. Repairs restore more." }, looter: { n: "Scavenger", d: "Extra loot in containers and corpses." }, steady: { n: "Steady Aim", d: "35% less weapon spread." },
  strongback: { n: "Strong Back", d: "+4 bag slots." }, chemres: { n: "Chem Resistant", d: "Half the chance of addiction." }, stomach: { n: "Iron Stomach", d: "Bad food and water never make you sick." }
};
const BUILDS = {
  campfire: { n: "Campfire", cost: { wood: 3 }, d: "Cook meat, boil water." }, workbench: { n: "Workbench", cost: { scrap: 6, wood: 4 }, d: "Craft and repair." },
  stash: { n: "Stash Chest", cost: { wood: 5, scrap: 2 }, d: "Safe storage, 30 slots." }, bed: { n: "Cot", cost: { cloth: 5, wood: 3 }, d: "Sleep through the night." },
  turret: { n: "Gun Turret", cost: { scrap: 8, gears: 4 }, d: "Shoots enemies. Load 9mm." }
};
const RECIPES = [
  { n: "Repair Kit", out: { id: "repair_kit", n: 1 }, cost: { scrap: 3, gears: 1 } }, { n: "9mm x8", out: { id: "ammo9", n: 8 }, cost: { scrap: 2, gears: 1 } },
  { n: "Shells x4", out: { id: "ammoShell", n: 4 }, cost: { scrap: 2, cloth: 1 } }, { n: "Rifle x6", out: { id: "ammoRifle", n: 6 }, cost: { scrap: 3, gears: 1 } },
  { n: "Energy cells x8", out: { id: "ammoCell", n: 8 }, cost: { scrap: 1, gears: 2 } }, { n: "Bandage x2", out: { id: "bandage", n: 2 }, cost: { cloth: 2 } },
  { n: "Splint", out: { id: "splint", n: 1 }, cost: { wood: 2, cloth: 1 } }, { n: "Leather Armor", out: { id: "leather_armor", n: 1 }, cost: { cloth: 6, wood: 2 } },
  { n: "Metal Armor", out: { id: "metal_armor", n: 1 }, cost: { scrap: 10, cloth: 2 } }
];
const canvas = document.getElementById("c"), ctx = canvas.getContext("2d");
const dark = document.createElement("canvas"), dctx = dark.getContext("2d"), vig = document.createElement("canvas");
let VW = 294, VH = 630, SC = 3, safeTop = 12, safeBot = 8, BTN = {}, QB = [];
function resize() {
  const dpr = window.devicePixelRatio || 1, cssW = Math.min(innerWidth, innerHeight * .58), cssH = innerHeight;
  SC = Math.max(2, Math.round(cssW * dpr / 290)); VW = Math.floor(cssW * dpr / SC); VH = Math.floor(cssH * dpr / SC);
  canvas.width = dark.width = vig.width = VW; canvas.height = dark.height = vig.height = VH;
  canvas.style.width = (VW * SC / dpr) + "px"; canvas.style.height = (VH * SC / dpr) + "px";
  const pr = document.getElementById("probe"), cs = getComputedStyle(pr);
  safeTop = Math.max(10, (parseFloat(cs.paddingTop) || 0) * dpr / SC + 6); safeBot = Math.max(8, (parseFloat(cs.paddingBottom) || 0) * dpr / SC + 6);
  const b = VH - safeBot;
  BTN = { act: { x: VW - 36, y: b - 62, r: 25, label: "ACT" }, roll: { x: VW - 98, y: b - 34, r: 19, label: "ROLL" }, reload: { x: VW - 102, y: b - 82, r: 17, label: "LOAD" }, swap: { x: VW - 66, y: b - 116, r: 17, label: "SWAP" }, menu: { x: VW - 24, y: safeTop + 16, r: 15, label: "PIP" } };
  QB = [{ k: "eat", x: 8, y: b - 98, w: 36, h: 36 }, { k: "drink", x: 48, y: b - 98, w: 36, h: 36 }, { k: "med", x: 88, y: b - 98, w: 36, h: 36 }];
  const g = vig.getContext("2d"), rg = g.createRadialGradient(VW / 2, VH * .48, VH * .28, VW / 2, VH * .48, VH * .72); rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(10,6,0,.55)"); g.clearRect(0, 0, VW, VH); g.fillStyle = rg; g.fillRect(0, 0, VW, VH);
  ctx.imageSmoothingEnabled = false;
}
addEventListener("resize", resize);

/* ---------- helpers ---------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const S = { deadNpc: new Set(), talk: null, trade: null, scene: "title", world: null, p: null, t: START_MIN, time: 0, enemies: [], corpses: [], bullets: [], structs: [], parts: [], pops: [], tracers: [], toasts: [], shake: 0, flash: 0, menu: null, loot: null, levelup: null, create: null, sleep: null, scroll: 0, scrollMax: 0, cam: { x: 0, y: 0 }, light: 1, sightMult: 1, aim: null, spawnT: 5, saveT: 0, confirmNew: false, hint: 0, fog: null, dead: new Set() };
const solidAt = (px, py) => { const tx = Math.floor(px / TS), ty = Math.floor(py / TS); return tx < 0 || ty < 0 || tx >= MW || ty >= MH || S.world.solid[ty * MW + tx] === 1; };
const hitBox = (x, y, r) => solidAt(x - r, y - r) || solidAt(x + r, y - r) || solidAt(x - r, y + r) || solidAt(x + r, y + r);
function moveBody(o, dx, dy, r) {
  let b = false;
  if (!hitBox(o.x + dx, o.y, r)) o.x += dx; else b = true;
  if (!hitBox(o.x, o.y + dy, r)) o.y += dy; else b = true;
  return b;
}
function los(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 8);
  for (let i = 1; i < n; i++) { const t = i / n; if (solidAt(lerp(x0, x1, t), lerp(y0, y1, t))) return false; }
  return true;
}
function rayWall(x, y, a, range) {
  const c = Math.cos(a), s = Math.sin(a);
  for (let d = 4; d < range; d += 4) if (solidAt(x + c * d, y + s * d)) return d;
  return range;
}
const hourOf = t => (t / 60) % 24;
function lightAt(h) { return h >= 7 && h < 18 ? 1 : h >= 18 && h < 20 ? 1 - (h - 18) / 2 : h >= 5 && h < 7 ? (h - 5) / 2 : 0; }
const fmtClock = t => { const h = Math.floor(hourOf(t)), m = Math.floor(t % 60); return ((h + 11) % 12 + 1) + ":" + String(m).padStart(2, "0") + (h < 12 ? " AM" : " PM"); };
function toast(msg, col = "#b8ffd0") { S.toasts.push({ msg, col, t: 3.2 }); if (S.toasts.length > 4) S.toasts.shift(); }
function pop(x, y, txt, col = "#fff") { S.pops.push({ x, y, txt, col, t: .8 }); }
function burst(x, y, n, col, spd = 70) { for (let i = 0; i < n; i++) { const a = rnd(6.3), v = rnd(spd * .3, spd); S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(.25, .55), col, sz: rnd(1, 2.4) }); } }
const itemName = id => AMMO_ITEMS[id] ? AMMO_ITEMS[id].n : ITEMS[id].n;

/* ---------- character: stats, perks, buffs ---------- */
const hasPerk = id => !!S.p.perks[id];
const withdrawing = () => { const p = S.p; for (const id in p.addict) if (p.addict[id] > 0 && !p.buffs[id]) return true; return false; };
function st(k) {
  const p = S.p; let v = p.stats[k];
  for (const id in p.buffs) { const f = ITEMS[id].chem.fx[k]; if (f) v += f; }
  if (withdrawing()) v -= k === "agi" ? 2 : k === "str" || k === "per" ? 1 : 0;
  return clamp(v, 1, 14);
}
function bfx(k) { let m = 1; for (const id in S.p.buffs) { const f = ITEMS[id].chem.fx[k]; if (f) m *= f; } return m; }
function bAdd(k) { let a = 0; for (const id in S.p.buffs) { const f = ITEMS[id].chem.fx[k]; if (f) a += f; } return a; }
const maxHp = () => Math.max(20, Math.round(50 + st("end") * 10 + (S.p.lvl - 1) * 4 + (hasPerk("toughness") ? 20 : 0) + bAdd("hp") - S.p.rad * .3));
const invCap = () => clamp(8 + st("str") + (hasPerk("strongback") ? 4 : 0), 8, 20);
const xpNeed = l => 40 + l * 30;
function giveXp(n) {
  const p = S.p; p.xp += n * (1 + (st("int") - 5) * .05);
  while (p.xp >= xpNeed(p.lvl)) { p.xp -= xpNeed(p.lvl); p.lvl++; p.points++; p.picks++; toast("LEVEL " + p.lvl + "! Open the PIP menu.", "#ffe070"); p.hp = Math.min(maxHp(), p.hp + 10); }
}
function rollPerks() {
  const p = S.p, left = Object.keys(PERKS).filter(k => !p.perks[k]), out = [];
  while (out.length < 3 && left.length) out.push(left.splice(Math.floor(Math.random() * left.length), 1)[0]);
  return out;
}
function radGain(x) {
  const p = S.p; let m = 1 - (st("end") - 5) * .04; if (hasPerk("radres")) m *= .65; m *= bfx("radres");
  for (const slot of ["body", "head"]) if (p[slot]) m *= 1 - ITEMS[p[slot]].rr;
  p.rad = clamp(p.rad + x * m, 0, 100);
}
function drDamage(dmg) {
  const p = S.p; let dr = 0; for (const slot of ["body", "head"]) if (p[slot]) dr += ITEMS[p[slot]].dr;
  return Math.max(1, dmg * (1 - Math.min(.7, dr)) * bfx("res"));
}

/* ---------- player ---------- */
function newPlayer(world, stats, name) {
  return { name: name || pick(NAMES), x: world.spawn.x, y: world.spawn.y, hp: 100, hunger: 85, thirst: 85, rad: 0, caps: 25, bleed: false, fract: false, inf: false, sick: 0,
    stats: stats || { str: 5, per: 5, end: 5, agi: 5, int: 5, lck: 5 }, lvl: 1, xp: 0, points: 0, picks: 0, perks: {}, buffs: {}, addict: {},
    inv: [{ id: "crackers", n: 1 }, { id: "water", n: 1 }, { id: "bandage", n: 1 }], ammo: { a9: 0, shell: 0, rifle: 0, a44: 0, cell: 0 }, gun: null, melee: { id: "knife", cond: 85 }, body: null, head: null, active: "melee",
    kills: 0, face: 1, aim: 0, cd: 0, reload: null, burst: null, roll: null, rollCd: 0, search: null, swing: 0, moving: false, hurtT: 0, jam: false, cause: "" };
}
function newGame(stats, name) {
  const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) & 0x7fffffff;
  S.world = genWorld(seed); S.p = newPlayer(S.world, stats, name); S.t = START_MIN; S.time = 0; S.dead = new Set(); S.deadNpc = new Set(); S.toasts = []; S.parts = []; S.pops = []; S.tracers = []; S.bullets = []; S.corpses = []; S.structs = [];
  S.fog = new Uint8Array(MW * MH); initMap(); S.p.hp = maxHp(); initEnemies(); S.scene = "play"; S.menu = S.loot = S.levelup = S.sleep = S.talk = S.trade = null; S.confirmNew = false;
  toast("Morning light. " + S.p.name + " climbs out of the vault.", "#b8ffd0"); save();
}
function initEnemies() { S.enemies = S.world.enemies.filter(e => !S.dead.has(e.id)).map(e => mkEnemy(e.type, e.x, e.y, e.id, e.home)); }
function mkEnemy(type, x, y, id = -1, home = null) { const d = ET[type]; return { id, type, x, y, home, hp: d.hp, state: "idle", tx: x, ty: y, cd: rnd(.3, 1), wind: 0, lost: 0, flash: 0, wt: rnd(1, 4), wa: 0, face: 1, kx: 0, ky: 0, dead: false, walk: rnd(6), stuck: 0, lunge: 0, lcd: 0 }; }

/* ---------- map and fog ---------- */
let mapCv = null, mapCtx = null;
function mapColor(i) {
  const w = S.world, g = w.ground[i], d = w.deco[i];
  if (d === 1 || d === 2) return "#2f4a2a"; if (d === 3) return "#5a4a3a"; if (d === 21) return "#e8902a"; if (d === 22) return "#d8c030";
  switch (g) { case GR.ROAD: case GR.ROADH: case GR.ROADV: return "#66625a"; case GR.SIDE: return "#8a8070"; case GR.LAKE: return "#3f6a70"; case GR.WALL: return "#8a4e36"; case GR.WOOD: case GR.TILEF: return "#b0a080"; case GR.METAL: return "#7a8088"; case GR.RADG: return "#a0c030"; case GR.DIRT: return "#8a6c44"; default: return "#6a7444"; }
}
function initMap() {
  mapCv = document.createElement("canvas"); mapCv.width = MW; mapCv.height = MH; mapCtx = mapCv.getContext("2d"); mapCtx.fillStyle = "#0c0a06"; mapCtx.fillRect(0, 0, MW, MH);
  for (let i = 0; i < MW * MH; i++) if (S.fog[i]) { mapCtx.fillStyle = mapColor(i); mapCtx.fillRect(i % MW, (i / MW) | 0, 1, 1); }
}
let lastFogTile = -1;
function revealFog() {
  const p = S.p, tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS), key = ty * MW + tx; if (key === lastFogTile) return; lastFogTile = key;
  for (let y = ty - 9; y <= ty + 9; y++) for (let x = tx - 9; x <= tx + 9; x++) {
    if (x < 0 || y < 0 || x >= MW || y >= MH || (x - tx) ** 2 + (y - ty) ** 2 > 81) continue; const i = y * MW + x;
    if (!S.fog[i]) { S.fog[i] = 1; mapCtx.fillStyle = mapColor(i); mapCtx.fillRect(x, y, 1, 1); }
  }
}
const packFog = () => { const n = S.fog.length >> 3, b = new Uint8Array(n + 1); for (let i = 0; i < S.fog.length; i++) if (S.fog[i]) b[i >> 3] |= 1 << (i & 7); let s = ""; for (let i = 0; i < b.length; i += 4096) s += String.fromCharCode.apply(null, b.subarray(i, i + 4096)); return btoa(s); };
const unpackFog = s => { const f = new Uint8Array(MW * MH); try { const r = atob(s); for (let i = 0; i < f.length; i++) if (r.charCodeAt(i >> 3) & (1 << (i & 7))) f[i] = 1; } catch (e) { } return f; };

/* ---------- save / load: seed + survivor + what changed. Enemies respawn from the seed except the ones you killed. ---------- */
function save() {
  if (S.scene !== "play") return;
  try {
    const p = S.p, w = S.world, cl = {}; w.containers.forEach(c => { if (c.loot && !c.looted) cl[c.id] = c.loot; });
    localStorage.setItem(SAVEKEY, JSON.stringify({ seed: w.seed, t: S.t, dead: [...S.dead], looted: w.containers.filter(c => c.looted).map(c => c.id), conLoot: cl, taken: w.items.filter(i => i.taken && i.id >= 0).map(i => i.id), drops: w.items.filter(i => i.id < 0 && !i.taken),
      structs: S.structs, deadNpc: [...S.deadNpc], npcCorpses: S.corpses.filter(c => c.npc && !c.looted).map(c => ({ x: c.x, y: c.y, sprite: c.sprite, scale: c.scale, name: c.name, face: c.face, loot: c.loot, npc: 1, looted: false })), npcStock: Object.fromEntries(w.npcs.filter(n => n.stock).map(n => [n.id, n.stock])), fog: packFog(), p: { name: p.name, x: p.x, y: p.y, hp: p.hp, hunger: p.hunger, thirst: p.thirst, rad: p.rad, caps: p.caps, bleed: p.bleed, fract: p.fract, inf: p.inf, sick: p.sick, stats: p.stats, lvl: p.lvl, xp: p.xp, points: p.points, picks: p.picks, perks: p.perks, buffs: p.buffs, addict: p.addict,
        inv: p.inv, ammo: p.ammo, gun: p.gun, melee: p.melee, body: p.body, head: p.head, active: p.active, kills: p.kills } }));
  } catch (e) { }
}
const hasSave = () => { try { return !!localStorage.getItem(SAVEKEY); } catch (e) { return false; } };
function loadGame() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVEKEY)); S.world = genWorld(d.seed); S.p = Object.assign(newPlayer(S.world), d.p); S.t = d.t; S.dead = new Set(d.dead);
    const lo = new Set(d.looted), tk = new Set(d.taken); S.world.containers.forEach(c => { c.looted = lo.has(c.id); if (d.conLoot[c.id]) c.loot = d.conLoot[c.id]; }); S.world.items.forEach(i => { i.taken = tk.has(i.id); });
    (d.drops || []).forEach(i => S.world.items.push(i));
    S.deadNpc = new Set(d.deadNpc || []); S.world.npcs = S.world.npcs.filter(n => !S.deadNpc.has(n.id)); (S.world.npcs || []).forEach(n => { if (d.npcStock && d.npcStock[n.id]) n.stock = d.npcStock[n.id]; }); S.structs = d.structs || []; S.structs.forEach(s => { if (s.t !== "campfire") S.world.solid[s.y * MW + s.x] = 1; });
    S.fog = d.fog ? unpackFog(d.fog) : new Uint8Array(MW * MH); initMap(); lastFogTile = -1;
    S.time = 0; S.corpses = (d.npcCorpses || []); S.bullets = []; initEnemies(); S.scene = "play"; S.toasts = []; S.menu = S.loot = S.levelup = S.sleep = S.talk = S.trade = null; toast("Welcome back, " + S.p.name + ".", "#b8ffd0"); return true;
  } catch (e) { return false; }
}
addEventListener("pagehide", save); document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });

/* ---------- inventory ---------- */
const stackOf = id => ITEMS[id].s || 6;
const countItem = id => S.p.inv.reduce((a, s) => a + (s.id === id ? s.n : 0), 0);
function addItem(id, n, cond) {
  const p = S.p;
  if (id === "caps") { p.caps += n; return 0; }
  if (AMMO_ITEMS[id]) { p.ammo[AMMO_ITEMS[id].k] += n; return 0; }
  const it = ITEMS[id];
  if (it.t === "gun" && !p.gun) { p.gun = { id, mag: 0, cond: cond ?? 70 }; if (p.active === "melee") p.active = "gun"; return 0; }
  if (it.t === "melee" && (!p.melee || p.melee.id === "fists")) { p.melee = { id, cond: cond ?? 70 }; return 0; }
  if (it.t === "armor" && !p[it.slot]) { p[it.slot] = id; return 0; }
  if (it.t === "gun" || it.t === "melee" || it.t === "armor") { if (p.inv.length < invCap()) { p.inv.push({ id, n: 1, cond }); return 0; } return n; }
  while (n > 0) {
    const s = p.inv.find(s => s.id === id && s.n < stackOf(id));
    if (s) { const a = Math.min(n, stackOf(id) - s.n); s.n += a; n -= a; } else if (p.inv.length < invCap()) { const a = Math.min(n, stackOf(id)); p.inv.push({ id, n: a }); n -= a; } else break;
  }
  return n;
}
function takeMats(cost) { for (const id in cost) { let n = cost[id]; for (let i = S.p.inv.length - 1; i >= 0 && n > 0; i--) { const s = S.p.inv[i]; if (s.id !== id) continue; const a = Math.min(n, s.n); s.n -= a; n -= a; if (s.n <= 0) S.p.inv.splice(i, 1); } } }
const hasMats = cost => Object.keys(cost).every(id => countItem(id) >= cost[id]);
function dropGround(id, n, x = S.p.x, y = S.p.y, cond) { S.world.items.push({ id: -1 - S.world.items.length, x: x + rnd(-10, 10), y: y + rnd(-6, 12), item: id, n, cond, taken: false }); }
function dropItem(idx) { const s = S.p.inv[idx]; if (!s) return; dropGround(s.id, s.n, S.p.x, S.p.y, s.cond); S.p.inv.splice(idx, 1); }
function consume(idx) { const s = S.p.inv[idx]; s.n--; if (s.n <= 0) S.p.inv.splice(idx, 1); }
function useChem(id) {
  const p = S.p, c = ITEMS[id].chem; p.buffs[id] = c.dur;
  if (p.addict[id] !== undefined) p.addict[id] = 420;
  else if (c.add && Math.random() < c.add * (hasPerk("chemres") ? .5 : 1)) { p.addict[id] = 420; toast("You are hooked on " + ITEMS[id].n + ".", "#d080ff"); }
}
function useItem(idx) {
  const p = S.p, s = p.inv[idx]; if (!s) return; const it = ITEMS[s.id];
  if (it.t === "gun" || it.t === "melee" || it.t === "armor") return equipFromInv(idx);
  if (it.t === "mat") { toast("Crafting material. See the MAKE tab.", "#bbb"); return; }
  if (it.t === "tool") { if (repairActive(40 + (hasPerk("fixit") ? 15 : 0))) { consume(idx); toast("Weapon repaired.", "#bff0a0"); } return; }
  if (it.t === "chem") { useChem(s.id); toast(it.n + " kicks in.", "#d8a0ff"); consume(idx); return; }
  if (it.hunger) p.hunger = clamp(p.hunger + it.hunger, 0, 100);
  if (it.thirst) p.thirst = clamp(p.thirst + it.thirst, 0, 100);
  if (it.hp) { const h = Math.round(it.hp * (hasPerk("medic") ? 1.5 : 1)); p.hp = Math.min(maxHp(), p.hp + h); pop(p.x, p.y - 26, "+" + h, "#7ee07e"); }
  if (it.rad) p.rad = Math.max(0, p.rad + it.rad);
  if (it.cure) for (const c of it.cure) { if (c === "sick") p.sick = 0; else p[c] = false; }
  if (it.cureAddict) { p.addict = {}; toast("Addictions cleared.", "#bff0a0"); }
  if (it.sick && !hasPerk("stomach") && Math.random() < it.sick) { p.sick = 90; toast("That did not agree with you. Sick.", "#c8d870"); }
  toast("Used " + it.n); consume(idx);
}
function equipFromInv(idx) {
  const p = S.p, s = p.inv[idx], it = ITEMS[s.id];
  if (it.t === "gun") { const old = p.gun; p.gun = { id: s.id, mag: 0, cond: s.cond ?? 70 }; p.inv.splice(idx, 1); if (old) { p.ammo[WP[old.id].ammo] += old.mag; p.inv.push({ id: old.id, n: 1, cond: old.cond }); } p.active = "gun"; p.reload = null; p.burst = null; p.jam = false; }
  else if (it.t === "melee") { const old = p.melee; p.melee = { id: s.id, cond: s.cond ?? 70 }; p.inv.splice(idx, 1); if (old && old.id !== "fists") p.inv.push({ id: old.id, n: 1, cond: old.cond }); p.active = "melee"; }
  else { const old = p[it.slot]; p[it.slot] = s.id; p.inv.splice(idx, 1); if (old) p.inv.push({ id: old, n: 1 }); }
  toast("Equipped " + it.n);
}
function unequip(slot) {
  const p = S.p; if (p.inv.length >= invCap()) { toast("Bag full.", "#ff9a7a"); return; }
  if (slot === "gun" && p.gun) { p.ammo[WP[p.gun.id].ammo] += p.gun.mag; p.inv.push({ id: p.gun.id, n: 1, cond: p.gun.cond }); p.gun = null; p.active = "melee"; p.reload = null; p.burst = null; }
  else if (slot === "melee" && p.melee && p.melee.id !== "fists") { p.inv.push({ id: p.melee.id, n: 1, cond: p.melee.cond }); p.melee = null; }
  else if ((slot === "body" || slot === "head") && p[slot]) { p.inv.push({ id: p[slot], n: 1 }); p[slot] = null; }
}
function swapWeapon() { const p = S.p; if (p.active === "melee" && p.gun) p.active = "gun"; else p.active = "melee"; p.burst = null; }
function curWeapon() { const p = S.p; if (p.active === "gun" && p.gun) return { w: WP[p.gun.id], inst: p.gun, id: p.gun.id, gun: true }; const id = p.melee ? p.melee.id : "fists"; return { w: WP[id], inst: p.melee || { id: "fists", cond: 100 }, id, gun: false }; }
const condMult = inst => !inst || inst.cond === undefined ? 1 : inst.cond >= 50 ? 1 : inst.cond <= 0 ? .4 : .6 + .4 * inst.cond / 50;
function wear(inst, a) { if (!inst || inst.cond === undefined || inst.id === "fists") return; inst.cond = Math.max(0, inst.cond - a * (hasPerk("fixit") ? .6 : 1)); }
function repairActive(amt) { const p = S.p, inst = p.active === "gun" && p.gun ? p.gun : p.melee; if (!inst || inst.cond === undefined) { toast("Nothing to repair.", "#bbb"); return false; } if (inst.cond >= 100) { toast("Already in perfect shape.", "#bbb"); return false; } inst.cond = Math.min(100, inst.cond + amt); p.jam = false; return true; }
function repairSlot(slot) {
  const p = S.p, inst = p[slot]; if (!inst || inst.cond >= 100) return;
  const kit = p.inv.findIndex(s => s.id === "repair_kit");
  if (kit >= 0) { inst.cond = Math.min(100, inst.cond + 40 + (hasPerk("fixit") ? 15 : 0)); consume(kit); giveXp(3); toast("Repaired with a kit.", "#bff0a0"); }
  else if (nearStruct("workbench", 70) && countItem("scrap") >= 2) { takeMats({ scrap: 2 }); inst.cond = Math.min(100, inst.cond + 30 + (hasPerk("fixit") ? 15 : 0)); giveXp(2); toast("Patched up at the bench.", "#bff0a0"); }
  else toast("Need a Repair Kit, or 2 scrap at a workbench.", "#ff9a7a");
  p.jam = false;
}

/* ---------- combat ---------- */
function makeNoise(x, y, rad) {
  for (const e of S.enemies) {
    if (e.dead) continue; const d = Math.hypot(e.x - x, e.y - y); if (d > rad) continue;
    if (e.state !== "chase") { e.state = d < rad * .5 ? "chase" : "inv"; e.tx = d < rad * .5 ? S.p.x : x; e.ty = d < rad * .5 ? S.p.y : y; e.lost = 0; }
  }
}
const visibleRadius = () => lerp(120, 380, S.light) * (1 + (st("per") - 5) * .04);
function nearestEnemy(maxD, needSight = true) {
  const p = S.p; let best = null, bd = maxD;
  for (const e of S.enemies) {
    if (e.dead || ET[e.type].passive) continue; const d = Math.hypot(e.x - p.x, e.y - p.y); if (d >= bd) continue;
    if (needSight && (d > visibleRadius() || !los(p.x, p.y, e.x, e.y))) continue; best = e; bd = d;
  }
  return best;
}
function killEnemy(e) {
  e.dead = true; const d = ET[e.type], p = S.p; p.kills++; if (e.id >= 0) S.dead.add(e.id); burst(e.x, e.y, 14, d.robot ? "#ffd060" : "#7a1a1a", 90);
  giveXp(d.xp); S.corpses.push({ x: e.x, y: e.y, sprite: d.sprite, scale: d.scale, name: d.n, lk: d.corpse, face: e.face, loot: null, looted: false, id: e.id }); if (S.corpses.length > 60) S.corpses.shift();
}
function hurtEnemy(e, dmg, kx, ky, crit) {
  if (e.dead) return; const d = ET[e.type]; dmg *= 1 - (d.armor || 0); e.hp -= dmg; e.flash = .1; e.kx += kx; e.ky += ky;
  pop(e.x, e.y - 18, (crit ? "CRIT " : "") + Math.round(dmg), crit ? "#ff9a4a" : "#ffe080"); burst(e.x, e.y - 4, 4, d.robot ? "#ffd060" : e.type === "roach" || e.type === "glower" ? "#9ac040" : "#a02828", 60);
  if (d.passive) e.fleeT = 6; else if (e.state !== "chase") { e.state = "chase"; e.tx = S.p.x; e.ty = S.p.y; e.lost = 0; }
  if (e.hp <= 0) killEnemy(e);
}
const dmgMult = (gun, inst) => (gun ? (1 + (hasPerk("gunslinger") ? .15 : 0) + (st("per") - 5) * .02) : (1 + (st("str") - 5) * .06) * (hasPerk("ironfist") ? 1.25 : 1)) * bfx("dmg") * condMult(inst);
const rollCrit = () => Math.random() < .03 + (st("lck") - 5) * .012 + .01;
function fireShots(angle, w, tgt, manual) {
  const p = S.p, inst = p.gun; let a0 = angle;
  if (tgt && !tgt.dead) a0 = Math.atan2(tgt.y - p.y, tgt.x - p.x);
  p.aim = a0; p.face = Math.cos(a0) < 0 ? -1 : 1; p.aimT = 1.2;
  const mx = p.x + Math.cos(a0) * 13, my = p.y - 5 + Math.sin(a0) * 9, col = w.col;
  S.tracers.push({ x: mx, y: my, a: a0, life: .05, fl: true, col });
  const spr = w.spread * (hasPerk("steady") ? .65 : 1) * (1 - (st("per") - 5) * .03) * (1 + (1 - condMult(inst)) * 1.5), dm = dmgMult(true, inst);
  for (let k = 0; k < w.pel; k++) {
    const a = a0 + (Math.random() - .5) * 2 * spr, wall = rayWall(p.x, p.y, a, w.range), c = Math.cos(a), s = Math.sin(a); let bt = null, bd = wall;
    for (const e of S.enemies) {
      if (e.dead) continue; const ex = e.x - p.x, ey = e.y - p.y, t = ex * c + ey * s; if (t < 0 || t > bd + 4) continue;
      const perp = Math.abs(-ex * s + ey * c); if (perp < ET[e.type].r * ET[e.type].scale * .9 + 2 && t < bd) { bt = e; bd = t; }
    }
    const ex = p.x + c * bd, ey = p.y + s * bd; S.tracers.push({ x: mx, y: my, x2: ex, y2: ey, life: .07, col });
    let bn = null; if (manual) for (const n of S.world.npcs) { const ex = n.x - p.x, ey = n.y - p.y, t = ex * c + ey * s; if (t < 0 || t > bd + 4) continue; if (Math.abs(-ex * s + ey * c) < 9 && t < bd) { bn = n; bd = t; bt = null; } }
    if (bn) { S.tracers.push({ x: mx, y: my, x2: p.x + c * bd, y2: p.y + s * bd, life: .07, col }); hurtNpc(bn, w.dmg * dm * (w.pel > 1 ? .5 : 1), c * 12, s * 12); continue; }
    if (bt) { let d = w.dmg * dm; if (w.pel > 1) d *= clamp(1 - (bd - 70) / 220, .3, 1); const cr = rollCrit(); if (cr) d *= 2; hurtEnemy(bt, d, c * 18, s * 18, cr); } else if (bd < w.range) burst(ex, ey, 3, "#c8c0a8", 40);
  }
  wear(inst, w.wear || .35);
  if (inst.cond < 25 && Math.random() < (25 - inst.cond) / 25 * .22) { p.jam = true; p.burst = null; toast("JAMMED! Press LOAD to clear it.", "#ff9a7a"); }
  makeNoise(p.x, p.y, w.noise); S.shake = Math.max(S.shake, w.pel > 1 ? 3 : 1.4);
}
function startReload() {
  const p = S.p; if (p.reload || !p.gun) return; const w = WP[p.gun.id];
  if (p.jam) { p.reload = { t: 0, dur: .8, clear: true }; p.burst = null; return; }
  if (p.gun.mag >= w.mag) return; if (p.ammo[w.ammo] <= 0) { toast("No " + AMMO_NAMES[w.ammo] + " ammo.", "#ff9a7a"); return; }
  p.reload = { t: 0, dur: w.reload * (hasPerk("quick") ? .7 : 1) * (1 - (st("agi") - 5) * .03), clear: false }; p.burst = null;
}
function attack(angle, tgt, manual) {
  const p = S.p; if (p.roll || S.scene !== "play" || p.search || S.sleep) return; const cw = curWeapon(), w = cw.w;
  if (cw.gun) {
    if (p.reload || p.cd > 0 || p.burst) return;
    if (p.jam) { toast("Jammed! Press LOAD.", "#ff9a7a"); return; }
    if (cw.inst.cond <= 0) { toast("Weapon broken. Repair it in the PIP menu.", "#ff9a7a"); return; }
    if (cw.inst.mag <= 0) { if (p.ammo[w.ammo] > 0) startReload(); else { toast("Out of ammo. Switch weapon.", "#ff9a7a"); } return; }
    p.burst = { left: Math.min(w.burst, cw.inst.mag), a: angle, t: 0, tgt, manual };
  } else {
    if (p.cd > 0 || p.swing > 0) return; p.cd = w.cd; p.swing = .2; p.swingMax = .2; p.aim = angle; p.face = Math.cos(angle) < 0 ? -1 : 1; p.aimT = 1;
    let hit = 0; const dm = dmgMult(false, cw.inst);
    for (const e of S.enemies) {
      if (e.dead) continue; const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy), rr = w.range + ET[e.type].r * ET[e.type].scale;
      if (d > rr) continue; let da = Math.atan2(dy, dx) - angle; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) <= w.arc / 2 + .15) { const cr = rollCrit(); hurtEnemy(e, w.dmg * dm * rnd(.9, 1.1) * (cr ? 2 : 1), dx / d * w.kb, dy / d * w.kb, cr); hit++; if (hit >= 3) break; }
    }
    if (manual) for (const n of S.world.npcs.slice()) { const dx = n.x - p.x, dy = n.y - p.y, d = Math.hypot(dx, dy); if (d > w.range + 8) continue; let da = Math.atan2(dy, dx) - angle; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) <= w.arc / 2 + .15) { hurtNpc(n, w.dmg * dm * rnd(.9, 1.1), dx / d * w.kb * .3, dy / d * w.kb * .3); hit++; } }
    if (hit) wear(cw.inst, .45 * hit); makeNoise(p.x, p.y, w.noise);
  }
}
function tapFire() {
  const p = S.p, cw = curWeapon();
  if (!cw.gun) { const t = nearestEnemy(110, false); attack(t ? Math.atan2(t.y - p.y, t.x - p.x) : (p.aim || 0), null); return; }
  const t = nearestEnemy(cw.w.range, true);
  if (!t) { if (S.time - S.hint > 1.5) { toast("No target in sight. Hold to aim by hand.", "#bbb"); S.hint = S.time; } return; }
  attack(Math.atan2(t.y - p.y, t.x - p.x), t);
}
function tryRoll() {
  const p = S.p; if (p.roll || p.rollCd > 0 || p.fract || S.scene !== "play" || S.sleep) return;
  let dx = ctrl.mx, dy = ctrl.my; if (!dx && !dy) { dx = p.face; dy = 0; } const l = Math.hypot(dx, dy); p.roll = { t: 0, dur: .36, dx: dx / l, dy: dy / l }; p.rollCd = .85 * (1 - (st("agi") - 5) * .04) * (hasPerk("fleet") ? .75 : 1); p.search = null; p.reload = null; p.burst = null;
}
function hurtPlayer(dmg, d) {
  const p = S.p; if (p.roll && p.roll.t < p.roll.dur - .08) return; if (S.sleep) S.sleep = null;
  dmg = drDamage(dmg); p.hp -= dmg; p.hurtT = .25; S.flash = .35; S.shake = 4; p.search = null; pop(p.x, p.y - 22, "-" + Math.round(dmg), "#ff6a5a"); burst(p.x, p.y - 4, 6, "#c03030", 70);
  if (d.bleed && !p.bleed && Math.random() < d.bleed) { p.bleed = true; toast("You are bleeding. Use a bandage.", "#ff7a7a"); }
  if (d.infect && !p.inf && Math.random() < d.infect) { p.inf = true; toast("The bite is infected. Find antibiotics.", "#d8d070"); }
  if (d.fract && !p.fract && Math.random() < d.fract) { p.fract = true; toast("Your leg is broken. Find a splint.", "#ff9a5a"); }
  if (d.sick && !p.sick && Math.random() < d.sick) { p.sick = 90; toast("Poisoned. You feel sick.", "#c8d870"); }
  if (d.rad) radGain(d.rad);
  p.cause = d.n; if (p.hp <= 0) die((d.ranged ? "Shot by a " : "Killed by a ") + d.n);
}
function die(why) {
  if (S.scene !== "play") return; S.scene = "dead"; S.deathWhy = why; S.menu = S.loot = S.levelup = S.sleep = S.talk = S.trade = null; try { localStorage.removeItem(SAVEKEY); } catch (e) { }
}
function spawnBullet(x, y, a, spd, dmg, col, src, friend) { S.bullets.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, dmg, col, src, friend, life: 1.6 }); }

/* ---------- enemies ---------- */
function updEnemy(e, dt) {
  const d = ET[e.type], p = S.p, dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy);
  if (e.flash > 0) e.flash -= dt; if (e.cd > 0) e.cd -= dt; if (e.lcd > 0) e.lcd -= dt;
  if (e.kx || e.ky) { moveBody(e, e.kx * dt * 8, e.ky * dt * 8, d.r * d.scale * .6); e.kx *= Math.max(0, 1 - dt * 9); e.ky *= Math.max(0, 1 - dt * 9); if (Math.abs(e.kx) + Math.abs(e.ky) < 1) e.kx = e.ky = 0; }
  if (d.passive) {
    e.fleeT = (e.fleeT || 0) - dt; let mx = 0, my = 0, sp = d.spd * .3; if (e.fleeT > 0) { mx = -dx / (dist || 1); my = -dy / (dist || 1); sp = d.spd * 1.7; } else { e.wt -= dt; if (e.wt <= 0) { e.wa = Math.random() < .5 ? rnd(6.28) : null; e.wt = rnd(1.5, 4); } if (e.wa !== null) { mx = Math.cos(e.wa); my = Math.sin(e.wa); } }
    if (mx || my) { if (moveBody(e, mx * sp * dt, my * sp * dt, d.r * d.scale * .7)) e.wa = null; if (mx) e.face = mx < 0 ? -1 : 1; e.walk += dt * sp * .22; } return;
  }
  if (d.aura && dist < 90) radGain(d.aura * dt * (1 - dist / 110));
  const sight = d.sight * S.sightMult * (p.moving ? 1 : .8) * (hasPerk("ghost") ? .75 : 1) * (S.sleep ? .6 : 1);
  if (dist < sight && los(e.x, e.y, p.x, p.y)) {
    if (e.state !== "chase" && d.pack) for (const o of S.enemies) if (o !== e && !o.dead && o.type === e.type && o.state !== "chase" && Math.hypot(o.x - e.x, o.y - e.y) < 220) { o.state = "chase"; o.lost = 0; }
    e.state = "chase"; e.lost = 0; e.tx = p.x; e.ty = p.y;
  } else if (e.state === "chase") { e.lost += dt; if (e.lost > 4) { e.state = "inv"; e.lost = 0; } }
  let mvx = 0, mvy = 0, sp = d.spd * (e.state === "chase" ? 1 : .45);
  const R = d.ranged, hold = R ? R.rng * .62 : 0;
  if (e.state === "chase" || e.state === "inv") {
    const tx = e.tx - e.x, ty = e.ty - e.y, td = Math.hypot(tx, ty);
    if (td < 8 && e.state === "inv") { e.state = "idle"; e.wt = rnd(1, 3); } else if (td > 1) { mvx = tx / td; mvy = ty / td; }
    if (R && e.state === "chase" && dist < hold && los(e.x, e.y, p.x, p.y)) { mvx = mvy = 0; }
    else if (R && e.state === "chase" && dist < hold * .5) { mvx = -mvx * .6; mvy = -mvy * .6; }
  } else {
    e.wt -= dt; if (e.wt <= 0) {
      if (e.wa === null || Math.random() < .5) { e.wa = rnd(6.28); e.wt = rnd(.8, 2); if (e.home && Math.hypot(e.x - e.home.x, e.y - e.home.y) > 140) e.wa = Math.atan2(e.home.y - e.y, e.home.x - e.x); } else { e.wa = null; e.wt = rnd(1.5, 4); }
    }
    if (e.wa !== null) { mvx = Math.cos(e.wa); mvy = Math.sin(e.wa); sp = d.spd * .3; }
  }
  if (e.lunge > 0) { e.lunge -= dt; sp = d.spd * 3.4; mvx = e.lx; mvy = e.ly; if (dist < d.reach && e.cd <= 0) { hurtPlayer(d.dmg * rnd(.9, 1.1), d); e.cd = 1.2; e.lunge = 0; } }
  else if (d.lunge && e.state === "chase" && dist < 170 && dist > 60 && e.lcd <= 0 && los(e.x, e.y, p.x, p.y)) { e.lunge = .3; e.lcd = 3.2; e.lx = dx / dist; e.ly = dy / dist; }
  if (e.wind > 0) {
    e.wind -= dt; mvx = mvy = 0;
    if (e.wind <= 0) { if (R) { const a = Math.atan2(p.y - e.y, p.x - e.x) + rnd(-.07, .07); spawnBullet(e.x, e.y - 6, a, R.spd, R.dmg * rnd(.85, 1.15), R.col, d, false); } else if (dist < d.reach + 8) hurtPlayer(d.dmg * rnd(.85, 1.15), d); }
  } else if (e.state === "chase") {
    if (R) { if (dist < R.rng && e.cd <= 0 && los(e.x, e.y, p.x, p.y)) { e.wind = .42; e.cd = R.rate * rnd(.9, 1.3); } }
    else if (dist < d.reach && e.cd <= 0) { e.wind = .32; e.cd = 1.05; }
  }
  if (mvx || mvy) {
    if (e.stuck > 0) { e.stuck -= dt; const sa = Math.atan2(mvy, mvx) + e.sidestep; mvx = Math.cos(sa); mvy = Math.sin(sa); }
    let b = false; if (d.fly) { e.x += (mvx * sp + Math.sin(S.time * 7 + e.walk) * 22) * dt; e.y += (mvy * sp + Math.cos(S.time * 6 + e.walk) * 22) * dt; } else b = moveBody(e, mvx * sp * dt, mvy * sp * dt, d.r * d.scale * .7);
    if (b && e.stuck <= 0) { e.stuck = rnd(.35, .7); e.sidestep = (Math.random() < .5 ? 1 : -1) * rnd(1, 1.9); if (e.state === "idle") e.wa = null; }
    if (mvx) e.face = mvx < 0 ? -1 : 1; e.walk += dt * sp * .22;
  }
}
function spawnTable(dens, rd) {
  const dm = 1 + Math.floor((S.t - START_MIN) / 1440) * .15, t = eTable(dens, rd).map(r => [r[0], (r[0] === "brute" || r[0] === "mauler" || r[0] === "razorclaw" || r[0] === "scorpion" ? r[1] * dm : r[1])]);
  return t.filter(r => r[0] !== "raider" && r[0] !== "rustbot");
}
function manageSpawns(dt) {
  S.spawnT -= dt; if (S.spawnT > 0) return; S.spawnT = lerp(4, 9, S.light);
  const p = S.p; let near = 0; for (const e of S.enemies) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 800) near++;
  if (near > 16 + (1 - S.light) * 6) return;
  for (let i = 0; i < 8; i++) {
    const a = rnd(6.28), r = rnd(430, 640), x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r;
    if (solidAt(x, y)) continue; const tx = Math.floor(x / TS), ty = Math.floor(y / TS); if (tx < 2 || ty < 2 || tx > MW - 3 || ty > MH - 3 || S.world.setts.some(c => Math.hypot(c.x + 7 - tx, c.y + 6 - ty) < 20)) continue;
    const k = ty * MW + tx, pr = wpick(Math.random, spawnTable(S.world.dmap[k], S.world.rad[k])); S.enemies.push(mkEnemy(pr[0], x, y)); break;
  }
}

/* ---------- interaction: containers, corpses, camp structures ---------- */
const structAt = (tx, ty) => S.structs.find(s => s.x === tx && s.y === ty);
function nearStruct(type, r) { const p = S.p; return S.structs.find(s => s.t === type && Math.hypot(s.x * TS + 16 - p.x, s.y * TS + 16 - p.y) < r); }
const STRUCT_LABEL = { campfire: "COOK", workbench: "CRAFT", stash: "STASH", bed: "SLEEP", turret: "LOAD" };
function findInteract() {
  const p = S.p, w = S.world; let best = null, bd = 40;
  for (const n of w.npcs) { if (n.hostile) continue; const d = Math.hypot(n.x - p.x, n.y - p.y); if (d < Math.min(bd, 40)) { bd = d; best = { k: "npc", n, label: "TALK" }; } }
  for (const s of S.structs) { const d = Math.hypot(s.x * TS + 16 - p.x, s.y * TS + 16 - p.y); if (d < Math.min(bd, 44)) { bd = d; best = { k: "struct", s, label: STRUCT_LABEL[s.t] }; } }
  for (const c of S.corpses) { if (c.looted) continue; const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < Math.min(bd, 30)) { bd = d; best = { k: "corpse", c, label: "LOOT" }; } }
  for (const c of w.containers) { if (c.looted) continue; const d = Math.hypot(c.x * TS + 16 - p.x, c.y * TS + 16 - p.y); if (d < bd) { bd = d; best = { k: "con", c, label: "SEARCH" }; } }
  for (const it of w.items) { if (it.taken) continue; const d = Math.hypot(it.x - p.x, it.y - p.y); if (d < Math.min(bd, 30)) { bd = d; best = { k: "item", it, label: "TAKE" }; } }
  if (!best) { const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS); for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) { const gx = tx + x, gy = ty + y; if (gx >= 0 && gy >= 0 && gx < MW && gy < MH && w.ground[gy * MW + gx] === GR.LAKE) return { k: "water", label: "DRINK" }; } }
  return best;
}
function tryInteract() {
  const p = S.p; if (S.scene !== "play" || p.roll || p.search || S.sleep) return; const t = findInteract(); if (!t) return;
  if (t.k === "con") p.search = { kind: "con", c: t.c, t: 0, dur: .7, x: p.x, y: p.y };
  else if (t.k === "corpse") p.search = { kind: "corpse", c: t.c, t: 0, dur: .6, x: p.x, y: p.y };
  else if (t.k === "item") { const it = t.it; const left = addItem(it.item, it.n, it.cond); if (left < it.n) { toast("Took " + itemName(it.item) + (it.n > 1 ? " x" + it.n : ""), "#bff0a0"); it.n = left; if (left <= 0) it.taken = true; } else toast("Bag full.", "#ff9a7a"); }
  else if (t.k === "water") { p.thirst = clamp(p.thirst + 28, 0, 100); p.cd = Math.max(p.cd, .3); toast("You drink from the lake.", "#9ac8ff"); if (!hasPerk("stomach") && Math.random() < .35) { p.sick = 90; toast("The water was foul. You feel sick.", "#c8d870"); } }
  else if (t.k === "struct") useStruct(t.s);
  else if (t.k === "npc") { S.talk = { npc: t.n, line: npcLine(t.n) }; S.scroll = 0; }
}
function lootBonus() { return st("lck") + (hasPerk("looter") ? 3 : 0); }
function openLoot(title, list, owner, mode) { S.loot = { title, list, owner, mode: mode || "take" }; S.scroll = 0; }
function openSearch(s) {
  if (s.kind === "con") {
    const c = s.c; if (!c.loot) { c.loot = rollLoot(mulberry(S.world.seed + c.id * 131 + 7), c.kind, lootBonus()); giveXp(2); }
    if (!c.loot.length) { c.looted = true; toast("Nothing useful here.", "#bbb"); return; } openLoot(CON_NAME[c.type], c.loot, c);
  } else {
    const c = s.c; if (!c.loot) { c.loot = rollLoot(Math.random, c.lk, lootBonus()); }
    if (!c.loot.length) { c.looted = true; toast("Nothing on the body.", "#bbb"); return; } openLoot("Remains: " + c.name, c.loot, c);
  }
}
function takeFrom(i) {
  const L = S.loot; if (!L) return; const it = L.list[i]; if (!it) return;
  const left = addItem(it.id, it.n, it.cond);
  if (left < it.n) { toast("Took " + itemName(it.id) + (it.n - left > 1 ? " x" + (it.n - left) : ""), "#bff0a0"); it.n = left; if (left <= 0) L.list.splice(i, 1); } else toast("Bag full.", "#ff9a7a");
  afterLoot();
}
function takeAll() { const L = S.loot; if (!L) return; for (let i = L.list.length - 1; i >= 0; i--) { const it = L.list[i], left = addItem(it.id, it.n, it.cond); if (left <= 0) L.list.splice(i, 1); else { it.n = left; } } if (L.list.length) toast("Bag full.", "#ff9a7a"); afterLoot(); }
function afterLoot() { const L = S.loot; if (L && L.mode === "take" && !L.list.length) { L.owner.looted = true; S.loot = null; } }
function stashPut(idx) {
  const L = S.loot; if (!L || L.mode !== "stash") return; const s = S.p.inv[idx]; if (!s) return;
  const ex = L.list.find(x => x.id === s.id && !s.cond && x.n < 99); if (ex) ex.n += s.n; else if (L.list.length < 30) L.list.push({ id: s.id, n: s.n, cond: s.cond }); else { toast("Stash full.", "#ff9a7a"); return; }
  S.p.inv.splice(idx, 1);
}
function stashTake(i) { const L = S.loot; if (!L) return; const it = L.list[i]; if (!it) return; const left = addItem(it.id, it.n, it.cond); if (left < it.n) { it.n = left; if (left <= 0) L.list.splice(i, 1); } else toast("Bag full.", "#ff9a7a"); }
function useStruct(s) {
  const p = S.p;
  if (s.t === "workbench") { S.menu = { tab: 5 }; S.scroll = 0; }
  else if (s.t === "stash") { s.list = s.list || []; openLoot("Stash Chest", s.list, s, "stash"); }
  else if (s.t === "bed") startSleep();
  else if (s.t === "campfire") {
    let n = 0; for (const sl of p.inv) { if (sl.id === "meat_raw") { sl.id = "meat"; n += sl.n; } else if (sl.id === "dirty") { sl.id = "water"; n += sl.n; } }
    p.inv.forEach(a => p.inv.forEach(b => { if (a !== b && a.id === b.id && !a.cond && !b.cond && a.n + b.n <= stackOf(a.id) && b.n > 0) { a.n += b.n; b.n = 0; } })); p.inv = p.inv.filter(sl => sl.n > 0);
    toast(n ? "Cooked and boiled " + n + " item" + (n > 1 ? "s" : "") + "." : "Nothing to cook. Raw meat and dirty water only.", n ? "#bff0a0" : "#bbb"); if (n) giveXp(2);
  } else if (s.t === "turret") { const take = Math.min(40 - (s.ammo || 0), p.ammo.a9); if (take > 0) { p.ammo.a9 -= take; s.ammo = (s.ammo || 0) + take; toast("Turret loaded: " + s.ammo + " rounds.", "#bff0a0"); } else toast(s.ammo >= 40 ? "Turret is full." : "No 9mm ammo to load.", "#ff9a7a"); }
}
function startSleep() {
  const p = S.p; if (S.enemies.some(e => !e.dead && e.state === "chase" && Math.hypot(e.x - p.x, e.y - p.y) < 500)) { toast("Too dangerous to sleep. Something is hunting you.", "#ff9a7a"); return; }
  if (p.hunger < 20 || p.thirst < 20) { toast("Too hungry or thirsty to sleep.", "#ff9a7a"); return; }
  S.sleep = { left: 360 }; toast("You sleep. Tap to wake.", "#9ab0ff");
}
function placeStruct(type) {
  const p = S.p, b = BUILDS[type]; if (!hasMats(b.cost)) { toast("Missing materials.", "#ff9a7a"); return false; }
  const a = p.aim || 0, fx = Math.floor((p.x + Math.cos(a) * 34) / TS), fy = Math.floor((p.y + Math.sin(a) * 34) / TS), ptx = Math.floor(p.x / TS), pty = Math.floor(p.y / TS);
  const cand = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  for (const [ox, oy] of cand) {
    const tx = fx + ox, ty = fy + oy, i = ty * MW + tx; if (tx < 1 || ty < 1 || tx >= MW - 1 || ty >= MH - 1 || (tx === ptx && ty === pty)) continue;
    const g = S.world.ground[i], dc = S.world.deco[i]; if (S.world.solid[i] || g === GR.LAKE || g === GR.WALL || structAt(tx, ty) || (dc && !NODECO_SOLID.has(dc))) continue;
    takeMats(b.cost); S.structs.push({ t: type, x: tx, y: ty, ammo: 0, list: type === "stash" ? [] : undefined }); if (type !== "campfire") S.world.solid[i] = 1; toast("Built " + b.n + ".", "#bff0a0"); giveXp(5); return true;
  }
  toast("No room here. Face open ground.", "#ff9a7a"); return false;
}
function craft(r) {
  if (!nearStruct("workbench", 70)) { toast("Stand next to a workbench.", "#ff9a7a"); return; } if (!hasMats(r.cost)) { toast("Missing materials.", "#ff9a7a"); return; }
  const o = r.out, it = ITEMS[o.id]; if (!AMMO_ITEMS[o.id] && S.p.inv.length >= invCap() && !(stackOf(o.id) > 6 && S.p.inv.some(s => s.id === o.id && s.n < stackOf(o.id)))) { toast("Bag full.", "#ff9a7a"); return; }
  takeMats(r.cost); const left = addItem(o.id, o.n, it && (it.t === "gun" || it.t === "melee") ? 90 : undefined); if (left) dropGround(o.id, left); toast("Crafted " + r.n + ".", "#bff0a0"); giveXp(4);
}

/* ---------- npcs: guards, settlers, merchants, barter ---------- */
const NPC_ATK = { guard: { n: "hostile Guard", ranged: 1, bleed: .1, dmg: 9 }, merchant: { n: "hostile Merchant", ranged: 1, dmg: 8 } };
function hurtNpc(n, dmg, kx, ky) {
  n.hp -= dmg; n.hostile = true; n.flash = .1; pop(n.x, n.y - 24, Math.round(dmg), "#ffe080"); burst(n.x, n.y - 6, 4, "#a02828", 60); moveBody(n, kx * .3, ky * .3, 6);
  for (const g of S.world.npcs) if (g.kind === "guard" && !g.hostile && ((n.sett >= 0 && g.sett === n.sett) || Math.hypot(g.x - n.x, g.y - n.y) < 500)) { g.hostile = true; toast("The guards are after you!", "#ff7a7a"); }
  if (n.hp <= 0) killNpc(n);
}
function killNpc(n) {
  const w = S.world; w.npcs = w.npcs.filter(o => o !== n); S.deadNpc.add(n.id); let loot = [];
  if (n.kind === "merchant") { if (!n.stock) n.stock = genStock(mulberry(w.seed + n.id * 977 + 3), n.shop); loot = n.stock.slice(); loot.push({ id: "caps", n: 20 + Math.floor(Math.random() * 40) }); }
  else if (n.kind === "guard") { loot = rollLoot(Math.random, "c_raider", lootBonus()); loot.push({ id: "caps", n: 15 + Math.floor(Math.random() * 30) }); if (Math.random() < .35) loot.push({ id: "combat_armor", n: 1 }); }
  else { loot = rollLoot(Math.random, "house", lootBonus()); loot.push({ id: "caps", n: 5 + Math.floor(Math.random() * 20) }); }
  S.corpses.push({ x: n.x, y: n.y, sprite: "npc_" + n.kind + n.spr, scale: 1, name: n.name, face: n.face || 1, loot, looted: false, npc: 1 }); burst(n.x, n.y, 12, "#7a1a1a", 90);
  if (S.trade && S.trade.npc === n) S.trade = null; if (S.talk && S.talk.npc === n) S.talk = null; toast(n.name + " is dead.", "#ff9a7a");
}
function updNpc(n, dt) {
  n.cd -= dt; if (n.flash > 0) n.flash -= dt; const p = S.p, dist = Math.hypot(p.x - n.x, p.y - n.y) || 1;
  if (n.hostile && n.kind !== "settler") {
    const A = NPC_ATK[n.kind], seen = dist < 300 && los(n.x, n.y, p.x, p.y);
    if (seen) { n.face = p.x < n.x ? -1 : 1; if (dist > 130) moveBody(n, (p.x - n.x) / dist * 40 * dt, (p.y - n.y) / dist * 40 * dt, 6); if (n.cd <= 0) { spawnBullet(n.x, n.y - 6, Math.atan2(p.y - n.y, p.x - n.x) + rnd(-.08, .08), 250, A.dmg * rnd(.85, 1.15), "#ffe9a0", A, false); n.cd = n.kind === "guard" ? 1.2 : 1.6; } }
    else if (dist < 700) { moveBody(n, (p.x - n.x) / dist * 40 * dt, (p.y - n.y) / dist * 40 * dt, 6); }
    return;
  }
  if (n.hostile && n.kind === "settler") { if (dist < 250) { moveBody(n, (n.x - p.x) / dist * 48 * dt, (n.y - p.y) / dist * 48 * dt, 6); n.face = n.x < p.x ? -1 : 1; n.walk = (n.walk || 0) + dt * 6; } return; }
  if (n.kind === "guard") {
    if (n.cd <= 0) { let best = null, bd = 240; for (const e of S.enemies) { if (e.dead) continue; const d = Math.hypot(e.x - n.x, e.y - n.y); if (d < bd && los(n.x, n.y, e.x, e.y)) { bd = d; best = e; } } if (best) { const a = Math.atan2(best.y - n.y, best.x - n.x); spawnBullet(n.x, n.y - 6, a, 380, 13, "#ffe9a0", null, true); n.cd = .7; n.face = Math.cos(a) < 0 ? -1 : 1; } }
  } else if (n.roam) {
    if ((S.talk && S.talk.npc === n) || (S.trade && S.trade.npc === n)) return;
    n.wt -= dt; if (!n.wp || n.wt <= 0) { if (n.wp) { n.wp = null; n.wt = rnd(2, 6); } else { n.wp = { x: n.x + rnd(-380, 380), y: n.y + rnd(-380, 380) }; n.wt = 14; } }
    if (n.wp) { const dx = n.wp.x - n.x, dy = n.wp.y - n.y, d = Math.hypot(dx, dy) || 1; if (d < 12) { n.wp = null; n.wt = rnd(3, 7); } else { const b = moveBody(n, dx / d * 22 * dt, dy / d * 22 * dt, 6); n.face = dx < 0 ? -1 : 1; n.walk = (n.walk || 0) + dt * 3.5; if (b) { n.wp = null; n.wt = rnd(.3, 1.5); } } }
  } else if (n.kind === "settler") {
    n.wt -= dt; if (n.wt <= 0) { n.wa = Math.random() < .55 ? rnd(6.28) : null; if (Math.hypot(n.x - n.home.x, n.y - n.home.y) > 55) n.wa = Math.atan2(n.home.y - n.y, n.home.x - n.x); n.wt = rnd(1, 3); }
    if (n.wa !== null && n.wa !== undefined) { moveBody(n, Math.cos(n.wa) * 14 * dt, Math.sin(n.wa) * 14 * dt, 6); n.face = Math.cos(n.wa) < 0 ? -1 : 1; n.walk = (n.walk || 0) + dt * 3; }
  }
}
const dirName = (fx, fy, tx, ty) => { const a = Math.atan2(ty - fy, tx - fx), n = ["east", "southeast", "south", "southwest", "west", "northwest", "north", "northeast"]; return n[(Math.round(a / (Math.PI / 4)) + 8) % 8]; };
function npcLine(n) {
  const w = S.world, near = (arr, f) => { let b = null, bd = 1e9; for (const o of arr) { const p = f(o), d = Math.hypot(p[0] - n.x, p[1] - n.y); if (d < bd) { bd = d; b = p; } } return b ? { p: b, t: Math.round(bd / TS) } : null; };
  const tips = [], camp = near(w.camps, c => [c.x * TS, c.y * TS]), zone = near(w.zones, z => [z.x * TS, z.y * TS]), vault = near(w.buildings.filter(b => b.kind === "vault"), b => [(b.x + 5) * TS, (b.y + 4) * TS]), bunk = near(w.buildings.filter(b => b.kind === "bunker"), b => [(b.x + 4) * TS, (b.y + 3) * TS]);
  if (camp) tips.push("Raiders camp to the " + dirName(n.x, n.y, camp.p[0], camp.p[1]) + ", about " + camp.t + " tiles out. Avoid it.");
  if (zone) tips.push("The ground glows to the " + dirName(n.x, n.y, zone.p[0], zone.p[1]) + ". Rad pills or a hazmat suit, or stay away.");
  if (vault) tips.push("There is a sealed vault to the " + dirName(n.x, n.y, vault.p[0], vault.p[1]) + ". Good loot, worse things inside.");
  if (bunk) tips.push("Old military bunker to the " + dirName(n.x, n.y, bunk.p[0], bunk.p[1]) + ". Robots still guard it.");
  const talk = ["Boil your water. Dirty water will wreck you.", "Sleep somewhere safe. Cots keep the night away.", "Do not shoot in the dark. Everything hears it.", "Rolling dodges bullets. Remember that.", "Guns jam when they get old. Keep a repair kit.", "Chems are fun until the craving starts.", "Cook the meat. Always cook the meat."];
  if (n.kind === "merchant") return pick(["Caps talk. What do you need?", "Take a look. Fair prices.", "Got what you need, if you got the caps.", "Browse all you like."]);
  if (n.kind === "guard") return pick(["Keep moving and stay out of trouble.", "We hold the gate. Nothing gets in.", ...tips.slice(0, 2)]);
  return pick(talk.concat(tips, tips));
}
const barterMul = () => 1.3 - (st("int") - 5) * .03, sellMul = () => .4 + (st("int") - 5) * .02;
const condF = it => it.cond !== undefined ? .5 + .5 * it.cond / 100 : 1;
function openTrade(n) { if (!n.stock) n.stock = genStock(mulberry(S.world.seed + n.id * 977 + 3), n.shop); S.talk = null; S.trade = { npc: n, mode: "buy" }; S.scroll = 0; }
function buyPriceOf(it) { const q = AMMO_ITEMS[it.id] ? Math.min(it.n, 6) : 1; return { q, price: Math.max(1, Math.round((VAL[it.id] || 5) * q * condF(it) * barterMul())) }; }
function buyStock(i) {
  const p = S.p, n = S.trade.npc, it = n.stock[i]; if (!it) return; const { q, price } = buyPriceOf(it);
  if (p.caps < price) { toast("Not enough caps.", "#ff9a7a"); return; }
  const left = addItem(it.id, q, it.cond); if (left >= q) { toast("Bag full.", "#ff9a7a"); return; }
  p.caps -= price; it.n -= q; if (it.n <= 0) n.stock.splice(i, 1); toast("Bought " + itemName(it.id) + " for " + price, "#bff0a0");
}
function sellInv(i) { const p = S.p, s = p.inv[i]; if (!s) return; const price = Math.max(1, Math.floor((VAL[s.id] || 2) * condF(s) * sellMul())); p.caps += price; toast("Sold " + itemName(s.id) + " for " + price, "#bff0a0"); consume(i); }
function sellAmmo(id) { const p = S.p, k = AMMO_ITEMS[id].k, q = Math.min(10, p.ammo[k]); if (q <= 0) return; const price = Math.max(1, Math.floor((VAL[id] || 1) * q * sellMul())); p.ammo[k] -= q; p.caps += price; toast("Sold " + q + " " + AMMO_NAMES[k] + " for " + price, "#bff0a0"); }

/* ---------- quick use ---------- */
function bestIndex(kind) {
  const p = S.p; let best = -1, sc = -1e9;
  p.inv.forEach((s, i) => {
    const it = ITEMS[s.id]; let v = null;
    if (kind === "eat" && it.t === "food") v = (it.sick ? -50 : 0) - Math.abs((it.hunger || 0) - (100 - p.hunger));
    else if (kind === "drink" && it.t === "drink") v = (it.sick ? -50 : 0) - Math.abs((it.thirst || 0) - (100 - p.thirst));
    else if (kind === "med") {
      if (p.bleed && it.cure && it.cure.includes("bleed")) v = 100 + (it.hp || 0) * .1; else if (p.fract && it.cure && it.cure.includes("fract")) v = 90; else if ((p.inf || p.sick > 0) && it.cure && (it.cure.includes("inf") || it.cure.includes("sick"))) v = 80;
      else if (p.rad > 40 && it.rad) v = 70; else if (p.hp < maxHp() - 12 && it.hp) v = 50 - it.hp * .2;
    }
    if (v !== null && v > sc) { sc = v; best = i; }
  });
  return best;
}
function quickUse(kind) { const i = bestIndex(kind); if (i < 0) { toast(kind === "med" ? "Nothing to treat you right now." : "Nothing to " + kind + ".", "#bbb"); return; } useItem(i); }

/* ---------- input ---------- */
const ctrl = { mx: 0, my: 0 }, keys = {}, ptrs = new Map(); let stickP = null, fireP = null, uiHits = [];
const modalOpen = () => !!(S.menu || S.loot || S.levelup || S.talk || S.trade);
function toLog(e) { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * VW / r.width, (e.clientY - r.top) * VH / r.height]; }
const inBtn = (b, x, y) => Math.hypot(x - b.x, y - b.y) <= b.r + 6;
function runHit(x, y) {
  for (let i = uiHits.length - 1; i >= 0; i--) { const h = uiHits[i]; if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h && (!h.clip || (y >= h.clip[0] && y <= h.clip[1]))) { h.fn(); return true; } }
  return false;
}
function doButton(name) {
  if (name === "roll") tryRoll(); else if (name === "reload") startReload(); else if (name === "act") tryInteract(); else if (name === "swap") swapWeapon(); else if (name === "menu") { S.menu = { tab: 0 }; S.scroll = 0; }
}
canvas.addEventListener("pointerdown", e => {
  e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch (x) { }
  const [x, y] = toLog(e), pr = { id: e.pointerId, x, y, sx: x, sy: y, py: y, t: performance.now(), mouse: e.pointerType === "mouse", role: null, drag: false }; ptrs.set(e.pointerId, pr);
  if (S.scene === "play" && S.sleep) { S.sleep = null; toast("You wake up.", "#b8ffd0"); pr.role = "none"; return; }
  if (S.scene !== "play" || modalOpen()) { pr.role = "ui"; return; }
  for (const k in BTN) if (inBtn(BTN[k], x, y)) { pr.role = "btn"; doButton(k); return; }
  for (const q of QB) if (x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h) { pr.role = "btn"; quickUse(q.k); return; }
  if (!pr.mouse && x < VW * .45 && !stickP) { pr.role = "stick"; stickP = pr; } else if (!fireP) { pr.role = "fire"; fireP = pr; }
}, { passive: false });
canvas.addEventListener("pointermove", e => {
  const pr = ptrs.get(e.pointerId); if (!pr) return; const [x, y] = toLog(e); pr.x = x; pr.y = y;
  if (pr.role === "ui") { if (Math.abs(y - pr.sy) > 8) pr.drag = true; if (pr.drag) { S.scroll = clamp(S.scroll - (y - pr.py), 0, S.scrollMax); } pr.py = y; }
}, { passive: false });
function endPtr(e) {
  const pr = ptrs.get(e.pointerId); if (!pr) return; ptrs.delete(e.pointerId);
  if (pr === stickP) stickP = null;
  if (pr.role === "ui" && !pr.drag && e.type === "pointerup") runHit(pr.sx, pr.sy);
  if (pr === fireP) {
    fireP = null; if (S.scene !== "play" || modalOpen()) { S.aim = null; return; }
    const held = performance.now() - pr.t >= HOLD_MS;
    if (held && S.aim) attack(S.aim.a, null, true); else tapFire(); S.aim = null;
  }
}
canvas.addEventListener("pointerup", endPtr); canvas.addEventListener("pointercancel", endPtr);
canvas.addEventListener("wheel", e => { if (modalOpen()) { S.scroll = clamp(S.scroll + e.deltaY * .5, 0, S.scrollMax); e.preventDefault(); } }, { passive: false });
canvas.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
addEventListener("keydown", e => {
  keys[e.code] = true; if (S.scene !== "play") return;
  if (e.code === "KeyI" || e.code === "Tab") { S.menu = S.menu ? null : { tab: 0 }; S.scroll = 0; e.preventDefault(); return; }
  if (e.code === "Escape") { S.menu = S.loot = S.levelup = S.talk = S.trade = null; return; }
  if (modalOpen()) return;
  if (e.code === "Space") { tryRoll(); e.preventDefault(); } else if (e.code === "KeyR") startReload(); else if (e.code === "KeyE") tryInteract(); else if (e.code === "KeyQ") swapWeapon();
  else if (e.code === "Digit1") quickUse("eat"); else if (e.code === "Digit2") quickUse("drink"); else if (e.code === "Digit3") quickUse("med");
});
addEventListener("keyup", e => { keys[e.code] = false; });
function readInput() {
  let mx = 0, my = 0;
  if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1; if (keys.KeyW || keys.ArrowUp) my -= 1; if (keys.KeyS || keys.ArrowDown) my += 1;
  if (stickP) { const dx = stickP.x - stickP.sx, dy = stickP.y - stickP.sy, l = Math.hypot(dx, dy); if (l > 4) { const k = Math.min(1, l / 34); mx = dx / l * k; my = dy / l * k; } }
  const l = Math.hypot(mx, my); if (l > 1) { mx /= l; my /= l; } ctrl.mx = mx; ctrl.my = my;
  /* hold to aim: the fire line appears after a short hold, a drag steers it, release fires */
  S.aim = null;
  if (fireP && performance.now() - fireP.t >= HOLD_MS && !modalOpen()) {
    const p = S.p; let a;
    if (fireP.mouse) { const sx = p.x - S.cam.x, sy = p.y - S.cam.y; a = Math.atan2(fireP.y - sy, fireP.x - sx); }
    else {
      const dx = fireP.x - fireP.sx, dy = fireP.y - fireP.sy;
      if (Math.hypot(dx, dy) > 8) a = Math.atan2(dy, dx); else { const t = nearestEnemy(curWeapon().w.range || 120, curWeapon().gun); a = t ? Math.atan2(t.y - p.y, t.x - p.x) : (p.aim || 0); }
    }
    S.aim = { a };
  }
}

/* ---------- update ---------- */
function update(dt) {
  const p = S.p; S.time += dt;
  S.t += dt * 1440 / DAYSEC; if (S.sleep) { S.sleep.left -= dt * 1440 / DAYSEC; if (S.sleep.left <= 0) { S.sleep = null; toast("You wake up rested.", "#b8ffd0"); } }
  const h = hourOf(S.t); S.light = lightAt(h); S.sightMult = lerp(.45, 1, S.light);
  readInput(); if (S.sleep) { ctrl.mx = ctrl.my = 0; }
  if (p.cd > 0) p.cd -= dt; if (p.rollCd > 0) p.rollCd -= dt; if (p.hurtT > 0) p.hurtT -= dt; if (p.aimT > 0) p.aimT -= dt; if (p.swing > 0) p.swing -= dt; if (S.flash > 0) S.flash -= dt; S.shake = Math.max(0, S.shake - dt * 14);
  /* chems and addiction */
  for (const id in p.buffs) { p.buffs[id] -= dt; if (p.buffs[id] <= 0) { delete p.buffs[id]; toast(ITEMS[id].n + " wears off.", "#bbb"); } }
  for (const id in p.addict) if (!p.buffs[id]) { p.addict[id] -= dt; if (p.addict[id] <= 0) { delete p.addict[id]; toast("You shook off the " + ITEMS[id].n + " craving.", "#bff0a0"); } }
  /* survival meters */
  const sick = p.sick > 0; if (sick) p.sick -= dt;
  const dr = (hasPerk("hardy") ? .75 : 1) * (sick ? 2.2 : 1) * (S.sleep ? .6 : 1);
  p.hunger = Math.max(0, p.hunger - dt * 100 / (1.7 * DAYSEC) * dr); p.thirst = Math.max(0, p.thirst - dt * 100 / (1.15 * DAYSEC) * dr);
  const rz = S.world.rad[Math.floor(p.y / TS) * MW + Math.floor(p.x / TS)]; S.inRad = rz > .22 ? rz : 0; if (S.inRad) radGain(dt * S.inRad * 1.1);
  let drain = 0; if (p.hunger <= 0) drain += .55; if (p.thirst <= 0) drain += .8; if (p.bleed) drain += .9; if (p.inf) drain += .22; if (p.rad > 80) drain += .3;
  if (withdrawing()) drain += .08;
  if (drain > 0) { p.hp -= drain * dt; if (p.hp <= 0) die(p.bleed ? "Bled out" : p.thirst <= 0 ? "Died of thirst" : p.hunger <= 0 ? "Starved to death" : p.inf ? "Died of infection" : "Radiation sickness"); }
  else if (p.hunger > 50 && p.thirst > 50 && !p.sick) p.hp = Math.min(maxHp(), p.hp + dt * (S.sleep ? 1.1 : .35));
  p.hp = Math.min(p.hp, maxHp());
  /* movement */
  let spd = 78 * (1 + (st("agi") - 5) * .025) * (hasPerk("fleet") ? 1.1 : 1) * bfx("spd") * (p.fract ? .55 : 1) * (p.search ? 0 : 1); let vx = 0, vy = 0;
  if (p.roll) { p.roll.t += dt; vx = p.roll.dx * 190; vy = p.roll.dy * 190; if (p.roll.t >= p.roll.dur) p.roll = null; }
  else { vx = ctrl.mx * spd; vy = ctrl.my * spd; }
  p.moving = Math.abs(vx) + Math.abs(vy) > 1;
  if (p.moving) { moveBody(p, vx * dt, vy * dt, 7); if (!p.aimT || p.aimT <= 0) { if (Math.abs(vx) > 1) p.face = vx < 0 ? -1 : 1; p.aim = Math.atan2(vy, vx); } }
  if (p.search) { if (Math.hypot(p.x - p.search.x, p.y - p.search.y) > 4 || p.roll) p.search = null; else { p.search.t += dt; if (p.search.t >= p.search.dur) { const s = p.search; p.search = null; openSearch(s); } } }
  /* weapons */
  if (p.reload) { p.reload.t += dt; if (p.reload.t >= p.reload.dur && p.gun) { if (p.reload.clear) { p.jam = false; toast("Jam cleared.", "#bff0a0"); } else { const w = WP[p.gun.id], take = Math.min(w.mag - p.gun.mag, p.ammo[w.ammo]); p.gun.mag += take; p.ammo[w.ammo] -= take; } p.reload = null; } }
  if (p.burst) {
    const b = p.burst; b.t -= dt;
    if (b.t <= 0 && p.gun) { const w = WP[p.gun.id]; fireShots(b.a, w, b.tgt, b.manual); p.gun.mag--; b.left--; b.t = w.rate; if (!p.burst) { } else if (b.left <= 0 || p.gun.mag <= 0) { p.burst = null; p.cd = w.burstCd || w.rate; if (p.gun.mag <= 0 && p.ammo[w.ammo] > 0) startReload(); } }
  }
  /* bullets: enemy shots can be rolled through; turret shots hurt enemies */
  for (let i = S.bullets.length - 1; i >= 0; i--) {
    const b = S.bullets[i]; b.life -= dt; b.x += b.vx * dt; b.y += b.vy * dt; let gone = b.life <= 0 || solidAt(b.x, b.y);
    if (!gone && !b.friend && Math.hypot(b.x - p.x, b.y - p.y + 4) < 8 && !(p.roll && p.roll.t < p.roll.dur - .08)) { hurtPlayer(b.dmg, b.src); gone = true; }
    if (!gone && b.friend) for (const e of S.enemies) if (!e.dead && Math.hypot(b.x - e.x, b.y - e.y) < ET[e.type].r * ET[e.type].scale + 3) { hurtEnemy(e, b.dmg, b.vx * .05, b.vy * .05); gone = true; break; }
    if (gone) S.bullets.splice(i, 1);
  }
  for (const s of S.structs) if (s.t === "turret" && s.ammo > 0) {
    s.cd = (s.cd || 0) - dt; if (s.cd > 0) continue; const tx = s.x * TS + 16, ty = s.y * TS + 12; let best = null, bd = 230;
    for (const e of S.enemies) { if (e.dead) continue; const d = Math.hypot(e.x - tx, e.y - ty); if (d < bd && los(tx, ty, e.x, e.y)) { bd = d; best = e; } }
    if (best) { const a = Math.atan2(best.y - ty, best.x - tx); spawnBullet(tx, ty, a, 420, 15, "#ffe9a0", null, true); s.ammo--; s.cd = .33; s.a = a; makeNoise(tx, ty, 320); }
  }
  for (const k of ["tracers", "parts", "pops"]) { const a = S[k]; for (let i = a.length - 1; i >= 0; i--) { const o = a[i]; o.life !== undefined ? o.life -= dt : o.t -= dt; if (o.vx !== undefined) { o.x += o.vx * dt; o.y += o.vy * dt; o.vx *= .92; o.vy *= .92; } if (o.txt) o.y -= 14 * dt; if ((o.life !== undefined ? o.life : o.t) <= 0) a.splice(i, 1); } }
  for (let i = S.toasts.length - 1; i >= 0; i--) { S.toasts[i].t -= dt; if (S.toasts[i].t <= 0) S.toasts.splice(i, 1); }
  /* enemies: only the ones near you think */
  for (const e of S.enemies) { if (e.dead) continue; const dd = Math.abs(e.x - p.x) + Math.abs(e.y - p.y); if (dd < 900) updEnemy(e, dt); }
  for (const n of S.world.npcs) if (Math.abs(n.x - p.x) + Math.abs(n.y - p.y) < 900) updNpc(n, dt);
  const act = S.enemies.filter(e => !e.dead && Math.abs(e.x - p.x) + Math.abs(e.y - p.y) < 500);
  for (let i = 0; i < act.length; i++) for (let j = i + 1; j < act.length; j++) { const a = act[i], b = act[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, m = 13; if (d < m) { const k = (m - d) / 2 / d; moveBody(a, -dx * k, -dy * k, 5); moveBody(b, dx * k, dy * k, 5); } }
  S.enemies = S.enemies.filter(e => !e.dead); manageSpawns(dt);
  if (S.sleep && S.enemies.some(e => e.state === "chase" && Math.hypot(e.x - p.x, e.y - p.y) < 260)) { S.sleep = null; toast("Something woke you up!", "#ff9a7a"); }
  revealFog(); S.saveT += dt; if (S.saveT > 8) { S.saveT = 0; save(); }
}
