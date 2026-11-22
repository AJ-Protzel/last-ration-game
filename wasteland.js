/* Last Ration wasteland art pack: new colors, creatures, props, camp structures and item icons.
   Uses the engine in sprites.js (materials, masks, layers, detail pixels). */
Object.assign(BASE, { houndF: "#7a6a58", houndB: "#a08a6a", scorp: "#b08c50", scorpB: "#d8b468", razor: "#6a4a58", razorB: "#a8828f", moleF: "#8a7058", robotB: "#9a8268", robotR: "#7a3a28", plate: "#8a9098", yel: "#d8c030", meatR: "#b04a50", meatC: "#8a4a22", dumpG: "#4a6a4a", barrelR: "#8a4a2a", flame: "#f0a030", gearM: "#7a7e84", bluee: "#4a7ac0" });

SPECS.hound = () => ({
  size: 32, shadow: ELL(16, 28, 11, 2),
  L: [L(OR(SEG(9, 22, 8, 28, 3), SEG(13, 23, 13, 28, 3), SEG(20, 22, 21, 28, 3), SEG(24, 22, 25, 28, 3)), "houndF", { sh: "cyl", cast: false }),
    L(SEG(7, 17, 3, 12, 2.4), "houndF", { sh: "cyl" }), L(ELL(15, 19, 9, 5.6), "houndF", { tex: .3, seed: 3 }),
    L(ELL(24, 15.5, 4.8, 4.4), "houndF", { tex: .2, seed: 5 }), L(OR(POLY([[22, 11], [22, 6], [25, 10]]), POLY([[26, 11], [28, 7], [29, 12]])), "houndF"),
    L(ELL(28, 17.5, 3, 2.2), "houndB", { sh: "flat" })],
  D: [[25, 14, "#ffe040"], [26, 14, "#ffe040"], [30, 17, "#201418"], [27, 19, "#f0f0e0"], [29, 19, "#f0f0e0"], ...scat(8, 8, 15, 22, 22, "houndB:1", 3, ELL(15, 19, 8, 5)), ...scat(6, 8, 15, 22, 22, "houndF:4", 4, ELL(15, 19, 8, 5)), [12, 16, "#a02828"], [13, 17, "#a02828"]]
});
SPECS.burrower = () => ({
  size: 32, shadow: ELL(16, 27, 10, 2),
  L: [L(OR(SEG(11, 24, 11, 28, 2.6), SEG(20, 24, 21, 28, 2.6)), "moleF", { sh: "cyl", cast: false }), L(ELL(15, 21, 8.5, 5.4), "moleF", { tex: .3, seed: 2 }), L(ELL(23, 19, 5, 4.4), "moleF", { tex: .2, seed: 3 }),
    L(ELL(28, 20, 2.4, 1.8), "cheek", { sh: "flat" }), L(SEG(8, 21, 3, 25, 1.6), "cheek", { sh: "flat", cast: false })],
  D: [[24, 17, "#101010"], [25, 17, "#101010"], [27, 22, "#ffffff"], [28, 22, "#ffffff"], [30, 20, "#401818"], [11, 29, "#e8e0c8"], [12, 29, "#e8e0c8"], [20, 29, "#e8e0c8"], [21, 29, "#e8e0c8"], ...scat(5, 8, 18, 22, 24, "moleF:4", 6, ELL(15, 21, 8, 5))]
});
SPECS.scorpion = () => ({
  size: 32, shadow: ELL(16, 27, 13, 2.4),
  L: [L(OR(SEG(9, 21, 4, 26, 1.6), SEG(12, 23, 9, 28, 1.6), SEG(16, 23, 15, 29, 1.6), SEG(21, 22, 23, 28, 1.6)), "scorp", { sh: "shade", cast: false }),
    L(OR(SEG(9, 20, 5, 11, 2.6), SEG(5, 11, 8, 5, 2.4), SEG(8, 5, 12, 6, 2.2)), "scorp", { sh: "cyl" }), L(POLY([[11, 5], [14, 8], [12, 9]]), "scorpB", { sh: "flat" }),
    L(ELL(16, 19, 9, 5.6), "scorp", { tex: .3, seed: 4 }), L(ELL(24, 18, 4.4, 4), "scorp", { tex: .2, seed: 6 }),
    L(OR(SEG(27, 17, 30, 14, 2.2), SEG(27, 21, 30, 24, 2.2)), "scorpB", { sh: "cyl" })],
  D: [[24, 16, "#ffd040"], [26, 16, "#ffd040"], [11, 6, "#b8ff40"], [13, 12, "scorp:4"], [14, 15, "scorp:4"], [17, 14, "scorp:4"], [20, 15, "scorp:4"], [13, 17, "scorp:1"], [18, 16, "scorp:1"], [30, 13, "scorpB:0"], [30, 25, "scorpB:0"]]
});
SPECS.razorclaw = () => ({
  size: 32, shadow: ELL(16, 29, 13, 2),
  L: [L(OR(SEG(11, 23, 10, 29, 4), SEG(20, 23, 21, 29, 4)), "razor", { sh: "cyl", cast: false }), L(SEG(8, 19, 2, 24, 3.2), "razor", { sh: "cyl" }),
    L(ELL(15, 18, 8.8, 7.8), "razor", { tex: .35, seed: 4 }), L(OR(SEG(20, 18, 26, 22, 3.4), SEG(18, 21, 24, 26, 3)), "razor", { sh: "cyl" }),
    L(ELL(21, 10, 5, 4.6), "razor", { tex: .2, seed: 6 }), L(OR(POLY([[17, 7], [15, 1], [20, 6]]), POLY([[22, 6], [26, 1], [25, 8]])), "bone", { cast: false }),
    L(ELL(26, 12, 3.4, 2.6), "razorB", { sh: "flat" }), L(OR(POLY([[24, 22], [30, 24], [24, 25]]), POLY([[22, 26], [28, 29], [22, 28]])), "bone", { sh: "flat", cast: false })],
  D: [[21, 9, "#ff3020"], [22, 9, "#ff8040"], [27, 14, "#f0f0e0"], [25, 14, "#f0f0e0"], [28, 12, "#201418"], [12, 15, "razor:4"], [14, 12, "razor:4"], [16, 14, "razor:4"], [10, 19, "razor:4"], [14, 20, "razor:1"], [18, 17, "razor:1"], [13, 13, "razorB:1"], [15, 22, "razorB:1"]]
});
SPECS.rustbot = () => ({
  size: 32, shadow: ELL(16, 29, 10, 2),
  L: [L(OR(ELL(10.5, 27, 3.4, 2.6), ELL(21.5, 27, 3.4, 2.6)), "grip"), L(RECT(10, 15, 21, 25), "robotB", { tex: .25, seed: 3 }), L(ELL(16, 15, 7, 2), "plate", { sh: "hi" }),
    L(OR(SEG(8, 17, 4, 23, 2.4), SEG(24, 17, 28, 21, 2.4)), "plate", { sh: "cyl" }), L(ELL(16, 9.5, 5.4, 4.6), "plate", { sh: "round" }), L(SEG(16, 5, 18, 1, 1.2), "dmetal", { sh: "flat", cast: false }),
    L(OR(POLY([[26, 19], [30, 18], [29, 21]]), POLY([[26, 23], [30, 23], [28, 25]])), "metal", { sh: "flat", cast: false })],
  D: [[14, 9, "#ff4030"], [15, 9, "#ff4030"], [17, 9, "#ff4030"], [18, 9, "#ff4030"], [14, 10, "#801810"], [18, 10, "#801810"], [18, 1, "#ff4030"], [12, 18, "robotR:2"], [13, 19, "robotR:2"], [19, 21, "robotR:2"], [11, 22, "robotR:3"], [20, 17, "robotR:2"], [13, 17, "robotB:0"], [17, 17, "robotB:0"], [12, 24, "robotB:4"], [20, 24, "robotB:4"], [16, 20, "#ffd040"], [16, 21, "#ffd040"]]
});

