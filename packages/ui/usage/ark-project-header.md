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

Override the heading with custom markup via `slot="title"`. Adjust the pinned
offset with the `--ark-project-header-stick-top` custom property.
