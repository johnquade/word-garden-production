# Asset attribution

## Phoneme recordings

The 45 short phoneme WAVs use two MIT-licensed community sources. Most are adapted from **Phonics**, by Xiaochao Liu (`s5s5/phonics`); the clearer recorded clips for `/t/`, `/p/`, `/f/`, `/s/`, `/ch/`, `/sh/`, `/th/`, voiced `/th/`, `/ng/`, and `/k/` come from **Yara Reads**, by Eli Finer (`finereli/yarareads`). The files were trimmed, resampled to 32 kHz mono, and normalized for offline playback. The app reuses `/k/` audio for the `c` and `ck` spellings. Exact source paths and app-key mappings are in `tools/phoneme-source.json`.

Upstreams:
- https://github.com/s5s5/phonics
- https://github.com/finereli/yarareads

Both source repositories are MIT-licensed. Notices for both are retained below.

```text
MIT License

Copyright (c) 2022 Xiaochao Liu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Yara Reads includes an MIT license. Its upstream notice is:

```text
MIT License

Copyright (c) 2026 Eli Finer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Font

Andika font files bundled at `assets/fonts/` are distributed under the SIL Open Font License 1.1. The font is designed for literacy and dyslexia-friendly letter distinctions. Google Fonts source: https://fonts.google.com/specimen/Andika

## Original app assets

Garden illustrations are authored SVG. The app layout, lesson list, exercise copy, and code were created for this prototype. Unicode emoji are rendered by the host operating system/browser and are not redistributed as image files.
