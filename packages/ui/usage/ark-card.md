A card is composed from subpart elements, not slots. Nest the parts inside
`ark-card`. Every part is optional — use only what you need.

- `ark-card-header` — grid of title + description on the left, action on the right
- `ark-card-title`, `ark-card-description` — text inside the header
- `ark-card-action` — trailing control in the header (icon button, badge, …)
- `ark-card-content` — the main body
- `ark-card-footer` — right-aligned actions/metadata at the bottom

```html
<ark-card variant="surface" width="md" interactive>
  <ark-card-header>
    <ark-card-title>Quiet systems for sharp work</ark-card-title>
    <ark-card-description>
      A restrained surface for organizing modular interface layouts.
    </ark-card-description>
    <ark-card-action>
      <ark-badge variant="soft">New</ark-badge>
    </ark-card-action>
  </ark-card-header>

  <ark-card-content>
    <p>Body copy goes here — any markup or nested Arkaes elements.</p>
  </ark-card-content>

  <ark-card-footer>
    <ark-button variant="ghost" size="sm">Dismiss</ark-button>
    <ark-button variant="primary" size="sm">Open</ark-button>
  </ark-card-footer>
</ark-card>
```

`width` accepts `sm | md | lg | xl | full`. Add `interactive` for the hover-lift
affordance. `variant="project"` is the borderless, full-bleed portfolio variant.
