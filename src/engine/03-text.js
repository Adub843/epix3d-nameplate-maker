  /* ------------------------------------------------------------- text */
  function textGroups(str, fontKey, track = 0.05) {
    const F = FONTS[fontKey];
    const groups = [];
    let pen = 0, minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const SUB = { "\u2018": "'", "\u2019": "'", "\u201C": '"', "\u201D": '"', "\u2013": "-", "\u2014": "-", "\u2026": ".", "\u00D7": "X" };
    for (let ch of str) {
      let g = F.g[ch];
      if (!g) { // accented letters print as their base letter; anything else unsupported is left out
        const base = SUB[ch] || ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        g = F.g[base] || F.g[base.toUpperCase()];
        if (g) ch = base;
        else { pen += F.g[" "].a * 0.6; continue; }
      }
      const loops = g.c.map((c) => {
        const l = [];
        for (let i = 0; i < c.length; i += 2) {
          const x = c[i] + pen, y = c[i + 1];
          l.push([x, y]);
          if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
        return l;
      });
      groups.push(...groupLoops(loops, 0));
      pen += g.a + (ch === " " ? 0 : track * 1000);
    }
    if (!isFinite(minX)) return { groups: [], bbox: [0, 0, 0, 0] };
    return { groups, bbox: [minX, minY, maxX, maxY] };
  }
  function mapGroups(groups, fn) {
    return groups.map((g) => ({ outer: g.outer.map(fn), holes: g.holes.map((h) => h.map(fn)) }));
  }
  // fit text into box {cx,cy,w,h}; returns {groups, w, h, scale}
  function fitText(str, fontKey, box, opts = {}) {
    const t = textGroups(str, fontKey, opts.track ?? 0.05);
    const [x0, y0, x1, y1] = t.bbox;
    const bw = x1 - x0, bh = y1 - y0;
    if (bw <= 0) return { groups: [], w: 0, h: 0 };
    let s = Math.min(box.w / bw, box.h / bh);
    if (opts.maxCap) s = Math.min(s, opts.maxCap / FONTS[fontKey].cap);
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const ax = opts.align === "left" ? box.cx - box.w / 2 + bw * s / 2 : box.cx;
    const groups = mapGroups(t.groups, (p) => [
      Math.round(((p[0] - cx) * s + ax) * 1000) / 1000,
      Math.round(((p[1] - cy) * s + box.cy) * 1000) / 1000,
    ]);
    return { groups, w: bw * s, h: bh * s, scale: s };
  }
  NP.fitText = fitText;

