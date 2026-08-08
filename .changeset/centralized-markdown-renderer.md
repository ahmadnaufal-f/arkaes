---
"@arkaes/ui": minor
---

Add `ark-markdown`, one markdown renderer for the whole workspace.

`@arkaes/ui/markdown` exports `renderMarkdown()` / `renderMarkdownAsync()` — a
framework-agnostic renderer built on `marked` that runs in Node and the browser —
and `<ark-markdown>` renders into the **light DOM**, so a server-rendered body
keeps shipping its text in the HTML with no client JavaScript.

`heading-style` selects the treatment: `article` (real `h1`–`h6` with slug ids,
display face, stepped sizes), `section` (every level shifted down one, sans at
body size) and `flat` (every level pinned to one tag). Opt-in syntaxes cover the
portfolio's own vocabulary — proof cards, figure blocks, glyph bullets and
citation badges.

`trust` defaults to `untrusted`: raw HTML is escaped to literal text and every
href and src goes through an allowlist.

Prose styles ship as `@arkaes/ui/markdown.css` for the light-DOM path and as the
`markdownStyles` `CSSResult` for components that render into a shadow root.
