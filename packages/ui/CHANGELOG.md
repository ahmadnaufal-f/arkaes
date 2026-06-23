# @arkaes/ui

## 1.0.2

### Patch Changes

- 8a1c647: Add `loadingPromise` property to `ark-button`

  Alongside the existing manual `loading` boolean, buttons now accept a `loadingPromise` property. While the promise is pending the button automatically enters loading state (spinner, `aria-busy`, native `disabled` for `<button>` / `aria-disabled` for `<a>`); it recovers automatically when the promise settles (resolve or reject). The `until` Lit directive drives the render path. Both properties can coexist: `loadingPromise` controls promise-driven loading while `loading` still handles manual control independently.

## 1.0.1

### Patch Changes

- 83168f9: Add Vitest unit tests for React wrapper components (`ArkDialogPortal`, `ArkNavigationRoot`), covering portal teleportation, StrictMode remount, scroll-lock behaviour, and event-map callbacks.

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
