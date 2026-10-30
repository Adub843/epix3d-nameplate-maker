  /* =================================================================
     v6: start-from-blank plates and traced images
     ================================================================= */
  NP.BLANK_SHAPES = { rounded: "Rounded", rect: "Rectangle", oval: "Oval", circle: "Circle", shield: "Shield", hex: "Hexagon", banner: "Banner", arch: "Arch top", cloud: "Cloud", ticket: "Ticket", star: "Star" };
  function blankShape(kind, W, H) {
    const X = W / 2, Y = H / 2, m = Math.min(X, Y);
    switch (kind) {
      case "rect": return S.box(0, 0, X, Y, 1.2);
      case "oval": return S.ellipse(0, 0, X, Y);
      case "circle": return S.circle(0, 0, m);
      case "shield": return S.offset(S.poly([[-X + 3, Y - 3], [X - 3, Y - 3], [X - 3, -Y * 0.15], [0, -Y + 3], [-X + 3, -Y * 0.15]]), 3);
      case "hex": return S.offset(S.poly([[-X + 3 + Y * 0.5, Y - 3], [X - 3 - Y * 0.5, Y - 3], [X - 3, 0], [X - 3 - Y * 0.5, -Y + 3], [-X + 3 + Y * 0.5, -Y + 3], [-X + 3, 0]]), 3);
      case "banner": { const n = Math.min(X * 0.18, Y * 0.7); return S.offset(S.poly([[-X + 2, Y - 2], [X - 2, Y - 2], [X - 2 - n, 0], [X - 2, -Y + 2], [-X + 2, -Y + 2], [-X + 2 + n, 0]]), 2); }
      case "arch": { const ry = Math.min(H * 0.5, X * 0.6); return S.union(S.box(0, -ry / 2, X, Y - ry / 2, 3), S.ellipse(0, Y - ry, X, ry)); }
      case "cloud": { const b = Y * 0.42, pts = []; const n = Math.max(6, Math.round((2 * (W + H)) / (b * 1.6))); for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI; pts.push(S.circle((X - b) * Math.cos(a), (Y - b) * Math.sin(a), b)); } return S.union(S.ellipse(0, 0, X - b * 0.6, Y - b * 0.6), ...pts); }
      case "ticket": { const nr = Y * 0.28; return S.sub(S.box(0, 0, X, Y, 4), S.circle(-X, 0, nr), S.circle(X, 0, nr)); }
      case "star": return S.offset(S.star(0, -m * 0.06, m - 2, (m - 2) * 0.48, 5, Math.PI / 2), 2);
      default: return S.box(0, 0, X, Y, Math.min(10, m * 0.4));
    }
  }
  NP.blankShape = blankShape;

  /* image -> signed distance field. img: { w, h, labels: [0..n] row-major from the top, x, y, size (mm wide), thicken (mm) } */
  function imageLayerField(img, level) {
    const { w, h } = img, lab = img.labels, mm = img.size / w, N = w * h;
    const inside = new Uint8Array(N);
    for (let i = 0; i < N; i++) inside[i] = lab[i] >= level ? 1 : 0;
    const dist = (target) => { // two-pass chamfer distance (in pixels) to the nearest pixel whose inside === target
      const d = new Float32Array(N), INF = 1e6, D1 = 1, D2 = Math.SQRT2;
      for (let i = 0; i < N; i++) d[i] = inside[i] === target ? 0 : INF;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; let v = d[i];
        if (x > 0) v = Math.min(v, d[i - 1] + D1);
        if (y > 0) { v = Math.min(v, d[i - w] + D1); if (x > 0) v = Math.min(v, d[i - w - 1] + D2); if (x < w - 1) v = Math.min(v, d[i - w + 1] + D2); }
        d[i] = v;
      }
      for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
        const i = y * w + x; let v = d[i];
        if (x < w - 1) v = Math.min(v, d[i + 1] + D1);
        if (y < h - 1) { v = Math.min(v, d[i + w] + D1); if (x < w - 1) v = Math.min(v, d[i + w + 1] + D2); if (x > 0) v = Math.min(v, d[i + w - 1] + D2); }
        d[i] = v;
      }
      return d;
    };
    const dOut = dist(1), dIn = dist(0); // dOut: distance to nearest inside px; dIn: distance to nearest outside px
    const sd = new Float32Array(N);
    let any = false;
    for (let i = 0; i < N; i++) { sd[i] = inside[i] ? -(dIn[i] - 0.5) : dOut[i] - 0.5; if (inside[i]) any = true; }
    if (!any) return null;
    const x0 = img.x - img.size / 2, y1 = img.y + (h * mm) / 2, th = img.thicken || 0;
    const f = (x, y) => {
      const u = (x - x0) / mm - 0.5, v = (y1 - y) / mm - 0.5;
      if (u < -1 || v < -1 || u > w || v > h) {
        const cu = Math.max(0, Math.min(w - 1, u)), cv = Math.max(0, Math.min(h - 1, v));
        return (hyp(u - cu, v - cv) + 1) * mm;
      }
      const iu = Math.max(0, Math.min(w - 2, Math.floor(u))), iv = Math.max(0, Math.min(h - 2, Math.floor(v)));
      const fu = Math.max(0, Math.min(1, u - iu)), fv = Math.max(0, Math.min(1, v - iv));
      const a = sd[iv * w + iu], b = sd[iv * w + iu + 1], c = sd[(iv + 1) * w + iu], dd = sd[(iv + 1) * w + iu + 1];
      return ((a * (1 - fu) + b * fu) * (1 - fv) + (c * (1 - fu) + dd * fu) * fv) * mm - th;
    };
    return f;
  }
  NP.imageLayerField = imageLayerField;

  DESIGNS.blank = {
    label: "Blank", note: "Your own design", layered: true, blank: true, font: "round", itemSlot: "accent",
    slots: ["base", "accent", "img1", "img2", "img3", "letters", "bold"],
    labels: { base: "Plate", accent: "Border & items", letters: "Lettering", bold: "Second line", img1: "Image layer 1", img2: "Image layer 2", img3: "Image layer 3" },
    make(o) {
      const b = Object.assign({ shape: "rounded", border: true, borderW: 3, textX: 0, textY: 0, textSize: 0, subSize: 0, img: null }, o.blank || {});
      const W = o.width, H = o.height ? Math.max(20, Math.min(W * 1.2, o.height)) : Math.round(W * 0.4);
      const T = o.base, k = o.k;
      const shape = S.memo(blankShape(b.shape, W, H));
      const comps = [{ slot: "base", f: shape, z0: 0, z1: T }];
      const inset = b.border ? 2 + b.borderW : 0;
      if (b.border) comps.push(...NP.stepped("accent", S.inter(S.offset(shape, -2), (x, y) => -(shape(x, y) + 2 + b.borderW)), T, [[0, T + 0.8 * k], [0.45, T + 1.2 * k]], { minArea: 3 }));
      // image layers stack up: layer 2 sits on layer 1, layer 3 on layer 2
      let imageBox = null;
      if (b.img && b.img.labels && b.img.w > 1) {
        const im = b.img, mm = im.size / im.w;
        imageBox = [im.x - im.size / 2, im.y - (im.h * mm) / 2, im.x + im.size / 2, im.y + (im.h * mm) / 2];
        const n = Math.max(1, Math.min(3, im.levels || 1));
        for (let L = 1; L <= n; L++) {
          const f = imageLayerField(im, L); if (!f) continue;
          comps.push({ slot: "img" + L, f: S.inter(f, S.offset(shape, -(inset + 0.8))), z0: T, z1: T + (0.6 + 0.5 * L) * k, h: Math.max(0.2, Math.min(0.35, mm * 0.6)), minArea: Math.max(0.6, (im.minArea || 0.8)) });
        }
      }
      // lettering: name and optional second line, positioned freely
      const font = o.font || "round";
      const avail = { w: W - 2 * inset - 8, h: H - 2 * inset - 6 };
      const groups = [];
      let th = Infinity;
      // the widest box centred on (cx, cy) that stays inside the plate (and clear of the border)
      const room = (cx, cy, hh) => {
        const ok = (hw) => [cy - hh, cy, cy + hh].every((y) => shape(cx - hw, y) < -(inset + 3) && shape(cx + hw, y) < -(inset + 3));
        if (!ok(0.5)) return 0;
        let lo = 0.5, hi = W; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (ok(m)) lo = m; else hi = m; }
        return lo;
      };
      if (o.text && o.text.trim()) {
        const sub = (o.sub || "").trim();
        const probe = fitText(o.text, font, { cx: 0, cy: 0, w: 10000, h: 100 }, { track: 0.06 }), aspect = probe.h ? probe.w / probe.h : 4;
        const cap0 = b.textSize || Math.min(avail.h * (sub ? 0.42 : 0.55), 40);
        // the tallest lettering that fits here: try shorter boxes, which can run wider inside curved shapes
        let cap = cap0, hw = room(b.textX, b.textY, cap0 / 2), best = Math.min(cap0, (2 * hw) / aspect);
        for (let c = cap0 * 0.9; c > 3; c *= 0.9) {
          const r = room(b.textX, b.textY, c / 2), eff = Math.min(c, (2 * r) / aspect);
          if (eff > best + 0.05) { best = eff; cap = c; hw = r; }
        }
        const t = fitText(o.text, font, { cx: b.textX, cy: b.textY, w: Math.max(2, 2 * hw), h: cap }, { track: 0.06 });
        if (t.groups.length) { comps.push({ slot: "letters", groups: t.groups, z0: T, z1: T + 1.8 * k, isText: true }); groups.push(...t.groups); th = t.h; }
        if (sub) {
          const sh = b.subSize || Math.max(4, Math.min(cap * 0.38, 14));
          const sy = b.subY ?? (b.textY - Math.max(t.h || 0, Math.min(cap, t.h || cap)) / 2 - sh / 2 - 3);
          const sx = b.subX ?? b.textX;
          const s = fitText(sub, font, { cx: sx, cy: sy, w: Math.max(2, 2 * room(sx, sy, sh / 2)), h: sh }, { track: 0.1 });
          if (s.groups.length) { comps.push({ slot: "bold", groups: s.groups, z0: T, z1: T + 1.4 * k, isText: true }); groups.push(...s.groups); }
        }
      }
      return { components: comps, shape, bbox: [-W / 2, -H / 2, W / 2, H / 2], textGroups: groups, textHeight: th, avoid: imageBox ? S.box((imageBox[0] + imageBox[2]) / 2, (imageBox[1] + imageBox[3]) / 2, (imageBox[2] - imageBox[0]) / 2, (imageBox[3] - imageBox[1]) / 2) : S.EMPTY, imageBox };
    },
  };
