Nameplate Maker - Netlify deploy

Fastest: go to app.netlify.com > Add new site > Deploy manually, and drag this whole folder
(the one containing index.html) onto the page. Netlify gives you an https URL; open it on your
phone and use "Add to Home Screen" (iPhone) or "Install app" (Android / desktop Chrome).

Files
  index.html            the app (engine, fonts and UI are all inside it)
  manifest.webmanifest  app name, colors and icons for installing
  sw.js                 offline support; caches the app plus the 3D library and fonts after first load
  icons/                app icons
  netlify.toml          cache headers so updates show up right away

Updating: replace index.html (and bump CACHE in sw.js) and redeploy.
