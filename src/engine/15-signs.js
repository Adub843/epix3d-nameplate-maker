  /* =================================================================
     v7: realistic sign styles for grown-up rooms: vintage tin sign,
     neon bar sign, carved wood plaque, engraved metal plate
     ================================================================= */
  const SIGN_SLOTS = ["base", "accent", "panel", "bold", "letters", "chrome"];
  const grain = (pitch, w, seed = 0) => (x, y) => { const yy = y + 1.6 * Math.sin(x * 0.07 + seed) + 0.8 * Math.sin(x * 0.19 + y * 0.05 + seed * 2); const m = ((yy % pitch) + pitch) % pitch; return Math.abs(m - pitch / 2) - w / 2; };
  const signText = (o, font, box, track) => NP.nameBlock(o, font, box, { track });
  const emblemAt = (o, x, y, size) => (o.icon && o.icon !== "none" && I[o.icon] ? iconPlaced(o.icon, x, y, size) : null);
  const emblemShell = (o, x, y, size, w) => { if (!(o.icon && o.icon !== "none" && I[o.icon])) return S.EMPTY; const r = size / 2; const f = S.shell(S.xf(I[o.icon](), x, y, r), w), m = r * 1.3 + 9; // outside the box the icon is at least ~8 mm away
    return (px, py) => { const dx = Math.max(x - m - px, 0, px - x - m), dy = Math.max(y - m - py, 0, py - y - m); return dx > 0 || dy > 0 ? Math.sqrt(dx * dx + dy * dy) + 7 : f(px, py); }; };
  const signDesign = (label, note, labels, font, make) => ({ label, note, layered: true, sign: true, font, slots: SIGN_SLOTS, labels, itemSlot: "accent", make });

  // 1. Vintage tin sign: rolled edge, pinstripes, rivets, shadowed serif lettering, emblem roundel
  DESIGNS.tin = signDesign("Vintage Tin Sign", "Rolled edge & rivets", { base: "Sign face", accent: "Rolled edge & pinstripe", panel: "Roundel", bold: "Letter shadow", letters: "Lettering", chrome: "Rivets" }, "varsity", (o) => {
    const W = o.width, H = hgt(o, W * (o.sub ? 0.42 : 0.38)), X = W / 2, Y = H / 2, T = o.base, k = o.k;
    const shape = S.memo(S.box(0, 0, X, Y, 4));
    const comps = [{ slot: "base", f: shape, z0: 0, z1: T }];
    comps.push(...NP.stepped("accent", S.inter(shape, (x, y) => -S.box(0, 0, X - 4.2, Y - 4.2, 2)(x, y)), T, [[0, T + 0.7 * k], [0.8, T + 1.15 * k], [1.8, T + 1.4 * k]]));
    comps.push({ slot: "accent", f: S.shell(S.box(0, 0, X - 7.6, Y - 7.6, 2.5), 1.0), z0: T, z1: T + 0.5 * k });
    comps.push({ slot: "accent", f: S.shell(S.box(0, 0, X - 9.6, Y - 9.6, 2), 0.7), z0: T, z1: T + 0.5 * k });
    comps.push(...NP.stepped("chrome", S.union(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => S.circle(a * (X - 2.1), b * (Y - 2.1), 1.25))), T + 1.4 * k - 0.01, [[0, T + 1.65 * k], [0.45, T + 1.85 * k]]));
    const hasIcon = o.icon && o.icon !== "none";
    const R = Math.min(Y - 13, W * 0.15);
    const ix = -X + 13 + R;
    if (hasIcon) {
      comps.push(...NP.stepped("panel", S.circle(ix, 0, R), T, [[0, T + 0.5 * k], [0.6, T + 0.8 * k]]));
      comps.push({ slot: "accent", f: S.ring(ix, 0, R - 1.6, 0.8), z0: T + 0.8 * k - 0.01, z1: T + 1.0 * k });
      const em = emblemAt(o, ix, 0, R * 1.35);
      if (em) comps.push(...NP.stepped("base", em, T + 0.8 * k - 0.01, [[0, T + 1.3 * k], [0.3, T + 1.5 * k]]));
    }
    const tx0 = hasIcon ? ix + R + 5 : -X + 13, tx1 = X - 13;
    const nb = signText(o, o.font || "varsity", { cx: (tx0 + tx1) / 2, cy: 0, w: tx1 - tx0, h: H - 28 }, 0.05);
    // the drop shadow that gives painted tin lettering its depth
    const tf = textField(nb.groups, 4);
    // keyline + drop shadow, the way enamel and tin sign lettering is outlined (references: Castle Hotel, Dunlop, OXO signs)
    comps.push({ slot: "bold", f: S.sub(S.union((x, y) => tf(x - 0.9, y + 0.9), S.offset(tf, 0.65)), (x, y) => tf(x, y) - 0.05), z0: T, z1: T + 0.8 * k, h: o.h * 0.8 });
    comps.push({ slot: "letters", groups: nb.groups, z0: T, z1: T + 1.5 * k, isText: true });
    return { components: comps, shape, bbox: [-X, -Y, X, Y], textGroups: nb.groups, textHeight: nb.h || Infinity, avoid: hasIcon ? S.circle(ix, 0, R + 2) : S.EMPTY };
  });

  // 2. Neon bar sign: dark backboard, the name bent in glass tube, glow halo, tube border, stand-offs and clips
  DESIGNS.neon = signDesign("Neon Bar Sign", "Glass tube lettering", { base: "Backboard", accent: "Border tube", panel: "Glow", bold: "Tube clips", letters: "Neon tube", chrome: "Stand-offs" }, "sport", (o) => {
    const W = o.width, H = hgt(o, W * (o.sub ? 0.46 : 0.4)), X = W / 2, Y = H / 2, T = o.base, k = o.k;
    const shape = S.memo(S.box(0, 0, X, Y, 9));
    const comps = [{ slot: "base", f: shape, z0: 0, z1: T }];
    const tube = Math.max(1.5, Math.min(2.4, W / 95));
    const border = S.shell(S.box(0, 0, X - 6, Y - 6, 7), tube);
    const hasIcon = o.icon && o.icon !== "none";
    const R = Math.min(Y - 14, W * 0.13), ix = -X + 14 + R;
    const tx0 = hasIcon ? ix + R + 6 : -X + 15, tx1 = X - 15;
    const nb = signText(o, o.font || "sport", { cx: (tx0 + tx1) / 2, cy: 0, w: tx1 - tx0, h: H - 32 }, 0.08);
    const tf = textField(nb.groups, 6);
    const letterTube = S.shell(S.offset(tf, -tube * 0.2), tube); // the outline of each letter, as bent tube
    let iconTube = S.EMPTY;
    if (hasIcon) iconTube = emblemShell(o, ix, 0, R * 1.7, tube * 0.9);
    const glow = S.offset(S.union(letterTube, iconTube, border), tube * 1.2);
    comps.push({ slot: "panel", f: glow, z0: T, z1: T + 0.25 * k, h: o.h * 0.8 });
    comps.push(...NP.stepped("letters", S.union(letterTube, iconTube), T + 0.25 * k - 0.01, [[0, T + 1.1 * k], [tube * 0.25, T + 1.5 * k]], { h: Math.min(o.h, 0.2) }));
    comps.push(...NP.stepped("accent", border, T + 0.25 * k - 0.01, [[0, T + 1.1 * k], [tube * 0.25, T + 1.5 * k]]));
    const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => S.circle(a * (X - 3.2), b * (Y - 3.2), 1.6));
    comps.push(...NP.stepped("chrome", S.union(...corners), T, [[0, T + 0.9 * k], [0.5, T + 1.2 * k]]));
    // clips holding the border tube
    const clips = S.union(...[-0.6, -0.2, 0.2, 0.6].flatMap((t) => [S.box(t * X, Y - 6, 1.0, tube * 0.9, 0.3), S.box(t * X, -Y + 6, 1.0, tube * 0.9, 0.3)]));
    comps.push({ slot: "bold", f: clips, z0: T + 0.25 * k, z1: T + 1.65 * k });
    return { components: comps, shape, bbox: [-X, -Y, X, Y], textGroups: nb.groups, textHeight: nb.h || Infinity, avoid: hasIcon ? S.circle(ix, 0, R + 2) : S.EMPTY };
  });

  // 3. Carved wood plaque: shaped board, routed ogee edge, grain, V-carved gilded letters set below the surface
  DESIGNS.wood = signDesign("Carved Wood Plaque", "Routed edge, gilded letters", { base: "Wood", accent: "Gilding", panel: "Wood grain", bold: "Routed edge", letters: "Carved letters", chrome: "Hangers" }, "varsity", (o) => {
    const W = o.width, H = hgt(o, W * (o.sub ? 0.4 : 0.34)), X = W / 2, Y = H / 2, T = o.base, k = o.k;
    const n = Math.min(Y * 0.45, 12);
    // board with notched (scalloped) corners, the classic tavern-sign outline
    const shape = S.memo(S.sub(S.box(0, 0, X, Y, 2), ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => S.circle(a * X, b * Y, n))));
    const top = T + 1.6 * k;
    const comps = [{ slot: "base", f: shape, z0: 0, z1: T }];
    const face = S.memo(S.offset(shape, -3.2));
    comps.push(...NP.stepped("bold", S.sub(shape, face), T, [[0, T + 0.4 * k], [0.8, T + 0.8 * k], [1.6, T + 1.1 * k], [2.4, top]]));
    const hasIcon = o.icon && o.icon !== "none";
    const R = Math.min(Y - 8, W * 0.12), ix = -X + n + 6 + R;
    const tx0 = hasIcon ? ix + R + 5 : -X + n + 4, tx1 = hasIcon ? X - n - 4 : X - n - 4;
    const nb = signText(o, o.font || "varsity", { cx: (tx0 + tx1) / 2, cy: 0, w: tx1 - tx0, h: H - 18 }, 0.06);
    const tf = textField(nb.groups, 6);
    // V-carving: letters are cut into the face; the gold sits in the bottom of the cut
    const pocket = S.offset(tf, 0.5);
    let iconPocket = S.EMPTY;
    if (hasIcon && I[o.icon]) { // unbounded icon field with a safe outside bound, so the pocket offset leaves no seam
      const r = R * 0.8, f = S.xf(I[o.icon](), ix, 0, r), m = r * 1.3 + 9;
      iconPocket = S.offset((px, py) => { const dx = Math.max(ix - m - px, 0, px - ix - m), dy = Math.max(-m - py, 0, py - m); return dx > 0 || dy > 0 ? Math.sqrt(dx * dx + dy * dy) + 7 : f(px, py); }, 0.4);
    }
    const cut = S.memo(S.union(pocket, iconPocket));
    comps.push({ slot: "bold", f: S.sub(face, cut), z0: T, z1: top });
    comps.push({ slot: "letters", f: S.inter(S.offset(cut, -0.4), face), z0: T, z1: T + 1.0 * k });
    comps.push({ slot: "panel", f: S.sub(S.inter(grain(2.6, 0.9), S.offset(face, -0.6)), S.offset(cut, 0.6)), z0: top - 0.01, z1: top + 0.18 * k, h: Math.min(o.h, 0.22) });
    comps.push({ slot: "accent", f: S.shell(S.offset(shape, -4.6), 0.8), z0: top - 0.01, z1: top + 0.25 * k });
    comps.push(...NP.stepped("chrome", S.union(S.box(-X * 0.6, Y - 1.8, 4, 1.2, 0.6), S.box(X * 0.6, Y - 1.8, 4, 1.2, 0.6)), top - 0.01, [[0, top + 0.35 * k]]));
    return { components: comps, shape, bbox: [-X, -Y, X, Y], textGroups: nb.groups, textHeight: nb.h || Infinity, avoid: S.offset(cut, 2) };
  });

  // 4. Engraved metal plate on a wood backer: bevelled plate, engraved and paint-filled letters, slotted screws
  DESIGNS.metal = signDesign("Engraved Plate", "Office or door", { base: "Backer board", accent: "Metal plate", panel: "Engraving fill", bold: "Backer edge", letters: "Engraved letters", chrome: "Screws" }, "block", (o) => {
    const W = o.width, H = hgt(o, W * (o.sub ? 0.36 : 0.3)), X = W / 2, Y = H / 2, T = o.base, k = o.k;
    const shape = S.memo(S.box(0, 0, X, Y, 3));
    const comps = [{ slot: "base", f: shape, z0: 0, z1: T }];
    comps.push(...NP.stepped("bold", S.inter(shape, (x, y) => -S.box(0, 0, X - 5, Y - 5, 2)(x, y)), T, [[0, T + 0.5 * k], [1.0, T + 0.9 * k]]));
    const plate = S.box(0, 0, X - 6, Y - 6, 1.5);
    const top = T + 1.4 * k;
    const nb = signText(o, o.font || "block", { cx: 0, cy: 0, w: W - 34, h: H - 26 }, 0.14);
    const tf = textField(nb.groups, 6);
    const hasIcon = o.icon && o.icon !== "none";
    // engraved: plate face with the lettering cut in; fill sits at the bottom of the cut
    const cut = S.memo(S.union(S.offset(tf, 0.15), S.shell(S.box(0, 0, X - 9.5, Y - 9.5, 1), 0.7)));
    comps.push({ slot: "letters", f: S.offset(cut, -0.15), z0: T + 0.9 * k - 0.01, z1: T + 1.1 * k });
    comps.push(...NP.stepped("accent", S.sub(plate, cut), T + 0.9 * k - 0.01, [[0, top - 0.25 * k], [0.7, top]]));
    comps.push({ slot: "accent", f: S.inter(plate, cut), z0: T + 0.9 * k - 0.01, z1: T + 0.92 * k });
    const sx = X - 10.5;
    const screws = S.union(S.circle(-sx, 0, 2.1), S.circle(sx, 0, 2.1));
    comps.push(...NP.stepped("chrome", S.sub(screws, S.seg(-sx - 1.5, -1.5, -sx + 1.5, 1.5, 0.6), S.seg(sx - 1.5, -1.5, sx + 1.5, 1.5, 0.6)), top - 0.01, [[0, top + 0.3 * k], [0.5, top + 0.45 * k]]));
    void hasIcon;
    return { components: comps, shape, bbox: [-X, -Y, X, Y], textGroups: nb.groups, textHeight: nb.h || Infinity, avoid: S.offset(cut, 2) };
  });
  NP.SIGNS = ["tin", "neon", "wood", "metal"];
  Object.assign(PALETTES, {
    tinred: { label: "Tin red", base: P("pla:wine-red"), accent: P("pla:cream"), panel: P("pla:cream"), bold: P("pla:black"), letters: P("pla:cream"), sign: true },
    tingreen: { label: "Tin green", base: P("pla:jungle-green"), accent: P("pla:cream"), panel: P("pla:cream"), bold: P("pla:black"), letters: P("pla:cream"), sign: true },
    tinblue: { label: "Tin blue", base: P("pla:blue"), accent: P("pla:cold-white"), panel: P("pla:cold-white"), bold: P("pla:red"), letters: P("pla:cold-white"), sign: true },
    neonpink: { label: "Neon pink", base: P("pla:black"), accent: P("pro:polymaker-teal"), panel: P("pro:dark-purple"), bold: P("pla:grey"), letters: P("pla:magenta"), sign: true },
    neonblue: { label: "Neon blue", base: P("pla:black"), accent: P("pla:magenta"), panel: P("pro:blue-green"), bold: P("pla:grey"), letters: P("pla:aqua-blue"), sign: true },
    neonbeer: { label: "Neon amber", base: P("pla:black"), accent: P("pla:red"), panel: P("pla:brown"), bold: P("pla:grey"), letters: P("pla:yellow"), sign: true },
    walnut: { label: "Walnut & gold", base: P("pla:brown"), accent: P("pla:yellow"), panel: P("pro:brown"), bold: P("pla:brown"), letters: P("pla:yellow"), sign: true },
    oak: { label: "Oak & black", base: P("pro:army-beige"), accent: P("pla:black"), panel: P("pla:olive-brown"), bold: P("pro:army-beige"), letters: P("pla:black"), sign: true },
    brass: { label: "Brass on walnut", base: P("pla:brown"), accent: P("pla:yellow"), panel: P("pla:black"), bold: P("pro:brown"), letters: P("pla:black"), sign: true },
    silver: { label: "Silver on black", base: P("pla:black"), accent: P("pla:grey"), panel: P("pla:black"), bold: P("pla:steel-grey"), letters: P("pla:black"), sign: true },
  });
  NP.SIGN_PALETTES = { tin: ["tinred", "tingreen", "tinblue"], neon: ["neonpink", "neonblue", "neonbeer"], wood: ["walnut", "oak"], metal: ["brass", "silver"] };
  // signs suit grown-up subjects best
  for (const sp of SUBJECTS) if (["Music", "TV", "Drinks", "Outdoors", "Cars"].includes(sp.group) || ["workshop", "grill", "coffee", "gameroom", "books"].includes(sp.key)) sp.signs = ["neon", "tin", "wood", "metal"];

  // grown-up subjects: a few of the ten ideas become realistic signs
  const examplesV6 = NP.examplesFor;
  NP.examplesFor = function (sp) {
    const list = examplesV6(sp);
    if (!sp.signs) return list;
    const picks = { 1: "neon", 4: "tin", 6: "wood", 8: "metal" };
    return list.map((ex, i) => (picks[i] && !NP.DESIGNS[ex.design].vehicle ? Object.assign({}, ex, { design: picks[i], palette: NP.SIGN_PALETTES[picks[i]][i % NP.SIGN_PALETTES[picks[i]].length], items: [], icon: picks[i] === "metal" ? "none" : (sp.icons[0] || "star") }) : ex));
  };

  /* ---------------- colour budget: merge the least-used colours until at most `max` remain */
  NP.labDist = (a, b) => { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
  NP.limitColors = function (colors, slots, weights = {}, max = 4, pins = {}) {
    const out = Object.assign({}, colors), merges = [];
    const present = slots.filter((s) => out[s]);
    for (;;) {
      const by = {};
      for (const s of present) { const c = out[s].toUpperCase(); (by[c] = by[c] || []).push(s); }
      const cols = Object.keys(by);
      if (cols.length <= max) break;
      // cheapest colour to give up: least printed volume, never a colour the user just picked if avoidable
      const cost = (c) => by[c].reduce((t, s) => t + (weights[s] || 1) + (pins[s] ? 1e12 * pins[s] : 0), 0);
      cols.sort((a, b) => cost(a) - cost(b));
      const drop = cols[0];
      let best = null, bd = Infinity;
      for (const c of cols) if (c !== drop) { const d = NP.labDist(drop, c); if (d < bd) { bd = d; best = c; } }
      for (const s of by[drop]) out[s] = best;
      merges.push({ from: drop, to: best, slots: by[drop] });
    }
    return { colors: out, merges };
  };
  // four-colour defaults for the sign and vehicle families
  for (const k of ["neonpink", "neonblue", "neonbeer"]) PALETTES[k].chrome4 = "panel";
  NP.slotDefaults = (function (prev) {
    return (pal) => {
      const d = prev(pal), p = PALETTES[pal] || {};
      d.glass = p.glass || P("pla:grey");             // tinted, reflective glass in the chrome grey keeps cars at 4 colours
      if (p.sign) {
        if (/^neon/.test(pal)) { d.bold = p.panel; d.chrome = p.panel; }
        else if (pal === "walnut" || pal === "oak") { d.bold = p.base; d.chrome = p.accent; }
        else if (pal === "brass" || pal === "silver") { d.bold = p.base; d.chrome = p.accent; d.panel = p.letters; }
        else d.chrome = P("pla:grey");
      }
      return d;
    };
  })(NP.slotDefaults);
