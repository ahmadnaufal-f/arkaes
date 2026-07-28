Linked media card — used for case studies, projects, and blog posts. Text and
link come from attributes; the `media` and `tag` slots take rich content. The
`media` slot updates dynamically on `slotchange`.

```html
<ark-media-card
  href="/projects/fintech"
  category="Design Systems"
  title="A design system for a fintech team"
  summary="40+ components, zero visual inconsistencies, shipped in 6 weeks."
>
  <img slot="media" src="/projects/fintech/cover.png" alt="" />
  <div slot="tag">
    <ark-chip variant="primary">Lit</ark-chip>
    <ark-chip variant="accent">Tokens</ark-chip>
  </div>
</ark-media-card>
```

Dated entries (e.g. blog posts) can add `date` for the label and `datetime` for
the machine-readable value. It renders on the metadata line beside `category`,
inside the card, so it can't be clipped by neighbouring cards in a grid.

```html
<ark-media-card
  href="/blog/why-i-added-a-privacy-notice"
  category="Career"
  date="July 25, 2026"
  datetime="2026-07-25T00:00:00.000Z"
  title="Why I Added a Privacy Notice to My App"
  summary="What a legal training session changed about how I collect data."
  variant="compact"
>
  <img slot="media" src="/blog/privacy-notice/cover.png" alt="" />
  <ark-chip slot="tag">Privacy</ark-chip>
</ark-media-card>
```
