---
"@arkaes/tokens": patch
---

Release a new version so consuming builds resolve a freshly published package. No token values, exports, or source files change in this release.

The package's CSS and TypeScript token artifacts (`src/styles/tokens.generated.css` and `src/generated/`) are produced by Style Dictionary during install rather than committed, so a deploy that reuses a previously resolved copy of this package can start from stale or missing generated output. Cutting a version alongside `@arkaes/ui` keeps the two in step and avoids that.
