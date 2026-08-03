Sticky header for a case-study / project detail page. `eyebrow` and `heading`
are plain-text attributes; the `visual`, `tag`, and (optional) `title` slots take
rich content.

```html
<ark-project-header eyebrow="Case Study" heading="Design system for a fintech">
  <img slot="visual" src="/projects/fintech/cover.png" alt="" />
  <div slot="tag">
    <ark-chip variant="primary">Design Systems</ark-chip>
    <ark-chip variant="accent">Lit</ark-chip>
  </div>
</ark-project-header>
```

Override the heading with custom markup via `slot="title"`.

The hero pins flush with the top of the viewport and lets the fixed site nav
float over it, so the room for that chrome is held as start padding inside the
hero — `--ark-project-header-chrome-clearance` (default `76px`, enough for the
condensed nav bar and for ark-navigation's immersive floating row). Move the pin
itself with `--ark-project-header-stick-top` (default `0px`).

While pinned, the title is clamped to `--ark-project-header-title-lines`
(default `2`) and ellipsised past that, so a long one cannot grow the header
into the reading area. Unpinned — at the top of the page, where the hero has
room — it is never clamped and runs to as many lines as it needs. The text is
untouched in the DOM either way, so the page's `h1` and its accessible name stay
whole.
