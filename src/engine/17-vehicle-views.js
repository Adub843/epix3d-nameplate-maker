  /* =================================================================
     v8: front ends seen the way real reference photos show them: from a
     little above, so the hood reads as a surface, the windshield sits back
     and up, and the bumper hides most of a car's tires (trucks and 4x4s
     still show theirs). Era cues from the references: two-tone roofs and
     hooded lamps ('50s), hood stripes on a power dome ('60s), vinyl roof and
     stand-up ornament ('70s), flat creased hood ('80s), smooth bulged hood ('90s).
     ================================================================= */
  const hoodLines = (y0, y1, x0, x1, t) => S.union(S.seg(-x0, y0, x0, y0, t(0.007)), both((m) => S.seg(m * x0, y0, m * x1, y1, t(0.007))));
  const roofPanel = (y0, y1, hw0, hw1) => wedgeTrap(y0, y1, hw0, hw1, 0.05);

  DESIGNS.cruiser50 = vreal("'50s Cruiser", "Two-tone, chrome & bullets", { w: 1.98, h: 1.62 }, "sport", (M) => {
    const t = M.thin, hl = 3.5 * IN;
    const face = S.box(0, 0.57, 0.975, 0.27, 0.12);
    const brows = both((m) => S.ellipse(m * 0.74, 0.8, 0.245, 0.11));
    const hood = wedgeTrap(0.76, 1.11, 0.88, 0.74, 0.06);
    const cabin = wedgeTrap(1.06, 1.61, 0.72, 0.57, 0.08);
    const body = S.union(face, brows, hood, cabin, both((m) => S.union(S.circle(m * 0.8, 1.16, 0.04), S.seg(m * 0.76, 1.1, m * 0.79, 1.14, t(0.018)))));
    const glass = wedgeTrap(1.13, 1.45, 0.665, 0.545, 0.05);
    const grille = S.box(0, 0.55, 0.58, 0.1, 0.09);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.circle(m * 0.74, 0.72, hl), bezel: S.circle(m * 0.74, 0.72, hl + 0.03), dome: 1.4, detail: S.union(S.ring(m * 0.74, 0.72, hl * 0.55, t(0.012)), S.circle(m * 0.74, 0.72, 0.018)) },
      { lens: S.ellipse(m * 0.75, 0.5, 0.075, 0.032), bezel: S.ellipse(m * 0.75, 0.5, 0.093, 0.048), slot: "signals" }]);
    const visor = both((m) => S.inter(S.ring(m * 0.74, 0.72, hl + 0.05, t(0.03)), (x, y) => 0.75 - y));
    const bullets = both((m) => S.circle(m * 0.4, 0.44, 0.06));
    const jet = S.offset(S.poly([[-0.07, 0.775], [0.07, 0.775], [0.012, 0.81], [0, 0.85], [-0.012, 0.81]]), 0.004);
    const vee = S.union(S.seg(-0.09, 0.98, 0, 0.92, t(0.02)), S.seg(0.09, 0.98, 0, 0.92, t(0.02)));
    return {
      body, glass, grille, surround: 0.028, texture: S.union(stripesV(0.05, t(0.013)), S.box(0, 0.61, 0.6, t(0.012), 0.004)), clearBox: true,
      tires: tirePair(0.74, 0.085, 0.1, 0.085, 0.03), tread: treadV(0.035, t(0.008)), under: S.box(0, 0.12, 0.62, 0.06, 0.02),
      bumper: S.union(S.box(0, 0.34, 0.985, 0.095, 0.08), both((m) => S.box(m * 0.88, 0.4, 0.1, 0.07, 0.06))), plate: usPlate(0, 0.3), plateBox: plateBox(0, 0.3),
      gaps: [hoodLines(0.765, 1.1, 0.6, 0.56, t)],
      sculpt: [both((m) => S.ellipse(m * 0.7, 0.93, 0.19, 0.17)), S.box(0, 0.98, 0.22, 0.09, 0.08)],
      lights, cabin: S.union(wipers(1.15, 0.58, t), mirrorIn(1.37, t)), glare: glareOf(-0.42, 1.18, -0.3, 1.41),
      extras: [{ slot: "chrome", f: bullets, steps: [[0, 1.3], [0.7, 1.7], [1.5, 2.0]] }, { slot: "chrome", f: visor, steps: [[0, 1.3], [0.4, 1.5]] },
        { slot: "chrome", f: jet, steps: [[0, 1.2], [0.35, 1.5]] }, { slot: "chrome", f: vee, steps: [[0, 1.3]] },
        { slot: "accent", f: S.sub(roofPanel(1.455, 1.61, 0.57, 0.56), S.offset(glass, 0.01)), steps: [[0, 0.95], [0.6, 1.05]] }],
      textBox: { cx: 0, cy: 0.55, w: 0.98, h: 0.16 }, badge: { x: 0, y: 1.04, r: 0.05 }, font: "sport",
    };
  });

  DESIGNS.pickup50 = vreal("'50s Pickup", "Pontoon fenders, split glass", { w: 1.98, h: 2.0 }, "varsity", (M) => {
    const t = M.thin, hl = 3.5 * IN;
    const fenders = both((m) => S.box(m * 0.74, 0.6, 0.245, 0.31, 0.2));
    const nose = S.box(0, 0.62, 0.56, 0.31, 0.12);
    const hood = wedgeTrap(0.88, 1.24, 0.52, 0.44, 0.12);
    const cabin = wedgeTrap(1.17, 1.99, 0.8, 0.7, 0.1);
    const body = S.union(fenders, nose, hood, cabin, both((m) => S.union(S.box(m * 0.89, 1.42, 0.045, 0.06, 0.012), S.seg(m * 0.8, 1.4, m * 0.86, 1.42, t(0.018)))));
    const glass = both((m) => S.box(m * 0.3, 1.53, 0.265, 0.16, 0.045));
    const grille = S.box(0, 0.6, 0.45, 0.2, 0.06);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.circle(m * 0.74, 0.8, hl), bezel: S.circle(m * 0.74, 0.8, hl + 0.03), dome: 1.4, detail: S.union(S.ring(m * 0.74, 0.8, hl * 0.55, t(0.012)), S.circle(m * 0.74, 0.8, 0.018)) },
      { lens: S.circle(m * 0.42, 0.88, 0.032), bezel: S.circle(m * 0.42, 0.88, 0.046), slot: "signals" }]);
    return {
      body, glass, grille, surround: 0.035, texture: stripesH(0.1, t(0.03), 0.65),
      tires: tirePair(0.74, 0.17, 0.12, 0.17, 0.05), tread: treadV(0.04, t(0.009)), under: S.box(0, 0.2, 0.6, 0.1, 0.02),
      bumper: S.union(S.box(0, 0.33, 0.98, 0.055, 0.02), both((m) => S.box(m * 0.3, 0.35, 0.03, 0.1, 0.02))), plate: usPlate(0, 0.21), plateBox: plateBox(0, 0.21),
      gaps: [both((m) => S.seg(m * 0.5, 0.92, m * 0.44, 1.22, t(0.007))), S.seg(0, 0.94, 0, 1.2, t(0.007))],
      sculpt: [both((m) => S.ellipse(m * 0.74, 0.88, 0.17, 0.06)), S.box(0, 1.05, 0.3, 0.13, 0.1)],
      lights, cabin: S.union(both((m) => S.seg(m * 0.48, 1.39, m * 0.12, 1.4, t(0.014))), mirrorIn(1.62, t)), glare: glareOf(-0.45, 1.4, -0.35, 1.66),
      extras: [{ slot: "chrome", f: S.box(0, 1.24, 0.06, 0.012, 0.006), steps: [[0, 1.1]] }],
      textBox: { cx: 0, cy: 0.6, w: 0.84, h: 0.3 }, badge: { x: 0, y: 1.1, r: 0.055 }, font: "varsity",
    };
  });

  DESIGNS.muscle60 = vreal("'60s Muscle", "Quad lamps, striped hood", { w: 1.9, h: 1.44 }, "block", (M) => {
    const t = M.thin, ql = 2.875 * IN;
    const face = S.box(0, 0.5, 0.95, 0.21, 0.04);
    const hood = wedgeTrap(0.66, 1.02, 0.93, 0.78, 0.04);
    const cabin = wedgeTrap(0.98, 1.43, 0.7, 0.55, 0.05);
    const body = S.union(face, hood, cabin, both((m) => S.union(S.ellipse(m * 0.83, 1.06, 0.05, 0.03), S.seg(m * 0.76, 1.02, m * 0.81, 1.05, t(0.016)))));
    const glass = wedgeTrap(1.03, 1.36, 0.635, 0.5, 0.04);
    const grille = S.box(0, 0.54, 0.91, 0.12, 0.025);
    const xs = [0.805, 0.63], lights = [];
    for (const m of [-1, 1]) for (const x of xs) lights.push({ lens: S.circle(m * x, 0.54, ql), bezel: S.circle(m * x, 0.54, ql + 0.018), dome: 1.2, detail: S.union(S.ring(m * x, 0.54, ql * 0.5, t(0.01)), S.circle(m * x, 0.54, 0.014)) });
    const keepOut = [S.offset(S.union(...lights.map((L) => L.bezel)), 0.012)];
    const dome = S.box(0, 0.86, 0.25, 0.13, 0.06);
    return {
      body, glass, grille, surround: 0.02, texture: S.union(stripesH(0.024, t(0.008)), S.box(0, 0.54, 0.53, t(0.01), 0.003)), textureKeepOut: keepOut,
      tires: tirePair(0.72, 0.08, 0.13, 0.08, 0.03), tread: treadV(0.035, t(0.008)), under: S.box(0, 0.1, 0.56, 0.05, 0.02),
      bumper: S.box(0, 0.37, 0.95, 0.035, 0.03), plate: usPlate(0, 0.27), plateBox: plateBox(0, 0.27),
      gaps: [hoodLines(0.665, 1.01, 0.7, 0.62, t)],
      sculpt: [dome],
      lights, cabin: S.union(wipers(1.05, 0.55, t), mirrorIn(1.29, t)), glare: glareOf(-0.4, 1.07, -0.3, 1.3),
      extras: [{ slot: "accent", f: S.sub(both((m) => S.box(m * 0.075, 0.84, 0.045, 0.17, 0)), S.offset(both((m) => S.box(m * 0.11, 0.9, 0.06, 0.014, 0.008)), 0.01)), steps: [[0, 1.45]] },
        { slot: "grille", f: both((m) => S.box(m * 0.11, 0.9, 0.06, 0.014, 0.008)), steps: [[0, 1.5]] },
        { slot: "signals", f: both((m) => S.box(m * 0.62, 0.27, 0.085, 0.025, 0.01)), steps: [[0, 0.9], [0.4, 1.1]] }],
      textBox: { cx: 0, cy: 0.54, w: 1.02, h: 0.19 }, badge: null, font: "block",
    };
  });

  DESIGNS.classic70 = vreal("'70s Classic", "Vinyl roof, waterfall grille", { w: 2.0, h: 1.52 }, "varsity", (M) => {
    const t = M.thin, rw = 0.0825, rh = 0.05;
    const face = S.box(0, 0.6, 1.0, 0.24, 0.03);
    const hood = wedgeTrap(0.8, 1.08, 0.99, 0.86, 0.03);
    const cabin = wedgeTrap(1.03, 1.51, 0.8, 0.64, 0.04);
    const body = S.union(face, hood, cabin, both((m) => S.union(S.box(m * 0.87, 1.12, 0.055, 0.035, 0.01), S.seg(m * 0.79, 1.09, m * 0.84, 1.11, t(0.016)))));
    const glass = wedgeTrap(1.08, 1.37, 0.73, 0.6, 0.035);
    const grille = S.box(0, 0.62, 0.3, 0.16, 0.015);
    const lights = [];
    for (const m of [-1, 1]) for (const x of [0.52, 0.72]) lights.push({ lens: S.box(m * x, 0.65, rw, rh, 0.012), bezel: S.box(m * x, 0.65, rw + 0.016, rh + 0.016, 0.014), dome: 0.9, detail: S.union(stripesV(0.03, t(0.006)), S.box(m * x, 0.65, rw, t(0.006), 0)) });
    lights.push(...[-1, 1].map((m) => ({ lens: S.box(m * 0.955, 0.62, 0.035, 0.06, 0.012), slot: "signals" })));
    const secondary = both((m) => S.box(m * 0.62, 0.51, 0.24, 0.035, 0.01));
    return {
      body, glass, grille, surround: 0.04, texture: stripesV(0.024, t(0.009)), clearBox: true,
      tires: tirePair(0.76, 0.08, 0.11, 0.08, 0.03), tread: treadV(0.035, t(0.008)), under: S.box(0, 0.1, 0.6, 0.06, 0.02),
      bumper: S.box(0, 0.36, 1.0, 0.1, 0.04), plate: usPlate(0, 0.35), plateBox: plateBox(0, 0.35),
      openings: [secondary], gaps: [hoodLines(0.805, 1.07, 0.7, 0.62, t)],
      sculpt: [S.box(0, 0.93, 0.3, 0.12, 0.03)],
      lights, cabin: S.union(wipers(1.1, 0.62, t), mirrorIn(1.33, t)), glare: glareOf(-0.45, 1.12, -0.34, 1.34),
      extras: [{ slot: "grille", f: secondary, steps: [[0, 0.3]] }, { slot: "chrome", f: S.inter(stripesH(0.016, t(0.006)), S.offset(secondary, -0.01)), steps: [[0, 0.7]] },
        { slot: "tires", f: both((m) => S.box(m * 0.62, 0.36, 0.24, t(0.016), 0.005)), steps: [[0, 1.45]] },
        { slot: "tires", f: both((m) => S.box(m * 0.27, 0.35, 0.028, 0.075, 0.02)), steps: [[0, 1.55], [0.5, 1.75]] },
        { slot: "chrome", f: S.union(S.ring(0, 0.86, 0.022, t(0.008)), S.seg(0, 0.8, 0, 0.84, t(0.01))), steps: [[0, 1.4]] },
        { slot: "accent", f: S.sub(roofPanel(1.38, 1.51, 0.63, 0.63), S.offset(glass, 0.01)), steps: [[0, 0.95], [0.5, 1.05]] }],
      textBox: { cx: 0, cy: 0.62, w: 0.55, h: 0.26 }, badge: null, font: "varsity",
    };
  });

  DESIGNS.boxy80 = vreal("'80s Boxy", "Sealed beams, flat hood", { w: 1.76, h: 1.5 }, "block", (M) => {
    const t = M.thin, rw = 0.1, rh = 0.071;
    const face = S.box(0, 0.58, 0.88, 0.17, 0.015);
    const hood = wedgeTrap(0.72, 0.99, 0.875, 0.78, 0.015);
    const cabin = wedgeTrap(0.95, 1.49, 0.72, 0.59, 0.025);
    const body = S.union(face, hood, cabin, both((m) => S.union(S.box(m * 0.79, 1.06, 0.06, 0.04, 0.008), S.seg(m * 0.71, 1.03, m * 0.75, 1.05, t(0.016)))));
    const glass = wedgeTrap(1.0, 1.42, 0.665, 0.545, 0.02);
    const grille = S.box(0, 0.6, 0.42, 0.075, 0.006);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.box(m * 0.62, 0.6, rw, rh, 0.01), bezel: S.box(m * 0.62, 0.6, rw + 0.014, rh + 0.014, 0.012), dome: 0.8, detail: S.union(stripesV(0.028, t(0.006), m * 0.62), S.box(m * 0.62, 0.6, rw, t(0.006), 0)) },
      { lens: S.box(m * 0.835, 0.6, 0.035, rh + 0.014, 0.01), slot: "signals" }]);
    return {
      body, glass, grille, surround: 0.018, texture: stripesH(0.022, t(0.009), 0.6), clearBox: true,
      tires: tirePair(0.65, 0.08, 0.1, 0.08, 0.03), tread: treadV(0.033, t(0.008)), under: S.box(0, 0.1, 0.52, 0.06, 0.02),
      bumper: S.box(0, 0.36, 0.88, 0.08, 0.03), bumperSlot: "tires", plate: usPlate(0, 0.35), plateBox: plateBox(0, 0.35),
      gaps: [hoodLines(0.725, 0.98, 0.74, 0.66, t), both((m) => S.seg(m * 0.3, 0.76, m * 0.27, 0.96, t(0.006)))],
      lights, cabin: S.union(wipers(1.02, 0.56, t), mirrorIn(1.33, t)), glare: glareOf(-0.4, 1.05, -0.3, 1.36),
      extras: [{ slot: "chrome", f: both((m) => S.box(m * 0.55, 0.385, 0.32, t(0.009), 0.003)), steps: [[0, 1.45]] }],
      textBox: { cx: 0, cy: 0.6, w: 0.78, h: 0.12 }, badge: { x: 0, y: 0.86, r: 0.04 }, font: "block",
    };
  });

  DESIGNS.aero90 = vreal("'90s Aero", "Flush lamps, smooth hood", { w: 1.78, h: 1.46 }, "sport", (M) => {
    const t = M.thin;
    const face = S.box(0, 0.47, 0.89, 0.28, 0.17);
    const hood = wedgeTrap(0.62, 0.97, 0.87, 0.7, 0.12);
    const cabin = wedgeTrap(0.92, 1.45, 0.74, 0.52, 0.12);
    const body = S.union(face, hood, cabin, both((m) => S.ellipse(m * 0.82, 1.03, 0.06, 0.035)));
    const glass = wedgeTrap(0.97, 1.38, 0.67, 0.47, 0.08);
    const lamp = (m) => S.offset(S.poly([[m * 0.34, 0.68], [m * 0.82, 0.715], [m * 0.85, 0.61], [m * 0.4, 0.59]]), 0.018);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.offset(lamp(m), -0.012), bezel: lamp(m), bezelSlot: "grille", dome: 1.0, detail: S.union(S.ring(m * 0.52, 0.645, 0.042, t(0.01)), S.ring(m * 0.7, 0.66, 0.042, t(0.01)), S.circle(m * 0.52, 0.645, 0.012), S.circle(m * 0.7, 0.66, 0.012)) },
      { lens: S.circle(m * 0.68, 0.4, 0.045), bezel: S.circle(m * 0.68, 0.4, 0.062), bezelSlot: "grille" },
      { lens: S.box(m * 0.84, 0.58, 0.035, 0.02, 0.008), slot: "signals" }]);
    const upper = S.box(0, 0.67, 0.2, 0.03, 0.03);
    return {
      body, glass, grille: S.box(0, 0.41, 0.52, 0.085, 0.06), surround: 0, texture: diamond(0.03, t(0.008)), textureSlot: "chrome", clearBox: true,
      tires: tirePair(0.66, 0.08, 0.1, 0.08, 0.035), tread: treadV(0.033, t(0.008)), under: S.box(0, 0.1, 0.52, 0.06, 0.02),
      plate: usPlate(0, 0.22), plateBox: plateBox(0, 0.22), openings: [upper],
      gaps: [hoodLines(0.6, 0.96, 0.62, 0.56, t)],
      sculpt: [S.ellipse(0, 0.82, 0.32, 0.13)],
      lights, cabin: S.union(wipers(1.0, 0.58, t), mirrorIn(1.3, t)), glare: glareOf(-0.4, 1.03, -0.28, 1.33),
      extras: [{ slot: "grille", f: upper, steps: [[0, 0.3]] }, { slot: "chrome", f: S.ellipse(0, 0.67, 0.05, 0.024), steps: [[0, 1.0], [0.3, 1.25]] }],
      textBox: { cx: 0, cy: 0.41, w: 0.92, h: 0.13 }, badge: null, font: "sport",
    };
  });

  DESIGNS.truck = vreal("Modern Truck", "Tall grille, LED lamps", { w: 2.3, h: 2.08 }, "block", (M) => {
    const t = M.thin;
    const face = S.box(0, 0.88, 1.015, 0.47, 0.06);
    const hood = wedgeTrap(1.3, 1.58, 1.0, 0.9, 0.05);
    const cabin = wedgeTrap(1.52, 2.07, 0.9, 0.8, 0.06);
    const body = S.union(face, hood, cabin, both((m) => S.box(m * 0.88, 1.26, 0.14, 0.1, 0.06)),
      both((m) => S.union(S.box(m * 1.08, 1.6, 0.07, 0.12, 0.02), S.seg(m * 0.92, 1.56, m * 1.03, 1.59, t(0.03)))));
    const glass = wedgeTrap(1.58, 1.98, 0.83, 0.74, 0.04);
    const grille = S.box(0, 0.98, 0.6, 0.29, 0.05);
    const housing = (m) => S.box(m * 0.81, 1.16, 0.17, 0.085, 0.03);
    const lights = [-1, 1].flatMap((m) => [
      { lens: S.union(S.circle(m * 0.74, 1.16, 0.032), S.circle(m * 0.86, 1.16, 0.032)), bezel: housing(m), bezelSlot: "grille", dome: 0.8 },
      { lens: S.circle(m * 0.74, 0.55, 0.045), bezel: S.circle(m * 0.74, 0.55, 0.065), bezelSlot: "grille" }]);
    const ledC = both((m) => S.inter(S.shell(S.box(m * 0.81, 1.16, 0.145, 0.062, 0.025), t(0.014)), (x) => m * x - 0.82));
    return {
      body, glass, grille, surround: 0.055, texture: S.union(hexmesh(0.032, t(0.009)), S.box(0, 0.98 + 0.17, 0.6, 0.022, 0.006), S.box(0, 0.98 - 0.17, 0.6, 0.022, 0.006)),
      tires: tirePair(0.85, 0.2, 0.15, 0.2, 0.05), tread: treadV(0.05, t(0.014)), under: S.box(0, 0.22, 0.7, 0.12, 0.02),
      bumper: S.box(0, 0.55, 1.015, 0.15, 0.05), plate: usPlate(0, 0.52), plateBox: plateBox(0, 0.52),
      gaps: [hoodLines(1.31, 1.57, 0.66, 0.6, t)],
      sculpt: [S.box(0, 1.44, 0.42, 0.11, 0.05)],
      lights, cabin: S.union(wipers(1.6, 0.72, t), mirrorIn(1.87, t)), glare: glareOf(-0.55, 1.62, -0.42, 1.93),
      extras: [{ slot: "lights", f: ledC, steps: [[0, 1.35]] }, { slot: "grille", f: S.box(0, 0.4, 0.38, 0.05, 0.02), steps: [[0, 1.45]] },
        { slot: "tires", f: both((m) => S.box(m * 0.42, 0.42, 0.04, 0.05, 0.012)), steps: [[0, 1.55]] },
        { slot: "signals", f: S.union(...[-1, 0, 1].map((i) => S.box(i * 0.14, 2.03, 0.035, 0.012, 0.005))), steps: [[0, 0.9]] }],
      textBox: { cx: 0, cy: 0.98, w: 1.1, h: 0.25 }, badge: { x: 0, y: 1.25, r: 0.07 }, font: "block",
    };
  });
