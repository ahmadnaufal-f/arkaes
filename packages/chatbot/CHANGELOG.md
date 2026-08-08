# @arkaes/chatbot

## 0.4.0

### Minor Changes

- 5066243: Add `docked`, which hands the launcher's placement to a parent instead of planting the widget in the bottom-right corner of the viewport. The host becomes an ordinary in-flow box the size of its launcher, and the panel — far too big to sit in a dock — takes over the fixed positioning the host gives up, centred above it and cleared by `--ark-chatbot-docked-panel-bottom`. This is what lets the widget sit in `ark-floating-action-container` alongside other floating actions. Undocked placement is unchanged.

  Restyle the launcher as a raised surface chip — surface background, hairline border, `--ark-shadow-float` — rather than a solid accent pill, so it reads as one family with the other floating controls it now sits beside. `--ark-chatbot-launcher-bg` and `--ark-chatbot-launcher-color` are the way back to a louder treatment.

  Replace the Æ monogram on the launcher with an assistant mark of two four-pointed stars: it reads as "AI" at a glance where a wordmark glyph reads as branding. The monogram still stands in for Arkhe inside the panel, where the heading has already introduced it.

  Morph the launcher into the panel on open, and back on close: the pill travels to the panel's box and grows into it while the contents cross-fade, so the panel reads as the launcher expanding rather than as a new surface appearing. The shape is a `clip-path` window rather than a scale, so the panel's text is revealed at its final size instead of being stretched through the motion, and nothing inside the panel is laid out more than once. It runs on `--ark-duration-slow` — this surface travels the height of a dock and grows from a pill to most of the screen, and at the normal duration it is over before the eye can follow it.

  The morph is driven by the Web Animations API from inside the component, not by the View Transition API. That would be the obvious tool for a morph, but it cannot capture elements inside a shadow root: `view-transition-name` computes on them and no snapshot is ever taken, so no group is generated and nothing animates (verified in Chromium 141 — a light-DOM control element in the same document captures fine). Staying with WAAPI also keeps the animation local: no stylesheet injected into the host document, no whole-page snapshot and freeze on every open, and no competing for the one view transition a document is allowed to have — which matters for any host that runs its own on navigation.

  Skipped, falling back to the existing cross-fade, under `prefers-reduced-motion: reduce`, where the browser has no `Element.animate`, and whenever either box cannot be measured. `no-morph` opts out for good.

### Patch Changes

- 2170581: Render assistant replies with the shared `@arkaes/ui/markdown` renderer instead
  of the chatbot's own copy.

  Replies gain tables, images, strikethrough, task lists and horizontal rules, and
  headings become real `<h4>` elements rather than `<p class="md-h">`. The
  safe-by-construction model is unchanged — the renderer defaults to untrusted, so
  raw HTML in model output is escaped to literal text and link urls stay
  allowlisted — and links now open in a new tab only when they leave the site.

  The bubble adopts `markdownStyles` in its shadow root and keeps its own block on
  top for chat-specific spacing.

- 8f887a2: Add `--ark-shadow-float`, the elevation for chrome that floats free over the page, and put the dock's actions on it — `ark-scroll-top` and the `ark-chatbot` launcher. `ark-navigation`'s immersive pills stay on `--ark-shadow-md`: they share the top of the screen with `ark-project-header`, itself elevated while pinned, and two float-height shadows stacked in that corner is more depth than it can carry. It sits a step above `--ark-shadow-md` and is built from four layers rather than one: a single wide blur falls off in one ramp and reads as a grey smudge under a small round control, where stacked layers — tight and near-opaque up close, wide and faint further out — approximate how light actually falls off and stay smooth at any size.

  Fix `ark-scroll-top` cutting its own drop shadow off square. The host carried `overflow: hidden` so the fixed-width button could not spill out of the box as it narrowed to nothing, but that clip took the shadow with it, leaving a hard grey ledge under a round button. The collapse now scales the button instead, which takes it out of the layout question entirely: nothing spills, so there is nothing to clip.

  `ark-navigation`'s CTA is now a pill in immersive mode rather than keeping its resting `--ark-radius-xs`. The radius reaches the inner button through `--ark-nav-cta-radius`, since a square border inside a rounded backdrop is worse than either shape on its own, and the button stretches to its host so the two outlines stay concentric. Its hover underline is suppressed there via `--ark-nav-cta-underline-opacity`: a straight 2px bar across the foot of a pill is clipped by the curve into a stub, and the background and border-colour change carry the hover without it.

  The MCP `tokens` resource collapses whitespace inside a value, so a token authored across several lines — as a layered shadow has to be — is reported as one readable string.

