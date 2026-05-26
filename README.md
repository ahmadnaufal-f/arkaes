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

`@arkaes/ui` exports Lit custom elements and registers the current component set:

- `ark-badge`
- `ark-button`
- `ark-card`

Storybook imports both `@arkaes/tokens/css` and `@arkaes/ui` in its preview config so the
components render with the same theme variables used by the apps.

## Project Direction

The portfolio separates professional work from side projects while using the homepage to feature the
strongest stories. The design system is intentionally small and grows only as the portfolio and
brand surfaces need it.
