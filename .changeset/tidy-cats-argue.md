---
"@arkaes/ui": patch
---

Exclude test files from the package build. `tsdown`'s entry glob previously swept in `__tests__/*.test.ts` and `react/__tests__/setup.ts`, which import dev-only deps (`@testing-library/react`, vitest internals). Rolldown reported these as "Module not found, treating it as an external dependency" and emitted test files into `dist/`. The entry now excludes `*.test.ts` and `__tests__/**`.
