# @arkaes/ui

## 1.0.0

### Major Changes

- 40138ee: First release of the packages

### Minor Changes

- 5408bed: Add React bindings for every element under the `@arkaes/ui/react` entrypoint, built with
  `@lit/react`. Reactive properties become typed props and custom events are exposed as `on*`
  props; each wrapper self-registers its element and ships a `"use client"` directive for RSC.
  React is an optional peer dependency, so non-React consumers are unaffected.

### Patch Changes

- Updated dependencies [40138ee]
  - @arkaes/tokens@1.0.0
