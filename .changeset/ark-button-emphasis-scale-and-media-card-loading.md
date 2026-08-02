---
"@arkaes/ui": patch
---

Restructure `ark-button` around a five-step emphasis scale — `primary`, `secondary`, `outline`, `ghost`, `link` — so the variants read as a deliberate ladder rather than three unrelated treatments. `ButtonVariant` gains `Outline` and `Link`; the existing members keep their names. Two variants change appearance: `ghost` becomes a true quiet button (transparent, muted label, soft hover surface) for low-emphasis actions, and the italic-serif text-link treatment it used to carry now belongs to `link`, which is what that styling always was. Call sites using `variant="ghost"` for inline navigation should move to `variant="link"` to keep their current look.

Add an orthogonal `tone` prop (`neutral` | `danger`) that composes with every variant, so a destructive action can sit at any emphasis level instead of needing its own variant. Add `prefix` and `suffix` slots for directional glyphs, which nudge outward on hover.

Sizes now resolve through host-scoped custom properties consumed only by the four button-shaped variants. This fixes a bug where `size="sm"` or `size="lg"` overwrote the text-link variant's padding and min-height by source order, silently boxing it. Size affects `link` through font size alone.

Internals: `size`, `variant`, and `tone` normalize in their setters like `ark-badge` and `ark-chip`, so an unrecognized attribute value reflects back normalized instead of reflecting garbage while rendering a fallback. Spacing moved onto `--ark-space-*` tokens throughout, and the redundant `until()` render path was folded into the existing `loadingPromise` mechanism. `--ark-button-primary-bg` and `--ark-button-primary-bg-hover` keep their names; `--ark-button-primary-fg` joins them, and the hover default is now the semantic `--ark-color-text-soft` rather than the primitive `--ark-color-neutral-800`.

Add a navigation loading state to `ark-media-card`, matching `ark-button`'s API. The card is an entry point to another page but gave no feedback when clicked — the page simply swapped once the next route resolved. It now takes a `loading` prop or a `loadingPromise`, turning the corner arrow into a spinner, dimming the copy, and freezing the hover affordances while the next page loads. Clicks are blocked until it settles so a second click cannot start a competing navigation.
