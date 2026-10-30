// Builds the site into dist/: copies public/ and bundles the engine.
//
// The engine is one closure split across src/engine/*.js (in file-name order) so every part shares
// the same helpers. The build wraps the parts in that closure and inlines each __DATA__("file.json")
// from data/. The bundle runs in the page, in the worker (importScripts) and in Node (require).
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist");

export function bundleEngine() {
  const dir = join(root, "src/engine");
  const parts = readdirSync(dir).filter((f) => f.endsWith(".js")).sort();
  const body = parts.map((f) => `  /* ===== ${f} ===== */\n` + readFileSync(join(dir, f), "utf8")).join("\n");
  const inlined = body.replace(/__DATA__\("([\w.-]+\.json)"\)/g, (_, file) =>
    JSON.stringify(JSON.parse(readFileSync(join(root, "data", file), "utf8"))));
  if (inlined.includes("__DATA__")) throw new Error("engine: unresolved __DATA__ reference");
  return `/* Nameplate engine: dependency-free geometry, 3MF and STL writers. Built from src/engine by
   scripts/build.mjs; edit the sources, not this file. Works in the browser (self.NP) and in Node
   (module.exports). Units: mm, y up. */
(function (root) {
  "use strict";
  const NP = {};
${inlined}
  if (typeof module !== "undefined" && module.exports) module.exports = NP;
  else root.NP = NP;
})(typeof self !== "undefined" ? self : globalThis);
`;
}

export function build() {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  cpSync(join(root, "public"), out, { recursive: true });
  writeFileSync(join(out, "js/engine.js"), bundleEngine());
  // the service worker's cache name follows the build, so a new deploy replaces the old files
  const version = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.slice(0, 12) : String(Date.now());
  const sw = join(out, "sw.js");
  writeFileSync(sw, readFileSync(sw, "utf8").replace("__BUILD__", version));
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build();
  console.log("built dist/");
}
