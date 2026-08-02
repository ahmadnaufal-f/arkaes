---
"@arkaes/ui": patch
---

`ark-project-header` now publishes the bottom edge of its pinned hero on `:root` as `--ark-project-header-pinned-bottom` (`0px` while unpinned), so page CSS can keep in-page scrolling clear of it. This exists because the height is not something a stylesheet could hardcode: the collapsed hero measures ~220px with the visual watermark, ~52px once the visual is dropped below 860px, and more again when the title wraps to a second line. The value is republished from the existing rAF-coalesced scroll handler and from a `ResizeObserver` on the hero, which covers the collapse transition, viewport resizes, and title reflow — the scroll handler alone would miss them, since pinning changes position without changing size.

A module-level owner reference keeps a ClientRouter navigation from clearing the property: the incoming header publishes while the outgoing one is still mounted, so teardown only removes a value it still owns.

This fixes `ark-accordion`'s `auto-scroll-when-expanded` on case-study pages, where the header pins between the nav and the content and an expanding trigger was landing underneath it.
