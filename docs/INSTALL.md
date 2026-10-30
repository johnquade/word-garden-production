# Install on an Android tablet

Word Garden is a small static site, so the simplest install is via Chrome's Add to Home screen. A real install from a Play listing or an APK build is out of scope for this prototype.

## Option A — quick local test (no install)

1. On your computer, from this folder run:
   `python -m http.server 8123`
2. On the tablet, open Chrome and go to `http://<your computer's LAN IP>:8123`.
   This works over your local Wi-Fi. Speech synthesis uses the tablet's installed voices.

## Option B — install as an app (recommended)

1. Put the `word-garden` folder on an HTTPS host you control (GitHub Pages, Netlify, Cloudflare Pages, your school's server, or a NAS with HTTPS).
2. On the tablet, open the site once in Chrome.
3. Choose **Install app** (or the three-dot menu → **Add to Home screen**).
4. Leave it open online once, so the service worker can cache all 56 files. After that, it works offline.
5. To verify it is fully cached, turn off Wi-Fi, launch Word Garden, and play a session.

## Option C — install on a tablet without internet access

Copy the whole `word-garden` folder to the tablet and try opening `index.html` in Chrome from the Files app. This may run without a service worker, but Chrome's handling of local files and browser storage varies by device. It is a fallback test path, not a reliable install; use HTTPS hosting for dependable progress storage and the offline app shell.

## Voice quality

Word/phrase audio uses the browser's speech synthesis. For better quality, install an English voice on the tablet (Settings → Accessibility → Text-to-speech → Google Speech Services → Install language data) and pick an English (US) voice. If no English voice is installed, Word Garden still shows all prompts visually.

## Data

Progress is stored in the tablet browser's localStorage on that device only. Clearing site data or uninstalling the app resets it. There is no account, no analytics, and no external call.

## Parent controls

Hold the leaf for two seconds on the Grown-ups screen, then answer the math prompt, to reach settings and progress.
