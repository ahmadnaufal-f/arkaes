# @arkaes/tokens

## 1.1.0

### Minor Changes

- 8f887a2: Add `--ark-shadow-float`, the elevation for chrome that floats free over the page, and put the dock's actions on it — `ark-scroll-top` and the `ark-chatbot` launcher. `ark-navigation`'s immersive pills stay on `--ark-shadow-md`: they share the top of the screen with `ark-project-header`, itself elevated while pinned, and two float-height shadows stacked in that corner is more depth than it can carry. It sits a step above `--ark-shadow-md` and is built from four layers rather than one: a single wide blur falls off in one ramp and reads as a grey smudge under a small round control, where stacked layers — tight and near-opaque up close, wide and faint further out — approximate how light actually falls off and stay smooth at any size.

  Fix `ark-scroll-top` cutting its own drop shadow off square. The host carried `overflow: hidden` so the fixed-width button could not spill out of the box as it narrowed to nothing, but that clip took the shadow with it, leaving a hard grey ledge under a round button. The collapse now scales the button instead, which takes it out of the layout question entirely: nothing spills, so there is nothing to clip.

  `ark-navigation`'s CTA is now a pill in immersive mode rather than keeping its resting `--ark-radius-xs`. The radius reaches the inner button through `--ark-nav-cta-radius`, since a square border inside a rounded backdrop is worse than either shape on its own, and the button stretches to its host so the two outlines stay concentric. Its hover underline is suppressed there via `--ark-nav-cta-underline-opacity`: a straight 2px bar across the foot of a pill is clipped by the curve into a stub, and the background and border-colour change carry the hover without it.

  The MCP `tokens` resource collapses whitespace inside a value, so a token authored across several lines — as a layered shadow has to be — is reported as one readable string.

### Patch Changes

- 1511ee5: Add `tier` and `reference` to the generated flat token JSON
  (`@arkaes/tokens/tokens.json`).

  All three DTCG tier files nest under the same top-level `"color"` key, so Style
  Dictionary collapses them into one `color.*` namespace and the artifact had no
  way to say which tier a token was authored in. `tier` recovers that from the
  source directory (`primitive` / `semantic` / `component`), derived generically so
  a new `tokens/<tier>/` directory needs no script change.

  `value` is fully dereferenced, which discards the alias chain. `reference` keeps
  the value as authored whenever it still contains an `{alias}` — so `color.surface`
  now carries `value: "#fafaf9"` alongside `reference: "{color.neutral-0}"`, and
  `color.border` keeps its whole `color-mix(in srgb, {color.neutral-700}, ...)`
  expression.

  Both fields are additive; `reference` is omitted for literal tokens. The typed
  `@arkaes/tokens/generated` map is unchanged.

## 1.0.2

### Patch Changes

- f984bbb: Release a new version so consuming builds resolve a freshly published package. No token values, exports, or source files change in this release.

  The package's CSS and TypeScript token artifacts (`src/styles/tokens.generated.css` and `src/generated/`) are produced by Style Dictionary during install rather than committed, so a deploy that reuses a previously resolved copy of this package can start from stale or missing generated output. Cutting a version alongside `@arkaes/ui` keeps the two in step and avoids that.

## 1.0.1

### Patch Changes

- 52cf191: Teach `ark-cursor` a text mode: over text-editable elements (`textarea`, textual `<input>`s, `[contenteditable]`) the arrow morphs into a blush text crosshair (an I-beam centered on the pointer) and the label chip is suppressed.
  - New reflected `texting` attribute and `textSelector` property on `ark-cursor`; `enableArkCursor` accepts `textSelectors` (extra selectors appended to the built-in text-editable set).
  - New theming hook `--ark-cursor-text-color` (defaults to `--ark-color-blush`).
  - New `--ark-cursor-text` token in `@arkaes/tokens` (`text` by default, `none` under `:root[data-custom-cursor]`): shadow-DOM components set `cursor: var(--ark-cursor-text, text)` on text fields so the native I-beam hides while the custom cursor is active. `ark-input`'s inner `<input>` now does this; light DOM was already covered by the cursor's global sheet.

## 1.0.0

### Major Changes

- 40138ee: First release of the packages
