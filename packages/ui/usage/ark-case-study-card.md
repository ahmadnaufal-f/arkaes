Linked portfolio card. Text and link come from attributes; the `media` and `tag`
slots take rich content. The `media` slot updates dynamically on `slotchange`.

```html
<ark-case-study-card
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
</ark-case-study-card>
```
