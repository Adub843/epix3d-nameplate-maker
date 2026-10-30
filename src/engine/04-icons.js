  /* ------------------------------------------------------------- icons
     unit space roughly -1..1, y up */
  const I = {};
  I.basketball = () => S.sub(S.circle(0, 0, 1),
    S.seg(-1.2, 0, 1.2, 0, 0.09), S.seg(0, -1.2, 0, 1.2, 0.09),
    S.ring(-1.48, 0, 1.08, 0.09), S.ring(1.48, 0, 1.08, 0.09));
  I.football = () => {
    const lens = S.inter(S.circle(0, -0.62, 1.18), S.circle(0, 0.62, 1.18));
    const cuts = [S.seg(-0.34, 0, 0.34, 0, 0.075)];
    for (const x of [-0.25, -0.085, 0.085, 0.25]) cuts.push(S.seg(x, -0.15, x, 0.15, 0.065));
    cuts.push(S.seg(-0.66, -0.36, -0.66, 0.36, 0.07), S.seg(0.66, -0.36, 0.66, 0.36, 0.07));
    return S.xf(S.sub(lens, ...cuts), 0, 0, 0.98, 0.45);
  };
  I.soccer = () => {
    const parts = [S.ring(0, 0, 0.93, 0.13)];
    const pent = (cx, cy, r, rot) => {
      const p = [];
      for (let i = 0; i < 5; i++) { const a = rot + i * 2 * Math.PI / 5; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
      return S.poly(p);
    };
    parts.push(pent(0, 0, 0.36, Math.PI / 2));
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + i * 2 * Math.PI / 5;
      const c = Math.cos(a), s = Math.sin(a);
      parts.push(S.seg(c * 0.3, s * 0.3, c * 0.9, s * 0.9, 0.09));
      const b = a + Math.PI / 5;
      parts.push(S.inter(pent(Math.cos(b) * 1.04, Math.sin(b) * 1.04, 0.36, b), S.circle(0, 0, 0.9)));
    }
    return S.union(...parts);
  };
  I.baseball = () => {
    const parts = [S.sub(S.circle(0, 0, 1), S.ring(-1.52, 0, 1.12, 0.08), S.ring(1.52, 0, 1.12, 0.08))];
    for (const side of [-1, 1]) {
      for (let k = -4; k <= 4; k++) {
        const a = (side < 0 ? 0 : Math.PI) + k * 0.12;
        const cx = side * 1.52 + 1.12 * Math.cos(a) * 1, cy = 1.12 * Math.sin(a);
        if (hyp(cx, cy) > 0.86) continue;
        const nx = Math.cos(a), ny = Math.sin(a), tx = -ny * 0.05, ty = nx * 0.05;
        parts.push(S.seg(cx - nx * 0.1 - tx, cy - ny * 0.1 - ty, cx + nx * 0.1 + tx, cy + ny * 0.1 + ty, 0.045));
      }
    }
    return S.xf(S.inter(S.union(...parts), S.circle(0, 0, 1)), 0, 0, 1, 0.35);
  };
  I.tennis = () => {
    const head = S.ellipse(0, 0.32, 0.5, 0.64);
    const strings = [];
    for (let x = -0.3; x <= 0.31; x += 0.15) strings.push(S.seg(x, -0.4, x, 1.0, 0.055));
    for (let y = -0.13; y <= 0.86; y += 0.15) strings.push(S.seg(-0.6, y, 0.6, y, 0.055));
    const racket = S.union(
      S.shell(head, 0.12),
      S.inter(S.union(...strings), head),
      S.seg(-0.3, -0.2, 0, -0.5, 0.1), S.seg(0.3, -0.2, 0, -0.5, 0.1),
      S.seg(0, -0.45, 0, -1.05, 0.15));
    const ball = S.sub(S.circle(0, 0, 0.22), S.ring(-0.3, 0, 0.21, 0.035), S.ring(0.3, 0, 0.21, 0.035));
    return S.union(S.xf(racket, -0.12, 0.05, 1, 0.42), S.xf(ball, 0.62, -0.68, 1, 0.5));
  };
  I.golf = () => S.union(
    S.seg(-0.2, -0.78, -0.2, 0.98, 0.09),
    S.poly([[-0.2, 1.0], [0.72, 0.72], [-0.2, 0.44]]),
    S.ellipse(-0.2, -0.82, 0.62, 0.15),
    S.circle(0.58, -0.56, 0.17));
  I.hockey = () => {
    const stick = (m) => S.union(S.seg(m * -0.62, 1.0, m * 0.36, -0.62, 0.18), S.seg(m * 0.36, -0.62, m * 0.84, -0.66, 0.22));
    const a = stick(1), b = stick(-1);
    return S.xf(S.union(a, S.sub(b, S.offset(a, 0.08)), S.box(0, -0.86, 0.32, 0.11, 0.07)), 0, 0.04, 0.86);
  };
  I.volleyball = () => {
    const cuts = [];
    for (let k = 0; k < 3; k++) {
      const a = k * 2 * Math.PI / 3 + Math.PI / 6;
      const c = Math.cos(a), s = Math.sin(a);
      cuts.push(S.ring(c, s, 1.0, 0.085), S.ring(c * 1.32, s * 1.32, 1.0, 0.075));
    }
    return S.union(S.sub(S.circle(0, 0, 0.93), ...cuts), S.ring(0, 0, 0.95, 0.1));
  };
  I.trophy = () => {
    const cup = S.union(S.box(0, 0.78, 0.56, 0.12, 0.03), S.inter(S.circle(0, 0.72, 0.56), S.box(0, 0.36, 0.56, 0.4)));
    return S.union(
      S.sub(cup, S.star(0, 0.52, 0.22, 0.09)),
      S.ring(-0.56, 0.5, 0.24, 0.1), S.ring(0.56, 0.5, 0.24, 0.1),
      S.box(0, -0.22, 0.08, 0.2),
      S.box(0, -0.5, 0.36, 0.09, 0.03), S.box(0, -0.74, 0.52, 0.12, 0.04));
  };
  I.star = () => S.star(0, 0, 1, 0.45);
  /* ---------------- extra primitives used by the detailed icons */
  S.arc = (cx, cy, R, a0, a1, w) => (x, y) => {
    const dx = x - cx, dy = y - cy, TAU = Math.PI * 2;
    const t = (((Math.atan2(dy, dx) - a0) % TAU) + TAU) % TAU;
    if (t <= a1 - a0) return Math.abs(hyp(dx, dy) - R) - w / 2;
    const d0 = hyp(x - cx - R * Math.cos(a0), y - cy - R * Math.sin(a0));
    const d1 = hyp(x - cx - R * Math.cos(a1), y - cy - R * Math.sin(a1));
    return Math.min(d0, d1) - w / 2;
  };
  const ngon = (cx, cy, r, n, rot = Math.PI / 2) => {
    const p = [];
    for (let i = 0; i < n; i++) { const a = rot + (i * 2 * Math.PI) / n; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return S.poly(p);
  };
  // place a unit shape: scale s, rotate rot, then move to (tx,ty)
  const at = (f, tx, ty, s = 1, rot = 0) => S.xf(f, tx, ty, s, rot);
  // put b behind a: a stays, b gets a gap cut around a
  const over = (a, b, gap = 0.07) => S.union(a, S.sub(b, S.offset(a, gap)));

  /* ---------------- sports, second looks */
  I.hoop = () => {
    const net = [];
    const top = [-0.4, -0.13, 0.13, 0.4], bot = [-0.24, -0.08, 0.08, 0.24];
    for (let i = 0; i < 4; i++) net.push(S.seg(top[i], 0.1, bot[i], -0.62, 0.065));
    for (let i = 0; i < 3; i++) { net.push(S.seg(top[i], 0.1, bot[i + 1], -0.62, 0.055)); net.push(S.seg(top[i + 1], 0.1, bot[i], -0.62, 0.055)); }
    net.push(S.seg(-0.25, -0.62, 0.25, -0.62, 0.075));
    return S.union(
      S.shell(S.box(0, 0.6, 0.8, 0.38, 0.07), 0.11),
      S.shell(S.box(0, 0.44, 0.27, 0.17, 0.02), 0.08),
      S.box(0, 0.13, 0.46, 0.06, 0.03),
      S.inter(S.union(...net), S.box(0, -0.25, 0.45, 0.38)));
  };
  I.goalpost = () => S.union(
    S.seg(-0.58, 0.98, -0.58, 0.02, 0.12), S.seg(0.58, 0.98, 0.58, 0.02, 0.12),
    S.seg(-0.58, 0.02, 0.58, 0.02, 0.13), S.seg(0, 0.02, 0, -0.74, 0.15),
    S.ellipse(0, -0.82, 0.55, 0.11),
    at(S.sub(S.inter(S.circle(0, -0.62, 1.18), S.circle(0, 0.62, 1.18)), S.seg(-0.3, 0, 0.3, 0, 0.16)), 0, 0.52, 0.3, 0.5));
  I.soccer_goal = () => {
    const frame = S.union(S.seg(-0.92, -0.5, -0.92, 0.55, 0.13), S.seg(0.92, -0.5, 0.92, 0.55, 0.13), S.seg(-0.92, 0.55, 0.92, 0.55, 0.13));
    const net = [];
    for (let x = -0.69; x < 0.7; x += 0.23) net.push(S.seg(x, 0.5, x, -0.5, 0.05));
    for (let y = 0.3; y > -0.52; y -= 0.24) net.push(S.seg(-0.9, y, 0.9, y, 0.05));
    const ball = S.union(S.ring(0.4, -0.62, 0.3, 0.075), ngon(0.4, -0.62, 0.13, 5),
      ...[0, 1, 2, 3, 4].map((k) => { const a = Math.PI / 2 + k * 1.2566; return S.seg(0.4 + 0.1 * Math.cos(a), -0.62 + 0.1 * Math.sin(a), 0.4 + 0.29 * Math.cos(a), -0.62 + 0.29 * Math.sin(a), 0.055); }));
    return at(over(ball, S.union(frame, ...net), 0.09), 0, 0.05, 0.9);
  };
  I.bats = () => {
    const bat = S.union(
      S.offset(S.poly([[-0.045, -0.92], [-0.045, -0.25], [-0.11, 0.4], [-0.11, 0.86], [0, 0.95], [0.11, 0.86], [0.11, 0.4], [0.045, -0.25], [0.045, -0.92]]), 0.02),
      S.box(0, -0.97, 0.1, 0.04, 0.03));
    const a = at(bat, 0, 0.05, 1, 0.55), b = at(bat, 0, 0.05, 1, -0.55);
    const ball = S.sub(S.circle(0, -0.74, 0.25), S.ring(-0.35, -0.74, 0.25, 0.045), S.ring(0.35, -0.74, 0.25, 0.045));
    return S.union(over(a, b), over(ball, S.EMPTY));
  };
  I.skate = () => {
    const boot = S.offset(S.poly([[-0.62, 0.92], [-0.12, 0.92], [-0.05, 0.25], [0.55, 0.08], [0.78, -0.12], [0.74, -0.3], [-0.62, -0.3]]), 0.05);
    const cuts = [S.seg(-0.68, -0.15, 0.78, -0.15, 0.05)];
    for (let k = 0; k < 4; k++) { const y = 0.76 - k * 0.17; cuts.push(S.seg(-0.48, y, -0.16, y - 0.05, 0.055)); }
    return S.union(S.sub(boot, ...cuts),
      S.seg(-0.42, -0.34, -0.42, -0.64, 0.13), S.seg(0.48, -0.34, 0.48, -0.64, 0.13),
      S.seg(-0.78, -0.72, 0.68, -0.72, 0.11), S.seg(0.68, -0.72, 0.9, -0.56, 0.11));
  };
  I.tennis_ball = () => at(S.sub(S.circle(0, 0, 1), S.ring(-1.32, 0, 0.98, 0.1), S.ring(1.32, 0, 0.98, 0.1)), 0, 0, 1, 0.5);
  I.golf_tee = () => {
    const dimples = [];
    for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) {
      const x = i * 0.18 + (j % 2 ? 0.09 : 0), y = 0.28 + j * 0.16;
      if (hyp(x, y - 0.28) < 0.5) dimples.push(S.circle(x, y, 0.055));
    }
    return S.union(S.sub(S.circle(0, 0.28, 0.64), ...dimples),
      S.poly([[-0.44, -0.42], [0.44, -0.42], [0.1, -0.55], [0.07, -1.0], [-0.07, -1.0], [-0.1, -0.55]]));
  };
  I.volley_net = () => {
    const net = [S.seg(-0.95, -0.08, 0.95, -0.08, 0.13), S.seg(-0.95, -0.08, -0.95, -1.0, 0.1), S.seg(0.95, -0.08, 0.95, -1.0, 0.1), S.seg(-0.95, -0.66, 0.95, -0.66, 0.07)];
    for (let x = -0.76; x < 0.8; x += 0.19) net.push(S.seg(x, -0.08, x, -0.66, 0.045));
    for (let y = -0.27; y > -0.64; y -= 0.19) net.push(S.seg(-0.95, y, 0.95, y, 0.045));
    return S.union(...net, at(I.volleyball(), 0.15, 0.5, 0.46));
  };
  I.bowling = () => {
    const pinShape = S.sub(S.union(S.circle(0, 0.64, 0.2),
      S.offset(S.poly([[-0.08, 0.5], [0.08, 0.5], [0.13, 0.28], [0.28, -0.15], [0.22, -0.82], [-0.22, -0.82], [-0.28, -0.15], [-0.13, 0.28]]), 0.02)),
      S.seg(-0.2, 0.3, 0.2, 0.3, 0.05), S.seg(-0.2, 0.39, 0.2, 0.39, 0.05));
    const pin = at(pinShape, -0.38, 0.08, 1.18);
    const ball = S.sub(S.circle(0.45, -0.48, 0.45), S.circle(0.34, -0.3, 0.075), S.circle(0.55, -0.28, 0.075), S.circle(0.47, -0.52, 0.08));
    return over(ball, pin, 0.08);
  };
  I.medal = () => S.union(
    S.sub(S.union(S.poly([[-0.58, 1.0], [-0.24, 1.0], [0.14, 0.2], [-0.12, 0.08]]), S.poly([[0.58, 1.0], [0.24, 1.0], [-0.14, 0.2], [0.12, 0.08]])), S.circle(0, -0.35, 0.68)),
    S.sub(S.circle(0, -0.35, 0.62), S.ring(0, -0.35, 0.48, 0.06), S.star(0, -0.35, 0.3, 0.13)));

  /* ---------------- movies */
  I.clapper = () => {
    const bar = (rot) => {
      const b = S.box(0, 0, 0.88, 0.13, 0.03), cuts = [];
      for (let x = -0.78; x < 0.9; x += 0.36) cuts.push(S.poly([[x, -0.14], [x + 0.15, -0.14], [x + 0.3, 0.14], [x + 0.15, 0.14]]));
      return S.sub(b, ...cuts);
    };
    const body = S.sub(S.box(0, -0.3, 0.88, 0.58, 0.06),
      S.seg(-0.72, -0.12, 0.72, -0.12, 0.06), S.seg(-0.72, -0.38, 0.72, -0.38, 0.06), S.seg(-0.72, -0.64, 0.72, -0.64, 0.06), S.seg(0.02, -0.12, 0.02, -0.64, 0.06));
    const fixed = at(bar(), 0, 0.46);
    const lid = at(at(bar(), 0.88, 0), -0.88, 0.8, 1, 0.24);
    return at(S.union(body, fixed, lid, S.circle(-0.82, 0.62, 0.07)), 0, -0.08, 0.9);
  };
  I.film_reel = () => {
    const holes = [];
    for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3 + Math.PI / 6; holes.push(S.circle(-0.2 + Math.cos(a) * 0.46, 0.15 + Math.sin(a) * 0.46, 0.17)); }
    const reel = S.sub(S.circle(-0.2, 0.15, 0.8), ...holes, S.circle(-0.2, 0.15, 0.09), S.ring(-0.2, 0.15, 0.7, 0.04));
    const sprockets = [];
    for (let x = -0.45; x < 0.5; x += 0.15) sprockets.push(S.box(x, 0.105, 0.035, 0.03), S.box(x, -0.105, 0.035, 0.03));
    const strip = at(S.sub(S.box(0, 0, 0.55, 0.18), ...sprockets), 0.48, -0.75, 1, -0.12);
    return S.union(reel, strip);
  };
  I.popcorn = () => {
    const bucket = S.poly([[-0.56, 0.22], [0.56, 0.22], [0.38, -0.98], [-0.38, -0.98]]);
    const stripes = [-0.25, 0.25].map((x) => S.poly([[x - 0.08, 0.1], [x + 0.08, 0.1], [x * 0.68 + 0.06, -0.98], [x * 0.68 - 0.06, -0.98]]));
    const kernels = S.union(...[[-0.42, 0.36, 0.2], [-0.14, 0.44, 0.22], [0.16, 0.44, 0.22], [0.42, 0.35, 0.2], [-0.3, 0.66, 0.2], [0.02, 0.74, 0.22], [0.3, 0.64, 0.19], [-0.1, 0.94, 0.15], [0.17, 0.9, 0.13]].map(([x, y, r]) => S.circle(x, y, r)));
    const puffCuts = [S.arc(-0.14, 0.44, 0.11, 0.3, 2.6, 0.04), S.arc(0.3, 0.64, 0.09, 0.3, 2.6, 0.04), S.arc(-0.42, 0.36, 0.1, 0.3, 2.6, 0.04)];
    return S.union(S.sub(bucket, ...stripes, S.seg(-0.6, 0.1, 0.6, 0.1, 0.05)), S.sub(kernels, S.offset(bucket, 0.07), ...puffCuts));
  };
  I.movie_camera = () => S.union(
    S.sub(S.circle(-0.42, 0.52, 0.32), S.circle(-0.42, 0.52, 0.09), ...[0, 1, 2].map((k) => S.circle(-0.42 + 0.19 * Math.cos(k * 2.094), 0.52 + 0.19 * Math.sin(k * 2.094), 0.07))),
    S.sub(S.circle(0.25, 0.56, 0.38), S.circle(0.25, 0.56, 0.1), ...[0, 1, 2].map((k) => S.circle(0.25 + 0.23 * Math.cos(k * 2.094 + 0.5), 0.56 + 0.23 * Math.sin(k * 2.094 + 0.5), 0.08))),
    S.sub(S.box(-0.14, -0.2, 0.62, 0.32, 0.06), S.seg(-0.6, -0.2, 0.3, -0.2, 0.05)),
    S.poly([[0.5, -0.06], [0.96, 0.14], [0.96, -0.54], [0.5, -0.34]]),
    S.seg(-0.22, -0.52, -0.5, -0.96, 0.09), S.seg(-0.06, -0.52, 0.22, -0.96, 0.09));

  /* ---------------- tv */
  I.retro_tv = () => {
    const body = S.box(0, -0.12, 0.95, 0.66, 0.12);
    const screen = S.box(-0.2, -0.12, 0.6, 0.5, 0.15);
    return S.union(
      S.sub(body, screen, S.ring(0.66, 0.16, 0.15, 0.05), S.ring(0.66, -0.16, 0.15, 0.05), S.seg(0.55, -0.5, 0.77, -0.5, 0.04), S.seg(0.55, -0.6, 0.77, -0.6, 0.04)),
      S.arc(-0.2, -0.12, 0.34, 1.75, 2.75, 0.07),
      S.seg(-0.08, 0.56, -0.44, 0.98, 0.065), S.seg(0.08, 0.56, 0.42, 0.98, 0.065), S.circle(0, 0.6, 0.09),
      S.seg(-0.62, -0.78, -0.72, -0.98, 0.11), S.seg(0.62, -0.78, 0.72, -0.98, 0.11));
  };
  I.flat_tv = () => S.union(
    S.shell(S.box(0, 0.18, 0.96, 0.6, 0.06), 0.11),
    S.poly([[-0.14, 0.44], [-0.14, -0.08], [0.32, 0.18]]),
    S.seg(0, -0.48, 0, -0.76, 0.13), S.box(0, -0.82, 0.46, 0.06, 0.04));
  I.remote = () => {
    const cuts = [S.circle(0, 0.72, 0.09), S.ring(0, 0.3, 0.2, 0.06), S.circle(0, 0.3, 0.07)];
    for (const y of [-0.15, -0.38, -0.61]) for (const x of [-0.16, 0, 0.16]) cuts.push(S.circle(x, y, 0.058));
    return at(S.sub(S.box(0, 0, 0.36, 0.98, 0.2), ...cuts), 0, 0, 1, -0.35);
  };
  I.binge = () => { // tv + popcorn bucket
    const tv = at(I.flat_tv(), -0.2, 0.18, 0.8);
    const pop = at(I.popcorn(), 0.62, -0.5, 0.48);
    return over(pop, tv, 0.08);
  };

  /* ---------------- cars */
  I.sports_car = () => {
    const body = S.offset(S.poly([[-0.98, -0.32], [-1.0, -0.06], [-0.82, 0.06], [-0.45, 0.12], [-0.18, 0.4], [0.28, 0.42], [0.58, 0.16], [0.92, 0.08], [1.0, -0.08], [0.98, -0.32]]), 0.03);
    const cuts = [
      S.poly([[-0.32, 0.15], [-0.13, 0.33], [0.04, 0.33], [0.04, 0.15]]), S.poly([[0.1, 0.15], [0.1, 0.34], [0.25, 0.34], [0.45, 0.15]]),
      S.circle(-0.55, -0.32, 0.3), S.circle(0.6, -0.32, 0.3),
      S.seg(0.07, 0.08, 0.1, -0.22, 0.035), S.seg(-0.95, -0.12, -0.8, -0.12, 0.05), S.ellipse(0.88, -0.02, 0.07, 0.04)];
    const wheel = (cx) => S.union(S.sub(S.circle(cx, -0.32, 0.25), S.circle(cx, -0.32, 0.16)), S.circle(cx, -0.32, 0.06),
      ...[0, 1, 2, 3, 4].map((k) => { const a = k * 1.2566 + 0.3; return S.seg(cx, -0.32, cx + 0.15 * Math.cos(a), -0.32 + 0.15 * Math.sin(a), 0.045); }));
    return at(S.union(S.sub(body, ...cuts), wheel(-0.55), wheel(0.6)), 0, 0.12, 1);
  };
  I.steering_wheel = () => S.union(
    S.ring(0, 0, 0.86, 0.2), S.sub(S.circle(0, -0.05, 0.27), S.circle(0, -0.05, 0.11)),
    S.seg(-0.86, 0.06, -0.24, 0.0, 0.18), S.seg(0.86, 0.06, 0.24, 0.0, 0.18), S.seg(0, -0.3, 0, -0.86, 0.18));
  I.checkered = () => {
    const flag = (m) => {
      const cells = [];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2 === 0) cells.push(S.box(m * (0.1 + i * 0.2 + 0.1), 0.3 + j * 0.2 + 0.1, 0.1, 0.1));
      return S.union(S.seg(0, -0.95, 0, 0.95, 0.09), S.shell(S.box(m * 0.5, 0.6, 0.4, 0.3), 0.06), ...cells);
    };
    const l = at(flag(-1), -0.1, -0.02, 0.97, 0.34), r = at(flag(1), 0.1, -0.02, 0.97, -0.34);
    return over(r, l);
  };
  I.wrenches = () => {
    const wrench = S.union(S.seg(0, -0.6, 0, 0.6, 0.17), S.sub(S.circle(0, 0.76, 0.25), S.box(0, 0.95, 0.09, 0.2)), S.sub(S.circle(0, -0.76, 0.23), ngon(0, -0.76, 0.12, 6, 0)));
    return over(at(wrench, 0, 0, 1, 0.785), at(wrench, 0, 0, 1, -0.785), 0.08);
  };
  I.tire = () => {
    const treads = [];
    for (let k = 0; k < 24; k++) { const a = (k * 2 * Math.PI) / 24; treads.push(S.seg(Math.cos(a) * 0.84, Math.sin(a) * 0.84, Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0.08)); }
    const spokes = [0, 1, 2, 3, 4].map((k) => { const a = k * 1.2566 + Math.PI / 2; return S.seg(Math.cos(a) * 0.12, Math.sin(a) * 0.12, Math.cos(a) * 0.46, Math.sin(a) * 0.46, 0.1); });
    return S.union(S.sub(S.circle(0, 0, 0.98), S.circle(0, 0, 0.57), ...treads, S.ring(0, 0, 0.74, 0.04)), S.ring(0, 0, 0.46, 0.07), S.circle(0, 0, 0.13), ...spokes);
  };

  /* ---------------- music */
  I.guitar = () => {
    const body = S.union(S.circle(0, -0.45, 0.44), S.circle(0, 0.02, 0.33), S.box(0, -0.2, 0.27, 0.22));
    const frets = [0.46, 0.6, 0.74, 0.88].map((y) => S.seg(-0.08, y, 0.08, y, 0.04));
    return at(S.union(
      S.sub(body, S.circle(0, -0.08, 0.14), S.box(0, -0.62, 0.17, 0.045, 0.02)),
      S.sub(S.box(0, 0.66, 0.075, 0.38), ...frets),
      S.box(0, 1.1, 0.12, 0.12, 0.03), S.circle(-0.17, 1.13, 0.05), S.circle(0.17, 1.13, 0.05), S.circle(-0.17, 1.03, 0.05), S.circle(0.17, 1.03, 0.05)),
      0.05, -0.02, 0.92, -0.5);
  };
  I.notes = () => {
    const head = (x, y) => at(S.ellipse(0, 0, 0.25, 0.17), x, y, 1, 0.45);
    return S.union(head(-0.52, -0.62), head(0.42, -0.4), S.seg(-0.3, -0.55, -0.3, 0.62, 0.09), S.seg(0.64, -0.33, 0.64, 0.84, 0.09),
      S.poly([[-0.345, 0.66], [0.685, 0.88], [0.685, 0.66], [-0.345, 0.44]]), S.poly([[-0.345, 0.34], [0.685, 0.56], [0.685, 0.44], [-0.345, 0.22]]));
  };
  I.headphones = () => S.union(
    S.arc(0, 0.05, 0.78, 0, Math.PI, 0.16), S.arc(0, 0.05, 0.6, 0.35, Math.PI - 0.35, 0.06),
    S.box(-0.8, -0.26, 0.16, 0.33, 0.12), S.box(0.8, -0.26, 0.16, 0.33, 0.12),
    S.box(-0.56, -0.26, 0.05, 0.27, 0.04), S.box(0.56, -0.26, 0.05, 0.27, 0.04));
  I.vinyl = () => {
    const arm = S.union(S.circle(0.82, 0.78, 0.13), S.seg(0.82, 0.78, 0.86, -0.12, 0.075), S.seg(0.86, -0.12, 0.56, -0.44, 0.075), at(S.box(0, 0, 0.075, 0.13, 0.02), 0.5, -0.5, 1, 0.8));
    const rec = S.union(S.sub(S.circle(-0.12, 0, 0.88), S.ring(-0.12, 0, 0.72, 0.035), S.ring(-0.12, 0, 0.6, 0.035), S.ring(-0.12, 0, 0.48, 0.035), S.circle(-0.12, 0, 0.36)),
      S.sub(S.circle(-0.12, 0, 0.27), S.circle(-0.12, 0, 0.055)));
    return over(arm, rec, 0.07);
  };
  I.microphone = () => {
    const grille = [0.18, 0.34, 0.5, 0.66].map((y) => S.seg(-0.2, y, 0.2, y, 0.05));
    return S.union(
      S.sub(S.box(0, 0.44, 0.32, 0.5, 0.32), ...grille, S.seg(-0.4, 0.02, 0.4, 0.02, 0.05)),
      S.arc(0, 0.2, 0.5, Math.PI, 2 * Math.PI, 0.09),
      S.seg(0, -0.3, 0, -0.8, 0.1), S.box(0, -0.86, 0.42, 0.07, 0.04));
  };
  I.drums = () => {
    const shellBox = S.box(0, -0.32, 0.8, 0.42, 0.04);
    const zig = [];
    const xs = [-0.62, -0.31, 0, 0.31, 0.62];
    for (let i = 0; i < xs.length - 1; i++) zig.push(S.seg(xs[i], 0.04, (xs[i] + xs[i + 1]) / 2, -0.62, 0.05), S.seg((xs[i] + xs[i + 1]) / 2, -0.62, xs[i + 1], 0.04, 0.05));
    const shell = S.sub(shellBox, ...zig, S.seg(-0.82, -0.62, 0.82, -0.62, 0.05));
    const head = S.sub(S.ellipse(0, 0.16, 0.84, 0.21), S.shell(S.ellipse(0, 0.16, 0.68, 0.13), 0.045));
    const sticks = S.union(S.seg(-0.9, 0.96, 0.18, 0.36, 0.08), S.circle(0.18, 0.36, 0.07), S.seg(0.9, 0.96, -0.18, 0.36, 0.08), S.circle(-0.18, 0.36, 0.07));
    return over(sticks, S.union(shell, head), 0.07);
  };
  NP.ICONS = I;

  const ICON_LABELS = {
    basketball: "Ball", hoop: "Hoop", football: "Ball", goalpost: "Goalpost", soccer: "Ball", soccer_goal: "Goal",
    baseball: "Ball", bats: "Bats", hockey: "Sticks", skate: "Skate", tennis: "Racket", tennis_ball: "Ball",
    golf: "Flag", golf_tee: "Ball & tee", volleyball: "Ball", volley_net: "Net", bowling: "Pin & ball", medal: "Medal",
    clapper: "Clapperboard", film_reel: "Film reel", popcorn: "Popcorn", movie_camera: "Camera", star: "Star",
    retro_tv: "Retro TV", flat_tv: "Flat screen", remote: "Remote", binge: "TV & popcorn",
    sports_car: "Sports car", steering_wheel: "Wheel", checkered: "Flags", wrenches: "Wrenches", tire: "Tire",
    guitar: "Guitar", notes: "Notes", headphones: "Headphones", vinyl: "Record", microphone: "Mic", drums: "Drum", trophy: "Trophy",
  };
  NP.ICON_LABELS = ICON_LABELS;

  const SUBJECTS = [
    { key: "basketball", group: "Sports", label: "Basketball", words: ["basketball", "hoops", "nba", "wnba", "bball", "b-ball"], icons: ["basketball", "hoop"], base: "#E8691C", raised: "#111111", designs: ["classic", "jersey", "badge"] },
    { key: "football", group: "Sports", label: "Football", words: ["football", "nfl", "gridiron", "touchdown", "quarterback"], icons: ["football", "goalpost"], base: "#1F5130", raised: "#FFFFFF", designs: ["classic", "jersey", "pennant"] },
    { key: "soccer", group: "Sports", label: "Soccer", words: ["soccer", "futbol", "f\u00fatbol", "mls", "goalie", "striker"], icons: ["soccer", "soccer_goal"], base: "#111111", raised: "#FFFFFF", designs: ["classic", "jersey", "badge"] },
    { key: "baseball", group: "Sports", label: "Baseball", words: ["baseball", "softball", "mlb", "tee ball", "t-ball", "pitcher"], icons: ["baseball", "bats"], base: "#12284B", raised: "#FFFFFF", designs: ["pennant", "jersey", "classic"] },
    { key: "hockey", group: "Sports", label: "Hockey", words: ["hockey", "nhl", "puck", "skating"], icons: ["hockey", "skate"], base: "#1B4F9C", raised: "#FFFFFF", designs: ["jersey", "badge", "classic"] },
    { key: "tennis", group: "Sports", label: "Tennis", words: ["tennis", "pickleball", "racquet", "racket", "padel", "badminton"], icons: ["tennis", "tennis_ball"], base: "#224B8F", raised: "#DFFF4F", designs: ["classic", "badge"] },
    { key: "golf", group: "Sports", label: "Golf", words: ["golf", "pga", "fore", "putt"], icons: ["golf", "golf_tee"], base: "#1F6B3A", raised: "#FFFFFF", designs: ["classic", "badge", "pennant"] },
    { key: "volleyball", group: "Sports", label: "Volleyball", words: ["volleyball", "volley", "spike"], icons: ["volleyball", "volley_net"], base: "#0B3D91", raised: "#F5C518", designs: ["classic", "jersey", "badge"] },
    { key: "bowling", group: "Sports", label: "Bowling", words: ["bowling", "bowl", "strike", "pins"], icons: ["bowling", "trophy"], base: "#5B1A8C", raised: "#FFFFFF", designs: ["badge", "classic", "jersey"] },
    { key: "track", group: "Sports", label: "Track", words: ["track", "running", "runner", "marathon", "cross country", "5k", "race day", "swim"], icons: ["medal", "trophy", "star"], base: "#C8102E", raised: "#FFFFFF", designs: ["badge", "classic"] },
    { key: "movies", group: "Movies", label: "Movies", words: ["movie", "film", "cinema", "theater", "theatre", "hollywood", "director", "actor", "screening"], icons: ["clapper", "film_reel", "popcorn", "movie_camera", "star"], base: "#1A1A1A", raised: "#E8B931", designs: ["marquee", "ticket", "classic"] },
    { key: "tv", group: "TV", label: "TV Room", words: ["tv", "television", "binge", "show", "series", "streaming", "couch", "den"], icons: ["retro_tv", "flat_tv", "remote", "binge", "popcorn"], base: "#23395B", raised: "#F2F2F2", designs: ["marquee", "classic", "ticket"] },
    { key: "cars", group: "Cars", label: "Garage", words: ["car", "garage", "racing", "race", "motor", "auto", "mechanic", "nascar", "f1", "truck", "drift", "pit"], icons: ["sports_car", "steering_wheel", "checkered", "wrenches", "tire"], base: "#B3121B", raised: "#FFFFFF", designs: ["license", "classic", "badge"] },
    { key: "music", group: "Music", label: "Music", words: ["music", "guitar", "band", "dj", "rock", "singer", "drum", "vinyl", "record", "studio", "song", "karaoke", "piano"], icons: ["guitar", "notes", "headphones", "vinyl", "microphone", "drums"], base: "#2D1B4E", raised: "#F7C948", designs: ["marquee", "ticket", "classic"] },
  ];
  const FALLBACK = { key: "general", group: "Other", label: "Champion", words: [], icons: ["trophy", "star", "medal"], base: "#1A1A1A", raised: "#D4AF37", designs: ["classic", "badge"] };
  NP.SUBJECTS = SUBJECTS;
  NP.matchSubject = (subject) => {
    const s = " " + (subject || "").toLowerCase() + " ";
    // the longest whole-word match wins ("coffee shop" -> Coffee, not Workshop); then substrings
    let best = null, bl = 0;
    for (const sp of SUBJECTS) for (const w of sp.words) {
      if (w.length > bl && new RegExp("[^a-z]" + w.replace(/[-.+]/g, "\\$&") + "s?[^a-z]").test(s)) { best = sp; bl = w.length; }
    }
    if (best) return best;
    for (const sp of SUBJECTS) for (const w of sp.words) if (w.length > 3 && s.includes(w) && w.length > bl) { best = sp; bl = w.length; }
    return best || FALLBACK;
  };
  // backwards-compatible names used by the series script
  NP.SPORTS = SUBJECTS.filter((s) => s.group === "Sports").map((s) => Object.assign({}, s, { key: s.icons[0] }));
  NP.matchSport = (s) => { const m = NP.matchSubject(s); return Object.assign({}, m, { key: m.icons[0] }); };

