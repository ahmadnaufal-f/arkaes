# @arkaes/ui

## 1.2.1

### Patch Changes

- d91e110: Add `auto-scroll-when-expanded` to `ark-accordion` and `ark-accordion-item`. When an item opens, it scrolls its own trigger to the top of the viewport, so a long panel opens into view instead of unfurling below the fold — the failure mode of any accordion whose sections are taller than the screen. Set it on the root to opt every item in, or on individual items; the root only ever switches items on, so a lone item can opt in inside a plain accordion.

  The scroll is skipped when the trigger already sits at the top (within 2px), and never runs for an item rendered `open` on page load — that would yank a visitor away from the top of the page on arrival. It runs on programmatic opens too, not just clicks, so a deep link that opens a section lands on it.

  Scrolling starts immediately for responsiveness and re-aligns once the reveal transition ends, because the trigger's final position is not knowable at click time: the body animates over `--accordion-duration`, and under `type="single"` a sibling above may be collapsing across the same window. `prefers-reduced-motion: reduce` gets an instant jump instead of a smooth scroll.

  Add `--accordion-scroll-margin` (default `0px`), applied as `scroll-margin-top` on the item, to keep the trigger clear of a sticky header.

- f984bbb: Restructure `ark-button` around a five-step emphasis scale — `primary`, `secondary`, `outline`, `ghost`, `link` — so the variants read as a deliberate ladder rather than three unrelated treatments. `ButtonVariant` gains `Outline` and `Link`; the existing members keep their names. Two variants change appearance: `ghost` becomes a true quiet button (transparent, muted label, soft hover surface) for low-emphasis actions, and the italic-serif text-link treatment it used to carry now belongs to `link`, which is what that styling always was. Call sites using `variant="ghost"` for inline navigation should move to `variant="link"` to keep their current look.

  Add an orthogonal `tone` prop (`neutral` | `danger`) that composes with every variant, so a destructive action can sit at any emphasis level instead of needing its own variant. Add `prefix` and `suffix` slots for directional glyphs, which nudge outward on hover.

  Sizes now resolve through host-scoped custom properties consumed only by the four button-shaped variants. This fixes a bug where `size="sm"` or `size="lg"` overwrote the text-link variant's padding and min-height by source order, silently boxing it. Size affects `link` through font size alone.

  Internals: `size`, `variant`, and `tone` normalize in their setters like `ark-badge` and `ark-chip`, so an unrecognized attribute value reflects back normalized instead of reflecting garbage while rendering a fallback. Spacing moved onto `--ark-space-*` tokens throughout, and the redundant `until()` render path was folded into the existing `loadingPromise` mechanism. `--ark-button-primary-bg` and `--ark-button-primary-bg-hover` keep their names; `--ark-button-primary-fg` joins them, and the hover default is now the semantic `--ark-color-text-soft` rather than the primitive `--ark-color-neutral-800`.

  Add a navigation loading state to `ark-media-card`, matching `ark-button`'s API. The card is an entry point to another page but gave no feedback when clicked — the page simply swapped once the next route resolved. It now takes a `loading` prop or a `loadingPromise`, turning the corner arrow into a spinner, dimming the copy, and freezing the hover affordances while the next page loads. Clicks are blocked until it settles so a second click cannot start a competing navigation.

- 00acbe9: Add `ark-carousel`, a scroll-snapped strip with arrow navigation that can be scoped to small screens. Set `breakpoint` to a pixel width and the element only behaves as a carousel at or below it; leave it off and it is always one. This is the piece that was missing whenever a page wanted one markup block to read as a grid on desktop and a swipeable strip on a phone — until now that meant hand-rolling the track, the snapping, the arrows and the counter per page.

  The element owns carousel behaviour, not layout. While the carousel is inactive its track renders as `display: contents`, so slotted slides are laid out by whatever grid or flex rules the consumer puts on the host — including in server-rendered HTML, before the element upgrades, so a page's desktop layout never waits on JavaScript. In carousel mode the track becomes the scroll container: swiping is its native scroll (`overflow-x: auto`, `touch-action: pan-x pan-y`, so vertical drags still scroll the page), and the arrows are the pointer/keyboard path to the same positions. Position is reconciled from the resting scroll offset, so a swipe moves the counter too, and scrolling stays inside the track rather than dragging the page around as `scrollIntoView` does.

  Slides are clamped to the track's content box. A snap area wider than the snapport is not a snap position at all but a snap _range_ — every offset where the slide covers the snapport counts as settled — so an oversized slide leaves swipes resting between cards instead of on a card edge. The clamp keeps `--ark-carousel-item-width` from reaching past that box, and `scroll-snap-stop: always` keeps one swipe to one slide.

  The reflected `active` attribute lets CSS branch on the current mode without repeating the breakpoint, and the carousel ARIA semantics are applied only while it is active. `ark-carousel:change` reports `{ index, total }`; `goTo(index)`, `next()` and `prev()` drive it from script. Slides are sized through `--ark-carousel-item-width`, `--ark-carousel-gap`, `--ark-carousel-padding-inline` and `--ark-carousel-padding-block`; `hide-controls` drops the nav row for swipe-only use, `hide-counter` keeps the arrows without the readout, and the `prev-icon`/`next-icon` slots replace the glyphs. Ships with a React wrapper (`onChange`), a Storybook page, and `@arkaes/ui/register/ark-carousel`.

- d91e110: `ark-project-header` now publishes the bottom edge of its pinned hero on `:root` as `--ark-project-header-pinned-bottom` (`0px` while unpinned), so page CSS can keep in-page scrolling clear of it. This exists because the height is not something a stylesheet could hardcode: the collapsed hero measures ~220px with the visual watermark, ~52px once the visual is dropped below 860px, and more again when the title wraps to a second line. The value is republished from the existing rAF-coalesced scroll handler and from a `ResizeObserver` on the hero, which covers the collapse transition, viewport resizes, and title reflow — the scroll handler alone would miss them, since pinning changes position without changing size.

  A module-level owner reference keeps a ClientRouter navigation from clearing the property: the incoming header publishes while the outgoing one is still mounted, so teardown only removes a value it still owns.

  This fixes `ark-accordion`'s `auto-scroll-when-expanded` on case-study pages, where the header pins between the nav and the content and an expanding trigger was landing underneath it.

- 091e01e: Fix slotted headings losing their margins and measure in `ark-hero` and `ark-page-header`. For an element assigned to a slot the cascade compares declarations across shadow-including trees and the _outer_ tree wins for normal declarations, so a consumer's global reset (`h1, p { margin-block: 0 }`, `p { max-width: … }`) silently beat every box-model declaration made through `::slotted()`. Inherited properties such as `font-size` still applied, so slotted content rendered in the right type at the wrong spacing.

  The box model now lives on shadow DOM the document cannot reach — `.hero-title-slot` and `.hero-subtitle-slot` in `ark-hero`, and `slot[name="lead"]` in `ark-page-header` — instead of being escalated with `!important`. Attribute-driven default content and slotted light DOM render through the same wrapper, so the two cannot drift apart. Consumers passing content via `slot="title"`, `slot="subtitle"` or `slot="lead"` get the spacing the attribute API always produced; nothing changes for attribute-only usage.

  Add `--ark-project-header-min-height` to `ark-project-header` (default `240px`, unchanged). The floor exists to give the slotted visual room, so a consumer that slots no visual was left with that much empty space under the title; it can now be tuned per page.

- Updated dependencies [f984bbb]
  - @arkaes/tokens@1.0.2

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
