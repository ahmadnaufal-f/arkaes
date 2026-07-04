---
"@arkaes/chatbot": minor
---

Add source citations to Arkhe replies. When RAG retrieval is on, each distinct retrieved source is numbered, the model cites the excerpts it uses inline as `[n]`, and the handler streams back the sources it actually cited. The `ark-chatbot` widget renders these as a **Sources** footer under the reply, linking to each source's page.

- New `resolveCitation` option on `createChatHandler` maps a retrieved chunk to its display label and optional URL (keeps the package free of any site-specific URL scheme).
- New `buildCitations` / `selectCitedSources` helpers and `Citation` / `CitationInfo` / `ResolveCitation` types from `@arkaes/chatbot/server`; `formatRetrievedKnowledge` now tags excerpts with their citation number.
- Source links are restricted to `http(s):`, `mailto:`, or root-relative hrefs; root-relative links open in the same tab so the conversation survives the navigation.
