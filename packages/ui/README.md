# @arkaes/ui

Framework-agnostic [Lit](https://lit.dev) custom elements for the Arkaes design system.

The elements are styled entirely with CSS custom properties from
[`@arkaes/tokens`](https://www.npmjs.com/package/@arkaes/tokens), so they work in any
framework (or no framework) and adapt to your theme.

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

Individual layers are also available: `@arkaes/tokens/reset.css`, `@arkaes/tokens/theme.css`,
`@arkaes/tokens/tokens.css`, `@arkaes/tokens/typography.css`.

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
