# @arkaes/ui

Framework-agnostic [Lit](https://lit.dev) custom elements for the Arkaes design system, built
directly from the [Arkaes Brand Guideline](https://brand.arkaes.dev).

The elements are styled entirely with CSS custom properties from
[`@arkaes/tokens`](https://www.npmjs.com/package/@arkaes/tokens), so they work in any
framework (or no framework) and can be rethemed from plain CSS (see
[Theming & overriding tokens](#theming--overriding-tokens)).

## See it in action

- **Brand guideline** — [brand.arkaes.dev](https://brand.arkaes.dev): the visual language these
  components are built on.
- **Portfolio** — [arkaes.dev](https://arkaes.dev): the design system in production.
- **Storybook** — [ds.arkaes.dev](https://ds.arkaes.dev): every component in isolation.

> [!NOTE]
> **Light mode only — by design.** As stated in the brand guideline, Arkaes UI is deliberately
> restricted to a single light theme. This is an intentional expression of the brand's values,
> not a missing feature: there is no dark mode, and the components are tuned for light surfaces.
> You can still fully [retheme](#theming--overriding-tokens) colors, type, and shape.

## Install

```sh
npm install @arkaes/ui
```

`@arkaes/tokens` is a dependency of this package, so it is installed automatically.

## Load the design tokens

> [!IMPORTANT]
> The components reference CSS custom properties (`var(--ark-*)`) for all colors,
> spacing, and typography. Installing `@arkaes/ui` makes the tokens **available**, but
> you must import the token CSS **once** in your app for components to render correctly —
> otherwise the variables are undefined and elements appear unstyled.

```js
// once, at your app entry point
import "@arkaes/tokens/css";
```

Individual layers are also available: `@arkaes/tokens/tokens.css` (the variables themselves),
`@arkaes/tokens/reset.css`, and `@arkaes/tokens/typography.css`.

## Theming & overriding tokens

Every value in every component resolves from a `--ark-*` CSS custom property — nothing is
hardcoded. Custom properties **inherit through the shadow DOM**, so you can retheme the entire
system with plain CSS: no build step, no Sass, no `::part` overrides needed.

> [!IMPORTANT]
> Declare your overrides **after** `@arkaes/tokens/css` is loaded (or on a more specific
> selector). The token defaults live on `:root`, so a later `:root` block wins the cascade.

### Global overrides

Re-declare the semantic tokens on `:root` to retheme everything at once:

```css
/* your-theme.css — loaded after @arkaes/tokens/css */
:root {
  /* brand / accent color */
  --ark-color-accent: #2563eb;
  --ark-color-accent-soft: #dbeafe;
  --ark-color-accent-strong: #1e40af;

  /* supporting color */
  --ark-color-secondary: #0f766e;

  /* surfaces & text */
  --ark-color-bg: #ffffff;
  --ark-color-text: #0b1020;

  /* shape & type */
  --ark-radius-md: 0.5rem;
  --ark-font-sans: "Inter", system-ui, sans-serif;
}
```

Common starting points:

| Intent | Tokens to set |
| --- | --- |
| Brand / accent color | `--ark-color-accent`, `--ark-color-accent-soft`, `--ark-color-accent-strong` |
| Supporting color | `--ark-color-secondary`, `--ark-color-secondary-soft` |
| Background / surfaces | `--ark-color-bg`, `--ark-color-surface`, `--ark-color-surface-soft` |
| Text | `--ark-color-text`, `--ark-color-text-muted`, `--ark-color-text-subtle` |
| Corner radius | `--ark-radius-xs` … `--ark-radius-2xl` |
| Typography | `--ark-font-sans`, `--ark-font-display`, `--ark-text-*`, `--ark-weight-*` |

See [`@arkaes/tokens`](https://www.npmjs.com/package/@arkaes/tokens) for the full token list.

### Scoped overrides

Because the properties inherit, set tokens on any ancestor to retheme just that subtree:

```html
<section style="--ark-color-accent: #b91c1c;">
  <!-- only ark-* elements inside here use the red accent -->
  <ark-button variant="secondary">Delete</ark-button>
</section>
```

### Per-component hooks

A few components expose their own override variables for finer control. Each falls back to a
global token when unset, so you only set them when you want that component to differ:

| Variable | Component | Falls back to |
| --- | --- | --- |
| `--ark-button-primary-bg` | `ark-button` (primary) | `--ark-color-text` |
| `--ark-button-primary-bg-hover` | `ark-button` (primary hover) | `--ark-color-neutral-800` |
| `--ark-dialog-overlay-bg` | `ark-dialog` overlay scrim | dim of `--ark-color-neutral-900` |
| `--ark-navigation-bg` | `ark-navigation` bar | `--ark-color-bg` |

```css
ark-button {
  --ark-button-primary-bg: #16a34a;
  --ark-button-primary-bg-hover: #15803d;
}
```

## Register elements

Importing `@arkaes/ui` itself has **no side effects** — it only exports classes, enums, and
types (use it for typing and for framework wrappers). To actually upgrade the custom elements
in the browser, import one of the registration entrypoints:

```js
// register everything
import "@arkaes/ui/register";

// or register a single element (tree-shake-friendly)
import "@arkaes/ui/register/ark-button";
import "@arkaes/ui/register/ark-card";
```

Then use the tags in markup:

```html
<ark-button variant="primary">Get in touch</ark-button>
```

## Entrypoints

| Import | Side effects | Use for |
| --- | --- | --- |
| `@arkaes/ui` | none | classes, enums (`ChipVariant`, `BadgeVariant`, …), types |
| `@arkaes/ui/register` | registers **all** elements | apps that want everything available |
| `@arkaes/ui/register/<name>` | registers **one** element | selective, tree-shakeable registration |
| `@arkaes/ui/primitives`, `/components`, `/patterns` (and `/*` subpaths) | none | direct, typed access to a single class |

## Elements

**Primitives:** `ark-badge`, `ark-brand-logo`, `ark-button`, `ark-checkbox`, `ark-chip`,
`ark-dropdown`, `ark-empty`, `ark-input`, `ark-radio`, `ark-radio-group`, `ark-spinner`,
`ark-toggle`

**Components:** `ark-accordion`, `ark-card` (+ subparts), `ark-cursor`, `ark-dialog` (+ subparts),
`ark-hero`, `ark-navigation` (+ subparts), `ark-toast`

**Patterns:** `ark-case-study-card`, `ark-page-header`, `ark-project-header`

## TypeScript

Each element ships its own `HTMLElementTagNameMap` declaration, so `document.querySelector`
and the single-element register subpaths are fully typed.

## License

MIT
