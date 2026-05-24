# Arkaes Portfolio

Arkaes Portfolio is a performance-first personal portfolio built with Astro and a small Lit-based design system.

The project uses Astro for static content delivery, routing, SEO, and page structure, while Lit powers reusable framework-agnostic UI components. The goal is to demonstrate frontend engineering beyond framework familiarity: design tokens, component architecture, performance awareness, accessibility, and polished visual execution.

## Stack

- Astro for the portfolio website
- Lit for framework-agnostic UI components
- TypeScript across the workspace
- CSS custom properties for shared design tokens
- Turborepo and pnpm workspaces for the monorepo

## Workspace

```txt
apps/
  portfolio/
packages/
  ui/
docs/
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

Run the portfolio:

```sh
pnpm dev
```

Build everything:

```sh
pnpm build
```

Check TypeScript and Astro:

```sh
pnpm check
```

## Project Direction

The portfolio separates professional work from side projects while using the homepage to feature the strongest stories. The initial focus is a small, useful design system that grows only as the portfolio needs it.

