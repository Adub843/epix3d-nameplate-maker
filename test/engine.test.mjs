import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NP, plate, unzip, root } from "./helpers.mjs";
import { fingerprint, designsToCheck } from "../scripts/snapshots.mjs";

test("the bundle carries every design, the art library and the fonts", () => {
  assert.equal(Object.keys(NP.DESIGNS).length, 205);
  assert.equal(NP.ARTFRAMES.length, 170);
  assert.ok(NP.DESIGNS.art_u_holycity && NP.DESIGNS.art_u_rainbowrow, "Charleston designs");
  assert.ok(NP.build(plate("classic")).parts.length > 0, "fonts are loaded: text builds");
});

test("designs still match the original app (every 10th design; npm run test:snapshots does all)", () => {
  const snaps = JSON.parse(readFileSync(join(root, "test/snapshots.json"), "utf8"));
  for (const k of designsToCheck(NP, 10)) assert.deepEqual(fingerprint(NP, k), snaps[k], k);
});

test("every part of a sample of designs is watertight with positive volume", () => {
  for (const k of ["classic", "crest", "blank", "art_hoops", "art_u_rainbowrow", "cruiser50"]) {
    const meshes = NP.meshes(NP.build(plate(k)));
    for (const [slot, m] of Object.entries(meshes)) {
      if (!m.t.length) continue;
      const c = NP.checkMesh(m);
      assert.equal(c.badEdges, 0, `${k}/${slot} open edges`);
      assert.ok(c.volume > 0, `${k}/${slot} volume`);
    }
  }
});

test("STL export is a valid binary STL of the whole plate in mm", () => {
  const model = NP.build(plate("classic"));
  const stl = NP.toSTL(model, "Jackson");
  const view = new DataView(stl.buffer);
  const count = view.getUint32(80, true);
  assert.equal(stl.length, 84 + 50 * count);
  const meshes = NP.meshes(model);
  assert.equal(count, Object.values(meshes).reduce((n, m) => n + m.t.length / 3, 0));
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < count; i++) {
    const o = 84 + 50 * i;
    const n = [0, 1, 2].map((k) => view.getFloat32(o + 4 * k, true));
    assert.ok(Math.abs(Math.hypot(...n) - 1) < 1e-3, "unit normal");
    for (let v = 0; v < 3; v++) {
      const x = view.getFloat32(o + 12 + 12 * v, true), z = view.getFloat32(o + 20 + 12 * v, true);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    }
  }
  assert.ok(maxX - minX > 160 && maxX - minX <= 178, `width ${maxX - minX}`);
  assert.ok(Math.abs(minZ) < 1e-6, "sits on the bed");
  assert.ok(maxZ > 3 && maxZ < 6, `height ${maxZ}`);
});

test("3MF exports open as a ZIP with a millimetre model, colours and one object per part", () => {
  const model = NP.build(plate("art_hoops"));
  const colors = NP.slotDefaults("fr_gold");
  for (const flavor of ["bambu", "standard"]) {
    const files = unzip(NP.to3MF(model, colors, "Jackson", flavor));
    assert.ok(files["[Content_Types].xml"] && files["_rels/.rels"], `${flavor}: package files`);
    const modelName = Object.keys(files).find((n) => n.endsWith(".model") && n.startsWith("3D/3dmodel"));
    const xml = new TextDecoder().decode(files[modelName]);
    assert.match(xml, /unit="millimeter"/);
    const all = Object.keys(files).filter((n) => n.endsWith(".model")).map((n) => new TextDecoder().decode(files[n])).join("");
    assert.ok((all.match(/<triangle /g) || []).length > 1000, `${flavor}: triangles`);
  }
  const bambu = unzip(NP.to3MF(model, colors, "Jackson", "bambu"));
  assert.ok(bambu["Metadata/project_settings.config"], "Bambu project settings");
});

test("print check passes a standard plate and flags small or oversized ones", () => {
  const ok = NP.printability(NP.build(plate("classic")));
  assert.equal(ok.ok, true); assert.equal(ok.clean, true, JSON.stringify(ok.issues));

  const tiny = NP.printability(NP.build(plate("classic", { width: 60, text: "Christopher Columbus" })));
  assert.ok(tiny.issues.some((i) => i.code === "text"), "small letters flagged");
  assert.equal(tiny.ok, true, "warnings still allow saving");

  const big = NP.printability(NP.build(plate("classic", { width: 300, height: 0 })));
  assert.ok(big.issues.some((i) => i.code === "bed" && i.level === "error"));
  assert.equal(big.ok, false);
});

test("print check measures a known thin wall", () => {
  const ring = (r) => Array.from({ length: 96 }, (_, i) => [r * Math.cos((i / 96) * 2 * Math.PI), r * Math.sin((i / 96) * 2 * Math.PI)]);
  const part = (wall) => ({ parts: [{ slot: "accent", label: "Ring", slices: [{ z0: 3, z1: 4.2, groups: [{ outer: ring(20), holes: [ring(20 - wall).reverse()] }] }] }],
    bbox: [-25, -25, 25, 25], textHeight: Infinity });
  assert.ok(NP.printability(part(0.6)).issues.some((i) => i.code === "thin"), "0.6 mm ring is thin");
  assert.ok(!NP.printability(part(1.6)).issues.some((i) => i.code === "thin"), "1.6 mm ring is fine");
});
