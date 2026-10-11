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

## Visual sizing and motion

The built-in composition remains the visual fallback when the `visual` slot is
empty. Its pieces use the default scroll scatter. Content supplied through the
`visual` slot does not use that scatter; it can use the available panel width:

```html
<ark-hero
  style="
    --ark-hero-visual-width: 100%;
    --ark-hero-visual-min-height: 32rem;
    --ark-hero-visual-background: var(--ark-color-accent-soft);
  "
>
  <my-hero-visual slot="visual"></my-hero-visual>
</ark-hero>
```

`--ark-hero-visual-width` defaults to `auto`. The visual panel background can
be changed with `--ark-hero-visual-background`, which defaults to
`--ark-color-accent-soft`. On tablet and mobile, the visual panel uses
`--ark-hero-visual-min-height` and falls back to `420px`.

Pointer parallax runs only above `900px` when the device has a fine pointer,
supports hover, and does not request reduced motion. The hero's entrance and
scroll animations are also disabled when reduced motion is requested.
Set the boolean `disable-parallax` attribute when a custom visual supplies its
own motion; it defaults to off and can be toggled through the reflected
`disableParallax` property.

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
