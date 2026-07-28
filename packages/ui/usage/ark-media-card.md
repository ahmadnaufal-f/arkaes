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

Dated entries (e.g. blog posts) add `datetime` — an ISO string or `YYYY-MM-DD`.
The card derives the displayed label from it, so there is one value to pass
rather than a label and a machine value to keep in sync. It renders on the
metadata line beside `category`, inside the card, so it can't be clipped by
neighbouring cards in a grid.

The label is formatted **in UTC**: a publish date is a calendar date, not an
instant, and formatting in the viewer's zone would shift
`2026-07-25T00:00:00.000Z` back to "July 24" for anyone west of UTC. A value the
platform can't parse renders nothing at all rather than "Invalid Date".

```html
<ark-media-card
  href="/blog/why-i-added-a-privacy-notice"
  category="Career"
  datetime="2026-07-25T00:00:00.000Z"
  title="Why I Added a Privacy Notice to My App"
  summary="What a legal training session changed about how I collect data."
  variant="compact"
>
  <img slot="media" src="/blog/privacy-notice/cover.png" alt="" />
  <ark-chip slot="tag">Privacy</ark-chip>
</ark-media-card>
```
