---
"@arkaes/tokens": minor
"@arkaes/chatbot": patch
"@arkaes/ui": patch
---

Add `--ark-shadow-float`, the elevation for chrome that floats free over the page, and put everything that does on it: the dock's actions (`ark-scroll-top`, the `ark-chatbot` launcher) and `ark-navigation`'s immersive pills, which are the same layer at the other edge of the screen. It sits a step above `--ark-shadow-md` and is built from four layers rather than one: a single wide blur falls off in one ramp and reads as a grey smudge under a small round control, where stacked layers — tight and near-opaque up close, wide and faint further out — approximate how light actually falls off and stay smooth at any size.

Fix `ark-scroll-top` cutting its own drop shadow off square. The host carried `overflow: hidden` so the fixed-width button could not spill out of the box as it narrowed to nothing, but that clip took the shadow with it, leaving a hard grey ledge under a round button. The collapse now scales the button instead, which takes it out of the layout question entirely: nothing spills, so there is nothing to clip.

`ark-navigation`'s CTA is now a pill in immersive mode rather than keeping its resting `--ark-radius-xs`. The radius reaches the inner button through `--ark-nav-cta-radius`, since a square border inside a rounded backdrop is worse than either shape on its own, and the button stretches to its host so the two outlines stay concentric. Its hover underline is suppressed there via `--ark-nav-cta-underline-opacity`: a straight 2px bar across the foot of a pill is clipped by the curve into a stub, and the background and border-colour change carry the hover without it.

The MCP `tokens` resource collapses whitespace inside a value, so a token authored across several lines — as a layered shadow has to be — is reported as one readable string.
