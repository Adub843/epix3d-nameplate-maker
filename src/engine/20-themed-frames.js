  /* =================================================================
     v10: themed frames. The subject's motifs ARE the frame: a topper emblem breaking the top edge,
     side ornaments in the frame ends, theme trim (stripes, stars, film perforations, rivets), and a
     clean recessed blank panel in the middle for the name.
     ================================================================= */
  const mir = (f) => (x, y) => f(-x, y);
  const icon = (k, x, y, s, flip) => { const f = I[k] ? S.xf(I[k](), x, y, s) : S.EMPTY; return flip ? mir(S.xf(I[k] ? I[k]() : S.EMPTY, -x, y, s)) : f; };
  const FRAME_SLOTS = ["base", "panel", "accent", "bold", "letters"];
  const FRAME_LABELS = { base: "Frame body", panel: "Name panel", accent: "Metal rim & trim", bold: "Emblems & color trim", letters: "Lettering" };
  const THEME_OF = { Cars: "stripes", Sports: "stars", Movies: "film", TV: "film", Music: "notes", Outdoors: "rivets", "Home & Hobbies": "rivets", Drinks: "rivets" };

  // wobbly organic outline (for the dynamic frame); not an exact SDF, fine for contours
  const wobble = (f, amp, n, ph = 0) => (x, y) => f(x, y) + amp * Math.sin(Math.atan2(y, x) * n + ph);

  function frameMake(variant) {
    return (o) => {
      const W = o.width, k = o.k;
      // backlit option: thin white panel with a serpentine groove in the back for EL wire
      const lit = !!o.backlit, wd = Math.max(1.5, Math.min(4, +o.wireD || 2.6)), gw = wd + 0.6, gd = wd + 0.4, dt = 1.2;
      const T = lit ? Math.max(o.base, gd + dt - 0.3 * k + 0.2) : o.base;
      const mot = (o.motifs && o.motifs.length ? o.motifs : [o.icon]).filter((m) => m && m !== "none" && I[m]);
      const m0 = (o.icon && o.icon !== "none" && I[o.icon]) ? o.icon : mot[0] || "star", m1 = mot.find((m) => m !== m0) || m0, m2 = mot.filter((m) => m !== m0 && m !== m1)[0] || m1;
      const theme = o.theme || "rivets";
      const PT = o.parts || {}, pt = (n) => Object.assign({ dx: 0, dy: 0, s: 1 }, PT[n] || {});
      const pTop = pt("topper"), pL = pt("left"), pR = pt("right"), pName = pt("name"), pRib = pt("ribbon"), pTrim = pt("trim");
      const special = (v) => v === "initial" || v === "number";
      const SL = (pp, def) => (pp.slot && FRAME_SLOTS.includes(pp.slot) ? pp.slot : def);
      const topIcon = special(pTop.icon) ? pTop.icon : pTop.icon && I[pTop.icon] ? pTop.icon : m0;
      const sub = (o.sub || "").trim(), useRibbon = !!sub && !pRib.hide;
      const fw = W * 0.045, rimW = Math.max(2.2, W * 0.016), earW = W * 0.13;
      const R = W * (variant === "dynamic" ? 0.12 : 0.105);           // topper size
      const topExtra = variant === "scallop" ? R * 0.9 : variant === "dynamic" ? R * 0.7 : R * 1.25;
      let PY = W * 0.15;
      if (o.height > 0) PY = Math.max(10, (o.height - 2 * fw - topExtra) / 2);
      const PX = W / 2 - fw - earW, X = W / 2, Y = PY + fw;
      // ---- outline of the plate body (without topper)
      let body, P, ty = Y + R * 0.3;
      if (variant === "crest") {
        const n = Y * 0.32;
        body = S.sub(S.box(0, 0, X, Y, 3), S.circle(X, Y, n), S.circle(-X, Y, n), S.circle(X, -Y, n), S.circle(-X, -Y, n));
        body = S.union(body, S.box(0, -Y, W * 0.12, 3.5, 2)); // small bottom tab
        P = S.box(0, 0, PX, PY, PY * 0.28);
      } else if (variant === "garage") {
        const c = Y * 0.42;
        body = S.offset(S.poly([[-X + c, Y], [X - c, Y], [X, Y - c], [X, -Y + c], [X - c, -Y], [-X + c, -Y], [-X, -Y + c], [-X, Y - c]]), 0);
        body = S.offset(S.union(body, S.box(X, 0, W * 0.035, Y * 0.42, 2), S.box(-X, 0, W * 0.035, Y * 0.42, 2)), 1.2);
        P = S.offset(S.poly([[-PX + 5, PY], [PX - 5, PY], [PX, PY - 5], [PX, -PY + 5], [PX - 5, -PY], [-PX + 5, -PY], [-PX, -PY + 5], [-PX, PY - 5]]), 1);
        ty = Y + R * 0.2;
      } else if (variant === "arch") {
        body = S.union(S.box(0, 0, X, Y, 4), S.ellipse(0, Y - 2, W * 0.2, R * 1.2), S.box(0, Y, W * 0.27, 4.5, 3));
        P = S.box(0, 0, PX, PY, 4);
        ty = Y + R * 0.15;
      } else if (variant === "marquee") {
        body = S.union(S.box(0, 0, X, Y, 3), S.box(0, Y + 3, X * 0.62, 5, 3), S.box(0, Y + 8, X * 0.36, 5, 3));
        P = S.box(0, 0, PX, PY, 3);
        ty = Y + R * 0.75;
      } else if (variant === "scallop") {
        const n = Y * 0.42;
        body = S.sub(S.box(0, 0, X, Y, 2), S.circle(X, Y, n), S.circle(-X, Y, n), S.circle(X, -Y, n), S.circle(-X, -Y, n));
        body = S.union(body, S.circle(0, Y, R * 0.75), S.circle(0, -Y, R * 0.35));
        P = S.sub(S.box(0, 0, PX + earW * 0.5, PY, 2), S.circle(PX + earW * 0.5, PY, n * 0.75), S.circle(-PX - earW * 0.5, PY, n * 0.75), S.circle(PX + earW * 0.5, -PY, n * 0.75), S.circle(-PX - earW * 0.5, -PY, n * 0.75));
        ty = Y + R * 0.05;
      } else { // dynamic
        body = wobble(S.box(0, 0, X - 6, Y - 6, Y * 0.9), 1.6, 7);
        body = S.offset(body, 6);
        P = S.box(0, 0, PX + earW * 0.4, PY - 1, PY * 0.85);
        ty = Y + R * 0.15;
      }
      const tx0 = variant === "dynamic" ? X - R * 0.9 : 0, ty0 = ty;
      const tx = tx0 + pTop.dx, Rt = R * pTop.s; ty = ty0 + pTop.dy;
      const garageTop = variant === "garage" && !special(topIcon);
      // ribbon banner for the second line, across the bottom edge
      const rbW = Math.min(W * 0.5, Math.max(W * 0.3, sub.length * W * 0.03)) * pRib.s, rbH = W * 0.085 * pRib.s, rbx = pRib.dx, rby = -Y + pRib.dy;
      const tail = (s) => S.sub(S.box(rbx + s * (rbW / 2 + rbH * 0.35), rby - rbH * 0.3, rbH * 0.75, rbH * 0.4, 0.6),
        S.poly([[rbx + s * (rbW / 2 + rbH * 1.12), rby - rbH * 0.72], [rbx + s * (rbW / 2 + rbH * 0.7), rby - rbH * 0.3], [rbx + s * (rbW / 2 + rbH * 1.12), rby + rbH * 0.12]]));
      const ribbonFront = useRibbon ? S.memo(S.box(rbx, rby, rbW / 2, rbH / 2, 1.5)) : null;
      const ribbonTails = useRibbon ? S.memo(S.sub(S.union(tail(-1), tail(1)), S.offset(ribbonFront, 0.6))) : null;
      const ribbon = useRibbon ? S.memo(S.union(ribbonFront, tail(-1), tail(1))) : null;
      // ---- topper
      const hideTop = !!pTop.hide;
      const medal = garageTop ? S.offset(icon(topIcon, tx, ty, Rt), 2.2) : S.circle(tx, ty, Rt);
      const outline = S.memo(S.union(body, ...(hideTop ? [] : [garageTop ? S.offset(icon(topIcon, tx, ty, Rt), 3.6) : variant === "dynamic" ? S.circle(tx, ty, Rt * 1.1) : S.offset(medal, 2.2)]), ...(ribbon ? [S.offset(ribbon, 1.6)] : [])));
      const inside = S.offset(outline, -0.8); // anything moved by the user is clipped to the plate so nothing floats
      P = S.memo(P);
      let comps, lightMeta = null;
      if (!lit) comps = [{ slot: "base", f: outline, z0: 0, z1: T }];
      else {
        // serpentine groove: rows across the panel joined at alternating ends, then a channel out through the
        // bottom edge for the wire lead. The white above each groove is only dt thick so light passes through.
        const clear = gw / 2 + 1.8, pitch = gw + 2.4, rows = []; // thin 2.4 mm ribs keep the glow even
        const inner = (x, y) => P(x, y) < -clear;
        const nRows = Math.max(1, Math.floor((2 * (PY - clear - 0.5)) / pitch) + 1);
        for (let i = 0; i < nRows; i++) { const y = ((nRows - 1) / 2 - i) * pitch;
          let x0 = null, x1 = null;
          for (let x = -PX - 6; x <= PX + 6; x += 0.5) if (inner(x, y)) { if (x0 === null) x0 = x; x1 = x; }
          if (x0 !== null && x1 - x0 > 10) rows.push({ y, x0, x1 });
        }
        const segs = []; let len = 0, end = null;
        rows.forEach((r, i) => {
          const a = i % 2 ? r.x1 : r.x0, b = i % 2 ? r.x0 : r.x1;
          segs.push(S.seg(a, r.y, b, r.y, gw)); len += Math.abs(b - a);
          if (i < rows.length - 1) { const nx = i % 2 ? Math.max(r.x0, rows[i + 1].x0) : Math.min(r.x1, rows[i + 1].x1); segs.push(S.seg(nx, r.y, nx, rows[i + 1].y, gw)); len += Math.abs(r.y - rows[i + 1].y); }
          end = { x: b, y: r.y };
        });
        // the lead leaves from the end of the last row straight down and out of the plate
        const exitX = end ? end.x : PX * 0.6, exitY = end ? end.y : -PY / 2;
        const exit = S.seg(exitX, exitY, exitX, -Y - 30, gw);
        let ox = -Y - 30; for (let y = exitY; y > -Y - 30; y -= 0.5) if (outline(exitX, y) > 0) { ox = y; break; }
        len += Math.abs(exitY - ox);
        const grooves = S.memo(S.union(...segs, exit));
        comps = [{ slot: "base", f: S.sub(outline, S.offset(P, -0.01), grooves), z0: 0, z1: gd, noBevel: true },
                 { slot: "base", f: S.sub(outline, S.offset(P, -0.01)), z0: gd, z1: T }];
        lightMeta = { wireD: wd, grooveW: gw, grooveD: gd, diffuser: +(T + 0.3 * k - gd).toFixed(1), rows: rows.length, wireMM: Math.round(len), panelMM: [Math.round(2 * PX), Math.round(2 * PY)], thickness: +(T + 0.3 * k).toFixed(1), exit: [+exitX.toFixed(2), +exitY.toFixed(2)] };
        comps.push({ slot: "panel", f: S.sub(P, grooves), z0: 0, z1: gd });
      }
      // dark raised frame band around the panel
      comps.push({ slot: "base", f: S.sub(S.offset(outline, -rimW), S.offset(P, 1.6)), z0: T, z1: T + 0.8 * k });
      // metal outer rim, and a metal lip around the panel
      comps.push({ slot: "accent", f: S.sub(outline, S.offset(outline, -rimW)), z0: T, z1: T + 1.3 * k });
      comps.push({ slot: "accent", f: S.sub(S.offset(P, 1.6), P), z0: T, z1: T + 1.15 * k });
      // the blank name panel: an inlay sitting just above the plate, below the lips
      comps.push({ slot: "panel", f: P, z0: lit ? comps.find((c) => c.slot === "panel").z1 - 0.001 : T - 0.6, z1: T + 0.3 * k });
      // ---- theme trim on the frame band
      const bandTop = T + 0.8 * k - 0.01, trimTop = T + 1.25 * k;
      const ex = PX + 1.6 + earW / 2 + fw * 0.15;           // side ornament centre
      const sideR = Math.min(earW * 0.36, Y * 0.42);
      const sideOn = variant !== "dynamic";
      const lIcon = pL.icon && I[pL.icon] ? pL.icon : m1, rIcon = pR.icon && I[pR.icon] ? pR.icon : m1 === m0 ? m2 : m1;
      const lx = -ex + pL.dx, ly = pL.dy, lr = sideR * pL.s, rx = ex + pR.dx, ry = pR.dy, rr = sideR * pR.s;
      if (sideOn && !pL.hide) comps.push({ slot: SL(pL, "bold"), f: S.inter(icon(lIcon, lx, ly, lr), inside), z0: bandTop, z1: trimTop + 0.2 * k, h: 0.18 });
      if (sideOn && !pR.hide) comps.push({ slot: SL(pR, "bold"), f: S.inter(icon(rIcon, rx, ry, rr, true), inside), z0: bandTop, z1: trimTop + 0.2 * k, h: 0.18 });
      const trim = [];
      const yb = -(PY + 1.6 + (fw - rimW - 1.6) / 2);  // centre line of the band below the panel
      const yt = -yb, bw = Math.max(1.4, (fw - rimW - 1.6) * 0.42);
      if (theme === "stripes") {
        for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
          const x0 = s * (PX * 0.18 + i * 0); const len = PX * (0.5 - i * 0.1), yy = yb + (i - 1) * bw * 1.25;
          if (i !== 1) continue; // one bold stripe pair below the panel, like racing trim
          trim.push(S.poly(s > 0 ? [[x0, yy + bw], [x0 + len, yy + bw], [x0 + len - bw * 1.5, yy - bw], [x0 - bw * 1.5, yy - bw]] : [[x0, yy + bw], [x0 - len, yy + bw], [x0 - len + bw * 1.5, yy - bw], [x0 + bw * 1.5, yy - bw]]));
        }
        for (const s of [-1, 1]) trim.push(S.circle(s * (X - rimW - 3.2), Y - rimW - 3.2 - (variant === "garage" ? 3 : 0), 1.4), S.circle(s * (X - rimW - 3.2), -Y + rimW + 3.2 + (variant === "garage" ? 3 : 0), 1.4));
      } else if (theme === "stars") {
        const n = 3, sp = PX * 0.16;
        for (const s of [-1, 1]) for (let i = 0; i < n; i++) trim.push(S.star(s * (PX * 0.55 + i * sp), yb, bw * 1.25, bw * 0.55));
        if (variant === "marquee") for (const s of [-1, 1]) trim.push(S.star(s * X * 0.48, Y + 3, 2.6, 1.15));
      } else if (theme === "film") {
        const holes = Math.floor(PX * 2 / 7.5);
        for (let i = 0; i < holes; i++) { const x = -PX + 3.75 + i * 7.5; trim.push(S.box(x, yb, 1.8, bw * 0.75, 0.6), S.box(x, yt, 1.8, bw * 0.75, 0.6)); }
      } else if (theme === "notes") {
        for (const s of [-1, 1]) { trim.push(S.xf(I.notes ? I.notes() : S.EMPTY, s * PX * 0.62, yb, bw * 1.5)); trim.push(S.seg(s * PX * 0.15, yb, s * PX * 0.45, yb, 0.9)); }
      } else {
        const nr = Math.max(4, Math.floor(PX / 14));
        for (let i = 0; i <= nr; i++) { const x = -PX + (2 * PX * i) / nr; trim.push(S.circle(x, yb, bw * 0.62), S.circle(x, yt, bw * 0.62)); }
      }
      if (pTrim.hide) trim.length = 0;
      if (ribbon) trim.push(S.EMPTY);
      if (trim.length && variant !== "scallop") comps.push({ slot: SL(pTrim, theme === "stripes" ? "bold" : "accent"), f: S.inter(S.union(...trim), S.sub(S.offset(outline, -rimW - 0.6), S.offset(P, 2.2), ribbon ? S.offset(ribbon, 3) : S.EMPTY, ...(sideOn ? [S.circle(lx, ly, lr * 1.15), S.circle(rx, ry, rr * 1.15)] : []))), z0: bandTop, z1: trimTop, h: 0.18, minArea: 0.2 });
      if (variant === "scallop" && !pTrim.hide) {
        const cr = Y * 0.2;
        for (const [sx, sy, m] of [[-1, 1, m1], [1, 1, m2], [-1, -1, m2], [1, -1, m1]]) comps.push({ slot: SL(pTrim, "bold"), f: icon(m, sx * (X - Y * 0.42 - cr * 0.2), sy * (Y - cr * 1.05), cr * 0.7, sx > 0), z0: bandTop, z1: trimTop + 0.2 * k, h: 0.18 });
      }
      if (variant === "dynamic" && !pTrim.hide) {
        // a second, offset outline sweeping round the plate in the theme colour
        comps.push({ slot: SL(pTrim, "bold"), f: S.sub(S.inter(S.shell(wobble(S.box(0, 0, X - 9, Y - 9, Y * 0.85), 1.4, 5, 1.3), 1.6), S.offset(outline, -rimW - 0.4)), S.offset(P, 2.4), S.circle(tx, ty, R * 1.15)), z0: bandTop, z1: trimTop + 0.15 * k, h: 0.18 });
      }
      // ---- topper emblem
      let topGroups = [];
      if (hideTop) { /* no topper */ }
      else if (garageTop) {
        comps.push({ slot: SL(pTop, "accent"), f: icon(topIcon, tx, ty, Rt), z0: T, z1: T + 2.1 * k, h: 0.18 });
      } else {
        comps.push({ slot: "accent", f: medal, z0: T, z1: T + 1.6 * k });
        comps.push({ slot: "base", f: S.circle(tx, ty, Rt - 1.6), z0: T + 1.6 * k - 0.01, z1: T + 1.85 * k });
        if (special(topIcon)) {
          const ch = topIcon === "number" ? (String(o.number || "").replace(/[^0-9]/g, "").slice(0, 2) || "1") : ((o.text || "N").replace(/[^A-Za-z0-9]/g, "")[0] || "N").toUpperCase();
          const ft = fitText(ch, topIcon === "number" ? "block" : "varsity", { cx: tx, cy: ty, w: Rt * 1.25, h: Rt * 1.1 });
          topGroups = ft.groups;
          comps.push({ slot: SL(pTop, "bold"), groups: ft.groups, z0: T + 1.85 * k - 0.01, z1: T + 2.5 * k, isText: true });
        } else comps.push({ slot: SL(pTop, "bold"), f: icon(topIcon, tx, ty, Rt * 0.66), z0: T + 1.85 * k - 0.01, z1: T + 2.5 * k, h: 0.18 });
      }
      // ---- ribbon banner with the second line
      let subGroups = [];
      if (ribbon) {
        comps.push({ slot: "base", f: ribbonTails, z0: T, z1: T + 0.75 * k });
        comps.push({ slot: SL(pRib, "accent"), f: ribbonFront, z0: T, z1: T + 1.1 * k });
        comps.push({ slot: "panel", f: S.box(rbx, rby, rbW / 2 - 1.3, rbH / 2 - 1.3, 1), z0: T + 1.1 * k - 0.01, z1: T + 1.35 * k });
        const st = fitText(sub, "block", { cx: rbx, cy: rby, w: rbW - 6, h: rbH - 4.2 }, { track: 0.12 });
        subGroups = st.groups;
        comps.push({ slot: "letters", groups: st.groups, z0: T + 1.35 * k - 0.01, z1: T + 1.95 * k, isText: true });
      }
      // ---- name in the panel
      const font = o.font || (variant === "garage" || variant === "dynamic" ? "sport" : variant === "marquee" ? "block" : "varsity");
      const nbo = Object.assign({}, o, { sub: ribbon ? "" : o.sub });
      const nb = NP.nameBlock(nbo, font, { cx: pName.dx, cy: pName.dy, w: (2 * PX - 10) * pName.s, h: (2 * PY - 8) * pName.s }, { track: 0.06 });
      const moved = pName.dx || pName.dy || pName.s !== 1;
      if (moved) comps.push({ slot: SL(pName, "letters"), f: S.inter(textField(nb.groups, 3), inside), z0: T + 0.3 * k - 0.01, z1: T + 1.3 * k, isText: true, h: 0.18 });
      else comps.push({ slot: SL(pName, "letters"), groups: nb.groups, z0: T + 0.3 * k - 0.01, z1: T + 1.3 * k, isText: true });
      const top = ty + (garageTop ? Rt * 1.05 : variant === "dynamic" ? Rt * 1.12 : Rt + 2.4);
      // hit boxes for the editor: click a part, drag it, resize it
      const nbb = groupsBBox(nb.groups);
      const partBoxes = {
        topper: hideTop ? null : [tx - Rt - 2, ty - Rt - 2, tx + Rt + 2, ty + Rt + 2],
        left: sideOn && !pL.hide ? [lx - lr - 1, ly - lr - 1, lx + lr + 1, ly + lr + 1] : null,
        right: sideOn && !pR.hide ? [rx - rr - 1, ry - rr - 1, rx + rr + 1, ry + rr + 1] : null,
        name: nbb ? [nbb[0] - 1.5, nbb[1] - 1.5, nbb[2] + 1.5, nbb[3] + 1.5] : null,
        ribbon: ribbon ? [rbx - rbW / 2 - rbH * 1.1, rby - rbH * 0.75, rbx + rbW / 2 + rbH * 1.1, rby + rbH / 2] : null,
      };
      const bx = [-X - (variant === "garage" ? W * 0.04 : 0), -Y - 4, X + (variant === "garage" ? W * 0.04 : 0), Math.max(Y + 10, top)];
      for (const b of Object.values(partBoxes)) if (b) { bx[0] = Math.min(bx[0], b[0] - 3); bx[1] = Math.min(bx[1], b[1] - 3); bx[2] = Math.max(bx[2], b[2] + 3); bx[3] = Math.max(bx[3], b[3] + 3); }
      const avoidF = S.union(hideTop ? S.EMPTY : S.circle(tx, ty, Rt + 2), S.offset(P, 3), ribbon ? S.offset(ribbon, 2) : S.EMPTY);
      return { meta: lightMeta ? { backlight: lightMeta } : null, components: comps, shape: outline, bbox: bx, textGroups: nb.groups.concat(subGroups, topGroups), textHeight: nb.h || Infinity, avoid: avoidF, free: (x, y) => -S.sub(S.offset(outline, -rimW - 2), avoidF)(x, y), partBoxes,
        partInfo: { topper: { icon: topIcon, slot: SL(pTop, garageTop ? "accent" : "bold") }, left: { icon: lIcon, slot: SL(pL, "bold") }, right: { icon: rIcon, slot: SL(pR, "bold") }, name: { slot: SL(pName, "letters") }, ribbon: { slot: SL(pRib, "accent") }, trim: { slot: SL(pTrim, theme === "stripes" || variant === "scallop" || variant === "dynamic" ? "bold" : "accent") } } };
    };
  }
  NP.FRAMES = ["crestframe", "garageframe", "archframe", "marqueeframe", "scallopframe", "dynamicframe"];
  const FRAME_INFO = { crestframe: ["Crest Frame", "Emblem crest on top", "crest"], garageframe: ["Badge Frame", "Emblem breaks the top edge", "garage"], archframe: ["Arch Frame", "Arched top, end ornaments", "arch"], marqueeframe: ["Marquee Frame", "Stepped top, big emblem", "marquee"], scallopframe: ["Scallop Frame", "Scalloped corners, corner motifs", "scallop"], dynamicframe: ["Dynamic Frame", "Flowing outline, corner emblem", "dynamic"] };
  for (const key of NP.FRAMES) {
    const [label, note, variant] = FRAME_INFO[key];
    DESIGNS[key] = { label, note, layered: true, frame: true, font: "varsity", slots: FRAME_SLOTS, labels: FRAME_LABELS, itemSlot: "accent", itemTop: 1.25, make: frameMake(variant) };
  }
  NP.themeOf = (sp) => THEME_OF[sp && sp.group] || "rivets";

  /* ---------------- frame palettes (Polymaker only, 4 colours: body, panel, metal, colour) */
  Object.assign(PALETTES, {
    fr_garage: { label: "Charcoal, silver & red", base: P("pro:dark-grey"), panel: P("pla:cold-white"), accent: P("pla:grey"), bold: P("pla:red"), letters: P("pro:dark-grey"), frame: true },
    fr_gold: { label: "Charcoal, gold & cream", base: P("pro:dark-grey"), panel: P("pla:cream"), accent: P("pla:beige"), bold: P("pla:beige"), letters: P("pro:dark-grey"), frame: true },
    fr_court: { label: "Black, silver & orange", base: P("pro:black"), panel: P("pro:dark-grey"), accent: P("pla:grey"), bold: P("pla:orange"), letters: P("pla:orange"), frame: true },
    fr_pitch: { label: "Black, silver & green", base: P("pro:black"), panel: P("pro:dark-grey"), accent: P("pla:grey"), bold: P("pla:lime-green"), letters: P("pla:lime-green"), frame: true },
    fr_navy: { label: "Navy, brass & cream", base: P("pla:blue"), panel: P("pla:cream"), accent: P("pla:beige"), bold: P("pla:beige"), letters: P("pla:blue"), frame: true },
    fr_ivory: { label: "Ivory, navy & red", base: P("pla:natural"), panel: P("pla:white"), accent: P("pla:blue"), bold: P("pla:red"), letters: P("pla:blue"), frame: true },
    fr_cinema: { label: "Black, silver & red", base: P("pro:black"), panel: P("pla:cold-white"), accent: P("pla:grey"), bold: P("pla:red"), letters: P("pro:black"), frame: true },
    fr_teal: { label: "Deep teal, copper & cream", base: P("pro:blue-green"), panel: P("pla:cream"), accent: P("pro:army-beige"), bold: P("pro:army-beige"), letters: P("pro:blue-green"), frame: true },
    fr_forest: { label: "Forest, brass & cream", base: P("pla:dark-gray-green"), panel: P("pla:cream"), accent: P("pla:beige"), bold: P("pla:orange"), letters: P("pla:dark-gray-green"), frame: true },
    fr_walnut: { label: "Walnut, cream & brass", base: P("pro:brown"), panel: P("pla:cream"), accent: P("pla:beige"), bold: P("pla:beige"), letters: P("pro:brown"), frame: true },
    fr_royal: { label: "Purple, silver & gold", base: P("pro:dark-purple"), panel: P("pla:cold-white"), accent: P("pla:grey"), bold: P("pro:light-yellow"), letters: P("pro:dark-purple"), frame: true },
    fr_ocean: { label: "Navy, white & aqua", base: P("pla:blue"), panel: P("pla:cold-white"), accent: P("pla:grey"), bold: P("pla:aqua-blue"), letters: P("pla:blue"), frame: true },
  });
  NP.FRAME_PALETTES = Object.keys(PALETTES).filter((k) => PALETTES[k].frame);
  const SPORT_PAL = { basketball: "fr_court", soccer: "fr_pitch", golf: "fr_pitch", tennis: "fr_pitch", football: "fr_forest", baseball: "fr_navy", hockey: "fr_ocean", volleyball: "fr_ocean", snow: "fr_ocean", skate: "fr_court", cycling: "fr_pitch" };
  const GROUP_PAL = { Cars: "fr_garage", Sports: "fr_navy", Movies: "fr_cinema", TV: "fr_cinema", Music: "fr_gold", Outdoors: "fr_teal", "Home & Hobbies": "fr_walnut", Drinks: "fr_gold" };
  NP.framePalette = (sp, i = 0) => {
    const first = (sp && (SPORT_PAL[sp.key] || GROUP_PAL[sp.group])) || "fr_gold";
    if (!i) return first;
    const alt = NP.FRAME_PALETTES.filter((k) => k !== first);
    return alt[((sp && sp.key ? sp.key.length : 0) * 5 + i * 3) % alt.length];
  };
  NP.slotDefaults = (function (prev) {
    return (pal) => { const d = prev(pal), p = PALETTES[pal] || {}; if (p.frame) { d.panel = p.panel; d.bold = p.bold; d.letters = p.letters; d.accent = p.accent; d.base = p.base; } return d; };
  })(NP.slotDefaults);

  /* ---------------- every subject's ten ideas are now themed frames */
  const examplesV9 = NP.examplesFor;
  NP.examplesFor = function (sp) {
    const list = examplesV9(sp);
    const order = ["crestframe", "garageframe", "archframe", "marqueeframe", "scallopframe", "dynamicframe"];
    if (sp.group === "Cars") order.unshift("garageframe");
    if (sp.group === "Sports") order.unshift("marqueeframe");
    return list.map((ex, i) => {
      const design = order[i % order.length];
      return Object.assign({}, ex, { design, palette: NP.framePalette(sp, i >= order.length ? 1 + i : i % 2 ? i : 0), items: [], badge: "none", icon: (sp.icons && sp.icons[i % 2 ? 1 : 0]) || ex.icon, sub: ex.sub && ex.sub.length <= 18 ? ex.sub : "",
        parts: i === 2 || i === 8 ? { topper: { icon: ex.number ? "number" : "initial" } } : {} });
    });
  };

  /* ---------------- README notes for a backlit (EL wire) plate */
  const readmeV10 = NP.readme;
  NP.readme = function (m, colors, info) {
    let txt = readmeV10(m, colors, info);
    const L = m.meta && m.meta.backlight; if (!L) return txt;
    const sec = [
      "BACKLIT NAME PANEL (EL WIRE)",
      "The name panel is a thin white window with a groove in the back for EL wire:",
      `  Groove: ${L.grooveW.toFixed(1)} mm wide x ${L.grooveD.toFixed(1)} mm deep, ${L.rows} rows joined end to end, then out through the bottom edge.`,
      `  White left over each groove: ${L.diffuser.toFixed(1)} mm, so the light shows through. Plate thickness ${L.thickness} mm.`,
      `  EL wire: ${L.wireD.toFixed(1)} mm diameter, about ${Math.ceil(L.wireMM / 10) + 15} cm long (${Math.round(L.wireMM / 10)} cm in the groove + 15 cm lead).`,
      "  Fitting: press the wire into the groove from the back, starting at the far end, and hold it with small dots of",
      "  clear hot glue or clear silicone every few centimetres. Run the lead out through the bottom channel to the",
      "  inverter / battery pack. Mount with foam tape on the frame only, so the wire sits clear of the wall.",
      "Printing tips for an even glow:",
      "  Print the name panel in PolyLite PLA White (or Cold White); keep the frame body a dark color so light does not bleed.",
      "  Use 100% infill (or set the white part to solid) so no infill pattern shows when lit. Print face up; the grooves",
      "  are short bridges and need no supports.",
    ].join("\r\n");
    const at = txt.lastIndexOf("Made with Nameplate Maker by Creative Lab Studios.");
    return at >= 0 ? txt.slice(0, at) + sec + "\r\n\r\n" + txt.slice(at) : txt + "\r\n" + sec + "\r\n";
  };
