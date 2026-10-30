  /* =================================================================
     v6: vehicle front-end plates. Generic era styling (no maker badges or
     model-specific trade dress); the name sits in the open grille.
     ================================================================= */
  const trap = (y0, y1, hw0, hw1, round) => S.offset(S.poly([[-hw0 + round, y0 + round], [hw0 - round, y0 + round], [hw1 - round, y1 - round], [-hw1 + round, y1 - round]]), round);
  const mirrorX = (f) => (x, y) => f(Math.abs(x), y);
  const both = (fn) => S.union(fn(1), fn(-1));
  const ringOut = (f, w) => (x, y) => { const v = f(x, y); return Math.max(-v, v - w); }; // band of width w just outside f
  const stripesH = (pitch, w, y0 = 0) => (x, y) => { const m = (((y - y0) % pitch) + pitch) % pitch; return Math.abs(m - pitch / 2) - w / 2; };
  const stripesV = (pitch, w, x0 = 0) => (x, y) => { const m = (((x - x0) % pitch) + pitch) % pitch; return Math.abs(m - pitch / 2) - w / 2; };
  const diamond = (pitch, w) => { const a = stripesH(pitch, w), b = stripesV(pitch, w); return (x, y) => { const u = (x + y) * Math.SQRT1_2, v = (x - y) * Math.SQRT1_2; return Math.min(a(u, v), b(u, v)); }; };
  const eggcrate = (pitch, w, x0, y0) => S.union(stripesH(pitch, w, y0), stripesV(pitch * 1.25, w, x0));
  const hexmesh = (r, w) => (x, y) => { // honeycomb walls
    const sx = r * Math.sqrt(3), sy = r * 1.5;
    let best = -Infinity;
    const j0 = Math.round(y / sy);
    for (let j = j0 - 1; j <= j0 + 1; j++) {
      const ox = (j & 1) ? sx / 2 : 0, i0 = Math.round((x - ox) / sx);
      for (let i = i0 - 1; i <= i0 + 1; i++) {
        const cx = i * sx + ox, cy = j * sy, dx = Math.abs(x - cx), dy = Math.abs(y - cy);
        const hexd = Math.max(dx, dx * 0.5 + dy * 0.8660254) - r * 0.8660254; // inside hex is negative
        if (-hexd > best) best = -hexd;
      }
    }
    return best - w / 2;
  };

  // generic badges for the hood or grille (pick one, or use your own initial)
  NP.BADGES = { none: "No badge", oval: "Oval", shield: "Shield", wings: "Wings", star: "Star roundel", initial: "Your initial" };
  function badgeField(kind, x, y, r, text) {
    if (!kind || kind === "none") return S.EMPTY;
    let f;
    if (kind === "oval") f = S.union(S.shell(S.ellipse(x, y, r, r * 0.58), r * 0.16), S.box(x, y, r * 0.62, r * 0.09, r * 0.05));
    else if (kind === "shield") {
      const sh = S.offset(S.poly([[x - r * 0.62, y + r * 0.72], [x + r * 0.62, y + r * 0.72], [x + r * 0.62, y - r * 0.05], [x, y - r * 0.85], [x - r * 0.62, y - r * 0.05]]), r * 0.12);
      f = S.union(S.shell(sh, r * 0.16), S.seg(x, y + r * 0.6, x, y - r * 0.6, r * 0.12), S.seg(x - r * 0.55, y + r * 0.2, x + r * 0.55, y + r * 0.2, r * 0.12));
    } else if (kind === "wings") {
      const wing = (m) => {
        const pts = [[x + m * r * 0.32, y + r * 0.18], [x + m * r * 1.75, y + r * 0.5], [x + m * r * 1.55, y + r * 0.22], [x + m * r * 1.7, y + r * 0.08], [x + m * r * 1.38, y - r * 0.08], [x + m * r * 1.45, y - r * 0.22], [x + m * r * 0.32, y - r * 0.2]];
        const cuts = [0.75, 1.05, 1.32].map((t) => S.seg(x + m * r * t, y - r * 0.2, x + m * r * (t + 0.18), y + r * 0.36, r * 0.07));
        return S.sub(S.poly(pts), ...cuts);
      };
      f = S.union(S.ring(x, y, r * 0.42, r * 0.14), S.circle(x, y, r * 0.16), wing(1), wing(-1));
    } else if (kind === "star") f = S.union(S.ring(x, y, r * 0.86, r * 0.16), S.star(x, y, r * 0.64, r * 0.27, 5, Math.PI / 2));
    else if (kind === "initial") {
      const ch = ((text || "N").replace(/[^A-Za-z0-9]/g, "")[0] || "N").toUpperCase();
      const t = fitText(ch, "varsity", { cx: x, cy: y, w: r * 1.15, h: r * 1.1 });
      const tf = textField(t.groups, 3);
      f = S.union(S.ring(x, y, r * 0.86, r * 0.15), tf);
    }
    return S.bounded(f, x - r * 2, y - r * 1.2, x + r * 2, y + r * 1.2);
  }
  NP.badgeField = badgeField;

  /* the kit: silhouette, tires, bumper, glass, grille (+ surround, texture), lights, extras, badge, name */
  function vehicle(o, v) {
    const T = o.base, k = o.k;
    const z = { tire: T + 0.75 * k, tireIn: T + 0.4 * k, bump: T + 1.25 * k, body1: T + 0.45 * k, body2: T + 0.8 * k, glass: T + 0.3 * k,
      gr: T + 0.35 * k, bar: T + 0.95 * k, chrome: T + 1.35 * k, lens: T + 1.0 * k, letter: T + 2.0 * k, badge: T + 1.6 * k };
    const comps = [];
    const sil = S.memo(v.body);
    const tires = v.tires ? S.memo(v.tires) : null;
    const shape = S.memo(tires ? S.union(sil, tires) : sil);
    // openings punched through the raised body panel
    const lightsAll = (v.lights || []).map((L) => L.bezel || L.lens);
    const openings = S.memo(S.union(v.grille ? S.offset(v.grille, v.surround ?? 2.4) : S.EMPTY, v.glass || S.EMPTY, v.bumper || S.EMPTY, ...lightsAll, ...(v.openings || [])));
    comps.push({ slot: "base", f: shape, z0: 0, z1: T });
    if (tires) {
      comps.push({ slot: "tires", f: tires, z0: 0, z1: z.tireIn });
      comps.push({ slot: "tires", f: S.sub(tires, S.inter(stripesH(v.tread || 3.2, 1.0), S.offset(tires, -1.2))), z0: z.tireIn, z1: z.tire });
    }
    if (v.bumper) comps.push(...NP.stepped(v.bumperSlot || "chrome", v.bumper, 0, [[0, z.bump - 0.35 * k], [0.7, z.bump]]));
    const bodyTop = S.memo(S.sub(sil, openings, tires ? S.offset(tires, 0.01) : S.EMPTY));
    comps.push(...NP.stepped("base", bodyTop, T, [[0.9, z.body1], [1.7, z.body2]]));
    for (const e of v.bodyExtras || []) comps.push(...NP.stepped("base", e, z.body2 - 0.01, [[0.6, z.body2 + 0.35 * k]]));
    if (v.glass) {
      comps.push({ slot: "glass", f: v.glass, z0: T, z1: z.glass });
      if (!(o.features && o.features.glare === false)) comps.push({ slot: "lights", f: S.inter(S.union(S.seg(...v.glare1, 2.2), S.seg(...v.glare2, 1.2)), S.offset(v.glass, -2)), z0: z.glass, z1: z.glass + 0.25 * k });
    }
    // name in the grille
    const font = o.font || v.font || "block";
    const nb = NP.nameBlock(o, font, v.textBox, { track: v.track ?? 0.06 });
    const tf = nb.groups.length ? S.memo(textField(nb.groups, 6)) : S.EMPTY;
    if (v.grille) {
      comps.push({ slot: "grille", f: v.grille, z0: T, z1: z.gr });
      if (v.surround !== 0) comps.push(...NP.stepped("chrome", ringOut(v.grille, v.surround || 2.4), T, [[0, z.chrome - 0.35 * k], [0.5, z.chrome]]));
      if (v.texture) { const tb = groupsBBox(nb.groups); const clear = v.clearBox && tb ? S.box((tb[0] + tb[2]) / 2, (tb[1] + tb[3]) / 2, (tb[2] - tb[0]) / 2 + 2.2, (tb[3] - tb[1]) / 2 + 1.8, 1.2) : S.offset(tf, 1.7);
        comps.push({ slot: v.textureSlot || "chrome", f: S.sub(S.inter(v.texture, S.offset(v.grille, -0.7)), clear, ...(v.textureKeepOut || [])), z0: z.gr, z1: z.bar, h: o.h * 0.8 }); }
    }
    for (const L of v.lights || []) {
      if (L.bezel) comps.push(...NP.stepped(L.bezelSlot || "chrome", S.sub(L.bezel, L.lens), T, [[0, z.chrome - 0.3 * k], [0.45, z.chrome]]));
      comps.push(...NP.stepped(L.slot || "lights", L.lens, T, [[0, z.lens - 0.35 * k], [Math.min(1.2, (L.dome || 0.9)), z.lens]]));
      if (L.detail) comps.push({ slot: L.detailSlot || "chrome", f: S.inter(L.detail, S.offset(L.lens, -0.8)), z0: z.lens - 0.35 * k, z1: z.lens + 0.15 * k });
    }
    for (const e of v.extras || []) comps.push(...(e.steps ? NP.stepped(e.slot, e.f, e.z0 ?? T, e.steps.map(([i, dz]) => [i, T + dz * k])) : [{ slot: e.slot, f: e.f, z0: e.z0 ?? T, z1: T + (e.top || 1.3) * k }]));
    if (v.badge && o.badge && o.badge !== "none") {
      const bf = badgeField(o.badge, v.badge.x, v.badge.y, v.badge.r, o.text);
      comps.push(...NP.stepped("chrome", bf, T, [[0, z.badge - 0.3 * k], [0.25, z.badge]]));
    }
    if (nb.groups.length) comps.push({ slot: "letters", groups: nb.groups, z0: v.grille ? z.gr : T, z1: z.letter, isText: true });
    const avoid = S.offset(openings, 1.5);
    return { components: comps, shape, bbox: v.bbox, textGroups: nb.groups, textHeight: nb.h || Infinity, avoid, free: S.offset(bodyTop, 2.5) };
  }

  const VEH_SLOTS = ["base", "chrome", "grille", "letters", "lights", "tires", "glass", "accent"];
  const VEH_LABELS = { base: "Body paint", chrome: "Chrome", grille: "Grille", letters: "Name", lights: "Lights", tires: "Tires & trim", glass: "Windshield", accent: "Stripes & decals" };
  const vdesign = (label, note, ratio, font, build) => ({
    label, note, layered: true, vehicle: true, font, slots: VEH_SLOTS, labels: VEH_LABELS, itemSlot: "accent", ratio,
    make(o) {
      const W = o.width, H = hgt(o, W * ratio), X = W / 2, Y = H / 2, f = (t) => -Y + t * H;
      const v = build(W, H, X, Y, f, o);
      v.bbox = v.bbox || [-X, -Y, X, Y];
      v.glare1 = v.glare1 || [0, 0, 0, 0]; v.glare2 = v.glare2 || [0, 0, 0, 0];
      return vehicle(o, v);
    },
  });
  const tirePair = (x, y, hw, hh, r) => both((m) => S.box(m * x, y, hw, hh, r));
  const glareFor = (gx, y0, y1) => ({ glare1: [gx - 0.06 * (y1 - y0), y0 + 0.2 * (y1 - y0), gx + 0.12 * (y1 - y0), y0 + 0.8 * (y1 - y0)], glare2: [gx + 0.05 * (y1 - y0), y0 + 0.25 * (y1 - y0), gx + 0.2 * (y1 - y0), y0 + 0.7 * (y1 - y0)] });

  DESIGNS.cruiser50 = vdesign("'50s Cruiser", "Chrome & fins", 0.56, "sport", (W, H, X, Y, f) => {
    const tires = tirePair(0.33 * W, f(0.08), 0.085 * W, 0.08 * H, 0.025 * W);
    const fenders = both((m) => S.ellipse(m * 0.355 * W, f(0.56), 0.145 * W, 0.115 * H));
    const body = S.union(S.box(0, f(0.33), X - 0.6, 0.27 * H, 0.07 * W), fenders, trap(f(0.5), f(0.985), 0.34 * W, 0.255 * W, 4));
    const grille = S.box(0, f(0.335), 0.27 * W, 0.098 * H, 0.098 * H);
    const lights = [-1, 1].map((m) => ({ lens: S.circle(m * 0.355 * W, f(0.6), 0.052 * W), bezel: S.circle(m * 0.355 * W, f(0.6), 0.052 * W + 2.3), dome: 1.2,
      detail: S.ring(m * 0.355 * W, f(0.6), 0.026 * W, 0.7) }))
      .concat([-1, 1].map((m) => ({ lens: S.ellipse(m * 0.355 * W, f(0.43), 0.032 * W, 0.022 * H), bezel: S.ellipse(m * 0.355 * W, f(0.43), 0.032 * W + 1.3, 0.022 * H + 1.3) })));
    const bumper = S.union(S.box(0, f(0.125), X - 1, 0.07 * H, 0.06 * H));
    const bullets = both((m) => S.circle(m * 0.165 * W, f(0.19), 0.03 * W));
    const jet = S.offset(S.poly([[-0.05 * W, f(0.585)], [0.05 * W, f(0.585)], [0.012 * W, f(0.615)], [0, f(0.64)], [-0.012 * W, f(0.615)]]), 0.4);
    const g = trap(f(0.64), f(0.925), 0.295 * W, 0.225 * W, 3);
    return Object.assign({ body, tires, grille, surround: 2.6, glass: g, bumper, lights, texture: S.union(stripesH(0.065 * H, 1.3, f(0.335) + 0.0325 * H)), font: "sport",
      extras: [{ slot: "chrome", f: bullets, steps: [[0, 1.2], [0.9, 1.65], [1.8, 1.9]] }, { slot: "chrome", f: jet, steps: [[0, 1.0], [0.4, 1.3]] }],
      textBox: { cx: 0, cy: f(0.335), w: 0.54 * W - 0.15 * H, h: 0.196 * H - 4.2 }, badge: { x: 0, y: f(0.505), r: 0.036 * W } }, glareFor(-0.12 * W, f(0.64), f(0.925)));
  });

  DESIGNS.pickup50 = vdesign("'50s Pickup", "Round fenders", 0.6, "varsity", (W, H, X, Y, f) => {
    const tires = tirePair(0.36 * W, f(0.08), 0.08 * W, 0.08 * H, 0.025 * W);
    const fenders = both((m) => S.box(m * 0.355 * W, f(0.36), 0.142 * W, 0.235 * H, 0.12 * W));
    const body = S.union(fenders, S.box(0, f(0.37), 0.25 * W, 0.25 * H, 0.05 * W), S.box(0, f(0.6), 0.27 * W, 0.08 * H, 0.06 * W), trap(f(0.6), f(0.985), 0.3 * W, 0.26 * W, 4));
    const grille = S.box(0, f(0.37), 0.2 * W, 0.16 * H, 0.035 * W);
    const lights = [-1, 1].map((m) => ({ lens: S.circle(m * 0.355 * W, f(0.47), 0.058 * W), bezel: S.circle(m * 0.355 * W, f(0.47), 0.058 * W + 2.4), dome: 1.3, detail: S.ring(m * 0.355 * W, f(0.47), 0.03 * W, 0.7) }));
    const bumper = S.box(0, f(0.13), X - 1, 0.05 * H, 1.5);
    const g = trap(f(0.7), f(0.93), 0.262 * W, 0.232 * W, 2.5);
    return Object.assign({ body, tires, grille, surround: 2.8, glass: g, bumper, lights, texture: stripesH(0.064 * H, 2.0, f(0.37) + 0.032 * H), font: "varsity",
      extras: [{ slot: "chrome", f: both((m) => S.box(m * 0.17 * W, f(0.13), 0.022 * W, 0.068 * H, 1.2)), steps: [[0, 1.5], [0.6, 1.8]] }],
      textBox: { cx: 0, cy: f(0.37), w: 0.37 * W, h: 0.29 * H }, badge: { x: 0, y: f(0.6), r: 0.032 * W } }, glareFor(-0.12 * W, f(0.7), f(0.93)));
  });

  DESIGNS.muscle60 = vdesign("'60s Muscle", "Quad lights", 0.44, "block", (W, H, X, Y, f) => {
    const tires = tirePair(0.37 * W, f(0.08), 0.1 * W, 0.08 * H, 0.02 * W);
    const body = S.union(S.box(0, f(0.4), X - 0.5, 0.31 * H, 0.03 * W), trap(f(0.64), f(0.985), 0.36 * W, 0.29 * W, 4));
    const grille = S.box(0, f(0.45), 0.47 * W, 0.15 * H, 2);
    const hx = [0.415, 0.325], lr = 0.037 * W;
    const lights = [];
    for (const m of [-1, 1]) for (const x of hx) lights.push({ lens: S.circle(m * x * W, f(0.45), lr), bezel: S.circle(m * x * W, f(0.45), lr + 1.6), dome: 1.0, detail: S.ring(m * x * W, f(0.45), lr * 0.45, 0.6) });
    const keepOut = [S.offset(S.union(...lights.map((L) => L.bezel)), 1.0)];
    const bumper = S.box(0, f(0.13), X - 0.6, 0.04 * H, 1.6);
    const g = trap(f(0.73), f(0.935), 0.322 * W, 0.262 * W, 2.5);
    const dome = S.box(0, f(0.665), 0.13 * W, 0.03 * H, 0.02 * W);
    return Object.assign({ body, tires, grille, surround: 2.0, glass: g, bumper, lights, texture: S.union(stripesH(2.6, 0.9), S.box(0, f(0.45), 0.27 * W + 1.6, 0.8, 0.2)), textureKeepOut: keepOut,
      bodyExtras: [dome],
      extras: [{ slot: "grille", f: S.box(0, f(0.665), 0.085 * W, 0.012 * H, 0.008 * W), steps: [[0, 1.2]] },
        { slot: "lights", f: both((m) => S.box(m * 0.21 * W, f(0.13), 0.04 * W, 0.016 * H, 0.6)), steps: [[0, 1.45]] }],
      textBox: { cx: 0, cy: f(0.45), w: 0.5 * W, h: 0.24 * H }, badge: null }, glareFor(-0.14 * W, f(0.73), f(0.935)));
  });

  DESIGNS.classic70 = vdesign("'70s Classic", "Egg-crate grille", 0.5, "varsity", (W, H, X, Y, f) => {
    const tires = tirePair(0.36 * W, f(0.08), 0.09 * W, 0.08 * H, 0.02 * W);
    const body = S.union(S.box(0, f(0.37), X - 0.5, 0.29 * H, 0.02 * W), trap(f(0.6), f(0.985), 0.4 * W, 0.3 * W, 3));
    const grille = S.box(0, f(0.42), 0.25 * W, 0.135 * H, 1.5);
    const lights = [-1, 1].map((m) => ({ lens: S.circle(m * 0.39 * W, f(0.42), 0.05 * W), bezel: S.box(m * 0.39 * W, f(0.42), 0.072 * W, 0.072 * W, 2), dome: 1.2, detail: S.ring(m * 0.39 * W, f(0.42), 0.024 * W, 0.6) }))
      .concat([-1, 1].map((m) => ({ lens: S.box(m * 0.455 * W, f(0.26), 0.03 * W, 0.022 * H, 1) })));
    const bumper = S.box(0, f(0.15), X - 0.5, 0.075 * H, 0.025 * H);
    const g = trap(f(0.69), f(0.94), 0.36 * W, 0.272 * W, 2);
    return Object.assign({ body, tires, grille, surround: 2.6, glass: g, bumper, lights, texture: eggcrate(4.6, 1.0, 0, f(0.42)), clearBox: true,
      extras: [{ slot: "tires", f: S.box(0, f(0.15), X - 4, 0.016 * H, 0.6), z0: undefined, steps: [[0, 1.55]] },
        { slot: "tires", f: both((m) => S.box(m * 0.2 * W, f(0.15), 0.018 * W, 0.06 * H, 1.2)), steps: [[0, 1.6], [0.5, 1.8]] }],
      textBox: { cx: 0, cy: f(0.42), w: 0.48 * W, h: 0.22 * H }, badge: { x: 0, y: f(0.615), r: 0.03 * W } }, glareFor(-0.15 * W, f(0.69), f(0.94)));
  });

  DESIGNS.boxy80 = vdesign("'80s Boxy", "Square headlamps", 0.5, "block", (W, H, X, Y, f) => {
    const tires = tirePair(0.36 * W, f(0.08), 0.09 * W, 0.08 * H, 0.015 * W);
    const body = S.union(S.box(0, f(0.35), X - 0.5, 0.27 * H, 0.012 * W), trap(f(0.56), f(0.985), 0.42 * W, 0.33 * W, 1.6));
    const grille = S.box(0, f(0.44), 0.22 * W, 0.1 * H, 1);
    const lights = [-1, 1].map((m) => ({ lens: S.box(m * 0.345 * W, f(0.44), 0.095 * W, 0.058 * H, 1), bezel: S.box(m * 0.345 * W, f(0.44), 0.095 * W + 1.7, 0.058 * H + 1.7, 1.6), dome: 0.7,
      detail: S.union(stripesV(0.063 * W, 0.7, m * 0.345 * W + 0.0315 * W), S.box(m * 0.345 * W, f(0.44), 0.095 * W, 0.4, 0)) }))
      .concat([-1, 1].map((m) => ({ lens: S.box(m * 0.475 * W, f(0.44), 0.018 * W, 0.058 * H, 1) })));
    const bumper = S.box(0, f(0.17), X - 0.5, 0.075 * H, 2.4);
    const g = trap(f(0.64), f(0.94), 0.38 * W, 0.305 * W, 1.6);
    return Object.assign({ body, tires, grille, surround: 1.8, glass: g, bumper, bumperSlot: "tires", lights, texture: stripesH(3.0, 1.2, f(0.44)),
      extras: [{ slot: "chrome", f: S.box(0, f(0.19), X - 3, 0.011 * H, 0.4), steps: [[0, 1.5]] }],
      textBox: { cx: 0, cy: f(0.44), w: 0.42 * W, h: 0.17 * H }, badge: { x: 0, y: f(0.58), r: 0.028 * W } }, glareFor(-0.16 * W, f(0.64), f(0.94)));
  });

  DESIGNS.aero90 = vdesign("'90s Aero", "Smooth & round", 0.5, "sport", (W, H, X, Y, f) => {
    const tires = tirePair(0.35 * W, f(0.08), 0.09 * W, 0.08 * H, 0.03 * W);
    const body = S.union(S.box(0, f(0.35), X - 0.5, 0.27 * H, 0.1 * W), trap(f(0.52), f(0.985), 0.38 * W, 0.27 * W, 7));
    const lamp = (m) => S.offset(S.poly([[m * 0.2 * W, f(0.495)], [m * 0.44 * W, f(0.55)], [m * 0.465 * W, f(0.47)], [m * 0.24 * W, f(0.425)]].map((p) => p)), 2.2);
    const lights = [-1, 1].map((m) => ({ lens: S.offset(lamp(m), -1.4), bezel: lamp(m), bezelSlot: "grille", dome: 1.0, detail: S.circle(m * 0.36 * W, f(0.49), 0.022 * W) }))
      .concat([-1, 1].map((m) => ({ lens: S.circle(m * 0.4 * W, f(0.24), 0.026 * W), bezel: S.circle(m * 0.4 * W, f(0.24), 0.026 * W + 1.4), bezelSlot: "grille" })));
    const grille = S.box(0, f(0.245), 0.3 * W, 0.09 * H, 0.06 * H);
    const upper = S.box(0, f(0.49), 0.09 * W, 0.034 * H, 0.034 * H);
    const g = trap(f(0.62), f(0.935), 0.335 * W, 0.24 * W, 4);
    return Object.assign({ body, tires, grille, surround: 0, glass: g, lights, openings: [upper], texture: S.union(stripesH(0.06 * H, 1.1, f(0.245) + 0.03 * H)), textureSlot: "grille",
      extras: [{ slot: "grille", f: upper, steps: [[0, 0.35]] }, { slot: "chrome", f: S.ellipse(0, f(0.49), 0.03 * W, 0.022 * H), steps: [[0, 1.0], [0.5, 1.3]] }],
      textBox: { cx: 0, cy: f(0.245), w: 0.56 * W - 0.1 * H, h: 0.14 * H }, badge: null }, glareFor(-0.12 * W, f(0.62), f(0.935)));
  });

  DESIGNS.truck = vdesign("Modern Truck", "Big grille", 0.62, "block", (W, H, X, Y, f) => {
    const tires = tirePair(0.37 * W, f(0.075), 0.1 * W, 0.075 * H, 0.02 * W);
    const mirrors = both((m) => S.box(m * 0.455 * W, f(0.71), 0.04 * W, 0.045 * H, 2));
    const body = S.union(S.box(0, f(0.36), X - 0.5, 0.29 * H, 0.025 * W), trap(f(0.6), f(0.985), 0.41 * W, 0.36 * W, 3), mirrors, both((m) => S.box(m * 0.42 * W, f(0.68), 0.02 * W, 0.012 * H, 0)));
    const grille = S.box(0, f(0.43), 0.32 * W, 0.18 * H, 0.025 * W);
    const housing = (m) => S.box(m * 0.425 * W, f(0.52), 0.068 * W, 0.05 * H, 2);
    const lights = [-1, 1].map((m) => ({ lens: S.circle(m * 0.4 * W, f(0.52), 0.022 * W), bezel: housing(m), bezelSlot: "grille", dome: 0.8 }))
      .concat([-1, 1].map((m) => ({ lens: S.circle(m * 0.37 * W, f(0.165), 0.022 * W), bezel: S.circle(m * 0.37 * W, f(0.165), 0.022 * W + 1.5), bezelSlot: "grille" })));
    const ledC = both((m) => S.inter(S.shell(S.box(m * 0.425 * W, f(0.52), 0.054 * W, 0.034 * H, 1.6), 1.2), (x) => m * x - 0.43 * W));
    const bumper = S.box(0, f(0.16), X - 0.5, 0.075 * H, 3);
    const g = trap(f(0.69), f(0.94), 0.37 * W, 0.322 * W, 2.5);
    return Object.assign({ body, tires, grille, surround: 3.6, glass: g, bumper, lights, texture: S.union(hexmesh(3.0, 0.9), S.box(0, f(0.43) + 0.12 * H, 0.31 * W, 1.6, 0.4), S.box(0, f(0.43) - 0.12 * H, 0.31 * W, 1.6, 0.4)),
      extras: [{ slot: "lights", f: ledC, steps: [[0, 1.35]] }, { slot: "grille", f: S.box(0, f(0.12), 0.16 * W, 0.03 * H, 1.5), steps: [[0, 1.55]] },
        { slot: "tires", f: both((m) => S.box(m * 0.25 * W, f(0.115), 0.016 * W, 0.022 * H, 0.8)), steps: [[0, 1.6]] }],
      textBox: { cx: 0, cy: f(0.43), w: 0.6 * W, h: 0.2 * H }, badge: { x: 0, y: f(0.61) + 1.2, r: 0.03 * W } }, glareFor(-0.15 * W, f(0.69), f(0.94)));
  });

  DESIGNS.van = vdesign("Delivery Van", "Tall & friendly", 0.72, "block", (W, H, X, Y, f) => {
    const tires = tirePair(0.35 * W, f(0.07), 0.085 * W, 0.07 * H, 0.02 * W);
    const mirrors = both((m) => S.union(S.box(m * 0.475 * W, f(0.6), 0.025 * W, 0.055 * H, 1.6), S.seg(m * 0.44 * W, f(0.62), m * 0.47 * W, f(0.62), 1.6)));
    const body = S.union(S.box(0, f(0.3), 0.45 * W, 0.24 * H, 0.04 * W), trap(f(0.45), f(0.99), 0.45 * W, 0.405 * W, 0.05 * W), mirrors);
    const grille = S.box(0, f(0.36), 0.25 * W, 0.075 * H, 2);
    const lights = [-1, 1].map((m) => ({ lens: S.box(m * 0.36 * W, f(0.37), 0.055 * W, 0.045 * H, 2), bezel: S.box(m * 0.36 * W, f(0.37), 0.055 * W + 1.5, 0.045 * H + 1.5, 2.5), bezelSlot: "grille", dome: 0.9,
      detail: S.circle(m * 0.37 * W, f(0.37), 0.02 * W) }));
    const bumper = S.box(0, f(0.15), 0.455 * W, 0.06 * H, 3);
    const g = trap(f(0.53), f(0.925), 0.4 * W, 0.355 * W, 3);
    const markers = S.union(...[-1, 0, 1].map((m) => S.box(m * 0.06 * W, f(0.965), 0.018 * W, 0.007 * H, 0.5)));
    return Object.assign({ body, tires, grille, surround: 2.2, glass: g, bumper, bumperSlot: "tires", lights, texture: stripesH(0.05 * H, 1.2, f(0.36) + 0.025 * H),
      extras: [{ slot: "lights", f: markers, steps: [[0, 1.0]] }, { slot: "chrome", f: S.box(0, f(0.12), 0.08 * W, 0.028 * H, 0.6), steps: [[0, 1.45]] }],
      textBox: { cx: 0, cy: f(0.36), w: 0.46 * W, h: 0.12 * H }, badge: { x: 0, y: f(0.47), r: 0.03 * W } }, glareFor(-0.18 * W, f(0.53), f(0.925)));
  });

  DESIGNS.offroad = vdesign("4x4 Off-Road", "Light bar & winch", 0.58, "block", (W, H, X, Y, f) => {
    const tires = S.union(tirePair(0.36 * W, f(0.1), 0.11 * W, 0.1 * H, 0.03 * W));
    const flares = both((m) => S.offset(S.poly([[m * 0.37 * W, f(0.6)], [m * 0.495 * W, f(0.55)], [m * 0.495 * W, f(0.24)], [m * 0.37 * W, f(0.24)]]), 0.5));
    const body = S.union(S.box(0, f(0.41), 0.4 * W, 0.27 * H, 0.015 * W), flares, S.box(0, f(0.78), 0.38 * W, 0.2 * H, 0.02 * W));
    const grille = S.box(0, f(0.43), 0.19 * W, 0.13 * H, 1.5);
    const lights = [-1, 1].map((m) => ({ lens: S.circle(m * 0.27 * W, f(0.44), 0.05 * W), bezel: S.circle(m * 0.27 * W, f(0.44), 0.05 * W + 2.0), bezelSlot: "grille", dome: 1.2, detail: S.ring(m * 0.27 * W, f(0.44), 0.024 * W, 0.6) }));
    const bar = S.box(0, f(0.97), 0.3 * W, 0.022 * H, 1.2);
    const pods = S.union(...[-3, -2, -1, 0, 1, 2, 3].map((i) => S.box(i * 0.083 * W, f(0.97), 0.034 * W, 0.012 * H, 0.6)));
    const bumper = S.box(0, f(0.215), 0.43 * W, 0.06 * H, 1);
    const g = S.box(0, f(0.78), 0.34 * W, 0.14 * H, 1.6);
    return Object.assign({ body: S.union(body, bar), tires, grille, surround: 2.0, glass: g, bumper, bumperSlot: "tires", lights, texture: diamond(3.6, 0.9), clearBox: true, openings: [bar], tread: 4.2,
      bodyExtras: [flares], extras: [{ slot: "tires", f: S.inter(S.shell(flares, 2.2), (x, y) => y - f(0.33)), steps: [[0, 1.3]] }, { slot: "grille", f: bar, steps: [[0, 0.6]] }, { slot: "lights", f: pods, steps: [[0, 1.0]] },
        { slot: "chrome", f: S.box(0, f(0.215), 0.06 * W, 0.022 * H, 0.8), steps: [[0, 1.5], [0.4, 1.8]] }, { slot: "chrome", f: both((m) => S.ring(m * 0.32 * W, f(0.215), 0.016 * W, 1.6)), steps: [[0, 1.6]] }],
      textBox: { cx: 0, cy: f(0.43), w: 0.35 * W, h: 0.21 * H }, badge: { x: 0, y: f(0.6), r: 0.022 * W } }, glareFor(-0.18 * W, f(0.64), f(0.92)));
  });

  DESIGNS.supercar = vdesign("Supercar", "Low & wide", 0.4, "sport", (W, H, X, Y, f) => {
    const tires = tirePair(0.375 * W, f(0.1), 0.1 * W, 0.1 * H, 0.02 * W);
    const body = S.union(S.offset(S.poly([[-X + 3, f(0.1)], [X - 3, f(0.1)], [X - 3, f(0.44)], [0.4 * W, f(0.6)], [-0.4 * W, f(0.6)], [-X + 3, f(0.44)]]), 3), trap(f(0.52), f(0.985), 0.32 * W, 0.18 * W, 6));
    const grille = S.offset(S.poly([[-0.3 * W, f(0.21)], [0.3 * W, f(0.21)], [0.355 * W, f(0.33)], [0.27 * W, f(0.43)], [-0.27 * W, f(0.43)], [-0.355 * W, f(0.33)]]), 1.2);
    const lamp = (m) => S.offset(S.poly([[m * 0.22 * W, f(0.53)], [m * 0.43 * W, f(0.555)], [m * 0.465 * W, f(0.5)], [m * 0.29 * W, f(0.47)]]), 1.4);
    const lights = [-1, 1].map((m) => ({ lens: S.offset(lamp(m), -1.1), bezel: lamp(m), bezelSlot: "grille", dome: 0.6 }));
    const sides = both((m) => S.offset(S.poly([[m * 0.4 * W, f(0.2)], [m * 0.475 * W, f(0.2)], [m * 0.475 * W, f(0.38)]]), 1));
    const g = trap(f(0.6), f(0.94), 0.27 * W, 0.15 * W, 4);
    return Object.assign({ body, tires, grille, surround: 0, glass: g, lights, openings: [sides], texture: hexmesh(2.6, 0.8), clearBox: true, textureSlot: "chrome",
      extras: [{ slot: "grille", f: sides, steps: [[0, 0.35]] }, { slot: "tires", f: S.box(0, f(0.14), 0.42 * W, 0.022 * H, 1), steps: [[0, 1.2]] },
        { slot: "lights", f: both((m) => S.seg(m * 0.25 * W, f(0.515), m * 0.43 * W, f(0.54), 1.0)), z0: undefined, steps: [[0, 1.15]] }],
      textBox: { cx: 0, cy: f(0.32), w: 0.56 * W, h: 0.15 * H }, badge: { x: 0, y: f(0.52), r: 0.022 * W } }, glareFor(-0.08 * W, f(0.6), f(0.94)));
  });
  NP.VEHICLES = ["cruiser50", "pickup50", "muscle60", "classic70", "boxy80", "aero90", "truck", "van", "offroad", "supercar"];

  // body-colour palettes for the vehicle plates (Polymaker colours)
  const paint = (label, body, letters = "pla:cold-white", accent = "pla:cold-white") => ({ label, base: P(body), accent: P(accent), panel: P("pla:cold-white"), bold: P("pla:black"), letters: P(letters), vehicle: true });
  Object.assign(PALETTES, {
    cherry: paint("Cherry red", "pla:red"), turquoise: paint("Turquoise", "pla:polymaker-teal"), seafoam: paint("Seafoam", "pro:light-green"),
    skyblue: paint("Sky blue", "pro:light-blue"), midnight: paint("Midnight", "pla:blue"), sunburst: paint("Sunburst", "pla:yellow", "pla:cold-white", "pla:black"),
    tangerine: paint("Tangerine", "pro:orange"), pearl: paint("Pearl white", "pla:cold-white", "pla:cold-white", "pla:red"), jet: paint("Jet black", "pla:black", "pla:cold-white", "pla:red"),
    forest: paint("Forest", "pla:jungle-green", "pla:cream", "pla:cream"), army: paint("Army green", "pro:army-green", "pla:cream", "pla:cream"), desert: paint("Desert sand", "pro:army-beige"),
    plum: paint("Plum", "pla:purple"), creamsicle: paint("Cream", "pla:cream", "pla:cold-white", "pla:red"), steel: paint("Gunmetal", "pla:steel-grey"),
  });
