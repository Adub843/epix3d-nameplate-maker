  /* =================================================================
     v7: realistic vehicle front ends. Each one is drawn in real-world
     metres (true width/height, hood line, bumper height, era-correct
     headlamp sizes) and scaled to the plate. Generic era styling only.
     ================================================================= */
  const IN = 0.0254; // inch in metres
  function vehicle2(o, v) {
    const T = o.base, k = o.k;
    const z = { under: T + 0.2 * k, tireIn: T + 0.45 * k, tire: T + 0.85 * k, b1: T + 0.35 * k, b2: T + 0.65 * k, b3: T + 0.85 * k, glass: T + 0.25 * k,
      gr: T + 0.3 * k, bar: T + 0.9 * k, chrome: T + 1.35 * k, lens: T + 1.1 * k, letter: T + 2.0 * k, badge: T + 1.6 * k, bump: T + 1.3 * k, plate: T + 1.05 * k };
    const comps = [];
    const sil = S.memo(v.body);
    const solids = [v.tires, v.under, v.bumper, v.plate].filter(Boolean);
    const shape = S.memo(S.union(sil, ...solids));
    const lightsAll = (v.lights || []).map((L) => L.bezel || L.lens);
    const openings = S.memo(S.union(v.grille ? S.offset(v.grille, v.surround ?? 2.4) : S.EMPTY, v.glass || S.EMPTY, ...lightsAll, ...(v.openings || []), ...(v.gaps || [])));
    comps.push({ slot: "base", f: shape, z0: 0, z1: T });
    if (v.under) comps.push({ slot: "tires", f: v.under, z0: 0, z1: z.under });
    if (v.tires) {
      comps.push({ slot: "tires", f: v.tires, z0: 0, z1: z.tireIn });
      // seen head-on, the tread's circumferential grooves read as vertical lines; shoulders are rounded
      const grooves = S.inter(v.tread || S.EMPTY, S.offset(v.tires, -1.0));
      comps.push(...NP.stepped("tires", S.sub(v.tires, grooves), z.tireIn, [[0.35, z.tire - 0.15 * k], [0.9, z.tire]]));
    }
    if (v.bumper && v.plate) v.bumper = S.sub(v.bumper, S.offset(v.plate, 0.4));
    if (v.bumper) comps.push(...NP.stepped(v.bumperSlot || "chrome", v.bumper, 0, [[0, z.bump - 0.45 * k], [0.6, z.bump - 0.15 * k], [1.3, z.bump]]));
    const bodyTop = S.memo(S.sub(sil, openings, ...solids.map((f) => S.offset(f, 0.01))));
    comps.push(...NP.stepped("base", bodyTop, T, [[0.5, z.b1], [1.1, z.b2], [1.9, z.b3]]));
    for (const e of v.sculpt || []) comps.push(...NP.stepped("base", S.sub(e, openings), z.b3 - 0.01, [[0.5, z.b3 + 0.25 * k], [1.4, z.b3 + 0.45 * k]]));
    if (v.glass) {
      comps.push({ slot: "glass", f: v.glass, z0: T, z1: z.glass });
      if (!(o.features && o.features.glare === false) && v.glare) comps.push({ slot: "lights", f: S.inter(v.glare, S.offset(v.glass, -1.5)), z0: z.glass, z1: z.glass + 0.2 * k, h: o.h * 0.8 });
      if (v.cabin) comps.push({ slot: "tires", f: S.inter(v.cabin, S.offset(v.glass, -0.5)), z0: z.glass, z1: z.glass + 0.35 * k, h: o.h * 0.8 });
    }
    const font = o.font || v.font || "block";
    const onPlate = !!(v.plate && v.plateBox);
    const nb = NP.nameBlock(onPlate ? Object.assign({}, o, { sub: "" }) : o, font, v.textBox, { track: v.track ?? 0.06 });
    const tf = nb.groups.length ? S.memo(textField(nb.groups, 6)) : S.EMPTY;
    if (v.grille) {
      comps.push({ slot: "grille", f: v.grille, z0: T, z1: z.gr });
      if (v.surround !== 0) comps.push(...NP.stepped("chrome", ringOut(v.grille, v.surround || 2.4), T, [[0, z.chrome - 0.45 * k], [0.45, z.chrome - 0.2 * k], [0.9, z.chrome]]));
      if (v.texture) {
        const tb = groupsBBox(nb.groups);
        const clear = tb ? (v.clearBox ? S.box((tb[0] + tb[2]) / 2, (tb[1] + tb[3]) / 2, (tb[2] - tb[0]) / 2 + 2.2, (tb[3] - tb[1]) / 2 + 1.8, 1.2) : S.offset(tf, 1.7)) : S.EMPTY;
        comps.push(...NP.stepped(v.textureSlot || "chrome", S.sub(S.inter(v.texture, S.offset(v.grille, -0.7)), clear, ...(v.textureKeepOut || [])), z.gr, [[0, z.bar - 0.2 * k], [0.25, z.bar]], { h: o.h * 0.8 }));
      }
    }
    for (const L of v.lights || []) {
      if (L.bezel) comps.push(...NP.stepped(L.bezelSlot || "chrome", S.sub(L.bezel, L.lens), T, [[0, z.chrome - 0.35 * k], [0.45, z.chrome]]));
      comps.push(...NP.stepped(L.slot || "lights", L.lens, T, [[0, z.lens - 0.45 * k], [0.6, z.lens - 0.2 * k], [Math.min(1.6, L.dome || 1.2), z.lens]]));
      if (L.detail) comps.push({ slot: L.detailSlot || "chrome", f: S.inter(L.detail, S.offset(L.lens, -0.7)), z0: z.lens - 0.45 * k, z1: z.lens + 0.1 * k, h: o.h * 0.8 });
    }
    for (const e of v.extras || []) comps.push(...(e.steps ? NP.stepped(e.slot, e.f, e.z0 ?? T, e.steps.map(([i, dz]) => [i, T + dz * k]), e.h ? { h: e.h } : {}) : [{ slot: e.slot, f: e.f, z0: e.z0 ?? T, z1: T + (e.top || 1.3) * k }]));
    if (onPlate) {
      // front license plate: second line on it, embossed like the real thing
      comps.push({ slot: "plate", f: v.plate, z0: 0, z1: z.plate });
      comps.push({ slot: "plate", f: S.inter(S.shell(v.plate, 1.4), v.plate), z0: z.plate, z1: z.plate + 0.25 * k });
      const pb = v.plateBox, sub = (o.sub || "").trim();
      const pt = fitText(sub || "", "block", { cx: pb.cx, cy: pb.cy, w: pb.w, h: pb.h }, { track: 0.08 });
      if (pt.groups.length) comps.push({ slot: "tires", groups: pt.groups, z0: z.plate, z1: z.plate + 0.35 * k, isText: true });
      comps.push({ slot: "chrome", f: S.union(S.circle(pb.cx - pb.w * 0.42, pb.cy + pb.h * 0.95, 0.9), S.circle(pb.cx + pb.w * 0.42, pb.cy + pb.h * 0.95, 0.9)), z0: z.plate, z1: z.plate + 0.3 * k });
    }
    if (v.badge && o.badge && o.badge !== "none") comps.push(...NP.stepped("chrome", badgeField(o.badge, v.badge.x, v.badge.y, v.badge.r, o.text), T, [[0, z.badge - 0.3 * k], [0.25, z.badge]]));
    if (nb.groups.length) comps.push({ slot: "letters", groups: nb.groups, z0: v.grille ? z.gr : T, z1: z.letter, isText: true });
    return { components: comps, shape, bbox: v.bbox, textGroups: nb.groups, textHeight: nb.h || Infinity, avoid: S.offset(openings, 1.5), free: S.offset(bodyTop, 2.5) };
  }

  const VEH2_SLOTS = ["base", "chrome", "grille", "letters", "lights", "signals", "tires", "glass", "plate", "accent"];
  const VEH2_LABELS = { base: "Body paint", chrome: "Chrome", grille: "Grille", letters: "Name", lights: "Headlights", signals: "Turn signals", tires: "Tires & trim", glass: "Windshield", plate: "License plate", accent: "Stripes & decals" };
  Object.assign(NP.SLOTS, { signals: "Turn signals", plate: "License plate" });
  // build in metres (x: centre line, y: up from the ground), scale to the plate
  const vreal = (label, note, dims, font, build) => ({
    label, note, layered: true, vehicle: true, font, slots: VEH2_SLOTS, labels: VEH2_LABELS, itemSlot: "accent", dims,
    make(o) {
      const W = o.width;
      let s = W / dims.w;
      if (o.height) s = Math.min(s, Math.max(20, o.height) / dims.h);
      const X = (dims.w * s) / 2, Y = (dims.h * s) / 2;
      const thin = (m, mm = 0.9) => Math.max(m, mm / s); // keep printable widths
      const M = { s, thin, X: dims.w / 2, H: dims.h };
      const v = build(M, o);
      if (!(o.sub || "").trim()) { v.plate = null; v.plateBox = null; }
      const F = (f) => (f ? S.xf(f, 0, -Y, s) : f);
      const out = {
        body: F(v.body), tires: F(v.tires), under: F(v.under), bumper: F(v.bumper), plate: F(v.plate), glass: F(v.glass), grille: F(v.grille), texture: F(v.texture),
        cabin: F(v.cabin), glare: F(v.glare), tread: F(v.tread), surround: v.surround != null ? v.surround * s : undefined, bumperSlot: v.bumperSlot, textureSlot: v.textureSlot, clearBox: v.clearBox,
        openings: (v.openings || []).map(F), gaps: (v.gaps || []).map(F), sculpt: (v.sculpt || []).map(F), textureKeepOut: (v.textureKeepOut || []).map(F),
        lights: (v.lights || []).map((L) => Object.assign({}, L, { lens: F(L.lens), bezel: F(L.bezel), detail: F(L.detail) })),
        extras: (v.extras || []).map((e) => Object.assign({}, e, { f: F(e.f) })), font: v.font, track: v.track,
        textBox: { cx: v.textBox.cx * s, cy: v.textBox.cy * s - Y, w: v.textBox.w * s, h: v.textBox.h * s },
        plateBox: v.plateBox ? { cx: v.plateBox.cx * s, cy: v.plateBox.cy * s - Y, w: v.plateBox.w * s, h: v.plateBox.h * s } : null,
        badge: v.badge ? { x: v.badge.x * s, y: v.badge.y * s - Y, r: v.badge.r * s } : null, bbox: [-X, -Y, X, Y],
      };
      return vehicle2(o, out);
    },
  });
  // shared parts, in metres
  const usPlate = (cx, cy) => S.box(cx, cy, 6 * IN, 3 * IN, 0.012);               // 12 x 6 in plate
  const plateBox = (cx, cy) => ({ cx, cy: cy - 0.2 * IN, w: 10 * IN, h: 2.6 * IN });
  const treadV = (pitch, w) => stripesV(pitch, w);
  const wipers = (y, hw, thin) => S.union(S.seg(-hw, y, -0.08, y + 0.03, thin(0.014)), S.seg(0.04, y, hw - 0.04, y + 0.03, thin(0.014)));
  const mirrorIn = (y, thin) => S.union(S.box(0, y, 0.085, 0.028, 0.012), S.seg(0, y, 0, y + 0.06, thin(0.012)));
  const glareOf = (x0, y0, x1, y1) => S.union(S.seg(x0, y0, x1, y1, 0.035), S.seg(x0 + 0.07, y0, x1 + 0.05, y1 - 0.06, 0.016));
  const wedgeTrap = trap; // trapezoid with rounded corners, (y0, y1, hw0, hw1, r)

  /* 1950s cruiser: 7-inch headlamps under chrome visors, wide mouth grille with teeth, bullet guards, wraparound windshield */
  DESIGNS.cruiser50 = vreal("'50s Cruiser", "Chrome, bullets & fins", { w: 1.98, h: 1.5 }, "sport", (M) => {
    const t = M.thin, hl = 3.5 * IN;
    const body = S.union(S.box(0, 0.62, 0.975, 0.33, 0.13), both((m) => S.ellipse(m * 0.73, 0.88, 0.25, 0.115)), wedgeTrap(0.9, 1.49, 0.73, 0.55, 0.07),
      both((m) => S.union(S.circle(m * 0.83, 1.02, 0.045), S.seg(m * 0.8, 0.96, m * 0.83, 1.0, t(0.02)))));
    const glass = wedgeTrap(0.98, 1.42, 0.67, 0.52, 0.06);
    const grille = S.box(0, 0.555, 0.56, 0.105, 0.09);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.circle(m * 0.73, 0.8, hl), bezel: S.circle(m * 0.73, 0.8, hl + 0.032), dome: 1.4, detail: S.union(S.ring(m * 0.73, 0.8, hl * 0.55, t(0.012)), S.circle(m * 0.73, 0.8, 0.018)) },
      { lens: S.ellipse(m * 0.73, 0.555, 0.075, 0.034), bezel: S.ellipse(m * 0.73, 0.555, 0.093, 0.05), slot: "signals" }]);
    const visor = both((m) => S.inter(S.ring(m * 0.73, 0.8, hl + 0.05, t(0.03)), (x, y) => 0.83 - y));
    const bumper = S.union(S.box(0, 0.34, 0.985, 0.09, 0.075), both((m) => S.box(m * 0.88, 0.4, 0.1, 0.07, 0.06)));
    const bullets = both((m) => S.circle(m * 0.4, 0.44, 0.06));
    const jet = S.offset(S.poly([[-0.07, 0.905], [0.07, 0.905], [0.012, 0.94], [0, 0.975], [-0.012, 0.94]]), 0.004);
    return {
      body, glass, grille, surround: 0.028, texture: S.union(stripesV(0.05, t(0.013)), S.box(0, 0.62, 0.6, t(0.012), 0.004)), clearBox: true,
      tires: tirePair(0.73, 0.15, 0.1, 0.15, 0.05), tread: treadV(0.035, t(0.008)), under: S.box(0, 0.17, 0.62, 0.08, 0.02),
      bumper, plate: usPlate(0, 0.3), plateBox: plateBox(0, 0.3),
      gaps: [S.seg(-0.6, 0.705, 0.6, 0.705, t(0.007)), both((m) => S.seg(m * 0.6, 0.705, m * 0.62, 0.9, t(0.007)))],
      sculpt: [both((m) => S.ellipse(m * 0.73, 0.9, 0.2, 0.06)), S.box(0, 0.86, 0.32, 0.03, 0.03)],
      lights, cabin: S.union(wipers(1.0, 0.6, t), mirrorIn(1.33, t)), glare: glareOf(-0.42, 1.04, -0.28, 1.36),
      extras: [{ slot: "chrome", f: bullets, steps: [[0, 1.3], [0.7, 1.7], [1.5, 2.0]] }, { slot: "chrome", f: visor, steps: [[0, 1.3], [0.4, 1.5]] }, { slot: "chrome", f: jet, steps: [[0, 1.2], [0.35, 1.5]] }],
      textBox: { cx: 0, cy: 0.555, w: 0.95, h: 0.16 }, badge: { x: 0, y: 0.79, r: 0.06 }, font: "sport",
    };
  });

  /* 1950s pickup: pontoon fenders with 7-inch lamps, split windshield, bar grille, blade bumper with guards */
  DESIGNS.pickup50 = vreal("'50s Pickup", "Split windshield", { w: 1.96, h: 1.88 }, "varsity", (M) => {
    const t = M.thin, hl = 3.5 * IN;
    const fenders = both((m) => S.box(m * 0.74, 0.62, 0.235, 0.36, 0.2));
    const body = S.union(fenders, S.box(0, 0.62, 0.56, 0.32, 0.12), S.box(0, 1.0, 0.52, 0.11, 0.12), wedgeTrap(1.02, 1.87, 0.79, 0.69, 0.1),
      both((m) => S.union(S.box(m * 0.88, 1.32, 0.045, 0.06, 0.012), S.seg(m * 0.8, 1.3, m * 0.86, 1.32, t(0.018)))));
    const glass = both((m) => S.box(m * 0.3, 1.43, 0.265, 0.17, 0.045));
    const grille = S.box(0, 0.6, 0.45, 0.2, 0.06);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.circle(m * 0.74, 0.84, hl), bezel: S.circle(m * 0.74, 0.84, hl + 0.03), dome: 1.4, detail: S.union(S.ring(m * 0.74, 0.84, hl * 0.55, t(0.012)), S.circle(m * 0.74, 0.84, 0.018)) },
      { lens: S.circle(m * 0.42, 0.88, 0.032), bezel: S.circle(m * 0.42, 0.88, 0.046), slot: "signals" }]);
    return {
      body, glass, grille, surround: 0.035, texture: stripesH(0.1, t(0.03), 0.6 + 0.05), clearBox: false,
      tires: tirePair(0.74, 0.18, 0.105, 0.18, 0.05), tread: treadV(0.04, t(0.009)), under: S.box(0, 0.2, 0.62, 0.11, 0.02),
      bumper: S.union(S.box(0, 0.3, 0.98, 0.055, 0.02), both((m) => S.box(m * 0.3, 0.32, 0.03, 0.1, 0.02))), plate: usPlate(0, 0.21), plateBox: plateBox(0, 0.21),
      gaps: [both((m) => S.seg(m * 0.52, 0.93, m * 0.5, 1.09, t(0.007)))],
      sculpt: [both((m) => S.ellipse(m * 0.74, 0.92, 0.17, 0.06)), S.box(0, 1.04, 0.3, 0.035, 0.035)],
      lights, cabin: S.union(both((m) => S.seg(m * 0.48, 1.29, m * 0.12, 1.3, t(0.014))), mirrorIn(1.53, t)), glare: glareOf(-0.45, 1.3, -0.35, 1.56),
      textBox: { cx: 0, cy: 0.6, w: 0.84, h: 0.3 }, badge: { x: 0, y: 1.0, r: 0.055 }, font: "varsity",
    };
  });

  /* late-'60s muscle: low and wide, quad 5.75-inch lamps in a full-width blacked-out grille, power-dome hood, slim blade bumper */
  DESIGNS.muscle60 = vreal("'60s Muscle", "Quad lights, power dome", { w: 1.9, h: 1.32 }, "block", (M) => {
    const t = M.thin, ql = 2.875 * IN;
    const body = S.union(S.box(0, 0.51, 0.95, 0.3, 0.05), both((m) => S.ellipse(m * 0.72, 0.79, 0.23, 0.04)), wedgeTrap(0.79, 1.31, 0.7, 0.55, 0.05),
      both((m) => S.union(S.ellipse(m * 0.82, 0.9, 0.05, 0.03), S.seg(m * 0.75, 0.86, m * 0.8, 0.89, t(0.016)))));
    const glass = wedgeTrap(0.86, 1.24, 0.635, 0.5, 0.04);
    const grille = S.box(0, 0.56, 0.91, 0.125, 0.025);
    const xs = [0.805, 0.63], lights = [];
    for (const m of [-1, 1]) for (const x of xs) lights.push({ lens: S.circle(m * x, 0.56, ql), bezel: S.circle(m * x, 0.56, ql + 0.018), dome: 1.2, detail: S.union(S.ring(m * x, 0.56, ql * 0.5, t(0.01)), S.circle(m * x, 0.56, 0.014)) });
    const keepOut = [S.offset(S.union(...lights.map((L) => L.bezel)), 0.012)];
    return {
      body, glass, grille, surround: 0.02, texture: S.union(stripesH(0.024, t(0.008)), S.box(0, 0.56, 0.53, t(0.01), 0.003)), textureKeepOut: keepOut,
      tires: tirePair(0.72, 0.13, 0.13, 0.13, 0.04), tread: treadV(0.035, t(0.008)), under: S.box(0, 0.15, 0.56, 0.07, 0.02),
      bumper: S.box(0, 0.385, 0.95, 0.035, 0.03), plate: usPlate(0, 0.28), plateBox: plateBox(0, 0.28),
      gaps: [S.seg(-0.62, 0.7, 0.62, 0.7, t(0.007))],
      sculpt: [S.box(0, 0.775, 0.26, 0.05, 0.04)],
      lights, cabin: S.union(wipers(0.88, 0.55, t), mirrorIn(1.17, t)), glare: glareOf(-0.4, 0.9, -0.3, 1.18),
      extras: [{ slot: "grille", f: both((m) => S.box(m * 0.1, 0.785, 0.06, 0.012, 0.008)), steps: [[0, 1.3]] },
        { slot: "signals", f: both((m) => S.box(m * 0.62, 0.28, 0.085, 0.025, 0.01)), steps: [[0, 0.9], [0.4, 1.1]] }],
      textBox: { cx: 0, cy: 0.56, w: 1.02, h: 0.2 }, badge: null, font: "block",
    };
  });

  /* mid-'70s luxury: upright waterfall grille, rectangular quad lamps (165 x 100 mm, 1975+), 5-mph chrome bumper with rubber strips and guards */
  DESIGNS.classic70 = vreal("'70s Classic", "Waterfall grille", { w: 2.0, h: 1.38 }, "varsity", (M) => {
    const t = M.thin, rw = 0.0825, rh = 0.05;
    const body = S.union(S.box(0, 0.55, 1.0, 0.31, 0.03), both((m) => S.box(m * 0.84, 0.86, 0.15, 0.02, 0.015)), wedgeTrap(0.84, 1.37, 0.79, 0.62, 0.04),
      both((m) => S.union(S.box(m * 0.86, 0.95, 0.055, 0.035, 0.01), S.seg(m * 0.78, 0.92, m * 0.83, 0.94, t(0.016)))));
    const glass = wedgeTrap(0.9, 1.3, 0.72, 0.57, 0.035);
    const grille = S.box(0, 0.6, 0.31, 0.165, 0.015);
    const lights = [];
    for (const m of [-1, 1]) for (const x of [0.52, 0.72]) lights.push({ lens: S.box(m * x, 0.62, rw, rh, 0.012), bezel: S.box(m * x, 0.62, rw + 0.016, rh + 0.016, 0.014), dome: 0.9, detail: S.union(stripesV(0.03, t(0.006)), S.box(m * x, 0.62, rw, t(0.006), 0)) });
    lights.push(...[-1, 1].map((m) => ({ lens: S.box(m * 0.955, 0.62, 0.035, 0.06, 0.012), slot: "signals" })));
    const secondary = both((m) => S.box(m * 0.62, 0.48, 0.24, 0.035, 0.01));
    return {
      body, glass, grille, surround: 0.04, texture: stripesV(0.024, t(0.009)), clearBox: true,
      tires: tirePair(0.76, 0.14, 0.11, 0.14, 0.035), tread: treadV(0.035, t(0.008)), under: S.box(0, 0.15, 0.6, 0.07, 0.02),
      bumper: S.box(0, 0.37, 1.0, 0.1, 0.04), plate: usPlate(0, 0.36), plateBox: plateBox(0, 0.36),
      openings: [secondary], gaps: [S.seg(-0.68, 0.79, 0.68, 0.79, t(0.007))],
      sculpt: [S.box(0, 0.83, 0.34, 0.02, 0.02)],
      lights, cabin: S.union(wipers(0.92, 0.62, t), mirrorIn(1.22, t)), glare: glareOf(-0.45, 0.95, -0.34, 1.24),
      extras: [{ slot: "grille", f: secondary, steps: [[0, 0.3]] }, { slot: "chrome", f: S.inter(stripesH(0.016, t(0.006)), S.offset(secondary, -0.01)), steps: [[0, 0.7]] },
        { slot: "tires", f: both((m) => S.box(m * 0.62, 0.37, 0.24, t(0.016), 0.005)), steps: [[0, 1.45]] },
        { slot: "tires", f: both((m) => S.box(m * 0.27, 0.36, 0.028, 0.075, 0.02)), steps: [[0, 1.55], [0.5, 1.75]] },
        { slot: "chrome", f: S.offset(S.poly([[-0.025, 0.86], [0.025, 0.86], [0, 0.93]]), 0.006), steps: [[0, 1.3], [0.3, 1.5]] }],
      textBox: { cx: 0, cy: 0.6, w: 0.56, h: 0.26 }, badge: null, font: "varsity",
    };
  });

  /* 1980s: flush rectangular sealed beams (200 x 142 mm, 1978+), thin horizontal-slat grille, black urethane bumper with chrome strip */
  DESIGNS.boxy80 = vreal("'80s Boxy", "Sealed-beam squares", { w: 1.76, h: 1.38 }, "block", (M) => {
    const t = M.thin, rw = 0.1, rh = 0.071;
    const body = S.union(S.box(0, 0.53, 0.88, 0.31, 0.015), wedgeTrap(0.8, 1.37, 0.7, 0.58, 0.025),
      both((m) => S.union(S.box(m * 0.78, 0.92, 0.06, 0.04, 0.008), S.seg(m * 0.7, 0.9, m * 0.74, 0.91, t(0.016)))));
    const glass = wedgeTrap(0.86, 1.31, 0.645, 0.53, 0.025);
    const grille = S.box(0, 0.62, 0.42, 0.075, 0.006);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.box(m * 0.62, 0.62, rw, rh, 0.01), bezel: S.box(m * 0.62, 0.62, rw + 0.014, rh + 0.014, 0.012), dome: 0.8, detail: S.union(stripesV(0.028, t(0.006), m * 0.62), S.box(m * 0.62, 0.62, rw, t(0.006), 0)) },
      { lens: S.box(m * 0.835, 0.62, 0.035, rh + 0.014, 0.01), slot: "signals" }]);
    return {
      body, glass, grille, surround: 0.018, texture: stripesH(0.022, t(0.009), 0.62), clearBox: true,
      tires: tirePair(0.65, 0.14, 0.1, 0.14, 0.03), tread: treadV(0.033, t(0.008)), under: S.box(0, 0.15, 0.52, 0.07, 0.02),
      bumper: S.box(0, 0.38, 0.88, 0.08, 0.03), bumperSlot: "tires", plate: usPlate(0, 0.37), plateBox: plateBox(0, 0.37),
      gaps: [S.seg(-0.72, 0.72, 0.72, 0.72, t(0.007))],
      lights, cabin: S.union(wipers(0.88, 0.56, t), mirrorIn(1.2, t)), glare: glareOf(-0.4, 0.92, -0.3, 1.24),
      extras: [{ slot: "chrome", f: both((m) => S.box(m * 0.55, 0.405, 0.32, t(0.009), 0.003)), steps: [[0, 1.45]] }],
      textBox: { cx: 0, cy: 0.62, w: 0.78, h: 0.12 }, badge: { x: 0, y: 0.76, r: 0.04 }, font: "block",
    };
  });

  /* 1990s: flush composite headlamps with twin reflector bowls, small upper grille, big lower intake, body-colour bumper, fog lamps */
  DESIGNS.aero90 = vreal("'90s Aero", "Flush composite lamps", { w: 1.78, h: 1.4 }, "sport", (M) => {
    const t = M.thin;
    const body = S.union(S.box(0, 0.51, 0.89, 0.31, 0.17), wedgeTrap(0.74, 1.39, 0.73, 0.52, 0.1),
      both((m) => S.ellipse(m * 0.82, 0.9, 0.06, 0.035)));
    const glass = wedgeTrap(0.84, 1.32, 0.665, 0.47, 0.06);
    const lamp = (m) => S.offset(S.poly([[m * 0.34, 0.7], [m * 0.82, 0.735], [m * 0.85, 0.63], [m * 0.4, 0.61]]), 0.018);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.offset(lamp(m), -0.012), bezel: lamp(m), bezelSlot: "grille", dome: 1.0, detail: S.union(S.ring(m * 0.52, 0.665, 0.042, t(0.01)), S.ring(m * 0.7, 0.68, 0.042, t(0.01)), S.circle(m * 0.52, 0.665, 0.012), S.circle(m * 0.7, 0.68, 0.012)) },
      { lens: S.circle(m * 0.68, 0.42, 0.045), bezel: S.circle(m * 0.68, 0.42, 0.062), bezelSlot: "grille" },
      { lens: S.box(m * 0.84, 0.6, 0.035, 0.02, 0.008), slot: "signals" }]);
    const upper = S.box(0, 0.69, 0.2, 0.032, 0.032);
    return {
      body, glass, grille: S.box(0, 0.43, 0.52, 0.085, 0.06), surround: 0, texture: diamond(0.03, t(0.008)), textureSlot: "chrome", clearBox: true,
      tires: tirePair(0.66, 0.135, 0.1, 0.135, 0.04), tread: treadV(0.033, t(0.008)), under: S.box(0, 0.14, 0.52, 0.07, 0.02),
      plate: usPlate(0, 0.26), plateBox: plateBox(0, 0.26), openings: [upper],
      gaps: [S.seg(-0.32, 0.6, 0.32, 0.6, t(0.007))],
      sculpt: [both((m) => S.ellipse(m * 0.6, 0.79, 0.2, 0.03))],
      lights, cabin: S.union(wipers(0.86, 0.58, t), mirrorIn(1.22, t)), glare: glareOf(-0.4, 0.9, -0.28, 1.25),
      extras: [{ slot: "grille", f: upper, steps: [[0, 0.3]] }, { slot: "chrome", f: S.ellipse(0, 0.69, 0.05, 0.026), steps: [[0, 1.0], [0.3, 1.25]] }],
      textBox: { cx: 0, cy: 0.43, w: 0.92, h: 0.13 }, badge: null, font: "sport",
    };
  });

  /* modern full-size pickup: hood ~1.4 m up, huge grille with heavy bars and honeycomb, LED C-lamps, tow mirrors, steel bumper, roof clearance lamps */
  DESIGNS.truck = vreal("Modern Truck", "Big grille, LED lamps", { w: 2.3, h: 1.98 }, "block", (M) => {
    const t = M.thin;
    const body = S.union(S.box(0, 0.93, 1.015, 0.52, 0.06), both((m) => S.box(m * 0.88, 1.32, 0.14, 0.1, 0.06)), wedgeTrap(1.38, 1.97, 0.9, 0.8, 0.06),
      both((m) => S.union(S.box(m * 1.08, 1.47, 0.07, 0.12, 0.02), S.seg(m * 0.92, 1.42, m * 1.03, 1.45, t(0.03)))));
    const glass = wedgeTrap(1.46, 1.9, 0.83, 0.735, 0.04);
    const grille = S.box(0, 0.99, 0.6, 0.29, 0.05);
    const housing = (m) => S.box(m * 0.81, 1.17, 0.17, 0.085, 0.03);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.union(S.circle(m * 0.74, 1.17, 0.032), S.circle(m * 0.86, 1.17, 0.032)), bezel: housing(m), bezelSlot: "grille", dome: 0.8 },
      { lens: S.circle(m * 0.74, 0.55, 0.045), bezel: S.circle(m * 0.74, 0.55, 0.065), bezelSlot: "grille" }]);
    const ledC = both((m) => S.inter(S.shell(S.box(m * 0.81, 1.17, 0.145, 0.062, 0.025), t(0.014)), (x) => m * x - 0.82));
    return {
      body, glass, grille, surround: 0.055, texture: S.union(hexmesh(0.032, t(0.009)), S.box(0, 0.99 + 0.17, 0.6, 0.022, 0.006), S.box(0, 0.99 - 0.17, 0.6, 0.022, 0.006)),
      tires: tirePair(0.85, 0.22, 0.15, 0.22, 0.05), tread: treadV(0.05, t(0.014)), under: S.box(0, 0.24, 0.7, 0.13, 0.02),
      bumper: S.box(0, 0.56, 1.015, 0.15, 0.05), plate: usPlate(0, 0.53), plateBox: plateBox(0, 0.53),
      gaps: [S.seg(-0.62, 1.33, 0.62, 1.33, t(0.008)), both((m) => S.seg(m * 0.66, 1.33, m * 0.74, 1.43, t(0.008)))],
      sculpt: [S.box(0, 1.39, 0.42, 0.035, 0.03)],
      lights, cabin: S.union(wipers(1.48, 0.72, t), mirrorIn(1.78, t)), glare: glareOf(-0.55, 1.5, -0.42, 1.84),
      extras: [{ slot: "lights", f: ledC, steps: [[0, 1.35]] }, { slot: "grille", f: S.box(0, 0.4, 0.38, 0.05, 0.02), steps: [[0, 1.45]] },
        { slot: "tires", f: both((m) => S.box(m * 0.42, 0.42, 0.04, 0.05, 0.012)), steps: [[0, 1.55]] },
        { slot: "signals", f: S.union(...[-1, 0, 1].map((i) => S.box(i * 0.14, 1.945, 0.035, 0.012, 0.005))), steps: [[0, 0.9]] }],
      textBox: { cx: 0, cy: 0.99, w: 1.1, h: 0.25 }, badge: { x: 0, y: 1.255, r: 0.07 }, font: "block",
    };
  });

  /* full-size high-roof van: tall greenhouse, short sloped nose, trapezoid grille, tall lamps, black bumper */
  DESIGNS.van = vreal("Delivery Van", "High roof", { w: 2.12, h: 2.26 }, "block", (M) => {
    const t = M.thin;
    const body = S.union(S.box(0, 0.78, 0.99, 0.45, 0.06), wedgeTrap(1.12, 2.25, 0.99, 0.95, 0.13),
      both((m) => S.union(S.box(m * 1.02, 1.36, 0.04, 0.13, 0.015), S.seg(m * 0.95, 1.28, m * 1.0, 1.3, t(0.02)))));
    const glass = wedgeTrap(1.24, 1.85, 0.9, 0.82, 0.06);
    const grille = S.offset(S.poly([[-0.5, 0.68], [0.5, 0.68], [0.56, 0.93], [-0.56, 0.93]]), 0.02);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.offset(S.poly([[m * 0.6, 0.76], [m * 0.92, 0.76], [m * 0.95, 1.02], [m * 0.66, 0.96]]), 0.015), bezel: S.offset(S.poly([[m * 0.6, 0.76], [m * 0.92, 0.76], [m * 0.95, 1.02], [m * 0.66, 0.96]]), 0.032), bezelSlot: "grille", dome: 0.9,
        detail: S.union(S.circle(m * 0.78, 0.88, 0.04), S.seg(m * 0.64, 0.79, m * 0.9, 0.79, t(0.012))) },
      { lens: S.circle(m * 0.74, 0.45, 0.04), bezel: S.circle(m * 0.74, 0.45, 0.056), bezelSlot: "grille" }]);
    return {
      body, glass, grille, surround: 0.025, texture: stripesH(0.05, t(0.014), 0.8), clearBox: true,
      tires: tirePair(0.8, 0.18, 0.11, 0.18, 0.04), tread: treadV(0.035, t(0.008)), under: S.box(0, 0.2, 0.66, 0.1, 0.02),
      bumper: S.box(0, 0.45, 0.99, 0.11, 0.05), bumperSlot: "tires", plate: usPlate(0, 0.43), plateBox: plateBox(0, 0.43),
      gaps: [S.seg(-0.8, 1.06, 0.8, 1.06, t(0.008))],
      lights, cabin: S.union(wipers(1.26, 0.82, t), mirrorIn(1.72, t)), glare: glareOf(-0.6, 1.3, -0.45, 1.78),
      extras: [{ slot: "signals", f: S.union(...[-1, 0, 1].map((i) => S.box(i * 0.16, 2.16, 0.04, 0.014, 0.006))), steps: [[0, 0.9]] }],
      textBox: { cx: 0, cy: 0.805, w: 0.95, h: 0.2 }, badge: { x: 0, y: 1.0, r: 0.05 }, font: "block",
    };
  });

  /* 4x4: upright fold-flat windshield frame, round 7-inch lamps, bar grille, black flares, steel winch bumper, snorkel, roof light bar */
  DESIGNS.offroad = vreal("4x4 Off-Road", "Winch, snorkel, light bar", { w: 1.98, h: 1.9 }, "block", (M) => {
    const t = M.thin, hl = 3.5 * IN;
    const flares = both((m) => S.offset(S.poly([[m * 0.79, 1.0], [m * 0.985, 0.93], [m * 0.985, 0.56], [m * 0.79, 0.56]]), 0.008));
    const snorkel = S.union(S.box(0.83, 1.4, 0.035, 0.47, 0.03), S.box(0.82, 1.86, 0.06, 0.035, 0.02));
    const body = S.union(S.box(0, 0.83, 0.8, 0.3, 0.02), flares, S.box(0, 1.46, 0.77, 0.36, 0.03), S.box(0, 1.85, 0.62, 0.035, 0.012), snorkel,
      both((m) => S.union(S.box(m * 0.89, 1.24, 0.045, 0.045, 0.008), S.seg(m * 0.77, 1.2, m * 0.86, 1.22, t(0.016)))));
    const glass = S.box(0, 1.41, 0.69, 0.21, 0.02);
    const grille = S.box(0, 0.83, 0.36, 0.19, 0.015);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.circle(m * 0.53, 0.85, hl), bezel: S.circle(m * 0.53, 0.85, hl + 0.03), bezelSlot: "grille", dome: 1.4, detail: S.union(S.ring(m * 0.53, 0.85, hl * 0.55, t(0.012)), S.circle(m * 0.53, 0.85, 0.018)) },
      { lens: S.box(m * 0.88, 0.78, 0.045, 0.025, 0.01), slot: "signals" }]);
    const bar = S.box(0, 1.85, 0.6, 0.032, 0.012);
    const pods = S.union(...[-3, -2, -1, 0, 1, 2, 3].map((i) => S.box(i * 0.16, 1.85, 0.065, 0.019, 0.006)));
    return {
      body, glass, grille, surround: 0.02, texture: S.union(stripesH(0.06, t(0.016), 0.83), S.inter(diamond(0.03, t(0.006)), (x, y) => 1)), clearBox: true,
      tires: tirePair(0.76, 0.26, 0.17, 0.26, 0.06), tread: S.union(treadV(0.05, t(0.014)), stripesH(0.07, t(0.012))), under: S.box(0, 0.26, 0.6, 0.15, 0.02),
      bumper: S.box(0, 0.5, 0.9, 0.09, 0.02), bumperSlot: "tires", openings: [bar, flares],
      gaps: [S.seg(-0.72, 1.12, 0.72, 1.12, t(0.009)), S.seg(-0.72, 1.66, 0.72, 1.66, t(0.009))],
      lights, cabin: S.union(wipers(1.23, 0.62, t), mirrorIn(1.55, t)), glare: glareOf(-0.5, 1.24, -0.4, 1.58),
      extras: [{ slot: "tires", f: flares, steps: [[0, 1.0], [0.5, 1.25]] }, { slot: "grille", f: bar, steps: [[0, 0.5]] }, { slot: "lights", f: pods, steps: [[0, 0.95]] },
        { slot: "tires", f: snorkel, steps: [[0, 1.1], [0.4, 1.35]] },
        { slot: "chrome", f: S.box(0, 0.5, 0.16, 0.05, 0.012), steps: [[0, 1.5], [0.4, 1.8]] }, { slot: "signals", f: both((m) => S.ring(m * 0.6, 0.5, 0.03, t(0.018))), steps: [[0, 1.6]] },
        { slot: "chrome", f: both((m) => S.box(m * 0.56, 1.06, 0.03, 0.012, 0.005)), steps: [[0, 1.0]] }],
      textBox: { cx: 0, cy: 0.83, w: 0.66, h: 0.28 }, badge: { x: 0, y: 1.06, r: 0.035 }, font: "block",
    };
  });

  /* supercar: 1.15 m tall, wedge nose, slim LED lamps, huge side intakes with blades, centre intake, splitter */
  DESIGNS.supercar = vreal("Supercar", "Low, wide, LED", { w: 2.02, h: 1.16 }, "sport", (M) => {
    const t = M.thin;
    const body = S.union(S.offset(S.poly([[-1.0, 0.1], [1.0, 0.1], [1.0, 0.47], [0.84, 0.63], [0.3, 0.7], [-0.3, 0.7], [-0.84, 0.63], [-1.0, 0.47]]), 0.012), wedgeTrap(0.6, 1.15, 0.62, 0.36, 0.08),
      both((m) => S.union(S.ellipse(m * 0.72, 0.8, 0.065, 0.03), S.seg(m * 0.62, 0.74, m * 0.68, 0.78, t(0.016)))));
    const glass = wedgeTrap(0.68, 1.09, 0.565, 0.32, 0.06);
    const grille = S.offset(S.poly([[-0.5, 0.16], [0.5, 0.16], [0.57, 0.3], [0.44, 0.4], [-0.44, 0.4], [-0.57, 0.3]]), 0.01);
    const lamp = (m) => S.offset(S.poly([[m * 0.38, 0.575], [m * 0.88, 0.6], [m * 0.92, 0.53], [m * 0.47, 0.51]]), 0.01);
    const lights = [-1, 1].map((m) => ({ lens: S.offset(lamp(m), -0.008), bezel: lamp(m), bezelSlot: "grille", dome: 0.6, detail: S.union(S.circle(m * 0.62, 0.55, 0.022), S.circle(m * 0.74, 0.56, 0.022)) }));
    const sides = both((m) => S.offset(S.poly([[m * 0.63, 0.16], [m * 0.97, 0.16], [m * 0.97, 0.44], [m * 0.8, 0.4]]), 0.008));
    return {
      body, glass, grille, surround: 0, texture: hexmesh(0.026, t(0.008)), clearBox: true,
      tires: tirePair(0.8, 0.07, 0.16, 0.07, 0.03), tread: treadV(0.04, t(0.01)), under: S.box(0, 0.08, 0.62, 0.04, 0.01), openings: [sides],
      gaps: [both((m) => S.seg(m * 0.25, 0.68, m * 0.5, 0.64, t(0.007)))],
      sculpt: [both((m) => S.ellipse(m * 0.62, 0.66, 0.24, 0.03))],
      lights, cabin: S.union(wipers(0.7, 0.42, t), mirrorIn(0.98, t)), glare: glareOf(-0.3, 0.72, -0.2, 0.98),
      extras: [{ slot: "grille", f: sides, steps: [[0, 0.3]] }, { slot: "chrome", f: S.inter(stripesH(0.06, t(0.012)), S.offset(sides, -0.012)), steps: [[0, 0.8]] },
        { slot: "tires", f: S.box(0, 0.12, 0.96, 0.022, 0.008), steps: [[0, 1.2]] },
        { slot: "lights", f: both((m) => S.seg(m * 0.42, 0.565, m * 0.86, 0.585, t(0.012))), steps: [[0, 1.15]] },
        { slot: "grille", f: both((m) => S.box(m * 0.2, 0.62, 0.08, 0.012, 0.006)), steps: [[0, 1.0]] }],
      textBox: { cx: 0, cy: 0.28, w: 0.9, h: 0.17 }, badge: { x: 0, y: 0.5, r: 0.03 }, font: "sport",
    };
  });
