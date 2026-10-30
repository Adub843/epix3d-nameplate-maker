  /* -------------------------------------------------------------- build */
  NP.build = function (o) {
    const opts = Object.assign({ width: 160, base: 3, raise: 1.2, h: 0.25, icon: "trophy", text: "NAME", sub: "" }, o);
    if (opts.upper !== false) { opts.text = opts.text.toUpperCase(); opts.sub = (opts.sub || "").toUpperCase(); }
    if (!opts.font || opts.font === "auto") delete opts.font;
    const d = DESIGNS[opts.design || "classic"].make(opts);
    const bb = [d.bbox[0] - 4, d.bbox[1] - 4, d.bbox[2] + 4, d.bbox[3] + 4];
    const base = fieldGroups(d.base || d.shape, bb, opts.h);
    const raised = fieldGroups(d.raised, bb, opts.h * 0.8);
    const text = d.text.flatMap((t) => t.groups);
    const textMin = Math.min(...d.text.filter((t) => t.groups.length).map((t) => t.h || Infinity));
    return { base, raised: raised.concat(text), opts, textHeight: textMin, bbox: bb };
  };
  // icon on its own, for pickers
  NP.iconSVG = function (key, color) {
    const g = fieldGroups(iconField(key, 0, 0, 40), [-26, -26, 26, 26], 0.45);
    const d = g.map((q) => [q.outer, ...q.holes].map((r) => "M" + r.map((p) => p[0].toFixed(1) + " " + (-p[1]).toFixed(1)).join("L") + "Z").join("")).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-25 -25 50 50"><path d="${d}" fill="${color || "currentColor"}" fill-rule="evenodd"/></svg>`;
  };

  /* ------------------------------------------------------------- meshes */
  function extrudeGroups(groups, z0, z1) {
    const V = [], T = [];
    for (const g0 of groups) {
      const outer = cleanLoop(g0.outer, 0);
      if (outer.length < 3) continue;
      const rings = unpinch([outer, ...g0.holes.map((h) => cleanLoop(h, 0)).filter((h) => h.length >= 3)]);
      const data = [], holes = [];
      let n = 0;
      rings.forEach((r, k) => { if (k) holes.push(n); for (const p of r) { data.push(p[0], p[1]); n++; } });
      const tris = safeEarcut(data, holes, rings);
      const b = V.length / 3;
      for (let i = 0; i < n; i++) V.push(data[2 * i], data[2 * i + 1], z0);
      for (let i = 0; i < n; i++) V.push(data[2 * i], data[2 * i + 1], z1);
      for (let i = 0; i < tris.length; i += 3) {
        let a = tris[i], c1 = tris[i + 1], c2 = tris[i + 2];
        const ar = (data[2 * c1] - data[2 * a]) * (data[2 * c2 + 1] - data[2 * a + 1]) - (data[2 * c1 + 1] - data[2 * a + 1]) * (data[2 * c2] - data[2 * a]);
        if (ar < 0) { const t = c1; c1 = c2; c2 = t; }
        T.push(b + n + a, b + n + c1, b + n + c2); // top
        T.push(b + a, b + c2, b + c1); // bottom
      }
      let off = 0;
      for (const r of rings) {
        const L = r.length;
        for (let j = 0; j < L; j++) {
          const p = b + off + j, q = b + off + ((j + 1) % L);
          T.push(p, q, q + n, p, q + n, p + n);
        }
        off += L;
      }
    }
    return { v: V, t: T };
  }
  // an outline that touches itself (or another ring) at a single point can't be triangulated:
  // nudge the repeated vertex a few microns toward its own neighbours so the touch opens up
  function unpinch(rings) {
    const seen = new Map();
    const out = rings.map((r) => r.map((p) => [p[0], p[1]]));
    out.forEach((r, ri) => r.forEach((p, i) => {
      const key = p[0] + "," + p[1];
      if (!seen.has(key)) { seen.set(key, 1); return; }
      const a = r[(i - 1 + r.length) % r.length], b = r[(i + 1) % r.length];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = mx - p[0], dy = my - p[1], L = hyp(dx, dy) || 1;
      const step = Math.min(0.004, L * 0.25);
      p[0] = Math.round((p[0] + (dx / L) * step) * 1e4) / 1e4; p[1] = Math.round((p[1] + (dy / L) * step) * 1e4) / 1e4;
      seen.set(p[0] + "," + p[1], 1);
    }));
    return out;
  }
  // a vertex lying exactly on a triangle edge that earcut skipped: split that triangle
  function reinsertDropped(data, tris) {
    const t = tris.slice(), n = data.length / 2, used = new Uint8Array(n);
    for (const i of t) used[i] = 1;
    for (let v = 0; v < n; v++) {
      if (used[v]) continue;
      const vx = data[2 * v], vy = data[2 * v + 1];
      let done = false;
      for (let i = 0; i < t.length && !done; i += 3) {
        for (let e = 0; e < 3; e++) {
          const a = t[i + e], b = t[i + (e + 1) % 3], c = t[i + (e + 2) % 3];
          const ax = data[2 * a], ay = data[2 * a + 1], bx = data[2 * b], by = data[2 * b + 1];
          const ex = bx - ax, ey = by - ay, L2 = ex * ex + ey * ey;
          if (!L2) continue;
          const u = ((vx - ax) * ex + (vy - ay) * ey) / L2;
          if (u <= 1e-9 || u >= 1 - 1e-9) continue;
          const cr = Math.abs(ex * (vy - ay) - ey * (vx - ax)) / Math.sqrt(L2);
          if (cr > 1e-6) continue;
          t[i] = a; t[i + 1] = v; t[i + 2] = c;
          t.push(v, b, c);
          done = true; break;
        }
      }
      if (done) used[v] = 1;
    }
    return t;
  }
  // boundary edges of the triangulation must be outline edges; split any that skip an outline vertex
  function fixTJunctions(data, tris, rings) {
    const t = tris.slice(), ringEdge = new Set();
    let off = 0;
    for (const r of rings) { for (let j = 0; j < r.length; j++) { const a = off + j, b = off + ((j + 1) % r.length); ringEdge.add(a + "," + b); ringEdge.add(b + "," + a); } off += r.length; }
    const n = data.length / 2;
    for (let pass = 0; pass < 8; pass++) {
      const cnt = new Map();
      for (let i = 0; i < t.length; i += 3) for (let e = 0; e < 3; e++) { const a = t[i + e], b = t[i + (e + 1) % 3], k = Math.min(a, b) + "," + Math.max(a, b); cnt.set(k, (cnt.get(k) || 0) + 1); }
      let changed = false;
      for (let i = 0; i < t.length; i += 3) {
        for (let e = 0; e < 3; e++) {
          const a = t[i + e], b = t[i + (e + 1) % 3], c = t[i + (e + 2) % 3];
          if (cnt.get(Math.min(a, b) + "," + Math.max(a, b)) !== 1 || ringEdge.has(a + "," + b)) continue;
          const ax = data[2 * a], ay = data[2 * a + 1], ex = data[2 * b] - ax, ey = data[2 * b + 1] - ay, L2 = ex * ex + ey * ey;
          if (!L2) continue;
          let hit = -1, hu = 2;
          for (let v = 0; v < n; v++) {
            if (v === a || v === b || v === c) continue;
            const vx = data[2 * v], vy = data[2 * v + 1], u = ((vx - ax) * ex + (vy - ay) * ey) / L2;
            if (u <= 1e-9 || u >= 1 - 1e-9) continue;
            if (Math.abs(ex * (vy - ay) - ey * (vx - ax)) / Math.sqrt(L2) > 1e-5) continue;
            if (u < hu) { hu = u; hit = v; }
          }
          if (hit < 0) continue;
          t[i] = a; t[i + 1] = hit; t[i + 2] = c;
          t.push(hit, b, c);
          changed = true; break;
        }
      }
      if (!changed) break;
    }
    return t;
  }
  // earcut with verification; retries in a rotated frame to dodge exact alignments
  function safeEarcut(data, holes, rings) {
    const n = data.length / 2;
    const want = n + 2 * holes.length - 2;
    const target = rings.reduce((s, r, k) => s + (k ? -1 : 1) * Math.abs(loopArea(r)), 0);
    let best = null;
    for (const ang of [0, 0.0137, 0.4123, 1.1371, 2.0519, 2.9017, 0.2311, 0.7193, 1.4983, 1.8137, 2.4419, 2.7311, 3.0517, 0.9137, 1.6551, 2.2283]) {
      let d = data;
      if (ang) {
        const c = Math.cos(ang), s = Math.sin(ang);
        d = new Float64Array(data.length);
        for (let i = 0; i < data.length; i += 2) { d[i] = data[i] * c - data[i + 1] * s; d[i + 1] = data[i] * s + data[i + 1] * c; }
      }
      const t = earcut(d, holes);
      let sum = 0;
      for (let i = 0; i < t.length; i += 3) {
        const a = 2 * t[i], b = 2 * t[i + 1], c = 2 * t[i + 2];
        sum += Math.abs((data[b] - data[a]) * (data[c + 1] - data[a + 1]) - (data[b + 1] - data[a + 1]) * (data[c] - data[a])) / 2;
      }
      const err = Math.abs(sum - target) / Math.max(target, 1e-9);
      if (t.length / 3 === want && err < 1e-6) return t;
      if (err < 1e-6) { const fixed = fixTJunctions(data, reinsertDropped(data, t), rings); if (fixed.length / 3 === want) return fixed; }
      if (!best || err < best.err) best = { t, err };
    }
    NP.lastWarning = "triangulation fallback";
    return best.t;
  }
  NP.meshes = function (model) {
    const o = model.opts;
    return {
      base: extrudeGroups(model.base, 0, o.base),
      raised: extrudeGroups(model.raised, o.base, o.base + o.raise),
    };
  };
  NP.checkMesh = function (m) {
    const edges = new Map();
    for (let i = 0; i < m.t.length; i += 3) {
      for (let k = 0; k < 3; k++) {
        const a = m.t[i + k], b = m.t[i + (k + 1) % 3];
        const key = a + "," + b;
        edges.set(key, (edges.get(key) || 0) + 1);
      }
    }
    let bad = 0;
    for (const [key, c] of edges) {
      const [a, b] = key.split(",");
      if (c !== 1 || edges.get(b + "," + a) !== 1) bad++;
    }
    let vol = 0;
    const v = m.v;
    for (let i = 0; i < m.t.length; i += 3) {
      const a = 3 * m.t[i], b = 3 * m.t[i + 1], c = 3 * m.t[i + 2];
      vol += (v[a] * (v[b + 1] * v[c + 2] - v[b + 2] * v[c + 1]) - v[a + 1] * (v[b] * v[c + 2] - v[b + 2] * v[c]) + v[a + 2] * (v[b] * v[c + 1] - v[b + 1] * v[c])) / 6;
    }
    return { badEdges: bad, volume: vol, tris: m.t.length / 3 };
  };

  /* ---------------------------------------------------------------- 3MF */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function zipStore(files) { // [{name, data:Uint8Array}]
    const enc = new TextEncoder(), parts = [], central = [];
    let offset = 0;
    for (const f of files) {
      const name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0, true); h.setUint16(8, 0, true);
      h.setUint16(10, 0, true); h.setUint16(12, 0x21, true); h.setUint32(14, crc, true);
      h.setUint32(18, size, true); h.setUint32(22, size, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), name, f.data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0, true);
      c.setUint16(10, 0, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true);
      c.setUint32(20, size, true); c.setUint32(24, size, true); c.setUint16(28, name.length, true);
      c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), name);
      offset += 30 + name.length + size;
    }
    const cdSize = central.reduce((s, a) => s + a.length, 0);
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
    e.setUint32(12, cdSize, true); e.setUint32(16, offset, true);
    const all = parts.concat(central, [new Uint8Array(e.buffer)]);
    const out = new Uint8Array(all.reduce((s, a) => s + a.length, 0));
    let p = 0; for (const a of all) { out.set(a, p); p += a.length; }
    return out;
  }
  const num = (x) => { const s = x.toFixed(3); return s.replace(/\.?0+$/, "") || "0"; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function meshXML(id, name, m, pindex) {
    const out = [`<object id="${id}" name="${esc(name)}" type="model" pid="1" pindex="${pindex}"><mesh><vertices>`];
    for (let i = 0; i < m.v.length; i += 3) out.push(`<vertex x="${num(m.v[i])}" y="${num(m.v[i + 1])}" z="${num(m.v[i + 2])}"/>`);
    out.push("</vertices><triangles>");
    for (let i = 0; i < m.t.length; i += 3) out.push(`<triangle v1="${m.t[i]}" v2="${m.t[i + 1]}" v3="${m.t[i + 2]}"/>`);
    out.push("</triangles></mesh></object>");
    return out.join("");
  }
  NP.zipStore = zipStore;
  NP.to3MF = function (model, colors, title) {
    const m = NP.meshes(model);
    const c1 = (colors.base || "#222222").toUpperCase() + "FF", c2 = (colors.raised || "#FFFFFF").toUpperCase() + "FF";
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
<metadata name="Title">${esc(title || "Nameplate")}</metadata>
<metadata name="Application">Nameplate Generator</metadata>
<resources>
<basematerials id="1"><base name="Base color" displaycolor="${c1}"/><base name="Raised color" displaycolor="${c2}"/></basematerials>
${meshXML(2, "Base", m.base, 0)}
${meshXML(3, "Raised", m.raised, 1)}
<object id="4" name="${esc(title || "Nameplate")}" type="model"><components><component objectid="2"/><component objectid="3"/></components></object>
</resources>
<build><item objectid="4"/></build>
</model>`;
    const enc = new TextEncoder();
    return zipStore([
      { name: "[Content_Types].xml", data: enc.encode(`<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>`) },
      { name: "_rels/.rels", data: enc.encode(`<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>`) },
      { name: "3D/3dmodel.model", data: enc.encode(xml) },
    ]);
  };

  /* ---------------------------------------------------------------- SVG */
  function pathOf(groups) {
    // 0.1 mm is finer than a nozzle line; dropping repeated points after rounding halves the SVG size
    const ring = (r) => { const out = []; let last = ""; for (const q of r) { const s = Math.round(q[0] * 10) / 10 + " " + Math.round(-q[1] * 10) / 10; if (s !== last) out.push(s); last = s; } return out.length > 2 ? "M" + out.join("L") + "Z" : ""; };
    return groups.map((g) => [g.outer, ...g.holes].map(ring).join("")).join("");
  }
  NP.toSVG = function (model, colors, opts = {}) {
    const [x0, y0, x1, y1] = model.bbox;
    const w = x1 - x0, h = y1 - y0;
    const shade = opts.shadow !== false;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${-y1} ${w} ${h}" width="${opts.width || "100%"}" ${opts.height ? `height="${opts.height}"` : ""}>` +
      (shade ? `<path d="${pathOf(model.base)}" fill="rgba(0,0,0,.18)" fill-rule="evenodd" transform="translate(0.9 1.4)"/>` : "") +
      `<path d="${pathOf(model.base)}" fill="${colors.base}" fill-rule="evenodd" stroke="rgba(0,0,0,.35)" stroke-width="0.35"/>` +
      `<path d="${pathOf(model.raised)}" fill="${colors.raised}" fill-rule="evenodd" stroke="rgba(0,0,0,.28)" stroke-width="0.25"/></svg>`;
  };

