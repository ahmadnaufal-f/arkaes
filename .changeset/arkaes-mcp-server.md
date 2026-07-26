---
"@arkaes/ui": minor
---

Add a local, offline MCP server so coding agents can query the design system's
component API and design tokens with no network dependency. It ships inside
`@arkaes/ui` as the `arkaes-mcp` bin (stdio transport) and is invokable via
`npx --package @arkaes/ui arkaes-mcp`.

- Three tools: `list_components` (compact index of every element with variants
  and slots), `get_component_api` (full props/events/slots/CSS-props/CSS-parts
  plus an authored usage snippet, multiple components per call), and
  `get_tokens` (filter `--ark-*` tokens by category or name prefix; returns the
  category list when unfiltered).
- Tokens are sourced from the DTCG pipeline: color and spacing come from the
  generated flat JSON (`@arkaes/tokens/tokens.json`) with their `type` and
  `description`, while typography, radius, shadow, motion, and layout come from
  the hand-authored token CSS. A shared value map resolves cross-tier references
  (e.g. a shadow's `var(--ark-color-neutral-900)`) to concrete values.
- Component/manifest data is read at startup from the generated Custom Elements
  Manifest — nothing about the component API is hand-authored. A
  `custom-elements-manifest.config.mjs` plugin recovers tag
  names from the `defineElement` guard and expands enum- and CSS-selector-derived
  attribute values into concrete option lists.
- Component sources gained JSDoc `@slot`/`@fires`/`@cssprop`/`@summary`
  annotations, and canonical usage snippets live in `usage/*.md`.
