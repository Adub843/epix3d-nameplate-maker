import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const LIBRARY = "https://business-console.business-console.workers.dev";
const phone = (testInfo) => testInfo.project.name === "phone";

// collect console errors, fail the test on any; wait for the first design and its print check
async function open(page) {
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await expect(page.locator("#busy")).toBeHidden({ timeout: 60_000 });
  await expect(page.locator("#printcheck p").first()).toHaveText(/Ready to print|Prints, with notes|Won't print/, { timeout: 60_000 });
  return errors;
}
const showSettings = async (page, testInfo) => { if (phone(testInfo)) await page.click(".rail-btn[data-panel=props]"); };

test("loads the editor with no errors and no sideways scroll", async ({ page }, testInfo) => {
  const errors = await open(page);
  await expect(page.locator(".preview-label")).toHaveText("Design preview");
  await expect(page.locator("#arrange svg")).toBeVisible();
  await expect(page.locator(".rail")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(testInfo.project.use.viewport.width);
  await page.screenshot({ path: testInfo.outputPath("editor.png") });
  expect(errors).toEqual([]);
});

test("typing a name rebuilds the plate and the template pictures load", async ({ page }) => {
  const errors = await open(page);
  await page.click(".rail-btn[data-panel=text]");
  await page.fill("#name", "Avery");
  await expect(page.locator("#arrange svg")).toBeVisible();
  await expect(page.locator("#busy")).toBeHidden({ timeout: 60_000 });
  await page.click("#mode-tpl");
  const img = page.locator("#rack-kittl img:visible").first();
  await img.scrollIntoViewIfNeeded();
  await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("downloads a 3MF, an STL and the README", async ({ page }, testInfo) => {
  const errors = await open(page);
  await showSettings(page, testInfo);
  const save = async (id) => { const [d] = await Promise.all([page.waitForEvent("download"), page.click(id)]); return d; };
  const stl = await save("#save-stl");
  expect(stl.suggestedFilename()).toMatch(/\.stl$/);
  const bytes = readFileSync(await stl.path());
  expect(bytes.length).toBe(84 + 50 * bytes.readUInt32LE(80));
  const [threemf] = await Promise.all([page.waitForEvent("download"), page.click("#save-std")]);
  expect(threemf.suggestedFilename()).toMatch(/-standard\.3mf$/);
  expect(readFileSync(await threemf.path()).subarray(0, 2).toString()).toBe("PK");
  const readme = await save("#save-readme");
  expect(readFileSync(await readme.path(), "utf8")).toContain("Polymaker");
  expect(errors).toEqual([]);
});

test("the Download button brings the save buttons into view", async ({ page }) => {
  await open(page);
  await page.click("#go-save");
  await expect(page.locator("#save")).toBeInViewport();
});

test("blank plate tools and the rail switch panels", async ({ page }) => {
  const errors = await open(page);
  await page.click("#mode-blank");
  await expect(page.locator("#blank")).toBeVisible();
  await expect(page.locator("#mode-blank")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#busy")).toBeHidden({ timeout: 60_000 });
  await page.click(".rail-btn[data-panel=uploads]");
  await expect(page.locator("#photo-drop")).toBeVisible();
  expect(errors).toEqual([]);
});

test("the image library lists public art and adds it to a blank plate", async ({ page }) => {
  await page.route(`${LIBRARY}/api/images?public=1`, (r) => r.fulfill({ json: { items: [
    { key: "k-palmetto", name: "Palmetto", type: "image/png", tags: ["sc", "tree"], category: "Charleston", added: 2 },
    { key: "k-anchor", name: "Anchor", type: "image/png", tags: ["boat"], category: "Coastal", added: 1 },
  ] } }));
  await page.route(`${LIBRARY}/api/images/*`, (r) => r.fulfill({ body: readFileSync("e2e/fixtures/palmetto.png"), contentType: "image/png" }));
  const errors = await open(page);
  await page.click(".rail-btn[data-panel=library]");
  await page.click("#lib-open");
  await expect(page.locator(".lib-card")).toHaveCount(2);
  await page.fill("#lib-q", "tree");
  await expect(page.locator(".lib-card")).toHaveCount(1);
  await page.click(".lib-card");
  await page.click("[data-how=layer]");
  await expect(page.locator("#lib-dlg")).not.toBeVisible();
  await expect(page.locator("#mode-blank")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#img-tools")).toBeVisible();
  await expect(page.locator("#busy")).toBeHidden({ timeout: 60_000 });
  expect(errors).toEqual([]);
});

test("the image library says so when it can't be reached", async ({ page }) => {
  await page.route(`${LIBRARY}/**`, (r) => r.abort());
  await open(page);
  await page.click(".rail-btn[data-panel=library]");
  await page.click("#lib-open");
  await expect(page.locator("#lib-status")).toHaveText(/could not be reached/);
});
