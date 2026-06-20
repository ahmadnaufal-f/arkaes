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

Source is organized in three layers, each with a barrel `index.ts`:

- `src/primitives/` — Lit `LitElement` subclasses with all styles inlined via tagged template `css\`...\``. Each primitive uses CSS custom properties from `@arkaes/tokens` for theming. Properties declared via `static override properties` with `reflect: true` are mirrored to HTML attributes. Several primitives (e.g. `ark-badge`, `ark-button`, `ark-chip`) normalize enum-like props with private getter/setter pairs that call `this.requestUpdate(...)` and default to a known value.
- `src/components/` — higher-level compositions (`ark-card`, `ark-dialog`, `ark-hero`, `ark-navigation`, `ark-cursor`, `ark-toast`, `ark-accordion`).
- `src/patterns/` — page-specific compositions (`ark-case-study-card`).

`src/index.ts` re-exports everything from all layers. Each element self-registers its custom element tag through a `defineElement` guard (`src/define-element.ts`) that checks `customElements.get()` first to avoid double-registration.

**Package entrypoints (see `packages/ui/package.json` `exports`; apps resolve them to source via their `tsconfig.json` paths):**

- `@arkaes/ui` — classes, enums (e.g. `ChipVariant`, `BadgeVariant`), and types. **No side effects** — importing this does *not* register any custom element. Use it for stories and for typing.
- `@arkaes/ui/register` — global barrel; importing it runs `registerArkUi()` (in `src/register.ts`), which defines **every** primitive, component, and pattern. New primitives must add their `defineArkX()` call here.
- `@arkaes/ui/register/<name>` — side-effect import that registers **one** element only (e.g. `import "@arkaes/ui/register/ark-chip"`). Each needs a matching `src/register/<name>.ts` file.
- `@arkaes/ui/primitives`, `@arkaes/ui/components`, `@arkaes/ui/patterns` (and their `/*` subpaths) — direct access to a layer.

**How each app registers elements:**

- **Portfolio** (`apps/portfolio/src/layouts/BaseLayout.astro`) imports `@arkaes/ui/register` **once**, so every page has all elements available. Individual Astro components/islands (`SiteHeader`, `FilterableListing`, …) *additionally* import the specific `@arkaes/ui/register/ark-*` they use, so their own bundled `<script>` still works in isolation.
- **Brand-guideline** (`apps/brand-guideline/src/layouts/BrandGuidelineLayout.astro`) imports **only** the specific `@arkaes/ui/register/ark-*` it needs (no global register).
- **Storybook** (`apps/storybook/.storybook/preview.ts`) imports `@arkaes/tokens/css` and `@arkaes/ui/register` (global).

Since custom elements only matter client-side after upgrade, Astro renders the element's attributes server-side; registration via one of the above imports is what actually upgrades them in the browser. CSS can't pierce a primitive's shadow DOM, so parent-driven state (e.g. a card-wide hover) is done by toggling a reflected property from a small client script (see the tech-stack cards in `index.astro` driving `ark-chip`'s `isHovered` → `data-is-hovered`).

New custom elements go in `src/primitives/`, follow the `ArkFoo` class naming convention with `ark-foo` tag names, and must be: (1) exported from `src/primitives/index.ts`, (2) given a `src/register/ark-foo.ts` side-effect file, and (3) added to `registerArkPrimitives()` in `src/register.ts` so the global barrel picks them up.

### Storybook

Stories live in `apps/storybook/src/stories/`. Each story file imports `html` from `lit` and uses `@storybook/web-components-vite` types. The pattern is: define `type StoryArgs`, write a `render` function using `html\`...\``, export a `meta` object satisfying `Meta<StoryArgs>`, then export named story variants with `args` overrides.

Storybook's preview (`.storybook/preview.ts`) imports `@arkaes/tokens/css` and `@arkaes/ui/register` so components render with the correct theme variables and are all registered. Stories import enums/types from `@arkaes/ui` (e.g. `ChipVariant`).

## Key Conventions

- All CSS values in Lit components use `var(--ark-*)` tokens — never hardcode colors, spacing, or font values outside of tokens. Lit `css` blocks may use native CSS nesting (`&`, nested `:host(...)`) to stay DRY.
- ESLint is configured with `--max-warnings=0` in every package, so linting is strict.
- `packageManager` is pinned to `pnpm@9.15.4` — use `corepack` if needed. A fresh container needs `pnpm install` before `pnpm build`/`check`/`lint` (these run through Turborepo's `turbo` binary, installed as a dev dependency).
- Gotcha: ESLint's ignore list (root `eslint.config.js`) covers `**/dist/**`, `**/.astro/**`, `**/node_modules/**` but **not** Storybook's `storybook-static/` build output. Running `pnpm build` before `pnpm lint` makes lint scan that minified output and report hundreds of thousands of false errors. Remove `apps/storybook/storybook-static` before linting (it's gitignored).
