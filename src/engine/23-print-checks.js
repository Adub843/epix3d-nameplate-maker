  /* =================================================================
     Print checks and STL export.
     NP.printability(model) looks at what the printer will actually lay down: every part's footprint
     (its lowest slice) is drawn on a 0.1 mm grid and opened with a disc as wide as the thinnest wall
     a 0.4 mm nozzle prints well. Whatever the disc can't reach is thinner than that. It also checks
     letter height, base thickness, colour layer height and the bed size.
     ================================================================= */
  NP.PRINT_RULES = {
    minWall: 1.2,        // mm, the plate itself (base and backplate): three 0.4 mm lines
    minStroke: 1.0,      // mm, raised details and letter strokes
    thinArea: 0.5,       // mm², thin area allowed per part before it is flagged (sharp corners, tips)
    minTextHeight: 5,    // mm, letter height that stays readable and prints cleanly
    minBase: 2,          // mm, base thickness so the plate doesn't flex or warp
    minLayer: 0.24,      // mm, colour layer height: at least two 0.12 mm (fine detail) layers
    bed: 250,            // mm, largest side that fits a Bambu X1/P1/A1 bed with a margin
  };
  const GRID = 0.1;

  // squared distance from every pixel to the nearest pixel where on[i] is set (Felzenszwalb & Huttenlocher)
  function distance2(on, w, h) {
    const INF = 1e20, d = new Float64Array(w * h), n = Math.max(w, h);
    const f = new Float64Array(n), g = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
    for (let i = 0; i < w * h; i++) d[i] = on[i] ? 0 : INF;
    const pass = (len, get, set) => {
      for (let q = 0; q < len; q++) f[q] = get(q);
      let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
      for (let q = 1; q < len; q++) {
        let s;
        while ((s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])) <= z[k]) k--;
        k++; v[k] = q; z[k] = s; z[k + 1] = INF;
      }
      k = 0;
      for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; g[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
      for (let q = 0; q < len; q++) set(q, g[q]);
    };
    for (let x = 0; x < w; x++) pass(h, (y) => d[y * w + x], (y, val) => { d[y * w + x] = val; });
    for (let y = 0; y < h; y++) pass(w, (x) => d[y * w + x], (x, val) => { d[y * w + x] = val; });
    return d;
  }

  // fill the groups' rings (even-odd, so holes stay open) on a grid covering box, one pixel = GRID mm
  function rasterize(groups, box) {
    const w = Math.ceil((box[2] - box[0]) / GRID) + 1, h = Math.ceil((box[3] - box[1]) / GRID) + 1;
    const px = new Uint8Array(w * h), rings = [];
    for (const g of groups) rings.push(g.outer, ...(g.holes || []));
    const xs = [];
    for (let y = 0; y < h; y++) {
      const cy = box[1] + (y + 0.5) * GRID;
      xs.length = 0;
      for (const r of rings) {
        for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
          const a = r[i], b = r[j];
          if ((a[1] > cy) !== (b[1] > cy)) xs.push(a[0] + (cy - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
        }
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const x0 = Math.max(0, Math.ceil((xs[k] - box[0]) / GRID - 0.5)), x1 = Math.min(w - 1, Math.floor((xs[k + 1] - box[0]) / GRID - 0.5));
        for (let x = x0; x <= x1; x++) px[y * w + x] = 1;
      }
    }
    return { px, w, h };
  }

  // area (mm²) and box of everything thinner than `width`: the pixels a disc of that width can't reach
  // and that sit further than its radius from where it can (so plain corners don't count)
  function thinParts(groups, width) {
    if (!groups.length) return { area: 0, box: null };
    let box = [Infinity, Infinity, -Infinity, -Infinity];
    for (const g of groups) for (const p of g.outer) {
      box = [Math.min(box[0], p[0]), Math.min(box[1], p[1]), Math.max(box[2], p[0]), Math.max(box[3], p[1])];
    }
    const pad = width;
    box = [box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad];
    const { px, w, h } = rasterize(groups, box);
    const r = width / 2 / GRID, r2 = r * r;
    const outside = distance2(px.map((v) => 1 - v), w, h);       // inside pixels: distance to the edge
    const core = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) core[i] = px[i] && outside[i] >= r2 ? 1 : 0;
    const fromCore = distance2(core, w, h);                       // the disc's reach is core grown by r
    const reach = (r + 1) * (r + 1), far = (2 * r + 1) * (2 * r + 1);
    let n = 0, bx = [Infinity, Infinity, -Infinity, -Infinity];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!px[i] || fromCore[i] <= reach) continue;
      if (fromCore[i] <= far) continue; // corner left over by the disc, not a thin wall
      n++;
      const mx = box[0] + (x + 0.5) * GRID, my = box[1] + (y + 0.5) * GRID;
      bx = [Math.min(bx[0], mx), Math.min(bx[1], my), Math.max(bx[2], mx), Math.max(bx[3], my)];
    }
    return { area: n * GRID * GRID, box: n ? bx : null };
  }

  NP.printability = function (model) {
    const R = NP.PRINT_RULES, issues = [];
    const add = (level, code, text, extra) => issues.push(Object.assign({ level, code, text }, extra || {}));
    const parts = model.parts.filter((p) => p.slices.some((s) => s.groups.length));
    const baseSlots = new Set(["base", "backplate"]);
    for (const p of parts) {
      const lowest = p.slices.filter((s) => s.groups.length).reduce((a, s) => (s.z0 < a.z0 ? s : a));
      const structural = baseSlots.has(p.slot);
      const width = structural ? R.minWall : R.minStroke;
      const thin = thinParts(lowest.groups, width);
      if (thin.area > R.thinArea) {
        add("warn", "thin", `${p.label || p.slot}: about ${thin.area.toFixed(1)} mm² is thinner than ${width} mm and may not print cleanly.`, { slot: p.slot, box: thin.box });
      }
      const z0 = Math.min(...p.slices.map((s) => s.z0)), z1 = Math.max(...p.slices.map((s) => s.z1));
      if (structural && z1 - z0 < R.minBase) add("warn", "base", `${p.label || p.slot} is ${(z1 - z0).toFixed(1)} mm thick; ${R.minBase} mm or more keeps it from flexing.`, { slot: p.slot });
      if (!structural && z1 - z0 < R.minLayer - 1e-6) add("warn", "layer", `${p.label || p.slot} is only ${(z1 - z0).toFixed(2)} mm tall; it needs ${R.minLayer} mm (two fine layers) to show its colour.`, { slot: p.slot });
    }
    const textHeight = Number.isFinite(model.textHeight) ? model.textHeight : null;
    if (textHeight !== null && textHeight < R.minTextHeight) {
      add("warn", "text", `Letters are ${textHeight.toFixed(1)} mm tall; ${R.minTextHeight} mm or more stays readable and prints cleanly.`);
    }
    const b = model.bbox, size = [b[2] - b[0], b[3] - b[1]];
    if (Math.max(...size) > R.bed) add("error", "bed", `The plate is ${size[0].toFixed(0)} × ${size[1].toFixed(0)} mm; it must fit within ${R.bed} mm.`);
    return { ok: !issues.some((i) => i.level === "error"), clean: issues.length === 0, size, textHeight, issues };
  };

  // Binary STL of the whole plate, every part together (STL has no colours). Units: mm.
  NP.toSTL = function (model, title) {
    const meshes = NP.meshes(model);
    const list = model.parts.map((p) => meshes[p.slot]).filter((m) => m && m.t.length);
    const count = list.reduce((n, m) => n + m.t.length / 3, 0);
    const bytes = new Uint8Array(84 + 50 * count), view = new DataView(bytes.buffer);
    const head = ("Charleston3D nameplate " + (title || "")).slice(0, 79);
    for (let i = 0; i < head.length; i++) bytes[i] = head.charCodeAt(i) & 0x7f;
    view.setUint32(80, count, true);
    let o = 84;
    for (const m of list) {
      const v = m.v, t = m.t;
      for (let i = 0; i < t.length; i += 3) {
        const a = 3 * t[i], b = 3 * t[i + 1], c = 3 * t[i + 2];
        const ux = v[b] - v[a], uy = v[b + 1] - v[a + 1], uz = v[b + 2] - v[a + 2];
        const wx = v[c] - v[a], wy = v[c + 1] - v[a + 1], wz = v[c + 2] - v[a + 2];
        let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
        const len = Math.hypot(nx, ny, nz) || 1; nx /= len; ny /= len; nz /= len;
        for (const val of [nx, ny, nz, v[a], v[a + 1], v[a + 2], v[b], v[b + 1], v[b + 2], v[c], v[c + 1], v[c + 2]]) { view.setFloat32(o, val, true); o += 4; }
        view.setUint16(o, 0, true); o += 2;
      }
    }
    return bytes;
  };
