# Nameplate Maker

Charleston3D's nameplate designer. A customer types a name, picks a design (or starts from a blank
plate, a photo or the image library), picks real Polymaker filament colors, sees a design preview in
2D and 3D, and downloads a print-ready file:

- **3MF for Bambu Studio**: every color its own part, already assigned to AMS slots, with the
  printer and process settings.
- **Standard 3MF** for Prusa, Orca and Cura.
- **STL**: the whole plate as one part, for single-color printing.
- **README.txt**: the filaments, grams per part and Polymaker's print settings.

Every change runs a **print check**: walls under 1.2 mm on the plate, letter and detail strokes under
1 mm, letters under 5 mm tall, colour layers under two fine layers, and anything over 250 mm. Plates
over the bed size can't be downloaded; the rest are notes.

It is a static site: no server, no accounts, no prices. It runs on GitHub Pages.

## Layout

```
public/            the site as served (copied to dist/ by the build)
  index.html       the editor: tool rail, tool panel, design, settings
  css/app.css
  js/app.js        the editor's behaviour
  js/layout.js     which panel the rail shows, the Download button
  js/jobs.js       the geometry jobs (build, check, 3MF, STL, README)
  js/worker.js     runs the jobs in the background
  js/library.js    the image library picker
  img/templates/   the template pictures
  vendor/          three.js r128 (3D preview), MIT licence
src/engine/        the geometry engine, in parts (bundled in file-name order)
data/              engine data: fonts, the template art, the Bambu project settings
scripts/build.mjs  builds dist/ (copies public/, bundles the engine with its data)
scripts/serve.mjs  serves dist/ locally
scripts/snapshots.mjs  snapshot test of every design against the original app
test/              unit tests (node --test)
e2e/               browser tests (Playwright, at 1280 and 390 wide)
```

The engine is one closure split across `src/engine/*.js` so the parts share helpers; the build wraps
them and inlines `__DATA__("file.json")` from `data/`. Edit the sources, never `dist/`.

## Work on it

```sh
npm install
npm run dev              # build and serve at http://localhost:8080
npm test                 # unit tests, including a snapshot sample
npm run test:snapshots   # every design against the snapshots (about 6 minutes)
npm run test:e2e         # browser tests (needs Playwright's Chromium)
```

If a change is meant to alter what a design looks like or exports, update the snapshots on purpose:
`npm run build && node scripts/snapshots.mjs --update`.

## Image library

The **Library** tool lists the public images from the business console
(`GET /api/images?public=1`) and loads each from `/api/images/<key>`. The console already allows
reads from `https://adub843.github.io`. When the maker moves to its own address (for example on
epix3d.com), add that address to the console's `BUILDER_ORIGINS` secret, and point the maker at
another console with `<meta name="image-library" content="https://...">` in `index.html` if needed.

## Deploy

Merging to `main` runs `.github/workflows/pages.yml`, which builds and publishes `dist/` to
GitHub Pages at https://adub843.github.io/epix3d-nameplate-maker/. One-time setup: in the repo's
Settings > Pages, set Source to "GitHub Actions".
