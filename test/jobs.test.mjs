import { test } from "node:test";
import assert from "node:assert/strict";
import { NP, createJobs, plate, unzip } from "./helpers.mjs";

test("jobs: build, check, then save 3MF, STL and README from the same model", () => {
  const run = createJobs(NP);
  assert.throws(() => run({ kind: "stl" }), /still building/);
  const colors = NP.slotDefaults("fr_gold");
  const thumb = run({ kind: "thumb", params: plate("classic", { h: 0.6 }), colors }).msg;
  assert.match(thumb.svg, /^<svg/);
  const full = run({ kind: "full", params: plate("classic"), colors });
  assert.ok(full.msg.meshes.base && full.msg.meshes.raised);
  assert.equal(full.transfer.length, 4);
  assert.ok(full.msg.checks.every((c) => c.bad === 0 && c.volume > 0));
  const { report } = run({ kind: "check" }).msg;
  assert.equal(report.ok, true);
  const exp = run({ kind: "export", colors, title: "Jackson nameplate", flavor: "bambu", zip: true, file: "Jackson.3mf", info: { file: "Jackson.3mf" } }).msg;
  const files = unzip(exp.bytes);
  assert.ok(files["Jackson.3mf"] && files["README.txt"]);
  assert.match(exp.readme, /Polymaker/);
  const stl = run({ kind: "stl", title: "Jackson" }).msg.bytes;
  assert.equal(new DataView(stl.buffer).getUint32(80, true) * 50 + 84, stl.length);
  assert.throws(() => run({ kind: "nope" }), /unknown job/);
});
