  /* =================================================================
     v6: Polymaker filament chart, layered compositor, chamfered relief,
     README, shaded previews
     ================================================================= */
  // Hex values are the swatch colours Polymaker publishes on its store pages (shop.polymaker.com).
  const PM_SPECS = {
    pla: {
      line: "PolyLite PLA", short: "PLA",
      nozzle: "190-230 C", nozzleUse: 210, bed: "25-60 C", bedUse: 55, speed: "40-60 mm/s", fan: "On (100%)",
      retractDD: "1 mm at 20 mm/s", retractBowden: "3 mm at 40 mm/s", dry: "55 C for 6 h (only if the spool has absorbed moisture)",
    },
    pro: {
      line: "PolyLite PLA Pro", short: "PLA Pro",
      nozzle: "190-220 C", nozzleUse: 210, bed: "30-60 C", bedUse: 55, speed: "50-200 mm/s (data-sheet max 70 mm/s; start around 60)", fan: "On (100%)",
      retractDD: "1-3 mm at 20-40 mm/s", retractBowden: "3 mm at 60 mm/s", dry: "55 C for 6 h (only if the spool has absorbed moisture)",
    },
  };
  const PM_RAW = {
    pla: [["Black", "#030305"], ["White", "#DDD7D3"], ["Cold White", "#EAECF5"], ["Natural", "#DFD3C3"], ["Cream", "#EED1A8"], ["Beige", "#C2AB72"],
      ["Grey", "#8B8E96"], ["Steel Grey", "#5D5E63"], ["Dark Grey", "#6E8393"], ["Red", "#D90102"], ["Wine Red", "#D60212"], ["Magenta", "#F24574"],
      ["Pink", "#F1A1AF"], ["Orange", "#F36201"], ["Yellow", "#F3AA01"], ["Lemon Yellow", "#EED230"], ["Lime Green", "#D5D701"], ["Olive Green", "#948902"],
      ["Green", "#30A45F"], ["Jungle Green", "#4E742D"], ["Dark Gray Green", "#4C5F46"], ["Polymaker Teal", "#48B9C2"], ["Aqua Blue", "#5EBDDB"],
      ["Azure Blue", "#0061D5"], ["Stone Blue", "#487BA2"], ["Blue", "#013178"], ["Purple", "#6447A5"], ["Brown", "#4B2A17"], ["Olive Brown", "#A79565"]],
    pro: [["Black", "#161619"], ["White", "#EBECED"], ["Cold White", "#D6D5DC"], ["Grey", "#8D8E93"], ["Dark Grey", "#545859"], ["Red", "#ED2F20"],
      ["Light Red", "#DC605A"], ["Magenta", "#EF2F64"], ["Pink", "#EE92AA"], ["Orange", "#FE8E1B"], ["Yellow", "#F0AB01"], ["Light Yellow", "#F4DA78"],
      ["Army Beige", "#C28D5E"], ["Flat Dark Earth", "#90785E"], ["Brown", "#634232"], ["Army Green", "#665A30"], ["Light Green", "#C0DDA3"], ["Green", "#31A45F"],
      ["Polymaker Teal", "#5FC7CF"], ["Blue-Green", "#022B33"], ["Light Blue", "#A8D4E8"], ["Blue", "#013276"], ["Purple", "#6547A5"], ["Dark Purple", "#2C1C30"]],
  };
  const PM = [];
  for (const line of ["pla", "pro"]) for (const [name, hex] of PM_RAW[line]) PM.push({ id: line + ":" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), line, name, hex: hex.toUpperCase(), product: PM_SPECS[line].line });
  NP.POLYMAKER = PM;
  NP.PM_SPECS = PM_SPECS;
  const pmById = {}; for (const c of PM) pmById[c.id] = c;
  NP.pmByHex = (hex) => PM.find((c) => c.hex === String(hex || "").toUpperCase()) || null;
  NP.pm = (id) => pmById[id];
  const P = (id) => { const c = pmById[id]; if (!c) throw new Error("no polymaker colour " + id); return c.hex; };
  // nearest chart colour (CIE76 in Lab) for anything that is not already a chart colour
  function lab(hex) {
    const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92; });
    const X = (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047, Y = c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722, Z = (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883;
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  }
  NP.nearestPM = (hex, line, avoid = []) => {
    const L = lab(hex); let best = null, bd = Infinity;
    for (const c of PM) {
      if (line && c.line !== line) continue;
      if (avoid.includes(c.hex)) continue;
      const M = lab(c.hex), d = hyp(L[0] - M[0], L[1] - M[1], L[2] - M[2]);
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  };
  NP.isDark = (hex) => lab(hex)[0] < 45;

  // every palette now uses real Polymaker colours (hand-picked, PLA unless PLA Pro has a better match)
  const PMPAL = {
    pop: ["pla:azure-blue", "pla:lemon-yellow", "pla:cold-white", "pla:magenta", "pla:cold-white"],
    hoops: ["pla:orange", "pla:yellow", "pla:cold-white", "pla:black", "pla:cold-white"],
    gameday: ["pla:green", "pla:lemon-yellow", "pla:cold-white", "pla:blue", "pla:cold-white"],
    dugout: ["pla:blue", "pla:red", "pla:cold-white", "pla:red", "pla:cold-white"],
    ice: ["pla:blue", "pla:aqua-blue", "pla:cold-white", "pla:blue", "pla:cold-white"],
    citrus: ["pla:polymaker-teal", "pla:lime-green", "pla:cold-white", "pla:orange", "pla:cold-white"],
    fairway: ["pla:jungle-green", "pro:light-yellow", "pla:cold-white", "pla:dark-gray-green", "pla:cold-white"],
    beach: ["pro:orange", "pla:polymaker-teal", "pla:cold-white", "pla:blue", "pla:cold-white"],
    neon: ["pla:purple", "pro:polymaker-teal", "pla:cold-white", "pla:magenta", "pla:cold-white"],
    cinema: ["pla:red", "pla:yellow", "pla:cold-white", "pla:black", "pla:cold-white"],
    retro: ["pla:azure-blue", "pla:yellow", "pla:cold-white", "pla:magenta", "pla:cold-white"],
    garage: ["pla:black", "pla:yellow", "pla:cold-white", "pla:red", "pla:cold-white"],
    stage: ["pla:purple", "pla:yellow", "pla:cold-white", "pla:magenta", "pla:cold-white"],
    lake: ["pla:stone-blue", "pro:light-blue", "pla:cold-white", "pla:orange", "pla:cold-white"],
    blaze: ["pla:jungle-green", "pla:orange", "pla:cream", "pla:brown", "pla:cream"],
    taproom: ["pro:blue-green", "pla:yellow", "pla:cold-white", "pla:orange", "pla:cold-white"],
    victory: ["pla:red", "pla:yellow", "pla:cold-white", "pla:blue", "pla:cold-white"],
    candy: ["pla:pink", "pro:light-blue", "pla:cold-white", "pla:purple", "pla:cold-white"],
  };
  for (const [k, ids] of Object.entries(PMPAL)) if (PALETTES[k]) Object.assign(PALETTES[k], { base: P(ids[0]), accent: P(ids[1]), panel: P(ids[2]), bold: P(ids[3]), letters: P(ids[4]) });
  // palettes added by later sections: snap each colour to its nearest chart colour, keeping a palette's colours distinct where they were distinct
  NP.snapPalettes = function () {
    for (const p of Object.values(PALETTES)) {
      const used = [];
      for (const s of ["base", "accent", "panel", "bold", "letters"]) {
        if (NP.pmByHex(p[s])) { used.push(p[s].toUpperCase()); continue; }
        const same = ["base", "accent", "panel", "bold", "letters"].find((t) => t !== s && p[t] && p[t].toUpperCase() === (p["_" + s] || p[s]).toUpperCase() && used.includes(p[t].toUpperCase()));
        p["_" + s] = p[s];
        const c = NP.nearestPM(p[s], null, same ? [] : used.filter((h) => h !== "#EAECF5"));
        p[s] = c.hex; used.push(c.hex);
      }
    }
  };
  // extra slots used by the vehicle and blank styles
  Object.assign(NP.SLOTS, { chrome: "Chrome", grille: "Grille", lights: "Lights", tires: "Tires", glass: "Glass", img1: "Image layer 1", img2: "Image layer 2", img3: "Image layer 3" });
  NP.slotDefaults = (pal) => {
    const p = PALETTES[pal] || PALETTES.pop;
    return { base: p.base, accent: p.accent, panel: p.panel, bold: p.bold, letters: p.letters, raised: p.accent,
      chrome: P("pla:grey"), grille: P("pla:black"), lights: P("pla:cold-white"), tires: P("pla:black"), glass: p.glass || P("pla:stone-blue"), signals: P("pla:cold-white"), plate: P("pla:cold-white"),
      img1: p.bold, img2: p.accent, img3: p.letters };
  };

  /* ---------------- bounding boxes and fields of contoured groups */
  function groupsBBox(groups) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const g of groups) for (const p of g.outer) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    return isFinite(x0) ? [x0, y0, x1, y1] : null;
  }
  NP.groupsBBox = groupsBBox;
  function fieldBBox(f, bb, step = 2.5) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let y = bb[1]; y <= bb[3] + 1e-9; y += step) for (let x = bb[0]; x <= bb[2] + 1e-9; x += step) {
      if (f(x, y) < step) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (!isFinite(x0)) return null;
    return [Math.max(bb[0], x0 - step * 1.6), Math.max(bb[1], y0 - step * 1.6), Math.min(bb[2], x1 + step * 1.6), Math.min(bb[3], y1 + step * 1.6)];
  }
  const boxHit = (a, b) => a && b && a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

  /* ---------------- layered compositor
     components: { slot, f | groups, z0, z1, h? } in paint order (later = on top where they overlap in
     both plan and height). Every slice it emits is disjoint from every other part's slices, so each
     colour is a clean, separate solid. cuts: [{ f, z }] pockets removed from everything above z. */
  NP.composite = function (components, bb, h, cuts = []) {
    const comps = components.filter((c) => c && c.z1 > c.z0 + 1e-6);
    for (const c of comps) {
      if (c.groups) { c.bb = groupsBBox(c.groups); c.fieldOf = () => c._f || (c._f = S.memo(textField(c.groups, 4))); }
      else { c.bb = fieldBBox(c.f, bb); const fb = c.bb ? S.memo(S.bounded(c.f, c.bb[0], c.bb[1], c.bb[2], c.bb[3])) : S.EMPTY; c.fieldOf = () => fb; }
    }
    // coarse occupancy (cells clearly inside each solid) so components that only share a bounding box,
    // or merely touch, do not split each other into extra slices
    const g = 0.9, gx0 = bb[0], gy0 = bb[1], gnx = Math.ceil((bb[2] - bb[0]) / g) + 1;
    for (const c of comps) {
      if (!c.bb) continue;
      const f = c.fieldOf(), cells = [];
      const i0 = Math.floor((c.bb[0] - gx0) / g), i1 = Math.ceil((c.bb[2] - gx0) / g), j0 = Math.floor((c.bb[1] - gy0) / g), j1 = Math.ceil((c.bb[3] - gy0) / g);
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (f(gx0 + i * g, gy0 + j * g) < -0.2) cells.push(j * gnx + i);
      c.occ = new Set(cells);
      if (!cells.length) c.bb = null;
    }
    const touches = (a, b) => { const [s, l] = a.occ.size < b.occ.size ? [a.occ, b.occ] : [b.occ, a.occ]; for (const v of s) if (l.has(v)) return true; return false; };
    const parts = [];
    const part = (slot, label) => { let p = parts.find((q) => q.slot === slot); if (!p) { p = { slot, label: label || NP.SLOTS[slot] || slot, slices: [] }; parts.push(p); } return p; };
    comps.forEach((c, i) => {
      if (!c.bb) return;
      const hi = comps.slice(i + 1).filter((d) => d.bb && d.z0 < c.z1 - 1e-6 && d.z1 > c.z0 + 1e-6 && boxHit(c.bb, d.bb) && touches(c, d));
      const cutsHere = cuts.filter((k) => k.z < c.z1 - 1e-6);
      const zs = [c.z0, c.z1];
      for (const d of hi) { if (d.z0 > c.z0 && d.z0 < c.z1) zs.push(d.z0); if (d.z1 > c.z0 && d.z1 < c.z1) zs.push(d.z1); }
      for (const k of cutsHere) if (k.z > c.z0 && k.z < c.z1) zs.push(k.z);
      const Z = [...new Set(zs.map((z) => Math.round(z * 1e4) / 1e4))].sort((a, b) => a - b);
      const runs = [];
      for (let j = 0; j < Z.length - 1; j++) {
        const a = Z[j], b = Z[j + 1];
        const act = hi.filter((d) => d.z0 <= a + 1e-6 && d.z1 >= b - 1e-6);
        const ck = cutsHere.filter((k) => b > k.z + 1e-6);
        const key = act.map((d) => comps.indexOf(d)).join(",") + "|" + ck.map((k) => cuts.indexOf(k)).join(",");
        const last = runs[runs.length - 1];
        if (last && last.key === key) last.b = b; else runs.push({ a, b, key, act, ck });
      }
      for (const r of runs) {
        let groups;
        if (c.groups && !r.act.length && !r.ck.length) groups = c.groups;
        else {
          const f = S.sub(c.fieldOf(), ...r.act.map((d) => d.fieldOf()), ...r.ck.map((k) => k.f));
          const box = [c.bb[0] - 1, c.bb[1] - 1, c.bb[2] + 1, c.bb[3] + 1];
          groups = fieldGroups(f, box, c.h || h, 0.025, c.minArea ?? 0.4);
        }
        if (groups.length) part(c.slot, c.label).slices.push({ groups, z0: r.a, z1: r.b });
      }
    });
    return parts;
  };
  // a solid with stepped (chamfered) top edges: [[inset, zTop], ...] from the bottom step up
  NP.stepped = function (slot, f, z0, steps, extra = {}) {
    const out = []; let z = z0;
    for (const [inset, zt] of steps) { out.push(Object.assign({ slot, f: inset ? S.offset(f, -inset) : f, z0: z, z1: zt }, extra)); z = zt; }
    return out;
  };

  /* ---------------- chamfer pass for the original styles: soft top edges on the base and lettering */
  function chamferParts(model, opts) {
    const T = opts.base, k = opts.raise / 1.2, h = opts.h;
    for (const p of model.parts) {
      const add = [];
      for (const s of p.slices) {
        if (s.noBevel) continue;
        const isBaseTop = p.slot === "base" && Math.abs(s.z1 - T) < 1e-6 && s.z1 - s.z0 > 1.0;
        const isLetters = p.slot === "letters" || s.text;
        // v8: every raised feature of the classic and fun styles gets a soft top edge, not just the lettering
        const isRelief = !model.layered && p.slot !== "base" && p.slot !== "panel" && !isLetters && s.z0 >= T - 1e-6 && s.z1 - s.z0 > 0.5;
        if (!isBaseTop && !isLetters && !isRelief) continue;
        const dz = isBaseTop ? 0.6 : Math.min(0.45 * k, (s.z1 - s.z0) * 0.4);
        const inset = isBaseTop ? 0.6 : isRelief ? 0.32 : 0.28;
        if (isLetters && !(model.textHeight >= 7)) continue;
        const bb = groupsBBox(s.groups); if (!bb) continue;
        const tf = textField(s.groups, 2);
        const top = fieldGroups(S.offset(tf, -inset), [bb[0] - 1, bb[1] - 1, bb[2] + 1, bb[3] + 1], isBaseTop ? Math.max(h, 0.3) : Math.min(h, 0.2), 0.02, 0.2);
        if (!top.length) continue;
        const zc = s.z1 - dz;
        add.push({ groups: top, z0: zc, z1: s.z1 });
        s.z1 = zc;
      }
      p.slices.push(...add);
    }
  }
  const buildV5 = NP.build;
  NP.build = function (o) {
    const D = DESIGNS[(o && o.design) || "classic"];
    if (D && D.layered) return buildLayered(o, D);
    const m = buildV5(o);
    if (o.bevel !== false) chamferParts(m, m.opts);
    m.labels = {};
    return m;
  };

  /* ---------------- layered build (vehicle and blank styles) */
  function buildLayered(o, D) {
    const opts = Object.assign({ width: 180, base: 3, raise: 1.2, h: 0.25, icon: "none", text: "NAME", sub: "", items: [], features: {} }, o);
    if (opts.upper !== false) { opts.text = opts.text.toUpperCase(); opts.sub = (opts.sub || "").toUpperCase(); }
    if (!opts.font || opts.font === "auto") delete opts.font;
    opts.k = opts.raise / 1.2;
    const d = D.make(opts);
    const bb = [d.bbox[0] - 4, d.bbox[1] - 4, d.bbox[2] + 4, d.bbox[3] + 4];
    const T = opts.base, k = opts.k;
    // toolbox items: raised (on top) or cut in (pockets in the base and everything above it)
    const textAll = d.textGroups || [];
    const tfAll = textAll.length ? textField(textAll, 22) : () => 22;
    const avoid = S.union(S.offset(tfAll, 1.4), d.avoid || S.EMPTY);
    const shapeF = S.memo(d.shape);
    const spotList = [];
    for (let y = bb[1] + 6; y < bb[3]; y += 5) for (let x = bb[0] + 6; x < bb[2]; x += 5) if (shapeF(x, y) < -8 && avoid(x, y) > 7 && (!d.free || d.free(x, y) < -3)) spotList.push([Math.round(x), Math.round(y)]);
    const items = (opts.items || []).filter((it) => I[it.key]).map((it) => Object.assign({}, it));
    for (const it of items) {
      if (it.x != null) continue;
      const placed0 = items.filter((q) => q.x != null);
      let best = null, bdist = -Infinity;
      for (const s of spotList) {
        const dd = placed0.length ? Math.min(...placed0.map((q) => hyp(q.x - s[0], q.y - s[1]))) : s[0] * 0.01 - Math.abs(s[1]) * 0.002;
        if (dd > bdist) { bdist = dd; best = s; }
      }
      if (best) { it.x = best[0]; it.y = best[1]; } else { it.x = (bb[0] + bb[2]) / 2; it.y = (bb[1] + bb[3]) / 2; }
    }
    const placed = (it) => iconPlaced(it.key, it.x, it.y, it.size, ((it.rot || 0) * Math.PI) / 180);
    const comps = d.components.slice();
    const textComps = comps.filter((c) => c.isText);
    const rest = comps.filter((c) => !c.isText);
    const itemComps = items.filter((it) => it.mode !== "cut").map((it) => ({ slot: it.slot && NP.SLOTS[it.slot] ? it.slot : (D.itemSlot || "accent"),
      f: S.inter(S.sub(placed(it), S.offset(tfAll, 1.2)), S.offset(shapeF, -0.8)), z0: T, z1: T + (D.itemTop || 1.6) * k, h: opts.h * 0.8 }));
    const cutsF = items.filter((it) => it.mode === "cut").map((it) => S.sub(S.inter(placed(it), S.offset(shapeF, -1.6)), S.offset(tfAll, 1.2)));
    const cd = Math.min(1.0, T - 0.8);
    const cuts = cutsF.length ? [{ f: S.memo(S.union(...cutsF)), z: T - cd }] : [];
    const parts = NP.composite(rest.concat(itemComps, textComps), bb, opts.h, cuts);
    const labels = D.labels || {};
    for (const p of parts) if (labels[p.slot]) p.label = labels[p.slot];
    const order = D.slots || parts.map((p) => p.slot);
    parts.sort((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot));
    const model = { parts, opts, textHeight: d.textHeight || Infinity, bbox: bb, fun: true, layered: true, med: null, spots: spotList, items, labels, imageBox: d.imageBox || null, textBox: groupsBBox(d.textGroups || []), partBoxes: d.partBoxes || null, partInfo: d.partInfo || null, meta: d.meta || null };
    if (o.bevel !== false) chamferParts(model, opts);
    return model;
  }
  NP.buildLayered = buildLayered;

  // name + optional second line fitted into a box; returns groups and the letter height
  NP.nameBlock = function (o, font, box, opts = {}) {
    const sub = (o.sub || "").trim();
    if (!sub) { const t = fitText(o.text, font, box, opts); return { groups: t.groups, h: t.h, list: [t] }; }
    const name = fitText(o.text, font, { cx: box.cx, cy: 0, w: box.w, h: box.h * 0.66 }, opts);
    const second = fitText(sub, opts.subFont || font, { cx: box.cx, cy: 0, w: box.w * 0.9, h: Math.min(box.h * 0.24, Math.max(name.h, 1) * 0.46) }, { track: 0.1 });
    const gap = Math.max(1.4, box.h * 0.07), total = name.h + gap + second.h;
    const a = shiftGroups(name, box.cy + total / 2 - name.h / 2), b = shiftGroups(second, box.cy - total / 2 + second.h / 2);
    return { groups: a.groups.concat(b.groups), h: name.h, list: [a, b] };
  };

  /* ---------------- filament plan, README */
  const buildFilamentPlan = NP.filamentPlan;
  NP.filamentPlan = function (model, colors) {
    const r = buildFilamentPlan(model, colors);
    for (const p of r.plan) { const pt = model.parts.find((q) => q.slot === p.slot); if (pt) p.label = pt.label; }
    return r;
  };
  NP.readme = function (model, colors, info = {}) {
    const meshes = NP.meshes(model);
    const { plan, colors: fil } = NP.filamentPlan(model, colors);
    const [x0, y0, x1, y1] = model.bbox;
    const top = Math.max(...model.parts.flatMap((p) => p.slices.map((s) => s.z1)));
    const W = x1 - x0 - 8, H = y1 - y0 - 8, T = model.opts.base;
    const lines = [];
    const rule = "-".repeat(64);
    const vol = (slot) => { const c = NP.checkMesh(meshes[slot]); return c.volume; };
    const used = new Set();
    lines.push(`${info.title || "Nameplate"}`, rule);
    lines.push(`Style:        ${info.style || ""}`);
    lines.push(`File:         ${info.file || ""}`);
    lines.push(`Overall size: ${W.toFixed(0)} x ${H.toFixed(0)} mm, ${top.toFixed(1)} mm tall (base ${T.toFixed(1)} mm)`);
    if (isFinite(model.textHeight)) lines.push(`Letter height: ${model.textHeight.toFixed(1)} mm`);
    lines.push("", "FILAMENTS (Polymaker)", rule);
    fil.forEach((hex, i) => {
      const c = NP.pmByHex(hex);
      if (c) used.add(c.line);
      const slots = plan.filter((p) => p.filament === i + 1);
      const grams = slots.reduce((g, p) => g + vol(p.slot) / 1000 * 1.24, 0);
      lines.push(`Slot ${i + 1}: ${c ? `${c.product} - ${c.name}` : `Custom colour ${hex} (not a Polymaker colour)`}  [${hex}]`);
      lines.push(`        parts: ${slots.map((p) => p.label).join(", ")}   (~${grams.toFixed(1)} g if printed solid)`);
    });
    lines.push("", "Load the filaments into your AMS / tool changer in the slot order above.");
    lines.push("The Bambu Studio 3MF opens with every part already assigned to these slots.");
    lines.push("Standard 3MF (Prusa, Orca, Cura): assign each part to its filament in the object list.");
    if (!model.fun) lines.push(`Single-extruder printers: one filament swap (M600 / pause) at ${T.toFixed(1)} mm.`);
    lines.push("", "POLYMAKER'S RECOMMENDED SETTINGS", rule);
    const lns = used.size ? [...used] : ["pla"];
    for (const l of lns) {
      const s = PM_SPECS[l];
      lines.push(`${s.line}`);
      lines.push(`  Nozzle temperature   ${s.nozzle}   (use ${s.nozzleUse} C)`);
      lines.push(`  Bed temperature      ${s.bed}   (use ${s.bedUse} C)`);
      lines.push(`  Print speed          ${s.speed}`);
      lines.push(`  Part cooling fan     ${s.fan}`);
      lines.push(`  Retraction           direct drive ${s.retractDD}; Bowden ${s.retractBowden}`);
      lines.push(`  Drying               ${s.dry}`);
    }
    if (lns.length > 1) lines.push("  Mixed PLA and PLA Pro: print both at 210 C nozzle / 55 C bed, inside both ranges.");
    lines.push("", "SLICER SETTINGS FOR THIS NAMEPLATE", rule);
    lines.push("  Filament profile   Polymaker PolyLite PLA / PLA Pro if your slicer lists it, otherwise Generic PLA with the temperatures above");
    lines.push("  Nozzle             0.4 mm");
    lines.push(`  Layer height       0.2 mm (0.12 mm gives crisper letters${isFinite(model.textHeight) && model.textHeight < 8 ? " and is recommended for this plate" : ""})`);
    lines.push("  First layer        0.2 mm, 20-30 mm/s");
    lines.push("  Walls              3          Top layers  5          Bottom layers  4");
    lines.push("  Infill             15% gyroid or grid");
    lines.push("  Supports           none (prints flat, face up)");
    lines.push("  Multi-color        prime/wipe tower on; Bambu Studio flushing volumes at default");
    lines.push("  Optional           ironing on the top surface for a smooth finish on the lettering");
    lines.push("  Plate              textured or smooth PEI, cleaned with dish soap; glue stick not needed");
    lines.push("", "Mounting: 3M Command strips or double-sided foam tape on the back. Colours on screen are");
    lines.push("Polymaker's published swatch values; real filament can look slightly different.");
    lines.push("", "Made with the Charleston3D Nameplate Maker.");
    return lines.join("\r\n") + "\r\n";
  };

  /* ---------------- shaded SVG previews: soft drop shadow under raised parts, light rim on top */
  let svgSeq = 0;
  NP.toSVG = function (model, colors, opts = {}) {
    const [x0, y0, x1, y1] = model.bbox;
    const sl = [];
    for (const p of model.parts) for (const s of p.slices) sl.push({ slot: p.slot, s });
    sl.sort((a, b) => a.s.z1 - b.s.z1 || a.s.z0 - b.s.z0);
    const zb = model.opts.base;
    const base = model.parts.find((p) => p.slot === "base");
    const shadow = base && opts.shadow !== false && base.slices[0] ? `<path d="${pathOf(base.slices[0].groups)}" fill="rgba(0,0,0,.22)" fill-rule="evenodd" transform="translate(0.9 1.4)"/>` : "";
    const fid = "npds" + (++svgSeq) + Math.random().toString(36).slice(2, 7);
    const defs = `<defs><filter id="${fid}" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0.35" dy="0.55" stdDeviation="0.35" flood-color="#000" flood-opacity="0.38"/></filter></defs>`;
    // raised parts share one drop-shadow group (one filter pass instead of one per path: much faster to draw)
    let flat = "", raisedS = "";
    for (const { slot, s } of sl) {
      const d = pathOf(s.groups); if (!d) continue;
      const el = `<path data-slot="${slot}" d="${d}" fill="${colors[slot] || "#888"}" fill-rule="evenodd" stroke="rgba(0,0,0,.28)" stroke-width="0.22"/>`;
      if (s.z1 > zb + 0.05 && s.z0 >= zb - 0.05 && opts.flat !== true) raisedS += el; else flat += el;
    }
    const body = flat + (raisedS ? `<g filter="url(#${fid})">${raisedS}</g>` : "");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${-y1} ${x1 - x0} ${y1 - y0}" width="${opts.width || "100%"}" ${opts.height ? `height="${opts.height}"` : ""}>` + defs + shadow + body + `</svg>`;
  };
