Two-column page hero. Compose it with named slots — put `slot="…"` on real
elements (text must be wrapped, e.g. in a `<span>`), not bare text.

```html
<ark-hero>
  <span slot="eyebrow">Featured</span>
  <h1 slot="title">Architecture meets aesthetics</h1>
  <p slot="subtitle">Frontend engineering for polished, systematic interfaces.</p>
  <ark-button slot="actions" variant="primary" href="/contact">Get in touch</ark-button>
  <img slot="visual" src="/hero.png" alt="" />
</ark-hero>
```

Named slots: `eyebrow`, `title`, `subtitle`, `actions`, `visual`. For simple
cases the attribute API (`title`, `subtitle`, `primary-label`/`primary-href`,
`ghost-label`/`ghost-href`) renders default content without slots.
