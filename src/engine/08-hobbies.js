  /* =================================================================
     v4: hobby / recreation subjects (grounded in popular-hobby and
     participation surveys) and their icons
     ================================================================= */
  const X = (f, tx, ty, s = 1, rot = 0) => S.xf(f, tx, ty, s, rot);
  const OVER = (a, b, gap = 0.07) => S.union(a, S.sub(b, S.offset(a, gap)));
  const mirror = (f) => (x, y) => f(-x, y);

  // home & kitchen
  I.chef_hat = () => S.union(S.sub(S.union(S.circle(-0.42, 0.28, 0.36), S.circle(0, 0.48, 0.42), S.circle(0.42, 0.28, 0.36), S.box(0, -0.05, 0.5, 0.3, 0.05)),
    S.seg(-0.18, -0.02, -0.12, 0.3, 0.05), S.seg(0.18, -0.02, 0.12, 0.3, 0.05)), S.sub(S.box(0, -0.62, 0.52, 0.22, 0.06), S.seg(-0.55, -0.62, 0.55, -0.62, 0.05)));
  I.cupcake = () => S.union(
    S.sub(S.poly([[-0.6, -0.08], [0.6, -0.08], [0.42, -0.95], [-0.42, -0.95]]), S.seg(-0.2, -0.1, -0.15, -0.95, 0.06), S.seg(0.2, -0.1, 0.15, -0.95, 0.06)),
    S.sub(S.union(S.ellipse(0, 0.12, 0.68, 0.22), S.ellipse(0, 0.38, 0.52, 0.2), S.ellipse(0, 0.6, 0.32, 0.17)), S.offset(S.poly([[-0.6, -0.08], [0.6, -0.08], [0.42, -0.95], [-0.42, -0.95]]), 0.06)),
    S.circle(0.06, 0.86, 0.12));
  I.utensils = () => {
    const fork = S.union(S.seg(0, -0.95, 0, 0.2, 0.12), S.box(0, 0.3, 0.2, 0.08, 0.04), ...[-0.15, -0.05, 0.05, 0.15].map((x) => S.seg(x, 0.3, x, 0.95, 0.06)));
    const spoon = S.union(S.seg(0, -0.95, 0, 0.25, 0.12), S.ellipse(0, 0.58, 0.22, 0.38));
    return OVER(X(fork, 0, 0, 1, 0.55), X(spoon, 0, 0, 1, -0.55));
  };
  I.pot = () => S.union(S.sub(S.box(0, -0.3, 0.62, 0.48, 0.1), S.seg(-0.45, -0.1, 0.45, -0.1, 0.05)), S.box(0, 0.28, 0.72, 0.07, 0.03), S.box(0, 0.42, 0.14, 0.06, 0.03),
    S.box(-0.8, -0.12, 0.14, 0.06, 0.03), S.box(0.8, -0.12, 0.14, 0.06, 0.03),
    S.arc(-0.2, 0.62, 0.12, -1.6, 1.6, 0.05), S.arc(0.15, 0.7, 0.12, -1.6, 1.6, 0.05));
  I.grill = () => S.union(
    S.sub(S.inter(S.circle(0, 0.25, 0.68), S.box(0, -0.05, 0.7, 0.3)), S.seg(-0.5, 0.12, 0.5, 0.12, 0.05)),
    S.box(0, 0.36, 0.72, 0.05, 0.02), S.arc(0, 0.36, 0.55, 0.35, Math.PI - 0.35, 0.07),
    S.seg(-0.4, -0.35, -0.62, -0.95, 0.08), S.seg(0.4, -0.35, 0.62, -0.95, 0.08), S.seg(0, -0.35, 0, -0.92, 0.08),
    S.circle(-0.62, -0.92, 0.09), S.circle(0.62, -0.92, 0.09),
    S.arc(-0.22, 0.75, 0.12, -1.7, 1.7, 0.05), S.arc(0.2, 0.82, 0.12, -1.7, 1.7, 0.05));
  I.bbq_tools = () => {
    const spat = S.union(S.seg(0, -0.95, 0, 0.18, 0.11), S.sub(S.box(0, 0.5, 0.24, 0.32, 0.06), S.seg(-0.08, 0.32, -0.08, 0.7, 0.04), S.seg(0.08, 0.32, 0.08, 0.7, 0.04)));
    const fork = S.union(S.seg(0, -0.95, 0, 0.2, 0.11), S.box(0, 0.24, 0.16, 0.05, 0.02), S.seg(-0.13, 0.24, -0.13, 0.9, 0.07), S.seg(0.13, 0.24, 0.13, 0.9, 0.07));
    return OVER(X(spat, 0, 0, 1, 0.5), X(fork, 0, 0, 1, -0.5));
  };
  I.coffee = () => S.union(
    S.sub(S.box(-0.12, -0.3, 0.5, 0.5, 0.14), S.seg(-0.45, -0.1, 0.25, -0.1, 0.05)), S.sub(S.ring(0.45, -0.25, 0.24, 0.11), S.box(-0.12, -0.3, 0.49, 0.49)),
    S.ellipse(-0.12, -0.9, 0.62, 0.07),
    S.arc(-0.32, 0.4, 0.12, -1.6, 1.6, 0.06), S.arc(-0.32, 0.64, 0.12, 1.55, 4.7, 0.06), S.arc(0.04, 0.4, 0.12, -1.6, 1.6, 0.06), S.arc(0.04, 0.64, 0.12, 1.55, 4.7, 0.06));
  I.bean = () => X(S.sub(S.ellipse(0, 0, 0.55, 0.85), (x, y) => Math.abs(x - 0.12 * Math.sin(y * 3.2)) - 0.05), 0, 0, 1, 0.5);

  // books & photography & crafts
  I.book = () => S.union(
    S.sub(S.poly([[-0.92, 0.55], [-0.06, 0.62], [-0.06, -0.62], [-0.92, -0.55]]), ...[0.3, 0.1, -0.1, -0.3].map((y) => S.seg(-0.78, y, -0.2, y + 0.03, 0.04))),
    S.sub(S.poly([[0.06, 0.62], [0.92, 0.55], [0.92, -0.55], [0.06, -0.62]]), ...[0.3, 0.1, -0.1, -0.3].map((y) => S.seg(0.2, y + 0.03, 0.78, y, 0.04))),
    S.poly([[-0.98, -0.62], [0, -0.7], [0.98, -0.62], [0.98, -0.72], [0, -0.82], [-0.98, -0.72]]));
  I.books = () => S.union(
    S.sub(S.box(-0.5, -0.05, 0.16, 0.8, 0.03), S.seg(-0.5, 0.45, -0.5, 0.6, 0.06)), S.sub(S.box(-0.12, -0.15, 0.18, 0.7, 0.03), S.seg(-0.2, 0.3, -0.04, 0.3, 0.05)),
    X(S.sub(S.box(0, 0, 0.17, 0.74, 0.03), S.seg(-0.08, 0.35, 0.08, 0.35, 0.05)), 0.42, -0.08, 1, -0.28), S.box(0, -0.92, 0.9, 0.06, 0.02));
  I.glasses = () => S.union(S.ring(-0.45, -0.05, 0.32, 0.12), S.ring(0.45, -0.05, 0.32, 0.12), S.arc(0, 0.0, 0.14, 0.3, Math.PI - 0.3, 0.09),
    S.seg(-0.77, 0.05, -0.98, 0.3, 0.08), S.seg(0.77, 0.05, 0.98, 0.3, 0.08));
  I.camera = () => S.union(
    S.sub(S.box(0, -0.12, 0.92, 0.6, 0.12), S.circle(0, -0.15, 0.48), S.box(0.66, 0.3, 0.1, 0.06, 0.02)),
    S.sub(S.circle(0, -0.15, 0.36), S.circle(0, -0.15, 0.2), S.circle(-0.08, -0.07, 0.06)),
    S.poly([[-0.4, 0.48], [0.4, 0.48], [0.3, 0.7], [-0.3, 0.7]]), S.box(-0.66, 0.54, 0.14, 0.07, 0.02));
  I.aperture = () => {
    const blades = [];
    for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; blades.push(S.seg(0.32 * Math.cos(a + 0.6), 0.32 * Math.sin(a + 0.6), 0.9 * Math.cos(a + 1.7), 0.9 * Math.sin(a + 1.7), 0.06)); }
    return S.sub(S.circle(0, 0, 0.95), ...blades, S.circle(0, 0, 0.28));
  };
  I.yarn = () => S.union(S.sub(S.circle(-0.12, 0.08, 0.76), S.arc(-0.95, 0.6, 0.9, -1.05, 0.15, 0.06), S.arc(-0.85, 0.85, 1.25, -1.0, -0.05, 0.06), S.arc(0.6, -0.65, 0.75, 1.9, 3.25, 0.06), S.arc(0.4, -0.85, 1.05, 1.85, 2.9, 0.06)),
    S.arc(0.62, -0.62, 0.3, 2.9, 4.9, 0.07), S.arc(0.95, -0.95, 0.2, 0.6, 2.4, 0.07));
  I.scissors = () => S.union(
    S.ring(-0.35, -0.6, 0.22, 0.1), S.ring(0.35, -0.6, 0.22, 0.1),
    S.poly([[-0.24, -0.42], [-0.12, -0.42], [0.42, 0.95], [0.32, 0.98]]), S.poly([[0.24, -0.42], [0.12, -0.42], [-0.42, 0.95], [-0.32, 0.98]]), S.circle(0, 0.0, 0.06));
  I.palette = () => S.sub(S.ellipse(0, 0, 0.95, 0.72), S.circle(0.42, -0.3, 0.16), S.circle(-0.5, 0.25, 0.12), S.circle(-0.2, 0.42, 0.12), S.circle(0.14, 0.45, 0.12), S.circle(0.48, 0.3, 0.12), S.circle(-0.58, -0.15, 0.12));
  I.brush = () => X(S.union(S.seg(0, -0.95, 0, 0.1, 0.13), S.box(0, 0.22, 0.12, 0.12, 0.02), S.poly([[-0.14, 0.34], [0.14, 0.34], [0.08, 0.85], [0, 0.98], [-0.08, 0.85]])), 0, 0, 1, -0.6);

  // pets
  I.bone = () => X(S.union(S.box(0, 0, 0.6, 0.14, 0.04), S.circle(-0.68, 0.15, 0.2), S.circle(-0.68, -0.15, 0.2), S.circle(0.68, 0.15, 0.2), S.circle(0.68, -0.15, 0.2)), 0, 0, 1, 0.5);
  I.dog = () => S.sub(S.union(S.ellipse(0, -0.05, 0.55, 0.6), X(S.ellipse(0, 0, 0.22, 0.48), -0.6, 0.12, 1, -0.45), X(S.ellipse(0, 0, 0.22, 0.48), 0.6, 0.12, 1, 0.45), S.ellipse(0, -0.52, 0.32, 0.26)),
    S.circle(-0.22, 0.12, 0.08), S.circle(0.22, 0.12, 0.08), S.ellipse(0, -0.38, 0.13, 0.09), S.arc(0, -0.5, 0.15, 3.6, 5.8, 0.045), S.seg(0, -0.47, 0, -0.62, 0.04));
  I.cat = () => S.sub(S.union(S.ellipse(0, -0.1, 0.72, 0.6), S.poly([[-0.68, 0.1], [-0.6, 0.92], [-0.18, 0.42]]), S.poly([[0.68, 0.1], [0.6, 0.92], [0.18, 0.42]])),
    S.ellipse(-0.27, 0.0, 0.1, 0.13), S.ellipse(0.27, 0.0, 0.1, 0.13), S.poly([[-0.08, -0.22], [0.08, -0.22], [0, -0.32]]),
    S.seg(0.25, -0.3, 0.78, -0.22, 0.035), S.seg(0.25, -0.38, 0.78, -0.44, 0.035), S.seg(-0.25, -0.3, -0.78, -0.22, 0.035), S.seg(-0.25, -0.38, -0.78, -0.44, 0.035));

  // gaming & game room
  I.controller = () => S.sub(S.union(S.box(0, 0.05, 0.62, 0.35, 0.3), S.circle(-0.6, -0.2, 0.36), S.circle(0.6, -0.2, 0.36)),
    S.box(-0.52, 0.0, 0.2, 0.06), S.box(-0.52, 0.0, 0.06, 0.2), S.circle(0.48, 0.12, 0.07), S.circle(0.66, -0.04, 0.07), S.circle(0.3, -0.04, 0.07), S.circle(0.48, -0.2, 0.07),
    S.box(-0.12, 0.18, 0.07, 0.03), S.box(0.12, 0.18, 0.07, 0.03));
  I.dice = () => {
    const die = (cx, cy, s, rot, pips) => X(S.sub(S.box(0, 0, 0.42, 0.42, 0.1), ...pips.map(([x, y]) => S.circle(x * 0.22, y * 0.22, 0.075))), cx, cy, s, rot);
    return OVER(die(0.32, 0.3, 1, 0.3, [[-1, 1], [0, 0], [1, -1]]), die(-0.35, -0.32, 1, -0.2, [[-1, 1], [1, 1], [-1, -1], [1, -1], [0, 0]]), 0.08);
  };
  I.pixel_heart = () => {
    const m = ["01100110", "11111111", "11111111", "11111111", "01111110", "00111100", "00011000"];
    const cells = [];
    m.forEach((row, j) => [...row].forEach((c, i) => { if (c === "1") cells.push(S.box(-0.875 + i * 0.25, 0.75 - j * 0.25, 0.126, 0.126)); }));
    return S.union(...cells);
  };
  I.dartboard = () => {
    const step = Math.PI / 10;
    const wedges = (x, y) => { const r = hyp(x, y), k = Math.atan2(y, x) / step, fr = k - Math.floor(k); return (Math.abs(fr - 0.25) - 0.25) * step * Math.max(r, 0.3); };
    return S.union(S.sub(S.circle(0, 0, 0.95), S.inter(wedges, S.ring(0, 0, 0.6, 0.5)), S.ring(0, 0, 0.32, 0.07), S.circle(0, 0, 0.16)), S.circle(0, 0, 0.08));
  };
  I.cards = () => {
    const card = (sym) => S.sub(S.box(0, 0, 0.42, 0.6, 0.08), sym);
    const spade = S.union(S.circle(-0.1, -0.02, 0.12), S.circle(0.1, -0.02, 0.12), S.poly([[-0.21, 0.02], [0.21, 0.02], [0, 0.3]]), S.poly([[-0.07, -0.28], [0.07, -0.28], [0, -0.05]]));
    const heart = S.union(S.circle(-0.1, 0.06, 0.12), S.circle(0.1, 0.06, 0.12), S.poly([[-0.21, 0.02], [0.21, 0.02], [0, -0.26]]));
    return OVER(X(card(heart), 0.3, -0.02, 1, -0.3), X(card(spade), -0.3, 0.02, 1, 0.3), 0.08);
  };
  I.pawn = () => S.union(S.circle(0, 0.6, 0.24), S.box(0, 0.3, 0.26, 0.05, 0.03), S.poly([[-0.16, 0.26], [0.16, 0.26], [0.36, -0.6], [-0.36, -0.6]]), S.box(0, -0.72, 0.52, 0.12, 0.05), S.box(0, -0.88, 0.6, 0.06, 0.03));
  I.cornhole = () => S.union(
    S.sub(X(S.poly([[-0.62, -0.75], [0.62, -0.75], [0.48, 0.85], [-0.48, 0.85]]), 0, 0, 1, 0), S.circle(0, 0.42, 0.2)),
    X(S.box(0, 0, 0.24, 0.2, 0.06), 0.62, -0.62, 1, 0.4), X(S.box(0, 0, 0.24, 0.2, 0.06), -0.66, -0.4, 1, -0.3));

  // outdoors
  I.tent = () => S.union(S.sub(S.poly([[-0.95, -0.7], [0, 0.85], [0.95, -0.7]]), S.poly([[-0.24, -0.7], [0, -0.1], [0.24, -0.7]]), S.seg(0, 0.85, 0, -0.1, 0.05)),
    S.seg(0, 0.82, 0, 1.0, 0.06), S.box(0, -0.8, 1.0, 0.05, 0.02));
  I.campfire = () => S.union(
    X(I.flame(), 0, 0.28, 0.62),
    X(S.box(0, 0, 0.75, 0.11, 0.1), 0, -0.62, 1, 0.3), X(S.box(0, 0, 0.75, 0.11, 0.1), 0, -0.62, 1, -0.3));
  I.lantern = () => S.union(S.arc(0, 0.6, 0.28, 0.2, Math.PI - 0.2, 0.07), S.box(0, 0.5, 0.42, 0.08, 0.03),
    S.sub(S.box(0, -0.08, 0.36, 0.5, 0.06), S.box(0, -0.08, 0.24, 0.38, 0.04)), X(I.flame(), 0, -0.1, 0.2), S.box(0, -0.68, 0.46, 0.08, 0.03));
  I.boot = () => S.sub(S.union(S.offset(S.poly([[-0.5, 0.9], [0.05, 0.9], [0.12, 0.05], [0.68, -0.15], [0.86, -0.45], [-0.52, -0.45]]), 0.05), S.box(0.15, -0.6, 0.78, 0.1, 0.04)),
    ...[0.68, 0.48, 0.28].map((y) => S.seg(-0.36, y, -0.06, y - 0.04, 0.05)), S.seg(-0.6, -0.32, 0.9, -0.32, 0.05));
  I.compass = () => S.union(S.ring(0, 0, 0.82, 0.12), S.poly([[0, 0.66], [0.16, 0], [-0.16, 0]]), S.sub(S.poly([[0, -0.66], [0.16, 0], [-0.16, 0]]), S.poly([[0, -0.46], [0.07, -0.08], [-0.07, -0.08]])),
    S.circle(0, 0.95, 0.09), ...[0, 1, 2, 3].map((k) => { const a = (k * Math.PI) / 2 + Math.PI / 4; return S.seg(0.55 * Math.cos(a), 0.55 * Math.sin(a), 0.68 * Math.cos(a), 0.68 * Math.sin(a), 0.05); }));
  I.bird = () => S.sub(S.union(X(S.ellipse(0, 0, 0.5, 0.36), -0.05, -0.12, 1, 0.2), S.circle(0.42, 0.25, 0.25), S.poly([[0.62, 0.3], [0.92, 0.22], [0.64, 0.14]]),
    S.poly([[-0.5, -0.1], [-0.95, 0.12], [-0.85, -0.3]]), S.seg(-0.05, -0.48, -0.1, -0.78, 0.05), S.seg(0.12, -0.46, 0.14, -0.78, 0.05), S.seg(-0.5, -0.82, 0.5, -0.82, 0.06)),
    S.circle(0.48, 0.3, 0.05), S.arc(-0.05, -0.05, 0.28, 2.2, 3.9, 0.045));
  I.binoculars = () => S.union(S.sub(S.box(-0.42, -0.2, 0.3, 0.55, 0.15), S.circle(-0.42, -0.5, 0.15)), S.sub(S.box(0.42, -0.2, 0.3, 0.55, 0.15), S.circle(0.42, -0.5, 0.15)),
    S.box(0, 0.12, 0.14, 0.16, 0.04), S.box(-0.42, 0.52, 0.2, 0.16, 0.04), S.box(0.42, 0.52, 0.2, 0.16, 0.04));
  I.horseshoe = () => S.sub(S.union(S.arc(0, 0.12, 0.62, -0.25, Math.PI + 0.25, 0.3), S.box(-0.62, -0.62, 0.16, 0.08, 0.03), S.box(0.62, -0.62, 0.16, 0.08, 0.03)),
    ...[0.6, 1.15, 1.99, 2.54].map((a) => S.circle(0.62 * Math.cos(a), 0.12 + 0.62 * Math.sin(a), 0.055)), S.circle(0.58, -0.28, 0.055), S.circle(-0.58, -0.28, 0.055));
  I.cowboy_hat = () => S.union(S.sub(S.offset(S.poly([[-0.42, -0.15], [0.42, -0.15], [0.36, 0.55], [0.12, 0.45], [0, 0.6], [-0.12, 0.45], [-0.36, 0.55]]), 0.06), S.seg(-0.5, -0.04, 0.5, -0.04, 0.08)),
    S.inter(S.ellipse(0, -0.28, 0.98, 0.3), (x, y) => -(y + 0.3) + (x * x) * 0.45 - 0.14));
  I.anchor = () => S.union(S.ring(0, 0.72, 0.16, 0.09), S.seg(0, 0.56, 0, -0.78, 0.13), S.seg(-0.38, 0.32, 0.38, 0.32, 0.12),
    S.arc(0, -0.15, 0.72, Math.PI + 0.35, 2 * Math.PI - 0.35, 0.13), S.poly([[-0.8, -0.28], [-0.5, -0.34], [-0.72, -0.56]]), S.poly([[0.8, -0.28], [0.5, -0.34], [0.72, -0.56]]));
  I.sailboat = () => S.union(S.poly([[0.02, 0.98], [0.02, -0.28], [0.72, -0.28]]), S.poly([[-0.08, 0.84], [-0.08, -0.28], [-0.62, -0.28]]),
    S.poly([[-0.92, -0.4], [0.92, -0.4], [0.62, -0.72], [-0.62, -0.72]]), S.arc(-0.45, -1.08, 0.3, 0.6, 2.55, 0.06), S.arc(0.15, -1.08, 0.3, 0.6, 2.55, 0.06), S.arc(0.75, -1.08, 0.3, 0.6, 2.55, 0.06));
  I.wave = () => {
    const band = (c, a) => S.inter((x, y) => (Math.abs(y - c - a * Math.sin(3.4 * x)) - 0.075) / (1 + 0.6 * a * 3.4), S.box(0, c, 0.92, 0.5));
    return S.union(band(0.42, 0.16), band(0.0, 0.16), band(-0.42, 0.16));
  };
  I.palm = () => S.union(
    S.seg(0.12, -0.85, 0.16, -0.3, 0.15), S.seg(0.16, -0.3, 0.02, 0.42, 0.13),
    X(S.ellipse(0, 0, 0.5, 0.13), -0.44, 0.62, 1, -0.22), X(S.ellipse(0, 0, 0.5, 0.13), 0.46, 0.62, 1, 0.22),
    X(S.ellipse(0, 0, 0.46, 0.12), -0.4, 0.3, 1, 0.5), X(S.ellipse(0, 0, 0.46, 0.12), 0.42, 0.3, 1, -0.5), X(S.ellipse(0, 0, 0.38, 0.11), -0.06, 0.86, 1, 1.25),
    S.circle(-0.1, 0.38, 0.1), S.circle(0.12, 0.36, 0.1), S.ellipse(0.1, -0.92, 0.75, 0.09));
  { const palm0 = I.palm; I.palm = () => X(palm0(), 0, -0.04, 0.9); }
  I.sun = () => S.union(S.circle(0, 0, 0.45), ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = (k * Math.PI) / 4; return S.seg(0.6 * Math.cos(a), 0.6 * Math.sin(a), 0.92 * Math.cos(a), 0.92 * Math.sin(a), 0.12); }));
  I.snowflake = () => {
    const arm = S.union(S.seg(0, 0, 0, 0.95, 0.1), S.seg(0, 0.55, 0.22, 0.75, 0.08), S.seg(0, 0.55, -0.22, 0.75, 0.08), S.seg(0, 0.3, 0.16, 0.44, 0.07), S.seg(0, 0.3, -0.16, 0.44, 0.07));
    return S.union(...[0, 1, 2, 3, 4, 5].map((k) => X(arm, 0, 0, 1, (k * Math.PI) / 3)));
  };
  I.skis = () => {
    const ski = S.union(S.box(0, -0.1, 0.07, 0.85, 0.06), S.arc(0.07, 0.75, 0.14, 0.0, 1.6, 0.11), S.box(0, -0.1, 0.11, 0.12, 0.03));
    return OVER(X(ski, -0.05, 0, 1, 0.45), X(ski, 0.05, 0, 1, -0.45), 0.07);
  };
  I.skateboard = () => X(S.union(S.sub(S.box(0, 0.1, 0.92, 0.17, 0.17), S.circle(-0.6, 0.1, 0.04), S.circle(0.6, 0.1, 0.04)), S.box(-0.5, -0.14, 0.14, 0.06, 0.02), S.box(0.5, -0.14, 0.14, 0.06, 0.02),
    S.circle(-0.62, -0.32, 0.13), S.circle(-0.38, -0.32, 0.13), S.circle(0.38, -0.32, 0.13), S.circle(0.62, -0.32, 0.13)), 0, 0, 1, 0.3);
  I.surfboard = () => X(S.sub(S.inter(S.circle(-0.62, 0, 0.98), S.circle(0.62, 0, 0.98)), S.seg(0, -0.82, 0, 0.82, 0.05), S.circle(0, -0.5, 0.06)), 0, 0, 1, -0.6);

  // fitness & sports extras
  I.dumbbell = () => X(S.union(S.box(0, 0, 0.5, 0.07), S.box(-0.55, 0, 0.1, 0.42, 0.04), S.box(-0.75, 0, 0.08, 0.32, 0.03), S.box(0.55, 0, 0.1, 0.42, 0.04), S.box(0.75, 0, 0.08, 0.32, 0.03)), 0, 0, 1, 0.5);
  I.kettlebell = () => S.union(S.sub(S.circle(0, -0.25, 0.65), S.seg(-0.22, -0.2, 0.22, -0.2, 0.06)), S.arc(0, 0.38, 0.38, -0.3, Math.PI + 0.3, 0.16), S.box(0, -0.92, 0.42, 0.05, 0.02));
  I.bicycle = () => S.union(S.ring(-0.58, -0.25, 0.36, 0.08), S.ring(0.58, -0.25, 0.36, 0.08), S.circle(-0.58, -0.25, 0.06), S.circle(0.58, -0.25, 0.06),
    S.seg(-0.58, -0.25, -0.1, 0.3, 0.07), S.seg(-0.1, 0.3, 0.42, 0.3, 0.07), S.seg(0.42, 0.3, 0.58, -0.25, 0.07), S.seg(-0.58, -0.25, 0.05, -0.25, 0.07),
    S.seg(0.05, -0.25, 0.42, 0.3, 0.07), S.seg(0.05, -0.25, -0.15, 0.42, 0.07), S.box(-0.17, 0.46, 0.14, 0.04, 0.02), S.seg(0.42, 0.3, 0.36, 0.52, 0.06), S.seg(0.36, 0.52, 0.52, 0.56, 0.06),
    S.circle(0.05, -0.25, 0.1));
  I.shoe = () => S.sub(S.union(S.offset(S.poly([[-0.85, -0.3], [-0.85, 0.25], [-0.55, 0.42], [-0.1, 0.42], [0.1, 0.12], [0.75, -0.05], [0.9, -0.3]]), 0.06), S.box(0.02, -0.45, 0.94, 0.08, 0.06)),
    S.seg(-0.95, -0.28, 1.0, -0.28, 0.05), ...[0.05, 0.25, 0.45].map((x) => S.seg(x - 0.35, 0.3, x - 0.2, 0.05, 0.05)), S.arc(-0.5, -0.05, 0.22, 0.4, 2.3, 0.05));
  I.stopwatch = () => S.union(S.sub(S.circle(0, -0.1, 0.72), S.circle(0, -0.1, 0.56)), S.seg(0, -0.1, 0, 0.3, 0.08), S.seg(0, -0.1, 0.26, -0.24, 0.08), S.circle(0, -0.1, 0.07),
    S.box(0, 0.74, 0.14, 0.08, 0.03), S.seg(0, 0.6, 0, 0.68, 0.1), X(S.box(0, 0, 0.08, 0.05), 0.55, 0.5, 1, -0.75));
  I.belt = () => S.union(S.box(-0.58, -0.05, 0.4, 0.16, 0.04), S.box(0.58, -0.05, 0.4, 0.16, 0.04), S.box(0, -0.02, 0.2, 0.24, 0.05),
    X(S.box(0, 0, 0.12, 0.42, 0.04), -0.2, -0.5, 1, -0.35), X(S.box(0, 0, 0.12, 0.42, 0.04), 0.2, -0.5, 1, 0.35));
  I.glove = () => S.sub(S.union(S.box(0.05, 0.12, 0.52, 0.6, 0.38), S.ellipse(-0.52, 0.0, 0.2, 0.32), S.box(0.05, -0.68, 0.4, 0.2, 0.05)),
    S.seg(-0.36, -0.42, 0.46, -0.42, 0.06), S.arc(-0.2, 0.12, 0.25, 3.5, 5.2, 0.05));
  I.megaphone = () => X(S.union(S.poly([[-0.35, 0.22], [0.55, 0.6], [0.55, -0.6], [-0.35, -0.22]]), S.box(-0.52, 0, 0.2, 0.24, 0.05), S.ellipse(0.58, 0, 0.1, 0.62),
    S.seg(-0.2, -0.22, -0.28, -0.55, 0.1)), 0, 0, 1, 0.35);
  I.bow = () => S.union(S.poly([[0, 0.05], [-0.92, 0.6], [-0.92, -0.5]]), S.poly([[0, 0.05], [0.92, 0.6], [0.92, -0.5]]), S.circle(0, 0.05, 0.2),
    S.poly([[-0.1, -0.05], [-0.42, -0.85], [-0.2, -0.85]]), S.poly([[0.1, -0.05], [0.42, -0.85], [0.2, -0.85]]));
  I.plane = () => X(S.union(S.box(0, 0, 0.1, 0.9, 0.1), S.poly([[-0.92, 0.0], [0.92, 0.0], [0.08, 0.32], [-0.08, 0.32]]), S.poly([[-0.36, -0.72], [0.36, -0.72], [0.06, -0.55], [-0.06, -0.55]])), 0, 0, 1, -0.6);
  I.globe = () => S.union(S.ring(0, 0, 0.85, 0.1), S.seg(-0.85, 0, 0.85, 0, 0.07), S.seg(0, -0.85, 0, 0.85, 0.07),
    (x, y) => Math.abs(hyp(x / 0.45, y) - 0.85) * 0.45 - 0.035, S.seg(-0.72, 0.45, 0.72, 0.45, 0.06), S.seg(-0.72, -0.45, 0.72, -0.45, 0.06));
  I.suitcase = () => S.union(S.sub(S.box(0, -0.15, 0.9, 0.62, 0.12), S.seg(-0.45, 0.3, -0.45, -0.6, 0.06), S.seg(0.45, 0.3, 0.45, -0.6, 0.06)), S.sub(S.box(0, 0.6, 0.3, 0.16, 0.07), S.box(0, 0.58, 0.18, 0.08, 0.03)));
  I.watering_can = () => S.union(S.sub(S.box(-0.15, -0.25, 0.5, 0.5, 0.1), S.seg(-0.5, 0.0, 0.2, 0.0, 0.05)), S.sub(S.ring(-0.6, -0.1, 0.32, 0.1), S.box(-0.15, -0.25, 0.49, 0.49)),
    S.poly([[0.32, -0.12], [0.38, 0.02], [0.92, 0.48], [0.95, 0.38]]), S.box(0.95, 0.47, 0.06, 0.1, 0.03), S.arc(-0.15, 0.25, 0.32, 0.3, Math.PI - 0.3, 0.08));
  I.flower = () => S.union(...[0, 1, 2, 3, 4].map((k) => { const a = (k * 2 * Math.PI) / 5 + Math.PI / 2; return S.circle(0.3 * Math.cos(a), 0.35 + 0.3 * Math.sin(a), 0.22); }),
    S.seg(0, 0.1, 0, -0.95, 0.09), X(S.ellipse(0, 0, 0.3, 0.12), 0.25, -0.5, 1, 0.6), X(S.ellipse(0, 0, 0.3, 0.12), -0.25, -0.65, 1, -0.6));
  I.sprout = () => S.union(S.seg(0, -0.6, 0, 0.3, 0.09), X(S.ellipse(0, 0, 0.42, 0.18), -0.32, 0.42, 1, -0.5), X(S.ellipse(0, 0, 0.42, 0.18), 0.32, 0.5, 1, 0.5),
    S.inter(S.circle(0, -0.95, 0.55), S.box(0, -0.72, 0.8, 0.16)));
  I.hammer = () => X(S.union(S.box(0, -0.2, 0.09, 0.78, 0.06), S.box(-0.12, 0.66, 0.45, 0.15, 0.05), S.poly([[0.28, 0.8], [0.62, 0.92], [0.66, 0.78], [0.33, 0.52]]), S.sub(S.box(0, -0.72, 0.12, 0.26, 0.06), S.seg(-0.13, -0.6, 0.13, -0.6, 0.04))), 0, 0.02, 1, -0.55);
  I.saw = () => X(S.union(S.sub(S.box(-0.55, 0.0, 0.32, 0.36, 0.14), S.ellipse(-0.55, 0.05, 0.14, 0.2)),
    S.sub(S.poly([[-0.25, 0.25], [0.95, 0.12], [0.95, -0.1], [-0.25, -0.3]]), ...[...Array(8)].map((_, i) => S.poly([[-0.2 + i * 0.15, -0.31], [-0.12 + i * 0.15, -0.2], [-0.04 + i * 0.15, -0.31]])))), 0, 0, 1, -0.5);

  Object.assign(ICON_LABELS, {
    chef_hat: "Chef hat", cupcake: "Cupcake", utensils: "Fork & spoon", pot: "Pot", grill: "Grill", bbq_tools: "BBQ tools", coffee: "Coffee", bean: "Bean",
    book: "Open book", books: "Books", glasses: "Glasses", camera: "Camera", aperture: "Aperture", yarn: "Yarn", scissors: "Scissors", palette: "Paint", brush: "Brush",
    bone: "Bone", dog: "Dog", cat: "Cat", controller: "Controller", dice: "Dice", pixel_heart: "Pixel heart", dartboard: "Darts", cards: "Cards", pawn: "Chess",
    cornhole: "Cornhole", tent: "Tent", campfire: "Campfire", lantern: "Lantern", boot: "Hiking boot", compass: "Compass", bird: "Bird", binoculars: "Binoculars",
    horseshoe: "Horseshoe", cowboy_hat: "Cowboy hat", anchor: "Anchor", sailboat: "Sailboat", wave: "Wave", palm: "Palm", sun: "Sun", snowflake: "Snowflake",
    skis: "Skis", skateboard: "Skateboard", surfboard: "Surfboard", dumbbell: "Dumbbell", kettlebell: "Kettlebell", bicycle: "Bike", shoe: "Sneaker",
    stopwatch: "Stopwatch", belt: "Black belt", glove: "Glove", megaphone: "Megaphone", bow: "Bow", plane: "Plane", globe: "Globe", suitcase: "Suitcase",
    watering_can: "Watering can", flower: "Flower", sprout: "Sprout", hammer: "Hammer", saw: "Saw",
  });

  Object.assign(PALETTES, {
    kitchen: { label: "Kitchen", base: "#E76F51", accent: "#F4D35E", panel: "#FFFFFF", bold: "#264653", letters: "#FFFFFF" },
    ember: { label: "Ember", base: "#1B1B1B", accent: "#FF7B00", panel: "#FFFFFF", bold: "#C1121F", letters: "#FFFFFF" },
    library: { label: "Library", base: "#3D405B", accent: "#F2CC8F", panel: "#FFF8E7", bold: "#E07A5F", letters: "#FFF8E7" },
    arcade: { label: "Arcade", base: "#14143C", accent: "#00F5D4", panel: "#FFFFFF", bold: "#FF2E7E", letters: "#FFFFFF" },
    campfire: { label: "Campfire", base: "#2D6A4F", accent: "#F4A261", panel: "#FFF3D6", bold: "#264653", letters: "#FFF3D6" },
    bloom: { label: "Bloom", base: "#52B788", accent: "#FFB4C8", panel: "#FFFFFF", bold: "#2D6A4F", letters: "#FFFFFF" },
    sky: { label: "Sky", base: "#0096C7", accent: "#FFB703", panel: "#FFFFFF", bold: "#023047", letters: "#FFFFFF" },
    frost: { label: "Frost", base: "#0B3D91", accent: "#9BE7FF", panel: "#FFFFFF", bold: "#0077B6", letters: "#FFFFFF" },
    mocha: { label: "Mocha", base: "#6F4E37", accent: "#F2CC8F", panel: "#FFF8E7", bold: "#3B2A1A", letters: "#FFF8E7" },
    ranch: { label: "Ranch", base: "#7F4F24", accent: "#E9C46A", panel: "#FFF8E7", bold: "#582F0E", letters: "#FFF8E7" },
    shutter: { label: "Shutter", base: "#1B1B1B", accent: "#FFD23F", panel: "#FFFFFF", bold: "#3A86FF", letters: "#FFFFFF" },
    felt: { label: "Felt", base: "#0B6E4F", accent: "#FFD23F", panel: "#FFFFFF", bold: "#C1121F", letters: "#FFFFFF" },
    tropic: { label: "Tropic", base: "#06D6A0", accent: "#FFD166", panel: "#FFFFFF", bold: "#EF476F", letters: "#FFFFFF" },
  });

  const NEW_SUBJECTS = [
    ["running", "Sports", "Running", ["run", "running", "runner", "marathon", "5k", "10k", "jog", "jogging", "half marathon"], ["shoe", "stopwatch", "medal"], "victory", ["burst", "crest"]],
    ["cycling", "Sports", "Cycling", ["cycling", "bike", "biking", "bicycle", "cyclist", "mtb", "mountain bike"], ["bicycle", "tire", "mountains"], "citrus", ["burst", "arch"]],
    ["gym", "Sports", "Gym", ["gym", "fitness", "workout", "lifting", "weights", "crossfit", "strength", "home gym"], ["dumbbell", "kettlebell", "bolt"], "neon", ["crest", "burst"]],
    ["martial", "Sports", "Martial Arts", ["karate", "martial", "taekwondo", "jiu jitsu", "jiu-jitsu", "bjj", "judo", "boxing", "mma", "wrestling", "dojo"], ["belt", "glove", "star"], "victory", ["crest", "burst"]],
    ["cheer", "Sports", "Cheer & Dance", ["cheer", "cheerleading", "dance", "dancer", "ballet", "gymnastics", "gymnast", "pom"], ["megaphone", "bow", "star"], "candy", ["bubble", "burst"]],
    ["skate", "Sports", "Skate & Surf", ["skate", "skateboard", "skateboarding", "surf", "surfing", "surfer", "skatepark"], ["skateboard", "surfboard", "wave"], "tropic", ["burst", "bubble"]],
    ["snow", "Sports", "Ski & Snow", ["ski", "skiing", "snowboard", "snowboarding", "snow", "slopes", "winter"], ["skis", "snowflake", "mountains"], "frost", ["arch", "crest"]],
    ["camping", "Outdoors", "Camping", ["camp", "camping", "campsite", "rv", "glamping", "campfire", "tent"], ["tent", "campfire", "lantern", "mountains"], "campfire", ["arch", "crest"]],
    ["hiking", "Outdoors", "Hiking", ["hike", "hiking", "hiker", "trail", "trails", "backpacking", "national park"], ["boot", "compass", "mountains"], "campfire", ["crest", "arch"]],
    ["boating", "Outdoors", "Lake & Boat", ["boat", "boating", "sailing", "lake house", "lake life", "kayak", "kayaking", "paddle", "dock"], ["anchor", "sailboat", "wave"], "lake", ["arch", "crest"]],
    ["beach", "Outdoors", "Beach", ["beach", "beach house", "coast", "ocean", "island", "tropical", "sand"], ["palm", "sun", "wave"], "tropic", ["bubble", "arch"]],
    ["birding", "Outdoors", "Birding", ["birding", "birdwatching", "bird watching", "birds", "wildlife", "nature"], ["bird", "binoculars", "sprout"], "fairway", ["arch", "bubble"]],
    ["ranch", "Outdoors", "Horses & Ranch", ["horse", "horses", "ranch", "rodeo", "equestrian", "barn", "cowboy", "cowgirl", "farm"], ["horseshoe", "cowboy_hat", "star"], "ranch", ["crest", "arch"]],
    ["kitchen", "Home & Hobbies", "Kitchen", ["kitchen", "cooking", "cook", "chef", "baking", "baker", "bakery", "recipes"], ["chef_hat", "cupcake", "utensils", "pot"], "kitchen", ["arch", "bubble"]],
    ["grill", "Home & Hobbies", "Grill & BBQ", ["grill", "grilling", "bbq", "barbecue", "smoker", "pitmaster", "cookout"], ["grill", "bbq_tools", "flame"], "ember", ["crest", "burst"]],
    ["books", "Home & Hobbies", "Books", ["book", "books", "reading", "reader", "library", "book club", "bookworm"], ["book", "books", "glasses"], "library", ["arch", "bubble"]],
    ["pets", "Home & Hobbies", "Pets", ["pet", "pets", "dog", "dogs", "puppy", "cat", "cats", "kitty"], ["paw", "dog", "cat", "bone"], "candy", ["bubble", "burst"]],
    ["gaming", "Home & Hobbies", "Gaming", ["gaming", "gamer", "video game", "video games", "esports", "game room", "playstation", "xbox", "console"], ["controller", "pixel_heart", "headphones", "dice"], "arcade", ["burst", "crest"]],
    ["gameroom", "Home & Hobbies", "Game Night", ["cornhole", "darts", "poker", "cards", "chess", "board game", "board games", "game night", "backyard", "dice"], ["cornhole", "dartboard", "cards", "pawn", "dice"], "felt", ["crest", "arch"]],
    ["photo", "Home & Hobbies", "Photography", ["photo", "photography", "photographer", "camera", "studio shoot"], ["camera", "aperture", "star"], "shutter", ["burst", "arch"]],
    ["crafts", "Home & Hobbies", "Crafts", ["craft", "crafts", "crafting", "knit", "knitting", "crochet", "sewing", "quilting", "art", "artist", "painting", "diy"], ["yarn", "scissors", "palette", "brush"], "candy", ["bubble", "arch"]],
    ["garden", "Home & Hobbies", "Garden", ["garden", "gardening", "gardener", "plants", "plant", "greenhouse", "flowers", "grow"], ["watering_can", "flower", "sprout"], "bloom", ["arch", "bubble"]],
    ["workshop", "Home & Hobbies", "Workshop", ["workshop", "woodworking", "woodshop", "shop", "tools", "carpenter", "handyman", "maker"], ["hammer", "saw", "wrenches"], "garage", ["license", "crest"]],
    ["travel", "Home & Hobbies", "Travel", ["travel", "traveler", "vacation", "adventure", "wanderlust", "trip", "explore"], ["plane", "globe", "suitcase", "compass"], "sky", ["burst", "crest"]],
    ["coffee", "Drinks", "Coffee", ["coffee", "cafe", "espresso", "latte", "coffee bar", "barista"], ["coffee", "bean", "heart"], "mocha", ["arch", "bubble"]],
  ];
  // running replaces the old track entry
  const trackIdx = SUBJECTS.findIndex((s) => s.key === "track");
  if (trackIdx >= 0) SUBJECTS.splice(trackIdx, 1);
  const EXTRA2 = { "Home & Hobbies": ["heart", "star", "sparkle", "crown", "paw"] };
  const groupOrder = ["Sports", "Movies", "TV", "Cars", "Music", "Outdoors", "Home & Hobbies", "Drinks", "Other"];
  for (const [key, group, labelTxt, words, icons, pal, designs] of NEW_SUBJECTS) {
    const sp = { key, group, label: labelTxt, words, icons, palette: pal, designs: designs.concat(["classic"]) };
    const p = PALETTES[pal]; sp.base = p.base; sp.raised = p.accent;
    sp.tools = icons.concat(EXTRAS[group] || EXTRA2[group] || EXTRAS.Other).filter((v, i, a) => a.indexOf(v) === i);
    SUBJECTS.push(sp);
  }
  SUBJECTS.find((s) => s.key === "baseball").words.push("softball", "little league");
  SUBJECTS.find((s) => s.key === "pets") && (SUBJECTS.find((s) => s.key === "pets").tools = ["paw", "dog", "cat", "bone", "heart", "star", "crown"]);
  SUBJECTS.sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group));
  NP.SPORTS = SUBJECTS.filter((s) => s.group === "Sports").map((s) => Object.assign({}, s, { key: s.icons[0] }));