/* ---------- props ---------- */
SPECS.p_rubble = () => ({ size: 32, shadow: null, L: [L(OR(ELL(12, 24, 6, 3.6), ELL(20, 25, 7, 3.4), ELL(16, 22, 5, 3.4)), "sidew", { tex: .5, seed: 2 }), L(RECT(15, 19, 20, 22), "brick", { tex: .3 })], D: [[11, 22, "sidew:0"], [22, 24, "sidew:4"], [17, 20, "brick:0"], [9, 25, "sidew:4"]] });
SPECS.p_bones = () => ({ size: 32, shadow: null, L: [L(ELL(14, 25, 4.4, 3.6), "bone", { sh: "round" }), L(OR(SEG(19, 23, 26, 25, 1.4), SEG(19, 26, 27, 27, 1.4), SEG(20, 28, 25, 29, 1.2)), "bone", { sh: "flat", cast: false })], D: [[12, 25, "#1a1210"], [15, 25, "#1a1210"], [13, 27, "bone:4"], [14, 27, "bone:4"]] });
SPECS.p_sign = () => ({ size: 32, shadow: ELL(16, 29, 7, 1.6), L: [L(RECT(14, 14, 17, 29), "dmetal", { sh: "cyl" }), L(RECT(4, 3, 27, 15), "labelR", { tex: .1 }), L(RECT(6, 5, 25, 13), "paper", { sh: "flat", cast: false })], D: [[8, 8, "red:3"], [9, 8, "red:3"], [10, 8, "red:3"], [8, 9, "red:3"], [12, 7, "red:3"], [12, 8, "red:3"], [12, 9, "red:3"], [13, 8, "red:3"], [14, 8, "red:3"], [16, 7, "red:3"], [17, 8, "red:3"], [18, 9, "red:3"], [20, 7, "red:3"], [20, 8, "red:3"], [20, 9, "red:3"], [22, 8, "red:3"], [23, 8, "red:3"], [7, 12, "red:1"], [24, 12, "red:1"], [5, 4, "labelR:0"], [26, 4, "labelR:0"]] });
SPECS.c_dump = () => ({ size: 32, shadow: ELL(16, 28, 12, 2.2), L: [L(RECT(5, 12, 26, 26), "dumpG", { tex: .15, seed: 7 }), L(RECT(4, 9, 27, 13), "dumpG", { sh: "hi", cast: false }), L(OR(ELL(8, 27, 2, 1.4), ELL(23, 27, 2, 1.4)), "grip")], D: [[10, 18, "dumpG:4"], [11, 19, "dumpG:4"], [20, 17, "dumpG:4"], [14, 22, "rust:2"], [15, 23, "rust:2"], [22, 21, "rust:2"], [5, 10, "dumpG:0"], [6, 10, "dumpG:0"], [9, 6, "cloth:2"], [10, 7, "cloth:1"], [20, 7, "paper:1"]] });
SPECS.c_barrel = () => ({ size: 32, shadow: ELL(16, 28, 7, 1.8), L: [L(RECT(10, 9, 22, 27), "barrelR", { sh: "cyl", tex: .1 }), L(ELL(16, 9, 6.4, 2.2), "dmetal", { sh: "hi", cast: false })], D: [...[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(x => [x, 14, "barrelR:4"]), [16, 19, "yel:2"], [15, 20, "yel:2"], [17, 20, "yel:2"], [16, 21, "yel:2"], [14, 21, "yel:2"], [18, 21, "yel:2"], [13, 11, "#ffffff"], [12, 12, "#ffffff"], [12, 27, "glow:2"], [13, 28, "glow:2"], [11, 28, "glow:1"], [20, 20, "glow:1"], [20, 21, "glow:2"], [20, 22, "glow:1"]] });
SPECS.c_foot = () => ({ size: 32, shadow: ELL(16, 27, 11, 2), L: [L(RECT(6, 15, 25, 25), "dwood", { tex: .2 }), L(RECT(6, 12, 25, 16), "dwood", { sh: "hi", cast: false }), L(OR(RECT(9, 12, 10, 25), RECT(21, 12, 22, 25)), "dmetal", { sh: "flat", cast: false })], D: [[15, 18, "metal:1"], [16, 18, "metal:1"], [15, 19, "metal:3"], [16, 19, "metal:3"], [8, 13, "dwood:0"], [9, 13, "dwood:0"], [12, 21, "dwood:4"]] });
SPECS.c_ammobox = () => ({ size: 32, shadow: ELL(16, 27, 11, 2), L: [L(RECT(6, 13, 25, 25), "kevlar", { tex: .1 }), L(RECT(6, 10, 25, 14), "kevlar", { sh: "hi", cast: false })], D: [[9, 18, "yel:1"], [10, 18, "yel:1"], [11, 18, "yel:1"], [13, 18, "yel:1"], [14, 18, "yel:1"], [16, 18, "yel:1"], [17, 18, "yel:1"], [18, 18, "yel:1"], [9, 21, "yel:1"], [10, 21, "yel:1"], [12, 21, "yel:1"], [13, 21, "yel:1"], [21, 12, "dmetal:2"], [22, 12, "dmetal:2"], [8, 11, "kevlar:0"]] });
SPECS.c_term = () => ({ size: 32, shadow: ELL(16, 28, 10, 2), L: [L(RECT(7, 6, 24, 27), "dmetal", { tex: .06 }), L(RECT(10, 9, 21, 16), "dwood", { sh: "deep", cast: false })], D: [[11, 10, "glow:1"], [12, 10, "glow:1"], [13, 10, "glow:1"], [11, 12, "glow:2"], [12, 12, "glow:2"], [14, 12, "glow:2"], [15, 12, "glow:2"], [11, 14, "glow:2"], [13, 14, "glow:2"], [12, 20, "metal:1"], [13, 20, "metal:1"], [18, 20, "bluee:2"], [19, 20, "bluee:2"], [12, 23, "yel:2"], [13, 23, "yel:2"], [14, 23, "yel:2"], [8, 7, "dmetal:0"]] });
SPECS.p_tent = () => ({ size: 32, shadow: ELL(16, 27, 13, 2.4), L: [L(POLY([[16, 5], [4, 26], [28, 26]]), "canvas", { tex: .2, seed: 2 }), L(POLY([[16, 5], [16, 26], [28, 26]]), "canvas", { sh: "shade", cast: false }), L(POLY([[16, 13], [12, 26], [20, 26]]), "dwood", { sh: "deep", cast: false })], D: [[16, 4, "dwood:2"], [16, 3, "dwood:2"], [9, 22, "canvas:4"], [10, 21, "canvas:4"], [22, 21, "rust:2"], [23, 22, "rust:2"], [14, 11, "canvas:0"]] });
SPECS.s_campfire = () => ({ size: 32, shadow: null, L: [L(OR(SEG(9, 25, 23, 22, 3), SEG(9, 22, 23, 25, 3)), "dwood", { sh: "cyl" }), L(OR(POLY([[16, 8], [11, 21], [21, 21]]), POLY([[12, 14], [9, 22], [15, 22]]), POLY([[20, 13], [17, 22], [23, 22]])), "flame", { sh: "hi", cast: false })], D: [[16, 14, "#fff2a0"], [16, 15, "#fff2a0"], [15, 17, "#fff2a0"], [16, 18, "#fff2a0"], [17, 17, "#ffe070"], [16, 11, "#ffd060"], [13, 18, "#ff7020"], [19, 18, "#ff7020"], [12, 20, "#ff6010"], [20, 20, "#ff6010"], [14, 6, "#6a6a6a"], [18, 4, "#6a6a6a"]] });
SPECS.p_vault = () => ({ size: 32, shadow: null, L: [L(ELL(16, 17, 13, 12), "steel", { tex: .08 }), L(ELL(16, 17, 8.6, 7.6), "dmetal", { sh: "deep", cast: false }), L(ELL(16, 17, 4, 3.6), "yel", { sh: "flat", cast: false })], D: [[16, 5, "yel:1"], [16, 29, "yel:1"], [4, 17, "yel:1"], [28, 17, "yel:1"], [13, 16, "dmetal:4"], [14, 16, "dmetal:4"], [16, 16, "dmetal:4"], [18, 16, "dmetal:4"], [19, 16, "dmetal:4"], [13, 17, "dmetal:4"], [16, 17, "dmetal:4"], [19, 17, "dmetal:4"], [13, 18, "dmetal:4"], [14, 18, "dmetal:4"], [16, 18, "dmetal:4"], [18, 18, "dmetal:4"], [19, 18, "dmetal:4"]] });
SPECS.p_glow = () => ({ size: 32, shadow: null, L: [L(OR(SEG(11, 27, 11, 21, 1.4), SEG(17, 27, 17, 18, 1.4), SEG(22, 27, 22, 22, 1.4)), "green", { sh: "flat", cast: false }), L(OR(ELL(11, 20, 3.4, 2.4), ELL(17, 17, 4, 2.8), ELL(22, 21, 3, 2.2)), "glow", { sh: "round", cast: false })], D: [[10, 19, "#ffffff"], [16, 16, "#ffffff"], [21, 20, "#ffffff"], [8, 17, "glow:1"], [20, 14, "glow:1"], [25, 18, "glow:1"], [13, 14, "glow:0"]] });

/* ---------- camp structures ---------- */
SPECS.s_workbench = () => ({ size: 32, shadow: ELL(16, 28, 12, 2), L: [L(OR(RECT(5, 14, 7, 27), RECT(24, 14, 26, 27)), "dwood", { sh: "cyl" }), L(RECT(4, 10, 27, 16), "wood", { tex: .15 }), L(RECT(4, 8, 27, 11), "wood", { sh: "hi", cast: false }), L(RECT(8, 20, 23, 22), "dwood", { sh: "deep", cast: false })],
  D: [[8, 7, "metal:2"], [9, 7, "metal:2"], [10, 6, "metal:1"], [18, 7, "dmetal:2"], [19, 6, "dmetal:2"], [20, 5, "dmetal:1"], [14, 8, "red:2"], [15, 8, "red:2"], [22, 9, "gearM:2"], [23, 9, "gearM:2"]] });
SPECS.s_stash = () => ({ size: 32, shadow: ELL(16, 27, 11, 2), L: [L(RECT(6, 14, 25, 26), "wood", { tex: .15 }), L(ELL(16, 14, 9.6, 4.6), "wood", { sh: "hi", cast: false }), L(OR(RECT(9, 11, 10, 26), RECT(21, 11, 22, 26)), "dmetal", { sh: "flat", cast: false })], D: [[15, 17, "yel:1"], [16, 17, "yel:1"], [15, 18, "yel:3"], [16, 18, "yel:3"], [13, 20, "wood:4"], [18, 21, "wood:4"], [12, 11, "wood:0"]] });
SPECS.s_bed = () => ({ size: 32, shadow: ELL(16, 28, 12, 2), L: [L(OR(RECT(5, 22, 6, 27), RECT(25, 22, 26, 27)), "dmetal", { sh: "cyl" }), L(RECT(5, 14, 26, 23), "bluee", { tex: .08 }), L(RECT(5, 11, 12, 16), "paper", { sh: "hi" }), L(RECT(13, 14, 26, 23), "bandage", { tex: .12, seed: 3 })], D: [[16, 17, "bandage:0"], [20, 19, "bandage:3"], [24, 21, "bandage:3"], [8, 12, "#ffffff"]] });
SPECS.s_turret = () => ({ size: 32, shadow: ELL(16, 28, 9, 2), L: [L(OR(SEG(16, 20, 10, 28, 2), SEG(16, 20, 22, 28, 2), SEG(16, 20, 16, 28, 2)), "dmetal", { sh: "flat", cast: false }), L(ELL(16, 16, 6.4, 5.4), "steel", { tex: .1 }), L(RECT(18, 14, 30, 17), "dmetal", { sh: "cyl" })], D: [[13, 13, "steel:0"], [14, 12, "steel:0"], [16, 17, "#ff4030"], [30, 15, "dmetal:5"]] });

/* ---------- more item icons ---------- */
const _inj = (id, col) => { SPECS["i_" + id] = () => ({ size: 32, shadow: ELL(16, 27, 6, 1.6), L: [L(RECT(12, 10, 19, 25), "glass", { sh: "cyl", tex: .02 }), L(RECT(12, 14, 19, 24), col, { sh: "cyl", cast: false }), L(RECT(10, 9, 21, 11), "metal", { sh: "flat" }), L(RECT(15, 4, 16, 9), "metal", { sh: "flat", cast: false }), L(RECT(15, 25, 16, 29), "metal", { sh: "flat", cast: false })], D: [[13, 12, "#ffffff"], [13, 16, "#ffffff"]] }); };
_inj("stim", "#d84a5a"); _inj("jet", "#e8c040"); _inj("buffout", "#d86a30"); _inj("psycho", "#9a50d0"); _inj("mentats", "#4a9ad8"); _inj("medx", "#e8a8c0"); _inj("radx", "#b8e040"); _inj("addictol", "#e8e8e0");
SPECS.i_scrap = () => ({ size: 32, shadow: ELL(16, 26, 11, 1.8), L: [L(POLY([[6, 22], [11, 12], [20, 14], [18, 24]]), "plate", { tex: .2, seed: 2 }), L(POLY([[14, 24], [19, 14], [27, 17], [26, 25]]), "rust", { tex: .25, seed: 5 }), L(RECT(10, 20, 15, 23), "dmetal", { sh: "shade" })], D: [[12, 14, "#ffffff"], [13, 14, "#ffffff"], [22, 16, "rust:0"], [18, 20, "rust:4"], [9, 21, "plate:4"], [25, 21, "rust:4"]] });
SPECS.i_wood = () => ({ size: 32, shadow: ELL(16, 27, 11, 1.8), L: [L(RELL(16, 22, 11, 2.6, -.05), "wood", { sh: "cyl", tex: .1 }), L(RELL(15, 17, 11, 2.6, .06), "wood", { sh: "cyl", tex: .1, seed: 3 }), L(RELL(17, 12, 10, 2.6, -.1), "wood", { sh: "cyl", tex: .1, seed: 5 })], D: [[8, 22, "wood:4"], [24, 17, "wood:4"], [20, 12, "wood:0"], [12, 17, "wood:0"], [18, 22, "wood:0"]] });
SPECS.i_cloth = () => ({ size: 32, shadow: ELL(16, 26, 10, 1.8), L: [L(RECT(7, 14, 25, 24), "cloth", { tex: .1 }), L(RECT(7, 10, 25, 15), "canvas", { sh: "hi", tex: .1, cast: false })], D: [[9, 18, "cloth:3"], [12, 18, "cloth:3"], [15, 18, "cloth:3"], [18, 18, "cloth:3"], [21, 18, "cloth:3"], [8, 12, "#ffffff"], [10, 21, "cloth:4"], [20, 22, "cloth:4"]] });
SPECS.i_gears = () => ({ size: 32, shadow: ELL(16, 27, 9, 1.6), L: [L(OR(RECT(14, 6, 17, 26), RECT(6, 14, 26, 17), SEG(8, 8, 24, 24, 3), SEG(24, 8, 8, 24, 3)), "gearM", { sh: "flat" }), L(ELL(16, 16, 8, 8), "gearM", { tex: .05 }), L(ELL(16, 16, 3, 3), "dmetal", { sh: "deep", cast: false })], D: [[11, 11, "#ffffff"], [12, 10, "#ffffff"], [20, 20, "gearM:4"]] });
SPECS.i_repair_kit = () => ({ size: 32, shadow: ELL(16, 27, 11, 2), L: [L(RECT(5, 12, 26, 25), "orange", { tex: .06 }), L(RECT(11, 8, 20, 12), "dmetal", { sh: "flat" }), L(SEG(9, 21, 22, 15, 2.4), "metal", { sh: "cyl", cast: false })], D: [[22, 14, "metal:0"], [23, 15, "metal:0"], [7, 13, "#ffffff"], [8, 13, "#ffffff"]] });
SPECS.i_meat_raw = () => ({ size: 32, shadow: ELL(16, 26, 10, 1.8), L: [L(POLY([[7, 18], [12, 11], [22, 11], [26, 18], [22, 24], [11, 24]]), "meatR", { tex: .25, seed: 3 }), L(ELL(21, 12, 3.4, 2.4), "bone", { sh: "flat", cast: false })], D: [[11, 15, "#ffd8d0"], [12, 15, "#ffd8d0"], [15, 19, "meatR:4"], [17, 20, "meatR:4"], [19, 16, "#ffd8d0"]] });
SPECS.i_meat = () => ({ size: 32, shadow: ELL(16, 26, 10, 1.8), L: [L(POLY([[7, 18], [12, 11], [22, 11], [26, 18], [22, 24], [11, 24]]), "meatC", { tex: .25, seed: 3 }), L(ELL(21, 12, 3.4, 2.4), "bone", { sh: "flat", cast: false })], D: [[11, 15, "meatC:0"], [12, 15, "meatC:0"], [15, 19, "meatC:4"], [17, 20, "meatC:4"], [19, 16, "meatC:0"], [14, 14, "meatC:4"], [16, 14, "meatC:4"]] });
const _vest = (id, mat, extra) => { SPECS["i_" + id] = () => ({ size: 32, shadow: ELL(16, 28, 10, 1.6), L: [L(POLY([[9, 7], [13, 5], [19, 5], [23, 7], [27, 13], [23, 16], [22, 27], [10, 27], [9, 16], [5, 13]]), mat, { tex: .12, seed: 3 }), L(ELL(16, 6.4, 3.4, 1.6), "dwood", { sh: "deep", cast: false })], D: [[12, 12, "#ffffff"], [13, 11, "#ffffff"], [16, 14, mat + ":4"], [16, 18, mat + ":4"], [16, 22, mat + ":4"], ...(extra || [])] }); };
_vest("leather_armor", "leath", [[11, 20, "leath:0"], [20, 22, "leath:0"]]); _vest("metal_armor", "plate", [[11, 20, "plate:0"], [21, 20, "plate:3"], [10, 24, "rust:2"]]); _vest("combat_armor", "kevlar", [[11, 20, "kevlar:0"], [14, 24, "yel:2"], [18, 24, "yel:2"]]); _vest("hazmat", "yel", [[16, 16, "#2a1a22"], [15, 17, "#2a1a22"], [17, 17, "#2a1a22"], [16, 19, "#2a1a22"]]);
SPECS.i_hardhat = () => ({ size: 32, shadow: ELL(16, 26, 10, 1.6), L: [L(RECT(5, 19, 27, 22), "yel", { sh: "hi" }), L(ELL(16, 19, 9.4, 8), "yel", { tex: .05 }), L(RECT(15, 10, 17, 19), "yel", { sh: "shade", cast: false })], D: [[11, 14, "#ffffff"], [12, 13, "#ffffff"], [8, 21, "yel:4"], [24, 21, "yel:4"]] });
SPECS.i_helmet = () => ({ size: 32, shadow: ELL(16, 26, 10, 1.6), L: [L(ELL(16, 18, 9.6, 9), "kevlar", { tex: .1 }), L(RECT(6, 19, 26, 24), "kevlar", { sh: "shade", cast: false }), L(RECT(10, 19, 22, 21), "dwood", { sh: "deep", cast: false })], D: [[11, 12, "#ffffff"], [12, 11, "#ffffff"], [16, 11, "kevlar:4"], [16, 13, "kevlar:4"]] });
SPECS.i_gasmask = () => ({ size: 32, shadow: ELL(16, 27, 9, 1.6), L: [L(ELL(16, 15, 8.6, 9.6), "kevlar", { tex: .08 }), L(ELL(16, 22, 5, 4.4), "grip", { sh: "round" }), L(OR(ELL(11, 14, 2.8, 2.6), ELL(21, 14, 2.8, 2.6)), "glass", { sh: "flat", cast: false })], D: [[11, 14, "#101018"], [21, 14, "#101018"], [10, 13, "#ffffff"], [20, 13, "#ffffff"], [14, 22, "dmetal:2"], [16, 22, "dmetal:2"], [18, 22, "dmetal:2"]] });
_gun("revolver", [L(RECT(14, 10, 28, 13), "metal", { tex: .05 }), L(ELL(13, 13, 4.2, 3.6), "dmetal"), L(POLY([[6, 14], [11, 14], [10, 24], [5, 24]]), "wood", { tex: .1 }), L(RECT(14, 13, 17, 16), "dmetal")], [[14, 10, "metal:0"], [15, 10, "metal:0"], [28, 11, "dmetal:4"], [12, 11, "#ffffff"]]);
_gun("pipe_rifle", [L(SEG(4, 22, 12, 18, 4), "wood", { sh: "cyl", tex: .15 }), L(SEG(10, 17, 30, 13, 2.8), "dmetal", { sh: "cyl" }), L(RECT(10, 16, 15, 21), "rust", { sh: "flat" }), L(RECT(15, 16, 18, 19), "grip")], [[17, 16, "yel:2"], [18, 15, "yel:2"], [28, 13, "dmetal:5"], [13, 17, "rust:4"]]);
_gun("laser_pistol", [L(RECT(7, 10, 25, 16), "plate", { tex: .05 }), L(POLY([[7, 16], [13, 16], [12, 25], [6, 25]]), "grip"), L(RECT(25, 11, 30, 14), "dmetal", { sh: "flat" }), L(RECT(12, 11, 20, 13), "glow", { sh: "flat", cast: false })], [[8, 10, "plate:0"], [9, 10, "plate:0"], [26, 12, "#d8ffd0"], [29, 12, "glow:2"], [18, 15, "glow:1"]]);
_gun("sledge", [L(SEG(6, 27, 21, 11, 3), "wood", { sh: "cyl", tex: .1 }), L(RECT(17, 4, 29, 11), "dmetal", { tex: .05 }), L(RECT(17, 4, 29, 6), "metal", { sh: "hi", cast: false })], [[19, 5, "#ffffff"], [20, 5, "#ffffff"], [28, 9, "dmetal:5"], [6, 26, "wood:4"]]);
_ammo("ammo44", "orange"); _ammo("ammoCell", "glow");

/* ---------- settlement folk ---------- */
Object.assign(BASE, { tan: "#c89468", brown: "#8a5a3a", hairG: "#8a8a84", hairY: "#c8a050", shirtG: "#6a8a58", shirtR: "#a8503a", shirtT: "#b8a070", capsB: "#c8b8a0", awn1: "#c04a38", awn2: "#e8dcc0" });
SPECS.p_stall = () => ({ size: 32, shadow: ELL(16, 28, 13, 2), L: [L(OR(RECT(4, 12, 5, 28), RECT(26, 12, 27, 28)), "dwood", { sh: "cyl" }), L(RECT(4, 18, 27, 26), "wood", { tex: .15 }), L(RECT(2, 6, 29, 13), "awn1", { tex: .08 }), L(OR(RECT(6, 6, 9, 13), RECT(14, 6, 17, 13), RECT(22, 6, 25, 13)), "awn2", { sh: "flat", cast: false })], D: [[8, 20, "red:2"], [9, 20, "red:2"], [14, 21, "yel:2"], [15, 21, "yel:2"], [20, 20, "bluee:2"], [21, 20, "bluee:2"], [18, 22, "canvas:1"], [3, 7, "awn1:0"], [28, 7, "awn1:0"]] });
SPECS.i_caps = () => ({ size: 32, shadow: ELL(16, 26, 9, 1.6), L: [L(ELL(12, 20, 6.4, 5), "capsB", { tex: .1 }), L(ELL(20, 18, 6.4, 5), "red", { tex: .1 }), L(ELL(16, 22, 5.4, 4), "yel", { tex: .1 })], D: [[10, 18, "#ffffff"], [18, 16, "#ffffff"], [14, 20, "yel:0"], [20, 21, "capsB:4"], [12, 22, "capsB:4"], [22, 17, "red:4"]] });

/* ======================================================================
   Lithe people: a slimmer, more pixel-crisp humanoid (about 4.5 heads tall).
   Replaces the chunky recipe in sprites.js for the player, undead, raiders and townsfolk.
   ====================================================================== */
function humanoid(o) {
  const w = o.w || 1, hy = o.hunch || 0, aY = o.armsOut ? 15.5 : 20, aEx = o.armsOut ? 2.6 : 0, cx = 16;
  const head = ELL(cx, 6.2 + hy, 2.5, 3.0), torso = OR(SUP(cx, 15.2, 3.2 * w, 5, 0, 3), RECT(Math.round(cx - 3 * w), 18, Math.round(cx + 3 * w) - 1, 19));
  const L_ = [];
  if (o.pack) L_.push(L(ELL(cx + 3.9, 15.5, 1.5, 3), "pack", { tex: .05, seed: 3 }));
  L_.push(L(OR(SEG(14.8, 19, 14.2, 28, 2), SEG(17.2, 19, 17.8, 28, 2)), o.pants, { sh: "cyl" }),
    L(OR(ELL(13.8, 28.8, 2, 1), ELL(18.2, 28.8, 2, 1)), "boot", { sh: "flat" }),
    L(SEG(cx + 3.6 * w, 11.5 + hy, cx + 4 * w + aEx, aY, 1.7), o.top, { sh: "cyl" }),
    L(torso, o.top, { tex: o.ragged ? .25 : 0, seed: 4 }),
    L(RECT(15, 9 + hy, 16, 10 + hy), o.skin, { sh: "shade", cast: false }));
  if (o.belly) L_.push(L(ELL(cx, 17.5, 3 * w, 2.6), o.top, { sh: "shade", cast: false }));
  L_.push(L(head, o.skin, { sh: "flat" }), L(AND(head, NOT(ELL(cx - .8, 6, 2.5, 2.9))), o.skin, { sh: "shade", cast: false }));
  const hs = o.hairStyle || "short";
  if (o.hair && hs === "short") L_.push(L(AND(ELL(cx, 4.9 + hy, 2.9, 2.8), (x, y) => y < 5.6 + hy), o.hair, { sh: "flat", cast: false }));
  if (o.hair && hs === "mohawk") L_.push(L(RECT(15, 0, 16, 4 + hy), o.hair, { sh: "flat", cast: false }));
  if (o.hair && hs === "long") L_.push(L(AND(ELL(cx, 5.4 + hy, 3, 3.3), (x, y) => y < 6.6 + hy || x < 14 || x > 17), o.hair, { sh: "flat", cast: false }));
  if (o.helmet) L_.push(L(AND(ELL(cx, 5.6 + hy, 3, 3.2), (x, y) => y < 6.8 + hy), o.helmet, { sh: "round" }));
  if (o.hat) L_.push(L(RECT(12, 3 + hy, 19, 3 + hy), o.hat, { sh: "flat" }), L(AND(ELL(cx, 3.4 + hy, 2.6, 2), (x, y) => y < 3.4 + hy), o.hat, { sh: "round", cast: false }));
  if (o.scarf) L_.push(L(RECT(14, 10 + hy, 17, 10 + hy), o.scarf, { sh: "flat" }));
  L_.push(L(SEG(cx - 3.6 * w, 11.5 + hy, cx - 4 * w - aEx, aY, 1.7), o.top, { sh: "cyl" }), L(OR(ELL(cx - 4.1 * w - aEx, aY + .9, 1.1, 1.1), ELL(cx + 4.1 * w + aEx, aY + .9, 1.1, 1.1)), o.skin, { sh: "flat" }));
  if (o.armor) L_.push(L(OR(ELL(cx - 3.7 * w, 11.4 + hy, 1.7, 1.3), ELL(cx + 3.7 * w, 11.4 + hy, 1.7, 1.3)), o.armorC || "armor", { sh: "hi" }));
  const ec = o.eyeC || "eye:2", ey = 6 + hy, D = [[15, ey, ec], [17, ey, ec]];
  if (o.ragged) D.push([14, 14, "#7a1a1a"], [18, 17, o.top + ":4"]);
  if (o.keepExtra && o.extra) D.push(...o.extra);
  return { size: 32, shadow: ELL(16, 29.4, 8 * w, 1.6), L: L_, D };
}
SPECS.player = () => humanoid({ skin: "skin", hair: "hairB", top: "vaultB", pants: "vaultP", scarf: "bandana", pack: true, extra: [[11, 19, "bandana:2"], [21, 19, "bandana:2"], [16, 14, "bandana:1"], [16, 15, "bandana:1"], [16, 16, "bandana:2"], [12, 20, "vaultB:4"], [20, 20, "vaultB:4"]] });
SPECS.shambler = () => humanoid({ skin: "zskin", hair: "zhair", top: "rag", pants: "rag2", armsOut: true, hunch: 1, ragged: true, noBlush: true, noCatch: true, eyeC: "#b02020", extra: [[15, 9, "#7a1a1a"], [11, 16, "#7a1a1a"]] });
SPECS.ghoul = () => humanoid({ skin: "ghoul", top: "rag", pants: "rag2", armsOut: true, hunch: 1.6, ragged: true, noBlush: true, noCatch: true, eyeC: "#f4ff60", extra: [[16, 7, "ghoul:3"], [14, 5, "ghoul:0"], [18, 8, "ghoul:0"]] });
SPECS.glower = () => humanoid({ keepExtra: true, skin: "#b4e068", top: "rag", pants: "rag2", armsOut: true, hunch: 1.6, ragged: true, noBlush: true, noCatch: true, eyeC: "#ffffff", extra: [...scat(16, 6, 3, 26, 28, "#d8ff60", 11, (x, y) => (x < 11 || x > 21 || y < 4)), ...scat(8, 10, 8, 22, 24, "#e8ff90", 13)] });
SPECS.brute = () => humanoid({ skin: "brute", top: "rag2", pants: "rag", armsOut: true, w: 1.45, belly: true, armor: true, noBlush: true, noCatch: true, eyeC: "#f0c030", extra: [[12, 24, "rag:4"], [20, 24, "rag:4"]] });
SPECS.raider = () => humanoid({ skin: "skin", hair: "mohawk", hairStyle: "mohawk", top: "leath", pants: "rustD", armor: true, armorC: "steel", noBlush: true, scarf: "rust", extra: [[12, 20, "leath:0"], [20, 17, "leath:4"], [16, 1, "mohawk:1"]] });
SPECS.brawler = () => humanoid({ skin: "skin", hair: "mohawk", hairStyle: "mohawk", top: "rust", pants: "pants", w: 1.35, belly: true, armor: true, armorC: "steel", noBlush: true, armsOut: true, extra: [[13, 24, "steel:1"], [19, 24, "steel:1"]] });
SPECS.npc_settler0 = () => humanoid({ skin: "tan", hair: "hairG", top: "shirtG", pants: "rustD", extra: [[12, 15, "shirtG:1"], [20, 16, "shirtG:4"]] });
SPECS.npc_settler1 = () => humanoid({ skin: "brown", hair: "hairB", hairStyle: "long", top: "shirtT", pants: "pants", pack: true, scarf: "shirtR" });
SPECS.npc_merchant0 = () => humanoid({ skin: "skin", hat: "yel", top: "shirtR", pants: "pants", pack: true, scarf: "yel", extra: [[11, 20, "yel:2"], [21, 20, "yel:2"], [16, 15, "yel:1"]] });
SPECS.npc_merchant1 = () => humanoid({ skin: "brown", hat: "awn1", hair: "hairG", top: "orange", pants: "rustD", pack: true, scarf: "awn2", extra: [[11, 20, "yel:2"], [21, 20, "yel:2"]] });
SPECS.npc_guard0 = () => humanoid({ skin: "tan", helmet: "kevlar", top: "kevlar", pants: "pants", armor: true, armorC: "kevlar", noBlush: true, extra: [[12, 20, "yel:2"], [20, 20, "yel:2"]] });
SPECS.npc_guard1 = SPECS.npc_guard0;

/* ======================================================================
   Weapons: side-profile silhouettes drawn from ASCII maps (muzzle to the right, hand near the grip)
   ====================================================================== */
const ASC = (ox, oy, rows, ch) => (x, y) => { const row = rows[y - oy]; if (!row) return false; const c = row[x - ox]; return c !== undefined && c === ch; };
const _ag = (id, ox, oy, rows, map, D) => { SPECS["i_" + id] = () => ({ size: 32, shadow: null, L: Object.keys(map).map(ch => L(ASC(ox, oy, rows, ch), map[ch][0], { sh: map[ch][1] || "flat", cast: false })), D: D || [] }); };
_ag("pistol", 4, 11, [
  "..SSSSSSSSSSSSSSSS",
  "..SSSSSSSSSSSSSSSS",
  "..DDDDDDDDDDDDDD..",
  "..GGGGGD.DDDDD....",
  "..GGGGG..D...D....",
  "..GGGGG..DDDDD....",
  "...GGGGG..........",
  "...GGGGG..........",
  "...GGGGG.........."], { S: ["metal", "top"], D: ["dmetal", "top"], G: ["grip", "flat"] }, [[10, 11, "metal:4"], [11, 11, "metal:4"], [12, 11, "metal:4"], [21, 12, "dmetal:5"]]);
_ag("revolver", 3, 10, [
  "..HH....................",
  "..HHSSSSSSSSSSSSSSSSSSSS",
  "..SSSSSSSSSSSSSSSSSSSSSS",
  "..CCCCCCSSSSSSSSSSSSSSSS",
  "..CCCCCCDDDDDDDDDDDDDDDD",
  "..WWWWDD.DDDDDDDDDD.....",
  "..WWWW..D...............",
  ".WWWWW..................",
  ".WWWW...................",
  ".WWW...................."], { H: ["dmetal", "flat"], S: ["metal", "top"], C: ["dmetal", "cyl"], D: ["dmetal", "top"], W: ["wood", "top"] }, [[8, 14, "dmetal:5"], [10, 14, "dmetal:5"], [12, 13, "dmetal:5"], [27, 11, "metal:0"]]);
_ag("shotgun", 1, 10, [
  "........MMMMMMMMMMMMMMMMMMMMMMM",
  "WWWWWWDDDMMMMMMMMMMMMMMMMMMMMMMM",
  "WWWWWWWDDDDDDDDDDDDDDDDDDDDDDDD.",
  ".WWWWWWDDDD.D.....FFFFFFF.......",
  "..WWWWWD....D.....FFFFFFF.......",
  "..WWWWW.........................",
  "...WWWW........................."], { M: ["metal", "top"], D: ["dmetal", "top"], W: ["wood", "top"], F: ["wood", "top"] }, [[10, 11, "dmetal:5"], [11, 11, "dmetal:5"]]);
_ag("smg", 2, 10, [
  "..DDDDDDDDDDDDDD....",
  "SSDDDDDDDDDDDDDDMMMMMM",
  "S.DDDDDDDDDDDDDDDDDD..",
  "S..GGGDD..DDDDD.......",
  "...GGGD....KKK........",
  "...GGG.....KKK........",
  "...GGG.....KKK........",
  "...........KKK........"], { D: ["dmetal", "top"], S: ["metal", "flat"], M: ["metal", "top"], G: ["grip", "flat"], K: ["dmetal", "cyl"] }, [[12, 10, "dmetal:5"], [13, 10, "dmetal:5"], [14, 10, "dmetal:5"]]);
_ag("rifle_auto", 0, 10, [
  "..........DDDDDDDDDDDDDD......",
  "WWWWWWDDDDDDDDDDDDDDDMMMMMMMMMM",
  "WWWWWWDDDDDDDDDDDDDDFFFFFMMMMM.",
  ".WWWWWDDGDDKKDDDDDDDFFFFF......",
  "..WWWWD.G..KKK.................",
  ".......G...KKK.................",
  "...........KKK.................",
  "............KK................."], { D: ["dmetal", "top"], M: ["metal", "top"], W: ["wood", "top"], F: ["wood", "top"], G: ["grip", "flat"], K: ["dmetal", "cyl"] }, [[8, 11, "dmetal:5"], [9, 11, "dmetal:5"], [30, 11, "dmetal:5"]]);
_ag("rifle", 0, 9, [
  "..............SSSSSSSSSS.........",
  "..............S........S........",
  "..........MMMMMMMMMMMMMMMMMMMMMM",
  "WWWWWWWWWDDDDDMMMMMMMMMMMMMMMMMM",
  "WWWWWWWWWWWDDDDFFFFFFFFFF.......",
  ".WWWWWWWWWWDDGD.................",
  "..WWWWWWWDD.G..................."], { S: ["dmetal", "top"], M: ["metal", "top"], D: ["dmetal", "top"], W: ["wood", "top"], F: ["wood", "top"], G: ["grip", "flat"] }, [[16, 9, "metal:0"], [17, 9, "metal:0"], [30, 11, "dmetal:5"]]);
_ag("pipe_rifle", 0, 11, [
  "WWWWWWWW.........................",
  "..WWWWWWPPPPPPPPPPPPPPPPPPPPPPPPP",
  "...WWWWWRRRPPPPPPPPPPPPPPPPPPPPPP",
  "....WWWW.RR.G......R.............",
  ".....WW....G....................."], { W: ["wood", "top"], P: ["dmetal", "top"], R: ["rust", "flat"], G: ["grip", "flat"] }, [[16, 12, "metal:2"], [17, 12, "metal:2"]]);
_ag("laser_pistol", 4, 10, [
  "..PPPPPPPPPPPPPP.EE",
  "..PPYYYYYYPPPPPPEEE",
  "..PPPPPPPPPPPPPPDDD",
  "..GGGPPPDD.........",
  "..GGGG.D...........",
  "..GGGG.............",
  "...GGGG............"], { P: ["plate", "top"], Y: ["glow", "flat"], E: ["metal", "top"], D: ["dmetal", "flat"], G: ["grip", "flat"] }, [[22, 11, "#d8ffd0"], [23, 11, "#d8ffd0"]]);
_gun("knife", [L(SEG(6, 26, 13, 19, 3.2), "grip", { sh: "flat", cast: false }), L(SEG(11, 17, 16, 22, 2), "dmetal", { sh: "flat", cast: false }), L(POLY([[13, 18], [16, 21], [27, 5]]), "metal", { sh: "cyl", cast: false })], [[20, 13, "metal:0"], [22, 10, "metal:0"]]);
_gun("machete", [L(SEG(5, 27, 12, 20, 3.2), "grip", { sh: "flat", cast: false }), L(SEG(10, 18, 15, 23, 1.8), "dmetal", { sh: "flat", cast: false }), L(POLY([[12, 18], [15, 21], [28, 11], [28, 6], [24, 5]]), "metal", { sh: "cyl", cast: false })], [[20, 11, "metal:0"], [24, 8, "metal:0"]]);
_gun("bat", [L(SEG(7, 25, 16, 16, 2.4), "wood", { sh: "cyl", cast: false }), L(SEG(15, 17, 26, 6, 5), "wood", { sh: "cyl", cast: false }), L(SEG(6, 26, 8, 24, 3.4), "wood", { sh: "flat", cast: false }), L(SEG(9, 23, 12, 20, 2.6), "grip", { sh: "flat", cast: false })], [[24, 7, "wood:0"], [22, 9, "wood:0"]]);
_gun("pipe", [L(SEG(7, 25, 25, 7, 3), "dmetal", { sh: "cyl", cast: false }), L(SEG(7, 25, 9, 23, 4), "metal", { sh: "flat", cast: false }), L(SEG(24, 8, 26, 6, 4), "metal", { sh: "flat", cast: false })], [[16, 16, "dmetal:0"], [17, 15, "dmetal:0"]]);
_gun("sledge", [L(SEG(6, 27, 21, 12, 2.6), "wood", { sh: "cyl", cast: false }), L(POLY([[15, 8], [19, 4], [29, 13], [25, 17]]), "dmetal", { sh: "top", cast: false })], [[20, 7, "metal:0"], [22, 8, "metal:0"], [26, 13, "dmetal:5"]]);

/* ======================================================================
   Fallout bestiary: Deathclaw, Mister Handy, Super Mutant, Bloatfly, Mirelurk, Giant Ant, Gecko, Brahmin
   ====================================================================== */
Object.assign(BASE, { dcl: "#7a6650", dclB: "#a89070", handy: "#d8d4c8", smut: "#a9b46a", flyB: "#7a8a3a", flyT: "#4a4a30", mireS: "#566a44", mireC: "#c0784a", antB: "#7a2a20", gecko: "#6a9a50", geckoB: "#d88030", brah: "#b09068", brahD: "#6a4a32" });
SPECS.razorclaw = () => ({
  size: 32, shadow: ELL(16, 29, 11, 2),
  L: [L(SEG(10, 21, 3, 25, 2.6), "dcl", { sh: "cyl", cast: false }), L(OR(SEG(13, 22, 12, 28, 3.4), SEG(19, 22, 20, 28, 3.4)), "dcl", { sh: "cyl", cast: false }),
    L(RELL(15, 16, 5.6, 7.4, .35), "dcl", { tex: .25, seed: 4 }), L(ELL(17, 19, 2.6, 4), "dclB", { sh: "flat", cast: false }),
    L(OR(SEG(18, 14, 24, 21, 2.4), SEG(14, 14, 18, 22, 2.2)), "dcl", { sh: "cyl" }),
    L(ELL(21, 8.5, 3.6, 3.2), "dcl", { tex: .15, seed: 6 }), L(ELL(25.5, 10, 2.8, 1.8), "dclB", { sh: "flat" }),
    L(OR(POLY([[18, 6], [13, 1], [17, 8]]), POLY([[21, 5], [20, 0], [24, 5]])), "bone", { sh: "flat", cast: false }),
    L(OR(POLY([[24, 20], [30, 22], [24, 23]]), POLY([[23, 22], [29, 26], [23, 25]]), POLY([[20, 23], [24, 28], [19, 26]])), "bone", { sh: "flat", cast: false })],
  D: [[21, 8, "#ff3020"], [22, 8, "#ff8040"], [27, 11, "#f0f0e0"], [25, 11, "#f0f0e0"], [28, 9, "#201418"], [12, 14, "dcl:4"], [14, 17, "dcl:4"], [16, 13, "dcl:1"]]
});
SPECS.rustbot = () => ({
  size: 32, shadow: ELL(16, 29, 6, 1.4),
  L: [L(OR(SEG(13, 10, 11, 4, 1.2), SEG(16, 10, 16, 3, 1.2), SEG(19, 10, 21, 4, 1.2)), "dmetal", { sh: "flat", cast: false }),
    L(OR(SEG(9, 17, 4, 21, 1.6), SEG(23, 17, 28, 19, 1.6), SEG(16, 22, 15, 26, 1.4)), "plate", { sh: "cyl", cast: false }),
    L(ELL(16, 17, 7.6, 6.2), "handy", { tex: .06, seed: 3 }), L(ELL(16, 23.6, 3.4, 1.6), "dmetal", { sh: "flat" }),
    L(OR(ELL(3, 21.5, 2.4, 2.4), RECT(28, 18, 30, 20)), "dmetal", { sh: "flat" })],
  D: [[11, 3, "#ff4030"], [12, 3, "#ff4030"], [16, 2, "#ff4030"], [17, 2, "#ff4030"], [21, 3, "#ff4030"], [22, 3, "#ff4030"], ...[9, 10, 11, 13, 15, 17, 19, 21, 23].map(x => [x, 17, "handy:4"]), [13, 14, "handy:0"], [12, 15, "handy:0"], [18, 20, "rust:2"], [19, 19, "rust:2"], [11, 20, "rust:3"], [15, 27, "#6ac8ff"], [16, 28, "#a8e8ff"], [17, 27, "#6ac8ff"], [3, 21, "#e8e8e0"], [29, 19, "#ff8030"], [30, 19, "#ffd060"]]
});
SPECS.brute = () => humanoid({ skin: "smut", top: "smut", pants: "rag", w: 1.7, belly: true, armsOut: true, noBlush: true, noCatch: true, eyeC: "#f0d030" });
SPECS.bloatfly = () => ({
  size: 32, shadow: ELL(16, 28, 5, 1.1),
  L: [L(OR(SEG(17, 17, 15, 22, .9), SEG(20, 17, 20, 23, .9), SEG(23, 16, 25, 22, .9)), "flyT", { sh: "flat", cast: false }),
    L(OR(RELL(13, 10, 5.4, 1.9, -.5), RELL(19, 9, 5.4, 1.9, .5)), "glass", { sh: "flat", cast: false }),
    L(ELL(12, 15, 5.4, 4.4), "flyB", { tex: .3, seed: 3 }), L(ELL(19.5, 14, 3, 2.6), "flyT", { sh: "round" }), L(ELL(24, 14.5, 2.4, 2.2), "flyT", { sh: "round" }), L(POLY([[7, 16], [3, 20], [8, 18]]), "flyT", { sh: "flat", cast: false })],
  D: [[24, 13, "#ff4030"], [25, 13, "#ff4030"], [26, 16, "#e8e0c8"], [10, 13, "flyB:0"], [9, 14, "flyB:0"], [13, 17, "flyB:4"], [14, 18, "flyB:4"]]
});
SPECS.mirelurk = () => ({
  size: 32, shadow: ELL(16, 28, 12, 2),
  L: [L(OR(SEG(9, 23, 6, 28, 1.6), SEG(12, 25, 10, 29, 1.6), SEG(20, 25, 22, 29, 1.6), SEG(23, 23, 26, 28, 1.6)), "mireC", { sh: "shade", cast: false }),
    L(OR(SEG(9, 18, 5, 16, 2.2), SEG(23, 18, 27, 16, 2.2)), "mireC", { sh: "cyl" }), L(OR(ELL(4, 15, 3.8, 2.8), ELL(28, 15, 3.8, 2.8)), "mireC", { tex: .15, seed: 2 }),
    L(ELL(16, 13.5, 3.6, 2.8), "mireS", { sh: "round" }), L(ELL(16, 20, 10, 6.4), "mireS", { tex: .35, seed: 4 })],
  D: [[14, 12, "#ffd040"], [18, 12, "#ffd040"], [14, 11, "#101010"], [18, 11, "#101010"], ...[10, 13, 16, 19, 22].map(x => [x, 19, "mireS:4"]), ...[12, 15, 18, 21].map(x => [x, 22, "mireS:4"]), [11, 17, "mireS:0"], [15, 16, "mireS:0"], [20, 17, "mireS:0"], [2, 14, "mireC:0"], [30, 14, "mireC:0"]]
});
SPECS.ant = () => ({
  size: 32, shadow: ELL(16, 27, 11, 1.8),
  L: [L(OR(SEG(11, 21, 8, 27, 1.1), SEG(15, 21, 15, 28, 1.1), SEG(19, 21, 22, 27, 1.1), SEG(13, 21, 11, 24, 1.1), SEG(18, 21, 19, 24, 1.1)), "antB", { sh: "shade", cast: false }),
    L(OR(SEG(24, 15, 29, 10, .8), SEG(25, 16, 30, 14, .8)), "antB", { sh: "flat", cast: false }),
    L(ELL(8, 19, 5.4, 4), "antB", { tex: .2, seed: 3 }), L(ELL(16, 18, 3.8, 3), "antB", { sh: "round" }), L(ELL(22.5, 17.5, 3.4, 3), "antB", { sh: "round" }), L(POLY([[25, 19], [30, 20], [26, 22]]), "bone", { sh: "flat", cast: false })],
  D: [[23, 16, "#ffd040"], [24, 16, "#ffd040"], [7, 17, "antB:0"], [8, 17, "antB:0"], [16, 16, "antB:0"], [10, 20, "antB:4"], [6, 21, "antB:4"]]
});
SPECS.gecko = () => ({
  size: 32, shadow: ELL(16, 27, 12, 1.8),
  L: [L(OR(SEG(11, 22, 9, 27, 1.7), SEG(19, 22, 21, 27, 1.7)), "gecko", { sh: "shade", cast: false }), L(SEG(8, 21, 2, 25, 2.2), "gecko", { sh: "cyl" }),
    L(ELL(15, 20, 7.4, 3.4), "gecko", { tex: .2, seed: 5 }), L(ELL(23, 19, 3.6, 2.7), "gecko", { sh: "round" }), L(ELL(27, 19.5, 2.2, 1.6), "gecko", { sh: "round" })],
  D: [[23, 17, "#ffd040"], [24, 17, "#201418"], [29, 20, "#201418"], ...[10, 12, 14, 16, 18, 20].map(x => [x, 17, "geckoB:2"]), [12, 21, "geckoB:1"], [15, 22, "geckoB:1"], [18, 21, "geckoB:1"], [5, 23, "gecko:4"]]
});
SPECS.brahmin = () => ({
  size: 32, shadow: ELL(16, 29, 13, 2),
  L: [L(SEG(27, 16, 30, 23, 1.4), "brahD", { sh: "flat", cast: false }), L(OR(SEG(12, 23, 12, 29, 3), SEG(23, 23, 23, 29, 3), SEG(17, 24, 17, 29, 3), SEG(8, 23, 8, 28, 2.6)), "brahD", { sh: "cyl", cast: false }),
    L(ELL(17.5, 18.5, 10, 6.2), "brah", { tex: .25, seed: 3 }), L(ELL(21, 12.5, 4, 3), "brah", { tex: .2, seed: 5 }),
    L(OR(ELL(6.5, 14.5, 3.2, 2.8), ELL(7.5, 20, 3, 2.6)), "brah", { sh: "round" }), L(OR(SEG(5, 12, 3, 9, 1.2), SEG(9, 12, 11, 9, 1.2), SEG(6, 17, 4, 15, 1.1)), "bone", { sh: "flat", cast: false })],
  D: [[5, 14, "#201418"], [6, 19, "#201418"], [4, 16, "#e8c8c0"], [3, 20, "#e8c8c0"], [14, 15, "#e8e0d0"], [15, 15, "#e8e0d0"], [19, 17, "#e8e0d0"], [20, 17, "#e8e0d0"], [13, 20, "brah:4"], [22, 20, "brah:4"], [18, 12, "brah:0"]]
});
