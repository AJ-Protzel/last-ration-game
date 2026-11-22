"use strict";
/* Last Ration: world drawing, HUD, Pip-Boy menu, loot window, character creation. */
const AMB = "#3cff8a", AMBD = "#1f9a56", PAN = "rgba(3,18,10,.94)", GRN = "#9dffc4", RED = "#ff7a6a", TXT = "#bfffd6", DIM = "#3f9c68";
const TABS = ["STAT", "EQUIP", "INV", "S.P.E.C", "MAP", "CRAFT"];

/* ---------- small drawing helpers ---------- */
function txt(s, x, y, col = TXT, size = 10, align = "left") { ctx.font = "bold " + size + "px 'Courier New', monospace"; ctx.textAlign = align; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "rgba(0,0,0,.75)"; ctx.fillText(s, x + 1, y + 1); ctx.fillStyle = col; ctx.fillText(s, x, y); }
function reg(x, y, w, h, fn) { uiHits.push({ x, y, w, h, fn, clip: S.clip }); }
function frameBox(x, y, w, h, fill = PAN, line = AMBD) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1); }
function abtn(x, y, w, h, label, fn, o = {}) {
  const on = !o.off; frameBox(x, y, w, h, o.col || (on ? "#0f3a22" : "#06160c"), on ? AMB : "#1a5a38");
  txt(label, x + w / 2, y + h / 2 + 3, on ? (o.tc || AMB) : "#2a7a50", o.size || 8, "center"); if (on && fn) reg(x, y, w, h, fn);
}
function bar(x, y, w, h, v, col, lowFlash) {
  ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(x - 1, y - 1, w + 2, h + 2); const low = v < .2; ctx.fillStyle = low && lowFlash && Math.sin(S.time * 8) > 0 ? "#ff8a6a" : col; ctx.fillRect(x, y, Math.round(w * clamp(v, 0, 1)), h);
  ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.fillRect(x, y, Math.round(w * clamp(v, 0, 1)), 1);
}
const dimCache = {};
function dimSprite(id) {
  if (dimCache[id]) return dimCache[id]; const src = getSprite(id), cv = document.createElement("canvas"); cv.width = cv.height = 32; const g = cv.getContext("2d"); g.drawImage(src, 0, 0); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(10,6,0,.55)"; g.fillRect(0, 0, 32, 32); return dimCache[id] = cv;
}
const flashCache = {};
function flashSprite(id) {
  if (flashCache[id]) return flashCache[id]; const src = getSprite(id), cv = document.createElement("canvas"); cv.width = cv.height = 32; const g = cv.getContext("2d"); g.drawImage(src, 0, 0); g.globalCompositeOperation = "source-in"; g.fillStyle = "#fff"; g.fillRect(0, 0, 32, 32); return flashCache[id] = cv;
}
const icon = (id, x, y, sz = 24, dim = false) => { ctx.drawImage(dim ? dimSprite("i_" + id) : getSprite("i_" + id), x, y, sz, sz); };
const condCol = c => c > 60 ? "#7ee07e" : c > 30 ? "#e8c040" : "#e8604a";
function circBtn(b, enabled = true, sub = "", pulse = false) {
  ctx.fillStyle = enabled ? "rgba(3,20,10,.74)" : "rgba(3,20,10,.38)"; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.3); ctx.fill();
  ctx.strokeStyle = enabled ? (pulse ? "rgba(190,255,215," + (.7 + Math.sin(S.time * 6) * .3) + ")" : "rgba(60,255,138,.85)") : "rgba(60,255,138,.25)"; ctx.lineWidth = pulse ? 2 : 1.5; ctx.stroke();
  if (b.label) txt(b.label, b.x, b.y + (sub ? 0 : 3), enabled ? AMB : "#2a7a50", b.label.length > 4 ? 7 : b.r > 20 ? 9 : 8, "center"); if (sub) txt(sub, b.x, b.y + 9, "#b8ffd0", 6, "center");
}

