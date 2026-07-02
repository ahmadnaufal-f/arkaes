---
"@arkaes/chatbot": minor
---

Redesign the `ark-chatbot` widget with brand assets and motion.

- Arkhe now has a visual identity: an italic Æ monogram badge (the ARKÆS glyph) on the launcher, in the panel header, and beside assistant messages (first message of a run).
- The launcher is a gradient pill with an accent-tinted shadow and a soft breathing halo ring (disabled under reduced motion); it crossfades with the panel instead of snapping.
- The panel animates both open and close (opacity + scale from the launcher corner, `visibility` step transitions), the header gets a two-line identity (name + new `tagline` attribute) over a quiet radial accent wash, and the log gets a thin themed scrollbar.
- Bubbles are restyled: asymmetric corner radii pointing at the speaker, gradient user bubbles, hairline-bordered assistant bubbles, and an entrance fade/slide per message.
- Waiting for the first token now shows a three-dot typing indicator instead of a bare blinking caret; the caret remains while text streams.
- New `suggestions` property (`string[]`, JSON attribute) renders starter-prompt chips in the empty state that submit on click; the greeting and chips stagger in each time the panel opens. Set it to `[]` to disable.
- Micro-interactions on the send button (hover lift, paper-plane nudge), textarea focus ring, and header close button.
- Defaults changed: `heading` is now "Arkhe" (it remains the dialog label), the greeting matches the Arkhe persona copy rules, and the launcher pill now displays `launcher-label` as its visible text.
