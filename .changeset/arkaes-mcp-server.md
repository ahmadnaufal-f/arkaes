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
- Data is read at startup from the generated Custom Elements Manifest and the
  `@arkaes/tokens` source of truth — nothing about the component API is
  hand-authored. A `custom-elements-manifest.config.mjs` plugin recovers tag
  names from the `defineElement` guard and expands enum- and CSS-selector-derived
  attribute values into concrete option lists.
- Component sources gained JSDoc `@slot`/`@fires`/`@cssprop`/`@summary`
  annotations, and canonical usage snippets live in `usage/*.md`.
