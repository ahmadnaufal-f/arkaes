Two-column page hero. Compose it with named slots — put `slot="…"` on real
elements (text must be wrapped, e.g. in a `<span>`), not bare text.

```html
<ark-hero>
  <ark-chip slot="eyebrow" variant="primary">Frontend Engineer</ark-chip>
  <ark-chip slot="eyebrow" variant="emerging">Applied AI Interfaces</ark-chip>
  <h1 slot="title">Architecture meets aesthetics</h1>
  <p slot="subtitle">Frontend engineering for polished, systematic interfaces.</p>
  <ark-button slot="actions" variant="primary" href="/contact">Get in touch</ark-button>
  <img slot="visual" src="/hero.png" alt="" />
</ark-hero>
```

Named slots: `eyebrow`, `title`, `subtitle`, `actions`, `visual`. For simple
cases the attribute API (`chips`, `title`, `subtitle`, `title-emphasis`,
`primary-label`/`primary-href`, `ghost-label`/`ghost-href`) renders default
content without slots.

## Chips

`chips` is a JSON string array and renders every entry as a `primary`
`ark-chip`:

```html
<ark-hero chips='["Frontend Engineer", "UI Systems Architect"]'></ark-hero>
```

Use the `eyebrow` slot instead when the row needs mixed variants, or when the
chips must appear in the server-rendered HTML — attribute-driven content is
rendered into the shadow root and is invisible to clients that do not run the
bundle.

## Headline

The headline sets each line unbroken and renders the emphasis as a filled band
rather than an italic accent run. With the attribute API, `title` and
`title-emphasis` become those two lines automatically. A slotted headline has
to supply the structure itself, and — since `::slotted()` cannot reach a
slotted node's descendants — style the lines and the band from the consumer's
own stylesheet:

```html
<h1 slot="title">
  <span class="line line--lead">Frontend engineering</span>
  <span class="line"><em>with clarity.</em></span>
</h1>
```

Below 1400px the band bleeds out to the hero's own inline edge; above it, where
the page gutter stops being a gutter and becomes open margin, it stays
self-contained.
