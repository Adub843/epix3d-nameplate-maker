  /* =================================================================
     v21: optional backplate under any design. Rounded rectangle, oval or follow-the-outline; sized
     automatically (padding round the design) or to an exact width x height with the design scaled inside;
     its own thickness, corner radius, colour (any of the design's colour slots) and hanging holes.
     The whole design sits on top of the plate, so the plate is printed first, face up.
     ================================================================= */
  NP.BACKPLATE_SHAPES = { rect: "Rounded rectangle", oval: "Oval", outline: "Follow the outline" };
  NP.BACKPLATE_HOLES = { none: "None", keyhole: "Keyholes (back)", screw: "Screw holes" };
  const clampN = (v, a, b, d) => { v = +v; return Number.isFinite(v) ? Math.max(a, Math.min(b, v)) : d; };
  NP.backplateDefaults = () => ({ on: false, shape: "rect", pad: 8, w: 0, h: 0, scale: 100, thick: 3, radius: 8, slot: "base", holes: "none" });
  function partsBox(m) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of m.parts) for (const s of p.slices) for (const g of s.groups) for (const q of g.outer) {
      if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }
    return x0 < x1 ? [x0, y0, x1, y1] : [-50, -20, 50, 20];
  }
  // footprint of the design: everything printed on the bed (slices starting at z = 0)
  function footprintField(m) {
    const gs = []; for (const p of m.parts) for (const s of p.slices) if (s.z0 < 0.01) gs.push(...s.groups);
    return gs.length ? textField(gs, 80) : () => 80;
  }
  // fit the design inside a fixed plate: returns the factor to scale the design by
  function fitFactor(bp, dw, dh) {
    const W = bp.w > 0 ? bp.w : 0, H = bp.h > 0 ? bp.h : 0, pad = bp.pad;
    if (bp.shape === "oval") {
      const A = W ? W / 2 - pad : 0, B = H ? H / 2 - pad : 0, a = dw / 2, b = dh / 2;
      if (A > 0 && B > 0) return 1 / Math.sqrt((a / A) ** 2 + (b / B) ** 2);
      if (A > 0) return A / (Math.SQRT2 * a);
      if (B > 0) return B / (Math.SQRT2 * b);
      return 1;
    }
    const fx = W ? (W - 2 * pad) / dw : Infinity, fy = H ? (H - 2 * pad) / dh : Infinity, f = Math.min(fx, fy);
    return Number.isFinite(f) && f > 0 ? f : 1;
  }
  const buildV20 = NP.build;
  NP.build = function (o) {
    o = o || {};
    const raw = o.backplate;
    if (!raw || !raw.on) return buildV20(o);
    const bp = Object.assign(NP.backplateDefaults(), raw);
    bp.shape = NP.BACKPLATE_SHAPES[bp.shape] ? bp.shape : "rect";
    bp.holes = NP.BACKPLATE_HOLES[bp.holes] ? bp.holes : "none";
    bp.pad = clampN(bp.pad, 0, 80, 8); bp.scale = clampN(bp.scale, 20, 100, 100); bp.radius = clampN(bp.radius, 0, 60, 8);
    bp.thick = clampN(bp.thick, 1.2, 12, 3); if (bp.holes === "keyhole") bp.thick = Math.max(bp.thick, 3.2);
    bp.w = clampN(bp.w, 0, 600, 0); bp.h = clampN(bp.h, 0, 600, 0);
    const o1 = Object.assign({}, o); delete o1.backplate;
    let m = buildV20(o1), box = partsBox(m);
    const fixed = bp.shape !== "outline" && (bp.w > 0 || bp.h > 0);
    // fixed plate: design fills `scale` % of the room inside the padding. Auto plate: `scale` just shrinks the design.
    let k = (fixed ? fitFactor(bp, box[2] - box[0], box[3] - box[1]) : 1) * bp.scale / 100;
    if (Math.abs(k - 1) > 0.004) {
      const w0 = +o.width || 180;
      m = buildV20(Object.assign({}, o1, { width: Math.max(30, w0 * k) }));
      box = partsBox(m);
    }
    const t = bp.thick, cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2, dw = box[2] - box[0], dh = box[3] - box[1];
    let plate, hw, hh;
    if (bp.shape === "outline") {
      const fp = S.memo(footprintField(m)); plate = S.offset(fp, Math.max(1.5, bp.pad));
      hw = dw / 2 + bp.pad; hh = dh / 2 + bp.pad;
    } else if (bp.shape === "oval") {
      hw = bp.w > 0 ? bp.w / 2 : Math.SQRT2 * dw / 2 + bp.pad; hh = bp.h > 0 ? bp.h / 2 : Math.SQRT2 * dh / 2 + bp.pad;
      plate = S.ellipse(cx, cy, hw, hh);
    } else {
      hw = bp.w > 0 ? bp.w / 2 : dw / 2 + bp.pad; hh = bp.h > 0 ? bp.h / 2 : dh / 2 + bp.pad;
      plate = S.box(cx, cy, hw, hh, Math.min(bp.radius, hw - 0.5, hh - 0.5));
    }
    // backlit designs: open the plate under the light panel and give the wire lead a channel out the bottom
    const L = m.meta && m.meta.backlight; let lightCut = null, chan = null;
    if (L) {
      const pg = []; for (const p of m.parts) if (p.slot === "panel") for (const s of p.slices) if (s.z0 < 0.01) pg.push(...s.groups);
      const pb = groupsBBox(pg);
      if (pb) lightCut = S.box((pb[0] + pb[2]) / 2, (pb[1] + pb[3]) / 2, (pb[2] - pb[0]) / 2 + 1, (pb[3] - pb[1]) / 2 + 1, 2);
      const ex = L.exit || [cx, cy]; chan = S.seg(ex[0], ex[1], ex[0], cy - hh - 20, (L.grooveW || 3.2) + 0.4);
    }
    // hanging hardware
    const holes = [], notes = [];
    if (bp.holes === "screw") {
      const fp = S.memo(footprintField(m)), r = 2.2;
      const spots = bp.shape === "outline" ? [] : [[cx - hw + Math.max(6, bp.pad / 2), cy], [cx + hw - Math.max(6, bp.pad / 2), cy]];
      for (const [x, y] of spots) if (fp(x, y) > r + 2.5 && plate(x, y) < -(r + 2.5)) holes.push({ x, y });
      if (holes.length < 2) notes.push("Not enough clear plate beside the design for screw holes: widen the plate or add padding.");
    }
    let bands;
    if (bp.holes === "keyhole") {
      const ky = cy + hh * 0.45, kx = Math.min(hw * 0.55, dw * 0.35), pts = [[cx - kx, ky], [cx + kx, ky]].filter(([x, y]) => plate(x, y) < -8);
      const head = (w) => S.union(...pts.map(([x, y]) => S.union(S.circle(x, y - 4, 4.6), S.seg(x, y - 4, x, y + 4, w))));
      if (pts.length) bands = [{ z0: 0, z1: 1.4, f: S.sub(plate, head(4.6)) }, { z0: 1.4, z1: t - 0.9, f: S.sub(plate, head(9.6)) }, { z0: t - 0.9, z1: t, f: plate }];
      else notes.push("The plate is too small for keyholes.");
    }
    if (!bands) {
      const cut = holes.length ? S.union(...holes.map((h) => S.circle(h.x, h.y, 2.2))) : null;
      const top = holes.length ? S.union(...holes.map((h) => S.circle(h.x, h.y, 4.3))) : null; // countersink pocket for the screw head
      bands = holes.length ? [{ z0: 0, z1: Math.max(0.6, t - 1.6), f: S.sub(plate, cut) }, { z0: Math.max(0.6, t - 1.6), z1: t, f: S.sub(plate, top) }] : [{ z0: 0, z1: t, f: plate }];
    }
    if (lightCut) for (const b of bands) { b.f = S.sub(b.f, lightCut); if (b.z1 > t - (L.grooveD || 3) - 0.01) b.f = S.sub(b.f, chan); }
    const PB = [cx - hw - 6, cy - hh - 6, cx + hw + 6, cy + hh + 6];
    const slices = bands.map((b) => ({ groups: fieldGroups(S.memo(b.f), PB, Math.max(0.25, m.opts.h || 0.25)), z0: b.z0, z1: b.z1, noBevel: true })).filter((s) => s.groups.length);
    for (const p of m.parts) for (const s of p.slices) { s.z0 += t; s.z1 += t; }
    const slot = m.parts.some((p) => p.slot === bp.slot) || NP.SLOTS[bp.slot] ? bp.slot : "base";
    let part = m.parts.find((p) => p.slot === slot);
    if (!part) { part = { slot, label: (m.labels && m.labels[slot]) || NP.SLOTS[slot] || slot, slices: [] }; m.parts.unshift(part); }
    part.slices.unshift(...slices);
    m.bbox = [Math.min(m.bbox[0], PB[0] + 2), Math.min(m.bbox[1], PB[1] + 2), Math.max(m.bbox[2], PB[2] - 2), Math.max(m.bbox[3], PB[3] - 2)];
    m.meta = Object.assign({}, m.meta, { backplate: { shape: bp.shape, w: Math.round(hw * 2), h: Math.round(hh * 2), thick: t, slot, holes: bp.holes, holesPlaced: bp.holes === "screw" ? holes.length : bp.holes === "keyhole" ? (bands.length === 3 ? 2 : 0) : 0, designScale: +k.toFixed(3), designW: Math.round(dw), designH: Math.round(dh), notes } });
    m.opts = Object.assign({}, m.opts, { backplate: bp });
    return m;
  };

  /* README: backplate section */
  const readmeV20 = NP.readme;
  NP.readme = function (m, colors, info) {
    let txt = readmeV20(m, colors, info);
    const B = m.meta && m.meta.backplate; if (!B) return txt;
    const sec = [
      "BACKPLATE",
      `  ${NP.BACKPLATE_SHAPES[B.shape]}, ${B.w} x ${B.h} mm, ${B.thick.toFixed(1)} mm thick, printed in the ${(NP.SLOTS[B.slot] || B.slot).toLowerCase()} colour. The design (${B.designW} x ${B.designH} mm) sits on top.`,
      B.holes === "keyhole" && B.holesPlaced ? "  Two keyhole slots in the back: hang on screws with heads up to 9 mm, shank up to 4.5 mm, sticking out about 3 mm." : "",
      B.holes === "screw" && B.holesPlaced ? `  ${B.holesPlaced} countersunk screw holes for #6 / 3.5 mm screws.` : "",
      ...B.notes.map((n) => "  Note: " + n),
      m.meta.backlight ? "  The plate is open behind the light panel and has a channel for the wire lead, so the EL wire still fits from the back." : "",
    ].filter(Boolean).join("\r\n");
    const at = txt.lastIndexOf("Made with Nameplate Maker");
    return at >= 0 ? txt.slice(0, at) + sec + "\r\n\r\n" + txt.slice(at) : txt + "\r\n" + sec + "\r\n";
  };
  /* v22: subjects for the Kittl templates that had none: careers, kids' themes, places */
  (() => {
    const add = (sp) => { if (SUBJECTS.some((s) => s.key === sp.key)) return; sp.designs = sp.designs || ["classic", "badge", "crest"]; sp.palette = sp.palette || "pop"; const p = PALETTES[sp.palette] || PALETTES.pop; sp.base = p.base; sp.raised = p.accent; SUBJECTS.push(sp); };
    add({ key: "doctor", group: "Careers", label: "Doctor", words: ["doctor", "physician", "medical", "medicine", "clinic", "md", "dr", "surgeon", "pediatrician"], icons: ["heart", "star"], palette: "ice" });
    add({ key: "nurse", group: "Careers", label: "Nurse", words: ["nurse", "nursing", "rn", "lpn", "np", "er", "icu", "hospital"], icons: ["heart", "star"], palette: "ice" });
    add({ key: "eyecare", group: "Careers", label: "Eye Care", words: ["optometrist", "optometry", "eye doctor", "eye care", "optician", "ophthalmologist", "eyes"], icons: ["glasses", "magnifier"], palette: "ice" });
    add({ key: "teacher", group: "Careers", label: "Teacher", words: ["teacher", "teaching", "classroom", "school", "professor", "principal", "mrs", "ms", "mr"], icons: ["book", "star"], palette: "dugout" });
    add({ key: "space", group: "Kids", label: "Space", words: ["space", "rocket", "astronaut", "planet", "galaxy", "nasa"], icons: ["rocket", "planet"], palette: "neon" });
    add({ key: "dinos", group: "Kids", label: "Dinosaurs", words: ["dinosaur", "dino", "t-rex", "trex", "jurassic"], icons: ["star", "sprout"], palette: "citrus" });
    add({ key: "unicorns", group: "Kids", label: "Unicorns", words: ["unicorn", "rainbow", "magical", "princess"], icons: ["star", "sparkle"], palette: "neon" });
    add({ key: "charleston", group: "Places", label: "Charleston", words: ["charleston", "holy city", "rainbow row", "lowcountry", "south carolina", "folly beach", "mount pleasant"], icons: ["palm", "sun"], palette: "beach" });
  })();
  // every subject's top-level category (the shelf's tabs)
  NP.CATEGORIES = [
    { key: "sports", label: "Sports", groups: ["Sports"] },
    { key: "outdoors", label: "Outdoors", groups: ["Outdoors"] },
    { key: "cars", label: "Cars & Garage", groups: ["Cars"] },
    { key: "music", label: "Music", groups: ["Music"] },
    { key: "screen", label: "Movies & TV", groups: ["Movies", "TV"] },
    { key: "drinks", label: "Drinks", groups: ["Drinks"] },
    { key: "home", label: "Home & Hobbies", groups: ["Home & Hobbies"] },
    { key: "careers", label: "Careers", groups: ["Careers"] },
    { key: "kids", label: "Kids", groups: ["Kids"] },
    { key: "places", label: "Places", groups: ["Places"] },
  ];
  NP.categoryOf = (sp) => (NP.CATEGORIES.find((c) => c.groups.includes(sp && sp.group)) || NP.CATEGORIES[0]).key;
