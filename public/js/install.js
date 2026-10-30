
(() => {
  let deferred = null;
  const btn = document.getElementById("install");
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; btn.hidden = false; });
  btn.addEventListener("click", async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; btn.hidden = true; });
  window.addEventListener("appinstalled", () => { btn.hidden = true; });
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
