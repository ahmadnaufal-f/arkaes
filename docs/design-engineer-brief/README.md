# Design Engineer PDF

A four-page portfolio artifact — a concise design philosophy document, not a brand
guideline. Written for a Design Engineering hiring manager to read in about five
minutes.

**Deliverable:** [`ahmad-naufal-design-engineer.pdf`](./ahmad-naufal-design-engineer.pdf)

| Page | |
| --- | --- |
| 01 | Architecture & Aesthetics — what Arkaes is, and why it exists alongside NDA'd work |
| 02 | How I Think — Understand, Structure, Craft, Hand off, one shipped example each |
| 03 | Building Systems — tokens, primitives, components, patterns, applications |
| 04 | Learning by Shipping — the side-project loop, and QR codes into the work |

## Where the content comes from

The prose is lifted from existing writing in this repo, not composed for the PDF:

- `apps/portfolio/src/content/about.md` — most of it, across all four pages
- `apps/portfolio/src/content/case-studies/milk-tracker.md` — the Craft example
- `apps/portfolio/src/content/projects/*.md` — stacks and project one-liners

The visual language follows `apps/brand-guideline`: the eyebrow-with-rule, the
Fraunces-thin section title with an italic accent `em`, hairline dividers, the ink
panel with its accent edge, 2px radius, and no shadows at rest. Token values in
`document.html` are copied from `packages/tokens/tokens/*.json`, which is the
source of truth — note that `SKILL.md` still carries the superseded v1.0 palette.

## Diagrams

Three are reused unmodified and inlined at build time:

- `apps/portfolio/public/about/how-i-work.svg` — page 2
- `apps/portfolio/public/about/learning-loop.svg` — page 4

`assets/system-architecture.svg` is the one new drawing. It extends
`apps/portfolio/public/about/arkaes-layers.svg` in the same grammar — dashed
boundary, `#ddd7cf` hairlines, 0.75 strokes, DM Mono 7.5px labels, blush-tinted
foundation band — adding what the original stops short of: the DTCG source and
Style Dictionary below the token foundation, and the MCP server reading the
Custom Elements Manifest and token source beside it.

## Building

Dependencies are declared here rather than in the workspace, because nothing in
the monorepo consumes this:

```sh
cd docs/design-engineer-brief
npm install
npm run build           # writes ahmad-naufal-design-engineer.pdf
npm run proof           # also writes out/proof-{1..4}.png
```

The first run fetches the woff2 files from Google Fonts and inlines them as
base64; every later run is offline. Pass `--force` to redo the cached phases.

If the container ships a Chromium build that does not match this Playwright
version, point at the existing one instead of downloading another copy:

```sh
CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm run build
```

Only the PDF and the authored inputs are committed. `fonts/`, `out/`, and the
derived images under `assets/` are git-ignored and regenerate deterministically.
