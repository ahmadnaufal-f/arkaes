The site navigation bar is composed from subpart elements under
`ark-navigation-root`. Provide both the desktop links and a mirrored mobile menu.

```html
<ark-navigation-root>
  <ark-navigation-brand href="/"></ark-navigation-brand>

  <ark-navigation-links>
    <ark-nav-link href="/#work">Work</ark-nav-link>
    <ark-nav-link href="/#about">About</ark-nav-link>
    <ark-nav-link href="/writing">Writing</ark-nav-link>
  </ark-navigation-links>

  <ark-navigation-cta href="/#contact">Let's talk</ark-navigation-cta>

  <ark-navigation-mobile-toggle></ark-navigation-mobile-toggle>
  <ark-navigation-mobile-menu>
    <ark-nav-link href="/#work">Work</ark-nav-link>
    <ark-nav-link href="/#about">About</ark-nav-link>
    <ark-nav-link href="/writing">Writing</ark-nav-link>
  </ark-navigation-mobile-menu>
</ark-navigation-root>
```

Add the `scrolled` attribute to `ark-navigation-root` for the condensed
scrolled-past state. The root listens for `ark-nav:menu-toggle` from the mobile
toggle automatically.

## Immersive mode

On viewports up to 900px the root also drives an immersive state: once the page
has scrolled past the resting height of the bar, the bar itself dissolves and
the brand, CTA and hamburger become separate floating pills. Behind them sits a
scrim layer as tall as the pills plus their block margins; it is unfilled by
default, so give `--ark-nav-immersive-scrim` a value to paint one. While the
page is moving the pills tuck away — the scrim stays put, since it is the
backdrop the content travels under — and they settle back in shortly after
scrolling stops.
Opening the mobile menu suspends immersive mode so the drawer has a solid bar to
hang off. Keyboard focus inside the header holds the pills open, so a scroll
triggered by tabbing never hides the control the focus ring is on.

The root sets `immersive` and `immersive-hidden` on itself — set them by hand
only to pin a state (a story, a screenshot). Tune the look with:

| Custom property                       | Default                    |
| ------------------------------------- | -------------------------- |
| `--ark-nav-immersive-margin-block`    | `12px`                     |
| `--ark-nav-immersive-pill-size`       | `44px`                     |
| `--ark-nav-immersive-pill-bg`         | translucent nav background |
| `--ark-nav-immersive-pill-radius`     | `var(--ark-radius-full)`   |
| `--ark-nav-immersive-scrim`           | `none`                     |
| `--ark-nav-immersive-hidden-shift`    | `-8px`                     |

The scrim is also exposed as the `scrim` CSS part.
