# Word Garden — public prototype

Word Garden is a touch-first, offline-capable reading and spelling prototype for Android tablets and modern browsers. It is a demonstration build, not a validated reading curriculum or a substitute for instruction from a teacher or specialist.

## Try it

1. Copy the `word-garden` folder to a web host that serves HTTPS. For a local desktop preview run `python -m http.server 8123` from this folder and open `http://localhost:8123`.
2. On an Android tablet, visit the HTTPS URL in Chrome and choose **Install app** or **Add to Home screen**. Open it once online so the service worker can cache the app/audio. After that, the core game works offline. Browser speech output may vary with the tablet's installed English voices.
3. The progress is saved in this browser on this device. There are no accounts, ads, analytics, or network calls to a game backend.

**Current scope:** six hand-authored reading stages plus a separate sight-word track. Stage 1 teaches individual letter-sounds only; blending and spelling begin after the stage's sounds have been introduced. Later activities include picture-supported blending, spelling tile-building, contextual heart words, sentence questions, and Fry sight-word recognition. The garden grows across multiple beds, and a watering review returns to words that need more practice. The grown-up area includes local progress/settings, a start-level selector, a tap-to-play sound reference, and a word/image review link.

## Important limitations

- Word Garden uses local device speech synthesis for words/instructions. Sound quality and voice availability depend on Android/browser settings.
- Bundled phoneme audio comes from two MIT-licensed community projects. Keep `ATTRIBUTION.md` with the app. The lesson wording and app UI are original to this prototype.
- The present word splitter uses a small hand-coded pattern table and irregular heart words are a minimal starter list. Have a literacy specialist review every sequence, decodability, accent, and exception before using with children as instruction.
- Prototype-only parent gate; it is not a secure parental-authentication mechanism. Progress is device-local and can be cleared by clearing browser storage.
- Do not claim research-proven learning outcomes. The lessons and example words need specialist review and usability testing with families before being used as formal instruction.

## More

- `docs/RESEARCH.md`: market scan, evidence base, and design notes.
- `docs/DESIGN.md`: how the curriculum, interaction, and privacy decisions work.
- `docs/INSTALL.md`: how to put this on a tablet and where the audio comes from.
- `docs/IMAGE_REVIEW.md` and `docs/images.csv`: every word/picture pair with Unicode names and external reference links. Open `docs/image-review.html` for a searchable review page.

## Files

- `index.html`, `css/`, `js/`: app and content.
- `audio/phonemes/`: 45 offline phoneme WAVs.
- `manifest.webmanifest`, `sw.js`: installability and offline cache.
- `ATTRIBUTION.md`: third-party asset credit and license.
- `docs/RESEARCH.md`: market scan and evidence/design notes.
