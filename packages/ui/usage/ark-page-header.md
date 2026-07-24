Page-level header for sub-pages. Use the attribute API for the common case, or
named slots (`eyebrow`, `title`, `lead`) to override any field with custom
markup. The default slot appends content below the lead.

```html
<!-- Attribute API -->
<ark-page-header
  eyebrow="About"
  title="Frontend engineer, systems-minded"
  lead="I build design systems and the tooling around them."
></ark-page-header>

<!-- Slots for rich markup + trailing meta content -->
<ark-page-header>
  <ark-badge slot="eyebrow" variant="eyebrow">Projects</ark-badge>
  <h1 slot="title">Selected work</h1>
  <p slot="lead">A few things I'm proud of.</p>
  <dl>
    <dt>Role</dt><dd>Lead engineer</dd>
  </dl>
</ark-page-header>
```
