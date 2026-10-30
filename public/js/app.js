
(() => {
  const $ = (id) => document.getElementById(id);
  /* ---------- background worker: all geometry happens there (js/worker.js, js/jobs.js) */
  let worker = null;
  try { worker = new Worker("js/worker.js"); } catch (e) { worker = null; }
  let local = null; // the same jobs on the page when workers are blocked
  let reqId = 0;
  const pending = new Map();
  function run(job, transfer) {
    return new Promise((resolve, reject) => {
      const id = ++reqId;
      if (!worker) {
        if (!local) local = createJobs(NP);
        setTimeout(() => { try { resolve(Object.assign({ id }, local(job).msg)); } catch (err) { reject(err); } }, 0);
        return;
      }
      pending.set(id, { resolve, reject });
      worker.postMessage(Object.assign({ id }, job), transfer || []);
    });
  }
  if (worker) {
    worker.onmessage = (e) => { const p = pending.get(e.data.id); if (!p) return; pending.delete(e.data.id); e.data.error ? p.reject(new Error(e.data.error)) : p.resolve(e.data); };
    // a worker that fails to load falls back to the page, and anything waiting is run again there
    worker.onerror = (e) => {
      e.preventDefault(); worker = null; local = createJobs(NP);
      for (const [id, p] of pending) p.reject(new Error("The background worker stopped; please try again."));
      pending.clear();
    };
  }

  /* ---------- state */
  const state = { mode: "tpl", design: (NP.ARTFRAMES || [])[0] || "crestframe", icon: null, palette: null, colors: NP.slotDefaults("fr_gold"), colorsTouched: false, subjectKey: null, items: [], sel: -1, full: null, view: "arrange",
    badge: "none", blank: { shape: "rounded", border: true, borderW: 3, textX: 0, textY: 0, textSize: 0 }, img: null, imgSrc: null, imgOpts: { levels: 1, thr: 128, invert: false, size: 50, thicken: 0.2, x: 0, y: 0 },
    pickSlot: null, pickLine: "pla", tplDesign: (NP.ARTFRAMES || [])[0] || "crestframe", maxColors: 4, pins: {}, pinSeq: 0, fullDesign: null, parts: {}, selPart: null, lit: false, litWire: 2.6, bp: NP.backplateDefaults(), finish: (() => { try { const f = localStorage.getItem("np-finish"); return NP.FINISHES[f] ? f : "crisp"; } catch (e) { return "crisp"; } })() };
  const DESIGN_KEYS = Object.keys(NP.DESIGNS).filter((k) => k !== "blank");
  const VEH = NP.VEHICLES.slice(), SIGN = NP.SIGNS.slice(), REF = (NP.REFINED || []).slice(), FRAMES = (NP.FRAMES || []).slice(), ART = (NP.ARTFRAMES || []).slice();
  const sameGroup = (a, b) => a === b || ([a, b].every((g) => g === "Movies" || g === "TV"));
  const artSubj = (k) => NP.SUBJECTS.find((x) => x.key === NP.ART[k].subject);
  const artCat = (k) => { const s = artSubj(k); return s ? NP.categoryOf(s) : null; };
  const artRank = (k) => (NP.ART[k].style === "natural" ? 0 : 1);
  // the subject's own templates first (realistic before bold), then the rest of its category
  const artFor = (sp) => { const cat = NP.categoryOf(sp), mine = ART.filter((k) => NP.ART[k].subject === sp.key).sort((a, b) => artRank(a) - artRank(b));
    return mine.concat(ART.filter((k) => NP.ART[k].subject !== sp.key && artCat(k) === cat).sort((a, b) => artRank(a) - artRank(b))); };
  const FUN = DESIGN_KEYS.filter((k) => NP.DESIGNS[k].fun && !NP.DESIGNS[k].layered && !REF.includes(k)), SIMPLE = DESIGN_KEYS.filter((k) => !NP.DESIGNS[k].fun && !NP.DESIGNS[k].layered);
  const D = (k = state.design) => NP.DESIGNS[k];
  const subject = () => NP.matchSubject($("subject").value);
  const iconKey = () => state.icon || subject().icons[0];
  const plateText = () => $("name").value.trim() || (state.mode === "blank" ? "" : subject().label);
  const isFun = (k = state.design) => !!D(k).fun && !D(k).layered;
  const isVeh = (k = state.design) => !!D(k).vehicle;
  const isBlank = () => state.design === "blank";
  const isSign = (k = state.design) => !!D(k).sign;
  const familyOf = (k) => (ART.includes(k) ? "art" : VEH.includes(k) ? "veh" : SIGN.includes(k) ? "sign" : REF.includes(k) ? "ref" : FRAMES.includes(k) ? "frame" : "std");
  const familyPalette = (k) => (familyOf(k) === "art" ? "art_" + k : familyOf(k) === "veh" ? vehPalette() : familyOf(k) === "sign" ? NP.SIGN_PALETTES[k][0] : familyOf(k) === "frame" ? NP.framePalette(subject()) : familyOf(k) === "ref" ? NP.REFINED_PALETTES[((subject().key || "").length + REF.indexOf(k)) % NP.REFINED_PALETTES.length] : subject().palette || "pop");
  const vehVisible = () => subject().group === "Cars" || VEH.includes(state.design);
  function slotsFor(design) {
    const d = D(design);
    if (d.layered) {
      if (design === "blank") {
        const s = ["base"]; if (state.blank.border || state.items.length) s.push("accent");
        if (state.img) for (let L = 1; L <= state.imgOpts.levels; L++) s.push("img" + L);
        s.push("letters"); if ($("sub").value.trim()) s.push("bold");
        return s;
      }
      return d.slots.filter((s) => !d.vehicle || s !== "accent" || state.items.some((it) => it.mode !== "cut" && (it.slot || "accent") === "accent"));
    }
    return d.fun ? ["base", "accent", "panel", "bold", "letters"] : ["base", "accent"];
  }
  // the colour budget: never more than 4 (or 5) filaments; the least-used colours merge into their nearest neighbour
  function colorsFor(design, cols = state.colors) {
    const raw = colorsForRaw(design, cols), d = D(design);
    const slots = state.full && state.fullDesign === design ? state.full.slots.map((s) => (d.layered || d.fun ? s : s)) : Object.keys(raw);
    const weights = {}; if (state.full && state.fullDesign === design) for (const c of state.full.checks) weights[c.slot] = c.volume;
    const pins = design === state.design ? state.pins : {};
    return NP.limitColors(raw, slots.filter((s) => raw[s]), weights, state.maxColors, pins).colors;
  }
  function colorsForRaw(design, cols = state.colors) {
    const d = D(design), out = {};
    if (d.layered) { for (const s of d.slots) out[s] = cols[s]; return out; }
    if (d.fun) { for (const s of ["base", "accent", "panel", "bold", "letters"]) out[s] = cols[s]; return out; }
    return { base: cols.base, raised: cols.accent };
  }
  const slotLabel = (s, design = state.design) => {
    const d = D(design);
    if (d.layered) return (d.labels && d.labels[s]) || NP.SLOTS[s] || s;
    if (!d.fun) return s === "accent" ? "Raised" : "Base";
    return NP.SLOTS[s];
  };
  function features() { const f = {}; for (const k of ["frame", "emblem", "burst", "rays", "confetti", "glare"]) f[k] = $("f-" + k).checked; return f; }
  function heightVal() { return $("h-auto").checked ? 0 : +$("height").value; }
  function params(design, h, withItems) {
    const d = D(design);
    const p = {
      design, h, icon: iconKey(), text: plateText(), sub: $("sub").value.trim(), number: $("number").value.replace(/[^0-9]/g, ""),
      width: +$("width").value, height: heightVal(), base: +$("base").value, raise: +$("raise").value, upper: $("upper").checked, font: $("font").value,
      features: features(), badge: state.badge, finish: state.finish, motifs: (subject().icons || []).slice(0, 3), theme: NP.themeOf(subject()), parts: design === state.design ? JSON.parse(JSON.stringify(state.parts)) : {}, backlit: design === state.design && state.lit && !!(NP.DESIGNS[design].frame || NP.DESIGNS[design].art), wireD: state.litWire, backplate: design === state.design && state.bp.on ? Object.assign({}, state.bp) : null,
      items: withItems ? state.items.map((it) => Object.assign({}, it, { slot: d.layered ? (it.slot || "accent") : d.fun ? it.slot : "raised" })) : [],
    };
    if (design === "blank") {
      p.blank = Object.assign({}, state.blank, { textSize: +$("b-tsize").value, border: $("b-border").checked, borderW: +$("b-borderw").value });
      if (state.img) p.blank.img = Object.assign({}, state.img, { x: state.imgOpts.x, y: state.imgOpts.y, size: state.imgOpts.size, thicken: state.imgOpts.thicken, levels: state.imgOpts.levels });
    }
    return p;
  }

  /* ---------- subject chips */
  const groups = {};
  const GROUP_NAMES = { Cars: "Garage", TV: "TV", Music: "Music" };
  // category tabs, each with its subjects as sub-tabs
  const CATS = NP.CATEGORIES.filter((c) => NP.SUBJECTS.some((sp) => c.groups.includes(sp.group)));
  $("cat-tabs").innerHTML = CATS.map((c) => `<button type="button" class="cat-tab" role="tab" data-cat="${c.key}" aria-selected="false">${c.label}</button>`).join("");
  for (const c of CATS) for (const sp of NP.SUBJECTS.filter((x) => c.groups.includes(x.group))) {
    const b = document.createElement("button"); b.className = "chip"; b.type = "button"; b.textContent = sp.label; b.dataset.key = sp.key; b.dataset.cat = c.key;
    b.addEventListener("click", () => { $("subject").value = sp.label; state.colorsTouched = false; refresh(true); });
    $("chips").appendChild(b);
  }
  function showCat(cat) {
    state.cat = cat;
    for (const t of $("cat-tabs").children) t.setAttribute("aria-selected", String(t.dataset.cat === cat));
    for (const b of $("chips").children) b.hidden = b.dataset.cat !== cat;
  }
  $("cat-tabs").addEventListener("click", (e) => { const t = e.target.closest(".cat-tab"); if (!t) return;
    if (NP.categoryOf(subject()) === t.dataset.cat) { showCat(t.dataset.cat); return; }
    showCat(t.dataset.cat); const first = $("chips").querySelector(`.chip[data-cat="${t.dataset.cat}"]`); if (first) first.click(); });

  /* ---------- emblem picker */
  const iconSel = $("icon"), iconCache = {};
  const iconSVG = (k) => iconCache[k] || (iconCache[k] = NP.iconSVG(k));
  const label = (k) => NP.ICON_LABELS[k] || k;
  const ALL_ICONS = Object.keys(NP.ICONS).filter((k) => k !== "dot").sort((a, b) => label(a).localeCompare(label(b)));
  (() => {
    const seen = new Set(); let html = `<option value="">More emblems\u2026</option><option value="none">No emblem</option>`;
    for (const sp of NP.SUBJECTS) { const ks = sp.icons.filter((k) => !seen.has(k) && NP.ICONS[k]); ks.forEach((k) => seen.add(k)); if (ks.length) html += `<optgroup label="${sp.label}">` + ks.map((k) => `<option value="${k}">${label(k)}</option>`).join("") + `</optgroup>`; }
    html += `<optgroup label="General">` + ["trophy", "star", "medal", "heart", "crown", "bolt", "flame", "sparkle", "paw"].map((k) => `<option value="${k}">${label(k)}</option>`).join("") + `</optgroup>`;
    iconSel.innerHTML = html;
  })();
  iconSel.addEventListener("change", () => { if (iconSel.value) { state.icon = iconSel.value; renderIcons(); refresh(false); } iconSel.value = ""; });
  function tile(k, checked, onClick, extra = "") {
    const t = document.createElement("button"); t.className = "itile"; t.type = "button";
    if (checked !== null) { t.setAttribute("role", "radio"); t.setAttribute("aria-checked", String(checked)); }
    t.innerHTML = (k === "none" ? `<svg viewBox="-25 -25 50 50" aria-hidden="true"><path d="M-14 -14 L14 14 M14 -14 L-14 14" stroke="currentColor" stroke-width="3" fill="none"/></svg>` : iconSVG(k)) + `<span>${k === "none" ? "None" : label(k)}${extra}</span>`;
    t.addEventListener("click", onClick); return t;
  }
  function renderIcons() {
    const keys = subject().icons.filter((k) => NP.ICONS[k]);
    if (state.icon && !keys.includes(state.icon) && state.icon !== "none") keys.push(state.icon);
    keys.push("none");
    const cur = iconKey(); $("icons").innerHTML = "";
    for (const k of keys) $("icons").appendChild(tile(k, k === cur, () => { state.icon = k; renderIcons(); refresh(false); }));
  }
  /* ---------- badges for the vehicle plates */
  function renderBadges() {
    $("badges").innerHTML = Object.entries(NP.BADGES).map(([k, v]) => `<button type="button" data-b="${k}" aria-pressed="${k === state.badge}">${v}</button>`).join("");
  }
  $("badges").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; state.badge = b.dataset.b; renderBadges(); buildFull(); buildThumbs(); });
  /* ---------- finish style: edge profile for every design */
  function finishIcon(F) {
    // cross-section of a raised letter: plate, wall, then the finish's bevel steps
    const R = F.relief, hgt = 14 * (F.raise || 1), y0 = 26, x0 = 8, x1 = 36;
    let pts = [[2, 28], [2, y0], [x0, y0]];
    if (!R) pts.push([x0, y0 - hgt], [x1, y0 - hgt]);
    else {
      const dz = Math.min(hgt * R.frac, 9 * (F.raise || 1)), ins = 3.2 * R.inset / 0.42, zc = y0 - hgt + dz;
      pts.push([x0, zc]);
      for (let i = 1; i <= R.steps; i++) { const t = i / R.steps, xi = ins * Math.pow(t, R.curve || 1), y = zc - (dz * i) / R.steps; pts.push([x0 + xi, y + dz / R.steps], [x0 + xi, y]); }
      const L = pts.slice(3).reverse().map(([x, y]) => [x0 + x1 - x, y]);
      pts = pts.concat(L);
    }
    pts.push([x1, y0], [42, y0], [42, 28]);
    return `<svg viewBox="0 0 44 30" aria-hidden="true"><path d="M${pts.map((q) => q.map((v) => v.toFixed(1)).join(" ")).join(" L")} Z" fill="currentColor" opacity=".85"/></svg>`;
  }
  function renderFinishes() {
    $("finishes").innerHTML = NP.FINISH_KEYS.map((k) => { const F = NP.FINISHES[k];
      return `<button type="button" class="fin" role="radio" data-f="${k}" aria-checked="${k === state.finish}" title="${F.note}">${finishIcon(F)}<b>${F.label}${k === "crisp" ? " \u00b7 default" : ""}</b><span>${F.note}</span></button>`; }).join("");
  }
  $("finishes").addEventListener("click", (e) => { const b = e.target.closest(".fin"); if (!b) return; state.finish = b.dataset.f; try { localStorage.setItem("np-finish", state.finish); } catch (er) {} renderFinishes(); buildFull(); });
  renderFinishes();

  /* ---------- toolbox */
  function renderTools() {
    const q = $("tool-q").value.trim().toLowerCase();
    const list = q ? ALL_ICONS.filter((k) => label(k).toLowerCase().includes(q) || k.includes(q)) : (state.mode === "blank" ? ALL_ICONS : subject().tools.filter((k) => NP.ICONS[k]));
    $("tools").classList.toggle("all", !!q || state.mode === "blank");
    $("tools").innerHTML = "";
    for (const k of list) $("tools").appendChild(tile(k, null, () => addItem(k)));
    if (!list.length) $("tools").innerHTML = `<p class="label" style="margin:0">No items match.</p>`;
  }
  $("tool-q").addEventListener("input", renderTools);
  const defaultItemSlot = () => (D().layered ? "accent" : isFun() ? "bold" : "raised");
  function addItem(key) {
    const bb = state.full ? state.full.bbox : [-85, -30, 85, 30];
    const spots = state.full && state.full.spots && state.full.spots.length ? state.full.spots : [[(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2]];
    let best = spots[0], bd = -1;
    for (const s of spots) { const d = state.items.length ? Math.min(...state.items.map((it) => Math.hypot(it.x - s[0], it.y - s[1]))) : -Math.hypot(s[0] - bb[2], s[1] - bb[3]); if (d > bd) { bd = d; best = s; } }
    state.items.push({ key, x: best[0], y: best[1], size: 14, rot: 0, mode: "add", slot: defaultItemSlot() });
    select(state.items.length - 1); setView("arrange"); renderColors(); buildFull(); buildThumbs();
  }
  function itemSlots() {
    if (D().layered) return isBlank() ? ["accent", "letters", "bold", "base"] : isSign() ? ["accent", "letters", "bold", "chrome", "panel"] : ["accent", "chrome", "letters", "lights", "grille"];
    return ["accent", "bold", "letters", "panel"];
  }
  function select(i) {
    state.sel = i; const it = state.items[i]; if (it && state.selPart) { state.selPart = null; $("part-edit").hidden = true; renderPartChips(); }
    $("item-edit").hidden = !it;
    if (it) {
      $("item-name").textContent = label(it.key);
      $("item-size").value = it.size; $("item-size-v").textContent = it.size + " mm";
      $("item-rot").value = it.rot; $("item-rot-v").textContent = it.rot + "\u00b0";
      $("mode-add").setAttribute("aria-pressed", String(it.mode !== "cut")); $("mode-cut").setAttribute("aria-pressed", String(it.mode === "cut"));
      $("item-color-f").hidden = it.mode === "cut" || !(isFun() || D().layered);
      $("item-color").innerHTML = itemSlots().map((s) => `<option value="${s}">${slotLabel(s)}</option>`).join("");
      if (!itemSlots().includes(it.slot)) it.slot = itemSlots()[0];
      $("item-color").value = it.slot;
    }
    drawArrange();
  }
  /* ---------- frame parts: click, drag, resize, swap emblem, hide */
  const PART_NAMES = { topper: "Top emblem", left: "Left ornament", right: "Right ornament", name: "Name", ribbon: "Ribbon", trim: "Trim", body: "Frame body", panel: "Name panel", rim: "Metal rim" };
  const FIXED_SLOT = { body: "base", panel: "panel", rim: "accent" };
  const partList = () => D().frame ? ["topper", "left", "right", "name", "ribbon", "trim"].filter((n) => n !== "ribbon" || $("sub").value.trim()).filter((n) => !(D().make && state.design === "dynamicframe" && (n === "left" || n === "right"))).concat(["body", "panel", "rim"]) : [];
  function renderPartChips() {
    const list = partList(); $("parts-panel").hidden = !list.length || isBlank();
    $("light-panel").hidden = !(D().frame || D().art) || isBlank(); $("lit").checked = state.lit; $("lit-opts").hidden = !state.lit;
    const L = state.full && state.full.meta && state.full.meta.backlight;
    $("lit-info").textContent = state.lit && L ? `${L.rows} groove rows \u00b7 about ${Math.ceil(L.wireMM / 10) + 15} cm of wire \u00b7 ${L.diffuser} mm of white over the wire \u00b7 plate ${L.thickness} mm thick` : "";
    renderPlate();
    $("part-chips").innerHTML = list.map((n) => { const hid = state.parts[n] && state.parts[n].hide;
      return `<button type="button" class="chip" data-part="${n}" aria-pressed="${n === state.selPart}">${PART_NAMES[n]}${hid ? " (hidden)" : ""}</button>`; }).join("");
  }
  function showPart() {
    const n = state.selPart, pp = Object.assign({ dx: 0, dy: 0, s: 1 }, state.parts[n] || {});
    $("part-edit").hidden = !n; if (!n) return;
    const fixed = !!FIXED_SLOT[n], sized = n !== "trim" && !fixed;
    $("part-hide").hidden = fixed; $("part-reset").hidden = fixed;
    const curSlot = FIXED_SLOT[n] || pp.slot || (state.full && state.full.partInfo && state.full.partInfo[n] && state.full.partInfo[n].slot) || "bold";
    const eff = colorsFor(state.design);
    $("part-colors").hidden = fixed;
    $("part-colors").innerHTML = fixed ? "" : (D().slots || []).map((s) => `<button type="button" class="chip" role="radio" data-slot="${s}" aria-checked="${s === curSlot}" aria-pressed="${s === curSlot}" style="display:inline-flex;align-items:center;gap:6px;text-transform:none;letter-spacing:0"><i style="width:14px;height:14px;border-radius:50%;background:${eff[s] || state.colors[s]};border:1px solid rgba(0,0,0,.25);display:inline-block"></i>${slotLabel(s)}</button>`).join("");
    $("part-filament").dataset.slot = curSlot;
    $("part-filament").textContent = `Change ${slotLabel(curSlot).toLowerCase()} filament (${pmName(eff[curSlot] || state.colors[curSlot])})\u2026`;
    $("part-size").parentNode.hidden = !sized; $("part-size").value = Math.round(pp.s * 100); $("part-size-v").textContent = Math.round(pp.s * 100) + "%";
    for (const id of ["part-nudge-l", "part-nudge-u", "part-nudge-d", "part-nudge-r"]) $(id).hidden = !sized;
    const iconPart = n === "topper" || n === "left" || n === "right";
    $("part-icon-f").hidden = !iconPart;
    if (iconPart) {
      const cur = pp.icon || (state.full && state.full.partInfo && state.full.partInfo[n] && state.full.partInfo[n].icon) || "";
      const sub = subject().icons.filter((k) => NP.ICONS[k]), all = Object.keys(NP.ICONS).filter((k) => !sub.includes(k)).sort((a, b) => label(a).localeCompare(label(b)));
      $("part-icon").innerHTML = (n === "topper" ? `<option value="initial">Your initial</option><option value="number">Your number (from #)</option>` : "") +
        `<optgroup label="${subject().label}">` + sub.map((k) => `<option value="${k}">${label(k)}</option>`).join("") + `</optgroup><optgroup label="All emblems">` + all.map((k) => `<option value="${k}">${label(k)}</option>`).join("") + `</optgroup>`;
      $("part-icon").value = cur;
    }
    $("part-hide").textContent = pp.hide ? "Show" : "Hide";
  }
  function selectPart(n) {
    if (n && state.sel >= 0) { state.sel = -1; $("item-edit").hidden = true; }
    state.selPart = n; renderPartChips(); showPart(); drawArrange();
  }
  const undoStack = [];
  const snapParts = () => { undoStack.push(JSON.stringify(state.parts)); if (undoStack.length > 50) undoStack.shift(); $("parts-undo").disabled = false; };
  $("parts-undo").addEventListener("click", () => { if (!undoStack.length) return; state.parts = JSON.parse(undoStack.pop()); $("parts-undo").disabled = !undoStack.length; showPart(); renderPartChips(); buildFull(); });
  document.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.target.closest("input, textarea, select") && D().frame && undoStack.length) { e.preventDefault(); $("parts-undo").click(); } });
  $("arrange").addEventListener("keydown", (e) => {
    const h = e.target.closest && e.target.closest('.handle[data-kind="part"]'); if (!h) return;
    const n = h.dataset.part; $("arrange").dataset.kbd = "1";
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectPart(n); return; }
    const step = e.shiftKey ? 5 : 1, mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (mv) { e.preventDefault(); if (state.selPart !== n) selectPart(n); editPart((pp) => { pp.dx += mv[0]; pp.dy += mv[1]; }, 350); return; }
    if (e.key === "+" || e.key === "=" || e.key === "-") { e.preventDefault(); if (state.selPart !== n) selectPart(n); editPart((pp) => { pp.s = Math.max(0.5, Math.min(2, Math.round((pp.s + (e.key === "-" ? -0.05 : 0.05)) * 20) / 20)); }, 350); }
    if (e.key === "Escape") { selectPart(null); }
  });
  const editPart = (fn, delay = 0) => { const n = state.selPart; if (!n) return; snapParts(); const pp = state.parts[n] = Object.assign({ dx: 0, dy: 0, s: 1 }, state.parts[n]); fn(pp); showPart(); renderPartChips(); clearTimeout(editTimer); editTimer = setTimeout(() => buildFull(), delay); };
  $("part-chips").addEventListener("click", (e) => { const b = e.target.closest("[data-part]"); if (b) selectPart(state.selPart === b.dataset.part ? null : b.dataset.part); });
  $("part-size").addEventListener("input", () => editPart((pp) => (pp.s = +$("part-size").value / 100), 300));
  $("part-icon").addEventListener("change", () => editPart((pp) => (pp.icon = $("part-icon").value)));
  $("part-hide").addEventListener("click", () => editPart((pp) => (pp.hide = !pp.hide)));
  $("part-colors").addEventListener("click", (e) => { const b = e.target.closest("[data-slot]"); if (b) editPart((pp) => (pp.slot = b.dataset.slot)); });
  $("part-filament").addEventListener("click", () => { const s = $("part-filament").dataset.slot; if (!s) return; openPicker(s); $("picker").scrollIntoView({ behavior: "smooth", block: "center" }); });
  $("part-reset").addEventListener("click", () => { if (!state.selPart) return; snapParts(); delete state.parts[state.selPart]; showPart(); renderPartChips(); buildFull(); });
  $("parts-reset-all").addEventListener("click", () => { snapParts(); state.parts = {}; showPart(); renderPartChips(); buildFull(); });
  for (const [id, ddx, ddy] of [["part-nudge-l", -1, 0], ["part-nudge-r", 1, 0], ["part-nudge-u", 0, 1], ["part-nudge-d", 0, -1]]) $(id).addEventListener("click", () => editPart((pp) => { pp.dx += ddx; pp.dy += ddy; }, 250));

  $("lit").addEventListener("change", () => {
    state.lit = $("lit").checked;
    if (state.lit) { const w = NP.pm("pla:white").hex; state.colors.panel = w; state.pins.panel = ++state.pinSeq; state.palette = null; }
    renderPartChips(); renderPalettes(); renderColors(); buildFull();
  });
  $("lit-wire").addEventListener("change", () => { state.litWire = +$("lit-wire").value; buildFull(); });
  /* ---------- backplate */
  const plateSlots = () => { const d = D(); return d.layered ? d.slots.filter((x) => x !== "letters") : d.fun ? ["base", "accent", "panel", "bold"] : ["base", "raised"]; };
  function renderPlate() {
    const b = state.bp, sl = plateSlots();
    $("bp-on").checked = b.on; $("bp-opts").hidden = !b.on;
    if (!sl.includes(b.slot)) b.slot = sl[0];
    $("bp-slot").innerHTML = sl.map((x) => `<option value="${x}"${x === b.slot ? " selected" : ""}>${slotLabel(x)}</option>`).join("");
    $("bp-shape").value = b.shape; $("bp-holes").value = b.holes;
    for (const k of ["pad", "w", "h", "scale", "thick", "radius"]) $("bp-" + k).value = b[k];
    $("bp-pad-v").textContent = b.pad + " mm"; $("bp-w-v").textContent = b.w ? b.w + " mm" : "Auto"; $("bp-h-v").textContent = b.h ? b.h + " mm" : "Auto";
    $("bp-scale-v").textContent = b.scale + "%"; $("bp-thick-v").textContent = (+b.thick).toFixed(1) + " mm"; $("bp-radius-v").textContent = b.radius + " mm";
    for (const r of document.querySelectorAll(".bp-fixed")) r.hidden = b.shape === "outline";
    $("bp-radius-row").hidden = b.shape !== "rect";
    const B = state.full && state.full.meta && state.full.meta.backplate;
    $("bp-info").textContent = b.on && B ? `Plate ${B.w} \u00d7 ${B.h} mm, ${B.thick.toFixed(1)} mm thick \u00b7 design ${B.designW} \u00d7 ${B.designH} mm on top` + (B.notes.length ? " \u00b7 " + B.notes.join(" ") : "") : "";
  }
  let bpTimer = 0;
  const bpSet = (fn, wait = 0) => { fn(state.bp); renderPlate(); clearTimeout(bpTimer); bpTimer = setTimeout(() => { renderColors(); buildFull(); }, wait); };
  $("bp-on").addEventListener("change", () => bpSet((b) => (b.on = $("bp-on").checked)));
  for (const k of ["shape", "slot", "holes"]) $("bp-" + k).addEventListener("change", () => bpSet((b) => (b[k] = $("bp-" + k).value)));
  for (const k of ["pad", "w", "h", "scale", "thick", "radius"]) $("bp-" + k).addEventListener("input", () => bpSet((b) => (b[k] = +$("bp-" + k).value), 350));
  $("bp-auto").addEventListener("click", () => bpSet((b) => { b.w = 0; b.h = 0; b.scale = 100; }));
  const editSel = (fn, rebuild = true) => { const it = state.items[state.sel]; if (!it) return; fn(it); select(state.sel); if (rebuild) { renderColors(); buildFull(); buildThumbs(); } };
  let editTimer = 0;
  $("item-size").addEventListener("input", () => { editSel((it) => (it.size = +$("item-size").value), false); clearTimeout(editTimer); editTimer = setTimeout(() => { buildFull(); buildThumbs(); }, 300); });
  $("item-rot").addEventListener("input", () => { editSel((it) => (it.rot = +$("item-rot").value), false); clearTimeout(editTimer); editTimer = setTimeout(() => { buildFull(); buildThumbs(); }, 300); });
  $("mode-add").addEventListener("click", () => editSel((it) => (it.mode = "add")));
  $("mode-cut").addEventListener("click", () => editSel((it) => (it.mode = "cut")));
  $("item-color").addEventListener("change", () => editSel((it) => (it.slot = $("item-color").value)));
  $("item-del").addEventListener("click", () => { if (state.sel < 0) return; state.items.splice(state.sel, 1); select(-1); renderColors(); buildFull(); buildThumbs(); });
  $("item-dup").addEventListener("click", () => { const it = state.items[state.sel]; if (!it) return; state.items.push(Object.assign({}, it, { x: it.x + it.size * 0.8, y: it.y - it.size * 0.3 })); select(state.items.length - 1); buildFull(); buildThumbs(); });

  /* ---------- style cards */
  const cards = {};
  for (const k of DESIGN_KEYS) {
    const c = document.createElement("button"); c.className = "card"; c.type = "button"; c.setAttribute("role", "radio");
    c.innerHTML = ART.includes(k) ? `<div class="thumb photo"><img alt="" loading="lazy" src="img/templates/${k}.webp"></div><div class="meta"><b>${NP.DESIGNS[k].label}</b><span class="note"></span></div>`
      : `<div class="thumb">Drawing\u2026</div><div class="meta"><b>${NP.DESIGNS[k].label}</b><span class="note">${NP.DESIGNS[k].note}</span></div>`;
    c.addEventListener("click", () => chooseDesign(k)); c.dataset.key = k;
    $(ART.includes(k) ? "rack-kittl" : VEH.includes(k) ? "rack-veh" : SIGN.includes(k) ? "rack-sign" : REF.includes(k) ? "rack-ref" : FRAMES.includes(k) ? "rack-frame" : NP.DESIGNS[k].fun ? "rack-fun" : "rack-simple").appendChild(c); cards[k] = c;
  }
  function chooseDesign(k) {
    const was = familyOf(state.design);
    if (k !== state.design) { state.parts = {}; state.selPart = null; undoStack.length = 0; $("parts-undo").disabled = true; }
    state.design = k; if (state.mode === "tpl") state.tplDesign = k;
    if (familyOf(k) !== was || familyOf(k) === "sign" || familyOf(k) === "art") { if (!state.colorsTouched || familyOf(k) !== was) applyPalette(familyPalette(k)); }
    markCards(); renderColors(); select(state.sel); buildFull();
  }
  const vehPalette = () => { const sp = subject(); return ["cherry", "turquoise", "midnight", "sunburst"][(sp.key || "").length % 4]; };
  function orderCards() {
    const sp = subject(), fits = sp.designs || [], vfits = sp.vehicles || [];
    for (const [list, f] of [[FUN, fits], [SIMPLE, fits], [VEH, vfits], [SIGN, sp.signs || []]]) {
      const order = f.filter((k) => list.includes(k)).concat(list.filter((k) => !f.includes(k)));
      for (const k of order) { cards[k].parentNode.appendChild(cards[k]); cards[k].querySelector(".note").innerHTML = f.includes(k) ? `<span class="tag">Good fit</span>` : NP.DESIGNS[k].note; }
    }
    const shown = artFor(sp);
    for (const k of ART) cards[k].hidden = !shown.includes(k);
    for (const k of shown) { cards[k].parentNode.appendChild(cards[k]); const s = artSubj(k), st = NP.ART[k].style === "natural" ? "Realistic" : "Bold";
      cards[k].querySelector(".note").innerHTML = NP.ART[k].subject === sp.key ? `<span class="tag">${st}</span>` : `${s ? s.label : ""} \u00b7 ${st}`; }
    $("kittl-sub").textContent = `${sp.label} first, then more ${(NP.CATEGORIES.find((c) => c.key === NP.categoryOf(sp)) || {}).label || ""} \u00b7 your name goes in the panel \u00b7 4 colors`;
    $("veh-group").hidden = !vehVisible();
  }
  function markCards() {
    for (const k of DESIGN_KEYS) cards[k].setAttribute("aria-checked", String(k === state.design));
    $("sel-title").textContent = D().label + (isBlank() ? " plate" : "");
    const fun = isFun(), veh = isVeh(), blank = isBlank();
    for (const k of ["burst", "rays", "confetti"]) $("f-" + k).parentNode.hidden = !fun;
    const art = !!D().art;
    $("f-frame").parentNode.hidden = veh || blank || isSign() || art; $("f-emblem").parentNode.hidden = veh || blank || isSign() || art;
    $("f-glare").parentNode.hidden = !veh;
    $("emblem-panel").hidden = veh || blank || art; $("badge-panel").hidden = !veh;
    $("hint").textContent = hintText();
  }
  const hintText = () => state.view !== "arrange" ? "Drag to turn" : D().frame ? "Tap any part to select it \u00b7 drag to move \u00b7 corner square resizes" : isBlank() ? "Drag the name, image or items \u00b7 tap an item to edit it" : "Tap an item to select it \u00b7 drag to move";

  /* ---------- Polymaker palettes and the swatch picker */
  function applyPalette(key) {
    state.palette = key; state.colors = NP.slotDefaults(key); state.pins = {};
    renderPalettes(); renderColors();
  }
  let morePals = false;
  function renderPalettes() {
    $("palettes").innerHTML = "";
    const fam = familyOf(state.design);
    let entries = Object.entries(NP.PALETTES).filter(([, p]) => (fam === "veh" ? !!p.vehicle : fam === "sign" ? !!p.sign : fam === "ref" ? !!p.refined : fam === "frame" || fam === "art" ? !!p.frame : !p.vehicle && !p.sign));
    const sp = subject(), first = [state.palette, sp.palette].filter(Boolean);
    entries.sort((a, b) => (first.includes(b[0]) ? 1 : 0) - (first.includes(a[0]) ? 1 : 0));
    const limit = fam === "std" ? 20 : 99, extra = entries.length - limit;
    if (!morePals && extra > 0) entries = entries.slice(0, limit);
    for (const [k, p] of entries) {
      const b = document.createElement("button"); b.className = "pal"; b.type = "button"; b.title = p.label; b.setAttribute("aria-label", p.label + " palette");
      b.setAttribute("aria-pressed", String(k === state.palette));
      b.innerHTML = (isVeh() ? [p.base, NP.slotDefaults(k).chrome, p.letters] : [p.base, p.accent, p.panel, p.bold]).map((c) => `<i style="background:${c}"></i>`).join("");
      b.addEventListener("click", () => { applyPalette(k); state.colorsTouched = true; recolorAll(); });
      $("palettes").appendChild(b);
    }
    if (extra > 0) { const m = document.createElement("button"); m.className = "small"; m.type = "button"; m.textContent = morePals ? "Fewer" : `${extra} more`; m.addEventListener("click", () => { morePals = !morePals; renderPalettes(); }); $("palettes").appendChild(m); }
  }
  const pmName = (hex) => { const c = NP.pmByHex(hex); return c ? `${c.name}` : hex; };
  const pmLine = (hex) => { const c = NP.pmByHex(hex); return c ? (c.line === "pro" ? "PLA Pro" : "PLA") : "custom"; };
  function renderColors() {
    const slots = slotsFor(state.design), eff = colorsFor(state.design), raw = colorsForRaw(state.design);
    const key = (s) => (D().layered || D().fun ? s : s === "accent" ? "raised" : s);
    $("colors").innerHTML = slots.map((s) => { const c = eff[key(s)] || state.colors[s], merged = raw[key(s)] && c.toUpperCase() !== raw[key(s)].toUpperCase();
      return `<button type="button" class="swatch" data-slot="${s}" aria-expanded="${state.pickSlot === s}"><i style="background:${c}"></i><b>${slotLabel(s)}</b><span>${pmName(c)} \u00b7 ${pmLine(c)}${merged ? " \u00b7 shared" : ""}</span></button>`; }).join("");
    if (state.pickSlot && !slots.includes(state.pickSlot)) closePicker();
    else if (state.pickSlot) $("picker-title").textContent = "Filament for " + slotLabel(state.pickSlot);
  }
  $("colors").addEventListener("click", (e) => { const b = e.target.closest(".swatch"); if (!b) return; if (state.pickSlot === b.dataset.slot) closePicker(); else openPicker(b.dataset.slot); });
  function openPicker(slot) {
    state.pickSlot = slot; const c = NP.pmByHex(state.colors[slot]); if (c) state.pickLine = c.line;
    $("picker").hidden = false; $("picker-title").textContent = "Filament for " + slotLabel(slot);
    renderPicker(); renderColors();
  }
  function closePicker() { state.pickSlot = null; $("picker").hidden = true; renderColors(); }
  function renderPicker() {
    for (const b of $("picker").querySelectorAll("[data-line]")) b.setAttribute("aria-pressed", String(b.dataset.line === state.pickLine));
    const cur = (state.colors[state.pickSlot] || "").toUpperCase();
    $("pmgrid").innerHTML = NP.POLYMAKER.filter((c) => c.line === state.pickLine).map((c) => `<button type="button" class="pm" role="radio" aria-checked="${c.hex === cur}" data-hex="${c.hex}" title="${c.product} ${c.name} ${c.hex}"><i style="background:${c.hex}"></i>${c.name}</button>`).join("");
  }
  $("picker").addEventListener("click", (e) => {
    const l = e.target.closest("[data-line]"); if (l) { state.pickLine = l.dataset.line; renderPicker(); return; }
    const b = e.target.closest(".pm"); if (!b || !state.pickSlot) return;
    state.colors[state.pickSlot] = b.dataset.hex; state.colorsTouched = true; state.palette = null; state.pins[state.pickSlot] = ++state.pinSeq;
    renderPicker(); renderPalettes(); renderColors(); recolorAll(); if (state.selPart) showPart();
  });
  $("picker-close").addEventListener("click", closePicker);
  $("maxc").addEventListener("click", (e) => { const b = e.target.closest("[data-n]"); if (!b) return; state.maxColors = +b.dataset.n; for (const x of $("maxc").querySelectorAll("button")) x.setAttribute("aria-pressed", String(x === b)); renderColors(); recolorAll(); buildThumbs(); });
  function recolorAll() {
    for (const k of DESIGN_KEYS) {
      const svg = cards[k].querySelector(".thumb svg"); if (!svg || familyOf(k) !== familyOf(state.design)) continue;
      const cs = colorsFor(k);
      svg.querySelectorAll("path[data-slot]").forEach((p) => p.setAttribute("fill", cs[p.dataset.slot] || "#888"));
    }
    const a = $("arrange").querySelector("svg");
    if (a) { const cs = colorsFor(state.design); a.querySelectorAll("path[data-slot]").forEach((p) => p.setAttribute("fill", cs[p.dataset.slot] || "#888")); }
    if (three) for (const m of three.group.children) { m.material.color.set(colorsFor(state.design)[m.userData.slot] || "#888"); }
    render3D(); showPlan(); showMesh(); drawImagePreview();
  }

  /* ---------- the chart (notes) */
  (() => {
    const S = NP.PM_SPECS;
    const table = (line) => `<div><h3>${S[line].line}</h3><div class="pmgrid" style="margin-top:6px">` + NP.POLYMAKER.filter((c) => c.line === line).map((c) => `<div class="pm" style="cursor:default"><i style="background:${c.hex}"></i>${c.name}<small>${c.hex}</small></div>`).join("") + `</div></div>`;
    const rows = ["nozzle", "bed", "speed", "fan", "retractDD", "retractBowden", "dry"], names = { nozzle: "Nozzle", bed: "Bed", speed: "Speed", fan: "Cooling fan", retractDD: "Retraction (direct drive)", retractBowden: "Retraction (Bowden)", dry: "Drying" };
    $("chart").innerHTML = table("pla") + table("pro") +
      `<div><h3>Polymaker's recommended settings</h3><table><thead><tr><th></th><th>PolyLite PLA</th><th>PolyLite PLA Pro</th></tr></thead><tbody>` +
      rows.map((r) => `<tr><td>${names[r]}</td><td>${S.pla[r]}</td><td>${S.pro[r]}</td></tr>`).join("") + `</tbody></table>
      <p class="label" style="margin:6px 0 0">Colors are Polymaker's published swatch values. Settings are from Polymaker's product pages; check your spool's label for the batch you have.</p></div>`;
  })();

  /* ---------- ideas: ten per subject */
  let ideaList = [], ideaGen = 0;
  function ideaParams(ex, h) {
    const d = NP.DESIGNS[ex.design];
    return { design: ex.design, h, icon: ex.icon, text: ex.name, sub: ex.sub, number: ex.number, width: 170, base: 3, raise: 1.2, upper: true, font: "auto", bevel: false, badge: ex.badge || "none",
      motifs: (subject().icons || []).slice(0, 3), theme: NP.themeOf(subject()), parts: ex.parts || {},
      features: { frame: true, emblem: true, burst: true, rays: true, confetti: true, glare: true }, items: d.fun ? ex.items : ex.items.map((it) => Object.assign({}, it, { slot: "raised" })) };
  }
  function renderIdeas() {
    const sp = subject(); ideaList = NP.examplesFor(sp);
    $("ideas-h").textContent = `10 ${sp.label} ideas`;
    $("ideas").innerHTML = "";
    ideaList.forEach((ex) => {
      const c = document.createElement("button"); c.className = "card idea"; c.type = "button";
      c.innerHTML = `<div class="thumb">Drawing\u2026</div><div class="meta"><b></b><span>${NP.DESIGNS[ex.design].label}</span></div>`;
      c.querySelector("b").textContent = ex.name;
      c.addEventListener("click", () => loadIdea(ex));
      $("ideas").appendChild(c);
    });
  }
  async function buildIdeas() {
    const gen = ++ideaGen, cardsEl = $("ideas").children;
    for (let i = 0; i < ideaList.length; i++) {
      await new Promise((r) => setTimeout(r, 0));
      if (gen !== ideaGen) return;
      try {
        const ex = ideaList[i];
        const r = await run({ kind: "thumb", params: ideaParams(ex, NP.DESIGNS[ex.design].layered ? 0.6 : NP.DESIGNS[ex.design].fun ? 0.7 : 0.55), colors: colorsFor(ex.design, NP.slotDefaults(ex.palette)) });
        if (gen !== ideaGen) return;
        cardsEl[i].querySelector(".thumb").innerHTML = r.svg;
      } catch (e) { if (cardsEl[i]) cardsEl[i].querySelector(".thumb").textContent = "Could not draw"; }
    }
  }
  function loadIdea(ex) {
    $("name").value = ex.name; $("sub").value = ex.sub; if (ex.number) $("number").value = ex.number;
    state.parts = JSON.parse(JSON.stringify(ex.parts || {})); state.selPart = null; undoStack.length = 0; $("parts-undo").disabled = true;
    state.design = state.tplDesign = ex.design; state.icon = ex.icon; state.items = ex.items.map((it) => Object.assign({}, it)); state.badge = ex.badge || "none";
    for (const k of ["frame", "emblem", "burst", "rays", "confetti", "glare"]) $("f-" + k).checked = true;
    $("font").value = "auto"; $("upper").checked = true;
    applyPalette(ex.palette); state.colorsTouched = true;
    markCards(); renderIcons(); renderBadges(); select(-1); setView("arrange"); orderCards();
    buildFull(); buildThumbs();
    $("stage").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- thumbnails: one at a time, newest settings win */
  let thumbGen = 0;
  // thumbnails only draw for cards on (or near) the screen, after the main plate has finished building;
  // cards further down are marked stale and draw when they scroll into view
  const nearView = new Set(), stale = new Set();
  let thumbKick = 0;
  const cardIO = "IntersectionObserver" in window ? new IntersectionObserver((ents) => {
    let need = false;
    for (const en of ents) { const k = en.target.dataset.key; if (en.isIntersecting) { nearView.add(k); if (stale.has(k)) need = true; } else nearView.delete(k); }
    if (need) { clearTimeout(thumbKick); thumbKick = setTimeout(() => buildThumbs(true), 120); }
  }, { rootMargin: "300px 0px" }) : null;
  const fullIdle = () => new Promise((res) => { const t = () => ($("busy").hidden ? res() : setTimeout(t, 60)); t(); });
  async function buildThumbs(onlyStale) {
    if (state.mode !== "tpl") return;
    const gen = ++thumbGen;
    if (cardIO && !cardIO._on) { cardIO._on = true; for (const k in cards) cardIO.observe(cards[k]); }
    await fullIdle(); if (gen !== thumbGen) return;
    const sp = subject();
    const keys = FRAMES.concat(vehVisible() ? (sp.vehicles || []).concat(VEH) : []).concat(FRAMES, REF, sp.signs || [], SIGN, sp.designs || [], FUN, SIMPLE).filter((v, i, a) => a.indexOf(v) === i && NP.DESIGNS[v]);
    if (!onlyStale) for (const k of keys) stale.add(k);
    for (const k of keys) {
      if (gen !== thumbGen) return;
      if (cardIO && !nearView.has(k)) continue;
      if (!stale.has(k)) continue;
      try {
        const cols = familyOf(k) !== familyOf(state.design) || (familyOf(k) === "sign" && k !== state.design) ? NP.slotDefaults(familyPalette(k)) : state.colors;
        const r = await run({ kind: "thumb", params: Object.assign(params(k, NP.DESIGNS[k].layered ? 0.6 : NP.DESIGNS[k].fun ? 0.6 : 0.5, true), { bevel: false }), colors: colorsFor(k, cols) });
        if (gen !== thumbGen) return; // still stale: the newer pass will draw it
        cards[k].querySelector(".thumb").innerHTML = r.svg; stale.delete(k);
      } catch (e) { cards[k].querySelector(".thumb").textContent = "Could not draw"; stale.delete(k); }
    }
  }

  /* ---------- full model */
  const SAVE_BUTTONS = ["save", "save-std", "save-stl", "save-readme"];
  let fullGen = 0, fullTimer = 0;
  function buildFull() {
    clearTimeout(fullTimer);
    $("busy").hidden = false; for (const id of SAVE_BUTTONS) $(id).disabled = true;
    fullTimer = setTimeout(async () => {
      const gen = ++fullGen;
      try {
        const r = await run({ kind: "full", params: params(state.design, D().layered ? 0.25 : isFun() ? 0.3 : 0.25, true), colors: colorsFor(state.design) });
        if (gen !== fullGen) return;
        if (state.items.some((it) => it.x == null) && r.items) state.items = r.items.map((it) => Object.assign({}, it));
        state.full = r; state.fullDesign = state.design; if (state.selPart && !FIXED_SLOT[state.selPart] && !(r.partBoxes && (r.partBoxes[state.selPart] || state.selPart === "trim" || (state.parts[state.selPart] || {}).hide))) state.selPart = null; renderPartChips(); showPart(); drawArrange(); show3D(); showSpecs(); showMesh(); showPlan(); renderColors(); recolorAll();
        $("status").textContent = state.note || ""; state.note = "";
        checkPrint(gen);
      } catch (e) { if (gen === fullGen) $("status").textContent = "That combination could not be built. Try a shorter name or move the toolbox items."; }
      if (gen === fullGen) { $("busy").hidden = true; for (const id of SAVE_BUTTONS) $(id).disabled = false; }
    }, 120);
  }

  /* ---------- arrange view (top-down; drag items, and in blank mode the name and the image) */
  function drawArrange() {
    const box = $("arrange"); if (!state.full) return;
    let svg = state.full.svg.replace("<svg ", `<svg preserveAspectRatio="xMidYMid meet" `);
    const handles = state.items.map((it, i) => {
      if (it.x == null) return "";
      const r = it.size * 0.72, d = (iconSVG(it.key).match(/ d="([^"]*)"/) || [])[1] || "", k = it.size / 40;
      return `<g class="handle${i === state.sel ? " sel" : ""}" data-kind="item" data-i="${i}" transform="translate(${it.x} ${-it.y})">
        <path d="${d}" transform="rotate(${-(it.rot || 0)}) scale(${k})" fill="none" stroke="${i === state.sel ? "currentColor" : "rgba(0,0,0,.45)"}" stroke-width="${0.5 / k}" stroke-dasharray="${1.4 / k} ${1 / k}"/>
        <circle r="${r}" fill="rgba(255,255,255,0.001)" stroke="${i === state.sel ? "currentColor" : "rgba(0,0,0,.35)"}" stroke-width="${i === state.sel ? 0.9 : 0.5}" stroke-dasharray="2 1.6"/></g>`;
    }).join("");
    const rectHandle = (kind, b, color) => b ? `<g class="handle" data-kind="${kind}"><rect x="${b[0] - 1.5}" y="${-b[3] - 1.5}" width="${b[2] - b[0] + 3}" height="${b[3] - b[1] + 3}" rx="2" fill="rgba(255,255,255,0.001)" stroke="${color}" stroke-width="0.6" stroke-dasharray="2.4 1.6"/></g>` : "";
    let extra = isBlank() ? rectHandle("img", state.full.imageBox, "rgba(0,0,0,.45)") + rectHandle("text", state.full.textBox, "rgba(0,0,0,.35)") : "";
    const vb = (state.full.svg.match(/viewBox="([^"]+)"/) || [, "0 0 200 100"])[1].split(/\s+/).map(Number);
    const grip = Math.max(2.2, vb[2] / Math.max(240, $("arrange").clientWidth || 600) * 7); // ~14px grip on screen, larger on phones
    if (state.full.partBoxes && state.fullDesign === state.design) for (const [n, b] of Object.entries(state.full.partBoxes)) if (b) {
      const on = n === state.selPart;
      extra += `<g class="handle" data-kind="part" data-part="${n}" tabindex="0" role="button" aria-label="${PART_NAMES[n]}${on ? ", selected. Arrow keys move, plus and minus resize" : ""}" aria-pressed="${on}"><rect x="${b[0]}" y="${-b[3]}" width="${b[2] - b[0]}" height="${b[3] - b[1]}" rx="2" fill="rgba(255,255,255,0.001)" stroke="${on ? "currentColor" : "rgba(0,0,0,.28)"}" stroke-width="${on ? 0.9 : 0.45}" stroke-dasharray="2.4 1.6"/>${on ? `<circle cx="${b[2]}" cy="${-b[1]}" r="${grip * 2.2}" fill="rgba(255,255,255,0.001)" data-resize="1"/><rect x="${b[2] - grip}" y="${-b[1] - grip}" width="${grip * 2}" height="${grip * 2}" rx="${grip * 0.3}" fill="currentColor" stroke="#fff" stroke-width="0.5" data-resize="1"/>` : ""}</g>`;
    }
    box.innerHTML = svg.replace("</svg>", `<g id="ov" style="color:var(--accent)">${extra}${handles}</g></svg>`);
    const sv = box.querySelector("svg"); sv.setAttribute("role", "group"); sv.setAttribute("aria-label", "Nameplate preview. Select a part to move or resize it.");
    if (state.selPart && document.activeElement === document.body && box.dataset.kbd === "1") { const h = box.querySelector(`.handle[data-part="${state.selPart}"]`); if (h) h.focus(); }
    box.querySelector("svg").addEventListener("pointerdown", onDown);
  }
  let drag = null;
  function toModel(svg, e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return [q.x, -q.y]; }
  function onDown(e) {
    const g = e.target.closest(".handle"); const svg = e.currentTarget;
    if (!g) { if (state.sel >= 0) select(-1); if (state.selPart) selectPart(null); return; }
    const kind = g.dataset.kind; const [mx, my] = toModel(svg, e);
    if (kind === "part") {
      const n = g.dataset.part; selectPart(n);
      const svg2 = $("arrange").querySelector("svg"), g2 = svg2.querySelector(`.handle[data-kind="part"][data-part="${n}"]`);
      snapParts();
      const pp = state.parts[n] = Object.assign({ dx: 0, dy: 0, s: 1 }, state.parts[n]);
      const b = state.full.partBoxes[n], cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
      drag = { kind, obj: pp, part: n, svg: svg2, g: g2, moved: false, mx0: mx, my0: my, x0: pp.dx, y0: pp.dy, s0: pp.s, resize: !!e.target.dataset.resize, cx, cy, r0: Math.max(4, Math.hypot(mx - cx, my - cy)) };
    } else if (kind === "item") {
      const i = +g.dataset.i; select(i);
      const svg2 = $("arrange").querySelector("svg"), g2 = svg2.querySelector(`.handle[data-kind="item"][data-i="${i}"]`);
      const it = state.items[i]; drag = { kind, obj: it, dx: it.x - mx, dy: it.y - my, svg: svg2, g: g2, moved: false, x0: it.x, y0: it.y };
    } else {
      const obj = kind === "img" ? state.imgOpts : state.blank;
      const ox = kind === "img" ? obj.x : obj.textX, oy = kind === "img" ? obj.y : obj.textY;
      drag = { kind, obj, dx: ox - mx, dy: oy - my, svg, g, moved: false, x0: ox, y0: oy };
    }
    drag.svg.setPointerCapture(e.pointerId);
    drag.svg.addEventListener("pointermove", onMove); drag.svg.addEventListener("pointerup", onUp); drag.svg.addEventListener("pointercancel", onUp);
    e.preventDefault();
  }
  function onMove(e) {
    if (!drag) return; const [mx, my] = toModel(drag.svg, e);
    const nx = Math.round((mx + drag.dx) * 2) / 2, ny = Math.round((my + drag.dy) * 2) / 2;
    if (drag.kind === "part") {
      if (drag.resize) { const s = Math.max(0.5, Math.min(2, drag.s0 * Math.hypot(mx - drag.cx, my - drag.cy) / drag.r0)); drag.obj.s = Math.round(s * 20) / 20; const f = drag.obj.s / drag.s0; drag.g.setAttribute("transform", `translate(${drag.cx} ${-drag.cy}) scale(${f}) translate(${-drag.cx} ${drag.cy})`); showPart(); }
      else { drag.obj.dx = Math.round((drag.x0 + mx - drag.mx0) * 2) / 2; drag.obj.dy = Math.round((drag.y0 + my - drag.my0) * 2) / 2; drag.g.setAttribute("transform", `translate(${drag.obj.dx - drag.x0} ${-(drag.obj.dy - drag.y0)})`); }
      drag.moved = true; return;
    }
    if (drag.kind === "item") { drag.obj.x = nx; drag.obj.y = ny; drag.g.setAttribute("transform", `translate(${nx} ${-ny})`); }
    else { if (drag.kind === "img") { drag.obj.x = nx; drag.obj.y = ny; } else { drag.obj.textX = nx; drag.obj.textY = ny; } drag.g.setAttribute("transform", `translate(${nx - drag.x0} ${-(ny - drag.y0)})`); }
    drag.moved = true;
  }
  function onUp() {
    if (!drag) return; const moved = drag.moved;
    drag.svg.removeEventListener("pointermove", onMove); drag.svg.removeEventListener("pointerup", onUp); drag.svg.removeEventListener("pointercancel", onUp);
    drag = null; if (moved) { buildFull(); buildThumbs(); }
  }

  /* ---------- 3D view */
  let three = null;
  const MAT = { chrome: { roughness: 0.28, metalness: 0.75 }, glass: { roughness: 0.12, metalness: 0.1 }, lights: { roughness: 0.2, metalness: 0.05 }, tires: { roughness: 0.85, metalness: 0 } };
  function initThree() {
    if (three || !window.THREE) return three;
    try {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.domElement.hidden = true;
      $("stage").prepend(renderer.domElement);
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 4 / 3, 1, 5000);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 0.75));
      const dl = new THREE.DirectionalLight(0xffffff, 0.7); dl.position.set(-0.6, 1.0, 1.4); scene.add(dl);
      const dl2 = new THREE.DirectionalLight(0xffffff, 0.25); dl2.position.set(1, -0.4, 0.8); scene.add(dl2);
      const group = new THREE.Group(); scene.add(group);
      three = { renderer, scene, camera, group, rx: -0.6, rz: 0.2 };
      let d = null; const el = renderer.domElement;
      el.addEventListener("pointerdown", (e) => { d = { x: e.clientX, y: e.clientY, rx: three.rx, rz: three.rz }; el.setPointerCapture(e.pointerId); });
      el.addEventListener("pointermove", (e) => { if (!d) return; three.rz = d.rz + (e.clientX - d.x) * 0.01; three.rx = Math.max(-1.45, Math.min(0.2, d.rx + (e.clientY - d.y) * 0.01)); render3D(); });
      el.addEventListener("pointerup", () => { d = null; });
      new ResizeObserver(render3D).observe($("stage"));
      return three;
    } catch (e) { return null; }
  }
  function show3D() {
    const t = initThree(); if (!t || !state.full) return;
    while (t.group.children.length) { const c = t.group.children.pop(); c.geometry.dispose(); c.material.dispose(); }
    const cs = colorsFor(state.design);
    for (const [slot, m] of Object.entries(state.full.meshes)) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(m.v, 3)); g.setIndex(new THREE.BufferAttribute(m.t, 1));
      const gn = g.toNonIndexed(); gn.computeVertexNormals(); g.dispose();
      const mat = Object.assign({ color: cs[slot] || "#888", roughness: 0.55, metalness: 0.02 }, MAT[slot] || {});
      const mesh = new THREE.Mesh(gn, new THREE.MeshStandardMaterial(mat));
      mesh.userData.slot = slot; t.group.add(mesh);
    }
    const bb = state.full.bbox; t.span = Math.max(bb[2] - bb[0], (bb[3] - bb[1]) * 4 / 3); t.cy = (bb[1] + bb[3]) / 2;
    render3D();
  }
  function render3D() {
    const t = three; if (!t || !t.span || state.view !== "3d") return;
    const st = $("stage"), w = st.clientWidth, h = st.clientHeight;
    t.renderer.setSize(w, h, false); t.camera.aspect = w / h; t.camera.updateProjectionMatrix();
    t.group.rotation.set(t.rx, 0, t.rz); t.group.position.set(0, -t.cy * Math.cos(t.rx), 0);
    t.camera.position.set(0, 0, (t.span / (2 * Math.tan((30 * Math.PI) / 360))) * 1.05); t.camera.lookAt(0, 0, 0);
    t.renderer.render(t.scene, t.camera);
  }
  function setView(v) {
    state.view = v;
    $("tab-arrange").setAttribute("aria-selected", String(v === "arrange")); $("tab-3d").setAttribute("aria-selected", String(v === "3d"));
    $("arrange").hidden = v !== "arrange";
    const t = initThree(); if (t) t.renderer.domElement.hidden = v !== "3d";
    $("hint").textContent = hintText();
    if (v === "3d") { if (!t) { $("hint").textContent = "3D preview unavailable here"; } render3D(); }
  }
  $("tab-arrange").addEventListener("click", () => setView("arrange"));
  $("tab-3d").addEventListener("click", () => setView("3d"));

  /* ---------- readouts */
  function showSpecs() {
    const r = state.full, bb = r.bbox, w = bb[2] - bb[0] - 8, h = bb[3] - bb[1] - 8;
    $("base-v").textContent = (+$("base").value).toFixed(1) + " mm"; $("raise-v").textContent = (+$("raise").value).toFixed(1) + " mm";
    if ($("h-auto").checked) { $("height-n").value = Math.round(h); $("height").value = Math.round(h); }
    $("specs").innerHTML = `<dt>Overall</dt><dd>${w.toFixed(0)} \u00d7 ${h.toFixed(0)} \u00d7 ${r.top.toFixed(1)} mm</dd>` +
      (r.fun ? "" : `<dt>Filament swap</dt><dd>at ${(+$("base").value).toFixed(1)} mm</dd>`) +
      `<dt>Letter height</dt><dd>${isFinite(r.textHeight) ? r.textHeight.toFixed(1) + " mm" : "\u2014"}</dd>`;
    const warn = $("warn"), msgs = [];
    if (plateText() && (!isFinite(r.textHeight) || !r.textHeight)) msgs.push("None of those characters are in the lettering fonts. Use letters A\u2013Z, numbers and & ' - . ! # , / ? : \" @ +");
    else if (isFinite(r.textHeight) && r.textHeight < 6) msgs.push(`Letters are ${r.textHeight.toFixed(1)} mm tall. Make the plate bigger or shorten the name for a crisper print (or print at 0.12 mm layers).`);
    if (Math.max(w, h) > 250) msgs.push(`At ${Math.round(Math.max(w, h))} mm it is bigger than a 256 mm print bed allows once the prime tower is added.`);
    else if (Math.max(w, h) > 175) msgs.push(`Fits X1, P1 and A1 beds (256 mm), not an A1 mini (180 mm).`);
    warn.hidden = !msgs.length; warn.textContent = msgs.join(" ");
  }
  function showPlan() {
    if (!state.full) return;
    const cs = colorsFor(state.design), uniq = [], rows = [];
    for (const slot of state.full.slots) {
      const c = (cs[slot] || "#888888").toUpperCase(); let i = uniq.indexOf(c); if (i < 0) { uniq.push(c); i = uniq.length - 1; rows.push({ c, parts: [] }); }
      rows[i].parts.push(state.full.labels[slot] || slotLabel(slot));
    }
    $("filaments").innerHTML = `<b class="label">${uniq.length} filament${uniq.length === 1 ? "" : "s"}, AMS order</b>` + rows.map((r, i) => { const pm = NP.pmByHex(r.c);
      return `<div><span class="val">${i + 1}</span><span class="dots"><i style="background:${r.c}"></i></span><span>${pm ? `${pm.product} ${pm.name}` : r.c} <small>\u00b7 ${r.parts.join(", ")}</small></span></div>`; }).join("");
  }
  function showMesh() {
    const r = state.full; if (!r) return; const cs = colorsFor(state.design), ok = r.checks.every((c) => !c.bad && c.volume > 0);
    $("mesh").innerHTML = `<p style="margin:0 0 6px" class="${ok ? "ok" : "no"}">${ok ? "All parts watertight and ready to slice" : "A part has open edges. Move or resize the toolbox items, then check again."}</p>
      <table class="mesh"><thead><tr><th>Part</th><th>Triangles</th><th>Grams</th><th>Check</th></tr></thead><tbody>` +
      r.checks.map((c) => `<tr><td><span class="dots"><i style="background:${cs[c.slot] || "#888"}"></i></span> ${c.label}</td><td>${c.tris.toLocaleString()}</td><td>${(c.volume / 1000 * 1.24).toFixed(1)}</td><td class="${!c.bad && c.volume > 0 ? "ok" : "no"}">${!c.bad && c.volume > 0 ? "Watertight" : c.bad + " open edges"}</td></tr>`).join("") + `</tbody></table>
      <p class="label" style="margin:6px 0 0">Grams if printed solid; infill makes it less.</p>`;
  }

  /* ---------- print check: wall thickness, letter size, layer heights, bed size */
  async function checkPrint(gen) {
    const box = $("printcheck"); box.innerHTML = `<p class="label">Checking wall thickness and letter size\u2026</p>`;
    try {
      const { report } = await run({ kind: "check" });
      if (gen !== fullGen) return;
      state.printReport = report;
      const size = `${report.size[0].toFixed(0)} \u00d7 ${report.size[1].toFixed(0)} mm` + (report.textHeight ? ` \u00b7 letters ${report.textHeight.toFixed(1)} mm tall` : "");
      box.innerHTML = report.clean
        ? `<p class="ok">Ready to print: walls and letters are thick enough. ${size}</p>`
        : `<p class="${report.ok ? "caution" : "no"}">${report.ok ? "Prints, with notes:" : "Won't print as it is:"} ${size}</p><ul>` +
          report.issues.map((i) => `<li class="${i.level === "error" ? "no" : "caution"}">${esc(i.text)}</li>`).join("") + "</ul>";
      $("save-stl").disabled = $("save").disabled = $("save-std").disabled = !report.ok;
    } catch (e) { if (gen === fullGen) box.innerHTML = `<p class="label">The print check could not run. The files still save.</p>`; }
  }
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /* ---------- saving: 3MF + README, or STL */
  const slug = () => ((plateText() || "nameplate") + " " + D().label).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "") || "nameplate";
  const exportInfo = (file) => ({ title: (plateText() || "Custom") + " nameplate", style: D().label + (isVeh() && state.badge !== "none" ? `, ${NP.BADGES[state.badge]} badge` : "") + ` \u00b7 ${NP.FINISHES[state.finish].label} finish`, file });
  function fileDownload(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  async function save(flavor) {
    if (!state.full) return;
    const base = slug() + (flavor === "bambu" ? "" : "-standard"), file = base + ".3mf", readmeName = base + "-README.txt";
    try {
      $("status").textContent = "Preparing the files\u2026";
      const r = await run({ kind: "export", file, colors: colorsFor(state.design), title: exportInfo(file).title, flavor, info: exportInfo(file) });
      const f3 = new File([r.bytes], file, { type: "model/3mf" }), fr = new File([r.readme], readmeName, { type: "text/plain" });
      const touch = matchMedia("(pointer: coarse)").matches;
      if (touch && navigator.canShare && navigator.canShare({ files: [f3, fr] })) {
        try { await navigator.share({ files: [f3, fr], title: file }); $("status").textContent = `Shared ${file} and its README.`; return; }
        catch (e) { if (e && e.name === "AbortError") { $("status").textContent = "Share cancelled."; return; } }
      }
      fileDownload(f3, file);
      setTimeout(() => fileDownload(fr, readmeName), 600);
      $("status").textContent = `Downloaded ${file} and ${readmeName}.`;
    } catch (e) { $("status").textContent = "Could not save the file. Try again."; }
  }
  async function saveSTL() {
    if (!state.full) return;
    const file = slug() + ".stl";
    try {
      $("status").textContent = "Preparing the STL\u2026";
      const r = await run({ kind: "stl", title: exportInfo(file).title });
      fileDownload(new Blob([r.bytes], { type: "model/stl" }), file);
      $("status").textContent = `Downloaded ${file} (one part, no colors: use the 3MF for a multi-color print).`;
    } catch (e) { $("status").textContent = "Could not save the STL. Try again."; }
  }
  async function saveReadme() {
    if (!state.full) return;
    const name = slug() + "-README.txt";
    try {
      const r = await run({ kind: "readme", colors: colorsFor(state.design), info: exportInfo(slug() + ".3mf") });
      fileDownload(new Blob([r.readme], { type: "text/plain" }), name); $("status").textContent = `Downloaded ${name}.`;
    } catch (e) { $("status").textContent = "Could not save the README. Try again."; }
  }
  $("save").addEventListener("click", () => save("bambu"));
  $("save-std").addEventListener("click", () => save("standard"));
  $("save-stl").addEventListener("click", saveSTL);
  $("save-readme").addEventListener("click", saveReadme);

  /* ---------- size */
  const PRESETS = { "120x40": [120, 40], "150x50": [150, 50], "170x0": [170, 0], "200x70": [200, 70], "220x0": [220, 0], "250x0": [250, 0], "175x0": [175, 0] };
  function syncSize(from) {
    if (from === "n") $("width").value = Math.max(60, Math.min(300, +$("width-n").value || 170));
    $("width-n").value = $("width").value;
    if (from === "hn") $("height").value = Math.max(20, Math.min(250, +$("height-n").value || 60));
    if (from !== "auto") $("height-n").value = $("height").value;
    $("h-row").style.opacity = $("h-auto").checked ? 0.55 : 1;
  }
  $("width").addEventListener("input", () => { syncSize(); $("preset").value = ""; debounced(false); });
  $("width-n").addEventListener("change", () => { syncSize("n"); $("preset").value = ""; refresh(false); });
  $("height").addEventListener("input", () => { $("h-auto").checked = false; syncSize(); $("preset").value = ""; debounced(false); });
  $("height-n").addEventListener("change", () => { $("h-auto").checked = false; syncSize("hn"); $("preset").value = ""; refresh(false); });
  $("h-auto").addEventListener("change", () => { syncSize("auto"); refresh(false); });
  $("preset").addEventListener("change", () => { const p = PRESETS[$("preset").value]; if (!p) return; $("width").value = p[0]; $("h-auto").checked = !p[1]; if (p[1]) $("height").value = p[1]; syncSize(); refresh(false); });

  /* ---------- blank mode */
  function setMode(m) {
    setTimeout(() => { try { renderMine(); } catch (e) {} }, 0);
    state.mode = m;
    $("mode-tpl").setAttribute("aria-pressed", String(m === "tpl")); $("mode-blank").setAttribute("aria-pressed", String(m === "blank"));
    $("tpl").hidden = m !== "tpl"; $("blank").hidden = m !== "blank";
    for (const el of document.querySelectorAll(".tpl-only")) el.hidden = m !== "tpl";
    $("inputs").classList.toggle("blank-mode", m === "blank");
    state.items = []; select(-1);
    if (m === "blank") { state.design = "blank"; if (!state.colorsTouched) applyPalette("pop"); if ($("h-auto").checked) { $("h-auto").checked = false; $("height").value = Math.round(+$("width").value * 0.4); syncSize(); } renderShapes(); }
    else { state.design = state.tplDesign; }
    $("tool-q").value = ""; markCards(); renderTools(); renderPalettes(); renderColors(); buildFull(); buildThumbs();    document.dispatchEvent(new CustomEvent("np:mode", { detail: m }));
  }
  $("mode-tpl").addEventListener("click", () => setMode("tpl"));
  $("mode-blank").addEventListener("click", () => setMode("blank"));
  let shapesDrawn = false;
  async function renderShapes() {
    const box = $("shapes");
    if (!shapesDrawn) {
      shapesDrawn = true;
      box.innerHTML = Object.entries(NP.BLANK_SHAPES).map(([k, v]) => `<button type="button" class="card" role="radio" data-shape="${k}" aria-checked="${k === state.blank.shape}"><div class="thumb">\u2026</div><div class="meta"><b>${v}</b></div></button>`).join("");
      for (const [k] of Object.entries(NP.BLANK_SHAPES)) {
        try {
          const r = await run({ kind: "thumb", params: { design: "blank", h: 1.2, text: "", width: 100, height: 60, base: 3, raise: 1.2, bevel: false, blank: { shape: k, border: true, borderW: 3 } }, colors: { base: state.colors.base, accent: state.colors.accent } });
          box.querySelector(`[data-shape="${k}"] .thumb`).innerHTML = r.svg;
        } catch (e) { /* leave the label */ }
      }
    }
    for (const b of box.querySelectorAll("[data-shape]")) b.setAttribute("aria-checked", String(b.dataset.shape === state.blank.shape));
  }
  $("shapes").addEventListener("click", (e) => { const b = e.target.closest("[data-shape]"); if (!b) return; state.blank.shape = b.dataset.shape; renderShapes(); buildFull(); });
  for (const id of ["b-borderw", "b-tsize"]) $(id).addEventListener("input", () => { showBlankVals(); debounced(false); });
  $("b-border").addEventListener("change", () => { renderColors(); refresh(false); });
  $("b-center").addEventListener("click", () => { state.blank.textX = 0; state.blank.textY = 0; buildFull(); });
  function showBlankVals() {
    $("b-borderw-v").textContent = (+$("b-borderw").value).toFixed(1) + " mm";
    $("b-tsize-v").textContent = +$("b-tsize").value ? $("b-tsize").value + " mm" : "Auto";
    $("i-thr-v").textContent = $("i-thr").value; $("i-size-v").textContent = $("i-size").value + " mm"; $("i-thick-v").textContent = (+$("i-thick").value).toFixed(1) + " mm";
  }

  /* ---------- image: drop, trace to 1-3 stacked layers */
  const drop = $("drop");
  drop.addEventListener("click", () => $("file").click());
  drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("file").click(); } });
  for (const ev of ["dragenter", "dragover"]) drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); });
  for (const ev of ["dragleave", "drop"]) drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); });
  drop.addEventListener("drop", (e) => { const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) loadImage(f); });
  $("file").addEventListener("change", () => { const f = $("file").files[0]; if (f) loadImage(f); $("file").value = ""; });
  // pasting an image works too
  document.addEventListener("paste", (e) => { if (state.mode !== "blank") return; const it = [...(e.clipboardData?.items || [])].find((x) => x.type.startsWith("image/")); if (it) loadImage(it.getAsFile()); });
  function loadImage(file) {
    if (!file || !/^image\//.test(file.type)) { $("status").textContent = "That file is not an image."; return; }
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const MAX = 220, sc = Math.min(1, MAX / Math.max(im.naturalWidth || 200, im.naturalHeight || 200));
      const w = Math.max(8, Math.round((im.naturalWidth || 200) * sc)), h = Math.max(8, Math.round((im.naturalHeight || 200) * sc));
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const ctx = c.getContext("2d"); ctx.drawImage(im, 0, 0, w, h);
      let data; try { const id = ctx.getImageData(0, 0, w, h); cutBackground(id); data = id.data; } catch (e) { $("status").textContent = "That image could not be read."; return; }
      URL.revokeObjectURL(url);
      state.imgSrc = { w, h, data };
      const W = +$("width").value, H = heightVal() || W * 0.4;
      const size = Math.round(Math.min(W * 0.32, (H * 0.7) * (w / h)));
      state.imgOpts.size = Math.max(10, size); $("i-size").value = state.imgOpts.size;
      state.imgOpts.x = Math.round(-W / 2 + 6 + state.imgOpts.size / 2 + 4); state.imgOpts.y = 0;
      state.imgOpts.thr = state.imgOpts.auto = autoThreshold(); $("i-thr").value = state.imgOpts.thr;
      if (Math.abs(state.blank.textX) < 1) state.blank.textX = Math.round(state.imgOpts.size / 2 + 4);
      $("img-tools").hidden = false; showBlankVals();
      traceImage(); renderColors(); buildFull();
    };
    im.onerror = () => { $("status").textContent = "That image could not be opened."; URL.revokeObjectURL(url); };
    im.src = url;
  }
  function lumaArray() {
    const { w, h, data } = state.imgSrc, L = new Float32Array(w * h), A = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) { L[i] = 0.299 * data[4 * i] + 0.587 * data[4 * i + 1] + 0.114 * data[4 * i + 2]; A[i] = data[4 * i + 3] > 127 ? 1 : 0; }
    const B = new Float32Array(w * h); // light 3x3 blur keeps specks from becoming islands
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0, n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; s += L[yy * w + xx]; n++; } B[y * w + x] = s / n; }
    return { L: B, A };
  }
  function autoThreshold() { // Otsu
    const { L, A } = lumaArray(), hist = new Array(256).fill(0); let n = 0;
    for (let i = 0; i < L.length; i++) if (A[i]) { hist[Math.max(0, Math.min(255, Math.round(L[i])))]++; n++; }
    if (!n) return 128;
    let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
    let sB = 0, wB = 0, best = 0, thr = 128;
    for (let t = 0; t < 256; t++) { wB += hist[t]; if (!wB) continue; const wF = n - wB; if (!wF) break; sB += t * hist[t]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) ** 2; if (v > best) { best = v; thr = t; } }
    return Math.max(10, Math.min(245, thr));
  }
  function traceImage() {
    if (!state.imgSrc) { state.img = null; return; }
    const { w, h } = state.imgSrc, { L, A } = lumaArray(), lv = state.imgOpts.levels, inv = state.imgOpts.invert, thr = state.imgOpts.thr;
    const labels = new Uint8Array(w * h);
    // dark = raised (invert for light-on-dark art). With 2-3 colors the image is split into tone bands
    // (1-D k-means); the threshold slider shifts every band edge together.
    let cuts = [thr];
    if (lv > 1) {
      const vals = []; for (let i = 0; i < w * h; i += 1) if (A[i]) vals.push(inv ? 255 - L[i] : L[i]);
      vals.sort((a, b) => a - b);
      let c = Array.from({ length: lv + 1 }, (_, k) => vals[Math.floor(((k + 0.5) / (lv + 1)) * (vals.length - 1))] || k * 60);
      for (let it = 0; it < 12; it++) {
        const s = new Array(lv + 1).fill(0), n = new Array(lv + 1).fill(0);
        for (const v of vals) { let bi = 0; for (let k = 1; k <= lv; k++) if (Math.abs(v - c[k]) < Math.abs(v - c[bi])) bi = k; s[bi] += v; n[bi]++; }
        c = c.map((x, k) => (n[k] ? s[k] / n[k] : x)).sort((a, b) => a - b);
      }
      const shift = thr - (state.imgOpts.auto || 128);
      cuts = []; for (let k = 0; k < lv; k++) cuts.push((c[k] + c[k + 1]) / 2 + shift);
    }
    for (let i = 0; i < w * h; i++) {
      if (!A[i]) continue;
      const v = inv ? 255 - L[i] : L[i];
      let lab = 0; for (let k = cuts.length - 1; k >= 0; k--) if (v < cuts[k]) lab = cuts.length - k;
      labels[i] = Math.min(lv, lab);
    }
    state.img = { w, h, labels, levels: lv, minArea: 0.8 };
    drawImagePreview();
  }
  function drawImagePreview() {
    const cv = $("img-prev"); if (!state.img) return;
    const { w, h, labels } = state.img; cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d"), out = ctx.createImageData(w, h);
    const cols = [null, state.colors.img1, state.colors.img2, state.colors.img3].map((c) => c && [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]);
    const bg = [parseInt(state.colors.base.slice(1, 3), 16), parseInt(state.colors.base.slice(3, 5), 16), parseInt(state.colors.base.slice(5, 7), 16)];
    for (let i = 0; i < w * h; i++) { const c = labels[i] ? cols[labels[i]] : bg; out.data.set([c[0], c[1], c[2], 255], 4 * i); }
    ctx.putImageData(out, 0, 0);
  }
  $("img-tools").addEventListener("click", (e) => { const b = e.target.closest("[data-lv]"); if (!b) return; state.imgOpts.levels = +b.dataset.lv; for (const x of $("img-tools").querySelectorAll("[data-lv]")) x.setAttribute("aria-pressed", String(x === b)); traceImage(); renderColors(); buildFull(); });
  $("i-invert").addEventListener("change", () => { state.imgOpts.invert = $("i-invert").checked; traceImage(); buildFull(); });
  $("i-thr").addEventListener("input", () => { state.imgOpts.thr = +$("i-thr").value; showBlankVals(); traceImage(); debounced(false); });
  $("i-size").addEventListener("input", () => { state.imgOpts.size = +$("i-size").value; showBlankVals(); debounced(false); });
  $("i-thick").addEventListener("input", () => { state.imgOpts.thicken = +$("i-thick").value; showBlankVals(); debounced(false); });
  $("i-remove").addEventListener("click", () => { state.img = null; state.imgSrc = null; $("img-tools").hidden = true; renderColors(); buildFull(); });

  /* ---------- a whole nameplate from one photo */
  const pdrop = $("photo-drop");
  pdrop.addEventListener("click", () => $("photo-file").click());
  pdrop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("photo-file").click(); } });
  for (const ev of ["dragenter", "dragover"]) pdrop.addEventListener(ev, (e) => { e.preventDefault(); pdrop.classList.add("over"); });
  for (const ev of ["dragleave", "drop"]) pdrop.addEventListener(ev, (e) => { e.preventDefault(); pdrop.classList.remove("over"); });
  pdrop.addEventListener("drop", (e) => { const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) photoPlate(f); });
  $("photo-file").addEventListener("change", () => { const f = $("photo-file").files[0]; if (f) photoPlate(f); $("photo-file").value = ""; });
  const hex2 = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();
  // flood-fill a plain background from the edges and make it transparent
  function removeBackground(src) {
    const { w, h, data } = src, N = w * h, d = new Uint8ClampedArray(data);
    const edge = []; for (let x = 0; x < w; x++) edge.push(x, (h - 1) * w + x); for (let y = 0; y < h; y++) edge.push(y * w, y * w + w - 1);
    let mr = 0, mg = 0, mb = 0; for (const i of edge) { mr += d[4 * i]; mg += d[4 * i + 1]; mb += d[4 * i + 2]; } mr /= edge.length; mg /= edge.length; mb /= edge.length;
    let sd = 0; for (const i of edge) sd += (d[4 * i] - mr) ** 2 + (d[4 * i + 1] - mg) ** 2 + (d[4 * i + 2] - mb) ** 2; sd = Math.sqrt(sd / edge.length);
    if (sd > 60) return { src, removed: false, bg: hex2(mr, mg, mb) }; // busy background: keep the whole picture
    const tol = Math.max(38, sd * 2.2), seen = new Uint8Array(N), stack = [];
    const close = (i) => (d[4 * i] - mr) ** 2 + (d[4 * i + 1] - mg) ** 2 + (d[4 * i + 2] - mb) ** 2 < tol * tol;
    for (const i of edge) if (!seen[i] && close(i)) { seen[i] = 1; stack.push(i); }
    while (stack.length) { const i = stack.pop(); d[4 * i + 3] = 0; const x = i % w, y = (i / w) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && !seen[j] && close(j)) { seen[j] = 1; stack.push(j); } }
    let kept = 0; for (let i = 0; i < N; i++) if (d[4 * i + 3]) kept++;
    if (kept < N * 0.04) return { src, removed: false, bg: hex2(mr, mg, mb) };
    return { src: { w, h, data: d }, removed: true, bg: hex2(mr, mg, mb) };
  }
  function photoPlate(file, allowed) {
    if (!file || !/^image\//.test(file.type)) { $("status").textContent = "That file is not an image."; return; }
    $("status").textContent = "Reading the photo\u2026";
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const MAX = 200, iw = im.naturalWidth || 200, ih = im.naturalHeight || 200, sc = Math.min(1, MAX / Math.max(iw, ih));
      const w = Math.max(8, Math.round(iw * sc)), h = Math.max(8, Math.round(ih * sc));
      const c = document.createElement("canvas"); c.width = w; c.height = h; const ctx = c.getContext("2d"); ctx.drawImage(im, 0, 0, w, h);
      let data; try { data = ctx.getImageData(0, 0, w, h).data; } catch (e) { $("status").textContent = "That photo could not be read."; return; }
      URL.revokeObjectURL(url);
      const bgr = removeBackground({ w, h, data });
      // switch to the blank builder and lay the plate out around the photo
      if (state.mode !== "blank") setMode("blank");
      state.imgSrc = bgr.src;
      const ar = w / h, W = +$("width").value;
      const shape = ar > 1.6 ? "rounded" : ar < 0.8 ? "arch" : bgr.removed ? "cloud" : "rounded";
      state.blank.shape = shape; renderShapes();
      const H = Math.round(Math.max(W * 0.38, Math.min(W * 0.62, (W * 0.45) / ar)));
      $("h-auto").checked = false; $("height").value = H; syncSize();
      state.imgOpts.levels = 3; for (const x of $("img-tools").querySelectorAll("[data-lv]")) x.setAttribute("aria-pressed", String(x.dataset.lv === "3"));
      state.imgOpts.invert = false; $("i-invert").checked = false;
      const size = Math.round(Math.min(W * 0.42, (H - 16) * ar)); state.imgOpts.size = Math.max(14, size); $("i-size").value = state.imgOpts.size;
      state.imgOpts.x = Math.round(-W / 2 + 10 + state.imgOpts.size / 2); state.imgOpts.y = 0;
      state.imgOpts.thr = state.imgOpts.auto = autoThreshold(); $("i-thr").value = state.imgOpts.thr; state.imgOpts.thicken = 0.2; $("i-thick").value = 0.2;
      state.blank.textX = Math.round(state.imgOpts.x + state.imgOpts.size / 2 + (W / 2 - 10 - (state.imgOpts.x + state.imgOpts.size / 2)) / 2); state.blank.textY = 0;
      if (!state.blank.textX || state.imgOpts.size > W * 0.7) state.blank.textX = 0;
      $("img-tools").hidden = false; showBlankVals();
      traceImage(); photoColors(bgr, allowed);
      renderColors(); renderPalettes(); buildFull();
      state.note = bgr.removed ? "Background removed and the photo traced into 3 layers. Adjust anything below." : "Photo traced into 3 layers (the background was too busy to remove). Adjust anything below.";
      $("status").textContent = state.note;
      $("stage").scrollIntoView({ behavior: "smooth", block: "center" });
    };
    im.onerror = () => { $("status").textContent = "That photo could not be opened."; URL.revokeObjectURL(url); };
    im.src = url;
  }
  // colours: each traced layer takes the nearest Polymaker colour to the photo's own average colour there
  function photoColors(bgr, allowed) {
    const near = (hex, used) => { if (!allowed || !allowed.length) return NP.nearestPM(hex, null, used);
      const pool = allowed.filter((h) => !used.includes(h)); const list = pool.length ? pool : allowed; let best = list[0], bd = Infinity;
      for (const h of list) { const d = NP.labDist(hex, h); if (d < bd) { bd = d; best = h; } } return NP.pmByHex(best) || { hex: best }; };
    const { w, h, data } = state.imgSrc, lab = state.img.labels, sums = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    for (let i = 0; i < w * h; i++) { const L = lab[i]; if (!data[4 * i + 3]) continue; const s = sums[L]; s[0] += data[4 * i]; s[1] += data[4 * i + 1]; s[2] += data[4 * i + 2]; s[3]++; }
    const used = [];
    for (let L = 1; L <= 3; L++) {
      const s = sums[L]; if (!s[3]) continue;
      const c = near(hex2(s[0] / s[3], s[1] / s[3], s[2] / s[3]), used);
      state.colors["img" + L] = c.hex; used.push(c.hex);
    }
    const bgHex = bgr.removed ? bgr.bg : (sums[0][3] ? hex2(sums[0][0] / sums[0][3], sums[0][1] / sums[0][3], sums[0][2] / sums[0][3]) : "#EAECF5");
    const base = near(bgHex, used); state.colors.base = base.hex; used.push(base.hex);
    const dark = NP.isDark(base.hex);
    state.colors.letters = dark ? NP.pm("pla:cold-white").hex : NP.pm("pla:black").hex;
    state.colors.accent = state.colors.img1 || state.colors.letters; state.colors.bold = state.colors.img2 || state.colors.letters;
    state.palette = null; state.colorsTouched = true;
  }


  /* ---------- your own designs: drop pictures made elsewhere, match Polymaker colours, file them in a category */
  const IDB = { db: null,
    open() { if (this.db) return Promise.resolve(this.db); return new Promise((res) => { try { const r = indexedDB.open("nameplate-maker", 1); r.onupgradeneeded = () => r.result.createObjectStore("designs", { keyPath: "id" }); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => res(null); } catch (e) { res(null); } }); },
    async all() { const db = await this.open(); if (!db) return []; return new Promise((res) => { try { const q = db.transaction("designs").objectStore("designs").getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); } catch (e) { res([]); } }); },
    async put(d) { const db = await this.open(); if (!db) return false; return new Promise((res) => { try { const t = db.transaction("designs", "readwrite"); t.objectStore("designs").put(d); t.oncomplete = () => res(true); t.onerror = () => res(false); } catch (e) { res(false); } }); },
    async del(id) { const db = await this.open(); if (!db) return; return new Promise((res) => { try { const t = db.transaction("designs", "readwrite"); t.objectStore("designs").delete(id); t.oncomplete = () => res(); t.onerror = () => res(); } catch (e) { res(); } }); },
  };
  let mine = []; // in memory too, so it works even where storage is blocked
  const srgb2lab = (r, g, b) => { const f = (c) => { c /= 255; return c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92; }; const R = f(r), G = f(g), B = f(b);
    let x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, y = R * 0.2126 + G * 0.7152 + B * 0.0722, z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    const t = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116); x = t(x); y = t(y); z = t(z); return [116 * y - 16, 500 * (x - y), 200 * (y - z)]; };
  const hexRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const PM_LAB = NP.POLYMAKER.map((c) => ({ c, L: srgb2lab(...hexRGB(c.hex)) }));
  const nearPM = (lab, avoid = []) => { let b = null, bd = Infinity; for (const p of PM_LAB) { if (avoid.includes(p.c.hex)) continue; const d = (lab[0] - p.L[0]) ** 2 + (lab[1] - p.L[1]) ** 2 + (lab[2] - p.L[2]) ** 2; if (d < bd) { bd = d; b = p.c; } } return b; };
  // read an image file into a small canvas sample + a stored copy (max 900 px JPEG)
  function readDesign(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const iw = im.naturalWidth || 400, ih = im.naturalHeight || 300;
        const big = document.createElement("canvas"), sb = Math.min(1, 900 / Math.max(iw, ih)); big.width = Math.round(iw * sb); big.height = Math.round(ih * sb);
        const bx = big.getContext("2d"); bx.drawImage(im, 0, 0, big.width, big.height);
        try { const id = bx.getImageData(0, 0, big.width, big.height); if (cutBackground(id)) bx.putImageData(id, 0, 0); } catch (e) {}
        const sm = document.createElement("canvas"), ss = Math.min(1, 180 / Math.max(iw, ih)); sm.width = Math.max(8, Math.round(iw * ss)); sm.height = Math.max(8, Math.round(ih * ss));
        const sx = sm.getContext("2d"); sx.drawImage(im, 0, 0, sm.width, sm.height);
        let data; try { data = sx.getImageData(0, 0, sm.width, sm.height).data; } catch (e) { URL.revokeObjectURL(url); rej(e); return; }
        URL.revokeObjectURL(url);
        cutBackground({ width: sm.width, height: sm.height, data });
        let img = big.toDataURL("image/webp", 0.9); if (!/^data:image\/webp/.test(img)) img = big.toDataURL("image/png");
        res({ img, sample: { w: sm.width, h: sm.height, data } });
      };
      im.onerror = () => { URL.revokeObjectURL(url); rej(new Error("bad image")); };
      im.src = url;
    });
  }
  // dominant colours: drop the plain backdrop, k-means in Lab, snap each cluster to the nearest Polymaker filament,
  // merge clusters that land on the same filament, then merge the smallest until it fits the colour budget
  // backdrop = everything reachable from the image border through small colour steps; a smooth studio gradient,
  // floor and soft reflection all count, the object's edges stop it
  function bgMask(sample) {
    const { w, h, data } = sample, N = w * h, m = new Uint8Array(N), st = [];
    const diff = (a, b) => Math.hypot(data[4 * a] - data[4 * b], data[4 * a + 1] - data[4 * b + 1], data[4 * a + 2] - data[4 * b + 2]);
    const seed = (i) => { if (!m[i]) { m[i] = 1; st.push(i); } };
    for (let i = 0; i < N; i++) if (data[4 * i + 3] < 128) seed(i); // transparent PNG pixels
    let er = 0, eg = 0, eb = 0, en = 0; // mean border colour: the fill never wanders far from it, so it can't creep into a pale object
    for (let x = 0; x < w; x++) for (const i of [x, (h - 1) * w + x]) { er += data[4 * i]; eg += data[4 * i + 1]; eb += data[4 * i + 2]; en++; }
    for (let y = 0; y < h; y++) for (const i of [y * w, y * w + w - 1]) { er += data[4 * i]; eg += data[4 * i + 1]; eb += data[4 * i + 2]; en++; }
    er /= en; eg /= en; eb /= en;
    const nearBg = (j) => Math.hypot(data[4 * j] - er, data[4 * j + 1] - eg, data[4 * j + 2] - eb) < 75;
    for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); } for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
    const step = Math.max(7, 13 * Math.min(1, Math.sqrt(180 / Math.max(w, h))));
    while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && !m[j] && data[4 * j + 3] >= 128 && diff(i, j) < step && nearBg(j)) { m[j] = 1; st.push(j); } }
    let bg = 0; for (let i = 0; i < N; i++) bg += m[i];
    return bg > N * 0.03 && bg < N * 0.97 ? m : new Uint8Array(N); // nothing sensible found: use the whole picture
  }
  // every uploaded picture loses its backdrop: the bgMask region goes transparent, with a 1px soft edge
  function cutBackground(id) {
    const w = id.width, h = id.height, d = id.data, m = bgMask({ w, h, data: d });
    let any = 0; for (let i = 0; i < w * h; i++) if (m[i]) { any = 1; break; }
    if (!any) return false;
    for (let i = 0; i < w * h; i++) {
      if (m[i]) { d[4 * i + 3] = 0; continue; }
      const x = i % w, y = (i / w) | 0;
      if ((x > 0 && m[i - 1]) || (x < w - 1 && m[i + 1]) || (y > 0 && m[i - w]) || (y < h - 1 && m[i + w])) d[4 * i + 3] = Math.min(d[4 * i + 3], 170);
    }
    return true;
  }
  const labD = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  // dominant colours of the design (backdrop ignored): k-means in Lab, each cluster snapped to the nearest Polymaker
  // filament, near-identical filaments merged, then the two most similar merged until it fits the colour budget
  // (so a small bright accent like an orange ball survives, and two greys become one)
  function matchColors(sample, max) {
    const { w, h, data } = sample, bm = bgMask(sample), px = [];
    for (let i = 0; i < w * h; i++) if (!bm[i] && data[4 * i + 3] >= 128) px.push(srgb2lab(data[4 * i], data[4 * i + 1], data[4 * i + 2]));
    if (!px.length) return { colors: [], removed: false };
    const K = Math.min(12, px.length);
    px.sort((a, b) => a[0] - b[0]); let cen = Array.from({ length: K }, (_, k) => px[Math.floor(((k + 0.5) / K) * (px.length - 1))].slice());
    // seed two extra centres on the most colourful pixels so accents get a cluster of their own
    const vivid = px.slice().sort((a, b) => Math.hypot(b[1], b[2]) - Math.hypot(a[1], a[2]));
    cen[K - 1] = vivid[0].slice(); if (K > 2) cen[K - 2] = vivid[Math.floor(vivid.length * 0.03)].slice();
    const cnt = new Array(K).fill(0);
    for (let it = 0; it < 16; it++) {
      const s = cen.map(() => [0, 0, 0, 0]); cnt.fill(0);
      for (const q of px) { let bi = 0, bd = Infinity; for (let k = 0; k < K; k++) { const d = labD(q, cen[k]); if (d < bd) { bd = d; bi = k; } } const t = s[bi]; t[0] += q[0]; t[1] += q[1]; t[2] += q[2]; t[3]++; cnt[bi]++; }
      cen = cen.map((c, k) => (s[k][3] ? [s[k][0] / s[k][3], s[k][1] / s[k][3], s[k][2] / s[k][3]] : c));
    }
    const by = {};
    // photos and renders wash colours out (lighting, shadows), so colourful clusters get their saturation
    // lifted a little before snapping to a filament: a shaded orange still finds Orange, not beige
    const lift = (c) => { const ch = Math.hypot(c[1], c[2]); if (ch < 15) return c; const k = Math.min(1.45, 1 + 6 / Math.sqrt(ch)); return [Math.min(85, c[0] + 4), c[1] * k, c[2] * k]; };
    for (let k = 0; k < K; k++) { if (!cnt[k]) continue; const pm = nearPM(lift(cen[k])); const o = (by[pm.hex] = by[pm.hex] || { hex: pm.hex, n: 0, L: srgb2lab(...hexRGB(pm.hex)) }); o.n += cnt[k]; }
    let list = Object.values(by).sort((a, b) => b.n - a.n);
    const tot0 = px.length, chroma = (c) => Math.hypot(c.L[1], c.L[2]);
    list = list.filter((c, i) => i === 0 || c.n / tot0 > 0.015 || (chroma(c) > 25 && c.n / tot0 > 0.004));
    const mergeOnce = (limit) => { let bi = -1, bj = -1, bd = Infinity;
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) { const d = labD(list[i].L, list[j].L); if (d < bd) { bd = d; bi = i; bj = j; } }
      if (bi < 0 || bd > limit) return false; const keep = list[bi].n >= list[bj].n ? bi : bj, gone = keep === bi ? bj : bi;
      list[keep].n += list[gone].n; list.splice(gone, 1); return true; };
    while (mergeOnce(10 * 10)); // same colour in PLA and PLA Pro, etc.
    while (list.length > max && mergeOnce(Infinity));
    list.sort((a, b) => b.n - a.n);
    const tot = list.reduce((s, c) => s + c.n, 0);
    let bgCount = 0; for (let i = 0; i < w * h; i++) bgCount += bm[i];
    return { colors: list.map((c) => ({ hex: c.hex, pct: Math.max(1, Math.round((100 * c.n) / tot)) })), removed: bgCount > 0 };
  }
  // the design redrawn in its matched filaments (each pixel takes the nearest of the chosen colours)
  function drawMatched(canvas, sample, colors) {
    const { w, h, data } = sample; canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d"), out = ctx.createImageData(w, h), pal = colors.map((c) => ({ rgb: hexRGB(c.hex), L: srgb2lab(...hexRGB(c.hex)) }));
    const bm = bgMask(sample);
    for (let i = 0; i < w * h; i++) {
      if (!pal.length || bm[i]) { out.data.set([236, 233, 250, 255], 4 * i); continue; }
      const L = srgb2lab(data[4 * i], data[4 * i + 1], data[4 * i + 2]); let b = pal[0], bd = Infinity;
      for (const p of pal) { const d = labD(L, p.L); if (d < bd) { bd = d; b = p; } }
      out.data.set([b.rgb[0], b.rgb[1], b.rgb[2], 255], 4 * i);
    }
    ctx.putImageData(out, 0, 0);
  }
  const pmOptions = (sel) => ["pla", "pro"].map((line) => `<optgroup label="${line === "pro" ? "PolyLite PLA Pro" : "PolyLite PLA"}">` + NP.POLYMAKER.filter((c) => c.line === line).map((c) => `<option value="${c.hex}"${c.hex === sel ? " selected" : ""}>${c.name}</option>`).join("") + "</optgroup>").join("");
  const catOptions = (sel) => { const g = {}; for (const sp of NP.SUBJECTS) (g[sp.group] = g[sp.group] || []).push(sp);
    return Object.entries(g).map(([k, list]) => `<optgroup label="${GROUP_NAMES[k] || k}">` + list.map((sp) => `<option value="${sp.key}"${sp.key === sel ? " selected" : ""}>${sp.label}</option>`).join("") + "</optgroup>").join(""); };
  let imp = null; // the design open in the dialog: { d (record), sample, isNew }
  function renderImp() {
    const { d } = imp;
    $("imp-h").textContent = imp.isNew ? "Add your design" : d.title || "Your design";
    $("imp-orig").src = d.img; $("imp-title").value = d.title || ""; $("imp-cat").innerHTML = catOptions(d.cat);
    for (const b of $("imp-n").querySelectorAll("[data-n]")) b.setAttribute("aria-pressed", String(+b.dataset.n === d.max));
    $("imp-cols").innerHTML = d.colors.map((c, i) => { const pm = NP.pmByHex(c.hex);
      return `<div class="imp-row"><i style="background:${c.hex}"></i><select data-i="${i}" aria-label="Filament ${i + 1}">${pmOptions(c.hex)}</select><span>${c.pct}%</span></div>`; }).join("");
    $("imp-note").textContent = d.colors.length ? `${d.colors.length} filaments \u00b7 ${d.colors.map((c) => { const p = NP.pmByHex(c.hex); return p ? `${p.product} ${p.name}` : c.hex; }).join(", ")}` + (imp.removed ? " \u00b7 plain background ignored" : "") : "No colors found in that image.";
    if (imp.sample) drawMatched($("imp-match"), imp.sample, d.colors);
    $("imp-actions").innerHTML = imp.isNew
      ? `<button class="btn" type="button" id="imp-add">Add to page</button>`
      : `<button class="btn" type="button" id="imp-save">Save changes</button><button class="btn alt" type="button" id="imp-print">Make a printable plate from it</button><button class="small" type="button" id="imp-readme">Color README</button><button class="small danger" type="button" id="imp-del">Remove</button>`;
  }
  function sampleFromDataURL(src) { return new Promise((res) => { const im = new Image(); im.onload = () => { const s = Math.min(1, 180 / Math.max(im.width, im.height)); const c = document.createElement("canvas"); c.width = Math.max(8, Math.round(im.width * s)); c.height = Math.max(8, Math.round(im.height * s)); const x = c.getContext("2d"); x.drawImage(im, 0, 0, c.width, c.height); res({ w: c.width, h: c.height, data: x.getImageData(0, 0, c.width, c.height).data }); }; im.onerror = () => res(null); im.src = src; }); }
  async function importFiles(files) {
    const list = [...files].filter((f) => /^image\//.test(f.type));
    if (!list.length) { $("status").textContent = "Drop an image file (PNG, JPG, WebP)."; return; }
    for (const [n, f] of list.entries()) {
      let r; try { r = await readDesign(f); } catch (e) { $("status").textContent = `${f.name} could not be read.`; continue; }
      const max = state.maxColors || 4, m = matchColors(r.sample, max);
      const d = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 40), cat: subject().key, img: r.img, colors: m.colors, max, created: Date.now() };
      if (list.length > 1 && n < list.length - 1) { mine.push(d); await IDB.put(d); continue; } // several at once: file them all, open the last
      imp = { d, sample: r.sample, isNew: true, removed: m.removed }; renderImp();
      try { $("imp-dlg").showModal(); } catch (e) { $("imp-dlg").setAttribute("open", ""); }
    }
    if (list.length > 1) renderMine();
  }
  function renderMine() {
    const sp = subject(), here = mine.filter((d) => d.cat === sp.key).sort((a, b) => b.created - a.created);
    $("mine-group").hidden = !here.length || state.mode !== "tpl";
    $("mine-h").textContent = `My designs \u00b7 ${sp.label}`;
    $("mine").innerHTML = here.map((d) => `<button class="card" type="button" data-id="${d.id}"><div class="thumb"><img alt="" src="${d.img}"></div><div class="meta"><b>${(d.title || "Untitled").replace(/</g, "&lt;")}</b><span class="dots" aria-label="${d.colors.length} filaments">${d.colors.map((c) => `<i style="background:${c.hex}"></i>`).join("")}</span></div></button>`).join("");
  }
  $("mine").addEventListener("click", async (e) => { const b = e.target.closest("[data-id]"); if (!b) return; const d = mine.find((x) => x.id === b.dataset.id); if (!d) return;
    imp = { d: JSON.parse(JSON.stringify(d)), sample: await sampleFromDataURL(d.img), isNew: false }; renderImp(); try { $("imp-dlg").showModal(); } catch (er) { $("imp-dlg").setAttribute("open", ""); } });
  const closeImp = () => { try { $("imp-dlg").close(); } catch (e) { $("imp-dlg").removeAttribute("open"); } imp = null; };
  $("imp-close").addEventListener("click", closeImp);
  $("imp-title").addEventListener("input", () => { if (imp) imp.d.title = $("imp-title").value; });
  $("imp-cat").addEventListener("change", () => { if (imp) imp.d.cat = $("imp-cat").value; });
  $("imp-cols").addEventListener("change", (e) => { const s = e.target.closest("select[data-i]"); if (!s || !imp) return; imp.d.colors[+s.dataset.i].hex = s.value; renderImp(); });
  $("imp-n").addEventListener("click", (e) => { const b = e.target.closest("[data-n]"); if (!b || !imp || !imp.sample) return; imp.d.max = +b.dataset.n; const m = matchColors(imp.sample, imp.d.max); imp.d.colors = m.colors; imp.removed = m.removed; renderImp(); });
  async function fileIt(d) {
    const i = mine.findIndex((x) => x.id === d.id); if (i >= 0) mine[i] = d; else mine.push(d);
    const ok = await IDB.put(d);
    // jump to the chosen category so the new card shows up on the page
    const sp = NP.SUBJECTS.find((s) => s.key === d.cat);
    if (sp && sp.key !== subject().key) { const chip = $("chips").querySelector(`.chip[data-key="${sp.key}"]`); if (chip) chip.click(); else { $("subject").value = sp.label; refresh(true); } }
    if (state.mode !== "tpl") setMode("tpl");
    renderMine();
    $("status").textContent = `${d.title || "Your design"} is in ${sp ? sp.label : "your designs"}.` + (ok ? "" : " (Kept for this visit only: this browser blocks saved data.)");
    setTimeout(() => $("mine-group").scrollIntoView({ behavior: "smooth", block: "center" }), 250);
  }
  $("imp-actions").addEventListener("click", async (e) => {
    const b = e.target.closest("button"); if (!b || !imp) return; const d = imp.d;
    if (b.id === "imp-add" || b.id === "imp-save") { d.title = $("imp-title").value.trim() || "My design"; d.cat = $("imp-cat").value; closeImp(); await fileIt(d); }
    else if (b.id === "imp-del") { mine = mine.filter((x) => x.id !== d.id); await IDB.del(d.id); closeImp(); renderMine(); $("status").textContent = "Design removed."; }
    else if (b.id === "imp-print") {
      closeImp(); const blob = await (await fetch(d.img)).blob(); $("name").value = d.title || $("name").value;
      photoPlate(new File([blob], (d.title || "design") + ".jpg", { type: "image/jpeg" }), d.colors.map((c) => c.hex));
    } else if (b.id === "imp-readme") {
      const S = NP.PM_SPECS, lines = [`${d.title || "My design"} - Polymaker color match`, "=".repeat(48), `Category: ${(NP.SUBJECTS.find((s) => s.key === d.cat) || {}).label || d.cat}`, "", "FILAMENTS (closest Polymaker colors to the image, by share of the design)"];
      d.colors.forEach((c, i) => { const p = NP.pmByHex(c.hex); lines.push(`  ${i + 1}. ${p ? p.product + " " + p.name : "Custom"}  ${c.hex}  ~${c.pct}%`); });
      for (const k of ["pla", "pro"]) if (d.colors.some((c) => (NP.pmByHex(c.hex) || {}).line === k)) { const s = S[k]; lines.push("", `${s.line.toUpperCase()} - POLYMAKER RECOMMENDED SETTINGS`, `  Nozzle ${s.nozzle} (use ${s.nozzleUse} C) \u00b7 Bed ${s.bed} (use ${s.bedUse} C)`, `  Speed ${s.speed} \u00b7 Fan ${s.fan}`, `  Retraction: direct drive ${s.retractDD}; Bowden ${s.retractBowden}`, `  Drying: ${s.dry}`); }
      lines.push("", "Screen colors are approximate; check against a printed swatch.", "", "Made with the Charleston3D Nameplate Maker.");
      const name = (d.title || "design").replace(/[^A-Za-z0-9]+/g, "-") + "-colors-README.txt", blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/plain" });
      fileDownload(blob, name);
    }
  });
  const idrop = $("import-drop");
  idrop.addEventListener("click", () => $("import-file").click());
  idrop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("import-file").click(); } });
  for (const ev of ["dragenter", "dragover"]) idrop.addEventListener(ev, (e) => { e.preventDefault(); idrop.classList.add("over"); });
  for (const ev of ["dragleave", "drop"]) idrop.addEventListener(ev, (e) => { e.preventDefault(); idrop.classList.remove("over"); });
  idrop.addEventListener("drop", (e) => { if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) importFiles(e.dataTransfer.files); });
  $("import-file").addEventListener("change", () => { if ($("import-file").files.length) importFiles($("import-file").files); $("import-file").value = ""; });
  IDB.all().then((list) => { mine = list.concat(mine.filter((m) => !list.some((x) => x.id === m.id))); renderMine(); });

  /* ---------- wiring */
  function refresh(subjectChanged) {
    if (state.mode === "blank") { renderColors(); buildFull(); return; }
    const sp = subject();
    for (const b of $("chips").querySelectorAll(".chip")) b.setAttribute("aria-pressed", String(b.dataset.key === sp.key));
    if (NP.categoryOf(sp) !== state.cat) showCat(NP.categoryOf(sp));
    if (subjectChanged && sp.key !== state.subjectKey) {
      state.subjectKey = sp.key; state.icon = null;
      if (VEH.includes(state.design) && sp.group !== "Cars") { state.design = state.tplDesign = FRAMES[0]; }
      if (ART.includes(state.design) || state.design === "crestframe" && !state.colorsTouched) { const best = artFor(sp)[0]; if (best) state.design = state.tplDesign = best; }
      else if (sp.group === "Cars" && !VEH.includes(state.design) && !FRAMES.includes(state.design)) { state.design = state.tplDesign = (sp.vehicles || VEH)[0]; }
      if (!state.colorsTouched || FRAMES.includes(state.design) || ART.includes(state.design)) applyPalette(familyPalette(state.design));
      orderCards(); markCards(); renderIcons(); renderTools(); renderIdeas(); renderPalettes(); renderMine();
      buildFull(); buildThumbs().then(() => { if (!$("ideas-group").hidden) buildIdeas(); });
      return;
    }
    renderColors(); buildThumbs(); buildFull();
  }
  let typing = 0;
  const debounced = (subj) => { clearTimeout(typing); typing = setTimeout(() => refresh(subj), 350); };
  for (const id of ["name", "sub", "number", "base", "raise"]) $(id).addEventListener("input", () => debounced(false));
  $("subject").addEventListener("input", () => debounced(true));
  for (const id of ["upper", "font", "f-frame", "f-emblem", "f-burst", "f-rays", "f-confetti", "f-glare"]) $(id).addEventListener("change", () => refresh(false));

  /* ---------- collapsible settings panels */
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const collapsed = store.get("np-collapsed", {});
  const panels = [...document.querySelectorAll(".props .panel:not(details), #blank .panel, #tpl section.rack-group")];
  for (const pn of panels) {
    const head = pn.firstElementChild; if (!head) continue;
    const hh = head.querySelector("h2[id], h3"); const key = hh && hh.id ? "#" + hh.id : (hh || head).textContent.trim();
    head.classList.add("phead"); head.tabIndex = 0; head.setAttribute("role", "button");
    const set = (c) => { pn.classList.toggle("collapsed", c); head.setAttribute("aria-expanded", String(!c)); collapsed[key] = c; store.set("np-collapsed", collapsed); };
    pn.classList.toggle("collapsed", !!collapsed[key]); head.setAttribute("aria-expanded", String(!collapsed[key]));
    head.addEventListener("click", (e) => { if (e.target.closest("input, select, button, textarea, a, .seg")) return; set(!pn.classList.contains("collapsed")); });
    head.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target === head) { e.preventDefault(); set(!pn.classList.contains("collapsed")); } });
    pn._set = set;
  }

  /* ---------- image library (js/library.js) */
  $("lib-open").addEventListener("click", () => ImageLibrary.open({
    onPick(file, item, how) {
      if (how === "plate") { photoPlate(file); return; }
      if (state.mode !== "blank") setMode("blank");
      loadImage(file);
    },
  }));

  syncSize(); showBlankVals(); renderBadges();
  markCards();
  refresh(true);
  setView("arrange");
})();
