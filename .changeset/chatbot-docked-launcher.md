---
"@arkaes/chatbot": minor
---

Add `docked`, which hands the launcher's placement to a parent instead of planting the widget in the bottom-right corner of the viewport. The host becomes an ordinary in-flow box the size of its launcher, and the panel — far too big to sit in a dock — takes over the fixed positioning the host gives up, centred above it and cleared by `--ark-chatbot-docked-panel-bottom`. This is what lets the widget sit in `ark-floating-action-container` alongside other floating actions. Undocked placement is unchanged.

Restyle the launcher as a raised surface chip — surface background, hairline border, `--ark-shadow-float` — rather than a solid accent pill, so it reads as one family with the other floating controls it now sits beside. `--ark-chatbot-launcher-bg` and `--ark-chatbot-launcher-color` are the way back to a louder treatment.

Replace the Æ monogram on the launcher with an assistant mark of two four-pointed stars: it reads as "AI" at a glance where a wordmark glyph reads as branding. The monogram still stands in for Arkhe inside the panel, where the heading has already introduced it.

Morph the launcher into the panel on open, and back on close: the pill travels to the panel's box and grows into it while the contents cross-fade, so the panel reads as the launcher expanding rather than as a new surface appearing. The shape is a `clip-path` window rather than a scale, so the panel's text is revealed at its final size instead of being stretched through the motion, and nothing inside the panel is laid out more than once. It runs on `--ark-duration-slow` — this surface travels the height of a dock and grows from a pill to most of the screen, and at the normal duration it is over before the eye can follow it.

The morph is driven by the Web Animations API from inside the component, not by the View Transition API. That would be the obvious tool for a morph, but it cannot capture elements inside a shadow root: `view-transition-name` computes on them and no snapshot is ever taken, so no group is generated and nothing animates (verified in Chromium 141 — a light-DOM control element in the same document captures fine). Staying with WAAPI also keeps the animation local: no stylesheet injected into the host document, no whole-page snapshot and freeze on every open, and no competing for the one view transition a document is allowed to have — which matters for any host that runs its own on navigation.

Skipped, falling back to the existing cross-fade, under `prefers-reduced-motion: reduce`, where the browser has no `Element.animate`, and whenever either box cannot be measured. `no-morph` opts out for good.
