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
the brand, CTA and hamburger become separate floating pills over a gradient
scrim as tall as the pills plus their block margins. While the page is moving
the pills tuck away, and they settle back in shortly after scrolling stops.
Opening the mobile menu suspends immersive mode so the drawer has a solid bar to
hang off.

The root sets `immersive` and `immersive-hidden` on itself — set them by hand
only to pin a state (a story, a screenshot). Tune the look with:

| Custom property                       | Default                    |
| ------------------------------------- | -------------------------- |
| `--ark-nav-immersive-margin-block`    | `12px`                     |
| `--ark-nav-immersive-pill-size`       | `44px`                     |
| `--ark-nav-immersive-pill-bg`         | translucent nav background |
| `--ark-nav-immersive-pill-radius`     | `var(--ark-radius-full)`   |
| `--ark-nav-immersive-scrim`           | `rgba(0,0,0,.25)` → transparent |
| `--ark-nav-immersive-hidden-shift`    | `-8px`                     |

The scrim is also exposed as the `scrim` CSS part.