- Updated dependencies [2170581]
- Updated dependencies [8f887a2]
- Updated dependencies [8f887a2]
- Updated dependencies [5066243]
- Updated dependencies [1511ee5]
  - @arkaes/ui@1.3.0
  - @arkaes/tokens@1.1.0

## 0.3.0

### Minor Changes

- d841c73: Retune Arkhe's prompts and generation config for gpt-5.4-nano. The persona was written for GPT-4o mini (a chatty model that needed reining in), so its concise-first, bullet-list, all-negative rules made the newer reasoning model clip its replies and sound robotic.
  - Split the persona into a stable `ARKHE_SYSTEM_PROMPT` (identity, voice, immutable policy, permanent facts) and a new `ARKHE_DEVELOPER_PROMPT` (answer shape, length, citation mechanics, few-shot examples), sent as `system` + `developer` messages. The system half is byte-identical across turns, so it caches.
  - Reframed the voice from a list of prohibitions into positive guidance: warm, conversational, paragraph-first, synthesize-don't-copy, length matched to the question, curious.
  - `buildSystemPrompt` no longer takes knowledge/retrieval; a new `buildDeveloperPrompt(knowledge, options)` carries the per-request excerpts and profile. `BuildSystemPromptOptions` now only holds `persona`; retrieval options moved to `BuildDeveloperPromptOptions`.
  - `createChatHandler` gains `reasoningEffort` (default `"low"`), `verbosity` (default `"medium"`), and `maxOutputTokens` (default 800, via `max_completion_tokens`). `temperature` is now unset by default instead of `0.4`.

- f98cfdd: Add source citations to Arkhe replies. When RAG retrieval is on, each distinct retrieved source is numbered, the model cites the excerpts it uses inline as `[n]`, and the handler streams back the sources it actually cited. The `ark-chatbot` widget renders these as a **Sources** footer under the reply, linking to each source's page.
  - New `resolveCitation` option on `createChatHandler` maps a retrieved chunk to its display label and optional URL (keeps the package free of any site-specific URL scheme).
  - New `buildCitations` / `selectCitedSources` helpers and `Citation` / `CitationInfo` / `ResolveCitation` types from `@arkaes/chatbot/server`; `formatRetrievedKnowledge` now tags excerpts with their citation number.
  - Source links are restricted to `http(s):`, `mailto:`, or root-relative hrefs; root-relative links open in the same tab so the conversation survives the navigation.

## 0.2.0

### Minor Changes

- 52cf191: Redesign the `ark-chatbot` widget with brand assets and motion.
  - Arkhe now has a visual identity: an italic Æ monogram badge (the ARKÆS glyph) on the launcher, in the panel header, and beside assistant messages (first message of a run).
  - The launcher is a gradient pill with an accent-tinted shadow and a soft breathing halo ring (disabled under reduced motion); it crossfades with the panel instead of snapping.
  - The panel animates both open and close (opacity + scale from the launcher corner, `visibility` step transitions), the header gets a two-line identity (name + new `tagline` attribute) over a quiet radial accent wash, and the log gets a thin themed scrollbar.
  - Bubbles are restyled: asymmetric corner radii pointing at the speaker, gradient user bubbles, hairline-bordered assistant bubbles, and an entrance fade/slide per message.
  - Waiting for the first token now shows a three-dot typing indicator instead of a bare blinking caret; the caret remains while text streams.
  - New `suggestions` property (`string[]`, JSON attribute) renders starter-prompt chips in the empty state that submit on click; the greeting and chips stagger in each time the panel opens. Set it to `[]` to disable.
  - Micro-interactions on the send button (hover lift, paper-plane nudge), textarea focus ring, and header close button.
  - The halo is a first-visit cue: opening the panel once stores `ark-chatbot:opened` in `localStorage` and keeps the halo off on later visits.
  - ark-cursor integration: the launcher and close button carry `data-cursor-label` ("Open" / "Close") for the custom cursor's chip, and the composer textarea sets `cursor: var(--ark-cursor-text, text)` so the native I-beam hides while the custom cursor is active.
  - Defaults changed: `heading` is now "Arkhe" (it remains the dialog label), the greeting matches the Arkhe persona copy rules, and the launcher pill now displays `launcher-label` as its visible text.

### Patch Changes

- Updated dependencies [52cf191]
  - @arkaes/tokens@1.0.1
