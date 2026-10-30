  /* =================================================================
     v9: finish styles. One setting that restyles the edges of every plate (cars, signs, fun, simple,
     blank, refined). The default "refined" finish gives every raised edge a smooth multi-step bevel.
     ================================================================= */
  // steps: number of bevel steps; inset: total inward travel (mm); dz: bevel height (mm, scaled by relief);
  // frac: max share of a feature's height used by the bevel; curve: 1 = straight chamfer, >1 = rounded shoulder
  NP.FINISHES = {
    crisp: { label: "Crisp modern", note: "Sharp square edges, flat tops. Fastest to print.", base: null, relief: null },
    refined: { label: "Refined polish", note: "Smooth multi-step bevels on every edge. Polished look.", base: { steps: 3, inset: 0.9, dz: 0.75 }, relief: { steps: 3, inset: 0.42, dz: 0.5, frac: 0.45, curve: 1.5 } },
    soft: { label: "Soft rounded", note: "Pillowed, rounded tops that look molded and feel smooth.", base: { steps: 4, inset: 1.3, dz: 1.0 }, relief: { steps: 4, inset: 0.6, dz: 0.7, frac: 0.6, curve: 2.2 } },
    bold: { label: "Bold relief", note: "Taller lettering and features with polished bevels. Reads from across a room.", raise: 1.5, base: { steps: 3, inset: 0.9, dz: 0.75 }, relief: { steps: 3, inset: 0.5, dz: 0.6, frac: 0.4, curve: 1.5 } },
    enamel: { label: "Vintage enamel", note: "Two crisp terraced steps like a stamped enamel badge.", base: { steps: 2, inset: 1.2, dz: 0.8 }, relief: { steps: 2, inset: 0.55, dz: 0.55, frac: 0.5, curve: 1 } },
    classic: { label: "Classic chamfer", note: "One simple bevel (the earlier look).", base: { steps: 1, inset: 0.6, dz: 0.6 }, relief: { steps: 1, inset: 0.3, dz: 0.45, frac: 0.4, curve: 1 } },
    sleek: { label: "Sleek low-profile", note: "Thin, minimal relief with a fine bevel. Modern and understated.", raise: 0.65, base: { steps: 2, inset: 0.6, dz: 0.5 }, relief: { steps: 2, inset: 0.25, dz: 0.3, frac: 0.45, curve: 1.3 } },
  };
  NP.FINISH_KEYS = Object.keys(NP.FINISHES);

  // every bevel step samples the same grid, so the distance field is computed once per point
  const gridCache = (f) => { const m = new Map(); return (x, y) => { const key = Math.round(x * 1000) * 1e7 + Math.round(y * 1000); let v = m.get(key); if (v === undefined) { v = f(x, y); m.set(key, v); } return v; }; };
  function finishPass(model, opts, F) {
    if (!F || (!F.base && !F.relief)) return;
    const T = opts.base, k = opts.raise / 1.2, h = opts.h;
    for (const p of model.parts) {
      const add = [];
      for (const s of p.slices) {
        if (s.noBevel || s.z0 < -1e-6) continue;
        // only bevel a top surface: skip a slice that has another slice of the same part sitting on it
        if (p.slices.some((q) => q !== s && Math.abs(q.z0 - s.z1) < 1e-4 && q.groups.length)) continue;
        const H = s.z1 - s.z0;
        const isBaseTop = p.slot === "base" && Math.abs(s.z1 - T) < 1e-6 && H > 1.0;
        const isLetters = p.slot === "letters" || s.text;
        const isRelief = s.z0 >= T - 1e-6 && H > 0.32 && !(!model.layered && p.slot === "panel");
        if (!isBaseTop && !isLetters && !isRelief) continue;
        const P = isBaseTop ? F.base : F.relief; if (!P) continue;
        if (isLetters && !(model.textHeight >= 6)) continue;
        let dz = isBaseTop ? Math.min(P.dz, H * 0.35) : Math.min(P.dz * k, H * P.frac);
        let inset = P.inset;
        if (isLetters && model.textHeight < 12) inset *= Math.max(0.55, model.textHeight / 12); // small text keeps its strokes
        if (dz < 0.12) continue;
        const bb = groupsBBox(s.groups); if (!bb) continue;
        const tf = gridCache(textField(s.groups, 2 + inset));
        const box = [bb[0] - 1, bb[1] - 1, bb[2] + 1, bb[3] + 1];
        const res = isBaseTop ? Math.max(h, 0.35) : Math.min(Math.max(h, 0.2), 0.25);
        const steps = [];
        for (let i = 1; i <= P.steps; i++) {
          const t = i / P.steps, ins = inset * Math.pow(t, P.curve || 1);
          const g = fieldGroups(S.offset(tf, -ins), box, res, 0.02, 0.2);
          if (!g.length) break;
          steps.push(g);
        }
        if (!steps.length) continue;
        const used = dz * (steps.length / P.steps), zc = s.z1 - used;
        steps.forEach((g, j) => add.push({ groups: g, z0: zc + (used * j) / steps.length, z1: zc + (used * (j + 1)) / steps.length, fin: true }));
        s.z1 = zc;
      }
      p.slices.push(...add);
    }
  }
  const buildV8 = NP.build;
  NP.build = function (o) {
    o = o || {};
    const key = NP.FINISHES[o.finish] ? o.finish : "crisp", F = NP.FINISHES[key];
    const o2 = Object.assign({}, o, { bevel: false });
    if (F.raise) o2.raise = (o.raise || 1.2) * F.raise;
    const m = buildV8(o2);
    if (o.bevel !== false) finishPass(m, m.opts, F);
    m.opts.bevel = o.bevel; m.opts.finish = key; m.finish = key;
    return m;
  };

  /* ---------------- more refined palettes */
  Object.assign(PALETTES, {
    plumsilver: { label: "Plum & silver", base: P("pro:dark-purple"), accent: P("pla:grey"), panel: P("pla:cold-white"), bold: P("pla:black"), letters: P("pla:cold-white"), chrome: P("pla:grey"), refined: true },
    graphitecopper: { label: "Graphite & copper", base: P("pro:dark-grey"), accent: P("pro:army-beige"), panel: P("pla:cream"), bold: P("pla:black"), letters: P("pro:white"), chrome: P("pro:army-beige"), refined: true },
    ivoryblack: { label: "Ivory & black", base: P("pla:natural"), accent: P("pla:black"), panel: P("pla:black"), bold: P("pla:black"), letters: P("pla:black"), chrome: P("pla:black"), refined: true },
    sandnavy: { label: "Sand & navy", base: P("pla:natural"), accent: P("pla:beige"), panel: P("pla:blue"), bold: P("pla:blue"), letters: P("pla:blue"), chrome: P("pla:beige"), refined: true },
    walnutcream: { label: "Walnut & cream", base: P("pro:brown"), accent: P("pla:cream"), panel: P("pla:cream"), bold: P("pla:black"), letters: P("pla:cream"), chrome: P("pla:cream"), refined: true },
    oliveivory: { label: "Olive & ivory", base: P("pro:army-green"), accent: P("pla:natural"), panel: P("pla:natural"), bold: P("pla:black"), letters: P("pla:natural"), chrome: P("pla:natural"), refined: true },
  });
  NP.REFINED_PALETTES = Object.keys(PALETTES).filter((k) => PALETTES[k].refined);

  /* ---------------- refined ideas: three of the ten ideas for every non-car subject */
  const examplesV7 = NP.examplesFor;
  NP.examplesFor = function (sp) {
    const list = examplesV7(sp);
    const picks = { 0: "signature", 3: "monogram", 7: "sportline" }, RP = NP.REFINED_PALETTES;
    return list.map((ex, i) => {
      if (!picks[i] || NP.DESIGNS[ex.design].vehicle) return ex;
      const d = picks[i], pal = RP[((sp.key || "").length * 3 + i) % RP.length];
      return Object.assign({}, ex, { design: d, palette: pal, items: [], badge: "none", icon: d === "monogram" ? "none" : ex.icon || (sp.icons && sp.icons[0]) || "star", sub: d === "sportline" ? ex.sub : ex.sub && ex.sub.length < 14 ? ex.sub : "" });
    });
  };
  const readmeV8 = NP.readme;
  NP.readme = function (m, colors, info) {
    let txt = readmeV8(m, colors, info);
    const F = NP.FINISHES[m.finish || (m.opts && m.opts.finish)];
    if (F) {
      const fine = F.base || F.relief;
      const sec = `FINISH STYLE: ${F.label}\n${F.note}\n` + (fine ? `Tip: the smooth bevels are built from fine steps. Print at 0.12 to 0.16 mm layer height (or use Bambu Studio's adaptive layer height) for the smoothest polished edges. 0.20 mm still works, with slightly visible steps.\n` : `Tip: square edges print cleanly at any layer height; 0.20 mm is fine.\n`);
      const at = txt.lastIndexOf("Made with Nameplate Maker by Creative Lab Studios.");
      txt = at >= 0 ? txt.slice(0, at) + sec + "\n" + txt.slice(at) : txt + "\n\n" + sec;
    }
    return txt;
  };
