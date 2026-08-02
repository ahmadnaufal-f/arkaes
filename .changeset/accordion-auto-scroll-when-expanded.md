---
"@arkaes/ui": patch
---

Add `auto-scroll-when-expanded` to `ark-accordion` and `ark-accordion-item`. When an item opens, it scrolls its own trigger to the top of the viewport, so a long panel opens into view instead of unfurling below the fold — the failure mode of any accordion whose sections are taller than the screen. Set it on the root to opt every item in, or on individual items; the root only ever switches items on, so a lone item can opt in inside a plain accordion.

The scroll is skipped when the trigger already sits at the top (within 2px), and never runs for an item rendered `open` on page load — that would yank a visitor away from the top of the page on arrival. It runs on programmatic opens too, not just clicks, so a deep link that opens a section lands on it.

Scrolling starts immediately for responsiveness and re-aligns once the reveal transition ends, because the trigger's final position is not knowable at click time: the body animates over `--accordion-duration`, and under `type="single"` a sibling above may be collapsing across the same window. `prefers-reduced-motion: reduce` gets an instant jump instead of a smooth scroll.

Add `--accordion-scroll-margin` (default `0px`), applied as `scroll-margin-top` on the item, to keep the trigger clear of a sticky header.
