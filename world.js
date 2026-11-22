"use strict";
/* Last Ration: data tables and procedural world generation. Everything here is seeded, so a seed always makes the same world. */
const TS = 32, MW = 176, MH = 176;
const GR = { GRASS: 0, DIRT: 1, ROAD: 2, ROADH: 3, ROADV: 4, SIDE: 5, WOOD: 6, TILEF: 7, WALL: 8, LAKE: 9, RADG: 10, METAL: 11 };
const DECO = { PINE: 1, OAK: 2, DEAD: 3, BUSH: 4, WRECK: 5, WRECK2: 6, RUBBLE: 7, BONES: 8, SIGN: 9, CRATE: 10, SHELF: 11, FRIDGE: 12, MEDBOX: 13, LOCKER: 14, DUMP: 15, BARREL: 16, FOOT: 17, AMMOBOX: 18, TENT: 20, FIRE: 21, VAULT: 22, GLOW: 23, TERM: 24, STALL: 25 };
const DECO_SPRITE = { 1: "tree_pine", 2: "tree_oak", 3: "tree_dead", 4: "bush", 5: "c_wreck", 6: "c_wreck2", 7: "p_rubble", 8: "p_bones", 9: "p_sign", 10: "c_crate", 11: "c_shelf", 12: "c_fridge", 13: "c_medbox", 14: "c_locker", 15: "c_dump", 16: "c_barrel", 17: "c_foot", 18: "c_ammobox", 20: "p_tent", 21: "s_campfire", 22: "p_vault", 23: "p_glow", 24: "c_term", 25: "p_stall" };
const CON_DECO = { crate: 10, shelf: 11, fridge: 12, medbox: 13, locker: 14, dump: 15, barrel: 16, foot: 17, ammobox: 18, term: 24 };
const CON_NAME = { crate: "Crate", shelf: "Shelf", fridge: "Fridge", medbox: "Med cabinet", locker: "Locker", car: "Car trunk", dump: "Dumpster", barrel: "Barrel", foot: "Footlocker", ammobox: "Ammo box", term: "Supply cache" };
const NODECO_SOLID = new Set([7, 8, 21, 22, 23]); // decor you can walk over

function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, f = t => t * t * (3 - 2 * t), h = (a, b) => (_hash(a, b, s) + 1) / 2;
  const u = f(xf), v = f(yf);
  return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v;
}
const fbm = (x, y, s) => (vnoise(x, y, s) * .5 + vnoise(x * 2, y * 2, s + 1) * .25 + vnoise(x * 4, y * 4, s + 2) * .125) / .875;

