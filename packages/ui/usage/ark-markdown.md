Renders markdown as arkaes prose. Load the stylesheet once in the app:

```js
import "@arkaes/ui/markdown.css";
```

## Server-rendered (preferred for long-form pages)

Render on the server and pass the HTML as children. `ark-markdown` leaves
pre-rendered children alone, so the text ships in the HTML with no client
JavaScript and no flash of unstyled content.

```astro
---
import { renderMarkdownAsync } from "@arkaes/ui/markdown";

const body = await renderMarkdownAsync(post.body, {
  headings: "article",
  trust: "trusted",
});
---
<ark-markdown heading-style="article" set:html={body} />
```

## Client-rendered

Set `source` and the element renders it itself — this is the streaming path.

```html
<ark-markdown heading-style="flat" features="citations" soft-breaks></ark-markdown>
```

```js
document.querySelector("ark-markdown").source = "## Hello\n\nSome **markdown**.";
```

## Heading styles

`heading-style` is the one prop that carries the difference between the site's
two long-form treatments.

| Value | Structure | Look |
| --- | --- | --- |
| `article` (default) | real `h1`–`h6` with slug ids | display face, stepped sizes |
| `section` | every level shifted down one, no ids | sans, body size, medium weight |
| `flat` | every level pinned to `h4` | one weight, for short replies |

`section` is why a case study's `###` comes out as an `<h4>`: its `##` titles are
already carried by the accordion above the body, so the body's headings sit one
level below them.

## Trust

`trust` defaults to `untrusted`: raw HTML is escaped to literal text and every
href and src goes through an allowlist, so model output is safe by construction.
Pass `trust="trusted"` for content you author yourself — that is also the only
mode in which the `diagrams` map inlines SVG source.

## Features

Opt-in syntaxes, comma-separated on the attribute or an array on the property:

- `proof-cards` — `→ metric | [Linked work](/href) | supporting sentence`
- `figures` — a block of `![alt](src)` lines as diagrams or a screenshot row
- `glyph-bullets` — `•` accepted as a list marker
- `citations` — `[3]` / `[3, 5]` reference badges

```js
import { renderMarkdown } from "@arkaes/ui/markdown";

renderMarkdown(section.content, {
  headings: "section",
  trust: "trusted",
  features: ["proof-cards", "figures", "glyph-bullets"],
  diagrams,
});
```

## Syntax highlighting

`highlight` receives the code and language and returns the complete `<pre>`.
`renderMarkdownAsync` accepts an async one, which is what Shiki needs. The
stylesheet already maps Shiki's `css-variables` theme onto the design tokens.

```js
await renderMarkdownAsync(body, {
  highlight: (code, lang) => shiki.codeToHtml(code, { lang, theme: "css-variables" }),
});
```

## Shadow DOM

A component that renders markdown inside its own shadow root cannot reach the
global stylesheet. Adopt the styles directly instead:

```js
import { markdownStyles, renderMarkdown } from "@arkaes/ui/markdown";

static styles = [markdownStyles, css`/* … */`];
```
