# @arkaes/ui

## 1.1.1

### Patch Changes

- 52cf191: Teach `ark-cursor` a text mode: over text-editable elements (`textarea`, textual `<input>`s, `[contenteditable]`) the arrow morphs into a blush text crosshair (an I-beam centered on the pointer) and the label chip is suppressed.
  - New reflected `texting` attribute and `textSelector` property on `ark-cursor`; `enableArkCursor` accepts `textSelectors` (extra selectors appended to the built-in text-editable set).
  - New theming hook `--ark-cursor-text-color` (defaults to `--ark-color-blush`).
  - New `--ark-cursor-text` token in `@arkaes/tokens` (`text` by default, `none` under `:root[data-custom-cursor]`): shadow-DOM components set `cursor: var(--ark-cursor-text, text)` on text fields so the native I-beam hides while the custom cursor is active. `ark-input`'s inner `<input>` now does this; light DOM was already covered by the cursor's global sheet.

- 52cf191: Exclude test files from the package build. `tsdown`'s entry glob previously swept in `__tests__/*.test.ts` and `react/__tests__/setup.ts`, which import dev-only deps (`@testing-library/react`, vitest internals). Rolldown reported these as "Module not found, treating it as an external dependency" and emitted test files into `dist/`. The entry now excludes `*.test.ts` and `__tests__/**`.
- Updated dependencies [52cf191]
  - @arkaes/tokens@1.0.1

## 1.1.0

### Minor Changes

- d6988ee: Redesign `ark-cursor` from the dot + trailing ring into an arrow pointer with a contextual label chip.

  The cursor is now a high-contrast SVG arrow (ink fill, warm-white halo) that tracks the pointer 1:1 — no trailing animation and no per-frame rAF work. Over interactive elements the arrow tints to the accent color, and a small uppercase label chip ("View", "Navigate", …) scales in beside it, growing out of the pointer position. Capability gating, native-cursor hiding, shadow-DOM-aware hover detection, and Astro View Transition persistence are unchanged.

  New:
  - Chip text resolves from a `data-cursor-label` attribute on any hovered element (innermost wins, `""` suppresses the chip), falling back to a selector → text map with entry-order priority. Built-in defaults: `ark-case-study-card` → "View", `a[href]` → "Navigate".
  - `enableArkCursor()` accepts a `labels` option (selector → chip text) spread over the built-in defaults; `interactiveSelectors` is unchanged.
  - The chip flips to the opposite side of the pointer near the right/bottom viewport edges so it never clips offscreen, and its scale animation always originates from the chip corner facing the cursor.
  - Hover detection runs on `pointermove`, so movement entirely within a component's shadow tree (e.g. onto the CTA inside `ark-hero`) is detected — `pointerover` never reaches document-level listeners in that case.
  - `ark-accordion-item` labels the cursor chip from its trigger: "Expand" when collapsed, "Collapse" when open, overridable via the `expand-cursor-label` / `collapse-cursor-label` attributes.
  - Theming hooks: `--ark-cursor-outline-color`, `--ark-cursor-label-bg`, `--ark-cursor-label-color`, `--ark-cursor-label-border`, `--ark-cursor-label-offset-x`/`-y`, and `--ark-cursor-z`.

  Breaking:
  - The ring is gone: the `--ark-cursor-ring-color`, `--ark-cursor-ring-size`, `--ark-cursor-ring-hover-color`, `--ark-cursor-ring-hover-size`, and `--ark-cursor-hover-size` custom properties no longer have any effect.
  - `--ark-cursor-dot-z` and `--ark-cursor-ring-z` are replaced by a single `--ark-cursor-z`.
  - `--ark-cursor-size` now sizes the arrow (default 20px) instead of the dot (default 8px), and `--ark-cursor-color`/`--ark-cursor-hover-color` now paint the arrow fill.

## 1.0.2

### Patch Changes

- 8a1c647: Add `loadingPromise` property to `ark-button`

  Alongside the existing manual `loading` boolean, buttons now accept a `loadingPromise` property. While the promise is pending the button automatically enters loading state (spinner, `aria-busy`, native `disabled` for `<button>` / `aria-disabled` for `<a>`); it recovers automatically when the promise settles (resolve or reject). The `until` Lit directive drives the render path. Both properties can coexist: `loadingPromise` controls promise-driven loading while `loading` still handles manual control independently.

## 1.0.1

### Patch Changes

- 83168f9: Add Vitest unit tests for React wrapper components (`ArkDialogPortal`, `ArkNavigationRoot`), covering portal teleportation, StrictMode remount, scroll-lock behaviour, and event-map callbacks.

## 1.0.0

### Major Changes

- 40138ee: First release of the packages

### Minor Changes

- 5408bed: Add React bindings for every element under the `@arkaes/ui/react` entrypoint, built with
  `@lit/react`. Reactive properties become typed props and custom events are exposed as `on*`
  props; each wrapper self-registers its element and ships a `"use client"` directive for RSC.
  React is an optional peer dependency, so non-React consumers are unaffected.

### Patch Changes

- Updated dependencies [40138ee]
  - @arkaes/tokens@1.0.0
