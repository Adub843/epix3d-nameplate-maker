import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { join } from "node:path";
import { root } from "./helpers.mjs";

const lib = createRequire(import.meta.url)(join(root, "dist/js/library.js"));
const BASE = "https://console.example";
const reply = (body, init = {}) => new Response(typeof body === "string" || body instanceof Uint8Array ? body : JSON.stringify(body), init);

test("library list keeps readable images and fills in missing fields", async () => {
  let asked = null;
  const items = await lib.list(BASE, async (url) => { asked = url; return reply({ items: [
    { key: "a1", name: "Palmetto", type: "image/png", tags: ["sc"], category: "Charleston", kind: "png", added: 2 },
    { key: "b2", type: "image/svg+xml" },
    { key: "c3", name: "Notes", type: "application/pdf" },
    { name: "no key", type: "image/png" },
  ] }); });
  assert.equal(asked, `${BASE}/api/images?public=1`);
  assert.deepEqual(items.map((i) => i.key), ["a1", "b2"]);
  assert.equal(items[1].name, "Image"); assert.equal(items[1].category, "Other"); assert.deepEqual(items[1].tags, []);
});

test("library list reports a refusal", async () => {
  await assert.rejects(lib.list(BASE, async () => reply("no", { status: 403 })), /answered 403/);
});

test("library load returns a named File with the right type", async () => {
  let asked = null;
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
  const file = await lib.load({ key: "a b/1", name: "Rainbow Row", type: "image/png" }, BASE, async (url) => { asked = url; return reply(png, { headers: { "content-type": "image/png" } }); });
  assert.equal(asked, `${BASE}/api/images/a%20b%2F1`);
  assert.equal(file.name, "Rainbow-Row.png"); assert.equal(file.type, "image/png"); assert.equal(file.size, 4);
  await assert.rejects(lib.load({ key: "x", name: "x", type: "image/png" }, BASE, async () => reply("", { status: 404 })), /404/);
});

test("library search matches every word across name, tags and category", () => {
  const item = { name: "Holy City steeple", tags: ["church", "skyline"], category: "Charleston" };
  assert.ok(lib.matches(item, "holy skyline", ""));
  assert.ok(lib.matches(item, "", "Charleston"));
  assert.ok(!lib.matches(item, "holy palmetto", ""));
  assert.ok(!lib.matches(item, "", "Sports"));
});
