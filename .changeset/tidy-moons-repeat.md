---
"@arkaes/ui": minor
---

Redesign `ark-cursor` from the dot + trailing ring into an arrow pointer with a contextual label chip.

The cursor is now a high-contrast SVG arrow (ink fill, warm-white halo) that tracks the pointer 1:1 — no trailing animation and no per-frame rAF work. Over interactive elements the arrow tints to the accent color, and a small uppercase label chip ("View", "Open", …) unfolds beside it. Capability gating, native-cursor hiding, shadow-DOM-aware hover detection, and Astro View Transition persistence are unchanged.

New:

- Chip text resolves from a `data-cursor-label` attribute on any hovered element (innermost wins, `""` suppresses the chip), falling back to a selector → text map with entry-order priority. Built-in defaults: `ark-case-study-card` → "View", `a[href]` → "Open".
- `enableArkCursor()` accepts a `labels` option (selector → chip text) spread over the built-in defaults; `interactiveSelectors` is unchanged.
- The chip flips to the opposite side of the pointer near the right/bottom viewport edges so it never clips offscreen.
- Theming hooks: `--ark-cursor-outline-color`, `--ark-cursor-label-bg`, `--ark-cursor-label-color`, `--ark-cursor-label-border`, `--ark-cursor-label-offset-x`/`-y`, and `--ark-cursor-z`.

Breaking:

- The ring is gone: the `--ark-cursor-ring-color`, `--ark-cursor-ring-size`, `--ark-cursor-ring-hover-color`, `--ark-cursor-ring-hover-size`, and `--ark-cursor-hover-size` custom properties no longer have any effect.
- `--ark-cursor-dot-z` and `--ark-cursor-ring-z` are replaced by a single `--ark-cursor-z`.
- `--ark-cursor-size` now sizes the arrow (default 20px) instead of the dot (default 8px), and `--ark-cursor-color`/`--ark-cursor-hover-color` now paint the arrow fill.
