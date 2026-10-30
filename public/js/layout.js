// Editor layout: the tool rail picks which panel shows in the drawer (on phones the rail is the bottom
// bar and "Edit" shows the settings). The two style modes (Designs, Blank) are switched by app.js;
// it announces each switch with an "np:mode" event so the drawer follows.
(() => {
  const app = document.getElementById("app");
  const rail = app.querySelectorAll(".rail-btn");
  function show(panel) {
    app.dataset.panel = panel;
    for (const b of rail) b.setAttribute("aria-pressed", String(b.dataset.panel === panel));
    for (const p of app.querySelectorAll(".drawer-panel")) p.hidden = p.dataset.for !== panel;
  }
  for (const b of rail) b.addEventListener("click", () => show(b.dataset.panel));
  document.addEventListener("np:mode", (e) => show(e.detail === "blank" ? "blank" : "designs"));

  // Download: on a phone, open the settings; then bring the download buttons into view
  document.getElementById("go-save").addEventListener("click", () => {
    if (matchMedia("(max-width: 899px)").matches) show("props");
    const panel = document.getElementById("export-panel");
    panel.classList.remove("collapsed");
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("save").focus({ preventScroll: true });
  });
})();
