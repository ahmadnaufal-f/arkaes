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
