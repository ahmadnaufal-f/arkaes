# @arkaes/ui

## 1.3.0

### Minor Changes

- 2170581: Add `ark-markdown`, one markdown renderer for the whole workspace.

  `@arkaes/ui/markdown` exports `renderMarkdown()` / `renderMarkdownAsync()` — a
  framework-agnostic renderer built on `marked` that runs in Node and the browser —
  and `<ark-markdown>` renders into the **light DOM**, so a server-rendered body
  keeps shipping its text in the HTML with no client JavaScript.

  `heading-style` selects the treatment: `article` (real `h1`–`h6` with slug ids,
  display face, stepped sizes), `section` (every level shifted down one, sans at
  body size) and `flat` (every level pinned to one tag). Opt-in syntaxes cover the
  portfolio's own vocabulary — proof cards, figure blocks, glyph bullets and
  citation badges.

  `trust` defaults to `untrusted`: raw HTML is escaped to literal text and every
  href and src goes through an allowlist.

  Prose styles ship as `@arkaes/ui/markdown.css` for the light-DOM path and as the
  `markdownStyles` `CSSResult` for components that render into a shadow root.

- 8f887a2: Make `ark-project-header` travel with `ark-navigation`'s immersive header instead of holding a gap where it used to be. The hero reserves `--ark-project-header-chrome-clearance` at its top for the fixed chrome that floats over it, but once the pills tuck away mid-scroll that band is room held for something no longer there — a dead strip above a pinned title, on every case study, for as long as the reader keeps scrolling. The pinned hero now rides up by that clearance while the pills are away and settles back with them, so the reader gets the band back while the page is moving and the title returns to its place when it stops. It stops short by the hero's own end padding, which leaves the title in a band matching the one under it — a travelled header that reads as evenly padded rather than as a title shoved against the top edge.

  The two are joined by `--ark-nav-chrome-away`, published on `:root` by `ark-navigation-root` as `1` while its pills are hidden and `0` otherwise, with the same owner-token guard `--ark-project-header-pinned-bottom` uses so a ClientRouter navigation's outgoing header cannot clear the value its replacement just wrote. The header multiplies the flag into its travel rather than branching on it, since a custom property cannot be tested in a selector, and a page with no immersive header never writes the flag — the `0` fallback leaves consumers exactly where they were. Only the pinned hero travels: unpinned it is the top of the page rather than chrome over the article, so there is no clearance to reclaim.

  `--ark-project-header-pinned-bottom` still reports the edge the header comes to rest at, with the travel taken back out of it. The travel ends on the nav's settle timer, with no scroll event behind it to publish again, so an edge sampled mid-travel would stand uncorrected and a consumer offsetting against it would park content under the header once it settled back.

