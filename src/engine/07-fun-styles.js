  /* =================================================================
     v3: new subjects, toolbox extras, multi-colour "fun" styles,
     add/cut items, multi-part export
     ================================================================= */
  const at3 = (f, tx, ty, s = 1, rot = 0) => S.xf(f, tx, ty, s, rot);
  const over3 = (a, b, gap = 0.07) => S.union(a, S.sub(b, S.offset(a, gap)));

  /* ---------------- pickleball */
  I.pickleball = () => {
    const holes = [S.circle(0, 0, 0.1)];
    for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; holes.push(S.circle(0.42 * Math.cos(a), 0.42 * Math.sin(a), 0.1)); }
    for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6 + 0.26; holes.push(S.circle(0.76 * Math.cos(a), 0.76 * Math.sin(a), 0.085)); }
    return S.sub(S.circle(0, 0, 0.97), ...holes);
  };
  I.paddles = () => {
    const paddle = S.union(S.sub(S.box(0, 0.3, 0.4, 0.5, 0.3), S.shell(S.box(0, 0.3, 0.3, 0.4, 0.22), 0.05)),
      S.sub(S.box(0, -0.52, 0.1, 0.3, 0.05), S.seg(-0.12, -0.45, 0.12, -0.45, 0.04), S.seg(-0.12, -0.6, 0.12, -0.6, 0.04)));
    const a = at3(paddle, -0.05, 0.05, 1, 0.45), b = at3(paddle, 0.05, 0.05, 1, -0.45);
    const ball = at3(I.pickleball(), 0, -0.82, 0.18);
    return over3(ball, over3(a, b), 0.08);
  };

  /* ---------------- fishing */
  I.fish = () => {
    const body = S.inter(S.circle(0.12, -0.52, 0.95), S.circle(0.12, 0.52, 0.95));
    const fish = S.union(body, S.poly([[-0.52, 0], [-1.0, 0.46], [-0.86, 0], [-1.0, -0.46]]), S.poly([[-0.2, 0.3], [0.18, 0.62], [0.36, 0.32]]), S.poly([[-0.1, -0.3], [0.12, -0.52], [0.24, -0.3]]));
    const scales = [];
    for (const [x, y] of [[-0.25, 0.12], [-0.25, -0.12], [-0.05, 0], [-0.05, 0.24], [-0.05, -0.24], [0.15, 0.12], [0.15, -0.12]]) scales.push(S.arc(x, y, 0.13, -1.2, 1.2, 0.04));
    return at3(S.union(S.sub(fish, S.circle(0.66, 0.08, 0.075), S.arc(0.48, 0, 0.3, 2.1, 4.18, 0.055), S.seg(0.84, -0.12, 0.97, -0.08, 0.05), ...scales),
      S.ring(0.98, 0.4, 0.07, 0.035), S.ring(0.9, 0.62, 0.05, 0.03)), -0.02, 0, 0.98);
  };
  I.hook = () => at3(S.union(
    S.seg(0.2, 0.72, 0.2, -0.32, 0.17), S.arc(-0.14, -0.32, 0.34, Math.PI, 2 * Math.PI, 0.17),
    S.seg(-0.48, -0.32, -0.48, 0.02, 0.15), S.poly([[-0.48, 0.14], [-0.26, -0.16], [-0.52, -0.16]]),
    S.ring(0.2, 0.84, 0.13, 0.09)), 0.04, -0.04, 1.05);
  I.bobber = () => S.union(
    S.sub(S.circle(0, -0.08, 0.56), S.seg(-0.7, -0.08, 0.7, -0.08, 0.08), S.arc(-0.12, 0.05, 0.3, 1.9, 2.9, 0.06)),
    S.seg(0, 0.42, 0, 0.92, 0.1), S.circle(0, 0.94, 0.09), S.seg(0, -0.64, 0, -0.8, 0.08),
    S.arc(-0.55, -1.12, 0.32, 0.55, 2.6, 0.065), S.arc(0.05, -1.12, 0.32, 0.55, 2.6, 0.065), S.arc(0.62, -1.12, 0.32, 0.55, 2.6, 0.065));
  I.rod = () => S.union(
    S.seg(-0.92, -0.92, 0.78, 0.86, 0.065), S.seg(-0.92, -0.92, -0.5, -0.48, 0.15),
    S.sub(S.circle(-0.6, -0.26, 0.2), S.circle(-0.6, -0.26, 0.07)), S.seg(-0.6, -0.26, -0.46, -0.43, 0.08),
    S.seg(0.78, 0.86, 0.78, -0.25, 0.035), S.arc(0.62, -0.25, 0.16, Math.PI, 2 * Math.PI, 0.07), S.seg(0.46, -0.25, 0.46, -0.12, 0.07));

  /* ---------------- hunting / outdoors */
  I.deer = () => {
    const side = (m) => S.union(
      S.seg(m * 0.14, -0.38, m * 0.42, 0.0, 0.11), S.seg(m * 0.42, 0.0, m * 0.6, 0.42, 0.1), S.seg(m * 0.6, 0.42, m * 0.56, 0.95, 0.09),
      S.seg(m * 0.42, 0.0, m * 0.82, 0.12, 0.08), S.seg(m * 0.52, 0.22, m * 0.34, 0.62, 0.08), S.seg(m * 0.59, 0.55, m * 0.9, 0.78, 0.08),
      at3(S.ellipse(0, 0, 0.2, 0.09), m * 0.36, -0.5, 1, m * -0.45));
    const head = S.sub(S.offset(S.poly([[-0.2, -0.32], [0.2, -0.32], [0.14, -0.9], [0, -1.0], [-0.14, -0.9]]), 0.04), S.circle(-0.1, -0.5, 0.05), S.circle(0.1, -0.5, 0.05), S.ellipse(0, -0.92, 0.06, 0.04));
    return at3(S.union(side(1), side(-1), head), 0, 0.03, 0.97);
  };
  I.duck = () => {
    const wing = S.sub(S.poly([[-0.12, -0.05], [0.25, -0.05], [-0.2, 0.86], [-0.58, 0.62]]), S.seg(-0.1, 0.1, -0.4, 0.55, 0.04), S.seg(0.05, 0.05, -0.2, 0.58, 0.04));
    const body = S.union(at3(S.ellipse(0, 0, 0.56, 0.24), 0.02, -0.18, 1, 0.14), S.seg(0.44, -0.08, 0.62, 0.18, 0.17), S.circle(0.68, 0.27, 0.17),
      S.poly([[0.8, 0.31], [1.0, 0.22], [0.8, 0.19]]), S.poly([[-0.48, -0.2], [-0.88, -0.02], [-0.8, -0.34]]));
    return at3(over3(wing, S.sub(body, S.circle(0.72, 0.31, 0.035))), -0.04, -0.06, 1);
  };
  I.track = () => {
    const half = (m) => S.offset(S.poly([[m * 0.14, 0.95], [m * 0.48, 0.42], [m * 0.56, -0.25], [m * 0.4, -0.6], [m * 0.15, -0.55]]), 0.04);
    return S.union(half(1), half(-1), S.ellipse(-0.36, -0.88, 0.12, 0.08), S.ellipse(0.36, -0.88, 0.12, 0.08));
  };
  I.mountains = () => {
    const peaks = S.sub(S.poly([[-1.0, -0.62], [-0.38, 0.42], [-0.06, -0.08], [0.32, 0.72], [1.0, -0.62]]),
      S.poly([[0.32, 0.48], [0.2, 0.32], [0.3, 0.38], [0.36, 0.3], [0.46, 0.38]]), S.poly([[-0.38, 0.22], [-0.48, 0.08], [-0.4, 0.13], [-0.32, 0.06]]));
    const tree = (x, s) => S.union(S.poly([[x - 0.26 * s, -0.5 * s], [x + 0.26 * s, -0.5 * s], [x, 0.0 * s]].map(([a, b]) => [a, b - 0.15])),
      S.poly([[x - 0.2 * s, -0.25 * s], [x + 0.2 * s, -0.25 * s], [x, 0.18 * s]].map(([a, b]) => [a, b - 0.15])), S.box(x, -0.72 * s, 0.05 * s, 0.1 * s));
    return S.union(S.sub(peaks, S.offset(S.union(tree(-0.62, 1), tree(0.66, 1.15)), 0.07), S.box(0, -0.8, 1.1, 0.16)), tree(-0.62, 1), tree(0.66, 1.15), S.box(0, -0.86, 0.98, 0.06));
  };

  /* ---------------- drinks */
  const mug = (m = 1) => {
    const body = S.sub(S.box(-0.12 * m, -0.15, 0.48, 0.6, 0.08), S.seg(-0.36 * m, 0.22, -0.36 * m, -0.6, 0.07), S.seg(-0.12 * m, 0.22, -0.12 * m, -0.6, 0.07), S.seg(0.12 * m, 0.22, 0.12 * m, -0.6, 0.07));
    const handle = S.sub(S.ring(0.4 * m, -0.12, 0.28, 0.12), S.box(-0.12 * m, -0.15, 0.47, 0.59));
    const foam = S.sub(S.union(S.circle(-0.44 * m, 0.5, 0.17), S.circle(-0.2 * m, 0.6, 0.2), S.circle(0.07 * m, 0.58, 0.19), S.circle(0.28 * m, 0.5, 0.15), S.box(-0.12 * m, 0.45, 0.47, 0.06)), S.seg(-0.7, 0.36, 0.7, 0.36, 0.06));
    return S.union(body, handle, foam, S.seg(0.25 * m, 0.4, 0.25 * m, 0.2, 0.11));
  };
  I.beer = () => at3(mug(1), 0.02, 0.05, 1.08);
  I.cheers = () => {
    const a = at3(mug(-1), -0.46, -0.2, 0.7, -0.32), b = at3(mug(1), 0.46, -0.2, 0.7, 0.32);
    return S.union(over3(a, b, 0.07), S.seg(0, 0.62, 0, 0.92, 0.07), S.seg(-0.22, 0.58, -0.36, 0.84, 0.07), S.seg(0.22, 0.58, 0.36, 0.84, 0.07));
  };
  I.martini = () => S.union(
    S.sub(S.poly([[-0.66, 0.78], [0.66, 0.78], [0, 0.04]]), S.seg(-0.6, 0.62, 0.6, 0.62, 0.05), S.ring(0.1, 0.38, 0.14, 0.045)),
    S.seg(0.1, 0.38, 0.52, 0.98, 0.05),
    S.seg(0, 0.06, 0, -0.74, 0.09), S.ellipse(0, -0.8, 0.4, 0.09));
  I.wine = () => S.union(
    S.sub(S.inter(S.circle(0, 0.38, 0.5), S.box(0, 0.42, 0.5, 0.55)), S.seg(-0.5, 0.32, 0.5, 0.32, 0.05), S.arc(0.18, 0.5, 0.2, 0.2, 1.4, 0.05)),
    S.seg(0, -0.1, 0, -0.76, 0.09), S.ellipse(0, -0.82, 0.38, 0.09));
  I.bottle = () => S.sub(S.union(S.box(0, -0.35, 0.3, 0.6, 0.12), S.poly([[-0.3, 0.2], [0.3, 0.2], [0.1, 0.55], [-0.1, 0.55]]), S.box(0, 0.75, 0.1, 0.22, 0.03)),
    S.box(0, -0.3, 0.22, 0.24, 0.04), S.seg(-0.12, 0.88, 0.12, 0.88, 0.04));

  /* ---------------- toolbox extras */
  I.heart = () => S.union(S.circle(-0.38, 0.28, 0.44), S.circle(0.38, 0.28, 0.44), S.poly([[-0.78, 0.1], [0.78, 0.1], [0, -0.86]]));
  I.bolt = () => S.poly([[0.18, 1.0], [-0.55, -0.08], [-0.05, -0.08], [-0.25, -1.0], [0.55, 0.15], [0.05, 0.15]]);
  I.flame = () => S.sub(S.union(S.circle(0, -0.38, 0.58), S.poly([[-0.57, -0.3], [0.57, -0.3], [0.5, 0.22], [0.66, 0.66], [0.26, 0.36], [0.1, 1.0], [-0.14, 0.42], [-0.42, 0.72], [-0.52, 0.18]])),
    S.union(S.circle(0, -0.45, 0.28), S.poly([[-0.27, -0.38], [0.27, -0.38], [0.04, 0.2]])));
  I.crown = () => S.union(S.poly([[-0.85, -0.45], [0.85, -0.45], [0.95, 0.5], [0.45, 0.05], [0, 0.65], [-0.45, 0.05], [-0.95, 0.5]]),
    S.circle(-0.95, 0.58, 0.12), S.circle(0, 0.75, 0.12), S.circle(0.95, 0.58, 0.12), S.box(0, -0.65, 0.85, 0.12, 0.04));
  I.sparkle = () => S.union(S.star(-0.15, 0.1, 0.85, 0.2, 4, Math.PI / 2), S.star(0.62, 0.62, 0.32, 0.08, 4, Math.PI / 2), S.star(0.6, -0.6, 0.24, 0.06, 4, Math.PI / 2));
  I.dot = () => S.circle(0, 0, 0.9);
  I.paw = () => S.union(S.ellipse(0, -0.38, 0.48, 0.4), S.ellipse(-0.6, 0.12, 0.17, 0.22), S.ellipse(-0.22, 0.5, 0.18, 0.24), S.ellipse(0.22, 0.5, 0.18, 0.24), S.ellipse(0.6, 0.12, 0.17, 0.22));

  Object.assign(ICON_LABELS, {
    pickleball: "Ball", paddles: "Paddles", fish: "Fish", hook: "Hook", bobber: "Bobber", rod: "Rod & reel",
    deer: "Antlers", duck: "Duck", track: "Deer track", mountains: "Mountains", beer: "Beer mug", cheers: "Cheers",
    martini: "Martini", wine: "Wine", bottle: "Bottle", heart: "Heart", bolt: "Bolt", flame: "Flame", crown: "Crown",
    sparkle: "Sparkle", dot: "Dot", paw: "Paw",
  });

  /* ---------------- palettes: base, accent, panel, bold, letters */
  const PALETTES = {
    pop: { label: "Pop", base: "#2154FF", accent: "#FFD23F", panel: "#FFFFFF", bold: "#FF2E7E", letters: "#FFFFFF" },
    hoops: { label: "Hoops", base: "#FF6A13", accent: "#FFD23F", panel: "#FFFFFF", bold: "#1B1B1B", letters: "#FFFFFF" },
    gameday: { label: "Gameday", base: "#1F8A3B", accent: "#FFD23F", panel: "#FFFFFF", bold: "#0B2E59", letters: "#FFFFFF" },
    dugout: { label: "Dugout", base: "#0B3D91", accent: "#FF3B3B", panel: "#FFFFFF", bold: "#FF3B3B", letters: "#FFFFFF" },
    ice: { label: "Ice", base: "#0B3D91", accent: "#00D1FF", panel: "#FFFFFF", bold: "#0B3D91", letters: "#FFFFFF" },
    citrus: { label: "Citrus", base: "#2EC4B6", accent: "#D7FF3D", panel: "#FFFFFF", bold: "#FF6B35", letters: "#FFFFFF" },
    fairway: { label: "Fairway", base: "#1B998B", accent: "#FFE066", panel: "#FFFFFF", bold: "#145C4F", letters: "#FFFFFF" },
    beach: { label: "Beach", base: "#FF9F1C", accent: "#2EC4B6", panel: "#FFFFFF", bold: "#0B3D91", letters: "#FFFFFF" },
    neon: { label: "Neon", base: "#6A0DAD", accent: "#00F5D4", panel: "#FFFFFF", bold: "#FF2E7E", letters: "#FFFFFF" },
    cinema: { label: "Cinema", base: "#E63946", accent: "#FFD23F", panel: "#FFFFFF", bold: "#1B1B1B", letters: "#FFFFFF" },
    retro: { label: "Retro", base: "#3A86FF", accent: "#FFBE0B", panel: "#FFFFFF", bold: "#FF006E", letters: "#FFFFFF" },
    garage: { label: "Garage", base: "#1B1B1B", accent: "#FFD23F", panel: "#FFFFFF", bold: "#E63946", letters: "#FFFFFF" },
    stage: { label: "Stage", base: "#7B2CBF", accent: "#FFD23F", panel: "#FFFFFF", bold: "#FF2E7E", letters: "#FFFFFF" },
    lake: { label: "Lake", base: "#0077B6", accent: "#90E0EF", panel: "#FFFFFF", bold: "#FB8500", letters: "#FFFFFF" },
    blaze: { label: "Blaze", base: "#386641", accent: "#FF7B00", panel: "#FFF3D6", bold: "#3B2A1A", letters: "#FFF3D6" },
    taproom: { label: "Taproom", base: "#0B3954", accent: "#FFB703", panel: "#FFFFFF", bold: "#FB5607", letters: "#FFFFFF" },
    victory: { label: "Victory", base: "#E63946", accent: "#FFD23F", panel: "#FFFFFF", bold: "#1D3557", letters: "#FFFFFF" },
    candy: { label: "Candy", base: "#FF6FB5", accent: "#7DF9FF", panel: "#FFFFFF", bold: "#6A0DAD", letters: "#FFFFFF" },
  };
  NP.PALETTES = PALETTES;

  // new subjects + palettes + toolbox items for every subject
  const tennis = SUBJECTS.find((s) => s.key === "tennis");
  tennis.words = tennis.words.filter((w) => w !== "pickleball");
  const sportsEnd = SUBJECTS.findIndex((s) => s.group !== "Sports");
  SUBJECTS.splice(sportsEnd, 0, { key: "pickleball", group: "Sports", label: "Pickleball", words: ["pickleball", "pickle ball", "pickle", "dink", "kitchen"], icons: ["paddles", "pickleball"], designs: ["burst", "bubble", "classic"] });
  SUBJECTS.push(
    { key: "fishing", group: "Outdoors", label: "Fishing", words: ["fishing", "fish", "angler", "bass", "trout", "lake", "reel", "catch"], icons: ["fish", "hook", "rod", "bobber"], designs: ["arch", "burst", "classic"] },
    { key: "hunting", group: "Outdoors", label: "Hunting", words: ["hunting", "hunt", "hunter", "deer", "buck", "duck", "camo", "outdoors", "cabin", "lodge", "elk"], icons: ["deer", "duck", "track", "mountains"], designs: ["crest", "arch", "license"] },
    { key: "drinks", group: "Drinks", label: "Bar", words: ["drink", "drinking", "drinks", "bar", "beer", "pub", "cocktail", "cocktails", "wine", "brew", "brewery", "tavern", "man cave", "whiskey", "bourbon", "happy hour", "cheers", "saloon"], icons: ["beer", "cheers", "martini", "wine", "bottle"], designs: ["arch", "marquee", "burst"] });
  const PAL = { basketball: "hoops", football: "gameday", soccer: "gameday", baseball: "dugout", hockey: "ice", tennis: "citrus", golf: "fairway", volleyball: "beach", bowling: "neon", track: "victory", pickleball: "citrus", movies: "cinema", tv: "retro", cars: "garage", music: "stage", fishing: "lake", hunting: "blaze", drinks: "taproom", general: "pop" };
  const FUN_DESIGNS = { basketball: ["burst", "arch"], football: ["crest", "burst"], soccer: ["crest", "burst"], baseball: ["crest", "arch"], hockey: ["crest", "burst"], tennis: ["bubble", "burst"], golf: ["arch", "burst"], volleyball: ["bubble", "burst"], bowling: ["burst", "bubble"], track: ["crest", "burst"], movies: ["arch", "burst"], tv: ["bubble", "burst"], cars: ["crest", "burst"], music: ["burst", "arch"] };
  const EXTRAS = {
    Sports: ["trophy", "medal", "star", "bolt", "flame", "crown"], Movies: ["star", "sparkle", "crown", "heart"], TV: ["star", "sparkle", "heart", "bolt"],
    Cars: ["checkered", "flame", "bolt", "star", "wrenches", "tire"], Music: ["star", "sparkle", "bolt", "heart", "flame"],
    Outdoors: ["mountains", "track", "star", "flame", "paw"], Drinks: ["star", "sparkle", "crown", "heart"], Other: ["heart", "star", "sparkle", "crown", "bolt", "flame", "paw"],
  };
  FALLBACK.icons = ["trophy", "star", "medal", "heart", "crown"];
  for (const sp of SUBJECTS.concat([FALLBACK])) {
    const p = PALETTES[PAL[sp.key] || "pop"];
    sp.palette = PAL[sp.key] || "pop";
    sp.base = p.base; sp.raised = p.accent;
    sp.designs = (FUN_DESIGNS[sp.key] || []).concat(sp.designs || []).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    sp.tools = sp.icons.concat(EXTRAS[sp.group] || EXTRAS.Other).filter((v, i, a) => a.indexOf(v) === i);
  }
  NP.SPORTS = SUBJECTS.filter((s) => s.group === "Sports").map((s) => Object.assign({}, s, { key: s.icons[0] }));

  /* ---------------- helpers for the fun styles */
  function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // union of many small shapes, evaluated only near each one
  S.scatter = (items, cell = 12) => {
    if (!items.length) return S.EMPTY;
    const map = new Map(), key = (i, j) => i * 100003 + j;
    for (const it of items) {
      const i = Math.floor(it.x / cell), j = Math.floor(it.y / cell);
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { const k = key(i + di, j + dj); if (!map.has(k)) map.set(k, []); map.get(k).push(it); }
    }
    return (x, y) => {
      const arr = map.get(key(Math.floor(x / cell), Math.floor(y / cell)));
      let m = cell * 0.5;
      if (arr) for (const it of arr) { const v = it.f(x, y); if (v < m) m = v; }
      return m;
    };
  };
  // signed distance to laid-out text (mm), culled per glyph
  function textField(groups, reach) {
    const G = groups.map((g) => {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of g.outer) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
      const e = [];
      for (const l of [g.outer, ...g.holes]) for (let i = 0, j = l.length - 1; i < l.length; j = i++) e.push(l[j][0], l[j][1], l[i][0], l[i][1]);
      return { x0: x0 - reach, y0: y0 - reach, x1: x1 + reach, y1: y1 + reach, e: Float64Array.from(e) };
    });
    return (x, y) => {
      let best = reach, inside = false;
      for (const g of G) {
        if (x < g.x0 || x > g.x1 || y < g.y0 || y > g.y1) continue;
        const e = g.e;
        let ins = false;
        for (let k = 0; k < e.length; k += 4) {
          const ax = e[k], ay = e[k + 1], ex = e[k + 2] - ax, ey = e[k + 3] - ay, wx = x - ax, wy = y - ay;
          let t = (wx * ex + wy * ey) / (ex * ex + ey * ey); t = t < 0 ? 0 : t > 1 ? 1 : t;
          const dx = wx - ex * t, dy = wy - ey * t, d = Math.sqrt(dx * dx + dy * dy);
          if (d < best) best = d;
          if ((ay > y) !== (ay + ey > y) && x < (ex * (y - ay)) / ey + ax) ins = !ins;
        }
        if (ins) inside = true;
      }
      return inside ? -best : best;
    };
  }
  NP.textField = textField;
  function boxOfGroups(groups, pad) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const g of groups) for (const p of g.outer) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    if (!isFinite(x0)) return S.EMPTY;
    return S.box((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2 + pad, (y1 - y0) / 2 + pad, pad * 0.6);
  }
  function raysField(rc, inner) {
    const n = rc.n || 20, step = (2 * Math.PI) / n;
    const f = (x, y) => {
      const dx = x - rc.x, dy = y - rc.y, rr = hyp(dx, dy);
      const k = (Math.atan2(dy, dx) + (rc.rot || 0)) / step, fr = k - Math.floor(k);
      return (Math.abs(fr - 0.25) - 0.25) * step * Math.max(rr, 0.5);
    };
    return S.inter(f, S.offset(inner, -1.5), (x, y) => (rc.r0 || 0) - hyp(x - rc.x, y - rc.y));
  }
  function ringPts(hw, hh, rr, step) {
    const sx = 2 * (hw - rr), sy = 2 * (hh - rr), arc = (Math.PI * rr) / 2;
    const L = 2 * sx + 2 * sy + 4 * arc, n = Math.max(4, Math.round(L / step));
    const segs = [
      [sx, (t) => [-hw + rr + t, hh]], [arc, (t) => { const a = Math.PI / 2 - t / rr; return [hw - rr + rr * Math.cos(a), hh - rr + rr * Math.sin(a)]; }],
      [sy, (t) => [hw, hh - rr - t]], [arc, (t) => { const a = -t / rr; return [hw - rr + rr * Math.cos(a), -hh + rr + rr * Math.sin(a)]; }],
      [sx, (t) => [hw - rr - t, -hh]], [arc, (t) => { const a = -Math.PI / 2 - t / rr; return [-hw + rr + rr * Math.cos(a), -hh + rr + rr * Math.sin(a)]; }],
      [sy, (t) => [-hw, -hh + rr + t]], [arc, (t) => { const a = Math.PI - t / rr; return [-hw + rr + rr * Math.cos(a), hh - rr + rr * Math.sin(a)]; }],
    ];
    const out = [];
    for (let k = 0; k < n; k++) {
      let s = (k * L) / n;
      for (const [len, fn] of segs) { if (s <= len) { out.push(fn(s)); break; } s -= len; }
    }
    return out;
  }
  function iconPlaced(key, x, y, size, rot = 0) {
    if (key === "none" || !I[key]) return S.EMPTY;
    const r = size / 2, f = S.xf(I[key](), x, y, r, rot);
    return S.bounded(f, x - r * 1.45, y - r * 1.45, x + r * 1.45, y + r * 1.45);
  }
  NP.iconPlaced = iconPlaced;

  const FRAME_IN = 1.8, FRAME_W = 3.2;
  function funBuild(o, c) {
    const F = o.F, font = o.font || "round";
    const plate = c.plate ? S.memo(c.plate) : null;
    const shape = S.memo(c.shape);
    const edge = plate || shape;
    const frame = F.frame ? S.inter(S.offset(edge, -FRAME_IN), (x, y) => -(edge(x, y) + FRAME_IN + FRAME_W)) : S.EMPTY;
    const inner = S.memo(S.offset(edge, -(FRAME_IN + FRAME_W)));
    // text block: name (stickered) plus optional second line
    const tb = c.textBox, sub = (o.sub || "").trim();
    const olEst = Math.max(1.5, Math.min(3.0, tb.h * 0.11));
    let name = fitText(o.text, font, { cx: tb.cx, cy: tb.cy, w: tb.w - 2 * olEst, h: (sub ? tb.h * 0.64 : tb.h) - 2 * olEst }, { track: 0.06 });
    let second = null;
    if (sub) {
      second = fitText(sub, font, { cx: tb.cx, cy: 0, w: tb.w * 0.86, h: Math.min(tb.h * 0.2, name.h * 0.42) }, { track: 0.12 });
      const gap = olEst + 2.2, total = name.h + 2 * olEst + gap + second.h, top = tb.cy + total / 2;
      name = shiftGroups(name, top - olEst - name.h / 2 - tb.cy);
      second = shiftGroups(second, top - total + second.h / 2);
    }
    const ol = Math.max(1.4, Math.min(3.0, name.h * 0.16));
    const tf = textField(name.groups, ol + 5.5);
    const blob = S.memo((x, y) => tf(x, y) - ol);
    const subBox = second ? boxOfGroups(second.groups, 1.4) : S.EMPTY;
    const med = c.med;
    const bo = c.burstOut || 1.38;
    const disc = med ? S.circle(med.x, med.y, med.r) : S.EMPTY;
    const burst = med && F.burst ? S.sub(S.star(med.x, med.y, med.r * bo, med.r * 1.13, c.burstN || 14, Math.PI / 2), S.offset(disc, 1.0)) : S.EMPTY;
    const medKeep = med ? (x, y) => hyp(x - med.x, y - med.y) - med.r * (F.burst ? bo : 1.05) : () => 1e9;
    // confetti: little stars (accent) and dots (bold) in free panel space
    const stars = [], dots = [];
    if (F.confetti && c.confetti !== false) {
      const rnd = mulberry(c.seed || 11);
      const [bx0, by0, bx1, by1] = c.bbox, step = 9;
      for (let y = by0 + step / 2; y < by1; y += step) for (let x = bx0 + step / 2; x < bx1; x += step) {
        const px = x + (rnd() - 0.5) * step * 0.75, py = y + (rnd() - 0.5) * step * 0.75;
        const isStar = rnd() < 0.55, r = isStar ? 2.8 : 1.4, skip = rnd() < 0.3;
        if (skip) continue;
        if (!(inner(px, py) < -(r + 1.6) && blob(px, py) > r + 2.2 && medKeep(px, py) > r + 1.6 && subBox(px, py) > r + 1.2 && (!c.avoid || c.avoid(px, py) > r + 1.4))) continue;
        if (isStar) stars.push({ x: px, y: py, r, f: S.star(px, py, 2.8, 1.2, 5, Math.PI / 2 + rnd() * 1.2) });
        else dots.push({ x: px, y: py, r, f: S.circle(px, py, 1.4) });
      }
    }
    const rays = c.rays && F.rays ? raysField(Object.assign({ r0: med ? med.r * (F.burst ? bo * 0.97 : 1.25) : 0 }, c.rays), inner) : S.EMPTY;
    const keep = (f) => S.sub(f, S.offset(blob, 1.6), S.offset(subBox, 0.6), S.offset(disc, 1.0));
    const accent = S.memo(S.union(S.sub(S.union(frame, burst), S.offset(disc, 1.0)), keep(rays), S.scatter(stars), c.extraAccent ? keep(c.extraAccent) : S.EMPTY));
    const boldLow = S.memo(S.union(disc, S.scatter(dots)));
    const panel = S.sub(inner, accent, boldLow);
    return { kind: "fun", shape, accent, panel, boldLow, name, second, blob, tf, ol, med, bbox: c.bbox };
  }

  DESIGNS.burst = {
    label: "Starburst", fun: true, font: "round", note: "Big and bright",
    make(o) {
      const W = o.width, H = hgt(o, W * (o.sub ? 0.4 : 0.36)), R = Math.min(W * 0.16, H * 0.5);
      const plate = S.box(0, 0, W / 2, H / 2, 8);
      const med = o.F.emblem ? { x: -W / 2 + R + 5, y: H / 2 - R * 0.45, r: R } : null;
      const shape = med ? S.union(plate, o.F.burst ? S.star(med.x, med.y, R * 1.38, R * 1.13, 14, Math.PI / 2) : S.circle(med.x, med.y, R + 2.4)) : plate;
      const fi = FRAME_IN + FRAME_W + 2.5;
      const tx0 = med ? med.x + R * 1.3 + 1 : -W / 2 + fi, tx1 = W / 2 - fi;
      const top = med ? Math.max(med.y + R * 1.38, H / 2) : H / 2;
      return funBuild(o, { shape, plate, med, textBox: { cx: (tx0 + tx1) / 2, cy: -H * 0.03, w: tx1 - tx0, h: H - 2 * fi }, bbox: [-W / 2, -H / 2, W / 2, top], seed: 3 });
    },
  };
  DESIGNS.arch = {
    label: "Arch", fun: true, font: "round", note: "Door or bar",
    make(o) {
      const W = o.width, H = hgt(o, W * 0.4), rA = W * 0.3, cyA = H / 2 - W * 0.06, R = W * 0.15;
      const plate = S.union(S.box(0, 0, W / 2, H / 2, 7), S.circle(0, cyA, rA));
      const med = o.F.emblem ? { x: 0, y: cyA + rA * 0.2, r: R } : null;
      const fi = FRAME_IN + FRAME_W + 2.5;
      const top = med ? med.y - R * 1.38 - 1.5 : cyA + rA * 0.5, bot = -H / 2 + fi;
      return funBuild(o, { shape: plate, med, textBox: { cx: 0, cy: (top + bot) / 2, w: W - 2 * fi - 8, h: top - bot },
        rays: med ? { x: med.x, y: med.y, n: 16 } : null, bbox: [-W / 2, -H / 2, W / 2, cyA + rA], seed: 5 });
    },
  };
  DESIGNS.bubble = {
    label: "Bubble", fun: true, font: "round", note: "Kids' rooms",
    make(o) {
      const W = o.width, H = hgt(o, W * (o.sub ? 0.42 : 0.38)), b = H * 0.15;
      const pts = ringPts(W / 2 - b, H / 2 - b, b * 0.8, b * 1.5);
      const plate = S.union(S.box(0, 0, W / 2 - b * 0.6, H / 2 - b * 0.6, b), S.scatter(pts.map(([x, y]) => ({ x, y, f: S.circle(x, y, b) })), b * 2.3));
      const R = H * 0.36;
      const med = o.F.emblem ? { x: W / 2 - R - 2, y: H / 2 - R * 0.3, r: R } : null;
      const shape = med ? S.union(plate, o.F.burst ? S.star(med.x, med.y, R * 1.34, R * 1.13, 12, Math.PI / 2) : S.circle(med.x, med.y, R + 2.4)) : plate;
      const fi = FRAME_IN + FRAME_W + 2.5;
      const tx0 = -W / 2 + b * 0.6 + fi, tx1 = med ? med.x - R * 1.3 - 1 : W / 2 - b * 0.6 - fi;
      const hh = H / 2 - b * 0.6 - fi;
      return funBuild(o, { shape, plate, med, burstOut: 1.34, burstN: 12, textBox: { cx: (tx0 + tx1) / 2, cy: -H * 0.04, w: tx1 - tx0, h: 2 * hh }, bbox: [-W / 2, -H / 2, W / 2, med ? Math.max(H / 2, med.y + R * 1.34) : H / 2], seed: 9 });
    },
  };
  DESIGNS.crest = {
    label: "Crest", fun: true, font: "round", note: "Team pride",
    make(o) {
      const W = o.width, Rc = W * 0.28, cyC = W * 0.2, rbH = W * 0.11, rbY = -W * 0.1, notch = W * 0.07;
      const ribbon = S.poly([[-W / 2, rbY + rbH], [W / 2, rbY + rbH], [W / 2 - notch, rbY], [W / 2, rbY - rbH], [-W / 2, rbY - rbH], [-W / 2 + notch, rbY]]);
      const shape = S.union(S.circle(0, cyC, Rc), ribbon);
      const med = o.F.emblem ? { x: 0, y: cyC + Rc * 0.05, r: Rc * 0.58 } : null;
      const fi = FRAME_IN + FRAME_W + 2;
      return funBuild(o, { shape, med, burstOut: 1.3, burstN: 16, textBox: { cx: 0, cy: rbY, w: W - 2 * notch - 2 * fi, h: 2 * rbH - 2 * fi },
        rays: med ? { x: med.x, y: med.y, n: 20 } : null, bbox: [-W / 2, rbY - rbH, W / 2, cyC + Rc], seed: 13 });
    },
  };

  /* ---------------- build: every design becomes coloured parts */
  NP.SLOTS = { base: "Base", accent: "Accent", panel: "Panel", bold: "Outline", letters: "Letters", raised: "Raised" };
  NP.build = function (o) {
    const opts = Object.assign({ width: 160, base: 3, raise: 1.2, h: 0.25, icon: "trophy", text: "NAME", sub: "", items: [], features: {} }, o);
    if (opts.upper !== false) { opts.text = opts.text.toUpperCase(); opts.sub = (opts.sub || "").toUpperCase(); }
    if (!opts.font || opts.font === "auto") delete opts.font;
    const F = Object.assign({ frame: true, burst: true, rays: true, confetti: true, emblem: true }, opts.features);
    if (opts.icon === "none" && DESIGNS[opts.design || "classic"].fun) F.emblem = false;
    opts.F = F;
    if (!F.frame) opts.border = false;
    const D = DESIGNS[opts.design || "classic"];
    const d = D.make(Object.assign({}, opts, { icon: F.emblem ? opts.icon : "none" }));
    const bb = [d.bbox[0] - 4, d.bbox[1] - 4, d.bbox[2] + 4, d.bbox[3] + 4];
    const h = opts.h, T = opts.base, k = opts.raise / 1.2;
    const fg = (f, hh = h) => fieldGroups(f, bb, hh);

    // collision field: items keep clear of the lettering and emblem
    const textGroupsAll = d.kind === "fun" ? [d.name, d.second].filter(Boolean).flatMap((t) => t.groups) : d.text.flatMap((t) => t.groups);
    const tfAll = textField(textGroupsAll, 22);
    const pad = (d.kind === "fun" ? d.ol : 0) + 1.2;
    const avoid = S.union(S.offset(tfAll, pad), d.med ? S.circle(d.med.x, d.med.y, d.med.r + 1.2) : S.EMPTY);
    const shapeF0 = S.memo(d.shape);
    const spotList = [];
    for (let y = bb[1] + 6; y < bb[3]; y += 5) for (let x = bb[0] + 6; x < bb[2]; x += 5) if (shapeF0(x, y) < -10 && avoid(x, y) > 8) spotList.push([Math.round(x), Math.round(y)]);
    const items = (opts.items || []).filter((it) => I[it.key]).map((it) => Object.assign({}, it));
    for (const it of items) {
      if (it.x != null) continue;
      const placed0 = items.filter((q) => q.x != null);
      let best = null, bd = -Infinity;
      for (const s of spotList) {
        const dd = placed0.length ? Math.min(...placed0.map((q) => hyp(q.x - s[0], q.y - s[1]))) : (it.corner === "left" ? -s[0] : s[0]) * 0.01 - Math.abs(s[1]) * 0.002;
        if (dd > bd) { bd = dd; best = s; }
      }
      if (best) { it.x = best[0]; it.y = best[1]; } else { it.x = 0; it.y = 0; it.skip = true; }
    }
    for (let i = items.length - 1; i >= 0; i--) if (items[i].skip) items.splice(i, 1);
    const adds = items.filter((it) => it.mode !== "cut"), cuts = items.filter((it) => it.mode === "cut");
    const placed = (it) => iconPlaced(it.key, it.x, it.y, it.size, ((it.rot || 0) * Math.PI) / 180);
    const shapeF = S.memo(d.shape);
    // later items sit on top of earlier ones
    const addFields = adds.map((it, i) => ({ it, f: S.inter(S.sub(placed(it), avoid, ...adds.slice(i + 1).map(placed)), S.offset(shapeF, -0.8)) }));
    const addAll = adds.length ? S.memo(S.union(...addFields.map((a) => a.f))) : null;
    const cutAll = cuts.length ? S.memo(S.sub(S.inter(S.union(...cuts.map(placed)), S.offset(shapeF, -1.6)), avoid)) : null;
    const minus = (f) => { let g = f; if (addAll) g = S.sub(g, addAll); if (cutAll) g = S.sub(g, cutAll); return g; };
    const cd = Math.min(1.0, T - 0.8);

    const parts = [];
    const part = (slot) => { let p = parts.find((q) => q.slot === slot); if (!p) { p = { slot, label: NP.SLOTS[slot], slices: [] }; parts.push(p); } return p; };
    const slice = (slot, groups, z0, z1) => { if (groups.length) part(slot).slices.push({ groups, z0, z1 }); };
    // base, with optional engraving pockets
    const baseF = S.memo(d.base || d.shape);
    if (cutAll) { slice("base", fg(baseF), 0, T - cd); slice("base", fg(S.sub(baseF, cutAll)), T - cd, T); }
    else slice("base", fg(baseF), 0, T);

    let textHeight;
    if (d.kind === "fun") {
      const zP = T + 0.6 * k, zA = T + 1.2 * k, zR = T + 1.6 * k, zT = T + 2.4 * k, zI = T + 2.6 * k;
      slice("panel", fg(minus(d.panel)), T, zP);
      slice("accent", fg(minus(d.accent), h * 0.85), T, zA);
      slice("bold", fg(minus(d.boldLow)), T, zA);
      // sticker outline: blob minus the letters
      const blobLoops = contour(d.blob, bb[0], bb[1], bb[2], bb[3], h * 0.7, 0.025);
      const glyphLoops = d.name.groups.flatMap((g) => [g.outer, ...g.holes]);
      slice("bold", groupLoops(blobLoops.concat(glyphLoops), 0.3), zP, zR);
      if (d.second) slice("bold", d.second.groups, zP, zR);
      slice("letters", d.name.groups, zP, zT);
      if (d.med && opts.icon !== "none") slice("letters", fg(iconPlaced(opts.icon, d.med.x, d.med.y, d.med.r * 1.45), h * 0.7), zA, zI);
      for (const a of addFields) slice(a.it.slot || "bold", fg(a.f, h * 0.8), T, T + 2.0 * k);
      textHeight = d.name.h;
    } else {
      const zR = T + opts.raise;
      slice("raised", fg(minus(d.raised), h * 0.8), T, zR);
      slice("raised", d.text.flatMap((t) => t.groups), T, zR); { const tg = d.text.flatMap((t) => t.groups), rp = parts.find((q) => q.slot === "raised"); if (tg.length && rp) rp.slices[rp.slices.length - 1].text = true; }
      for (const a of addFields) slice("raised", fg(a.f, h * 0.8), T, zR + 0.4 * k);
      textHeight = d.text[d.text.length > 1 && d.text[0].h < d.text[1].h * 0.8 ? 1 : 0].h || Infinity;
    }
    return { parts, opts, textHeight, bbox: bb, fun: d.kind === "fun", med: d.med || null, spots: spotList, items };
  };

  /* ---------------- meshes, export, preview for multi-part models */
  NP.meshes = function (model) {
    const out = {};
    for (const p of model.parts) {
      const V = [], Tt = [];
      for (const s of p.slices) {
        const m = extrudeGroups(s.groups, s.z0, s.z1), off = V.length / 3;
        for (const v of m.v) V.push(v);
        for (const t of m.t) Tt.push(t + off);
      }
      out[p.slot] = { v: V, t: Tt };
    }
    return out;
  };
  function meshObj(id, name, m, pid, pindex) {
    const out = [`<object id="${id}" name="${esc(name)}" type="model"${pid ? ` pid="${pid}" pindex="${pindex}"` : ""}><mesh><vertices>`];
    for (let i = 0; i < m.v.length; i += 3) out.push(`<vertex x="${num(m.v[i])}" y="${num(m.v[i + 1])}" z="${num(m.v[i + 2])}"/>`);
    out.push("</vertices><triangles>");
    for (let i = 0; i < m.t.length; i += 3) out.push(`<triangle v1="${m.t[i]}" v2="${m.t[i + 1]}" v3="${m.t[i + 2]}"/>`);
    out.push("</triangles></mesh></object>");
    return out.join("");
  }
  // colours -> filament slots (parts that share a colour share a slot)
  NP.filamentPlan = function (model, colors) {
    const uniq = [];
    const plan = model.parts.map((p) => {
      const c = (colors[p.slot] || "#888888").toUpperCase();
      let i = uniq.indexOf(c); if (i < 0) { uniq.push(c); i = uniq.length - 1; }
      return { slot: p.slot, label: p.label, color: c, filament: i + 1 };
    });
    return { plan, colors: uniq };
  };
  NP.to3MF = function (model, colors, title, flavor = "bambu") {
    const meshes = NP.meshes(model);
    const { plan, colors: fil } = NP.filamentPlan(model, colors);
    const parts = model.parts.filter((p) => meshes[p.slot].t.length);
    const bambu = flavor === "bambu";
    const ids = parts.map((_, i) => i + 1), top = parts.length + 2;
    const objs = parts.map((p, i) => {
      const pl = plan.find((q) => q.slot === p.slot);
      return meshObj(ids[i], p.label, meshes[p.slot], bambu ? 0 : 1, pl.filament - 1);
    }).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"${bambu ? ` xmlns:BambuStudio="http://schemas.bambulab.com/package/2021"` : ""}>
<metadata name="Title">${esc(title || "Nameplate")}</metadata>
<metadata name="Application">${bambu ? "BambuStudio-02.07.01.57" : "Nameplate Maker by Creative Lab Studios"}</metadata>
${bambu ? `<metadata name="BambuStudio:3mfVersion">1</metadata>\n` : ""}<resources>
${bambu ? "" : `<basematerials id="${top + 1}">${fil.map((c, i) => `<base name="Filament ${i + 1}" displaycolor="${c}FF"/>`).join("")}</basematerials>`.replace(/^/, "")}
${bambu ? objs : objs.replace(/ pid="1"/g, ` pid="${top + 1}"`)}
<object id="${top}" name="${esc(title || "Nameplate")}" type="model"><components>${ids.map((id) => `<component objectid="${id}"/>`).join("")}</components></object>
</resources>
<build><item objectid="${top}" printable="1"/></build>
</model>`;
    const enc = new TextEncoder();
    const files = [
      { name: "[Content_Types].xml", data: enc.encode(`<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/><Default Extension="png" ContentType="image/png"/></Types>`) },
      { name: "_rels/.rels", data: enc.encode(`<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>`) },
      { name: "3D/3dmodel.model", data: enc.encode(xml) },
    ];
    if (bambu) {
      const cfg = `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <object id="${top}">
    <metadata key="name" value="${esc(title || "Nameplate")}"/>
    <metadata key="extruder" value="1"/>
${parts.map((p, i) => { const pl = plan.find((q) => q.slot === p.slot); return `    <part id="${ids[i]}" subtype="normal_part">
      <metadata key="name" value="${esc(p.label)}"/>
      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>
      <metadata key="extruder" value="${pl.filament}"/>
    </part>`; }).join("\n")}
  </object>
  <plate>
    <metadata key="plater_id" value="1"/>
    <metadata key="plater_name" value=""/>
    <metadata key="locked" value="false"/>
    <model_instance>
      <metadata key="object_id" value="${top}"/>
      <metadata key="instance_id" value="0"/>
      <metadata key="identify_id" value="100"/>
    </model_instance>
  </plate>
  <assemble>
  </assemble>
</config>`;
      files.push({ name: "Metadata/model_settings.config", data: enc.encode(cfg) });
    }
    return zipStore(files);
  };
  NP.toSVG = function (model, colors, opts = {}) {
    const [x0, y0, x1, y1] = model.bbox;
    const sl = [];
    for (const p of model.parts) for (const s of p.slices) sl.push({ slot: p.slot, s });
    sl.sort((a, b) => a.s.z1 - b.s.z1 || a.s.z0 - b.s.z0);
    const base = model.parts.find((p) => p.slot === "base");
    const shadow = base && opts.shadow !== false ? `<path d="${pathOf(base.slices[0].groups)}" fill="rgba(0,0,0,.2)" fill-rule="evenodd" transform="translate(0.9 1.4)"/>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${-y1} ${x1 - x0} ${y1 - y0}" width="${opts.width || "100%"}" ${opts.height ? `height="${opts.height}"` : ""}>` + shadow +
      sl.map(({ slot, s }) => `<path data-slot="${slot}" d="${pathOf(s.groups)}" fill="${colors[slot] || "#888"}" fill-rule="evenodd" stroke="rgba(0,0,0,.3)" stroke-width="0.25"/>`).join("") + `</svg>`;
  };

