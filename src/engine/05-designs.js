  /* ----------------------------------------------------------- designs */
  const BORDER_INSET = 2.4, BORDER_W = 2.2;
  // plate body height: explicit o.height (clamped to sensible proportions) or the style's own ratio
  const hgt = (o, def) => (o.height ? Math.round(Math.max(o.width * 0.16, Math.min(o.width * 0.95, o.height)) * 10) / 10 : Math.round(def));
  NP.hgt = hgt;
  function iconField(key, cx, cy, size) {
    if (key === "none") return S.EMPTY;
    const f = (I[key] || I.trophy)();
    const r = size / 2;
    return S.bounded(S.xf(f, cx, cy, r), cx - r * 1.25, cy - r * 1.25, cx + r * 1.25, cy + r * 1.25);
  }
  function borderOf(shape, o) { // band just inside the outline
    if (o && o.border === false) return S.EMPTY;
    return S.inter(S.offset(shape, -BORDER_INSET), (x, y) => -(shape(x, y) + BORDER_INSET + BORDER_W));
  }
  const iconOr = (o, fallback = "star") => (o.icon === "none" ? fallback : o.icon);
  function shiftGroups(t, dy) {
    return Object.assign({}, t, { groups: mapGroups(t.groups, (p) => [p[0], Math.round((p[1] + dy) * 1000) / 1000]) });
  }
  // name with an optional smaller second line underneath, centred as a block in box
  function stackText(o, font, box, opts = {}) {
    const sub = (o.sub || "").trim();
    if (!sub) return [fitText(o.text, font, box, opts)];
    const name = fitText(o.text, font, { cx: box.cx, cy: 0, w: box.w, h: box.h * 0.64 }, opts);
    const second = fitText(sub, o.subFont || font, { cx: box.cx, cy: 0, w: box.w * 0.92, h: Math.min(box.h * 0.26, Math.max(name.h, 1) * 0.5) }, { track: 0.1 });
    const gap = Math.max(1.6, box.h * 0.07);
    const total = name.h + gap + second.h;
    return [shiftGroups(name, box.cy + total / 2 - name.h / 2), shiftGroups(second, box.cy - total / 2 + second.h / 2)];
  }
  function roundedRectDots(hw, hh, rr, step, r) {
    const sx = 2 * (hw - rr), sy = 2 * (hh - rr), arc = (Math.PI * rr) / 2;
    const L = 2 * sx + 2 * sy + 4 * arc, n = Math.max(4, Math.round(L / step));
    const segs = [
      [sx, (t) => [-hw + rr + t, hh]], [arc, (t) => { const a = Math.PI / 2 - t / rr; return [hw - rr + rr * Math.cos(a), hh - rr + rr * Math.sin(a)]; }],
      [sy, (t) => [hw, hh - rr - t]], [arc, (t) => { const a = -t / rr; return [hw - rr + rr * Math.cos(a), -hh + rr + rr * Math.sin(a)]; }],
      [sx, (t) => [hw - rr - t, -hh]], [arc, (t) => { const a = -Math.PI / 2 - t / rr; return [-hw + rr + rr * Math.cos(a), -hh + rr + rr * Math.sin(a)]; }],
      [sy, (t) => [-hw, -hh + rr + t]], [arc, (t) => { const a = Math.PI - t / rr; return [-hw + rr + rr * Math.cos(a), hh - rr + rr * Math.sin(a)]; }],
    ];
    const dots = [];
    for (let k = 0; k < n; k++) {
      let s = (k * L) / n;
      for (const [len, fn] of segs) { if (s <= len) { const [x, y] = fn(s); dots.push(S.circle(x, y, r)); break; } s -= len; }
    }
    return S.union(...dots);
  }

  const DESIGNS = {};
  DESIGNS.classic = {
    label: "Classic", font: "block", note: "Desk or door",
    make(o) {
      const W = o.width, H = hgt(o, W * (o.sub ? 0.34 : 0.31)), r = 6;
      const shape = S.box(0, 0, W / 2, H / 2, r);
      const inner = BORDER_INSET + BORDER_W + 3.5;
      const iconSize = H - 2 * inner;
      const hasIcon = o.icon !== "none";
      const icx = -W / 2 + inner + iconSize / 2;
      const tx0 = hasIcon ? icx + iconSize / 2 + 5 : -W / 2 + inner, tx1 = W / 2 - inner;
      const text = stackText(o, o.font || "block", { cx: (tx0 + tx1) / 2, cy: 0, w: tx1 - tx0, h: H * (o.sub ? 0.62 : 0.42) });
      const raised = S.union(borderOf(shape, o), iconField(o.icon, icx, 0, iconSize));
      return { shape, raised, text, bbox: [-W / 2, -H / 2, W / 2, H / 2] };
    },
  };
  DESIGNS.pennant = {
    label: "Pennant", font: "varsity", note: "Wall",
    make(o) {
      const font = o.font || "varsity";
      const W = o.width, H = hgt(o, W * 0.42), r = 3, tip = 5;
      const pts = [[-W / 2 + r, H / 2 - r], [W / 2 - r, tip - r * 0.3], [W / 2 - r, -tip + r * 0.3], [-W / 2 + r, -H / 2 + r]];
      const shape = S.memo(S.offset(S.poly(pts), r));
      const half = (x) => H / 2 + (x + W / 2) * ((tip - H / 2) / W);
      const inner = BORDER_INSET + BORDER_W + 3;
      const band = 9;
      const bandF = S.inter(S.box(-W / 2 + inner - 3 + band / 2, 0, band / 2, H / 2), S.offset(shape, -(BORDER_INSET + BORDER_W) + 0.01));
      const iconSize = Math.min(H - 2 * inner - 6, W * 0.24);
      const icx = -W / 2 + inner + band + 3 + iconSize / 2;
      const tx0 = icx + iconSize / 2 + 5;
      const t = textGroups(o.text, font, 0.05);
      const bw = t.bbox[2] - t.bbox[0], bh = t.bbox[3] - t.bbox[1];
      let lo = 0, hi = 1;
      for (let k = 0; k < 40; k++) {
        const s = (lo + hi) / 2, xr = tx0 + bw * s;
        const ok = xr < W / 2 - 14 && (bh * s) / 2 < half(xr) - inner - 1.2 && bh * s < H * 0.34;
        if (ok) lo = s; else hi = s;
      }
      const s = lo, cx = tx0 + (bw * s) / 2;
      const text = [fitText(o.text, font, { cx, cy: 0, w: bw * s, h: bh * s })];
      const raised = S.union(borderOf(shape, o), bandF, iconField(iconOr(o), icx, 0, iconSize));
      return { shape, raised, text, bbox: [-W / 2, -H / 2, W / 2, H / 2] };
    },
  };
  DESIGNS.badge = {
    label: "Badge", font: "sport", note: "Locker or shelf",
    make(o) {
      const W = o.width, H = hgt(o, W * (o.sub ? 0.33 : 0.28)), R = Math.round(Math.min(W * 0.15, H * 0.7));
      const cy = H / 2 + R * 0.3;
      const shape = S.memo(S.union(S.box(0, 0, W / 2, H / 2, 5), S.circle(0, cy, R)));
      const inner = BORDER_INSET + BORDER_W + 3;
      const iconSize = 2 * (R - inner) - 1;
      const textTop = cy - R - 3, textBot = -H / 2 + inner;
      const starX = W / 2 - inner - 5, my = (textTop + textBot) / 2;
      const stars = S.union(S.star(-starX, my, 4.6, 2), S.star(starX, my, 4.6, 2));
      const text = stackText(o, o.font || "sport", { cx: 0, cy: my, w: 2 * (starX - 8), h: Math.min(textTop - textBot, H * (o.sub ? 0.56 : 0.4)) });
      const raised = S.union(borderOf(shape, o), iconField(iconOr(o), 0, cy, iconSize), stars);
      return { shape, raised, text, bbox: [-W / 2, -H / 2, W / 2, cy + R] };
    },
  };
  DESIGNS.jersey = {
    label: "Jersey", font: "block", note: "Shelf or bedroom",
    make(o) {
      const font = o.font || "block";
      const s = o.width * 0.4;
      const u = [[-0.3, 0.98], [-0.62, 0.92], [-1.0, 0.6], [-0.8, 0.28], [-0.62, 0.4], [-0.62, -0.98],
        [0.62, -0.98], [0.62, 0.4], [0.8, 0.28], [1.0, 0.6], [0.62, 0.92], [0.3, 0.98], [0, 0.74]];
      const shape = S.memo(S.offset(S.poly(u.map(([x, y]) => [x * s, y * s])), 1.5));
      const collar = S.union(S.seg(-0.3 * s, 0.98 * s, 0, 0.74 * s, 7), S.seg(0, 0.74 * s, 0.3 * s, 0.98 * s, 7));
      const sleeve = (m) => S.seg(m * 0.89 * s, 0.69 * s, m * 0.69 * s, 0.37 * s, 3.4);
      const stripes = S.inter(S.union(sleeve(1), sleeve(-1)), S.offset(shape, -(BORDER_INSET + BORDER_W) - 2.4));
      const parts = [borderOf(shape, o), S.inter(collar, shape), stripes];
      const text = [fitText(o.text, font, { cx: 0, cy: 0.5 * s, w: 1.0 * s, h: 0.17 * s })];
      if (o.number) text.push(fitText(o.number, font, { cx: 0, cy: -0.28 * s, w: 0.95 * s, h: 0.78 * s }, { track: 0.02 }));
      else parts.push(iconField(iconOr(o), 0, -0.28 * s, 0.86 * s));
      return { shape, raised: S.union(...parts), text, bbox: [-s - 2, -s - 2, s + 2, s + 2] };
    },
  };
  DESIGNS.ticket = {
    label: "Ticket", font: "block", note: "Movie or concert",
    make(o) {
      const W = o.width, H = hgt(o, W * 0.4), r = 4, notch = H * 0.13;
      const shape = S.memo(S.sub(S.box(0, 0, W / 2, H / 2, r), S.circle(-W / 2, 0, notch), S.circle(W / 2, 0, notch)));
      const inner = BORDER_INSET + BORDER_W + 3;
      const stubX = -W / 2 + H * 0.95;
      const dots = [];
      const top = H / 2 - BORDER_INSET - BORDER_W - 3;
      for (let y = -top; y <= top + 0.01; y += (2 * top) / Math.max(1, Math.round((2 * top) / 3.6))) dots.push(S.circle(stubX, y, 0.95));
      const ix0 = -W / 2 + notch + BORDER_INSET + BORDER_W + 2.5, ix1 = stubX - 4;
      const iconSize = Math.min(ix1 - ix0, H - 2 * inner);
      const tx0 = stubX + 5, tx1 = W / 2 - notch - BORDER_INSET - BORDER_W - 3;
      const text = stackText(o, o.font || "block", { cx: (tx0 + tx1) / 2, cy: 0, w: tx1 - tx0, h: H * (o.sub ? 0.6 : 0.4) });
      const raised = S.union(borderOf(shape, o), S.union(...dots), iconField(iconOr(o), (ix0 + ix1) / 2, 0, iconSize));
      return { shape, raised, text, bbox: [-W / 2, -H / 2, W / 2, H / 2] };
    },
  };
  DESIGNS.marquee = {
    label: "Marquee", font: "varsity", note: "Theater or den",
    make(o) {
      const W = o.width, H = hgt(o, W * (o.sub ? 0.4 : 0.36)), rr = 8;
      const shape = S.box(0, 0, W / 2, H / 2, rr);
      const bulbs = roundedRectDots(W / 2 - 5.2, H / 2 - 5.2, rr - 4, 6.2, 1.55);
      const frame = o.border === false ? S.EMPTY : S.shell(S.box(0, 0, W / 2 - 9.6, H / 2 - 9.6, rr - 6), 1.5);
      const inner = 9.6 + 0.75 + 3.2;
      const hasIcon = o.icon !== "none";
      const iconSize = H - 2 * inner;
      const icx = -W / 2 + inner + iconSize / 2;
      const tx0 = hasIcon ? icx + iconSize / 2 + 5 : -W / 2 + inner, tx1 = W / 2 - inner;
      const text = stackText(o, o.font || "varsity", { cx: (tx0 + tx1) / 2, cy: 0, w: tx1 - tx0, h: H * (o.sub ? 0.5 : 0.36) });
      return { shape, raised: S.union(bulbs, frame, iconField(o.icon, icx, 0, iconSize)), text, bbox: [-W / 2, -H / 2, W / 2, H / 2] };
    },
  };
  DESIGNS.license = {
    label: "License Plate", font: "block", note: "Garage wall",
    make(o) {
      const W = o.width, H = hgt(o, W / 2), r = 7;
      const shape = S.box(0, 0, W / 2, H / 2, r);
      const hx = W * 0.29, hy = H / 2 - 8.5;
      const slots = S.union(...[[-hx, hy], [hx, hy], [-hx, -hy], [hx, -hy]].map(([x, y]) => S.seg(x - 2.2, y, x + 2.2, y, 4.4)));
      const base = S.sub(shape, slots);
      const inner = BORDER_INSET + BORDER_W + 3;
      const parts = [S.sub(borderOf(shape, o), S.offset(slots, 1.6))];
      const text = [];
      const sub = (o.sub || "").trim();
      if (sub) text.push(fitText(sub, o.font || "block", { cx: 0, cy: hy, w: 2 * hx - 24, h: H * 0.12 }, { track: 0.12 }));
      const bandTop = hy - 5.5, bandBot = -hy + 5.5;
      const hasIcon = o.icon !== "none";
      const iconSize = Math.min(bandTop - bandBot, W * 0.22);
      const icx = -W / 2 + inner + iconSize / 2 + 1;
      const tx0 = hasIcon ? icx + iconSize / 2 + 4 : -W / 2 + inner, tx1 = W / 2 - inner;
      text.push(fitText(o.text, o.font || "block", { cx: (tx0 + tx1) / 2, cy: (bandTop + bandBot) / 2, w: tx1 - tx0, h: (bandTop - bandBot) * 0.82 }, { track: 0.04 }));
      parts.push(iconField(o.icon, icx, (bandTop + bandBot) / 2, iconSize));
      return { shape, base, raised: S.union(...parts), text, bbox: [-W / 2, -H / 2, W / 2, H / 2] };
    },
  };
  NP.DESIGNS = DESIGNS;
  NP.FONT_LABELS = { block: "Block", sport: "Italic", varsity: "Varsity" };

