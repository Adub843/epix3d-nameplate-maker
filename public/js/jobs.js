// Geometry jobs. All the heavy work (building, meshing, exporting) runs here, in the worker
// (js/worker.js). If the browser blocks workers, the page runs the same jobs itself.
// createJobs() returns handle(job) -> { msg, transfer }; it remembers the last full build so the
// export jobs save exactly what the preview shows.
(function (root) {
  "use strict";
  function createJobs(NP) {
    let last = null;
    function pack(model) {
      const meshes = NP.meshes(model), out = {}, transfer = [], checks = [];
      for (const p of model.parts) {
        const m = meshes[p.slot]; if (!m.t.length) continue;
        const v = new Float32Array(m.v), t = new Uint32Array(m.t);
        out[p.slot] = { v, t }; transfer.push(v.buffer, t.buffer);
        const c = NP.checkMesh(m);
        checks.push({ slot: p.slot, label: p.label, tris: c.tris, bad: c.badEdges, volume: c.volume, top: Math.max(...p.slices.map((s) => s.z1)) });
      }
      return { meshes: out, transfer, checks };
    }
    function info(m, q) {
      return {
        svg: NP.toSVG(m, q.colors, { shadow: false }), bbox: m.bbox, textHeight: m.textHeight, fun: m.fun, layered: !!m.layered, spots: m.spots, items: m.items,
        slots: m.parts.map((x) => x.slot), labels: Object.fromEntries(m.parts.map((x) => [x.slot, x.label])), imageBox: m.imageBox || null, textBox: m.textBox || null,
        partBoxes: m.partBoxes || null, partInfo: m.partInfo || null, meta: m.meta || null,
        top: Math.max(...m.parts.flatMap((p) => p.slices.map((s) => s.z1)))
      };
    }
    const need = () => { if (!last) throw new Error("Nothing to save yet: the design is still building."); return last; };
    return function handle(q) {
      if (q.kind === "thumb") {
        const m = NP.build(q.params);
        return { msg: { svg: NP.toSVG(m, q.colors) } };
      }
      if (q.kind === "full") {
        const m = NP.build(q.params); last = m;
        const p = pack(m);
        return { msg: Object.assign({ meshes: p.meshes, checks: p.checks, plan: NP.filamentPlan(m, q.colors).plan }, info(m, q)), transfer: p.transfer };
      }
      if (q.kind === "export") {
        const m = need();
        const file = NP.to3MF(m, q.colors, q.title, q.flavor);
        const readme = NP.readme(m, q.colors, q.info);
        const bytes = q.zip ? NP.zipStore([{ name: q.file, data: file }, { name: "README.txt", data: new TextEncoder().encode(readme) }]) : file;
        return { msg: { bytes, readme }, transfer: [bytes.buffer] };
      }
      if (q.kind === "stl") {
        const bytes = NP.toSTL(need(), q.title);
        return { msg: { bytes }, transfer: [bytes.buffer] };
      }
      if (q.kind === "check") return { msg: { report: NP.printability(need()) } };
      if (q.kind === "readme") return { msg: { readme: NP.readme(need(), q.colors, q.info) } };
      throw new Error("unknown job " + q.kind);
    };
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { createJobs };
  else root.createJobs = createJobs;
})(typeof self !== "undefined" ? self : globalThis);
