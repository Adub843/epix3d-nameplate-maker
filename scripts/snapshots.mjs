// Snapshot test for the engine: builds every design (or every Nth with --every N) and compares a
// fingerprint of each part's mesh, the preview SVG, both 3MF flavors and the README with
// test/snapshots.json. The snapshots were taken from the original single-file app, so a match means
// the refactor changed nothing a customer gets.
//
//   node scripts/snapshots.mjs --check [--every N]   compare (exit 1 on a difference)
//   node scripts/snapshots.mjs --update [--engine path/to/engine.js]   rewrite the snapshots
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAP = join(root, "test/snapshots.json");
const require = createRequire(import.meta.url);
const hash = (x) => createHash("sha1").update(x).digest("hex").slice(0, 16);

// The Bambu project carries the save date and each preview a unique filter id: pin the date and
// randomness here, and drop the id (it counts up with every preview drawn) from the fingerprint.
function deterministic(fn) {
  const random = Math.random, now = Date.now, RealDate = Date;
  let seed = 1;
  Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const fixed = Date.UTC(2026, 0, 1);
  globalThis.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [fixed])); } static now() { return fixed; } };
  try { return fn(); } finally { Math.random = random; Date.now = now; globalThis.Date = RealDate; }
}

export function paramsFor(NP, design) {
  const d = NP.DESIGNS[design];
  const p = {
    design, h: d.layered ? 0.25 : d.fun ? 0.3 : 0.25, icon: null, text: "Jackson", sub: "", number: "23", width: 170, height: 0, base: 3, raise: 1.2, upper: true, font: "auto",
    features: { frame: true, emblem: true, burst: false, rays: false, confetti: false, glare: false }, badge: "none", finish: "crisp", motifs: ["star"], theme: null,
    parts: {}, backlit: false, wireD: 2.6, backplate: null, items: [],
  };
  if (design === "blank") p.blank = { shape: "rounded", border: true, borderW: 3, textX: 0, textY: 0, textSize: 0 };
  return p;
}

export function fingerprint(NP, design) {
  return deterministic(() => {
    const m = NP.build(paramsFor(NP, design));
    const colors = NP.slotDefaults("fr_gold");
    const meshes = NP.meshes(m), mh = {};
    for (const k of Object.keys(meshes)) {
      const v = new Float64Array(Array.from(meshes[k].v, (x) => Math.round(x * 1e4) / 1e4));
      mh[k] = hash(Buffer.from(v.buffer)) + ":" + hash(Buffer.from(new Uint32Array(meshes[k].t).buffer));
    }
    return {
      mh, svg: hash(NP.toSVG(m, colors).replace(/npds\w+/g, "npds")), f3: hash(Buffer.from(NP.to3MF(m, colors, "T", "bambu"))),
      f3s: hash(Buffer.from(NP.to3MF(m, colors, "T", "standard"))), readme: hash(NP.readme(m, colors, { file: "x.3mf" })), bbox: m.bbox,
    };
  });
}

export function designsToCheck(NP, every = 1) {
  return Object.keys(NP.DESIGNS).filter((_, i) => i % every === 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const engine = resolve(opt("--engine", join(root, "dist/js/engine.js")));
  const NP = require(engine);
  const every = Number(opt("--every", 1));
  if (args.includes("--update")) {
    const out = {};
    for (const k of designsToCheck(NP, every)) out[k] = fingerprint(NP, k);
    writeFileSync(SNAP, JSON.stringify(out, null, 1) + "\n");
    console.log(`wrote ${Object.keys(out).length} snapshots from ${engine}`);
  } else {
    if (!existsSync(SNAP)) throw new Error("no test/snapshots.json");
    const snaps = JSON.parse(readFileSync(SNAP, "utf8"));
    let bad = 0, n = 0;
    for (const k of designsToCheck(NP, every)) {
      n++;
      const got = JSON.stringify(fingerprint(NP, k)), want = JSON.stringify(snaps[k]);
      if (got !== want) { bad++; console.log(`changed: ${k}\n  want ${want}\n  got  ${got}`); }
    }
    console.log(`${n - bad}/${n} designs match their snapshots`);
    process.exit(bad ? 1 : 0);
  }
}
