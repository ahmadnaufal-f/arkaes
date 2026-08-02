# @arkaes/tokens

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
