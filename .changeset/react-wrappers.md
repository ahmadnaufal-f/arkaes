---
"@arkaes/ui": minor
---

Add React bindings for every element under the `@arkaes/ui/react` entrypoint, built with
`@lit/react`. Reactive properties become typed props and custom events are exposed as `on*`
props; each wrapper self-registers its element and ships a `"use client"` directive for RSC.
React is an optional peer dependency, so non-React consumers are unaffected.