/* ---------- world ---------- */
function tileImg(gid, tx, ty) {
  const v = Math.abs(_hash(tx, ty, 5) * 4) | 0;
  switch (gid) { case 0: return tileCanvas("grass", v % 4); case 1: return tileCanvas("dirt", v % 3); case 2: return tileCanvas("road", 0); case 3: return tileCanvas("road", 1); case 4: return tileCanvas("road", 2); case 5: return tileCanvas("side", 0); case 6: return tileCanvas("wood", 0); case 7: return tileCanvas("tilef", 0); case 8: return tileCanvas("wall", 0); case 10: return tileCanvas("radg", v % 3); case 11: return tileCanvas("metal", 0); default: return tileCanvas("lake", (Math.floor(S.time * 1.4) + tx + ty) % 2); }
}
function drawCorpse(c, cx, cy) {
  const s = 32 * c.scale; ctx.save(); ctx.translate(c.x - cx, c.y - cy); ctx.rotate(c.face > 0 ? 1.45 : -1.45); ctx.globalAlpha = c.looted ? .5 : .88; ctx.drawImage(c.looted ? dimSprite(c.sprite) : getSprite(c.sprite), -s / 2, -s * .6, s, s); ctx.restore();
}
function drawWorld() {
  const p = S.p, w = S.world; let cx = Math.round(p.x - VW / 2), cy = Math.round(p.y - VH * .47);
  if (S.shake > 0) { cx += Math.round(rnd(-S.shake, S.shake)); cy += Math.round(rnd(-S.shake, S.shake)); } S.cam.x = cx; S.cam.y = cy;
  ctx.fillStyle = "#14160c"; ctx.fillRect(0, 0, VW, VH);
  const x0 = Math.floor(cx / TS), y0 = Math.floor(cy / TS), x1 = Math.floor((cx + VW) / TS), y1 = Math.floor((cy + VH) / TS), list = [], lights = [];
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue; const i = ty * MW + tx;
    ctx.drawImage(tileImg(w.ground[i], tx, ty), tx * TS - cx, ty * TS - cy);
    const d = w.deco[i];
    if (d) {
      const tree = d <= 3, con = w.conMap.get(i), flat = d === 7 || d === 8 || d === 22 || d === 21;
      if (d === 21) lights.push({ x: tx * TS + 16 - cx, y: ty * TS + 18 - cy, r: 110 });
      const id = DECO_SPRITE[d]; list.push({ y: flat ? ty * TS + 8 : ty * TS + TS, img: con && con.looted ? dimSprite(id) : getSprite(id), x: tx * TS - (tree ? 4 : 0) - cx, yy: ty * TS - (tree ? 12 : 0) - cy, s: tree ? 40 : 32 });
    }
  }
  for (const s of S.structs) { if (s.x < x0 - 1 || s.x > x1 + 1 || s.y < y0 - 1 || s.y > y1 + 1) continue; if (s.t === "campfire") lights.push({ x: s.x * TS + 16 - cx, y: s.y * TS + 18 - cy, r: 120 }); list.push({ y: s.y * TS + TS, img: getSprite("s_" + s.t), x: s.x * TS - cx, yy: s.y * TS - cy, s: 32, turret: s.t === "turret" ? s : null }); }
  for (const n of w.npcs) { if (n.x < cx - 40 || n.x > cx + VW + 40 || n.y < cy - 50 || n.y > cy + VH + 40) continue; list.push({ y: n.y + 6, img: n.flash > 0 ? flashSprite("npc_" + n.kind + n.spr) : getSprite("npc_" + n.kind + n.spr), x: n.x - 16 - cx, yy: n.y + 6 - 29 - cy + Math.sin(n.walk || 0) * 1.1, s: 32, flip: n.face < 0, npc: n }); }
  for (const c of S.corpses) { if (c.x < cx - 40 || c.x > cx + VW + 40 || c.y < cy - 40 || c.y > cy + VH + 40) continue; list.push({ y: c.y - 2, corpse: c }); }
  for (const it of w.items) { if (it.taken || it.x < cx - 20 || it.x > cx + VW + 20 || it.y < cy - 20 || it.y > cy + VH + 20) continue; list.push({ y: it.y, img: getSprite("i_" + it.item), x: it.x - 10 - cx, yy: it.y - 14 - cy, s: 20, glint: true }); }
  for (const e of S.enemies) {
    if (e.dead || e.x < cx - 50 || e.x > cx + VW + 50 || e.y < cy - 50 || e.y > cy + VH + 50) continue; const d = ET[e.type], s = 32 * d.scale;
    if (d.glow) lights.push({ x: e.x - cx, y: e.y - cy, r: d.glow });
    list.push({ y: e.y + 6, img: e.flash > 0 ? flashSprite(d.sprite) : getSprite(d.sprite), x: e.x - s / 2 - cx, yy: e.y + 6 - s * .92 - cy + Math.sin(e.walk) * 1.2 - (d.fly ? 10 + Math.sin(S.time * 9 + e.walk) * 2 : 0), s, flip: e.face < 0, e, glow: d.glow });
  }
  const bob = p.moving && !p.roll ? Math.sin(S.time * 14) * 1.2 : 0;
  list.push({ y: p.y + 6, player: true, x: p.x - 16 - cx, yy: p.y + 6 - 29 - cy + bob });
  list.sort((a, b) => a.y - b.y);
  for (const o of list) {
    if (o.player) { drawPlayer(o.x, o.yy); continue; }
    if (o.corpse) { drawCorpse(o.corpse, cx, cy); if (!o.corpse.looted) { const k = (Math.sin(S.time * 4 + o.corpse.x) + 1) / 2; ctx.fillStyle = "rgba(255,230,160," + (.3 + k * .5) + ")"; ctx.fillRect(Math.round(o.corpse.x - cx - 1), Math.round(o.corpse.y - cy - 8 - k * 2), 2, 2); } continue; }
    if (o.glow) { ctx.fillStyle = "rgba(160,255,80,.12)"; ctx.beginPath(); ctx.arc(o.x + o.s / 2, o.yy + o.s * .6, o.s * .8, 0, 6.3); ctx.fill(); }
    ctx.save();
    if (o.flip) { ctx.translate(o.x + o.s, o.yy); ctx.scale(-1, 1); ctx.drawImage(o.img, 0, 0, o.s, o.s); } else ctx.drawImage(o.img, o.x, o.yy, o.s, o.s);
    ctx.restore();
    if (o.npc && o.npc.hp < o.npc.maxhp) { ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(Math.round(o.npc.x - 10 - cx), Math.round(o.yy - 2), 20, 3); ctx.fillStyle = "#d84a3a"; ctx.fillRect(Math.round(o.npc.x - 10 - cx), Math.round(o.yy - 2), 20 * o.npc.hp / o.npc.maxhp, 3); }
    if (o.npc && o.npc.hostile) txt("!", o.npc.x - cx, o.yy - 4, "#ff5040", 9, "center");
    else if (o.npc && Math.hypot(o.npc.x - p.x, o.npc.y - p.y) < 110) { txt(o.npc.name, o.npc.x - cx, o.yy - 3, o.npc.kind === "guard" ? "#8ad0ff" : o.npc.kind === "merchant" ? "#dfff80" : TXT, 7, "center"); if (o.npc.kind === "merchant") txt("$", o.npc.x - cx, o.yy - 11, "#dfff80", 8, "center"); }
    if (o.glint) { const k = (Math.sin(S.time * 4 + o.x) + 1) / 2; ctx.fillStyle = "rgba(220,255,235," + (.3 + k * .6) + ")"; ctx.fillRect(Math.round(o.x + 8), Math.round(o.yy - 3 - k * 2), 2, 2); }
    if (o.turret) { ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(o.x + 4, o.yy - 3, 24, 3); ctx.fillStyle = "#b8ffd0"; ctx.fillRect(o.x + 4, o.yy - 3, 24 * clamp((o.turret.ammo || 0) / 40, 0, 1), 3); }
    if (o.e && o.e.hp < ET[o.e.type].hp) { const m = ET[o.e.type].hp, bw = 20 * ET[o.e.type].scale; ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(Math.round(o.e.x - bw / 2 - cx), Math.round(o.yy - 4), bw, 3); ctx.fillStyle = "#d84a3a"; ctx.fillRect(Math.round(o.e.x - bw / 2 - cx), Math.round(o.yy - 4), bw * o.e.hp / m, 3); }
    if (o.e && o.e.wind > 0 && ET[o.e.type].ranged) { ctx.fillStyle = "#ff5040"; ctx.fillRect(Math.round(o.e.x - cx - 1), Math.round(o.yy - 9), 2, 4); }
  }
  /* aim line */
  const cw = curWeapon(), px = p.x - cx, py = p.y - 4 - cy;
  const near = nearestEnemy(cw.gun ? cw.w.range : 110, cw.gun);
  if (near && !S.aim) { const ex = near.x - cx, ey = near.y - cy - 4, r = 11 * ET[near.type].scale; ctx.strokeStyle = "rgba(255,90,70,.6)"; ctx.lineWidth = 1; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(ex + a * r, ey + b * r * .6 - b * 4); ctx.lineTo(ex + a * (r - 4), ey + b * r * .6 - b * 4); ctx.moveTo(ex + a * r, ey + b * r * .6 - b * 4); ctx.lineTo(ex + a * r, ey + b * (r * .6 - 4) - b * 4); ctx.stroke(); }); }
  if (S.aim) {
    const a = S.aim.a;
    if (cw.gun) { const len = rayWall(p.x, p.y, a, cw.w.range); ctx.setLineDash([5, 3]); ctx.strokeStyle = "rgba(255,70,50,.9)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(px + Math.cos(a) * len, py + Math.sin(a) * len, 3, 0, 6.3); ctx.stroke(); }
    else { ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, cw.w.range + 8, a - cw.w.arc / 2, a + cw.w.arc / 2); ctx.closePath(); ctx.fill(); }
  }
  for (const t of S.tracers) { if (t.fl) { ctx.fillStyle = t.col || "#fff2b0"; ctx.beginPath(); ctx.arc(t.x - cx + Math.cos(t.a) * 3, t.y - cy + Math.sin(t.a) * 3, 4, 0, 6.3); ctx.fill(); } else { ctx.strokeStyle = t.col || "rgba(255,240,170,.9)"; ctx.lineWidth = t.col ? 1.6 : 1; ctx.beginPath(); ctx.moveTo(t.x - cx, t.y - cy); ctx.lineTo(t.x2 - cx, t.y2 - cy); ctx.stroke(); } }
  for (const b of S.bullets) { ctx.strokeStyle = b.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x - cx, b.y - cy); ctx.lineTo(b.x - b.vx * .03 - cx, b.y - b.vy * .03 - cy); ctx.stroke(); }
  for (const q of S.parts) { ctx.fillStyle = q.col; ctx.fillRect(Math.round(q.x - cx), Math.round(q.y - cy), q.sz, q.sz); }
  for (const o of S.pops) txt(o.txt, o.x - cx, o.y - cy, o.col, 9, "center");
  /* dust haze, radiation glow, then day and night with light holes for fires and glowing ones */
  ctx.fillStyle = "rgba(200,140,60,.07)"; ctx.fillRect(0, 0, VW, VH);
  if (S.inRad) { ctx.fillStyle = "rgba(130,255,60," + (.05 + S.inRad * .08 + Math.sin(S.time * 3) * .02) + ")"; ctx.fillRect(0, 0, VW, VH); }
  const a = .86 * (1 - S.light);
  if (a > .01) {
    const gx = p.x - cx, gy = p.y - cy - 4, R = visibleRadius(); dctx.globalCompositeOperation = "source-over"; dctx.clearRect(0, 0, VW, VH); const dusk = S.light > 0 && S.light < 1;
    dctx.fillStyle = dusk ? "rgba(40,18,36," + a + ")" : "rgba(5,8,24," + a + ")"; dctx.fillRect(0, 0, VW, VH); dctx.globalCompositeOperation = "destination-out";
    const hole = (x, y, r, k) => { const g = dctx.createRadialGradient(x, y, r * .2, x, y, r); g.addColorStop(0, "rgba(0,0,0," + k + ")"); g.addColorStop(1, "rgba(0,0,0,0)"); dctx.fillStyle = g; dctx.fillRect(x - r, y - r, r * 2, r * 2); };
    hole(gx, gy, R, 1); for (const l of lights) hole(l.x, l.y, l.r, .9); ctx.drawImage(dark, 0, 0);
  }
  ctx.drawImage(vig, 0, 0);
  if (S.flash > 0) { ctx.fillStyle = "rgba(200,20,20," + Math.min(.45, S.flash) + ")"; ctx.fillRect(0, 0, VW, VH); }
  if (S.p.hp < maxHp() * .3) { ctx.fillStyle = "rgba(120,0,0," + (.15 + Math.sin(S.time * 5) * .06) + ")"; ctx.fillRect(0, 0, VW, VH); }
  if (S.sleep) { ctx.fillStyle = "rgba(4,6,24,.8)"; ctx.fillRect(0, 0, VW, VH); txt("Zzz...", VW / 2, VH * .42, "#9ab0ff", 20, "center"); txt(fmtClock(S.t), VW / 2, VH * .42 + 20, "#9ab0ff", 12, "center"); txt("Tap to wake up", VW / 2, VH * .42 + 38, DIM, 8, "center"); }
}
function drawPlayer(x, y) {
  const p = S.p, cw = curWeapon(), img = p.hurtT > 0 ? flashSprite("player") : getSprite("player");
  ctx.save();
  if (p.roll) { const k = p.roll.t / p.roll.dur; ctx.translate(x + 16, y + 20); ctx.rotate(k * 6.28 * Math.sign(p.roll.dx || 1)); ctx.scale(1, .8); ctx.drawImage(img, -16, -20); ctx.restore(); return; }
  const wi = getSprite("i_" + cw.id), a = p.aim || 0, handX = x + 16 + Math.cos(a) * 6, handY = y + 18 + Math.sin(a) * 4;
  const behind = Math.sin(a) < -.3;
  const drawW = () => {
    ctx.save(); ctx.translate(handX, handY);
    if (cw.gun) { ctx.rotate(a); if (Math.cos(a) < 0) ctx.scale(1, -1); ctx.drawImage(wi, -8, -12, 26, 26); if (p.reload) { ctx.restore(); return; } }
    else { const sw = p.swing > 0 ? 1 - p.swing / p.swingMax : -1; const ar = cw.w.arc; const rot = sw >= 0 ? a - ar / 2 + sw * ar : a + (p.face > 0 ? .9 : -.9); ctx.rotate(rot + 2.35 - 1.57); ctx.drawImage(wi, -4, -22, 26, 26); }
    ctx.restore();
  };
  if (behind) drawW();
  if (p.face < 0) { ctx.translate(x + 32, y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0); } else ctx.drawImage(img, x, y);
  ctx.restore();
  if (!behind) drawW();
  if (p.search) { const k = p.search.t / p.search.dur; ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(x + 4, y - 6, 24, 4); ctx.fillStyle = AMB; ctx.fillRect(x + 4, y - 6, 24 * k, 4); }
  if (p.reload) { const k = p.reload.t / p.reload.dur; ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(x + 4, y - 6, 24, 4); ctx.fillStyle = "#8ac8ff"; ctx.fillRect(x + 4, y - 6, 24 * k, 4); }
}