/* ---------- items ---------- */
const ITEMS = {
  beans: { n: "Pork & Beans", t: "food", hunger: 34, thirst: -3, d: "Hearty. Eat it cold." },
  soup: { n: "Canned Soup", t: "food", hunger: 24, thirst: 8, d: "Salty broth." },
  crackers: { n: "Crackers", t: "food", hunger: 15, thirst: -4, d: "Dry and stale." },
  apple: { n: "Apple", t: "food", hunger: 9, thirst: 8, d: "Somehow still fresh." },
  candy: { n: "Candy Bar", t: "food", hunger: 8, d: "Quick sugar." },
  jerky: { n: "Jerky", t: "food", hunger: 22, thirst: -6, d: "Chewy and salty." },
  petfood: { n: "Dog Food", t: "food", hunger: 30, sick: .25, d: "You are not proud of this." },
  meat_raw: { n: "Raw Meat", t: "food", hunger: 16, sick: .55, d: "Cook it at a fire first." },
  meat: { n: "Cooked Meat", t: "food", hunger: 46, d: "Hot, greasy, perfect." },
  water: { n: "Clean Water", t: "drink", thirst: 46, d: "Sealed and safe." },
  soda: { n: "Soda", t: "drink", thirst: 26, hunger: 4, d: "Warm and flat." },
  dirty: { n: "Dirty Water", t: "drink", thirst: 40, sick: .5, d: "Boil it at a fire." },
  bandage: { n: "Bandage", t: "med", hp: 6, cure: ["bleed"], d: "Stops bleeding." },
  splint: { n: "Splint", t: "med", cure: ["fract"], d: "Sets a broken leg." },
  antibio: { n: "Antibiotics", t: "med", cure: ["inf", "sick"], d: "Cures infection and sickness." },
  radaway: { n: "Rad Pills", t: "med", rad: -55, d: "Flushes radiation." },
  medkit: { n: "Medkit", t: "med", hp: 45, cure: ["bleed", "fract"], d: "Heals and fixes wounds." },
  stim: { n: "Stim Pack", t: "med", hp: 55, d: "Instant healing." },
  addictol: { n: "Addictol", t: "med", cureAddict: true, d: "Clears chem addictions." },
  jet: { n: "Jet", t: "chem", chem: { dur: 50, add: .25, fx: { spd: 1.3, agi: 2 } }, d: "Fast. Withdrawal bites." },
  buffout: { n: "Buffout", t: "chem", chem: { dur: 90, add: .2, fx: { str: 3, hp: 30 } }, d: "+3 STR, +30 max HP." },
  psycho: { n: "Psycho", t: "chem", chem: { dur: 70, add: .25, fx: { dmg: 1.3, res: .8 } }, d: "More damage, less pain." },
  mentats: { n: "Mentats", t: "chem", chem: { dur: 90, add: .15, fx: { per: 3, int: 3 } }, d: "+3 PER, +3 INT." },
  medx: { n: "Med-X", t: "chem", chem: { dur: 80, add: .2, fx: { res: .65 } }, d: "Takes the edge off hits." },
  radx: { n: "Rad-X", t: "chem", chem: { dur: 120, add: 0, fx: { radres: .5 } }, d: "Halves radiation taken." },
  scrap: { n: "Scrap Metal", t: "mat", s: 20, d: "Bent and rusty." },
  wood: { n: "Wood", t: "mat", s: 20, d: "Planks and splinters." },
  cloth: { n: "Cloth", t: "mat", s: 20, d: "Rags and sheets." },
  gears: { n: "Gears", t: "mat", s: 20, d: "Machine parts." },
  repair_kit: { n: "Repair Kit", t: "tool", d: "Restores a weapon by 40%." },
  leather_armor: { n: "Leather Armor", t: "armor", slot: "body", dr: .15, rr: 0, d: "Stitched hide. 15% less damage." },
  metal_armor: { n: "Metal Armor", t: "armor", slot: "body", dr: .25, rr: 0, d: "Heavy plates. 25% less damage." },
  combat_armor: { n: "Combat Armor", t: "armor", slot: "body", dr: .35, rr: .1, d: "Military grade. 35% less damage." },
  hazmat: { n: "Hazmat Suit", t: "armor", slot: "body", dr: .1, rr: .75, d: "Blocks 75% of radiation." },
  hardhat: { n: "Hard Hat", t: "armor", slot: "head", dr: .05, rr: 0, d: "Better than nothing." },
  helmet: { n: "Combat Helmet", t: "armor", slot: "head", dr: .12, rr: 0, d: "12% less damage." },
  gasmask: { n: "Gas Mask", t: "armor", slot: "head", dr: .03, rr: .3, d: "Filters 30% of radiation." },
  pistol: { n: "9mm Pistol", t: "gun", d: "Semi-auto, 12 rounds." },
  revolver: { n: "Revolver", t: "gun", d: "Heavy .44, slow, hits hard." },
  pipe_rifle: { n: "Pipe Rifle", t: "gun", d: "Junk gun. Hits OK, wears fast." },
  shotgun: { n: "Shotgun", t: "gun", d: "Brutal up close." },
  smg: { n: "SMG", t: "gun", d: "3 round bursts." },
  rifle_auto: { n: "Assault Rifle", t: "gun", d: "3 round bursts, hits hard." },
  rifle: { n: "Hunting Rifle", t: "gun", d: "Slow, long range, heavy." },
  laser_pistol: { n: "Laser Pistol", t: "gun", d: "Quiet energy weapon." },
  bat: { n: "Baseball Bat", t: "melee", d: "Heavy swing." },
  knife: { n: "Combat Knife", t: "melee", d: "Quick and light." },
  machete: { n: "Machete", t: "melee", d: "Wide, deadly arc." },
  pipe: { n: "Lead Pipe", t: "melee", d: "Solid." },
  sledge: { n: "Sledgehammer", t: "melee", d: "Slow. Crushes bone." }
};
ITEMS.caps = { n: "Bottle Caps", t: "cash", d: "Money." };
const VAL = { beans: 8, soup: 6, crackers: 4, apple: 3, candy: 3, jerky: 7, petfood: 4, meat_raw: 4, meat: 10, water: 6, soda: 4, dirty: 2, bandage: 8, splint: 10, antibio: 20, radaway: 25, medkit: 40, stim: 35, addictol: 30, jet: 20, buffout: 25, psycho: 28, mentats: 22, medx: 22, radx: 18, scrap: 2, wood: 2, cloth: 2, gears: 5, repair_kit: 25, leather_armor: 40, metal_armor: 80, combat_armor: 160, hazmat: 120, hardhat: 12, helmet: 45, gasmask: 50, pistol: 60, revolver: 110, pipe_rifle: 45, shotgun: 90, smg: 130, rifle_auto: 200, rifle: 150, laser_pistol: 220, bat: 15, knife: 12, machete: 30, pipe: 10, sledge: 45, ammo9: 1, ammoShell: 2, ammoRifle: 2, ammo44: 3, ammoCell: 3, caps: 1 };
const NPC_HP = { merchant: 60, guard: 110, settler: 40 };
const NPC_NAMES = ["Doc Harlan", "Big Edna", "Tobias", "Marlow", "Sister Ruth", "Gideon", "Pike", "Odessa", "Lucky", "Hollis", "Wanda", "Rusty", "Bram", "Iris", "Cutter", "Nell", "Ezra", "Dot"];
function genStock(R, shop) {
  const pools = { general: [LOOT.shop, LOOT.shop, LOOT.clinic, LOOT.outdoor], arms: [LOOT.police, LOOT.raider, LOOT.bunker], chem: [LOOT.clinic, LOOT.clinic, LOOT.rad, LOOT.vault] }[shop], out = [];
  for (let k = 0; k < 11; k++) {
    const t = pools[Math.floor(R() * pools.length)], r = wpick(R, t), it = ITEMS[r[0]] || { t: "ammo" }, ammo = !!AMMO_ITEMS[r[0]], eq = it.t === "gun" || it.t === "melee" || it.t === "armor";
    if (r[0] === "caps" || (shop === "chem" && eq)) continue; if (shop === "general" && (it.t === "gun")) continue;
    const n = ammo ? 12 + Math.floor(R() * 24) : it.t === "food" || it.t === "drink" || it.t === "mat" ? 1 + Math.floor(R() * 4) : 1 + (R() < .3 ? 1 : 0);
    const ex = out.find(o => o.id === r[0] && !eq); if (ex) { ex.n += n; continue; }
    out.push({ id: r[0], n: eq ? 1 : n, cond: it.t === "gun" || it.t === "melee" ? 60 + Math.floor(R() * 40) : undefined });
  }
  return out;
}
const AMMO_ITEMS = { ammo9: { k: "a9", n: "9mm" }, ammoShell: { k: "shell", n: "Shells" }, ammoRifle: { k: "rifle", n: "Rifle rounds" }, ammo44: { k: "a44", n: ".44 rounds" }, ammoCell: { k: "cell", n: "Energy cells" } };
const AMMO_NAMES = { a9: "9mm", shell: "Shells", rifle: "Rifle", a44: ".44", cell: "Cells" };
const WP = {
  pistol: { gun: 1, ammo: "a9", dmg: 24, mag: 12, range: 380, rate: .26, pel: 1, spread: .035, reload: 1.1, noise: 480, burst: 1 },
  revolver: { gun: 1, ammo: "a44", dmg: 54, mag: 6, range: 400, rate: .5, pel: 1, spread: .03, reload: 2.1, noise: 580, burst: 1 },
  pipe_rifle: { gun: 1, ammo: "rifle", dmg: 38, mag: 5, range: 420, rate: .6, pel: 1, spread: .07, reload: 2.2, noise: 560, burst: 1, wear: .8 },
  shotgun: { gun: 1, ammo: "shell", dmg: 11, mag: 6, range: 190, rate: .75, pel: 7, spread: .2, reload: 2.2, noise: 600, burst: 1 },
  smg: { gun: 1, ammo: "a9", dmg: 13, mag: 30, range: 330, rate: .07, pel: 1, spread: .08, reload: 1.6, noise: 520, burst: 3, burstCd: .42 },
  rifle_auto: { gun: 1, ammo: "rifle", dmg: 22, mag: 24, range: 440, rate: .08, pel: 1, spread: .05, reload: 2.0, noise: 650, burst: 3, burstCd: .5 },
  rifle: { gun: 1, ammo: "rifle", dmg: 80, mag: 5, range: 580, rate: 1.0, pel: 1, spread: .01, reload: 2.4, noise: 700, burst: 1 },
  laser_pistol: { gun: 1, ammo: "cell", dmg: 22, mag: 24, range: 360, rate: .2, pel: 1, spread: .03, reload: 1.5, noise: 110, burst: 1, wear: .2, col: "#7dff8a" },
  bat: { melee: 1, dmg: 26, cd: .6, range: 40, arc: 1.7, noise: 70, kb: 60 },
  knife: { melee: 1, dmg: 14, cd: .3, range: 32, arc: 1.2, noise: 40, kb: 20 },
  machete: { melee: 1, dmg: 31, cd: .5, range: 42, arc: 1.9, noise: 70, kb: 40 },
  pipe: { melee: 1, dmg: 22, cd: .45, range: 38, arc: 1.5, noise: 60, kb: 45 },
  sledge: { melee: 1, dmg: 50, cd: 1.0, range: 42, arc: 2.0, noise: 100, kb: 95 },
  fists: { melee: 1, dmg: 6, cd: .4, range: 26, arc: 1.2, noise: 20, kb: 10 }
};
/* enemy types. ranged: {dmg, rng, rate, spd, col}. aura: radiation per second near it. */
const ET = {
  shambler: { n: "Feral Ghoul", hp: 42, spd: 34, dmg: 9, reach: 17, sight: 175, sprite: "shambler", scale: 1, r: 8, infect: .12, bleed: .1, xp: 8, corpse: "c_zombie" },
  ghoul: { n: "Ghoul Reaver", hp: 58, spd: 60, dmg: 12, reach: 17, sight: 210, sprite: "ghoul", scale: 1, r: 8, infect: .08, rad: 14, bleed: .12, xp: 14, corpse: "c_zombie" },
  glower: { n: "Glowing One", hp: 95, spd: 50, dmg: 15, reach: 17, sight: 220, sprite: "glower", scale: 1.05, r: 9, rad: 20, aura: 2.4, glow: 90, xp: 32, corpse: "c_glow" },
  roach: { n: "Radroach", hp: 18, spd: 70, dmg: 5, reach: 14, sight: 150, sprite: "roach", scale: .85, r: 7, sick: .3, rad: 5, xp: 4, corpse: "c_animal", meat: .2 },
  burrower: { n: "Mole Rat", hp: 30, spd: 76, dmg: 8, reach: 14, sight: 160, sprite: "burrower", scale: .9, r: 7, bleed: .15, xp: 8, corpse: "c_animal" },
  hound: { n: "Mutant Hound", hp: 46, spd: 94, dmg: 11, reach: 16, sight: 240, sprite: "hound", scale: 1, r: 8, bleed: .2, xp: 14, corpse: "c_animal", pack: 1 },
  scorpion: { n: "Radscorpion", hp: 125, spd: 50, dmg: 18, reach: 22, sight: 200, sprite: "scorpion", scale: 1.3, r: 11, sick: .55, rad: 6, xp: 42, corpse: "c_animal" },
  mauler: { n: "Yao Guai", hp: 230, spd: 58, dmg: 26, reach: 24, sight: 230, sprite: "mauler", scale: 1.5, r: 13, bleed: .4, fract: .2, xp: 48, corpse: "c_animal" },
  brute: { n: "Super Mutant", hp: 340, spd: 30, dmg: 34, reach: 24, sight: 190, sprite: "brute", scale: 1.4, r: 12, fract: .35, bleed: .15, xp: 70, corpse: "c_mutant" },
  razorclaw: { n: "Deathclaw", hp: 520, spd: 96, dmg: 42, reach: 27, sight: 290, sprite: "razorclaw", scale: 1.7, r: 14, bleed: .5, fract: .3, xp: 220, corpse: "c_animal", lunge: 1 },
  bloatfly: { n: "Bloatfly", hp: 14, spd: 58, dmg: 4, reach: 12, sight: 200, sprite: "bloatfly", scale: .8, r: 6, sick: .35, xp: 4, corpse: "c_animal", fly: 1, ranged: { dmg: 4, rng: 150, rate: 1.8, spd: 140, col: "#a8e060" } },
  mirelurk: { n: "Mirelurk", hp: 160, spd: 44, dmg: 22, reach: 20, sight: 190, sprite: "mirelurk", scale: 1.25, r: 11, bleed: .2, armor: .35, xp: 50, corpse: "c_animal" },
  ant: { n: "Giant Ant", hp: 34, spd: 64, dmg: 7, reach: 13, sight: 170, sprite: "ant", scale: .9, r: 7, sick: .2, xp: 7, corpse: "c_animal", pack: 1 },
  gecko: { n: "Gecko", hp: 40, spd: 68, dmg: 9, reach: 14, sight: 180, sprite: "gecko", scale: .95, r: 7, bleed: .15, xp: 9, corpse: "c_animal" },
  brahmin: { n: "Brahmin", hp: 120, spd: 30, dmg: 0, reach: 0, sight: 0, sprite: "brahmin", scale: 1.35, r: 12, xp: 2, corpse: "c_brahmin", passive: 1 },
  raider: { n: "Raider", hp: 62, spd: 46, dmg: 8, reach: 16, sight: 250, sprite: "raider", scale: 1, r: 8, bleed: .1, xp: 22, corpse: "c_raider", ranged: { dmg: 10, rng: 250, rate: 1.5, spd: 230, col: "#ffe9a0" } },
  brawler: { n: "Raider Brawler", hp: 95, spd: 54, dmg: 19, reach: 18, sight: 230, sprite: "brawler", scale: 1.08, r: 9, bleed: .25, xp: 24, corpse: "c_raider" },
  rustbot: { n: "Mister Handy", hp: 150, spd: 32, dmg: 11, reach: 18, sight: 260, sprite: "rustbot", scale: 1.15, r: 10, xp: 46, corpse: "c_robot", robot: 1, ranged: { dmg: 9, rng: 270, rate: 1.1, spd: 260, col: "#ff6a5a" } }
};
const eTable = (d, rd) => rd > .22 ? [["ghoul", 26], ["glower", 12], ["scorpion", 12], ["roach", 16], ["hound", 8], ["shambler", 10], ["razorclaw", 2], ["bloatfly", 10], ["mirelurk", 6]]
  : d > .58 ? [["shambler", 44], ["ghoul", 18], ["roach", 8], ["brute", 7], ["hound", 8], ["rustbot", 5], ["raider", 6], ["bloatfly", 6], ["ant", 6]]
  : d > .3 ? [["shambler", 44], ["ghoul", 10], ["roach", 12], ["hound", 10], ["burrower", 10], ["raider", 8], ["brute", 2], ["scorpion", 2], ["ant", 8], ["gecko", 4], ["brahmin", 6], ["bloatfly", 6]]
  : [["shambler", 28], ["roach", 16], ["hound", 12], ["burrower", 14], ["scorpion", 6], ["mauler", 8], ["ghoul", 4], ["ant", 12], ["gecko", 8], ["brahmin", 8], ["mirelurk", 6], ["bloatfly", 8]];

