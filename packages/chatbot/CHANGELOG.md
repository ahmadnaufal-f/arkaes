# @arkaes/chatbot

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