/* ---------- HUD ---------- */
function drawHUD() {
  const p = S.p, mh = maxHp(), x = 6; let y = safeTop;
  frameBox(x - 2, y - 3, 114, 41 + (S.inRad || p.rad > 3 ? 11 : 0), "rgba(2,14,8,.7)", AMBD);
  bar(x + 14, y, 94, 10, p.hp / mh, "#3cff8a", true); txt("HP", x, y + 8, "#7dffb0", 8); txt(Math.ceil(p.hp) + "/" + mh, x + 61, y + 8, "#fff", 8, "center"); y += 14;
  txt("LV" + p.lvl, x, y + 6, AMB, 8); bar(x + 26, y + 2, 82, 4, p.xp / xpNeed(p.lvl), "#9dffc4"); y += 11;
  icon("apple", x - 3, y - 4, 16); bar(x + 14, y, 36, 7, p.hunger / 100, "#b8e040", true); icon("water", x + 52, y - 4, 16); bar(x + 70, y, 38, 7, p.thirst / 100, "#40d8e8", true); y += 11;
  if (S.inRad || p.rad > 3) { txt("RAD", x, y + 6, "#c8f040", 7); bar(x + 26, y, 82, 6, p.rad / 100, "#b8e040"); if (S.inRad && Math.sin(S.time * 14) > .2) txt("!", x + 110, y + 7, "#c8f040", 9); y += 11; }
  y += 6;
  const chips = []; if (p.bleed) chips.push(["BLEED", "#d84a3a"]); if (p.fract) chips.push(["BROKEN", "#e8962e"]); if (p.inf) chips.push(["INFECT", "#b8b830"]); if (p.sick > 0) chips.push(["SICK", "#8ab048"]); if (withdrawing()) chips.push(["WITHDRAW", "#d080ff"]); for (const id in p.buffs) chips.push([ITEMS[id].n.toUpperCase(), "#8ad0ff"]);
  chips.forEach(([t, c], i) => { const cx = x + (i % 2) * 56, cy = y + Math.floor(i / 2) * 12; ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(cx, cy, 54, 10); txt(t, cx + 27, cy + 8, c, 7, "center"); });
  const day = Math.floor((S.t - START_MIN) / 1440) + 1, night = S.light < .35;
  txt("DAY " + day, VW - 44, safeTop + 9, TXT, 10, "right"); txt(fmtClock(S.t), VW - 44, safeTop + 21, night ? "#9ab0ff" : "#b8ffd0", 8, "right"); txt(night ? "NIGHT" : S.light < 1 ? "DUSK" : "DAY", VW - 44, safeTop + 31, night ? "#9ab0ff" : "#b8ffd0", 7, "right");
  icon("caps", VW - 66, safeTop + 33, 12); txt(String(p.caps), VW - 44, safeTop + 42, "#dfff80", 8, "right");
  circBtn(BTN.menu, true, "", p.points > 0 || p.picks > 0);
  if (p.points > 0 || p.picks > 0) txt("!", BTN.menu.x + 10, BTN.menu.y - 8, "#dfff80", 11, "center");
  S.toasts.forEach((t, i) => txt(t.msg, VW / 2, safeTop + 82 + i * 11, t.col, 8, "center"));
  /* quick use buttons */
  const kinds = [["eat", "apple"], ["drink", "water"], ["med", "bandage"]];
  QB.forEach((q, i) => {
    const bi = bestIndex(q.k), s = bi >= 0 ? p.inv[bi] : null; frameBox(q.x, q.y, q.w, q.h, s ? "rgba(6,34,18,.82)" : "rgba(3,18,10,.55)", s ? AMB : "#1a5a38");
    icon(s ? s.id : kinds[i][1], q.x + 4, q.y + 2, 28, !s); txt(q.k.toUpperCase(), q.x + q.w / 2, q.y + q.h - 2, s ? AMB : "#2a7a50", 6, "center"); if (s) txt("x" + countItem(s.id), q.x + q.w - 2, q.y + 9, "#fff", 7, "right");
  });
  /* weapon panel */
  const cw = curWeapon(), b = VH - safeBot, wy = b - 56; frameBox(6, wy, 118, 52, "rgba(2,14,8,.74)", AMBD); icon(cw.id, 8, wy + 4, 30);
  txt(ITEMS[cw.id] ? ITEMS[cw.id].n : "Fists", 40, wy + 13, TXT, 8);
  if (cw.gun) { txt(cw.inst.mag + "/" + cw.w.mag, 40, wy + 27, p.jam ? RED : AMB, 11); txt("[" + p.ammo[cw.w.ammo] + "] " + AMMO_NAMES[cw.w.ammo], 68, wy + 27, DIM, 7); } else txt(p.active === "melee" ? "MELEE" : "", 40, wy + 27, AMB, 8);
  if (cw.inst.cond !== undefined && cw.id !== "fists") { bar(40, wy + 36, 76, 5, cw.inst.cond / 100, condCol(cw.inst.cond)); txt(p.jam ? "JAMMED" : cw.inst.cond <= 0 ? "BROKEN" : Math.round(cw.inst.cond) + "%", 40, wy + 48, cw.inst.cond < 25 ? RED : DIM, 6); }
  /* action buttons */
  const it = findInteract(), cg = p.gun; circBtn(BTN.roll, p.rollCd <= 0 && !p.fract);
  circBtn(BTN.reload, !!(cg && (p.jam || cg.mag < WP[cg.id].mag)), p.jam ? "CLEAR" : "");
  const other = p.active === "gun" ? (p.melee ? p.melee.id : "fists") : (p.gun ? p.gun.id : null);
  circBtn(Object.assign({}, BTN.swap, { label: "" }), !!cg); if (other) icon(other, BTN.swap.x - 12, BTN.swap.y - 14, 24, !cg); txt("SWAP", BTN.swap.x, BTN.swap.y + 14, cg ? AMB : "#2a7a50", 6, "center");
  BTN.act.label = it ? it.label : "ACT"; circBtn(BTN.act, !!it, "", !!it);
  if (stickP) { ctx.strokeStyle = "rgba(120,255,180,.45)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(stickP.sx, stickP.sy, 30, 0, 6.3); ctx.stroke(); const dx = stickP.x - stickP.sx, dy = stickP.y - stickP.sy, l = Math.min(30, Math.hypot(dx, dy)), an = Math.atan2(dy, dx); ctx.fillStyle = "rgba(120,255,180,.5)"; ctx.beginPath(); ctx.arc(stickP.sx + Math.cos(an) * l, stickP.sy + Math.sin(an) * l, 12, 0, 6.3); ctx.fill(); }
  if (S.time < 16) { const c = "rgba(190,255,215," + clamp(1.4 - S.time / 11, 0, 1) + ")", hy = VH * .62; txt("Left side: drag to move", VW / 2, hy, c, 8, "center"); txt("Right side: tap = auto aim shot", VW / 2, hy + 12, c, 8, "center"); txt("hold = aim line, release = fire", VW / 2, hy + 24, c, 8, "center"); txt("PIP button: stats, bag, map, crafting", VW / 2, hy + 36, c, 8, "center"); }
}

/* ---------- Pip-Boy menu ---------- */
const sec = (s, y) => { ctx.fillStyle = AMBD; ctx.fillRect(8, y + 8, VW - 16, 1); txt(s, 10, y + 6, AMB, 8); ctx.fillStyle = PAN; ctx.fillRect(10 + s.length * 5 + 6, y, 3, 1); return y + 14; };
function meter(label, val, v, col, y) { txt(label, 10, y + 8, DIM, 8); bar(76, y, VW - 96 - 40, 9, v, col, true); txt(val, VW - 14, y + 8, TXT, 8, "right"); return y + 15; }
function itemInfo(id) {
  const it = ITEMS[id], o = []; if (!it) return AMMO_ITEMS[id] ? "Ammunition" : ""; if (it.hunger) o.push("Food +" + it.hunger); if (it.thirst) o.push("Water " + (it.thirst > 0 ? "+" : "") + it.thirst); if (it.hp) o.push("Heals " + it.hp); if (it.rad) o.push("Rad " + it.rad);
  if (it.t === "gun") { const w = WP[id]; o.push("Dmg " + w.dmg + (w.pel > 1 ? "x" + w.pel : "") + (w.burst > 1 ? " burst" : ""), AMMO_NAMES[w.ammo]); } if (it.t === "melee") o.push("Dmg " + WP[id].dmg);
  if (it.t === "armor") o.push("Blocks " + Math.round(it.dr * 100) + "% dmg" + (it.rr ? ", " + Math.round(it.rr * 100) + "% rad" : "")); return o.join("  ");
}
function drawMenu() {
  const p = S.p, m = S.menu; uiHits = []; S.clip = null; ctx.fillStyle = "rgba(2,10,6,.96)"; ctx.fillRect(0, 0, VW, VH);
  for (let sy = 0; sy < VH; sy += 3) { ctx.fillStyle = "rgba(60,255,138,.03)"; ctx.fillRect(0, sy, VW, 1); }
  ctx.fillStyle = "rgba(60,255,138,.05)"; ctx.fillRect(0, (S.time * 70) % VH, VW, 8); ctx.strokeStyle = "#0d3a22"; ctx.lineWidth = 4; ctx.strokeRect(2, 2, VW - 4, VH - 4); ctx.strokeStyle = AMBD; ctx.lineWidth = 1; ctx.strokeRect(4.5, 4.5, VW - 9, VH - 9);
  let y = safeTop; txt(p.name.toUpperCase(), 8, y + 10, AMB, 11); txt("LV " + p.lvl + "   HP " + Math.ceil(p.hp) + "/" + maxHp() + "   Kills " + p.kills, 8, y + 22, TXT, 8);
  abtn(VW - 56, y - 2, 48, 22, "CLOSE", () => { S.menu = null; S.scroll = 0; }); y += 30;
  const tw = (VW - 8) / TABS.length; TABS.forEach((t, i) => { const tx = 4 + i * tw, on = m.tab === i; frameBox(tx, y, tw - 2, 20, on ? "#0f4a2a" : "#06160c", on ? AMB : "#1a5a38"); txt(t, tx + tw / 2 - 1, y + 13, on ? AMB : DIM, 7, "center"); reg(tx, y, tw - 2, 20, () => { m.tab = i; m.sel = -1; S.scroll = 0; }); });
  if ((p.points > 0 || p.picks > 0)) txt("!", 4 + 3 * tw + tw - 6, y + 8, "#dfff80", 10, "center");
  y += 26; const top = y, bottom = VH - safeBot - 2;
  ctx.save(); ctx.beginPath(); ctx.rect(0, top, VW, bottom - top); ctx.clip(); S.clip = [top, bottom];
  const y0 = top - S.scroll; let end = y0;
  if (m.tab === 0) end = tabNeeds(y0); else if (m.tab === 1) end = tabGear(y0); else if (m.tab === 2) end = tabPack(y0, m); else if (m.tab === 3) end = tabPerks(y0); else if (m.tab === 4) end = tabMap(y0); else end = tabMake(y0);
  ctx.restore(); S.scrollMax = Math.max(0, end - y0 - (bottom - top) + 10); S.clip = null; S.scroll = clamp(S.scroll, 0, S.scrollMax);
  if (S.scrollMax > 0) { const th = Math.max(20, (bottom - top) * (bottom - top) / (end - y0)); ctx.fillStyle = AMBD; ctx.fillRect(VW - 3, top + (bottom - top - th) * (S.scroll / S.scrollMax), 2, th); }
}
function tabNeeds(y) {
  const p = S.p, mh = maxHp();
  y = sec("VITALS", y); y = meter("HEALTH", Math.ceil(p.hp) + "/" + mh, p.hp / mh, "#3cff8a", y); y = meter("HUNGER", Math.round(p.hunger) + "%", p.hunger / 100, "#b8e040", y); y = meter("THIRST", Math.round(p.thirst) + "%", p.thirst / 100, "#40d8e8", y);
  y = meter("RADIATION", Math.floor(p.rad) + "/100", p.rad / 100, "#b8e040", y); if (p.rad > 0) { txt("Radiation lowers max health by " + Math.floor(p.rad * .3) + ". Rad Pills flush it.", 10, y + 6, DIM, 7); y += 12; }
  y += 4; y = sec("CONDITIONS", y);
  const c = []; if (p.bleed) c.push(["Bleeding", "Losing health. Bandage or Medkit.", RED]); if (p.fract) c.push(["Broken leg", "Slow, no rolling. Splint or Medkit.", "#e8962e"]); if (p.inf) c.push(["Infection", "Slow drain. Antibiotics.", "#c8c830"]);
  if (p.sick > 0) c.push(["Sick", Math.ceil(p.sick) + "s. Hunger and thirst drain fast.", "#9ac048"]); if (p.rad > 80) c.push(["Radiation sickness", "Draining health. Rad Pills.", "#c8f040"]); if (p.hunger <= 0) c.push(["Starving", "Eat something now.", RED]); if (p.thirst <= 0) c.push(["Dehydrated", "Drink something now.", RED]);
  if (withdrawing()) c.push(["Withdrawal", "-2 AGI, -1 STR, -1 PER. Use the chem again or Addictol.", "#d080ff"]);
  if (!c.length) { txt("You feel fine.", 10, y + 8, GRN, 9); y += 16; } else for (const [n, d, col] of c) { txt(n, 10, y + 8, col, 9); txt(d, 10, y + 19, DIM, 7); y += 26; }
  abtn(10, y + 2, 100, 20, "TREAT NOW", () => quickUse("med"), { off: bestIndex("med") < 0 }); y += 30;
  y = sec("CHEMS", y); const ids = Object.keys(p.buffs), ad = Object.keys(p.addict);
  if (!ids.length && !ad.length) { txt("None active.", 10, y + 8, DIM, 8); y += 16; }
  for (const id of ids) { txt(ITEMS[id].n, 10, y + 8, "#8ad0ff", 9); txt(Math.ceil(p.buffs[id]) + "s  " + ITEMS[id].d, 90, y + 8, DIM, 7); y += 14; }
  for (const id of ad) { txt("Addicted: " + ITEMS[id].n, 10, y + 8, "#d080ff", 8); txt(p.buffs[id] ? "(medicated)" : "craving, " + Math.ceil(p.addict[id]) + "s left", 130, y + 8, DIM, 7); y += 14; }
  y += 4; y = sec("PROTECTION", y); let dr = 0, rr = 0; for (const s of ["body", "head"]) if (p[s]) { dr += ITEMS[p[s]].dr; rr += ITEMS[p[s]].rr; }
  txt("Damage blocked " + Math.round(Math.min(.7, dr) * 100) + "%   Radiation blocked " + Math.round(Math.min(.9, rr) * 100) + "%", 10, y + 8, TXT, 8); y += 18;
  y = sec("WORLD", y); const day = Math.floor((S.t - START_MIN) / 1440) + 1; txt("Day " + day + "   " + fmtClock(S.t) + (S.inRad ? "   IRRADIATED ZONE" : ""), 10, y + 8, S.inRad ? "#c8f040" : TXT, 8); y += 16; txt("Bag " + p.inv.length + "/" + invCap() + "   Camps built " + S.structs.length, 10, y + 8, DIM, 8);
  return y + 20;
}
function gearRow(y, label, inst, id, slot) {
  const p = S.p; frameBox(6, y, VW - 12, 62, "#06180d", id ? AMBD : "#145a34"); txt(label, 10, y + 10, DIM, 7);
  if (!id) { txt("empty", 50, y + 36, "#2a7a50", 9); return y + 68; }
  const it = ITEMS[id]; icon(id, 10, y + 16, 40); txt(it.n, 56, y + 24, TXT, 9);
  if (WP[id] && WP[id].gun) txt("Mag " + inst.mag + "/" + WP[id].mag + "   Reserve " + p.ammo[WP[id].ammo] + " " + AMMO_NAMES[WP[id].ammo], 56, y + 36, AMB, 7); else txt(itemInfo(id), 56, y + 36, AMB, 7);
  if (inst && inst.cond !== undefined) { bar(56, y + 41, 70, 5, inst.cond / 100, condCol(inst.cond)); txt(Math.round(inst.cond) + "%", 130, y + 47, DIM, 7); }
  const bx = VW - 70; if (inst && inst.cond !== undefined) abtn(bx, y + 16, 58, 18, "REPAIR", () => repairSlot(slot), { off: inst.cond >= 100 }); abtn(bx, y + 38, 58, 18, "UNEQUIP", () => unequip(slot), { off: slot === "melee" && id === "fists" });
  return y + 68;
}
function tabGear(y) {
  const p = S.p; y = sec("EQUIPPED", y);
  y = gearRow(y, "GUN" + (p.active === "gun" ? "  (in hand)" : ""), p.gun, p.gun && p.gun.id, "gun"); y = gearRow(y, "MELEE" + (p.active === "melee" ? "  (in hand)" : ""), p.melee, p.melee && p.melee.id !== "fists" ? p.melee.id : null, "melee");
  y = gearRow(y, "BODY ARMOR", null, p.body, "body"); y = gearRow(y, "HEAD", null, p.head, "head");
  y = sec("AMMO", y); let x = 10; for (const id in AMMO_ITEMS) { icon(id, x, y, 22); txt(String(p.ammo[AMMO_ITEMS[id].k]), x + 11, y + 32, TXT, 8, "center"); x += 52; } y += 40;
  txt("Repair: a Repair Kit anywhere, or 2 scrap at a workbench.", 10, y + 6, DIM, 7); y += 12; txt("Guns below 25% jam. At 0% they will not fire.", 10, y + 6, DIM, 7);
  return y + 20;
}
function tabPack(y, m) {
  const p = S.p, cap = invCap(), cols = 5, cs = Math.floor((VW - 20) / cols), gx = Math.floor((VW - cs * cols) / 2);
  y = sec("BAG " + p.inv.length + "/" + cap + "     CAPS " + p.caps, y);
  for (let i = 0; i < cap; i++) {
    const cx = gx + (i % cols) * cs, cy = y + Math.floor(i / cols) * cs, s = p.inv[i], on = m.sel === i;
    frameBox(cx + 1, cy + 1, cs - 2, cs - 2, on ? "#0f4a2a" : "#04120a", on ? AMB : "#145a34");
    if (s) { icon(s.id, cx + 6, cy + 5, cs - 12); if (s.n > 1) txt("x" + s.n, cx + cs - 4, cy + cs - 5, "#fff", 8, "right"); if (s.cond !== undefined) bar(cx + 5, cy + cs - 7, cs - 12, 3, s.cond / 100, condCol(s.cond)); reg(cx, cy, cs, cs, () => { m.sel = i; }); }
  }
  y += Math.ceil(cap / cols) * cs + 6;
  const s = p.inv[m.sel];
  if (s) {
    const it = ITEMS[s.id]; frameBox(6, y, VW - 12, 78, "#06180d", AMB); icon(s.id, 10, y + 6, 36); txt(it.n + (s.n > 1 ? " x" + s.n : ""), 52, y + 16, AMB, 9); txt(it.d, 52, y + 28, TXT, 7);
    txt(itemInfo(s.id), 52, y + 39, DIM, 7); if (s.cond !== undefined) { bar(52, y + 45, 70, 5, s.cond / 100, condCol(s.cond)); txt(Math.round(s.cond) + "%", 126, y + 51, DIM, 7); }
    const use = it.t === "gun" || it.t === "melee" || it.t === "armor" ? "EQUIP" : it.t === "food" ? "EAT" : it.t === "drink" ? "DRINK" : it.t === "mat" ? "-" : it.t === "tool" ? "REPAIR" : "USE";
    abtn(10, y + 56, 70, 18, use, () => { useItem(m.sel); if (!p.inv[m.sel]) m.sel = -1; }, { off: use === "-" }); abtn(86, y + 56, 60, 18, "DROP", () => { dropItem(m.sel); m.sel = -1; }, { col: "#4a1a1a" }); y += 84;
  } else { txt("Tap an item for details.", 10, y + 10, DIM, 8); y += 22; }
  return y + 10;
}
function tabPerks(y) {
  const p = S.p; y = sec("S.P.E.C.I.A.L.", y); txt("LEVEL " + p.lvl, 10, y + 8, AMB, 10); bar(70, y, VW - 84, 8, p.xp / xpNeed(p.lvl), "#ffb83c"); txt(Math.floor(p.xp) + "/" + xpNeed(p.lvl) + " xp", VW - 14, y + 8, TXT, 7, "right"); y += 16;
  txt("Stat points: " + p.points, 10, y + 8, p.points ? "#dfff80" : DIM, 9); y += 14;
  for (const k of SK) {
    frameBox(6, y, VW - 12, 28, "#06180d", "#145a34"); txt(SN[k], 12, y + 12, AMB, 11); const e = st(k); txt(String(p.stats[k]) + (e !== p.stats[k] ? " (" + e + ")" : ""), 50, y + 12, e > p.stats[k] ? "#8ad0ff" : e < p.stats[k] ? "#d080ff" : TXT, 11); txt(SDESC[k], 12, y + 23, DIM, 7);
    abtn(VW - 36, y + 4, 24, 20, "+", () => { if (p.points > 0 && p.stats[k] < 10) { p.stats[k]++; p.points--; p.hp = Math.min(p.hp + 10, maxHp()); } }, { off: !(p.points > 0 && p.stats[k] < 10), size: 11 }); y += 32;
  }
  y += 4; y = sec("PERKS", y); txt("Perk picks waiting: " + p.picks, 10, y + 8, p.picks ? "#dfff80" : DIM, 9); abtn(VW - 90, y - 2, 80, 18, "CHOOSE PERK", () => { S.levelup = rollPerks(); S.menu = null; }, { off: !p.picks }); y += 18;
  const own = Object.keys(p.perks); if (!own.length) { txt("No perks yet. You pick one each level.", 10, y + 8, DIM, 8); y += 16; }
  for (const k of own) { txt(PERKS[k].n, 10, y + 8, GRN, 9); txt(PERKS[k].d, 10, y + 19, DIM, 7); y += 26; }
  return y + 10;
}
function tabMap(y) {
  const p = S.p, w = S.world, sc = (VW - 16) / MW; y = sec("MAP", y); ctx.imageSmoothingEnabled = false; frameBox(7, y - 1, MW * sc + 2, MH * sc + 2, "#0c0a06", AMBD); ctx.drawImage(mapCv, 8, y, MW * sc, MH * sc);
  const mk = (tx, ty, col, r) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(8 + (tx + .5) * sc, y + (ty + .5) * sc, r, 0, 6.3); ctx.fill(); };
  for (const c of w.camps) if (S.fog[c.y * MW + c.x]) mk(c.x, c.y, "#ff5040", 2.4);
  for (const b of w.buildings) if ((b.kind === "vault" || b.kind === "bunker") && S.fog[(b.y + 2) * MW + b.x + 2]) mk(b.x + b.w / 2, b.y + b.h / 2, b.kind === "vault" ? "#ffe040" : "#40c0ff", 2.6);
  for (const t of w.setts) if (S.fog[(t.y + 6) * MW + t.x + 7]) mk(t.x + 7, t.y + 6, "#ffffff", 3.2), mk(t.x + 7, t.y + 6, "#3aa0ff", 2.2);
  for (const s of S.structs) mk(s.x, s.y, "#7ee07e", 1.8);
  const pk = Math.sin(S.time * 5) > 0 ? 3.4 : 2.6; mk(p.x / TS - .5, p.y / TS - .5, "#ffffff", pk);
  y += MH * sc + 6; txt("white you  red raiders  yellow vault  cyan bunker  blue ring settlement", 8, y + 8, DIM, 6); y += 14; txt("Green ground is irradiated. Explore to reveal the map.", 8, y + 8, DIM, 7);
  return y + 18;
}
function costText(cost, x, y) { let cx = x; for (const id in cost) { const have = countItem(id), ok = have >= cost[id]; icon(id, cx, y - 8, 14); txt(cost[id] + "", cx + 15, y + 3, ok ? GRN : RED, 8); cx += 34; } }
function tabMake(y) {
  const near = nearStruct("workbench", 70); y = sec("BUILD CAMP", y); txt("Face open ground, then build.", 10, y + 6, DIM, 7); y += 12;
  for (const k in BUILDS) { const b = BUILDS[k]; frameBox(6, y, VW - 12, 36, "#06180d", "#145a34"); ctx.drawImage(getSprite("s_" + k), 8, y + 2, 32, 32); txt(b.n, 44, y + 12, AMB, 9); txt(b.d, 44, y + 22, DIM, 6); costText(b.cost, 44, y + 31); abtn(VW - 62, y + 8, 52, 20, "BUILD", () => { if (placeStruct(k)) S.menu = null; }, { off: !hasMats(b.cost) }); y += 40; }
  y += 4; y = sec("CRAFT", y); txt(near ? "Workbench in reach." : "Stand next to a workbench to craft.", 10, y + 6, near ? GRN : "#e8962e", 7); y += 12;
  for (const r of RECIPES) { frameBox(6, y, VW - 12, 30, "#06180d", "#145a34"); icon(r.out.id, 8, y + 3, 24); txt(r.n, 36, y + 12, TXT, 8); costText(r.cost, 36, y + 24); abtn(VW - 62, y + 5, 52, 20, "CRAFT", () => craft(r), { off: !near || !hasMats(r.cost) }); y += 34; }
  txt("Campfire: cook meat, boil dirty water.", 10, y + 8, DIM, 7); y += 12; txt("Cot: sleep to skip the night and heal.", 10, y + 8, DIM, 7);
  return y + 20;
}

