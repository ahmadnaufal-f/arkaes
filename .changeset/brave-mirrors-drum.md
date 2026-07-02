---
"@arkaes/ui": minor
"@arkaes/tokens": minor
---

Teach `ark-cursor` a text mode: over text-editable elements (`textarea`, textual `<input>`s, `[contenteditable]`) the arrow morphs into a blush text crosshair (an I-beam centered on the pointer) and the label chip is suppressed.

- New reflected `texting` attribute and `textSelector` property on `ark-cursor`; `enableArkCursor` accepts `textSelectors` (extra selectors appended to the built-in text-editable set).
- New theming hook `--ark-cursor-text-color` (defaults to `--ark-color-blush`).
- New `--ark-cursor-text` token in `@arkaes/tokens` (`text` by default, `none` under `:root[data-custom-cursor]`): shadow-DOM components set `cursor: var(--ark-cursor-text, text)` on text fields so the native I-beam hides while the custom cursor is active. `ark-input`'s inner `<input>` now does this; light DOM was already covered by the cursor's global sheet.