const LOOT = {
  house: [["caps", 4, 3, 12], ["beans", 10, 1, 2], ["soup", 8, 1, 2], ["crackers", 8, 1, 2], ["apple", 5, 1, 3], ["candy", 6, 1, 2], ["water", 8, 1, 2], ["soda", 7, 1, 2], ["bandage", 6, 1, 2], ["bat", 2, 1, 1], ["knife", 3, 1, 1], ["pipe", 2, 1, 1], ["ammo9", 5, 8, 15], ["pistol", 1.5, 1, 1], ["antibio", 1, 1, 1], ["ammoShell", 2, 4, 8], ["jerky", 3, 1, 2], ["petfood", 4, 1, 1], ["cloth", 5, 1, 3], ["wood", 3, 1, 3], ["scrap", 3, 1, 2], ["leather_armor", .6, 1, 1], ["hardhat", .8, 1, 1]],
  shop: [["caps", 6, 5, 20], ["beans", 10, 1, 3], ["soup", 10, 1, 3], ["crackers", 10, 1, 2], ["candy", 8, 1, 3], ["soda", 10, 1, 3], ["water", 10, 1, 3], ["jerky", 6, 1, 2], ["petfood", 5, 1, 2], ["apple", 4, 1, 3], ["bandage", 3, 1, 1], ["cloth", 3, 1, 2], ["scrap", 3, 1, 2], ["gears", 1.5, 1, 1]],
  clinic: [["bandage", 16, 1, 3], ["splint", 8, 1, 1], ["antibio", 7, 1, 1], ["radaway", 5, 1, 1], ["medkit", 3, 1, 1], ["water", 4, 1, 2], ["stim", 3, 1, 1], ["medx", 2, 1, 1], ["radx", 3, 1, 1], ["addictol", 1, 1, 1]],
  police: [["pistol", 6, 1, 1], ["smg", 2.5, 1, 1], ["shotgun", 3, 1, 1], ["ammo9", 14, 10, 24], ["ammoShell", 8, 5, 10], ["ammoRifle", 6, 8, 16], ["rifle_auto", 1, 1, 1], ["bandage", 4, 1, 2], ["knife", 3, 1, 1], ["revolver", 1.5, 1, 1], ["ammo44", 5, 6, 12], ["metal_armor", 1, 1, 1], ["helmet", 1.5, 1, 1]],
  cabin: [["rifle", 2.5, 1, 1], ["ammoRifle", 8, 6, 14], ["ammoShell", 6, 4, 8], ["shotgun", 1.5, 1, 1], ["beans", 8, 1, 2], ["jerky", 8, 1, 2], ["water", 8, 1, 2], ["bandage", 4, 1, 2], ["machete", 2, 1, 1], ["apple", 3, 1, 2], ["pipe_rifle", 1.5, 1, 1], ["wood", 5, 1, 3], ["cloth", 3, 1, 2], ["leather_armor", 1, 1, 1]],
  outdoor: [["beans", 6, 1, 1], ["soda", 6, 1, 1], ["water", 6, 1, 1], ["candy", 4, 1, 2], ["bandage", 4, 1, 1], ["ammo9", 4, 5, 10], ["crackers", 4, 1, 1], ["pipe", 3, 1, 1], ["bat", 2, 1, 1], ["knife", 2, 1, 1], ["dirty", 4, 1, 1], ["scrap", 4, 1, 2], ["wood", 3, 1, 2], ["cloth", 3, 1, 2], ["gears", 1.5, 1, 1]],
  car: [["caps", 3, 2, 8], ["scrap", 10, 1, 3], ["gears", 5, 1, 2], ["repair_kit", 1.5, 1, 1], ["ammo9", 4, 4, 10], ["soda", 4, 1, 1], ["water", 3, 1, 1], ["bandage", 3, 1, 1], ["dirty", 3, 1, 1], ["cloth", 3, 1, 2], ["wood", 1, 1, 1]],
  junk: [["scrap", 8, 1, 3], ["cloth", 8, 1, 3], ["wood", 5, 1, 2], ["dirty", 4, 1, 1], ["petfood", 3, 1, 1], ["crackers", 2, 1, 1], ["candy", 2, 1, 1], ["gears", 2, 1, 1], ["knife", 1, 1, 1], ["pipe", 2, 1, 1]],
  rad: [["radaway", 6, 1, 1], ["radx", 5, 1, 1], ["scrap", 8, 1, 3], ["gears", 4, 1, 2], ["jet", 2, 1, 1], ["buffout", 2, 1, 1], ["psycho", 1.5, 1, 1], ["ammoCell", 3, 6, 12], ["hazmat", .6, 1, 1], ["gasmask", .8, 1, 1]],
  raider: [["caps", 10, 10, 40], ["ammo9", 8, 8, 16], ["ammoShell", 5, 4, 8], ["ammo44", 3, 6, 12], ["pipe_rifle", 2, 1, 1], ["revolver", 1.5, 1, 1], ["pistol", 3, 1, 1], ["shotgun", 1.5, 1, 1], ["jet", 3, 1, 1], ["psycho", 2, 1, 1], ["buffout", 2, 1, 1], ["medx", 2, 1, 1], ["stim", 2, 1, 1], ["leather_armor", 3, 1, 1], ["metal_armor", 1, 1, 1], ["bat", 2, 1, 1], ["machete", 1.5, 1, 1], ["beans", 4, 1, 2], ["jerky", 4, 1, 2], ["repair_kit", 2, 1, 1]],
  bunker: [["ammoRifle", 10, 10, 20], ["ammo9", 8, 12, 24], ["ammoShell", 4, 6, 10], ["ammo44", 4, 6, 12], ["ammoCell", 5, 8, 16], ["combat_armor", 1.2, 1, 1], ["helmet", 2, 1, 1], ["rifle_auto", 1.5, 1, 1], ["smg", 1.5, 1, 1], ["stim", 2, 1, 1], ["repair_kit", 3, 1, 1], ["gasmask", 1, 1, 1]],
  vault: [["caps", 6, 20, 60], ["stim", 8, 1, 2], ["radaway", 6, 1, 2], ["medx", 3, 1, 1], ["jet", 3, 1, 1], ["buffout", 3, 1, 1], ["psycho", 3, 1, 1], ["mentats", 4, 1, 1], ["addictol", 3, 1, 1], ["laser_pistol", 3, 1, 1], ["ammoCell", 8, 10, 24], ["combat_armor", 2, 1, 1], ["hazmat", 2, 1, 1], ["rifle_auto", 1.5, 1, 1], ["ammoRifle", 5, 10, 20], ["water", 5, 1, 3], ["beans", 4, 1, 3], ["repair_kit", 3, 1, 1], ["gasmask", 1.5, 1, 1], ["radx", 4, 1, 1]],
  c_zombie: [["caps", 6, 2, 9], ["cloth", 8, 1, 2], ["scrap", 4, 1, 1], ["candy", 3, 1, 1], ["crackers", 3, 1, 1], ["bandage", 3, 1, 1], ["knife", 1, 1, 1], ["ammo9", 2, 3, 6], ["petfood", 2, 1, 1], ["water", 2, 1, 1], ["beans", 1.5, 1, 1]],
  c_animal: [["meat_raw", 10, 1, 2]],
  c_brahmin: [["meat_raw", 10, 3, 5], ["cloth", 3, 1, 2]],
  c_raider: [["caps", 10, 6, 25], ["ammo9", 8, 4, 10], ["ammoShell", 3, 3, 6], ["ammo44", 3, 3, 6], ["pipe_rifle", 2, 1, 1], ["revolver", 1, 1, 1], ["pistol", 3, 1, 1], ["jet", 2, 1, 1], ["psycho", 1, 1, 1], ["stim", 1.5, 1, 1], ["leather_armor", 3, 1, 1], ["bandage", 4, 1, 2], ["jerky", 3, 1, 1], ["beans", 2, 1, 1], ["scrap", 3, 1, 2], ["cloth", 3, 1, 2], ["bat", 1, 1, 1], ["machete", 1, 1, 1]],
  c_robot: [["caps", 4, 4, 12], ["scrap", 10, 1, 3], ["gears", 8, 1, 2], ["ammoCell", 6, 4, 10], ["repair_kit", 1.5, 1, 1]],
  c_mutant: [["caps", 5, 5, 15], ["meat_raw", 6, 1, 2], ["ammoRifle", 3, 4, 8], ["scrap", 3, 1, 2], ["stim", 1, 1, 1], ["buffout", 1.5, 1, 1], ["cloth", 3, 1, 2], ["machete", 1, 1, 1], ["sledge", 1, 1, 1]],
  c_glow: [["radaway", 5, 1, 1], ["radx", 3, 1, 1], ["scrap", 3, 1, 2], ["cloth", 4, 1, 2], ["ammoCell", 3, 4, 8], ["hazmat", .3, 1, 1]]
};
/* chance of 0,1,2 items (rest = 3). A kind lists the cumulative thresholds. */
const LOOT_CNT = { car: [.35, .8, .95], junk: [.35, .78, .95], rad: [.3, .7, .92], raider: [0, .35, .75], bunker: [0, .3, .7], vault: [0, .2, .6], c_zombie: [.25, .7, .95], c_animal: [0, .5, .95], c_brahmin: [0, 0, .3], c_raider: [.1, .45, .8], c_robot: [.2, .65, .95], c_mutant: [.2, .6, .9], c_glow: [.3, .7, .95] };
const KIND_FLOOR = { house: GR.WOOD, shop: GR.TILEF, clinic: GR.TILEF, police: GR.TILEF, cabin: GR.WOOD, vault: GR.METAL, bunker: GR.METAL };
const KIND_CON = { house: ["crate", "shelf", "fridge"], shop: ["shelf", "shelf", "fridge"], clinic: ["medbox", "medbox", "locker"], police: ["locker", "locker", "crate"], cabin: ["crate", "shelf"], vault: ["locker", "term", "medbox", "term"], bunker: ["ammobox", "locker", "ammobox"] };
function wpick(R, table) {
  let tot = 0; for (const r of table) tot += r[1]; let x = R() * tot;
  for (const r of table) { x -= r[1]; if (x <= 0) return r; } return table[0];
}
function rollLoot(R, kind, lck = 5) {
  const th = LOOT_CNT[kind] || [.14, .6, .88], r0 = R(); let cnt = r0 < th[0] ? 0 : r0 < th[1] ? 1 : r0 < th[2] ? 2 : 3; const out = [];
  if (cnt > 0 && R() < Math.max(0, (lck - 5) * .05)) cnt++;
  for (let i = 0; i < cnt; i++) {
    const r = wpick(R, LOOT[kind] || LOOT.outdoor), o = { id: r[0], n: r[2] + Math.floor(R() * (r[3] - r[2] + 1)) };
    const it = ITEMS[r[0]]; if (it && (it.t === "gun" || it.t === "melee")) o.cond = 30 + Math.floor(R() * 60);
    out.push(o);
  }
  return out;
}

