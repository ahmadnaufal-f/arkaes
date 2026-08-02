---
"@arkaes/ui": patch
---

Fix slotted headings losing their margins and measure in `ark-hero` and `ark-page-header`. For an element assigned to a slot the cascade compares declarations across shadow-including trees and the *outer* tree wins for normal declarations, so a consumer's global reset (`h1, p { margin-block: 0 }`, `p { max-width: … }`) silently beat every box-model declaration made through `::slotted()`. Inherited properties such as `font-size` still applied, so slotted content rendered in the right type at the wrong spacing.

The box model now lives on shadow DOM the document cannot reach — `.hero-title-slot` and `.hero-subtitle-slot` in `ark-hero`, and `slot[name="lead"]` in `ark-page-header` — instead of being escalated with `!important`. Attribute-driven default content and slotted light DOM render through the same wrapper, so the two cannot drift apart. Consumers passing content via `slot="title"`, `slot="subtitle"` or `slot="lead"` get the spacing the attribute API always produced; nothing changes for attribute-only usage.

Add `--ark-project-header-min-height` to `ark-project-header` (default `240px`, unchanged). The floor exists to give the slotted visual room, so a consumer that slots no visual was left with that much empty space under the title; it can now be tuned per page.
