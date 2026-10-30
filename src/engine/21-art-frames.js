  /* =================================================================
     v19: art frames. Frame artwork designed in Kittl, flattened to 4 Polymaker colours and stored as a
     run-length colour map. Each colour becomes its own relief layer; the name goes in the blank panel.
     ================================================================= */
  const ART = NP.ART = NP.ART || {};
  NP.registerArt = (key, a) => { ART[key] = a; };
  // signed distance (pixels) to a mask, via two exact Euclidean distance transforms, then lightly smoothed
  function edt1(f, n, d, v, z) {
    let k = 0; v[0] = 0; z[0] = -1e20; z[1] = 1e20;
    for (let q = 1; q < n; q++) {
      let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = 1e20;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
  }
  function edt(mask, w, h, want) {
    const INF = 1e12, g = new Float32Array(w * h), n = Math.max(w, h);
    const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1); // g is float32: squared distances stay exact well past 4000 px
    for (let i = 0; i < w * h; i++) g[i] = mask[i] === want ? 0 : INF;
    for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = g[y * w + x]; edt1(f, h, d, v, z); for (let y = 0; y < h; y++) g[y * w + x] = d[y]; }
    for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = g[y * w + x]; edt1(f, w, d, v, z); for (let x = 0; x < w; x++) g[y * w + x] = d[x]; }
    return g;
  }
  function signedField(mask, w, h) {
    const out = edt(mask, w, h, 1), inn = edt(mask, w, h, 0), sd = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) sd[i] = mask[i] ? 0.5 - Math.sqrt(inn[i]) : Math.sqrt(out[i]) - 0.5;
    const t = new Float32Array(w * h); // 3x3 box blur smooths the pixel stair-steps
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0, c = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const xx = x + i, yy = y + j; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; s += sd[yy * w + xx]; c++; }
      t[y * w + x] = s / c; }
    return t;
  }
  const recentArt = []; // decoded maps and distance fields are big: keep only the last few templates in memory
  function decodeArt(a) {
    const r = recentArt.indexOf(a); if (r >= 0) recentArt.splice(r, 1); recentArt.unshift(a);
    while (recentArt.length > 3) { const old = recentArt.pop(); delete old._idx; delete old._panel; delete old._sd; delete old._box; }
    if (a._idx) return a;
    const w0 = a._w0 || (a._w0 = a.w), rows = a.rle.split("|"), h0 = rows.length, idx = new Uint8Array(w0 * h0);
    rows.forEach((r, y) => { let x = 0; for (const tok of r.split(",")) { const c = +tok[0], n = tok.length > 1 ? parseInt(tok.slice(1), 36) : 1; idx.fill(c, y * w0 + x, y * w0 + x + n); x += n; } });
    if (a.raw) { a.w = w0; return finishArt(a, idx, w0, h0); }
    const up = upRefine(idx, w0, h0); a.w = up.w; return finishArt(a, up.idx, up.w, up.h);
  }
  // smooth 2x upscale of a colour-index map: each colour's mask is upsampled bilinearly and blurred, then each
  // pixel takes the strongest colour, so pixel stair-steps become clean curves (the same idea as tools/refine_art.py)
  function upRefine(idx, w, h, ncls = 5) {
    const W = w * 2, H = h * 2, best = new Float32Array(W * H).fill(-1), out = new Uint8Array(W * H), m = new Float32Array(W * H), t = new Float32Array(W * H);
    const blur = (src, dst, r) => { // separable box blur, run twice ~ gaussian
      for (let y = 0; y < H; y++) { let s = 0; const o = y * W; for (let x = -r; x <= r; x++) s += src[o + Math.min(W - 1, Math.max(0, x))];
        for (let x = 0; x < W; x++) { dst[o + x] = s / (2 * r + 1); s += src[o + Math.min(W - 1, x + r + 1)] - src[o + Math.max(0, x - r)]; } }
      for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y <= r; y++) s += dst[Math.min(H - 1, Math.max(0, y)) * W + x];
        for (let y = 0; y < H; y++) { src[y * W + x] = s / (2 * r + 1); s += dst[Math.min(H - 1, y + r + 1) * W + x] - dst[Math.max(0, y - r) * W + x]; } }
    };
    for (let c = 0; c < ncls; c++) {
      let any = false;
      for (let Y = 0; Y < H; Y++) { const fy = Math.min(h - 1.001, Math.max(0, (Y + 0.5) / 2 - 0.5)), y0 = fy | 0, ty = fy - y0;
        for (let X = 0; X < W; X++) { const fx = Math.min(w - 1.001, Math.max(0, (X + 0.5) / 2 - 0.5)), x0 = fx | 0, tx = fx - x0, o = y0 * w + x0;
          const v = ((idx[o] === c) * (1 - tx) + (idx[o + 1] === c) * tx) * (1 - ty) + ((idx[o + w] === c) * (1 - tx) + (idx[o + w + 1] === c) * tx) * ty;
          m[Y * W + X] = v; if (v) any = true; } }
      if (!any) continue;
      blur(m, t, 2); blur(m, t, 2);
      for (let i = 0; i < W * H; i++) if (m[i] > best[i]) { best[i] = m[i]; out[i] = c; }
    }
    return { idx: out, w: W, h: H };
  }
  function finishArt(a, idx, w, h) {
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (idx[y * w + x] !== a.bg) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    a._idx = idx; a.h = h; a._box = [x0, y0, x1 + 1, y1 + 1]; a._sd = {};
    // the name panel: the largest connected region of the panel colour
    const pc = +Object.keys(a.roles).find((c) => a.roles[c] === "panel"), lab = new Int32Array(w * h).fill(-1);
    let best = -1, bestN = 0, id = 0;
    for (let s = 0; s < w * h; s++) {
      if (idx[s] !== pc || lab[s] >= 0) continue;
      const st = [s]; lab[s] = id; let n = 0;
      while (st.length) { const p = st.pop(); n++; const px = p % w, py = (p - px) / w;
        for (const q of [px > 0 ? p - 1 : -1, px < w - 1 ? p + 1 : -1, py > 0 ? p - w : -1, py < h - 1 ? p + w : -1]) if (q >= 0 && lab[q] < 0 && idx[q] === pc) { lab[q] = id; st.push(q); } }
      if (n > bestN) { bestN = n; best = id; } id++;
    }
    a._panel = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) a._panel[i] = lab[i] === best ? 1 : 0;
    return a;
  }
  function artField(a, key, maskOf, s) {
    if (!a._sd[key]) { const m = new Uint8Array(a.w * a.h); for (let i = 0; i < m.length; i++) m[i] = maskOf(i) ? 1 : 0; a._sd[key] = signedField(m, a.w, a.h); }
    const sd = a._sd[key], w = a.w, h = a.h, cx = (a._box[0] + a._box[2]) / 2, cy = (a._box[1] + a._box[3]) / 2;
    return (x, y) => {
      const px = x / s + cx - 0.5, py = -y / s + cy - 0.5;
      if (px < 0 || py < 0 || px > w - 1.001 || py > h - 1.001) return 50;
      const i = Math.floor(px), j = Math.floor(py), fx = px - i, fy = py - j, o = j * w + i;
      return ((sd[o] * (1 - fx) + sd[o + 1] * fx) * (1 - fy) + (sd[o + w] * (1 - fx) + sd[o + w + 1] * fx) * fy) * s;
    };
  }
  const artMake = (key) => (o) => {
    const a = decodeArt(ART[key]), k = o.k, lit = !!o.backlit, wd = Math.max(1.5, Math.min(4, +o.wireD || 2.6)), gw = wd + 0.6, gd = wd + 0.4, dt = 1.2;
    const tops = a.tops || { panel: 0.25, accent: 0.8, bold: 1.1 }, T = lit ? Math.max(o.base, gd + dt - tops.panel * k + 0.2) : o.base;
    const W = o.width, s = W / (a._box[2] - a._box[0]);
    const Hh = (a._box[3] - a._box[1]) * s / 2, X = W / 2, idx = a._idx, role = (i) => a.roles[idx[i]];
    const shape = S.memo(artField(a, "shape", (i) => idx[i] !== a.bg, s));
    const fOf = (r) => S.memo(S.inter(artField(a, r, (i) => role(i) === r, s), S.offset(shape, -0.2)));
    const panelF = S.memo(artField(a, "namepanel", (i) => a._panel[i], s));
    let comps, lightMeta = null;
    if (!lit) comps = [{ slot: "base", f: shape, z0: 0, z1: T }];
    else {
      // EL wire: a serpentine groove in the back of the name panel, the panel printed solid white over it
      let px0 = Infinity, px1 = -Infinity, py0 = Infinity, py1 = -Infinity;
      for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) if (a._panel[y * a.w + x]) { const X1 = (x + 0.5 - (a._box[0] + a._box[2]) / 2) * s, Y1 = -(y + 0.5 - (a._box[1] + a._box[3]) / 2) * s; if (X1 < px0) px0 = X1; if (X1 > px1) px1 = X1; if (Y1 < py0) py0 = Y1; if (Y1 > py1) py1 = Y1; }
      const clear = gw / 2 + 1.8, pitch = gw + 2.4, rows = [], inner = (x, y) => panelF(x, y) < -clear;
      const nRows = Math.max(1, Math.floor((py1 - py0 - 2 * clear - 1) / pitch) + 1), ymid = (py0 + py1) / 2;
      for (let i = 0; i < nRows; i++) { const y = ymid + ((nRows - 1) / 2 - i) * pitch; let x0 = null, x1 = null;
        for (let x = px0 - 2; x <= px1 + 2; x += 0.5) if (inner(x, y)) { if (x0 === null) x0 = x; x1 = x; }
        if (x0 !== null && x1 - x0 > 10) rows.push({ y, x0, x1 }); }
      const segs = []; let len = 0, end = null;
      rows.forEach((r, i) => { const p0 = i % 2 ? r.x1 : r.x0, p1 = i % 2 ? r.x0 : r.x1;
        segs.push(S.seg(p0, r.y, p1, r.y, gw)); len += Math.abs(p1 - p0);
        if (i < rows.length - 1) { const nx = i % 2 ? Math.max(r.x0, rows[i + 1].x0) : Math.min(r.x1, rows[i + 1].x1); segs.push(S.seg(nx, r.y, nx, rows[i + 1].y, gw)); len += Math.abs(r.y - rows[i + 1].y); }
        end = { x: p1, y: r.y }; });
      const exitX = end ? end.x : 0, exitY = end ? end.y : ymid;
      segs.push(S.seg(exitX, exitY, exitX, -Hh - 30, gw));
      let oy = -Hh - 30; for (let y = exitY; y > -Hh - 30; y -= 0.5) if (shape(exitX, y) > 0) { oy = y; break; } len += Math.abs(exitY - oy);
      const grooves = S.memo(S.union(...segs)), win = S.offset(panelF, -0.01);
      comps = [{ slot: "base", f: S.sub(shape, win, grooves), z0: 0, z1: gd, noBevel: true }, { slot: "base", f: S.sub(shape, win), z0: gd, z1: T },
        { slot: "panel", f: S.sub(panelF, grooves), z0: 0, z1: gd }, { slot: "panel", f: panelF, z0: gd - 0.001, z1: T + tops.panel * k }];
      lightMeta = { wireD: wd, grooveW: gw, grooveD: gd, diffuser: +(T + tops.panel * k - gd).toFixed(1), rows: rows.length, wireMM: Math.round(len), panelMM: [Math.round(px1 - px0), Math.round(py1 - py0)], thickness: +(T + tops.panel * k).toFixed(1), exit: [+exitX.toFixed(2), +exitY.toFixed(2)] };
    }
    for (const r of ["panel", "accent", "bold"]) if (Object.values(a.roles).includes(r)) comps.push({ slot: r, f: fOf(r), z0: r === "panel" ? T - 0.6 : T - 0.01, z1: T + tops[r] * k, h: o.h * 0.8, minArea: 0.6 });
    // name box: the biggest text-shaped rectangle that fits inside the panel with a 2.5 mm margin
    const cx = (a._box[0] + a._box[2]) / 2, cy = (a._box[1] + a._box[3]) / 2;
    const probe = fitText(o.text || "NAME", o.font || a.font || "varsity", { cx: 0, cy: 0, w: 1000, h: 10 }, { track: 0.05 }), pb = groupsBBox(probe.groups);
    const aspect = pb ? Math.max(1.5, (pb[2] - pb[0]) / Math.max(1, pb[3] - pb[1])) : 4;
    const rows = [];
    for (let y = 0; y < a.h; y++) { let L = -1, R = -1, bl = 0, best = [-1, -1];
      for (let x = 0; x <= a.w; x++) { const inP = x < a.w && panelF((x + 0.5 - cx) * s, -(y + 0.5 - cy) * s) < -2.5;
        if (inP && L < 0) L = x; if ((!inP || x === a.w) && L >= 0) { R = x; if (R - L > bl) { bl = R - L; best = [L, R]; } L = -1; } }
      rows.push(best); }
    let box = { cx: 0, cy: 0, w: 40, h: 10 }, bestH = 0;
    for (let y0 = 0; y0 < a.h; y0++) { if (rows[y0][0] < 0) continue; let L = rows[y0][0], R = rows[y0][1];
      for (let y1 = y0; y1 < a.h && rows[y1][0] >= 0; y1++) { L = Math.max(L, rows[y1][0]); R = Math.min(R, rows[y1][1]); if (R - L < 4) break;
        const wmm = (R - L) * s, hmm = (y1 - y0 + 1) * s, th = Math.min(hmm, wmm / aspect);
        if (th > bestH) { bestH = th; box = { cx: ((L + R) / 2 - cx) * s, cy: -((y0 + y1 + 1) / 2 - cy) * s, w: wmm, h: hmm }; } } }
    const nb = NP.nameBlock(o, o.font || a.font || "varsity", { cx: box.cx, cy: box.cy, w: box.w, h: Math.min(box.h, a.maxText || 34) }, { track: 0.05 });
    comps.push({ slot: "letters", groups: nb.groups, z0: T + tops.panel * k - 0.01, z1: T + (tops.panel + 1) * k, isText: true });
    const nbb = groupsBBox(nb.groups);
    return { components: comps, shape, bbox: [-X - 3, -Hh - 3, X + 3, Hh + 3], textGroups: nb.groups, textHeight: nb.h || Infinity, avoid: S.offset(panelF, 2), free: (x, y) => -S.sub(S.offset(shape, -3), S.offset(panelF, 2))(x, y),
      partBoxes: { name: nbb ? [nbb[0] - 1.5, nbb[1] - 1.5, nbb[2] + 1.5, nbb[3] + 1.5] : null }, partInfo: { name: { slot: "letters" } }, meta: Object.assign({ art: { key, source: a.source || "Kittl" } }, lightMeta ? { backlight: lightMeta } : {}) };
  };
  NP.ARTFRAMES = [];
  NP.addArtFrame = (key, a) => {
    NP.registerArt(key, a); if (!NP.ARTFRAMES.includes(key)) NP.ARTFRAMES.push(key);
    DESIGNS[key] = { label: a.label, note: a.note || "Designed in Kittl", layered: true, art: true, font: a.font || "varsity", slots: FRAME_SLOTS, labels: Object.assign({}, FRAME_LABELS, a.labels || {}), itemSlot: "accent", itemTop: 1.25, make: artMake(key) };
    PALETTES["art_" + key] = Object.assign({ label: a.label + " (as designed)", frame: true }, a.palette);
  };
  // Kittl frame templates, flattened to Polymaker colours. The data lives in data/art-frames.json;
  // each palette names Polymaker filaments ("pla:blue"), turned into colours here.
  for (const [key, a] of Object.entries(__DATA__("art-frames.json"))) {
    const palette = a.palette && Object.fromEntries(Object.entries(a.palette).map(([slot, id]) => [slot, P(id)]));
    NP.addArtFrame(key, palette ? Object.assign({}, a, { palette }) : a);
  }
