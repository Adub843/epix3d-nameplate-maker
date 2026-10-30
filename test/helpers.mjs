// Shared test helpers: the built engine and a reader for the uncompressed ZIPs it writes.
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const NP = require(join(root, "dist/js/engine.js"));
export const { createJobs } = require(join(root, "dist/js/jobs.js"));

export const plate = (design, extra = {}) => Object.assign({
  design, h: 0.3, text: "Jackson", sub: "", number: "23", width: 170, height: 0, base: 3, raise: 1.2, upper: true, font: "auto",
  features: { frame: true, emblem: true }, badge: "none", finish: "crisp", motifs: ["star"], parts: {}, items: [],
  blank: { shape: "rounded", border: true, borderW: 3, textX: 0, textY: 0, textSize: 0 },
}, extra);

// entries of a stored (method 0) ZIP: { name: Uint8Array }
export function unzip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), files = {};
  let o = 0;
  while (view.getUint32(o, true) === 0x04034b50) {
    const method = view.getUint16(o + 8, true), size = view.getUint32(o + 18, true);
    const nameLen = view.getUint16(o + 26, true), extra = view.getUint16(o + 28, true);
    if (method !== 0) throw new Error("compressed entry");
    const name = new TextDecoder().decode(bytes.subarray(o + 30, o + 30 + nameLen));
    const start = o + 30 + nameLen + extra;
    files[name] = bytes.subarray(start, start + size);
    o = start + size;
  }
  return files;
}
