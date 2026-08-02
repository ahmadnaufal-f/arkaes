---
"@arkaes/chatbot": minor
---

Add `docked`, which hands the launcher's placement to a parent instead of planting the widget in the bottom-right corner of the viewport. The host becomes an ordinary in-flow box the size of its launcher, and the panel — far too big to sit in a dock — takes over the fixed positioning the host gives up, centred above it and cleared by `--ark-chatbot-docked-panel-bottom`. This is what lets the widget sit in `ark-floating-action-container` alongside other floating actions. Undocked placement is unchanged.

Restyle the launcher as a raised surface chip — surface background, hairline border, `--ark-shadow-md` — rather than a solid accent pill, so it reads as one family with the other floating controls it now sits beside. `--ark-chatbot-launcher-bg` and `--ark-chatbot-launcher-color` are the way back to a louder treatment.

Replace the Æ monogram on the launcher with an assistant mark of two four-pointed stars: it reads as "AI" at a glance where a wordmark glyph reads as branding. The monogram still stands in for Arkhe inside the panel, where the heading has already introduced it.
