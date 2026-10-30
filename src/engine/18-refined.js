  /* =================================================================
     v9 (preview): refined family. Simple, elegant, polished: generous
     margins, one strong lettering line, crisp multi-step bevels that read as
     smooth ramps, rounded sturdy rims, at most three colours plus metal.
     ================================================================= */
  // a smooth chamfer: n fine steps from z0 to z1, each inset a little more (reads as a polished ramp)
  const ramp = (slot, f, z0, z1, depth, inset, n = 4, extra = {}) => {
    const out = [], flat = z1 - depth;
    out.push(Object.assign({ slot, f, z0, z1: flat }, extra));
    for (let i = 1; i <= n; i++) out.push(Object.assign({ slot, f: S.offset(f, -(inset * i) / n), z0: flat + (depth * (i - 1)) / n, z1: flat + (depth * i) / n }, extra));
    return out;
  };
  const textRamp = (slot, groups, z0, z1, depth, inset, n = 3) => {
    const tf = textField(groups, 3);
    const out = [{ slot, groups, z0, z1: z1 - depth, isText: true }];
    for (let i = 1; i <= n; i++) out.push({ slot, f: S.offset(tf, -(inset * i) / n), z0: z1 - depth + (depth * (i - 1)) / n, z1: z1 - depth + (depth * i) / n, h: 0.16, isText: true, minArea: 0.15 });
    return out;
  };
  const REF_SLOTS = ["base", "accent", "letters", "chrome"];
  const refDesign = (label, note, labels, font, make) => ({ label, note, layered: true, refined: true, font, slots: REF_SLOTS, labels, itemSlot: "accent", make });
  const roundRim = (shape, w, T, top) => ramp("accent", S.inter(shape, (x, y) => -(shape(x, y) + w)), T, top, (top - T) * 0.55, Math.min(1.2, w * 0.4), 4);

  // Signature: rounded plate, polished rim, one engraved-look keyline, centred name with a fine bevel
  DESIGNS.signature = refDesign("Signature", "Refined & simple", { base: "Plate", accent: "Rim & keyline", letters: "Lettering", chrome: "Medallion" }, "varsity", (o) => {
    const W = o.width, H = hgt(o, W * (o.sub ? 0.34 : 0.29)), X = W / 2, Y = H / 2, T = o.base, k = o.k;
    const shape = S.memo(S.box(0, 0, X, Y, Math.min(Y * 0.42, 14)));
    const comps = [{ slot: "base", f: shape, z0: 0, z1: T }];
    const rim = Math.max(3.2, Math.min(5, H * 0.075));
    comps.push(...roundRim(shape, rim, T, T + 1.3 * k));
    comps.push(...ramp("accent", S.shell(S.offset(shape, -(rim + 2.6)), 0.7), T, T + 0.55 * k, 0.2 * k, 0.15, 2));
    const hasIcon = o.icon && o.icon !== "none" && I[o.icon];
    const R = Math.min(Y - rim - 5, W * 0.11), ix = -X + rim + 6 + R;
    if (hasIcon) {
      comps.push(...ramp("chrome", S.circle(ix, 0, R), T, T + 1.1 * k, 0.5 * k, 0.9, 4));
      comps.push(...ramp("base", S.xf(I[o.icon](), ix, 0, R * 0.62), T + 1.1 * k - 0.01, T + 1.6 * k, 0.25 * k, 0.25, 2, { h: 0.18 }));
    }
    const tx0 = hasIcon ? ix + R + 6 : -X + rim + 7, tx1 = X - rim - 7;
    const nb = NP.nameBlock(o, o.font || "varsity", { cx: (tx0 + tx1) / 2, cy: 0, w: tx1 - tx0, h: H - 2 * rim - 14 }, { track: 0.09 });
    comps.push(...textRamp("letters", nb.groups, T, T + 1.7 * k, 0.55 * k, 0.45));
    return { components: comps, shape, bbox: [-X, -Y, X, Y], textGroups: nb.groups, textHeight: nb.h || Infinity, avoid: hasIcon ? S.circle(ix, 0, R + 2) : S.EMPTY };
  });

  // Monogram: soft oval, initial set in a polished medallion, name beside a hairline rule
  DESIGNS.monogram = refDesign("Monogram", "Initial & name", { base: "Plate", accent: "Rim & rule", letters: "Lettering", chrome: "Medallion" }, "varsity", (o) => {
    const W = o.width, H = hgt(o, W * 0.34), X = W / 2, Y = H / 2, T = o.base, k = o.k;
    const shape = S.memo(S.box(0, 0, X, Y, Y * 0.95));
    const comps = [{ slot: "base", f: shape, z0: 0, z1: T }];
    const rim = Math.max(3, H * 0.07);
    comps.push(...roundRim(shape, rim, T, T + 1.3 * k));
    const R = Y - rim - 4, mx = -X + rim + 5 + R;
    comps.push(...ramp("chrome", S.circle(mx, 0, R), T, T + 1.0 * k, 0.45 * k, 0.9, 4));
    comps.push(...ramp("accent", S.shell(S.circle(mx, 0, R - 2.4), 0.7), T + 1.0 * k - 0.01, T + 1.25 * k, 0.12 * k, 0.12, 1));
    const ch = ((o.text || "N").replace(/[^A-Za-z0-9]/g, "")[0] || "N").toUpperCase();
    const ini = fitText(ch, "varsity", { cx: mx, cy: 0, w: R * 1.2, h: R * 1.15 });
    const iniComps = textRamp("base", ini.groups, T + 1.0 * k - 0.01, T + 1.8 * k, 0.4 * k, 0.4);
    comps.push(...iniComps);
    const rx = mx + R + 5;
    comps.push({ slot: "accent", f: S.box(rx, 0, 0.45, Y - rim - 7, 0.2), z0: T, z1: T + 0.6 * k });
    const tx0 = rx + 6, tx1 = X - rim - 9;
    const nb = NP.nameBlock(o, o.font || "varsity", { cx: (tx0 + tx1) / 2, cy: 0, w: tx1 - tx0, h: H - 2 * rim - 12 }, { track: 0.1 });
    comps.push(...textRamp("letters", nb.groups, T, T + 1.6 * k, 0.5 * k, 0.42));
    return { components: comps, shape, bbox: [-X, -Y, X, Y], textGroups: nb.groups.concat(ini.groups), textHeight: nb.h || Infinity, avoid: S.circle(mx, 0, R + 2) };
  });

  // Sport Elegant: clipped-corner plate, emblem in a ringed medallion, italic name over a single fine stripe
  DESIGNS.sportline = refDesign("Sport Line", "Clean team plate", { base: "Plate", accent: "Rim & stripe", letters: "Lettering", chrome: "Medallion ring" }, "sport", (o) => {
    const W = o.width, H = hgt(o, W * (o.sub ? 0.33 : 0.29)), X = W / 2, Y = H / 2, T = o.base, k = o.k;
    const c = Math.min(Y * 0.45, 12);
    const shape = S.memo(S.offset(S.poly([[-X + c, Y - 1.5], [X - c, Y - 1.5], [X - 1.5, Y - c], [X - 1.5, -Y + c], [X - c, -Y + 1.5], [-X + c, -Y + 1.5], [-X + 1.5, -Y + c], [-X + 1.5, Y - c]]), 1.5));
    const comps = [{ slot: "base", f: shape, z0: 0, z1: T }];
    const rim = Math.max(3, H * 0.07);
    comps.push(...roundRim(shape, rim, T, T + 1.2 * k));
    const hasIcon = o.icon && o.icon !== "none" && I[o.icon];
    const R = Y - rim - 4, ix = -X + rim + 5 + R;
    if (hasIcon) {
      comps.push(...ramp("chrome", S.shell(S.circle(ix, 0, R - 1.3), 2.6), T, T + 1.3 * k, 0.5 * k, 0.8, 4));
      comps.push(...ramp("accent", S.xf(I[o.icon](), ix, 0, R * 0.66), T, T + 1.2 * k, 0.35 * k, 0.3, 3, { h: 0.18 }));
    }
    const tx0 = hasIcon ? ix + R + 5 : -X + rim + 8, tx1 = X - rim - 8;
    const nb = NP.nameBlock(o, o.font || "sport", { cx: (tx0 + tx1) / 2, cy: 2.2, w: tx1 - tx0, h: H - 2 * rim - 16 }, { track: 0.05 });
    comps.push(...textRamp("letters", nb.groups, T, T + 1.7 * k, 0.55 * k, 0.45));
    const tb = groupsBBox(nb.groups);
    if (tb) comps.push(...ramp("accent", S.offset(S.poly([[tb[0] + 2, tb[1] - 3.2], [tx1, tb[1] - 3.2], [tx1 - 2.4, tb[1] - 5.0], [tb[0], tb[1] - 5.0]]), 0.1), T, T + 0.9 * k, 0.3 * k, 0.3, 2));
    return { components: comps, shape, bbox: [-X, -Y, X, Y], textGroups: nb.groups, textHeight: nb.h || Infinity, avoid: hasIcon ? S.circle(ix, 0, R + 2) : S.EMPTY };
  });
  NP.REFINED = ["signature", "monogram", "sportline"];
  Object.assign(PALETTES, {
    navycream: { label: "Navy & cream", base: P("pla:blue"), accent: P("pla:cream"), panel: P("pla:cream"), bold: P("pla:black"), letters: P("pla:cream"), chrome: P("pla:grey"), refined: true },
    charcoal: { label: "Charcoal & silver", base: P("pro:black"), accent: P("pla:grey"), panel: P("pla:grey"), bold: P("pla:black"), letters: P("pla:cold-white"), chrome: P("pla:grey"), refined: true },
    forestgold: { label: "Forest & gold", base: P("pla:dark-gray-green"), accent: P("pla:beige"), panel: P("pla:cream"), bold: P("pla:black"), letters: P("pla:cream"), chrome: P("pla:beige"), refined: true },
    espresso: { label: "Espresso & gold", base: P("pla:brown"), accent: P("pla:beige"), panel: P("pla:cream"), bold: P("pla:black"), letters: P("pla:cream"), chrome: P("pla:beige"), refined: true },
    deepteal: { label: "Deep teal & gold", base: P("pro:blue-green"), accent: P("pla:beige"), panel: P("pla:cream"), bold: P("pla:black"), letters: P("pla:cream"), chrome: P("pla:beige"), refined: true },
    slate: { label: "Slate & white", base: P("pla:stone-blue"), accent: P("pla:cold-white"), panel: P("pla:cold-white"), bold: P("pla:blue"), letters: P("pla:cold-white"), chrome: P("pla:cold-white"), refined: true },
  });
  NP.slotDefaults = (function (prev) {
    return (pal) => { const d = prev(pal), p = PALETTES[pal] || {}; if (p.refined && p.chrome) d.chrome = p.chrome; return d; };
  })(NP.slotDefaults);