/* ---------- loot window and level up ---------- */
function drawLoot() {
  const L = S.loot, p = S.p; uiHits = []; S.clip = null; ctx.fillStyle = "rgba(2,10,6,.96)"; ctx.fillRect(0, 0, VW, VH);
  let y = safeTop; txt(L.title.toUpperCase(), 8, y + 10, AMB, 11); txt("Bag " + p.inv.length + "/" + invCap(), 8, y + 22, TXT, 8);
  abtn(VW - 56, y - 2, 48, 22, "CLOSE", () => { S.loot = null; S.scroll = 0; }); if (L.mode === "take") abtn(VW - 124, y - 2, 64, 22, "TAKE ALL", () => takeAll(), { off: !L.list.length }); y += 30;
  const top = y, bottom = VH - safeBot - 2; ctx.save(); ctx.beginPath(); ctx.rect(0, top, VW, bottom - top); ctx.clip(); S.clip = [top, bottom];
  const y0 = top - S.scroll; y = y0 + 2; txt(L.mode === "stash" ? "STASH (tap to take)" : "CONTENTS", 10, y + 8, AMB, 8); y += 14;
  if (!L.list.length) { txt("Empty.", 10, y + 10, DIM, 9); y += 20; }
  L.list.forEach((it, i) => {
    frameBox(6, y, VW - 12, 32, "#06180d", "#145a34"); icon(it.id, 8, y + 3, 26); txt(itemName(it.id) + (it.n > 1 ? " x" + it.n : ""), 40, y + 14, TXT, 9); txt(itemInfo(it.id) || ITEMS[it.id] && ITEMS[it.id].d || "", 40, y + 25, DIM, 6);
    if (it.cond !== undefined) txt(Math.round(it.cond) + "%", VW - 70, y + 14, condCol(it.cond), 7, "right");
    abtn(VW - 62, y + 6, 52, 20, "TAKE", () => { if (L.mode === "stash") stashTake(i); else takeFrom(i); }, { tc: GRN }); y += 36;
  });
  if (L.mode === "stash") {
    y += 6; txt("YOUR BAG (tap to store)", 10, y + 8, AMB, 8); y += 14; const cols = 5, cs = Math.floor((VW - 20) / cols), gx = Math.floor((VW - cs * cols) / 2);
    p.inv.forEach((s, i) => { const cx = gx + (i % cols) * cs, cy = y + Math.floor(i / cols) * cs; frameBox(cx + 1, cy + 1, cs - 2, cs - 2, "#04120a", "#145a34"); icon(s.id, cx + 6, cy + 5, cs - 12); if (s.n > 1) txt("x" + s.n, cx + cs - 4, cy + cs - 5, "#fff", 8, "right"); reg(cx, cy, cs, cs, () => stashPut(i)); });
    y += Math.max(1, Math.ceil(p.inv.length / cols)) * cs + 6;
  }
  ctx.restore(); S.scrollMax = Math.max(0, y - y0 - (bottom - top) + 10); S.clip = null; S.scroll = clamp(S.scroll, 0, S.scrollMax);
}
function drawLevelUp() {
  uiHits = []; S.clip = null; ctx.fillStyle = "rgba(2,10,6,.95)"; ctx.fillRect(0, 0, VW, VH); const p = S.p; let y = VH * .16;
  txt("LEVEL " + p.lvl, VW / 2, y, "#dfff80", 22, "center"); txt("Choose a perk", VW / 2, y + 18, TXT, 10, "center"); y += 40;
  S.levelup.forEach(k => { frameBox(14, y, VW - 28, 54, "#0a2c18", AMB); txt(PERKS[k].n, 24, y + 20, AMB, 12); txt(PERKS[k].d, 24, y + 36, TXT, 8); reg(14, y, VW - 28, 54, () => { p.perks[k] = true; p.picks--; S.levelup = null; p.hp = Math.min(maxHp(), p.hp + 20); toast("Perk: " + PERKS[k].n, "#dfff80"); }); y += 62; });
  abtn(VW / 2 - 50, y + 10, 100, 24, "LATER", () => { S.levelup = null; S.luCool = 90; });
}

