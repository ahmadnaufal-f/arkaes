Docks a row of floating actions to the bottom edge of the viewport, centred over
a gradient scrim. It is the bottom-edge counterpart to `ark-navigation`'s
immersive header and follows the same scroll rule: the actions step out of the
way while the page is moving and settle back in once it stops.

```html
<ark-floating-action-container>
  <ark-scroll-top></ark-scroll-top>
  <ark-chatbot docked launcher-label="Chat"></ark-chatbot>
</ark-floating-action-container>
```

The container centres whatever is slotted into it and has no opinion about what
the actions are. Hiding is suspended while a slotted action carries the `open`
attribute — an expanded `ark-chatbot` panel, say — or while the keyboard focus
ring is inside the dock.

The scrim fades in only once the page has scrolled (`scrolled` is reflected for
that), so a page sitting at its top is left clean.

An action that collapses itself as the page state changes should subtract half of
`--ark-floating-action-gap` from each of its inline margins while collapsed, so
the gap the row still draws around it nets out and the remaining actions stay
exactly centred. `ark-scroll-top` does this; anything else can copy it.

| Custom property                        | Default                     |
| -------------------------------------- | --------------------------- |
| `--ark-floating-action-gap`             | `var(--ark-space-3)`        |
| `--ark-floating-action-margin-block`    | `var(--ark-space-4)`        |
| `--ark-floating-action-scrim`           | `rgba(0,0,0,.38)` → transparent, bottom-up |
| `--ark-floating-action-hidden-shift`    | `8px`                       |

The scrim is also exposed as the `scrim` CSS part.
