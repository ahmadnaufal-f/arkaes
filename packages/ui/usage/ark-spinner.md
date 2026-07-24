Loading indicator. Provide a `label` for a standalone accessible status, or set
`decorative` when a surrounding control already announces the busy state.

```html
<!-- Standalone, announced to assistive tech -->
<ark-spinner label="Loading projects"></ark-spinner>

<!-- Decorative, inside a busy control -->
<ark-spinner variant="dots" size="sm" decorative></ark-spinner>
```

Variants: `arc | segment | orbital | dash | dots`. Sizes: `sm | md | lg`. Color
follows `--spinner-color` (defaults to the accent token):

```html
<ark-spinner style="--spinner-color: var(--ark-color-secondary)"></ark-spinner>
```
