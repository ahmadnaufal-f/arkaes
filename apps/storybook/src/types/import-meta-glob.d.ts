// `import.meta.glob` is a Vite build-time feature. Storybook builds this app
// with `@storybook/web-components-vite`, but Vite is only a transitive
// dependency here, so `vite/client` types are not resolvable — this declares
// the one member we use rather than adding a dependency for a type.
//
// If `vite` ever becomes a direct dependency and `vite/client` is referenced,
// delete this file: two declarations of `glob` on the merged interface with
// different signatures is a compile error.
interface ImportMeta {
  /**
   * Eagerless glob: maps each matched path to a lazy importer. Only the keys
   * are used here, to count files without pulling the modules into the bundle.
   */
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}