- 5066243: Add an immersive mode to `ark-navigation` and a matching bottom-edge dock, so a page's fixed chrome gets out of the reader's way while they scroll and settles back when they stop — the One UI idea, applied to both edges of the screen.

  Once the page has scrolled past the resting height of the bar, `ark-navigation-root` drops its own background and lets its children float as separate pills over a scrim layer as tall as the pills plus their block margins. That layer is unfilled by default — a gradient there read badly over real pages — so set `--ark-nav-immersive-scrim` to paint one. This runs at every viewport width: on a desktop the links ride in a pill of their own between the brand and the CTA, and below the links' existing 900px breakpoint they are already `display: none` and the hamburger pill takes their place, so which pills exist stays a decision of the children rather than a second breakpoint in the root. The scroll threshold is the resting bar height, measured only in that state so the condensed and floating heights cannot drag it down behind the scroll position and make the header flap at the boundary, and re-measured on resize because the bar's height moves with the viewport. Opening the mobile menu suspends the whole treatment: the drawer hangs off a solid bar, which also has to catch pointer events again. Tune it with `--ark-nav-immersive-margin-block`, `--ark-nav-immersive-pill-size`, `--ark-nav-immersive-pill-bg`, `--ark-nav-immersive-pill-radius`, `--ark-nav-immersive-links-gap`, `--ark-nav-immersive-scrim` and `--ark-nav-immersive-hidden-shift`; the scrim is exposed as the `scrim` part.

  `ark-navigation-root` also no longer paints a background at rest. The gradient that used to sit there read badly over real pages, and the 2px backdrop blur went with it — the gradient was what hid the blur's hard bottom edge, so on its own the blur was the same banding one step fainter. The condensed `scrolled` state still paints as before.

  Add `ark-floating-action-container`, the same idea at the bottom of the page: a fixed, centred row of floating actions over a scrim layer that runs the other way, likewise unfilled by default (`--ark-floating-action-scrim`). It follows the header's scroll rule, and a scrim given a fill appears only once the page has scrolled, so a page sitting at its top is left clean. An action carrying `open` takes the dock — hiding is suspended and its neighbours step aside — so an expanded panel neither fades out from under the reader nor competes with a button beside it. That state is mirrored onto the host as `has-open-action`, because `:host(:has([open]))` is evaluated against the shadow tree, where the light-DOM actions are not visible, and so never matches.

  Add `ark-scroll-top`, a round back-to-top button that collapses out of the row while the page is already at the top. It animates its own width rather than fading, and subtracts half of `--ark-floating-action-gap` from each inline margin while collapsed, so the gap goes with it and the remaining actions slide back to true centre instead of sitting off by half a gap — the reason a plain `display: none` or an opacity fade does not do this job. The subtraction is order-independent, so it works wherever the button sits in a row, and outside a dock the variable resolves to `0px` and the margins are simply absent.

  Both docks make the same exception for the keyboard: tabbing scrolls the page, and hiding the control the focus ring is on would leave the user with nothing to look at. The test is `:focus-visible` on the deepest focused node rather than `:focus-within` on the host, because a pointer tap leaves focus sitting on the button it hit and would otherwise latch the chrome open for the rest of the session.

  `ark-project-header` now pins flush with the top of the viewport instead of at a 60px stick offset, and holds room for the fixed nav as start padding instead — `--ark-project-header-chrome-clearance`, default `76px`. Parking it below the nav left a band of article text scrolling through the gap between the two, which the see-through immersive header made plain. Its collapse now engages on a scroll distance of its own rather than on the sentinel reaching the viewport top, which at a zero stick offset would fire immediately and render the header already collapsed. While pinned, the title is clamped to `--ark-project-header-title-lines` (default `2`) and ellipsised past that, so a long one cannot grow the header into the reading area; unpinned it runs to as many lines as it needs. The text is untouched in the DOM either way, so the page's `h1` and its accessible name stay whole.

  Both new elements ship with React wrappers, Storybook pages, usage docs and `@arkaes/ui/register/*` entry points.

### Patch Changes

- 8f887a2: Add `--ark-shadow-float`, the elevation for chrome that floats free over the page, and put the dock's actions on it — `ark-scroll-top` and the `ark-chatbot` launcher. `ark-navigation`'s immersive pills stay on `--ark-shadow-md`: they share the top of the screen with `ark-project-header`, itself elevated while pinned, and two float-height shadows stacked in that corner is more depth than it can carry. It sits a step above `--ark-shadow-md` and is built from four layers rather than one: a single wide blur falls off in one ramp and reads as a grey smudge under a small round control, where stacked layers — tight and near-opaque up close, wide and faint further out — approximate how light actually falls off and stay smooth at any size.

  Fix `ark-scroll-top` cutting its own drop shadow off square. The host carried `overflow: hidden` so the fixed-width button could not spill out of the box as it narrowed to nothing, but that clip took the shadow with it, leaving a hard grey ledge under a round button. The collapse now scales the button instead, which takes it out of the layout question entirely: nothing spills, so there is nothing to clip.

  `ark-navigation`'s CTA is now a pill in immersive mode rather than keeping its resting `--ark-radius-xs`. The radius reaches the inner button through `--ark-nav-cta-radius`, since a square border inside a rounded backdrop is worse than either shape on its own, and the button stretches to its host so the two outlines stay concentric. Its hover underline is suppressed there via `--ark-nav-cta-underline-opacity`: a straight 2px bar across the foot of a pill is clipped by the curve into a stub, and the background and border-colour change carry the hover without it.

  The MCP `tokens` resource collapses whitespace inside a value, so a token authored across several lines — as a layered shadow has to be — is reported as one readable string.

- Updated dependencies [8f887a2]
- Updated dependencies [1511ee5]
  - @arkaes/tokens@1.1.0

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
