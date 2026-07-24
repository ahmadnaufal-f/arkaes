On-brand empty state. Text is set via attributes; the default slot holds an
optional action (e.g. a reset button).

```html
<ark-empty
  symbol="Æ"
  eyebrow="No results"
  heading="Nothing to show"
  heading-emphasis="yet"
  description="Try adjusting your filters or clearing the search."
>
  <ark-button variant="secondary" size="sm">Clear filters</ark-button>
</ark-empty>
```

`heading-emphasis` is rendered as an emphasized (italic) continuation of the
heading. Omit the default slot when no action is needed.
