# @arkaes/tokens

Readability-first design tokens for the Arkaes portfolio and UI system.

## What changed

This version improves text clarity by:

- using a readable sans-serif stack for body text
- reserving decorative serif/display fonts for large headings only
- increasing muted-text contrast
- adding better line-height defaults
- adding reading measure tokens
- adding `.ark-readable` for case studies and long-form content
- improving dark-mode text contrast

## Use in Astro

```astro
---
import "@arkaes/tokens/css";
---
```

## Design token pipeline (color + spacing)

Color and spacing tokens are **generated** from [DTCG](https://tr.designtokens.org/)
JSON sources with [Style Dictionary](https://styledictionary.com/). They are the
single source of truth — do not hand-edit the generated CSS.

Sources live in `tokens/`, in three tiers:

- `tokens/primitive/` — raw values (color ramps, the spacing scale)
- `tokens/semantic/` — intent colors referencing primitives via `{color.neutral-700}`
- `tokens/component/` — component/legacy aliases referencing semantics

Each token uses the DTCG keys `$value`, `$type` (`color` or `dimension`), and
`$description`.

Generation runs automatically on `pnpm install` (via the root `postinstall`) and
as the first step of `pnpm build`, so the generated CSS is always present before
any app builds — including standalone app builds on Vercel that bypass
Turborepo. Run it manually with:

```sh
pnpm --filter @arkaes/tokens generate
```

Outputs (all git-ignored — regenerate rather than hand-edit):

| Output | Path | Consumer |
| --- | --- | --- |
| CSS custom properties | `src/styles/tokens.generated.css` | imported by `tokens.css` → `@arkaes/tokens/css` |
| Flat JSON | `src/generated/tokens.json` → `@arkaes/tokens/tokens.json` | machine-readable (path, value, type, description) |
| Typed TS | `src/generated/tokens.ts` → `@arkaes/tokens/generated` | programmatic token access |

`outputReferences` is enabled, so the tier structure survives into the CSS as
`var()` chains and all tiers land in a single `:root` block.

> Typography, radius, shadow, and motion tokens are still hand-authored in
> `src/styles/tokens.css` — a later migration will move them into this pipeline.

## Token-compliance check

CI runs `pnpm lint:tokens` (`scripts/token-lint.mjs`), which fails the build if
`@arkaes/ui` source hard-codes a raw hex color, or a px/rem value that matches a
`--ark-space-*` token used in a spacing property (`padding`/`margin`/`gap`/`inset`).
Layout dimensions and font sizes with no token equivalent are not flagged. The
spacing values it checks are read from the generated `tokens.json`, so adding a
step to the scale automatically extends what the linter enforces.

For a genuine one-off, add an escape-hatch comment on the offending line:

```ts
width: 3px; /* token-lint-disable-line: hairline divider, no 3px token */
```

Pre-existing occurrences are recorded in `scripts/token-lint-baseline.json` so the
check is green today but fails on any new raw value. After an intentional,
reviewed change to those values, refresh the baseline with
`node scripts/token-lint.mjs --update-baseline`.

## Recommended typography usage

```html
<h1 class="ark-heading-display">Architecture meets aesthetics.</h1>
<p class="ark-text-lead">
  Frontend engineering for polished, performance-minded interfaces.
</p>

<article class="ark-readable">
  <h2 class="ark-heading-section">Case study</h2>
  <p>
    Long-form content should use readable spacing, strong contrast, and a comfortable line length.
  </p>
</article>
```

## Typography rule

```txt
Display serif = brand expression
Sans-serif = reading clarity
```

Avoid using decorative serif typography for body text, labels, cards, and descriptions.
