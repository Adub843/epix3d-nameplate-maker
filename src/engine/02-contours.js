  /* ------------------------------------------------------- loop utilities */
  function loopArea(l) {
    let s = 0;
    for (let i = 0, j = l.length - 1; i < l.length; j = i++) s += (l[j][0] - l[i][0]) * (l[j][1] + l[i][1]);
    return s / 2; // >0 => CCW (y up)
  }
  function pointInLoop(x, y, l) {
    let inside = false;
    for (let i = 0, j = l.length - 1; i < l.length; j = i++) {
      const xi = l[i][0], yi = l[i][1], xj = l[j][0], yj = l[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function dpOpen(pts, tol, out) {
    // iterative Douglas\u2013Peucker; pushes kept points except the last
    const keep = new Uint8Array(pts.length); keep[0] = 1; keep[pts.length - 1] = 1;
    const stack = [[0, pts.length - 1]];
    while (stack.length) {
      const [s, e] = stack.pop();
      const ax = pts[s][0], ay = pts[s][1], bx = pts[e][0], by = pts[e][1];
      const dx = bx - ax, dy = by - ay, L = hyp(dx, dy) || 1e-12;
      let md = -1, mi = -1;
      for (let i = s + 1; i < e; i++) {
        const d = Math.abs(dx * (pts[i][1] - ay) - dy * (pts[i][0] - ax)) / L;
        if (d > md) { md = d; mi = i; }
      }
      if (md > tol) { keep[mi] = 1; stack.push([s, mi], [mi, e]); }
    }
    for (let i = 0; i < pts.length - 1; i++) if (keep[i]) out.push(pts[i]);
  }
  function cleanLoop(l, tol) {
    if (l.length < 4) return l;
    let pts = l;
    if (tol > 0) {
      let k = 0, md = -1;
      for (let i = 1; i < l.length; i++) { const d = hyp(l[i][0] - l[0][0], l[i][1] - l[0][1]); if (d > md) { md = d; k = i; } }
      const out = [];
      dpOpen(l.slice(0, k + 1), tol, out);
      dpOpen(l.slice(k).concat([l[0]]), tol, out);
      pts = out;
    }
    // quantise to 1 \u00b5m, drop duplicates & collinear points
    let q = pts.map((p) => [Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000]);
    let changed = true;
    while (changed && q.length >= 3) {
      changed = false;
      const r = [];
      for (let i = 0; i < q.length; i++) {
        const a = r.length ? r[r.length - 1] : q[q.length - 1], b = q[i], c = q[(i + 1) % q.length];
        if (b[0] === a[0] && b[1] === a[1]) { changed = true; continue; }
        const cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
        if (Math.abs(cr) < 1e-7) { changed = true; continue; }
        r.push(b);
      }
      q = r;
    }
    return q;
  }
  // do segments ab and cd share any point? (exact, handles touching and collinear overlap)
  function segHit(a, b, c, d) {
    const orient = (p, r, t) => { const v = (r[0] - p[0]) * (t[1] - p[1]) - (r[1] - p[1]) * (t[0] - p[0]); return v > 0 ? 1 : v < 0 ? -1 : 0; };
    const on = (p, q, r) => Math.min(p[0], r[0]) <= q[0] && q[0] <= Math.max(p[0], r[0]) && Math.min(p[1], r[1]) <= q[1] && q[1] <= Math.max(p[1], r[1]);
    const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
    if (o1 !== o2 && o3 !== o4 && o1 && o2 && o3 && o4) return true;
    return (o1 === 0 && on(a, c, b)) || (o2 === 0 && on(a, d, b)) || (o3 === 0 && on(c, a, d)) || (o4 === 0 && on(c, b, d));
  }
  // does a closed loop cross itself? (bucketed segment test)
  function selfCrosses(q) {
    const n = q.length; if (n < 4) return false;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of q) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    const cell = Math.max((x1 - x0) / 32, (y1 - y0) / 32, 1e-3);
    const grid = new Map();
    for (let i = 0; i < n; i++) {
      const a = q[i], b = q[(i + 1) % n];
      const ci0 = Math.floor((Math.min(a[0], b[0]) - x0) / cell), ci1 = Math.floor((Math.max(a[0], b[0]) - x0) / cell);
      const cj0 = Math.floor((Math.min(a[1], b[1]) - y0) / cell), cj1 = Math.floor((Math.max(a[1], b[1]) - y0) / cell);
      for (let ci = ci0; ci <= ci1; ci++) for (let cj = cj0; cj <= cj1; cj++) { const k = ci * 4096 + cj; if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); }
    }
    const orient = (p, r, t) => { const v = (r[0] - p[0]) * (t[1] - p[1]) - (r[1] - p[1]) * (t[0] - p[0]); return v > 0 ? 1 : v < 0 ? -1 : 0; };
    for (const list of grid.values()) {
      for (let u = 0; u < list.length; u++) for (let w = u + 1; w < list.length; w++) {
        const i = list[u], j = list[w];
        if (Math.abs(i - j) <= 1 || Math.abs(i - j) === n - 1) continue;
        if (segHit(q[i], q[(i + 1) % n], q[j], q[(j + 1) % n])) return true;
      }
    }
    return false;
  }
  // indices of loops whose edges cross an edge of a different loop
  function crossingLoops(loops) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const q of loops) for (const p of q) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    const cell = Math.max((x1 - x0) / 96, (y1 - y0) / 96, 0.05);
    const grid = new Map();
    loops.forEach((q, li) => {
      for (let i = 0; i < q.length; i++) {
        const a = q[i], b = q[(i + 1) % q.length];
        const ci0 = Math.floor((Math.min(a[0], b[0]) - x0) / cell), ci1 = Math.floor((Math.max(a[0], b[0]) - x0) / cell);
        const cj0 = Math.floor((Math.min(a[1], b[1]) - y0) / cell), cj1 = Math.floor((Math.max(a[1], b[1]) - y0) / cell);
        for (let ci = ci0; ci <= ci1; ci++) for (let cj = cj0; cj <= cj1; cj++) { const k = ci * 8192 + cj; if (!grid.has(k)) grid.set(k, []); grid.get(k).push([li, a, b]); }
      }
    });
    const orient = (p, r, t) => { const v = (r[0] - p[0]) * (t[1] - p[1]) - (r[1] - p[1]) * (t[0] - p[0]); return v > 0 ? 1 : v < 0 ? -1 : 0; };
    const hit = new Set();
    for (const list of grid.values()) {
      for (let u = 0; u < list.length; u++) for (let w = u + 1; w < list.length; w++) {
        const A = list[u], B = list[w];
        if (A[0] === B[0] || (hit.has(A[0]) && hit.has(B[0]))) continue;
        if (segHit(A[1], A[2], B[1], B[2])) { hit.add(A[0]); hit.add(B[0]); }
      }
    }
    return hit;
  }
  function safeLoop(l, tol) {
    const q = cleanLoop(l, tol);
    if (tol > 0 && selfCrosses(q)) return cleanLoop(l, 0);
    return q;
  }
  // loops -> [{outer, holes}] with outer CCW, holes CW
  function groupLoops(loops, minArea) {
    const L = loops.filter((l) => l.length >= 3 && Math.abs(loopArea(l)) >= (minArea || 0));
    const info = L.map((l) => ({ l, a: Math.abs(loopArea(l)), depth: 0, parent: -1 }));
    for (let i = 0; i < info.length; i++) {
      const p = info[i].l[0];
      let best = -1;
      for (let j = 0; j < info.length; j++) {
        if (i === j || info[j].a <= info[i].a) continue;
        if (pointInLoop(p[0], p[1], info[j].l)) {
          info[i].depth++;
          if (best < 0 || info[j].a < info[best].a) best = j;
        }
      }
      info[i].parent = best;
    }
    const groups = [], map = new Map();
    info.forEach((o, i) => {
      if (o.depth % 2 === 0) {
        const outer = loopArea(o.l) > 0 ? o.l : o.l.slice().reverse();
        const g = { outer, holes: [] }; map.set(i, g); groups.push(g);
      }
    });
    info.forEach((o) => {
      if (o.depth % 2 === 1 && map.has(o.parent)) {
        map.get(o.parent).holes.push(loopArea(o.l) < 0 ? o.l : o.l.slice().reverse());
      }
    });
    return groups;
  }
  NP.groupLoops = groupLoops;

  /* ------------------------------------------------------- SDF toolkit */
  const S = {};
  S.circle = (cx, cy, r) => (x, y) => hyp(x - cx, y - cy) - r;
  S.box = (cx, cy, hw, hh, r = 0) => (x, y) => {
    const dx = Math.abs(x - cx) - hw + r, dy = Math.abs(y - cy) - hh + r;
    return hyp(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
  };
  S.seg = (ax, ay, bx, by, w) => (x, y) => {
    const px = x - ax, py = y - ay, dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy || 1e-12)));
    return hyp(px - dx * t, py - dy * t) - w / 2;
  };
  S.ring = (cx, cy, R, w) => (x, y) => Math.abs(hyp(x - cx, y - cy) - R) - w / 2;
  S.ellipse = (cx, cy, rx, ry) => (x, y) => {
    const u = (x - cx) / rx, v = (y - cy) / ry, k = hyp(u, v), g = hyp(u / rx, v / ry);
    return g > 1e-9 ? ((k - 1) * k) / g : -Math.min(rx, ry); // first-order distance (k-1)/|grad k|
  };
  S.poly = (pts) => (x, y) => {
    let d = Infinity, inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const ax = pts[j][0], ay = pts[j][1], bx = pts[i][0], by = pts[i][1];
      const ex = bx - ax, ey = by - ay, wx = x - ax, wy = y - ay;
      const t = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey)));
      d = Math.min(d, hyp(wx - ex * t, wy - ey * t));
      if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
    }
    return inside ? -d : d;
  };
  S.memo = (f) => { let lx = NaN, ly = NaN, lv = 0; return (x, y) => (x === lx && y === ly) ? lv : (lx = x, ly = y, lv = f(x, y)); };
  S.star = (cx, cy, R, r, n = 5, rot = Math.PI / 2) => {
    const pts = [];
    for (let i = 0; i < 2 * n; i++) {
      const a = rot + (i * Math.PI) / n, rr = i % 2 ? r : R;
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    return S.poly(pts);
  };
  S.union = (...fs) => (x, y) => { let m = Infinity; for (const f of fs) { const v = f(x, y); if (v < m) m = v; } return m; };
  S.sub = (a, ...bs) => (x, y) => { let v = a(x, y); for (const b of bs) v = Math.max(v, -b(x, y)); return v; };
  S.inter = (...fs) => (x, y) => { let m = -Infinity; for (const f of fs) { const v = f(x, y); if (v > m) m = v; } return m; };
  S.offset = (f, d) => (x, y) => f(x, y) - d;
  S.shell = (f, w) => (x, y) => Math.abs(f(x, y)) - w / 2; // outline band of width w
  // place unit-space shape: scale s, rotate rot (rad), then translate (tx,ty)
  S.xf = (f, tx, ty, s, rot = 0) => {
    const c = Math.cos(-rot), sn = Math.sin(-rot);
    return (x, y) => {
      const ux = (x - tx) / s, uy = (y - ty) / s;
      return f(ux * c - uy * sn, ux * sn + uy * c) * s;
    };
  };
  // cheap bound: outside the box -> lower-bound distance, inside -> exact f
  S.bounded = (f, x0, y0, x1, y1) => (x, y) => {
    const dx = Math.max(x0 - x, 0, x - x1), dy = Math.max(y0 - y, 0, y - y1);
    if (dx > 0.5 || dy > 0.5) return hyp(dx, dy) + 0.25;
    return f(x, y);
  };
  S.EMPTY = () => 1e9;
  NP.S = S;

  /* ----------------------------------------------- marching squares */
  function contour(f, x0, y0, x1, y1, h, simplifyTol) {
    const pad = 2 * h;
    // offset the grid by an irrational fraction of a cell so straight edges never sit exactly on sample points
    x0 -= pad + h * 0.31831; y0 -= pad + h * 0.27183; x1 += pad; y1 += pad;
    const nx = Math.ceil((x1 - x0) / h) + 1, ny = Math.ceil((y1 - y0) / h) + 1;
    const v = new Float64Array(nx * ny);
    // coarse pass: fields here are (close to) distance bounds, so a coarse cell whose corners are all
    // farther from the edge than its half-diagonal (with margin) has one sign throughout; only cells
    // near an edge are sampled at full resolution
    const B = 4, nxc = Math.ceil((nx - 1) / B) + 1, nyc = Math.ceil((ny - 1) / B) + 1, C = B * h, safe = C * 0.75 * 1.6;
    const cv = new Float64Array(nxc * nyc);
    for (let J = 0; J < nyc; J++) for (let Ii = 0; Ii < nxc; Ii++) cv[J * nxc + Ii] = f(x0 + Ii * C, y0 + J * C);
    const solid = new Int8Array(nxc * nyc); // per coarse cell: 0 = evaluate, 1 = all outside, -1 = all inside
    for (let J = 0; J < nyc - 1; J++) for (let Ii = 0; Ii < nxc - 1; Ii++) {
      const a = cv[J * nxc + Ii], b = cv[J * nxc + Ii + 1], c = cv[(J + 1) * nxc + Ii], d = cv[(J + 1) * nxc + Ii + 1];
      if (a > safe && b > safe && c > safe && d > safe) solid[J * nxc + Ii] = 1;
      else if (a < -safe && b < -safe && c < -safe && d < -safe) solid[J * nxc + Ii] = -1;
    }
    for (let j = 0; j < ny; j++) {
      const y = y0 + j * h, J = Math.min(nyc - 2, Math.floor(j / B));
      for (let i = 0; i < nx; i++) {
        let val;
        if (i === 0 || j === 0 || i === nx - 1 || j === ny - 1) val = 1;
        else {
          const sc = solid[J * nxc + Math.min(nxc - 2, Math.floor(i / B))];
          val = sc ? sc : f(x0 + i * h, y);
        }
        if (val === 0) val = 1e-9;
        v[j * nx + i] = val;
      }
    }
    const pts = new Map();
    const pt = (key, ax, ay, va, bx, by, vb) => {
      if (!pts.has(key)) { const t = va / (va - vb); pts.set(key, [ax + (bx - ax) * t, ay + (by - ay) * t]); }
      return key;
    };
    const adj = new Map();
    const link = (a, b) => {
      if (!adj.has(a)) adj.set(a, []); if (!adj.has(b)) adj.set(b, []);
      adj.get(a).push(b); adj.get(b).push(a);
    };
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const k0 = j * nx + i, k1 = k0 + 1, k3 = k0 + nx, k2 = k3 + 1;
        const a = v[k0], b = v[k1], c = v[k2], d = v[k3];
        const idx = (a < 0 ? 1 : 0) | (b < 0 ? 2 : 0) | (c < 0 ? 4 : 0) | (d < 0 ? 8 : 0);
        if (idx === 0 || idx === 15) continue;
        const X = x0 + i * h, Y = y0 + j * h;
        const E = {};
        const bottom = () => E.b ?? (E.b = pt(2 * k0, X, Y, a, X + h, Y, b));
        const right = () => E.r ?? (E.r = pt(2 * k1 + 1, X + h, Y, b, X + h, Y + h, c));
        const top = () => E.t ?? (E.t = pt(2 * k3, X, Y + h, d, X + h, Y + h, c));
        const left = () => E.l ?? (E.l = pt(2 * k0 + 1, X, Y, a, X, Y + h, d));
        const crossed = [];
        if ((a < 0) !== (b < 0)) crossed.push(bottom());
        if ((b < 0) !== (c < 0)) crossed.push(right());
        if ((d < 0) !== (c < 0)) crossed.push(top());
        if ((a < 0) !== (d < 0)) crossed.push(left());
        if (crossed.length === 2) link(crossed[0], crossed[1]);
        else if (crossed.length === 4) {
          const center = (a + b + c + d) / 4 < 0;
          if (idx === 5) {
            if (center) { link(bottom(), right()); link(top(), left()); }
            else { link(bottom(), left()); link(right(), top()); }
          } else {
            if (center) { link(bottom(), left()); link(right(), top()); }
            else { link(bottom(), right()); link(left(), top()); }
          }
        }
      }
    }
    // walk loops (raw kept so a crossing pair can fall back to unsimplified outlines)
    const loops = [], raws = [], seen = new Set();
    for (const start of adj.keys()) {
      if (seen.has(start)) continue;
      const loop = [];
      let prev = null, cur = start;
      while (cur !== undefined && !seen.has(cur)) {
        seen.add(cur); loop.push(pts.get(cur));
        const n = adj.get(cur);
        const nxt = n[0] !== prev ? n[0] : n[1];
        prev = cur; cur = nxt;
      }
      if (loop.length >= 3) { loops.push(safeLoop(loop, simplifyTol)); raws.push(loop); }
    }
    if (simplifyTol > 0 && loops.length > 1) for (const i of crossingLoops(loops)) loops[i] = cleanLoop(raws[i], 0);
    return loops;
  }
  function fieldGroups(f, bbox, h, tol = 0.025, minArea = 0.4) {
    return groupLoops(contour(f, bbox[0], bbox[1], bbox[2], bbox[3], h, tol), minArea);
  }

