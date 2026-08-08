---
"@arkaes/tokens": patch
---

Add `tier` and `reference` to the generated flat token JSON
(`@arkaes/tokens/tokens.json`).

All three DTCG tier files nest under the same top-level `"color"` key, so Style
Dictionary collapses them into one `color.*` namespace and the artifact had no
way to say which tier a token was authored in. `tier` recovers that from the
source directory (`primitive` / `semantic` / `component`), derived generically so
a new `tokens/<tier>/` directory needs no script change.

`value` is fully dereferenced, which discards the alias chain. `reference` keeps
the value as authored whenever it still contains an `{alias}` — so `color.surface`
now carries `value: "#fafaf9"` alongside `reference: "{color.neutral-0}"`, and
`color.border` keeps its whole `color-mix(in srgb, {color.neutral-700}, ...)`
expression.

Both fields are additive; `reference` is omitted for literal tokens. The typed
`@arkaes/tokens/generated` map is unchanged.
