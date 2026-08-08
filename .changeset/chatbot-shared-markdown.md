---
"@arkaes/chatbot": patch
---

Render assistant replies with the shared `@arkaes/ui/markdown` renderer instead
of the chatbot's own copy.

Replies gain tables, images, strikethrough, task lists and horizontal rules, and
headings become real `<h4>` elements rather than `<p class="md-h">`. The
safe-by-construction model is unchanged — the renderer defaults to untrusted, so
raw HTML in model output is escaped to literal text and link urls stay
allowlisted — and links now open in a new tab only when they leave the site.

The bubble adopts `markdownStyles` in its shadow root and keeps its own block on
top for chat-specific spacing.
