A round back-to-top button that collapses out of the layout while the page is
already at the top.

```html
<ark-scroll-top label="Back to top"></ark-scroll-top>
```

It tracks the page scroll itself and reflects `at-top` while `scrollY <= 0`;
there is nothing to wire up. Clicking scrolls the page to the top, smoothly
unless the visitor prefers reduced motion, and fires
`ark-scroll-top:activate`.

Collapsing is a width animation rather than a fade, so it is safe to put in
`ark-floating-action-container`: it also subtracts half of
`--ark-floating-action-gap` from each inline margin while collapsed, so the
actions beside it slide back to true centre instead of sitting off by half a gap.
Outside a dock that variable resolves to `0px` and the margins are simply absent.

Keyboard focus holds the button open — activating with Enter scrolls to the top,
which is exactly the moment it would otherwise collapse out from under the focus
ring; it goes away once focus moves on. A pointer press hands focus back instead.

| Custom property           | Default                       |
| ------------------------- | ----------------------------- |
| `--ark-scroll-top-size`   | `3.25rem`                     |
| `--ark-scroll-top-bg`     | `var(--ark-color-surface)`    |
| `--ark-scroll-top-color`  | `var(--ark-color-text)`       |

The button element is exposed as the `button` CSS part.
