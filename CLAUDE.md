# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Arkaes is a performance-first personal portfolio workspace. Astro handles static content delivery for the portfolio and brand guideline sites. Lit powers the shared custom element library (`@arkaes/ui`). Storybook documents components in isolation. Design tokens live in `@arkaes/tokens` as CSS custom properties.

## Commands

```sh
pnpm install          # install all workspace dependencies
pnpm dev              # run all apps in dev mode (via Turborepo)
pnpm build            # build everything in dependency order
pnpm check            # TypeScript + Astro type check
pnpm lint             # ESLint across all packages
pnpm format           # ESLint autofix
```

Target a specific app:

```sh
pnpm --filter @arkaes/portfolio dev
pnpm --filter @arkaes/brand-guideline dev
pnpm --filter @arkaes/storybook dev        # runs on http://localhost:6006
```

There are no tests in this project.

## Monorepo Layout

```
apps/
  portfolio/        Astro site — main portfolio
  brand-guideline/  Astro site — visual language documentation
  storybook/        Storybook (web-components-vite renderer) for @arkaes/ui
packages/
  tokens/           CSS custom properties, theme, reset, typography
  ui/               Lit custom elements built on top of @arkaes/tokens
docs/               Planning notes (not built)
```

Turborepo orchestrates build order: `@arkaes/tokens` → `@arkaes/ui` → apps. The `check` task depends on `^build` so packages must build before type-checking.

## Package Architecture

### `@arkaes/tokens`

Source is split between TypeScript token constants (`src/tokens/*.ts`) and CSS files (`src/styles/*.css`). Apps and Storybook import the CSS directly via the package exports (e.g. `@arkaes/tokens/css`, `@arkaes/tokens/theme.css`). The TS exports are for programmatic token access.

### `@arkaes/ui`

Exports come from two layers:

- `src/primitives/` — Lit `LitElement` subclasses with all styles inlined via tagged template `css\`...\``. Each primitive uses CSS custom properties from `@arkaes/tokens` for theming. Properties declared via `static override properties` with `reflect: true` are mirrored to HTML attributes.
- `src/components/` — higher-level compositions (currently being migrated; some files deleted per git status).

`src/index.ts` re-exports everything from both layers. Each primitive self-registers its custom element tag via a `defineElement` guard that checks `customElements.get()` first to avoid double-registration.

New custom elements go in `src/primitives/`, follow the `ArkFoo` class naming convention with `ark-foo` tag names, and must be added to `src/primitives/index.ts` for the guard registration and export.

### Storybook

Stories live in `apps/storybook/src/stories/`. Each story file imports `html` from `lit` and uses `@storybook/web-components-vite` types. The pattern is: define `type StoryArgs`, write a `render` function using `html\`...\``, export a `meta` object satisfying `Meta<StoryArgs>`, then export named story variants with `args` overrides.

Storybook imports `@arkaes/tokens/css` and `@arkaes/ui` in its preview config so components render with the correct theme variables.

## Key Conventions

- All CSS values in Lit components use `var(--ark-*)` tokens — never hardcode colors, spacing, or font values outside of tokens.
- ESLint is configured with `--max-warnings=0` in every package, so linting is strict.
- `packageManager` is pinned to `pnpm@9.15.4` — use `corepack` if needed.
