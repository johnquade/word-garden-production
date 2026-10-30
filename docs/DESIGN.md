# Word Garden — design and build notes

## Goal

A tablet-first phonics and spelling game for children in pre-K through grade 2. The goal is a **calm, predictable** app that spends the child's screen time on blending and building words rather than on a distractor.

## Market scan summary

Apps reviewed: Khan Academy Kids, Duolingo ABC, Teach Your Monster to Read, Phonics Hero, Reading Eggs, ABCmouse, Starfall, Hooked on Phonics, HOMER, and Wonster Words. Recurring strengths included clear, systematic sequences and explicit blending practice. Recurring weaknesses were menu-heavy homes, coin/reward wrappers, and reading recognition activities with little spelling-from-memory. See `docs/RESEARCH.md` for sources and caveats.

## Educational design

- **Phonics sequence.** Six stages with a defined order. The first stage is letter-sound practice only; stage 2 introduces the remaining single-letter sounds and `qu`. Word blending and spelling remain locked until that single-letter set has been introduced. Later stages add consonant teams, blends, long vowels/silent-e, and advanced patterns/heart words.
- **Decoding and encoding separated.** Blending activities ask the child to tap each grapheme, hear the sound, and then match a picture. Spelling activities give a picture and audio prompt, then the child builds the word with grapheme tiles from a letter bank.
- **Spaced practice.** Items carry a Leitner-style box level. Correct first-try responses promote and defer review; mistakes demote and bring the item back sooner.
- **Skill sequencing gates.** Word activities are not offered in a stage before the current stage's letter-sound items have been introduced at least once.
- **Heart words.** Irregular high-frequency words carry a heart marker on the unexpected part and appear as build-and-check exercises, not as passive flashcards.
- **Sound anchors.** New sound cards and the parent reference pair isolated sound audio with a familiar example word (e.g. `/t/` as in *tap*). This helps children compare similar sounds without adding louder rewards or background music. The reference is for adult testing, not a standalone child lesson.
- **No overstimulation.** No music, no streaks, no timers, no collectibles. Positive feedback is a short spoken phrase and a soft chime; wrong answers let the child retry.

## Interaction design

- One task per screen, with a single replay control and a calm paper-toned layout.
- Large tap targets; all interactions work with a single tap or a short hold.
- The parent gate is a hold plus a multiplication question; it is a deterrent, not authentication.
- Progress is plain: level, words practiced, first-try accuracy, and a list of weakest skills.
- Optional uppercase letter display, adjustable voice speed, sound toggle, and garden animation toggle.
- Session length: six items for stages 1-2, eight items later. A session can be stopped and resumed; the garden only grows when a session is completed.

## Accessibility notes

- Font is Andika (SIL Open Font License), chosen for letterform clarity in early literacy.
- `aria-live` feedback, keyboard shortcuts (1-3, Space/R), and `prefers-reduced-motion` support are included.
- Picture options rely on emoji rendering on the device; meaning is not otherwise redundant for blind users, so a sighted adult should assist non-readers who use screen readers.

## Technical notes

- Static site (no build step), offline via a service worker. Works from `file://` as a folder, but install-as-app needs HTTPS hosting.
- Isolated phoneme audio is bundled; word and instruction audio uses the browser's speech synthesis, so the tablet's installed English voice determines quality.
- Progress lives in localStorage on that device. There is no cloud sync, no accounts, and no data collection.
- No commercial CDN, analytics, or ads.

## Open questions for further testing

- How well does the picture set generalize across accents, dialects, and word choices?
- Are six sessions enough to reach the mastery gate, or should the first stage gate be softer for pre-K?
- Should the sentence questions include audio prompts so they are usable before decoding is fluent?
- Which grapheme tiles should be allowed as distractors once a pattern is introduced but before it is mastered?
- What is the right balance of review items per session as the bank of learned items grows?

## Grown-up controls

Grown-ups choose the starting reading level and can expose the sound-reference sheet on the child home screen. The reference sheet has separate section-visibility switches in the parent view. Starting above an earlier level preserves its progress but assumes those earlier sound patterns are already known. Math is not part of this build yet.
