# Arkaes

Arkaes is a performance-first personal portfolio workspace built with Astro, shared design
tokens, and a small Lit-based custom element library.

The project uses Astro for static content delivery, routing, SEO, and page structure. Lit powers
reusable framework-agnostic UI components, while Storybook documents those components outside of
the application shell. The goal is to demonstrate frontend engineering beyond framework
familiarity: design tokens, component architecture, performance awareness, accessibility, and
polished visual execution.

## Stack

- Astro for the portfolio and brand guideline sites
- Lit for framework-agnostic custom elements
- Storybook with the Web Components Vite renderer for component previews
- TypeScript across the workspace
- CSS custom properties for shared design tokens
- Turborepo and pnpm workspaces for the monorepo

## Workspace

```txt
apps/
  brand-guideline/  Astro site for the visual language and brand rules
  portfolio/
  storybook/        Storybook app for @arkaes/ui custom components
packages/
  tokens/           Shared CSS custom properties, theme, reset, and typography utilities
  ui/               Lit custom elements built on top of @arkaes/tokens
docs/               Planning notes and exported guideline documents
```

## Getting Started

Install pnpm if needed:

```sh
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

Install dependencies:

```sh
pnpm install
```

Run all development tasks through Turborepo:

```sh
pnpm dev
```

Run a specific app:

```sh
pnpm --filter @arkaes/portfolio dev
pnpm --filter @arkaes/brand-guideline dev
pnpm --filter @arkaes/storybook dev
```

Build everything:

```sh
pnpm build
```

Check TypeScript and Astro:

```sh
pnpm check
```

Lint the workspace:

```sh
pnpm lint
```

Format with ESLint autofix:

```sh
pnpm format
```

## Packages

`@arkaes/tokens` exports the shared token source and CSS entrypoints, including:

- `@arkaes/tokens/css`
- `@arkaes/tokens/tokens.css`
- `@arkaes/tokens/theme.css`
- `@arkaes/tokens/reset.css`
- `@arkaes/tokens/typography.css`

`@arkaes/ui` exports Lit custom element classes without registering them as a side effect.
Each component file exports its own guarded `defineArk...()` helper for selective registration.
Use per-component registration subpaths when an app needs elements registered as a side effect:

Primitives:

- `ark-badge`
- `ark-brand-logo`
- `ark-button`
- `ark-checkbox`
- `ark-input`
- `ark-radio`
- `ark-spinner`
- `ark-toggle`

Components:

- `ark-card`
- `ark-card-header`
- `ark-card-title`
- `ark-card-description`
- `ark-card-action`
- `ark-card-content`
- `ark-card-footer`
- `ark-dialog-root`
- `ark-dialog-trigger`
- `ark-dialog-portal`
- `ark-dialog-overlay`
- `ark-dialog-content`
- `ark-dialog-title`
- `ark-dialog-description`
- `ark-dialog-close`
- `ark-hero`
- `ark-navigation-root`
- `ark-navigation-brand`
- `ark-navigation-links`
- `ark-nav-link`
- `ark-navigation-cta`
- `ark-navigation-mobile-toggle`
- `ark-navigation-mobile-menu`

For smaller imports, consumers can use subpaths such as `@arkaes/ui/primitives/ark-button`
or `@arkaes/ui/components/ark-card`. To register only one component family as a side effect,
use subpaths such as `@arkaes/ui/register/ark-button` or `@arkaes/ui/register/ark-card`.
Component files carry their own `HTMLElementTagNameMap` declarations, so those single-component
imports include the matching TypeScript custom-element typing.

Storybook imports `@arkaes/tokens/css` in its preview config and uses per-component registration
subpaths in stories so the components render with the same theme variables used by the apps.

## Project Direction

The portfolio separates professional work from side projects while using the homepage to feature the
strongest stories. The design system is intentionally small and grows only as the portfolio and
brand surfaces need it.
