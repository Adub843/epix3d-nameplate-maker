  /* =================================================================
     v6: music genres, TV genres, garage vehicles: icons, subjects, ideas.
     All artwork is original and generic: no show characters, show logos
     or vehicle-maker emblems.
     ================================================================= */
  const ngon6 = (cx, cy, r, n, rot = 0) => { const p = []; for (let i = 0; i < n; i++) { const a = rot + (i * 2 * Math.PI) / n; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return S.poly(p); };
  const halfY = (f, y0, above = true) => S.inter(f, (x, y) => (above ? y0 - y : y - y0));
  const wheel = (x, y, r) => S.sub(S.circle(x, y, r), S.ring(x, y, r * 0.55, r * 0.16));

  // ---- music
  I.electric_guitar = () => {
    const body = S.sub(S.union(S.circle(-0.08, -0.5, 0.42), S.circle(0.06, -0.12, 0.31), S.ellipse(-0.22, -0.08, 0.16, 0.26)), S.circle(0.33, 0.17, 0.17), S.circle(-0.36, 0.2, 0.12));
    const g = S.union(S.sub(body, S.box(-0.02, -0.38, 0.17, 0.035, 0.02), S.box(-0.02, -0.56, 0.17, 0.035, 0.02), S.circle(0.17, -0.72, 0.06)),
      S.seg(0.0, -0.2, 0.0, 0.8, 0.13), S.offset(S.poly([[-0.07, 0.78], [0.09, 0.78], [0.13, 1.05], [-0.05, 1.12]]), 0.03));
    return X(g, 0.08, 0.02, 1.12, -0.55);
  };
  I.banjo = () => X(S.union(S.sub(S.circle(0, -0.42, 0.56), S.ring(0, -0.42, 0.45, 0.05), S.box(0, -0.55, 0.14, 0.03, 0.01)),
    S.seg(0, 0.1, 0, 0.92, 0.14), S.box(0, 1.0, 0.1, 0.13, 0.04), S.circle(0.12, 0.5, 0.05)), 0.05, 0.02, 1.1, -0.5);
  I.boombox = () => S.union(S.sub(S.box(0, -0.15, 0.96, 0.52, 0.12), S.ring(-0.52, -0.22, 0.25, 0.08), S.ring(0.52, -0.22, 0.25, 0.08), S.box(0, -0.05, 0.17, 0.13, 0.03), S.circle(-0.52, -0.22, 0.07), S.circle(0.52, -0.22, 0.07)),
    halfY(S.shell(S.box(0, 0.4, 0.62, 0.28, 0.18), 0.1), 0.36), S.box(-0.5, 0.25, 0.06, 0.03), S.box(0.5, 0.25, 0.06, 0.03));
  I.sax = () => {
    const tube = S.union(S.seg(0.32, 0.86, 0.14, -0.38, 0.17), halfY(S.ring(-0.1, -0.42, 0.25, 0.2), -0.42, false), S.offset(S.poly([[-0.52, 0.28], [-0.12, 0.28], [-0.25, -0.42], [-0.44, -0.42]]), 0.03),
      S.seg(0.32, 0.86, 0.08, 1.0, 0.07));
    return X(S.sub(tube, ...[0.55, 0.3, 0.05, -0.2].map((t) => S.circle(0.32 - (0.86 - t) * 0.145 + 0.02, t, 0.045))), 0.08, -0.02, 0.95, 0);
  };
  I.trumpet = () => X(S.union(S.seg(-0.95, 0.05, 0.35, 0.05, 0.12), S.offset(S.poly([[0.35, 0.0], [0.35, 0.1], [0.95, 0.38], [0.95, -0.28]]), 0.02),
    halfY(S.shell(S.box(-0.2, -0.18, 0.45, 0.2, 0.2), 0.1), 0.0, false), ...[-0.35, -0.15, 0.05].map((x) => S.box(x, 0.18, 0.055, 0.2, 0.02)), ...[-0.35, -0.15, 0.05].map((x) => S.circle(x, 0.42, 0.075)),
    S.box(-1.0, 0.05, 0.05, 0.1, 0.02)), 0, 0, 0.95, 0.15);
  I.violin = () => {
    const body = S.sub(S.union(S.ellipse(0, -0.42, 0.42, 0.38), S.ellipse(0, 0.12, 0.34, 0.3), S.box(0, -0.15, 0.2, 0.2)), S.circle(-0.44, -0.12, 0.13), S.circle(0.44, -0.12, 0.13),
      S.seg(-0.18, -0.05, -0.15, -0.4, 0.05), S.seg(0.18, -0.05, 0.15, -0.4, 0.05), S.box(0, -0.48, 0.13, 0.025));
    return X(S.union(body, S.seg(0, 0.3, 0, 0.85, 0.11), S.circle(0.02, 0.92, 0.1), S.seg(-0.7, -0.95, 0.75, 0.75, 0.05)), 0, 0.02, 0.98, 0);
  };
  I.clef = () => {
    const spiral = S.union(halfY(S.ring(0.02, -0.28, 0.32, 0.12), -0.28, false), halfY(S.ring(-0.03, -0.18, 0.4, 0.11), -0.18, true), halfY(S.ring(0.1, -0.24, 0.22, 0.1), -0.24, true));
    const top = S.union(halfY(S.ring(0.05, 0.52, 0.22, 0.11), 0.52, true), S.seg(0.27, 0.52, -0.25, 0.0, 0.11));
    return S.union(spiral, top, S.seg(-0.12, 0.6, 0.12, -0.85, 0.09), S.circle(-0.08, -0.82, 0.13));
  };
  I.keys = () => {
    const board = S.box(0, 0, 0.98, 0.6, 0.06), parts = [S.shell(board, 0.09)];
    for (let i = 1; i < 7; i++) parts.push(S.seg(-0.98 + i * 0.28, -0.6, -0.98 + i * 0.28, 0.6, 0.06));
    for (const i of [1, 2, 4, 5, 6]) parts.push(S.box(-0.98 + i * 0.28, 0.17, 0.075, 0.43, 0.02));
    return S.union(...parts);
  };
  I.speaker = () => S.sub(S.box(0, 0, 0.62, 0.95, 0.1), S.ring(0, -0.3, 0.36, 0.09), S.circle(0, -0.3, 0.12), S.ring(0, 0.5, 0.17, 0.07), S.circle(0, 0.5, 0.05));
  I.cassette = () => S.sub(S.box(0, 0, 0.98, 0.64, 0.08), S.box(0, 0.12, 0.62, 0.24, 0.08), S.circle(-0.36, 0.12, 0.13), S.circle(0.36, 0.12, 0.13), S.box(0, -0.48, 0.48, 0.07, 0.03), S.circle(-0.82, 0.5, 0.05), S.circle(0.82, 0.5, 0.05));
  I.waveform = () => S.union(...[0.25, 0.55, 0.85, 0.45, 1.0, 0.6, 0.35, 0.75, 0.3].map((h, i) => S.seg(-0.88 + i * 0.22, -h * 0.9, -0.88 + i * 0.22, h * 0.9, 0.13)));
  I.skull = () => S.sub(S.union(S.circle(0, 0.18, 0.66), S.box(0, -0.42, 0.38, 0.3, 0.12)), S.ellipse(-0.26, 0.08, 0.17, 0.2), S.ellipse(0.26, 0.08, 0.17, 0.2),
    S.poly([[0, -0.08], [-0.08, -0.26], [0.08, -0.26]]), ...[-0.2, -0.07, 0.07, 0.2].map((x) => S.seg(x, -0.48, x, -0.7, 0.05)));
  I.maracas = () => { const m = (r) => X(S.union(S.ellipse(0, 0.32, 0.3, 0.42), S.seg(0, -0.1, 0, -0.85, 0.12), S.sub(S.box(0, 0.32, 0.3, 0.035), S.EMPTY)), r > 0 ? 0.28 : -0.28, 0, 1, r); return S.union(m(-0.4), S.sub(m(0.4), S.offset(m(-0.4), 0.07))); };
  I.pick = () => S.offset(S.poly([[-0.62, 0.62], [0.62, 0.62], [0, -0.78]]), 0.22);
  I.cowbell = () => S.union(S.offset(S.poly([[-0.3, 0.5], [0.3, 0.5], [0.55, -0.6], [-0.55, -0.6]]), 0.06), halfY(S.ring(0, 0.55, 0.18, 0.1), 0.55));

  // ---- TV genres
  I.rocket = () => X(S.union(S.sub(S.union(S.ellipse(0, 0.12, 0.3, 0.78), S.offset(S.poly([[-0.28, -0.25], [-0.55, -0.62], [-0.22, -0.55]]), 0.03), S.offset(S.poly([[0.28, -0.25], [0.55, -0.62], [0.22, -0.55]]), 0.03)),
    S.ring(0, 0.25, 0.13, 0.05), S.box(0, -0.42, 0.3, 0.025)), S.offset(S.poly([[-0.14, -0.66], [0.14, -0.66], [0, -1.0]]), 0.04)), 0, 0, 1, -0.45);
  I.ufo = () => S.sub(S.union(halfY(S.ellipse(0, 0.12, 0.38, 0.38), 0.12), S.ellipse(0, 0.05, 0.98, 0.24), S.ellipse(0, -0.12, 0.5, 0.13),
    S.sub(S.poly([[-0.25, -0.2], [0.25, -0.2], [0.55, -0.95], [-0.55, -0.95]]), ...[-0.5, -0.75].map((y) => S.box(0, y, 1, 0.045)))), ...[-0.62, -0.3, 0, 0.3, 0.62].map((x) => S.circle(x, 0.02, 0.07)));
  I.planet = () => { const ring = X(S.shell(S.ellipse(0, 0, 1.0, 0.28), 0.1), 0, 0, 1, 0.35); const ball = S.circle(0, 0, 0.55); return S.union(S.sub(ball, S.offset(halfY(ring, 0, false), 0.08)), S.sub(ring, S.offset(halfY(ball, -0.05, true), 0.08)), S.circle(0.7, 0.7, 0.07), S.circle(-0.75, -0.68, 0.05)); };
  I.robot = () => S.union(S.sub(S.box(0, -0.05, 0.6, 0.5, 0.14), S.circle(-0.25, 0.05, 0.13), S.circle(0.25, 0.05, 0.13), ...[-0.24, -0.08, 0.08, 0.24].map((x) => S.box(x, -0.3, 0.04, 0.07))),
    S.seg(0, 0.45, 0, 0.75, 0.08), S.circle(0, 0.82, 0.11), S.box(-0.7, -0.05, 0.08, 0.2, 0.04), S.box(0.7, -0.05, 0.08, 0.2, 0.04), S.box(0, -0.68, 0.3, 0.1, 0.04));
  I.couch = () => S.sub(S.union(S.box(0, 0.15, 0.72, 0.38, 0.14), S.box(-0.82, -0.12, 0.17, 0.35, 0.12), S.box(0.82, -0.12, 0.17, 0.35, 0.12), S.box(0, -0.25, 0.75, 0.2, 0.06),
    S.box(-0.78, -0.55, 0.06, 0.1, 0.02), S.box(0.78, -0.55, 0.06, 0.1, 0.02)), S.seg(0, -0.45, 0, 0.45, 0.05), S.seg(-0.68, -0.07, 0.68, -0.07, 0.05));
  I.magnifier = () => S.union(S.ring(-0.18, 0.2, 0.5, 0.16), S.seg(0.2, -0.2, 0.75, -0.78, 0.24), S.seg(-0.42, 0.38, -0.25, 0.5, 0.07));
  I.fingerprint = () => { const p = []; for (let i = 0; i < 5; i++) p.push(S.shell(S.ellipse(0, -0.05, 0.12 + i * 0.17, 0.2 + i * 0.2), 0.08)); return S.sub(S.inter(S.union(...p), S.ellipse(0, 0, 0.82, 1.0)), S.seg(0.2, -0.95, 0.35, 0.05, 0.1), S.seg(-0.5, 0.3, -0.3, 0.9, 0.08)); };
  I.sheriff = () => { const parts = [S.sub(S.star(0, 0, 0.88, 0.48, 6, Math.PI / 2), S.ring(0, 0, 0.33, 0.07))]; for (let i = 0; i < 6; i++) { const a = Math.PI / 2 + (i * Math.PI) / 3; parts.push(S.circle(0.9 * Math.cos(a), 0.9 * Math.sin(a), 0.12)); } return S.union(...parts); };
  I.ghost = () => S.sub(S.union(S.circle(0, 0.25, 0.6), S.box(0, -0.3, 0.6, 0.55, 0)), ...[-0.4, 0, 0.4].map((x) => S.circle(x, -0.88, 0.2)), S.ellipse(-0.22, 0.3, 0.1, 0.15), S.ellipse(0.22, 0.3, 0.1, 0.15), S.ellipse(0, -0.05, 0.12, 0.1));
  I.pumpkin = () => S.union(S.sub(S.union(S.ellipse(-0.35, -0.1, 0.45, 0.62), S.ellipse(0.35, -0.1, 0.45, 0.62), S.ellipse(0, -0.1, 0.45, 0.68)),
    S.poly([[-0.4, 0.1], [-0.18, 0.1], [-0.29, 0.3]]), S.poly([[0.4, 0.1], [0.18, 0.1], [0.29, 0.3]]), S.offset(S.poly([[-0.42, -0.25], [0.42, -0.25], [0.3, -0.42], [0.12, -0.32], [0, -0.45], [-0.12, -0.32], [-0.3, -0.42]]), 0.02)),
    S.box(0.04, 0.68, 0.08, 0.16, 0.04));
  I.batwing = () => S.sub(S.poly([[0, 0.25], [-0.12, 0.42], [-0.18, 0.25], [-0.6, 0.45], [-1.0, 0.2], [-0.85, -0.05], [-0.65, -0.12], [-0.45, -0.05], [-0.25, -0.3], [0, -0.1],
    [0.25, -0.3], [0.45, -0.05], [0.65, -0.12], [0.85, -0.05], [1.0, 0.2], [0.6, 0.45], [0.18, 0.25], [0.12, 0.42]]), S.EMPTY);
  I.mask = () => S.sub(S.offset(S.poly([[-0.95, 0.15], [-0.5, 0.42], [0, 0.22], [0.5, 0.42], [0.95, 0.15], [0.7, -0.3], [0.3, -0.32], [0, -0.1], [-0.3, -0.32], [-0.7, -0.3]]), 0.06),
    S.ellipse(-0.42, 0.04, 0.22, 0.14), S.ellipse(0.42, 0.04, 0.22, 0.14));
  I.hero_shield = () => S.sub(S.offset(S.poly([[-0.7, 0.8], [0.7, 0.8], [0.7, 0.05], [0, -0.92], [-0.7, 0.05]]), 0.08), S.star(0, 0.1, 0.42, 0.18, 5, Math.PI / 2), S.shell(S.offset(S.poly([[-0.56, 0.68], [0.56, 0.68], [0.56, 0.06], [0, -0.74], [-0.56, 0.06]]), 0.04), 0.06));
  I.castle = () => { const crenel = (x, w, y) => S.union(...[-1, 0, 1].map((i) => S.box(x + i * w * 0.66, y, w * 0.18, 0.08))); return S.sub(S.union(S.box(0, -0.35, 0.62, 0.45), S.box(-0.62, -0.1, 0.22, 0.7), S.box(0.62, -0.1, 0.22, 0.7), S.box(0, 0.3, 0.2, 0.25), crenel(-0.62, 0.3, 0.66), crenel(0.62, 0.3, 0.66), crenel(0, 0.28, 0.6), S.poly([[0, 0.95], [0, 0.72], [0.28, 0.84]])),
    S.union(S.box(0, -0.62, 0.2, 0.2), S.circle(0, -0.42, 0.2)), S.box(-0.62, 0.15, 0.06, 0.12), S.box(0.62, 0.15, 0.06, 0.12)); };
  I.sword = () => X(S.union(S.poly([[-0.09, -0.3], [0.09, -0.3], [0.09, 0.82], [0, 1.0], [-0.09, 0.82]]), S.box(0, -0.35, 0.36, 0.06, 0.04), S.box(0, -0.62, 0.07, 0.24, 0.03), S.circle(0, -0.92, 0.1)), 0, 0, 0.95, 0.7);
  I.wand = () => S.union(S.seg(-0.75, -0.75, 0.15, 0.15, 0.12), S.star(0.38, 0.38, 0.52, 0.22, 5, Math.PI / 2 + 0.2), S.circle(-0.55, 0.55, 0.06), S.circle(0.8, -0.3, 0.07), S.circle(0.1, 0.92, 0.05));
  I.cactus = () => S.union(S.seg(0, -0.8, 0, 0.75, 0.32), S.union(S.seg(-0.5, 0.05, -0.5, 0.45, 0.22), S.seg(-0.5, 0.05, -0.05, 0.05, 0.22)), S.union(S.seg(0.48, -0.2, 0.48, 0.25, 0.22), S.seg(0.48, -0.2, 0.05, -0.2, 0.22)), S.box(0, -0.85, 0.55, 0.06, 0.03));
  I.whisk = () => X(S.union(S.seg(0, -0.95, 0, -0.25, 0.16), S.shell(S.ellipse(0, 0.35, 0.36, 0.62), 0.07), S.shell(S.ellipse(0, 0.35, 0.16, 0.62), 0.07), S.seg(0, -0.25, 0, 0.95, 0.07)), 0, 0, 0.95, 0.5);
  I.buzzer = () => S.union(halfY(S.circle(0, 0.0, 0.55), 0.0), S.box(0, -0.12, 0.62, 0.1, 0.04), S.box(0, -0.45, 0.85, 0.22, 0.08), S.seg(-0.75, 0.4, -0.95, 0.65, 0.07), S.seg(0.75, 0.4, 0.95, 0.65, 0.07), S.seg(0, 0.72, 0, 0.98, 0.07));
  I.tv_rabbit = () => S.union(S.sub(S.box(0, -0.2, 0.92, 0.6, 0.12), S.box(-0.15, -0.2, 0.6, 0.45, 0.1), S.circle(0.7, 0.05, 0.08), S.circle(0.7, -0.2, 0.08)), S.seg(0, 0.4, -0.45, 0.95, 0.07), S.seg(0, 0.4, 0.45, 0.95, 0.07), S.box(-0.6, -0.86, 0.08, 0.06), S.box(0.6, -0.86, 0.08, 0.06));

  // ---- garage (side views; generic shapes)
  I.pickup = () => S.sub(S.union(S.offset(S.poly([[-0.95, -0.35], [0.95, -0.35], [0.95, 0.0], [0.6, 0.05], [0.42, 0.48], [0.0, 0.48], [-0.05, 0.05], [-0.95, 0.05]]), 0.05), wheel(-0.58, -0.42, 0.24), wheel(0.6, -0.42, 0.24)),
    S.offset(S.poly([[0.07, 0.12], [0.33, 0.12], [0.38, 0.38], [0.07, 0.38]]), 0.02), S.ring(-0.58, -0.42, 0.29, 0.06), S.ring(0.6, -0.42, 0.29, 0.06));
  I.van = () => S.sub(S.union(S.offset(S.poly([[-0.95, -0.38], [0.95, -0.38], [0.95, 0.05], [0.72, 0.55], [-0.95, 0.55]]), 0.06), wheel(-0.55, -0.45, 0.22), wheel(0.58, -0.45, 0.22)),
    S.offset(S.poly([[0.5, 0.12], [0.82, 0.12], [0.66, 0.45], [0.5, 0.45]]), 0.02), S.box(-0.55, 0.28, 0.32, 0.15, 0.04), S.box(0.05, 0.28, 0.2, 0.15, 0.04), S.ring(-0.55, -0.45, 0.27, 0.06), S.ring(0.58, -0.45, 0.27, 0.06));
  I.classic_car = () => S.sub(S.union(S.offset(S.poly([[-0.98, -0.25], [0.98, -0.25], [0.98, 0.0], [0.5, 0.08], [0.3, 0.42], [-0.35, 0.42], [-0.55, 0.08], [-0.98, 0.12], [-0.92, 0.22]]), 0.06), wheel(-0.58, -0.32, 0.21), wheel(0.58, -0.32, 0.21)),
    S.offset(S.poly([[-0.38, 0.12], [-0.05, 0.12], [-0.05, 0.35], [-0.28, 0.35]]), 0.02), S.offset(S.poly([[0.03, 0.12], [0.36, 0.12], [0.22, 0.35], [0.03, 0.35]]), 0.02), S.seg(-0.9, -0.05, 0.9, -0.05, 0.04),
    S.ring(-0.58, -0.32, 0.26, 0.06), S.ring(0.58, -0.32, 0.26, 0.06));
  I.motorcycle = () => S.union(S.ring(-0.6, -0.35, 0.33, 0.1), S.ring(0.62, -0.35, 0.33, 0.1), S.seg(-0.6, -0.35, -0.1, -0.1, 0.1), S.seg(-0.1, -0.1, 0.35, -0.2, 0.12), S.seg(0.62, -0.35, 0.38, 0.4, 0.1),
    S.ellipse(0.1, 0.12, 0.3, 0.15), S.box(-0.35, 0.08, 0.22, 0.07, 0.04), S.seg(0.38, 0.4, 0.2, 0.55, 0.08), S.box(0.0, -0.25, 0.16, 0.13, 0.03));
  I.suv4x4 = () => S.sub(S.union(S.offset(S.poly([[-0.85, -0.3], [0.95, -0.3], [0.95, 0.1], [0.62, 0.15], [0.48, 0.55], [-0.85, 0.55]]), 0.05), wheel(-0.5, -0.4, 0.27), wheel(0.6, -0.4, 0.27), S.box(-0.95, 0.05, 0.08, 0.25, 0.05)),
    S.box(-0.45, 0.32, 0.3, 0.14, 0.03), S.offset(S.poly([[0.0, 0.18], [0.45, 0.18], [0.38, 0.45], [0.0, 0.45]]), 0.02), S.ring(-0.5, -0.4, 0.32, 0.06), S.ring(0.6, -0.4, 0.32, 0.06));
  I.tractor = () => S.union(wheel(-0.45, -0.3, 0.52), wheel(0.6, -0.55, 0.3), S.sub(S.box(-0.35, 0.45, 0.32, 0.4, 0.04), S.box(-0.35, 0.5, 0.22, 0.25, 0.03)), S.box(0.3, -0.05, 0.45, 0.22, 0.05), S.seg(0.45, 0.15, 0.45, 0.62, 0.08), S.box(-0.35, 0.88, 0.42, 0.05, 0.02));
  I.piston = () => S.union(S.sub(S.box(0, 0.38, 0.55, 0.42, 0.06), ...[0.65, 0.5].map((y) => S.box(0, y, 0.6, 0.03)), S.circle(0, 0.15, 0.12)), S.seg(0, 0.15, 0, -0.62, 0.22), S.sub(S.circle(0, -0.72, 0.28), S.circle(0, -0.72, 0.12)));
  I.spark_plug = () => X(S.union(ngon6(0, 0.2, 0.32, 6), S.seg(0, 0.2, 0, 0.92, 0.22), S.box(0, 0.98, 0.07, 0.06), S.sub(S.box(0, -0.3, 0.2, 0.3, 0.03), ...[-0.15, -0.3, -0.45].map((y) => S.box(0, y, 0.25, 0.025))), S.seg(0, -0.6, 0, -0.85, 0.06), S.seg(0, -0.85, 0.12, -0.85, 0.06)), 0, 0, 1, -0.6);
  I.gas_pump = () => S.union(S.sub(S.box(-0.2, 0, 0.45, 0.85, 0.08), S.box(-0.2, 0.42, 0.3, 0.22, 0.04)), S.box(-0.2, -0.9, 0.58, 0.06, 0.02), S.union(S.seg(0.25, 0.3, 0.55, 0.3, 0.08), S.seg(0.55, 0.3, 0.6, -0.4, 0.08), S.seg(0.6, -0.4, 0.75, -0.3, 0.08)), S.box(0.55, 0.45, 0.06, 0.2, 0.03));
  I.cone = () => S.union(S.sub(S.offset(S.poly([[-0.48, -0.65], [0.48, -0.65], [0.08, 0.9], [-0.08, 0.9]]), 0.04), S.box(0, 0.25, 0.6, 0.08), S.box(0, -0.2, 0.6, 0.08)), S.box(0, -0.78, 0.82, 0.1, 0.04));
  I.oil_can = () => S.union(S.sub(S.box(-0.25, -0.25, 0.55, 0.45, 0.08), S.box(-0.25, -0.25, 0.32, 0.12, 0.03)), S.seg(0.3, -0.05, 0.95, 0.35, 0.1), halfY(S.ring(-0.25, 0.2, 0.3, 0.08), 0.2), S.circle(0.95, 0.35, 0.06));

  Object.assign(ICON_LABELS, {
    electric_guitar: "Electric guitar", banjo: "Banjo", boombox: "Boombox", sax: "Sax", trumpet: "Trumpet", violin: "Violin", clef: "Clef", keys: "Keys",
    speaker: "Speaker", cassette: "Cassette", waveform: "Soundwave", skull: "Skull", maracas: "Maracas", pick: "Guitar pick", cowbell: "Cowbell",
    rocket: "Rocket", ufo: "UFO", planet: "Planet", robot: "Robot", couch: "Couch", magnifier: "Magnifier", fingerprint: "Fingerprint", sheriff: "Sheriff star",
    ghost: "Ghost", pumpkin: "Pumpkin", batwing: "Bat", mask: "Hero mask", hero_shield: "Hero shield", castle: "Castle", sword: "Sword", wand: "Wand",
    cactus: "Cactus", whisk: "Whisk", buzzer: "Buzzer", tv_rabbit: "Rabbit-ear TV",
    pickup: "Pickup", van: "Van", classic_car: "Classic car", motorcycle: "Motorcycle", suv4x4: "4x4", tractor: "Tractor", piston: "Piston",
    spark_plug: "Spark plug", gas_pump: "Gas pump", cone: "Cone", oil_can: "Oil can",
  });

  /* ---- subjects */
  const musicW = SUBJECTS.find((s) => s.key === "music"); if (musicW) { musicW.label = "Music (all)"; musicW.words = musicW.words.filter((w) => !["rock", "dj"].includes(w)); }
  const carsW = SUBJECTS.find((s) => s.key === "cars"); if (carsW) { carsW.words = carsW.words.filter((w) => !["truck", "racing", "race", "nascar", "f1"].includes(w)); }
  const tvW = SUBJECTS.find((s) => s.key === "tv"); if (tvW) tvW.label = "TV Room";
  Object.assign(PALETTES, {
    honkytonk: { label: "Honky-tonk", base: P("pla:brown"), accent: P("pla:yellow"), panel: P("pla:cream"), bold: P("pla:red"), letters: P("pla:cream") },
    amp: { label: "Amp", base: P("pla:black"), accent: P("pla:red"), panel: P("pla:cold-white"), bold: P("pla:steel-grey"), letters: P("pla:cold-white") },
    blockparty: { label: "Block party", base: P("pla:purple"), accent: P("pla:lemon-yellow"), panel: P("pla:cold-white"), bold: P("pla:black"), letters: P("pla:cold-white") },
    smoky: { label: "Smoky club", base: P("pro:blue-green"), accent: P("pro:light-yellow"), panel: P("pla:cream"), bold: P("pla:wine-red"), letters: P("pla:cream") },
    concert: { label: "Concert hall", base: P("pla:wine-red"), accent: P("pla:yellow"), panel: P("pla:cream"), bold: P("pla:black"), letters: P("pla:cream") },
    rave: { label: "Rave", base: P("pro:dark-purple"), accent: P("pla:lime-green"), panel: P("pla:cold-white"), bold: P("pla:magenta"), letters: P("pla:cold-white") },
    rasta: { label: "Island", base: P("pla:jungle-green"), accent: P("pla:yellow"), panel: P("pla:cold-white"), bold: P("pla:red"), letters: P("pla:cold-white") },
    fiesta: { label: "Fiesta", base: P("pla:magenta"), accent: P("pla:yellow"), panel: P("pla:cold-white"), bold: P("pla:polymaker-teal"), letters: P("pla:cold-white") },
    space: { label: "Deep space", base: P("pla:blue"), accent: P("pla:lime-green"), panel: P("pla:cold-white"), bold: P("pla:purple"), letters: P("pla:cold-white") },
    noir: { label: "Noir", base: P("pla:black"), accent: P("pla:yellow"), panel: P("pla:cold-white"), bold: P("pla:steel-grey"), letters: P("pla:cold-white") },
    spooky: { label: "Spooky", base: P("pla:black"), accent: P("pla:orange"), panel: P("pla:cold-white"), bold: P("pla:purple"), letters: P("pla:cold-white") },
    hero: { label: "Hero", base: P("pla:blue"), accent: P("pla:yellow"), panel: P("pla:cold-white"), bold: P("pla:red"), letters: P("pla:cold-white") },
    toon: { label: "Toon", base: P("pla:azure-blue"), accent: P("pla:yellow"), panel: P("pla:cold-white"), bold: P("pla:red"), letters: P("pla:cold-white") },
    dusty: { label: "Dusty trail", base: P("pro:flat-dark-earth"), accent: P("pla:orange"), panel: P("pla:cream"), bold: P("pla:brown"), letters: P("pla:cream") },
    enchanted: { label: "Enchanted", base: P("pla:purple"), accent: P("pro:light-yellow"), panel: P("pla:cold-white"), bold: P("pro:polymaker-teal"), letters: P("pla:cold-white") },
    sakura: { label: "Sakura", base: P("pla:pink"), accent: P("pla:magenta"), panel: P("pla:cold-white"), bold: P("pla:black"), letters: P("pla:cold-white") },
  });
  const V = NP.VEHICLES;
  const NEW6 = [
    // [key, group, label, words, icons, palette, designs, vehicles?]
    ["country", "Music", "Country", ["country", "country music", "honky tonk", "nashville", "bluegrass", "americana", "western music"], ["cowboy_hat", "guitar", "banjo", "horseshoe"], "honkytonk", ["arch", "crest"]],
    ["rock", "Music", "Rock", ["rock", "rock and roll", "rock n roll", "classic rock", "guitarist", "rocker", "garage band"], ["electric_guitar", "bolt", "speaker", "pick"], "amp", ["burst", "crest"]],
    ["hiphop", "Music", "Hip-Hop", ["hip hop", "hip-hop", "rap", "rapper", "beats", "mc", "turntables", "producer"], ["boombox", "microphone", "vinyl", "cassette"], "blockparty", ["burst", "bubble"]],
    ["jazz", "Music", "Jazz", ["jazz", "jazz club", "swing", "big band", "bebop", "sax"], ["sax", "trumpet", "notes", "keys"], "smoky", ["arch", "burst"]],
    ["blues", "Music", "Blues", ["blues", "delta blues", "juke joint"], ["guitar", "notes", "microphone"], "smoky", ["arch", "crest"]],
    ["classical", "Music", "Classical", ["classical", "orchestra", "symphony", "violin", "cello", "opera", "piano lessons", "pianist"], ["violin", "clef", "keys", "notes"], "concert", ["arch", "crest"]],
    ["edm", "Music", "EDM & DJ", ["edm", "dj", "techno", "house music", "electronic", "rave", "dubstep", "club"], ["headphones", "waveform", "vinyl", "speaker"], "rave", ["burst", "bubble"]],
    ["metal", "Music", "Metal", ["metal", "heavy metal", "metalhead", "thrash", "headbanger"], ["skull", "electric_guitar", "bolt", "flame"], "amp", ["crest", "burst"]],
    ["pop", "Music", "Pop", ["pop", "pop music", "pop star", "karaoke", "top 40"], ["microphone", "star", "heart", "sparkle"], "candy", ["bubble", "burst"]],
    ["rnb", "Music", "R&B & Soul", ["r&b", "rnb", "soul", "motown", "funk", "neo soul"], ["vinyl", "microphone", "notes", "keys"], "neon", ["arch", "burst"]],
    ["reggae", "Music", "Reggae", ["reggae", "ska", "dub", "island music"], ["palm", "notes", "sun", "speaker"], "rasta", ["bubble", "arch"]],
    ["latin", "Music", "Latin", ["latin", "salsa", "mariachi", "bachata", "reggaeton", "cumbia", "merengue"], ["maracas", "guitar", "trumpet", "notes"], "fiesta", ["burst", "bubble"]],
    ["scifi", "TV", "Sci-Fi", ["sci-fi", "scifi", "science fiction", "space show", "aliens", "starship", "space"], ["rocket", "ufo", "planet", "robot"], "space", ["burst", "crest"]],
    ["sitcom", "TV", "Sitcoms", ["sitcom", "sitcoms", "comedy", "comedy show", "laugh track", "funny"], ["couch", "tv_rabbit", "popcorn", "remote"], "toon", ["bubble", "arch"]],
    ["crime", "TV", "Crime & Mystery", ["crime", "mystery", "detective", "true crime", "cop show", "whodunit", "investigation", "csi"], ["magnifier", "fingerprint", "sheriff"], "noir", ["crest", "arch"]],
    ["cartoons", "TV", "Cartoons", ["cartoon", "cartoons", "animation", "animated", "saturday morning", "kids shows"], ["tv_rabbit", "star", "sparkle", "heart"], "toon", ["bubble", "burst"]],
    ["reality", "TV", "Reality TV", ["reality", "reality tv", "reality show", "drama", "bachelor", "survivor"], ["flat_tv", "heart", "crown", "sparkle"], "candy", ["burst", "bubble"]],
    ["westerns", "TV", "Westerns", ["western", "westerns", "cowboy show", "wild west", "frontier"], ["sheriff", "cactus", "horseshoe", "cowboy_hat"], "dusty", ["crest", "arch"]],
    ["cooking", "TV", "Cooking Shows", ["cooking show", "cooking shows", "food network", "bake off", "baking show", "chef show"], ["chef_hat", "whisk", "utensils", "pot"], "kitchen", ["arch", "bubble"]],
    ["gameshow", "TV", "Game Shows", ["game show", "game shows", "quiz show", "trivia", "jeopardy"], ["buzzer", "star", "dice", "trophy"], "retro", ["burst", "crest"]],
    ["horror", "TV", "Horror", ["horror", "scary", "halloween", "spooky", "haunted", "zombie", "monster"], ["ghost", "pumpkin", "batwing", "skull"], "spooky", ["crest", "burst"]],
    ["superhero", "TV", "Superheroes", ["superhero", "superheroes", "hero", "comic", "comics", "comic book", "villain"], ["mask", "hero_shield", "bolt", "star"], "hero", ["burst", "crest"]],
    ["fantasy", "TV", "Fantasy", ["fantasy", "dragons", "wizard", "wizards", "magic", "medieval", "knights", "castle"], ["castle", "sword", "wand", "crown"], "enchanted", ["crest", "arch"]],
    ["anime", "TV", "Anime", ["anime", "manga", "otaku", "cosplay"], ["sparkle", "star", "heart", "flower"], "sakura", ["bubble", "burst"]],
    ["trucks", "Cars", "Trucks", ["truck", "trucks", "pickup", "pickup truck", "trucker", "lifted", "diesel", "big rig", "semi"], ["pickup", "tire", "wrenches", "piston"], "garage", ["burst", "crest"], ["truck", "pickup50", "offroad"]],
    ["vans", "Cars", "Vans", ["van", "vans", "van life", "vanlife", "camper van", "delivery", "minivan", "work van"], ["van", "mountains", "wrenches", "tire"], "garage", ["burst", "arch"], ["van", "truck", "boxy80"]],
    ["classics", "Cars", "Classic Cars", ["classic car", "classic cars", "vintage car", "antique car", "car show", "cruise night", "50s", "60s", "chrome"], ["classic_car", "checkered", "star", "wrenches"], "retro", ["arch", "crest"], ["cruiser50", "pickup50", "classic70", "muscle60"]],
    ["muscle", "Cars", "Muscle Cars", ["muscle car", "muscle cars", "v8", "drag", "drag racing", "horsepower", "hot rod", "hot rods"], ["sports_car", "flame", "piston", "checkered"], "victory", ["burst", "crest"], ["muscle60", "classic70", "cruiser50"]],
    ["racing", "Cars", "Racing", ["racing", "race", "racer", "race car", "nascar", "f1", "formula 1", "track day", "motorsport", "speedway", "rally"], ["sports_car", "checkered", "steering_wheel", "tire"], "victory", ["burst", "crest"], ["supercar", "muscle60", "aero90"]],
    ["moto", "Cars", "Motorcycles", ["motorcycle", "motorcycles", "biker", "bikers", "motorbike", "chopper", "harley", "dirt bike"], ["motorcycle", "flame", "wrenches", "skull"], "garage", ["crest", "burst"]],
    ["offroad", "Cars", "Off-Road", ["off road", "off-road", "offroad", "4x4", "overland", "mudding", "rock crawler", "trail rig", "jeep"], ["suv4x4", "mountains", "tire", "compass"], "blaze", ["crest", "arch"], ["offroad", "truck", "pickup50"]],
    ["farm", "Cars", "Tractors & Farm", ["tractor", "tractors", "farm equipment", "farmer", "farming", "harvest"], ["tractor", "sprout", "sun", "horseshoe"], "gameday", ["arch", "crest"]],
    ["shop", "Cars", "Mechanic Shop", ["mechanic", "auto shop", "repair shop", "car repair", "oil change", "tire shop", "body shop", "service"], ["wrenches", "piston", "spark_plug", "oil_can"], "garage", ["burst", "crest"], ["truck", "classic70", "boxy80"]],
  ];
  for (const [key, group, label, words, icons, pal, designs, vehicles] of NEW6) {
    if (SUBJECTS.some((s) => s.key === key)) continue;
    const sp = { key, group, label, words, icons, palette: pal, designs: designs.concat(["classic"]) };
    const p = PALETTES[pal]; sp.base = p.base; sp.raised = p.accent;
    sp.tools = icons.concat(EXTRAS[group] || EXTRAS.Other).filter((v, i, a) => a.indexOf(v) === i);
    if (vehicles) sp.vehicles = vehicles;
    SUBJECTS.push(sp);
  }
  if (carsW) { carsW.vehicles = ["cruiser50", "muscle60", "truck", "classic70", "boxy80", "aero90", "van", "offroad", "supercar", "pickup50"]; carsW.icons = ["sports_car", "pickup", "van", "steering_wheel", "checkered", "wrenches", "tire"]; }
  for (const sp of SUBJECTS) if (sp.group === "Cars") sp.tools = sp.icons.concat(["checkered", "flame", "bolt", "star", "wrenches", "tire", "piston", "spark_plug", "gas_pump", "cone", "oil_can", "pickup", "van", "classic_car", "motorcycle"]).filter((v, i, a) => a.indexOf(v) === i);
  for (const sp of SUBJECTS) if (sp.group === "Cars" && !sp.vehicles) sp.vehicles = ["truck", "muscle60", "cruiser50", "classic70"];
  const musicTools = ["notes", "star", "sparkle", "bolt", "heart", "flame", "clef", "pick", "waveform", "speaker"];
  for (const sp of SUBJECTS) if (sp.group === "Music") sp.tools = sp.icons.concat(musicTools).filter((v, i, a) => a.indexOf(v) === i);
  if (musicW) musicW.icons = ["guitar", "notes", "headphones", "vinyl", "microphone", "drums", "electric_guitar", "keys"];
  const tvTools = ["star", "sparkle", "heart", "bolt", "popcorn", "remote", "retro_tv", "tv_rabbit"];
  for (const sp of SUBJECTS) if (sp.group === "TV") sp.tools = sp.icons.concat(tvTools).filter((v, i, a) => a.indexOf(v) === i);
  SUBJECTS.sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group));
  NP.snapPalettes();
  for (const sp of SUBJECTS.concat([FALLBACK])) { const p = PALETTES[sp.palette] || PALETTES.pop; sp.base = p.base; sp.raised = p.accent; }

  /* ---- ten ideas for each new subject */
  Object.assign(EX, {
    country: [["Honky Tonk", "Est. 2026"], ["Boots & Hats", ""], ["Nashville Nights", ""], ["Cody", "Country Boy"], ["Dirt Road Diner", ""], ["Whiskey River", ""], ["Two Step", "Dance Hall"], ["Daisy", "Country Girl"], ["Back Porch", "Pickin'"], ["Grand Ole Den", ""]],
    rock: [["Rock On", ""], ["Jake", "Lead Guitar"], ["The Jam Room", "Est. 2026"], ["Amp It Up", ""], ["Rock & Roll", "All Night"], ["Garage Band", ""], ["Encore!", ""], ["Riff Raff", ""], ["Turn It Up", "To 11"], ["Backstage", "Crew Only"]],
    hiphop: [["Mic Check", ""], ["Beat Lab", "Est. 2026"], ["DJ Marcus", ""], ["Bars Only", ""], ["The Cypher", ""], ["Studio 808", ""], ["Drop the Beat", ""], ["Flow State", ""], ["Kenzie", "On the Mic"], ["Block Party", ""]],
    jazz: [["Blue Note Room", ""], ["All That Jazz", ""], ["Swing Shift", ""], ["Miles", "Trumpet"], ["The Jazz Club", "Est. 2026"], ["Smooth Sax", ""], ["Late Set", ""], ["Bebop Den", ""], ["Scat Cat", ""], ["Cool Cat Lounge", ""]],
    blues: [["Blues House", ""], ["Juke Joint", "Est. 2026"], ["Twelve Bar", ""], ["Delta Den", ""], ["B.B.'s Room", ""], ["Slow Hand", ""], ["Midnight Blues", ""], ["Blue Monday", ""], ["The Crossroads", ""], ["Soul Kitchen", ""]],
    classical: [["Music Room", "Practice Daily"], ["Maestro", ""], ["Clara", "Violin"], ["Piano Studio", "Est. 2026"], ["Symphony Hall", ""], ["Allegro", ""], ["The Conservatory", ""], ["Bravo!", ""], ["Etude", ""], ["Mr. Bach", "Teacher"]],
    edm: [["Drop Zone", ""], ["DJ Nova", ""], ["Bass Lab", "Est. 2026"], ["Night Shift", ""], ["Rave Cave", ""], ["Beat Drop", ""], ["Afterhours", ""], ["The Booth", "DJ Only"], ["Pulse", ""], ["Mix Master", ""]],
    metal: [["Headbanger", ""], ["Metal Den", "Est. 2026"], ["Thrash Zone", ""], ["Shred", ""], ["Mosh Pit", ""], ["Iron Riff", ""], ["Rage Room", ""], ["Hellraiser", ""], ["Loud & Proud", ""], ["Axe Master", ""]],
    pop: [["Pop Star", ""], ["Karaoke Queen", ""], ["Sing It!", ""], ["Mia", "On Stage"], ["Top 40", "Est. 2026"], ["Glitter & Gold", ""], ["Superstar", ""], ["Shine", ""], ["Encore", ""], ["Dance Party", ""]],
    rnb: [["Soul Food", ""], ["Groove Room", ""], ["Funk Lab", "Est. 2026"], ["Smooth", ""], ["The Velvet Room", ""], ["Soulful", ""], ["Motor City", ""], ["Get Down", ""], ["Love Jones", ""], ["Grooveline", ""]],
    reggae: [["Irie", ""], ["One Love", ""], ["Island Vibes", "Est. 2026"], ["Good Vibes Only", ""], ["Dub Room", ""], ["Sunsplash", ""], ["Rasta Rock", ""], ["Easy Skanking", ""], ["Jammin'", ""], ["Kingston", ""]],
    latin: [["Fiesta", ""], ["Salsa Room", "Est. 2026"], ["Mariachi", ""], ["La Casa", ""], ["Ritmo", ""], ["Baila!", ""], ["Sofia", "Salsa"], ["Cumbia Club", ""], ["Bachata Nights", ""], ["Musica", ""]],
    scifi: [["Mission Control", ""], ["Starbase", "Est. 2026"], ["Bridge Crew", ""], ["Space Cadet", ""], ["Launch Pad", ""], ["Galaxy Den", ""], ["Warp Zone", ""], ["Alien HQ", "Take Me"], ["Orbit", ""], ["Commander Max", ""]],
    sitcom: [["The Couch", "Reserved"], ["Laugh Track", ""], ["Family Room", "Est. 2026"], ["Must See TV", ""], ["Comedy Club", ""], ["Snack Bar", ""], ["Rerun Room", ""], ["Prime Time", ""], ["Studio Audience", ""], ["Couch Potato", ""]],
    crime: [["Detective", "Office"], ["Case Closed", ""], ["Crime Lab", "Est. 2026"], ["Whodunit", ""], ["Private Eye", ""], ["Evidence Room", ""], ["Cold Case", ""], ["Interrogation", "Room"], ["Sleuth", ""], ["Mystery Den", ""]],
    cartoons: [["Toon Town", ""], ["Saturday Morning", ""], ["Cartoon Club", "Est. 2026"], ["Funny Pages", ""], ["Kid Zone", ""], ["Animation Station", ""], ["Toon In", ""], ["Wacky World", ""], ["Doodle Den", ""], ["Ha Ha Hall", ""]],
    reality: [["Drama Zone", ""], ["Reality Check", ""], ["Confessional", "Room"], ["The Villa", ""], ["Final Rose", ""], ["Eliminated", ""], ["Tribal Council", ""], ["Glam Room", ""], ["Hot Takes", ""], ["Watch Party", ""]],
    westerns: [["Sheriff's Office", ""], ["Saloon", "Est. 1886"], ["Wild West", ""], ["Dodge City", ""], ["Outlaw Den", ""], ["Wanted", "Dad"], ["The Ranch", ""], ["High Noon", ""], ["Trail Boss", ""], ["Frontier", ""]],
    cooking: [["Chef's Table", ""], ["Bake Off", "Est. 2026"], ["Test Kitchen", ""], ["Food Fight", ""], ["Top Chef Mom", ""], ["Cooking Show", "Live"], ["Mise en Place", ""], ["Taste Test", ""], ["Kitchen Stadium", ""], ["Yes Chef", ""]],
    gameshow: [["Come On Down!", ""], ["Final Answer", ""], ["Bonus Round", ""], ["Trivia Night", "Est. 2026"], ["Grand Prize", ""], ["Spin to Win", ""], ["Buzz In", ""], ["Daily Double", ""], ["Champion", "Quiz Night"], ["Lightning Round", ""]],
    horror: [["Haunted", "Enter If You Dare"], ["Fright Night", ""], ["Creep Show", ""], ["Boo Crew", ""], ["The Crypt", ""], ["Scream Room", ""], ["Monster Den", ""], ["Graveyard Shift", ""], ["Zombie Zone", ""], ["Nightmare", "Hall"]],
    superhero: [["Hero HQ", ""], ["Secret Lair", ""], ["Super Leo", ""], ["Justice Room", "Est. 2026"], ["Power Up", ""], ["Hero Hall", ""], ["Comic Corner", ""], ["Save the Day", ""], ["Captain Mom", ""], ["League of Dads", ""]],
    fantasy: [["Dragon's Lair", ""], ["The Castle", "Est. 2026"], ["Wizard's Tower", ""], ["Quest Room", ""], ["The Realm", ""], ["Kingdom", ""], ["Enchanted", ""], ["Spellbook", ""], ["Knight's Hall", ""], ["Mage", "Do Not Disturb"]],
    anime: [["Otaku Den", ""], ["Kawaii", ""], ["Manga Room", "Est. 2026"], ["Senpai", ""], ["Cosplay Corner", ""], ["Arigato", ""], ["Power Level", ""], ["Sakura", ""], ["Anime Club", ""], ["Nakama", ""]],
    trucks: [["Truck Yeah", ""], ["Diesel Den", "Est. 2026"], ["Big Rig", ""], ["Haulin'", ""], ["Truck Stop", ""], ["Mud Season", ""], ["Tow Pro", ""], ["Lift Kit", ""], ["Work Truck", "Dad"], ["Country Roads", ""]],
    vans: [["Van Life", ""], ["Home Is Where", "We Park It"], ["Road Crew", ""], ["The Van", "Est. 2026"], ["Delivery", ""], ["Wander Wagon", ""], ["Basecamp", ""], ["Rollin' Home", ""], ["Shuttle", ""], ["Mystery Van", ""]],
    classics: [["Cruise Night", ""], ["Chrome & Steel", ""], ["Classic Garage", "Est. 1957"], ["Sock Hop", ""], ["Drive-In", ""], ["Vintage Rides", ""], ["Main Street", ""], ["Rockabilly", ""], ["Hot Rod Haven", ""], ["Car Show", ""]],
    muscle: [["V8 Power", ""], ["Muscle Garage", "Est. 1969"], ["Big Block", ""], ["Quarter Mile", ""], ["Burnout", ""], ["Pony Car", ""], ["Horsepower", ""], ["Street Machine", ""], ["Detroit Iron", ""], ["Drag Strip", ""]],
    racing: [["Pit Crew", ""], ["Victory Lane", ""], ["Race Day", "Est. 2026"], ["Pole Position", ""], ["Speed Shop", ""], ["Checkered Flag", ""], ["Green Flag", ""], ["Turbo", ""], ["Racer X", ""], ["Full Throttle", ""]],
    moto: [["Biker Bar", ""], ["Ride Free", ""], ["Chopper Shop", "Est. 2026"], ["Two Wheels", ""], ["Iron Horse", ""], ["Road King", ""], ["Throttle", ""], ["Moto Garage", ""], ["Easy Rider", ""], ["Live to Ride", ""]],
    offroad: [["Trail Rig", ""], ["Mud Life", ""], ["Overland", "Est. 2026"], ["Go Topless", ""], ["Rock Crawler", ""], ["Off the Grid", ""], ["Dirt Therapy", ""], ["4x4 Garage", ""], ["Trail Boss", ""], ["Lift & Go", ""]],
    farm: [["Family Farm", "Est. 1952"], ["Tractor Barn", ""], ["Grandpa's Farm", ""], ["Harvest", ""], ["Plow Pros", ""], ["Green Acres", ""], ["Farm Life", ""], ["Hay Day", ""], ["The Barn", ""], ["Country Living", ""]],
    shop: [["Dad's Garage", "Open 24/7"], ["Auto Repair", ""], ["The Shop", "Est. 2026"], ["Oil Change", ""], ["Speed & Custom", ""], ["Grease Monkey", ""], ["Wrench Works", ""], ["Service Bay", ""], ["Tire & Lube", ""], ["Motor Works", ""]],
    cars: EX.cars,
  });
  const PAINTS = ["cherry", "turquoise", "midnight", "seafoam", "sunburst", "jet", "tangerine", "pearl", "army", "skyblue", "plum", "forest", "creamsicle", "desert", "steel"];
  const BADGE_CYCLE = ["none", "wings", "oval", "initial", "star", "shield"];
  const examplesV5 = NP.examplesFor;
  NP.examplesFor = function (sp) {
    const list = examplesV5(sp);
    if (!sp.vehicles) return list;
    // garage subjects: most ideas are vehicle front ends with the name in the grille
    const vs = sp.vehicles;
    return list.map((ex, i) => {
      if (i >= 7 && sp.key !== "cars") return ex;
      const design = sp.key === "cars" ? vs[i % vs.length] : vs[i % vs.length];
      return Object.assign({}, ex, { design, palette: PAINTS[(i * 3 + sp.key.length) % PAINTS.length], icon: "none", items: [], badge: BADGE_CYCLE[i % BADGE_CYCLE.length] });
    });
  };