/* ---------- talk and barter ---------- */
function drawTalk() {
  uiHits = []; S.clip = null; ctx.fillStyle = "rgba(2,10,6,.92)"; ctx.fillRect(0, 0, VW, VH); const T = S.talk, n = T.npc; let y = VH * .2;
  ctx.drawImage(getSprite("npc_" + n.kind + n.spr), VW / 2 - 32, y, 64, 64); y += 78; txt(n.name, VW / 2, y, AMB, 13, "center"); txt(({ merchant: "Merchant: " + n.shop, guard: "Guard", settler: "Settler" })[n.kind] + "  - " + n.place, VW / 2, y + 14, DIM, 8, "center"); y += 30;
  const words = T.line.split(" "), lines = []; let cur = ""; for (const w of words) { if ((cur + " " + w).length > 38) { lines.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; } lines.push(cur);
  frameBox(14, y, VW - 28, lines.length * 12 + 16, "#06180d", AMBD); lines.forEach((l, i) => txt(l, VW / 2, y + 16 + i * 12, TXT, 8, "center")); y += lines.length * 12 + 30;
  if (n.kind === "merchant") { abtn(VW / 2 - 60, y, 120, 26, "TRADE", () => openTrade(n), { size: 10, col: "#0a3a1c", tc: GRN }); y += 34; }
  abtn(VW / 2 - 60, y, 120, 26, "LEAVE", () => { S.talk = null; }, { size: 10 });
}
function drawTrade() {
  const T = S.trade, n = T.npc, p = S.p; uiHits = []; S.clip = null; ctx.fillStyle = "rgba(2,10,6,.96)"; ctx.fillRect(0, 0, VW, VH);
  let y = safeTop; txt(n.name.toUpperCase(), 8, y + 10, AMB, 11); icon("caps", 8, y + 13, 12); txt(p.caps + " caps", 24, y + 23, "#dfff80", 9); abtn(VW - 56, y - 2, 48, 22, "DONE", () => { S.trade = null; S.scroll = 0; }); y += 30;
  [["buy", "BUY"], ["sell", "SELL"]].forEach(([m, l], i) => { const on = T.mode === m, tw = (VW - 12) / 2; frameBox(6 + i * tw, y, tw - 2, 20, on ? "#0f4a2a" : "#06160c", on ? AMB : "#1a5a38"); txt(l, 6 + i * tw + tw / 2 - 1, y + 13, on ? AMB : DIM, 9, "center"); reg(6 + i * tw, y, tw - 2, 20, () => { T.mode = m; S.scroll = 0; }); }); y += 26;
  const top = y, bottom = VH - safeBot - 2; ctx.save(); ctx.beginPath(); ctx.rect(0, top, VW, bottom - top); ctx.clip(); S.clip = [top, bottom]; const y0 = top - S.scroll; y = y0 + 2;
  const row = (id, n_, cond, label, price, fn, ok) => { frameBox(6, y, VW - 12, 32, "#06180d", "#145a34"); icon(id, 8, y + 3, 26); txt(itemName(id) + (n_ > 1 ? " x" + n_ : ""), 40, y + 13, TXT, 8); const inf = itemInfo(id); txt((inf || (ITEMS[id] && ITEMS[id].d) || "").slice(0, 34) + (cond !== undefined ? "  " + Math.round(cond) + "%" : ""), 40, y + 25, DIM, 6); abtn(VW - 64, y + 5, 54, 22, label + " " + price, fn, { off: !ok, size: 7, tc: GRN }); y += 36; };
  if (T.mode === "buy") {
    if (!n.stock.length) { txt("Sold out.", 10, y + 12, DIM, 9); y += 22; }
    n.stock.forEach((it, i) => { const b = buyPriceOf(it); row(it.id, it.n, it.cond, "BUY" + (b.q > 1 ? " " + b.q : ""), b.price, () => buyStock(i), p.caps >= b.price); });
  } else {
    let any = false;
    for (const id in AMMO_ITEMS) { const k = AMMO_ITEMS[id].k; if (p.ammo[k] > 0) { any = true; const q = Math.min(10, p.ammo[k]); row(id, p.ammo[k], undefined, "SELL " + q, Math.max(1, Math.floor((VAL[id] || 1) * q * sellMul())), () => sellAmmo(id), true); } }
    p.inv.forEach((s, i) => { any = true; row(s.id, s.n, s.cond, "SELL", Math.max(1, Math.floor((VAL[s.id] || 2) * condF(s) * sellMul())), () => sellInv(i), true); });
    if (!any) { txt("Nothing to sell.", 10, y + 12, DIM, 9); y += 22; }
  }
  ctx.restore(); S.scrollMax = Math.max(0, y - y0 - (bottom - top) + 10); S.clip = null; S.scroll = clamp(S.scroll, 0, S.scrollMax);
}

/* ---------- title, character creation, death ---------- */
function drawTitle() {
  uiHits = []; S.clip = null; ctx.fillStyle = "#020a05"; ctx.fillRect(0, 0, VW, VH);
  for (let sy = 0; sy < VH; sy += 3) { ctx.fillStyle = "rgba(60,255,138,.035)"; ctx.fillRect(0, sy, VW, 1); }
  for (let i = 0; i < 40; i++) { const sx = (_hash(i, 1, 3) + 1) / 2 * VW, sy = (_hash(i, 2, 3) + 1) / 2 * VH * .6; ctx.fillStyle = "rgba(255,230,180," + (.3 + .3 * Math.sin(S.time * 2 + i)) + ")"; ctx.fillRect(sx | 0, sy | 0, 1, 1); }
  const t = S.time; ctx.save(); ctx.translate(VW / 2 - 24, VH * .3); ctx.scale(3, 3); ctx.drawImage(getSprite("player"), 0, 0); ctx.restore();
  ctx.save(); ctx.translate(VW / 2 + 40 + Math.sin(t) * 2, VH * .3 + 6); ctx.scale(-2.4, 2.4); ctx.drawImage(getSprite("razorclaw"), -32, 0); ctx.restore();
  ctx.save(); ctx.shadowColor = "#3cff8a"; ctx.shadowBlur = 12; txt("LAST", VW / 2, VH * .17, AMB, 34, "center"); txt("RATION", VW / 2, VH * .17 + 34, AMB, 34, "center"); ctx.restore(); txt("VAULT-TEC  SURVIVAL SYSTEM  v2.0", VW / 2, VH * .17 + 52, DIM, 7, "center"); txt("scavenge. survive. do not die.", VW / 2, VH * .17 + 64, DIM, 8, "center");
  let by = VH * .55; if (hasSave()) { abtn(VW / 2 - 70, by, 140, 34, "CONTINUE", () => { loadGame(); }, { size: 10, col: "#0a3a1c", tc: GRN }); by += 44; }
  abtn(VW / 2 - 70, by, 140, 34, hasSave() && S.confirmNew ? "TAP AGAIN: ERASE" : "NEW SURVIVOR", () => { if (hasSave() && !S.confirmNew) S.confirmNew = true; else startCreate(); }, { size: 10, col: hasSave() && S.confirmNew ? "#5a1a1a" : "#0f3a22" });
  txt("Death is permanent. Every survivor gets a new world.", VW / 2, by + 56, DIM, 7, "center");
}
function startCreate() { S.create = { name: pick(NAMES), stats: { str: 4, per: 4, end: 4, agi: 4, int: 4, lck: 4 }, left: 8 }; S.scene = "create"; S.confirmNew = false; }
function drawCreate() {
  uiHits = []; S.clip = null; const c = S.create; ctx.fillStyle = "#020a05"; ctx.fillRect(0, 0, VW, VH); for (let sy = 0; sy < VH; sy += 3) { ctx.fillStyle = "rgba(60,255,138,.035)"; ctx.fillRect(0, sy, VW, 1); }
  let y = safeTop + 6; txt("NEW SURVIVOR", VW / 2, y + 12, AMB, 16, "center"); y += 30;
  ctx.drawImage(getSprite("player"), VW / 2 - 24, y, 48, 48); y += 56;
  txt(c.name, VW / 2, y + 8, TXT, 13, "center"); abtn(VW / 2 - 36, y + 14, 72, 18, "REROLL NAME", () => { c.name = pick(NAMES); }, { size: 7 }); y += 44;
  txt("Points left: " + c.left, VW / 2, y + 8, c.left ? "#dfff80" : DIM, 10, "center"); y += 18;
  for (const k of SK) {
    frameBox(10, y, VW - 20, 34, "#06180d", "#145a34"); txt(SN[k], 18, y + 15, AMB, 12); txt(SDESC[k], 18, y + 27, DIM, 7); txt(String(c.stats[k]), VW - 82, y + 20, TXT, 14, "center");
    abtn(VW - 64, y + 7, 22, 20, "-", () => { if (c.stats[k] > 1) { c.stats[k]--; c.left++; } }, { off: c.stats[k] <= 1, size: 11 }); abtn(VW - 38, y + 7, 22, 20, "+", () => { if (c.left > 0 && c.stats[k] < 9) { c.stats[k]++; c.left--; } }, { off: !(c.left > 0 && c.stats[k] < 9), size: 11 }); y += 38;
  }
  y += 8; abtn(VW / 2 - 70, y, 140, 34, "BEGIN", () => { newGame(Object.assign({}, c.stats), c.name); }, { size: 11, col: "#0a3a1c", tc: GRN }); abtn(VW / 2 - 30, y + 42, 60, 18, "BACK", () => { S.scene = "title"; }, { size: 7 });
}
function drawDead() {
  uiHits = []; S.clip = null; ctx.fillStyle = "rgba(10,0,0,.9)"; ctx.fillRect(0, 0, VW, VH); const p = S.p, days = Math.floor((S.t - START_MIN) / 1440);
  txt("YOU DIED", VW / 2, VH * .28, "#d84a3a", 28, "center"); txt(S.deathWhy, VW / 2, VH * .28 + 20, TXT, 10, "center");
  txt(p.name + " survived " + days + " day" + (days === 1 ? "" : "s") + " and " + Math.floor(hourOf(S.t - START_MIN)) + " hours.", VW / 2, VH * .28 + 42, "#b8ffd0", 9, "center");
  txt("Level " + p.lvl + "   Kills: " + p.kills, VW / 2, VH * .28 + 56, DIM, 8, "center");
  abtn(VW / 2 - 70, VH * .55, 140, 34, "NEW SURVIVOR", () => { startCreate(); }, { size: 10 }); txt("A new survivor means a new world.", VW / 2, VH * .55 + 52, DIM, 7, "center");
}

/* ---------- frame loop ---------- */
function frame(now) {
  const dt = Math.min(.05, (now - (frame.last || now)) / 1000); frame.last = now;
  if (S.scene === "play") {
    if (S.sleep) { for (let i = 0; i < 20 && S.sleep && S.scene === "play"; i++) update(.05); S.time += dt; }
    else if (!modalOpen()) update(dt); else { S.time += dt; S.light = lightAt(hourOf(S.t)); }
    if (S.scene === "play") {
      const p = S.p; if (S.luCool > 0) S.luCool -= dt;
      if (p.picks > 0 && !modalOpen() && !(S.luCool > 0) && !S.enemies.some(e => e.state === "chase" && Math.hypot(e.x - p.x, e.y - p.y) < 400)) S.levelup = rollPerks();
    }
    drawWorld();
    if (S.scene === "play") { if (S.levelup) drawLevelUp(); else if (S.trade) drawTrade(); else if (S.talk) drawTalk(); else if (S.loot) drawLoot(); else if (S.menu) drawMenu(); else { uiHits = []; if (!S.sleep) drawHUD(); } } else drawDead();
  } else if (S.scene === "dead") { S.time += dt; drawWorld(); drawDead(); } else if (S.scene === "create") { S.time += dt; drawCreate(); } else { S.time += dt; drawTitle(); }
  requestAnimationFrame(frame);
}
resize(); requestAnimationFrame(frame);
window.__S = S;
