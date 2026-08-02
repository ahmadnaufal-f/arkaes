Each direct child of `ark-carousel` is one slide. Without `breakpoint` the element
is always a carousel:

```html
<ark-carousel label="Featured work" prev-label="Previous project" next-label="Next project">
  <ark-media-card title="Virtual Home"></ark-media-card>
  <ark-media-card title="Air Care"></ark-media-card>
  <ark-media-card title="Milk Tracker"></ark-media-card>
</ark-carousel>
```

`breakpoint` scopes the behaviour to small screens: at or below that viewport
width (in px) the element becomes a scroll-snapped strip with arrows; above it,
the element stops being a carousel and its slides are laid out by whatever CSS
the consumer puts on the host. While inactive the internal track is
`display: contents`, so the slides are direct layout children of the host — the
grid below applies to them unchanged, and it applies in the server-rendered HTML
before the element upgrades.

```html
<ark-carousel class="work-grid" breakpoint="900" label="Case study navigation">
  <a class="work-card" href="/case-studies/virtual-home">Virtual Home</a>
  <a class="work-card" href="/case-studies/air-care">Air Care</a>
</ark-carousel>
```

```css
/* Desktop layout — the host is the grid container. */
.work-grid {
  display: grid;
  gap: 3px;
  grid-template-columns: 1.6fr 1fr;
}

/* Carousel mode — tune the strip through the component's custom properties. */
.work-grid[active] {
  display: block;
  --ark-carousel-item-width: 100%;
  --ark-carousel-gap: 12px;
}
```

`--ark-carousel-item-width` is measured against the track's content box, so
`100%` is one slide per view and smaller values let the next slide peek. Slides
are clamped to that box: a snap area wider than the snapport stops being a snap
position and becomes a snap *range*, which leaves swipes resting between slides
instead of on a slide edge. Reach past the box — a viewport-relative width, say
— and the clamp holds the strip snapping cleanly rather than honouring the
width.

The `active` attribute is reflected while the carousel is engaged, so CSS can
branch on mode without repeating the breakpoint. Listen for
`ark-carousel:change` (detail `{ index, total }`) to track position, and drive it
from script with `goTo(index)`, `next()`, and `prev()`.

Use `hide-controls` to drop the navigation row entirely (swipe only), or
`hide-counter` to keep the arrows without the `01 / 04` readout. Replace the
arrow glyphs through the `prev-icon` and `next-icon` slots.
