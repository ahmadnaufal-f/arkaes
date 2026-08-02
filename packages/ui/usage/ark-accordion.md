Wrap `ark-accordion-item` children in `ark-accordion`. Each item's heading is the
`heading` attribute (or a rich `slot="trigger"`); the panel body is the item's
default slot.

```html
<ark-accordion>
  <ark-accordion-item heading="What is Arkaes?" open>
    <p>A performance-first personal portfolio workspace and design system.</p>
  </ark-accordion-item>

  <ark-accordion-item heading="Is it framework-agnostic?">
    <p>Yes — the components are standard custom elements built with Lit.</p>
  </ark-accordion-item>

  <!-- Rich trigger content -->
  <ark-accordion-item>
    <span slot="trigger"><strong>Custom</strong> trigger markup</span>
    <p>Panel body.</p>
  </ark-accordion-item>
</ark-accordion>
```

Listen for `ark-accordion:toggle` (detail `{ open }`) on an item to react to
expand/collapse.

`auto-scroll-when-expanded` scrolls an item's trigger to the top of the viewport
when it opens — useful for long panels, where expanding one near the bottom of
the screen otherwise leaves its content below the fold. It is skipped when the
trigger is already at the top, and never runs for an item rendered `open` on page
load. Set it on the root to opt every item in, or per item. Use
`--accordion-scroll-margin` to leave room for a sticky header.

```html
<ark-accordion type="single" auto-scroll-when-expanded style="--accordion-scroll-margin: 88px">
  <ark-accordion-item heading="Long section">…</ark-accordion-item>
  <ark-accordion-item heading="Another long section">…</ark-accordion-item>
</ark-accordion>
```
