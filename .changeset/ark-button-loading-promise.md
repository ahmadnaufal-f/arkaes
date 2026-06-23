---
"@arkaes/ui": minor
---

Add `loadingPromise` property to `ark-button`

Alongside the existing manual `loading` boolean, buttons now accept a `loadingPromise` property. While the promise is pending the button automatically enters loading state (spinner, `aria-busy`, native `disabled` for `<button>` / `aria-disabled` for `<a>`); it recovers automatically when the promise settles (resolve or reject). The `until` Lit directive drives the render path. Both properties can coexist: `loadingPromise` controls promise-driven loading while `loading` still handles manual control independently.
