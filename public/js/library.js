// Image library: the public art in the business console's library (GET /api/images?public=1).
// The console allows reads from this site's address (https://adub843.github.io is on its list);
// another address needs adding to the console's BUILDER_ORIGINS. The library's address can be
// changed with <meta name="image-library" content="https://...">.
//
// ImageLibrary.open({ onPick(file, item, how) }) shows the picker. `how` is "layer" (add the image
// to a blank plate) or "plate" (trace it into a full multi-color plate).
(function (root) {
  "use strict";
  const DEFAULT_URL = "https://business-console.business-console.workers.dev";
  const TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" };

  function baseUrl() {
    const meta = typeof document !== "undefined" && document.querySelector('meta[name="image-library"]');
    return ((meta && meta.content) || DEFAULT_URL).replace(/\/+$/, "");
  }
  const fileUrl = (base, key) => `${base}/api/images/${encodeURIComponent(key)}`;

  // the list, newest first, keeping only image types the plate tools can read
  async function list(base = baseUrl(), fetchFn = fetch) {
    const res = await fetchFn(`${base}/api/images?public=1`, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`The image library answered ${res.status}.`);
    const body = await res.json();
    const items = Array.isArray(body && body.items) ? body.items : [];
    return items.filter((i) => i && typeof i.key === "string" && TYPES[i.type]).map((i) => ({
      key: i.key, name: String(i.name || "Image"), type: i.type, category: i.category ? String(i.category) : "Other",
      tags: Array.isArray(i.tags) ? i.tags.map(String) : [], kind: i.kind || null, added: i.added || 0,
    }));
  }

  // one image as a File, ready for the same tools as an upload
  async function load(item, base = baseUrl(), fetchFn = fetch) {
    const res = await fetchFn(fileUrl(base, item.key));
    if (!res.ok) throw new Error(`The image could not be loaded (${res.status}).`);
    const blob = await res.blob();
    const type = TYPES[blob.type] ? blob.type : item.type;
    const name = item.name.replace(/[^\w.-]+/g, "-").replace(/^-|-$/g, "") || "image";
    return new File([blob], /\.\w{3,4}$/.test(name) ? name : `${name}.${TYPES[type]}`, { type });
  }

  function matches(item, query, category) {
    if (category && item.category !== category) return false;
    if (!query) return true;
    const hay = (item.name + " " + item.tags.join(" ") + " " + item.category).toLowerCase();
    return query.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }

  /* ---------- picker dialog */
  let dlg = null, cache = null;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  function build() {
    dlg = document.createElement("dialog");
    dlg.className = "lib"; dlg.id = "lib-dlg"; dlg.setAttribute("aria-labelledby", "lib-h");
    dlg.innerHTML = `<div class="lib-wrap">
      <div class="lib-head"><h2 id="lib-h">Image library</h2><button class="small" type="button" data-close>Close</button></div>
      <div class="lib-filters">
        <input type="search" id="lib-q" placeholder="Search the library" aria-label="Search the library" autocomplete="off">
        <select id="lib-cat" aria-label="Category"><option value="">All categories</option></select>
      </div>
      <p class="label" id="lib-status" role="status"></p>
      <div class="lib-grid" id="lib-grid"></div>
      <div class="lib-pick" id="lib-pick" hidden>
        <img id="lib-pick-img" alt="">
        <div><b id="lib-pick-name"></b>
          <div class="lib-actions">
            <button class="btn" type="button" data-how="layer">Add to a blank plate</button>
            <button class="btn alt" type="button" data-how="plate">Make a color plate from it</button>
          </div></div>
      </div>
    </div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
    dlg.querySelector("#lib-q").addEventListener("input", render);
    dlg.querySelector("#lib-cat").addEventListener("change", render);
    dlg.querySelector("#lib-grid").addEventListener("click", (e) => {
      const b = e.target.closest("[data-key]"); if (!b) return;
      select(cache.find((i) => i.key === b.dataset.key));
    });
    dlg.querySelector("#lib-pick").addEventListener("click", async (e) => {
      const b = e.target.closest("[data-how]"); if (!b || !dlg._item) return;
      const status = dlg.querySelector("#lib-status");
      status.textContent = "Loading the image…";
      try { const file = await load(dlg._item); dlg.close(); dlg._onPick(file, dlg._item, b.dataset.how); }
      catch (err) { status.textContent = err.message; }
    });
  }

  function select(item) {
    dlg._item = item;
    const pick = dlg.querySelector("#lib-pick");
    pick.hidden = !item; if (!item) return;
    dlg.querySelector("#lib-pick-img").src = fileUrl(baseUrl(), item.key);
    dlg.querySelector("#lib-pick-name").textContent = item.name;
    for (const b of dlg.querySelectorAll("#lib-grid [data-key]")) b.setAttribute("aria-pressed", String(b.dataset.key === item.key));
  }

  function render() {
    const q = dlg.querySelector("#lib-q").value.trim(), cat = dlg.querySelector("#lib-cat").value;
    const shown = (cache || []).filter((i) => matches(i, q, cat));
    const base = baseUrl();
    dlg.querySelector("#lib-grid").innerHTML = shown.slice(0, 300).map((i) =>
      `<button type="button" class="lib-card" data-key="${esc(i.key)}" aria-pressed="false" title="${esc(i.name)}"><img loading="lazy" alt="" src="${esc(fileUrl(base, i.key))}"><span>${esc(i.name)}</span></button>`).join("");
    dlg.querySelector("#lib-status").textContent = cache ? `${shown.length} image${shown.length === 1 ? "" : "s"}` + (shown.length > 300 ? ", first 300 shown: search to narrow" : "") : "";
  }

  async function open({ onPick }) {
    if (!dlg) build();
    dlg._onPick = onPick; select(null);
    dlg.showModal();
    if (cache) { render(); return; }
    const status = dlg.querySelector("#lib-status");
    status.textContent = "Loading the library…";
    try {
      cache = await list();
      const cats = [...new Set(cache.map((i) => i.category))].sort();
      dlg.querySelector("#lib-cat").innerHTML = `<option value="">All categories</option>` + cats.map((c) => `<option>${esc(c)}</option>`).join("");
      render();
      if (!cache.length) status.textContent = "The library has no public images yet.";
    } catch (err) {
      status.textContent = "The image library could not be reached. Check the connection and try again.";
    }
  }

  const api = { open, list, load, matches, baseUrl, fileUrl };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ImageLibrary = api;
})(typeof self !== "undefined" ? self : globalThis);
