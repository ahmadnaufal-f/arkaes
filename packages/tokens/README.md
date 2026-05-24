# @arkaes/tokens

Readability-first design tokens for the Arkaes portfolio and UI system.

## What changed

This version improves text clarity by:

- using a readable sans-serif stack for body text
- reserving decorative serif/display fonts for large headings only
- increasing muted-text contrast
- adding better line-height defaults
- adding reading measure tokens
- adding `.ark-readable` for case studies and long-form content
- improving dark-mode text contrast

## Use in Astro

```astro
---
import "@arkaes/tokens/css";
---
```

## Recommended typography usage

```html
<h1 class="ark-heading-display">Architecture meets aesthetics.</h1>
<p class="ark-text-lead">
  Frontend engineering for polished, performance-minded interfaces.
</p>

<article class="ark-readable">
  <h2 class="ark-heading-section">Case study</h2>
  <p>
    Long-form content should use readable spacing, strong contrast, and a comfortable line length.
  </p>
</article>
```

## Typography rule

```txt
Display serif = brand expression
Sans-serif = reading clarity
```

Avoid using decorative serif typography for body text, labels, cards, and descriptions.
