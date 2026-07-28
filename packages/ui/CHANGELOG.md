# @arkaes/ui

## 1.2.0

### Minor Changes

- 5526d68: Add a local, offline MCP server so coding agents can query the design system's
  component API and design tokens with no network dependency. It ships inside
  `@arkaes/ui` as the `arkaes-mcp` bin (stdio transport) and is invokable via
  `npx --package @arkaes/ui arkaes-mcp`.
  - Three tools: `list_components` (compact index of every element with variants
    and slots), `get_component_api` (full props/events/slots/CSS-props/CSS-parts
    plus an authored usage snippet, multiple components per call), and
    `get_tokens` (filter `--ark-*` tokens by category or name prefix; returns the
    category list when unfiltered).
  - Tokens are sourced from the DTCG pipeline: color and spacing come from the
    generated flat JSON (`@arkaes/tokens/tokens.json`) with their `type` and
    `description`, while typography, radius, shadow, motion, and layout come from
    the hand-authored token CSS. A shared value map resolves cross-tier references
    (e.g. a shadow's `var(--ark-color-neutral-900)`) to concrete values.
  - Component/manifest data is read at startup from the generated Custom Elements
    Manifest — nothing about the component API is hand-authored. A
    `custom-elements-manifest.config.mjs` plugin recovers tag
    names from the `defineElement` guard and expands enum- and CSS-selector-derived
    attribute values into concrete option lists.
  - Component sources gained JSDoc `@slot`/`@fires`/`@cssprop`/`@summary`
    annotations, and canonical usage snippets live in `usage/*.md`.

- 94677d2: **Breaking:** rename `ark-case-study-card` to `ark-media-card`. The card is used for case studies, projects, and now blog posts, so the name no longer described it. Renamed alongside the tag: `ArkCaseStudyCard` → `ArkMediaCard`, `ArkCaseStudyCardVariant` → `ArkMediaCardVariant`, `defineArkCaseStudyCard` → `defineArkMediaCard`, the `@arkaes/ui/register/ark-case-study-card` entrypoint → `@arkaes/ui/register/ark-media-card`, and the React wrapper export `ArkCaseStudyCard` → `ArkMediaCard`.

  `ark-cursor`'s built-in defaults follow the rename: `ark-media-card` is now in `DEFAULT_INTERACTIVE_SELECTOR` and carries the "View" label. Apps that passed `labels: { "ark-case-study-card": … }` to `enableArkCursor` need to update that key.

  Add an optional `datetime` attribute to `ark-media-card` — an ISO string or `YYYY-MM-DD`. The card derives the displayed label from it, so callers pass a single value instead of keeping a label and a machine value in sync. It renders on a metadata line beside `category`, keeping the date inside the card box, where a sibling element could be overlapped by neighbouring cards in a grid. Omitted when empty, so existing usage is unchanged.

  The label is formatted in UTC: a publish date is a calendar date rather than an instant, and formatting in the viewer's zone would render `2026-07-25T00:00:00.000Z` as "July 24" everywhere west of UTC. An unparseable value renders nothing rather than "Invalid Date".

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
