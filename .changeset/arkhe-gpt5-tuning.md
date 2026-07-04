---
"@arkaes/chatbot": minor
---

Retune Arkhe's prompts and generation config for gpt-5.4-nano. The persona was written for GPT-4o mini (a chatty model that needed reining in), so its concise-first, bullet-list, all-negative rules made the newer reasoning model clip its replies and sound robotic.

- Split the persona into a stable `ARKHE_SYSTEM_PROMPT` (identity, voice, immutable policy, permanent facts) and a new `ARKHE_DEVELOPER_PROMPT` (answer shape, length, citation mechanics, few-shot examples), sent as `system` + `developer` messages. The system half is byte-identical across turns, so it caches.
- Reframed the voice from a list of prohibitions into positive guidance: warm, conversational, paragraph-first, synthesize-don't-copy, length matched to the question, curious.
- `buildSystemPrompt` no longer takes knowledge/retrieval; a new `buildDeveloperPrompt(knowledge, options)` carries the per-request excerpts and profile. `BuildSystemPromptOptions` now only holds `persona`; retrieval options moved to `BuildDeveloperPromptOptions`.
- `createChatHandler` gains `reasoningEffort` (default `"low"`), `verbosity` (default `"medium"`), and `maxOutputTokens` (default 800, via `max_completion_tokens`). `temperature` is now unset by default instead of `0.4`.
