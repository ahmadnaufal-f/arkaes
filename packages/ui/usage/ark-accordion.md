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