/* ---------- world ---------- */
function genWorld(seed) {
  for (let attempt = 0; attempt < 8; attempt++) { const w = genOnce(seed + attempt * 7919); if (w) { w.seed = seed; return w; } }
  return genOnce(seed);
}
function genOnce(seed) {
  const R = mulberry(seed), N = MW * MH, sd = seed & 1023;
  const ground = new Uint8Array(N), solid = new Uint8Array(N), deco = new Uint8Array(N), occ = new Uint8Array(N), dmap = new Float32Array(N), rad = new Float32Array(N);
  const I = (x, y) => y * MW + x, inb = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH;
  const centers = [{ x: MW * (.3 + .4 * R()), y: MH * (.3 + .4 * R()), s: 30, k: 1.25 }];
  for (let i = 0; i < 5; i++) centers.push({ x: MW * (.08 + .84 * R()), y: MH * (.08 + .84 * R()), s: 9 + R() * 7, k: .65 + R() * .17 });
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    let d = 0; for (const c of centers) d = Math.max(d, c.k * Math.exp(-((x - c.x) ** 2 + (y - c.y) ** 2) / (2 * c.s * c.s)));
    d += (fbm(x * .05, y * .05, sd) - .5) * .35; dmap[I(x, y)] = Math.max(0, Math.min(1, d));
  }
  /* radiation zones in the quiet land */
  const zones = [];
  for (let t = 0; t < 300 && zones.length < 4; t++) {
    const x = 16 + R() * (MW - 32), y = 16 + R() * (MH - 32);
    if (dmap[I(x | 0, y | 0)] > .4 || zones.some(z => Math.hypot(z.x - x, z.y - y) < 42)) continue; zones.push({ x, y, r: 8 + R() * 7 });
  }
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    let m = 0; for (const z of zones) m = Math.max(m, 1 - Math.hypot(x - z.x, y - z.y) / (z.r * (.75 + fbm(x * .09, y * .09, sd + 21) * .6)));
    rad[I(x, y)] = dmap[I(x, y)] > .58 ? 0 : Math.max(0, Math.min(1, m));
  }
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = I(x, y), d = dmap[i];
    if (fbm(x * .035, y * .035, sd + 11) > .66 && d < .33) { ground[i] = GR.LAKE; solid[i] = 1; }
    else if (rad[i] > .22) ground[i] = GR.RADG;
    else if (d < .35 && fbm(x * .12, y * .12, sd + 3) > .64) ground[i] = GR.DIRT;
  }
  const spacing = d => d > .58 ? 14 : d > .3 ? 28 : 0;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = I(x, y); if (ground[i] === GR.LAKE) continue; const d = dmap[i], S = spacing(d); if (!S) continue;
    const rx = x % S, ry = y % S, ix = rx < 3, iy = ry < 3;
    if (ix && iy) ground[i] = GR.ROAD; else if (ix) ground[i] = rx === 1 ? GR.ROADV : GR.ROAD; else if (iy) ground[i] = ry === 1 ? GR.ROADH : GR.ROAD;
    else if (S === 14 && (rx === 3 || ry === 3 || rx === S - 1 || ry === S - 1)) ground[i] = GR.SIDE;
  }
  const containers = [], conMap = new Map(), enemies = [], buildings = [], npcs = []; let conId = 0, enId = 0, npId = 0;
  const mkNpc = (kind, tx, ty, extra) => { const px = tx * TS + 16, py = ty * TS + 16; const o = Object.assign({ id: npId++, kind, x: px, y: py, home: { x: px, y: py }, name: NPC_NAMES[Math.floor(R() * NPC_NAMES.length)], spr: Math.floor(R() * 2), stock: null, cd: 0, wt: R() * 3, hp: NPC_HP[kind], maxhp: NPC_HP[kind], sett: -1, place: "Wanderer" }, extra); npcs.push(o); return o; };
  const addCon = (cx, cy, type, kind, decoId) => { const c = { id: conId++, x: cx, y: cy, type, kind, looted: false, loot: null }; containers.push(c); conMap.set(I(cx, cy), c); solid[I(cx, cy)] = 1; deco[I(cx, cy)] = decoId || CON_DECO[type]; return c; };
  const addEn = (type, x, y, home) => enemies.push({ id: enId++, type, x: x * TS + 16, y: y * TS + 16, home: home ? { x: home[0] * TS + 16, y: home[1] * TS + 16 } : null });
  function placeBuilding(x, y, w, h, kind, wantMax = 6) {
    for (let yy = y - 1; yy <= y + h; yy++) for (let xx = x - 1; xx <= x + w; xx++) {
      if (!inb(xx, yy)) return null; const g = ground[I(xx, yy)];
      if (occ[I(xx, yy)] || g === GR.LAKE || g === GR.ROAD || g === GR.ROADH || g === GR.ROADV) return null;
    }
    for (let yy = y - 1; yy <= y + h; yy++) for (let xx = x - 1; xx <= x + w; xx++) occ[I(xx, yy)] = 1;
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
      const i = I(xx, yy), edge = xx === x || yy === y || xx === x + w - 1 || yy === y + h - 1;
      ground[i] = edge ? GR.WALL : KIND_FLOOR[kind]; solid[i] = edge ? 1 : 0; deco[i] = 0;
    }
    const side = Math.floor(R() * 4); let dx, dy, ix, iy;
    if (side < 2) { dx = x + 1 + Math.floor(R() * (w - 2)); dy = side ? y + h - 1 : y; ix = dx; iy = side ? dy - 1 : dy + 1; }
    else { dy = y + 1 + Math.floor(R() * (h - 2)); dx = side === 3 ? x + w - 1 : x; ix = side === 3 ? dx - 1 : dx + 1; iy = dy; }
    ground[I(dx, dy)] = KIND_FLOOR[kind]; solid[I(dx, dy)] = 0; if (kind === "vault") deco[I(dx, dy)] = DECO.VAULT;
    const cand = [];
    for (let yy = y + 1; yy < y + h - 1; yy++) for (let xx = x + 1; xx < x + w - 1; xx++) {
      const ring = xx === x + 1 || yy === y + 1 || xx === x + w - 2 || yy === y + h - 2; if (!ring) continue;
      if (Math.abs(xx - ix) <= 1 && Math.abs(yy - iy) <= 1) continue; cand.push([xx, yy]);
    }
    let want = Math.max(1, Math.min(wantMax, Math.floor(w * h / 11))), tries = 0;
    while (want > 0 && cand.length && tries++ < 60) {
      const k = Math.floor(R() * cand.length), [cx, cy] = cand.splice(k, 1)[0];
      let ok = true; for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (deco[I(cx + ox, cy + oy)] >= 10) ok = false;
      if (!ok) continue;
      const types = KIND_CON[kind]; addCon(cx, cy, types[Math.floor(R() * types.length)], kind); want--;
    }
    if ((kind === "shop" || kind === "clinic" || kind === "police") && R() < .5) { const sx = x + Math.floor(w / 2), sy = y + Math.floor(h / 2); if (!solid[I(sx, sy)] && !deco[I(sx, sy)]) mkNpc("merchant", sx, sy, { shop: kind === "shop" ? "general" : kind === "clinic" ? "chem" : "arms", place: "Shopkeeper" }); }
    const b = { x, y, w, h, kind }; buildings.push(b); return b;
  }
  const kindFor = d => { const r = R(); return d > .58 ? (r < .38 ? "house" : r < .7 ? "shop" : r < .84 ? "clinic" : "police") : (r < .8 ? "house" : r < .92 ? "shop" : "clinic"); };
  for (let by = 0; by * 14 < MH; by++) for (let bx = 0; bx * 14 < MW; bx++) {
    const ox = bx * 14 + 4, oy = by * 14 + 4, cx = ox + 4, cy = oy + 4; if (!inb(cx, cy)) continue;
    if (dmap[I(cx, cy)] <= .58 || R() > .9) continue;
    const w = 5 + Math.floor(R() * 5), h = 5 + Math.floor(R() * 5);
    placeBuilding(ox + Math.floor(R() * (9 - w + 1)), oy + Math.floor(R() * (9 - h + 1)), w, h, kindFor(dmap[I(cx, cy)]));
  }
  for (let attempts = 0; attempts < 1400; attempts++) {
    const x = 4 + Math.floor(R() * (MW - 12)), y = 4 + Math.floor(R() * (MH - 12)), d = dmap[I(x, y)];
    if (d > .58 || d < .12) continue; const mid = d > .3;
    if (mid && R() > .5) continue; if (!mid && R() > .06) continue;
    const w = 5 + Math.floor(R() * 3), h = 5 + Math.floor(R() * 2);
    placeBuilding(x, y, w, h, mid ? kindFor(d) : "cabin");
  }
  /* vaults (rich, dangerous) and bunkers (military, robots) in the quiet land */
  const vaultN = R() < .5 ? 2 : 1; let vp = 0;
  for (let t = 0; t < 600 && vp < vaultN; t++) {
    const x = 8 + Math.floor(R() * (MW - 24)), y = 8 + Math.floor(R() * (MH - 22)); if (dmap[I(x, y)] > .28) continue;
    const b = placeBuilding(x, y, 11, 9, "vault", 8); if (!b) continue; vp++;
    const n = 5 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) for (let tr = 0; tr < 20; tr++) { const ex = b.x + 2 + Math.floor(R() * (b.w - 4)), ey = b.y + 2 + Math.floor(R() * (b.h - 4)); if (solid[I(ex, ey)]) continue; addEn(wpick(R, [["ghoul", 30], ["glower", 25], ["roach", 10], ["razorclaw", 5], ["brute", 6]])[0], ex, ey, [ex, ey]); break; }
  }
  let bp = 0;
  for (let t = 0; t < 600 && bp < 3; t++) {
    const x = 8 + Math.floor(R() * (MW - 20)), y = 8 + Math.floor(R() * (MH - 18)); if (dmap[I(x, y)] > .42) continue;
    const b = placeBuilding(x, y, 8, 7, "bunker", 5); if (!b) continue; bp++;
    const n = 2 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) for (let tr = 0; tr < 20; tr++) { const ex = b.x + 2 + Math.floor(R() * (b.w - 4)), ey = b.y + 2 + Math.floor(R() * (b.h - 4)); if (solid[I(ex, ey)]) continue; addEn(wpick(R, [["rustbot", 60], ["raider", 20], ["brute", 6]])[0], ex, ey, [ex, ey]); break; }
  }
  /* raider camps: fire, tents, footlockers, armed company */
  /* settlements: walled outposts with merchants, settlers and guards */
  const setts = [];
  for (let t = 0; t < 1200 && setts.length < 3; t++) {
    const sx = 10 + Math.floor(R() * (MW - 30)), sy = 10 + Math.floor(R() * (MH - 28)), d = dmap[I(sx + 7, sy + 6)]; if (d > .55 || d < .08 || rad[I(sx + 7, sy + 6)] > .02) continue;
    if (setts.some(c => Math.hypot(c.x - sx, c.y - sy) < 50)) continue;
    let ok = true; for (let yy = -1; yy <= 13 && ok; yy++) for (let xx = -1; xx <= 15; xx++) { const i = I(sx + xx, sy + yy), g = ground[i]; if (solid[i] || occ[i] || (g !== GR.GRASS && g !== GR.DIRT)) { ok = false; break; } }
    if (!ok) continue; const nm = NPC_NAMES.slice().sort(() => R() - .5); setts.push({ x: sx, y: sy, w: 15, h: 13, name: ["Haven", "Rustwater", "Pine Rest", "Last Light", "Hollow Gate"][setts.length + Math.floor(R() * 2)] });
    for (let yy = -1; yy <= 13; yy++) for (let xx = -1; xx <= 15; xx++) { const i = I(sx + xx, sy + yy); occ[i] = 1; deco[i] = 0; if (xx >= 0 && xx < 15 && yy >= 0 && yy < 13) { const edge = xx === 0 || yy === 0 || xx === 14 || yy === 12; ground[i] = edge ? GR.WALL : GR.DIRT; solid[i] = edge ? 1 : 0; } }
    for (const [gx, gy] of [[7, 0], [6, 0], [8, 0], [7, 12], [6, 12], [8, 12], [0, 6], [14, 6], [0, 5], [14, 5], [0, 7], [14, 7]]) { const i = I(sx + gx, sy + gy); ground[i] = GR.DIRT; solid[i] = 0; }
    deco[I(sx + 7, sy + 7)] = DECO.FIRE;
    const shops = ["general", "arms", "chem"].sort(() => R() - .5), addNpc = (kind, tx, ty, extra) => npcs.push(Object.assign({ id: npId++, hp: NPC_HP[kind], maxhp: NPC_HP[kind], place: setts[setts.length - 1].name, kind, x: (sx + tx) * TS + 16, y: (sy + ty) * TS + 16, home: { x: (sx + tx) * TS + 16, y: (sy + ty) * TS + 16 }, name: nm[npId % nm.length], sett: setts.length - 1, spr: Math.floor(R() * 2), stock: null, cd: 0, wt: R() * 3 }, extra));
    [3, 7, 11].forEach((tx, k) => { solid[I(sx + tx, sy + 2)] = 1; deco[I(sx + tx, sy + 2)] = DECO.STALL; addNpc("merchant", tx, 3, { shop: shops[k] }); });
    addNpc("guard", 3, 6); addNpc("guard", 11, 6); const ns = 2 + Math.floor(R() * 3); for (let k = 0; k < ns; k++) addNpc("settler", 3 + Math.floor(R() * 9), 7 + Math.floor(R() * 4));
  }
  for (let t = 0, got = 0; t < 900 && got < 5; t++) {
    const tx = 12 + Math.floor(R() * (MW - 24)), ty = 12 + Math.floor(R() * (MH - 24)), i = I(tx, ty), g = ground[i]; if (solid[i] || occ[i] || dmap[i] > .6 || rad[i] > .05 || (g !== GR.GRASS && g !== GR.DIRT && g !== GR.ROAD && g !== GR.ROADH && g !== GR.ROADV)) continue;
    if (npcs.some(n => n.roam && Math.hypot(n.x / TS - tx, n.y / TS - ty) < 40)) continue;
    mkNpc("merchant", tx, ty, { shop: ["general", "arms", "chem"][got % 3], roam: true, place: "Wandering trader" }); got++;
  }
  const camps = [];
  for (let t = 0; t < 900 && camps.length < 6; t++) {
    const cx = 10 + Math.floor(R() * (MW - 20)), cy = 10 + Math.floor(R() * (MH - 20)), d = dmap[I(cx, cy)]; if (d > .58 || d < .05) continue;
    if (camps.some(c => Math.hypot(c.x - cx, c.y - cy) < 30) || setts.some(c => Math.hypot(c.x + 7 - cx, c.y + 6 - cy) < 26)) continue;
    let ok = true; for (let yy = -5; yy <= 5 && ok; yy++) for (let xx = -5; xx <= 5; xx++) { const i = I(cx + xx, cy + yy), g = ground[i]; if (solid[i] || occ[i] || (g !== GR.GRASS && g !== GR.DIRT && g !== GR.RADG)) { ok = false; break; } }
    if (!ok) continue; camps.push({ x: cx, y: cy });
    for (let yy = -5; yy <= 5; yy++) for (let xx = -5; xx <= 5; xx++) { const i = I(cx + xx, cy + yy); occ[i] = 1; deco[i] = 0; if (Math.abs(xx) <= 3 && Math.abs(yy) <= 3) ground[i] = GR.DIRT; }
    deco[I(cx, cy)] = DECO.FIRE;
    for (const [ox, oy] of [[-3, -2], [3, -2], [0, 3]]) { if (R() < .85) { solid[I(cx + ox, cy + oy)] = 1; deco[I(cx + ox, cy + oy)] = DECO.TENT; } }
    addCon(cx - 2, cy + 2, "foot", "raider"); addCon(cx + 2, cy + 2, "foot", "raider");
    const n = 3 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) { const a = R() * 6.28, r = 1 + R() * 2; addEn(R() < .6 ? "raider" : "brawler", Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), [cx, cy]); }
  }
  /* open ground: trees, junk, glowing weeds, barrels */
  for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
    const i = I(x, y), g = ground[i]; if (solid[i] || occ[i] || deco[i]) continue; const d = dmap[i], rd = rad[i];
    if (g === GR.GRASS || g === GR.DIRT || g === GR.RADG) {
      if (rd > .22) {
        const q = R(); if (q > .07) continue; const r = R();
        if (r < .3) { deco[i] = DECO.DEAD; solid[i] = 1; } else if (r < .62) deco[i] = DECO.GLOW; else if (r < .74) deco[i] = DECO.BONES; else if (r < .86) deco[i] = DECO.RUBBLE; else if (!conMap.has(i)) addCon(x, y, "barrel", "rad");
        continue;
      }
      let p;
      if (d < .3) { const c = fbm(x * .08, y * .08, sd + 5); p = (c > .5 ? .34 : c > .42 ? .15 : .035) * (1.1 - d); }
      else if (d < .58) p = .045; else p = .008;
      if (R() < p) {
        const r = R();
        if (d < .3) { if (r < .5) { deco[i] = DECO.PINE; solid[i] = 1; } else if (r < .78) { deco[i] = DECO.OAK; solid[i] = 1; } else if (r < .88) { deco[i] = DECO.DEAD; solid[i] = 1; } else if (r < .95) deco[i] = DECO.BUSH; else deco[i] = r < .97 ? DECO.BONES : DECO.RUBBLE; }
        else { if (r < .45) { deco[i] = DECO.OAK; solid[i] = 1; } else if (r < .85) deco[i] = DECO.BUSH; else deco[i] = r < .93 ? DECO.RUBBLE : DECO.BONES; }
      }
    } else if ((g === GR.ROAD || g === GR.ROADH || g === GR.ROADV) && d > .3) {
      const q = R();
      if (q < .022) addCon(x, y, "car", "car", R() < .5 ? DECO.WRECK : DECO.WRECK2); else if (q < .035) deco[i] = DECO.RUBBLE; else if (q < .04) deco[i] = DECO.BONES;
    } else if (g === GR.SIDE && d > .58) {
      const q = R(); if (q < .018) addCon(x, y, "dump", "junk"); else if (q < .022) { deco[i] = DECO.SIGN; solid[i] = 1; } else if (q < .03) deco[i] = DECO.RUBBLE;
    }
  }
  for (let x = 0; x < MW; x++) for (const y of [0, MH - 1]) { solid[I(x, y)] = 1; deco[I(x, y)] = DECO.PINE; }
  for (let y = 0; y < MH; y++) for (const x of [0, MW - 1]) { solid[I(x, y)] = 1; deco[I(x, y)] = DECO.PINE; }
  /* spawn: a clear grass tile on the edge of town or forest, away from radiation and raiders, with a big reachable area around it */
  let spawn = null;
  for (let t = 0; t < 600 && !spawn; t++) {
    const x = 20 + Math.floor(R() * (MW - 40)), y = 20 + Math.floor(R() * (MH - 40)), d = dmap[I(x, y)];
    if (d < .16 || d > .4 || ground[I(x, y)] !== GR.GRASS) continue; let ok = true;
    for (let yy = -1; yy <= 1; yy++) for (let xx = -1; xx <= 1; xx++) if (solid[I(x + xx, y + yy)]) ok = false;
    if (!ok || zones.some(z => Math.hypot(z.x - x, z.y - y) < z.r + 18) || camps.some(c => Math.hypot(c.x - x, c.y - y) < 32) || reach(x, y) < 6000) continue; spawn = { x: x * TS + 16, y: y * TS + 16 };
  }
  if (!spawn) return null;
  function reach(sx, sy) {
    const seen = new Uint8Array(N), q = [I(sx, sy)]; seen[q[0]] = 1; let n = 0;
    while (q.length && n < 6000) { const i = q.pop(); n++; const x = i % MW, y = (i / MW) | 0; for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + ax, ny = y + ay; if (inb(nx, ny)) { const j = I(nx, ny); if (!seen[j] && !solid[j]) { seen[j] = 1; q.push(j); } } } }
    return n;
  }
  const spx = spawn.x / TS, spy = spawn.y / TS;
  const items = []; let itemId = 0;
  for (let y = 2; y < MH - 2; y++) for (let x = 2; x < MW - 2; x++) {
    const i = I(x, y); if (solid[i] || ground[i] === GR.LAKE || occ[i] && ground[i] === GR.DIRT) continue; const d = dmap[i], rd = rad[i] > .22;
    if (R() < (rd ? .004 : d > .3 ? .0034 : .0013)) { const r = wpick(R, rd ? LOOT.rad : LOOT.outdoor), it = { id: itemId++, x: x * TS + 16, y: y * TS + 16, item: r[0], n: r[2] + Math.floor(R() * (r[3] - r[2] + 1)), taken: false }; if (ITEMS[r[0]] && (ITEMS[r[0]].t === "gun" || ITEMS[r[0]].t === "melee")) it.cond = 30 + Math.floor(R() * 60); items.push(it); }
  }
  for (let y = 2; y < MH - 2; y++) for (let x = 2; x < MW - 2; x++) {
    const i = I(x, y), gg = ground[i]; if (solid[i] || gg === GR.LAKE || (occ[i] && gg !== GR.WOOD && gg !== GR.TILEF)) continue; const d = dmap[i], rd = rad[i];
    if (Math.hypot(x - spx, y - spy) < 18 || deco[i] === DECO.VAULT || setts.some(c => Math.hypot(c.x + 7 - x, c.y + 6 - y) < 20)) continue;
    if (R() < (rd > .22 ? .011 : d > .58 ? .03 : d > .3 ? .014 : .0065)) addEn(wpick(R, eTable(d, rd))[0], x, y, null);
  }
  return { seed, ground, solid, deco, occ, dmap, rad, containers, conMap, items, enemies, spawn, camps, buildings, zones, setts, npcs, I };
}
