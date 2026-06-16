// Astro's import.meta.glob types
interface ImportMeta {
  /**
   * Glob import with eager loading
   * @example
   * const modules = import.meta.glob('./dir/*.js', { eager: true })
   */
  glob<T = any>(
    glob: string | string[],
    options?: { eager?: boolean; import?: string; query?: string | Record<string, string | number | boolean> }
  ): Record<string, T>;

  /**
   * Glob import with dynamic imports
   * @example
   * const modules = import.meta.glob('./dir/*.js')
   */
  glob<T = any>(
    glob: string | string[],
    options?: { eager?: false; import?: string; query?: string | Record<string, string | number | boolean> }
  ): Record<string, () => Promise<T>>;

  /**
   * Glob import for multiple patterns
   * @example
   * const modules = import.meta.glob(['./dir/*.js', './dir/*.ts'])
   */
  glob<T = any>(
    glob: string[],
    options?: { eager?: boolean; import?: string; query?: string | Record<string, string | number | boolean> }
  ): Record<string, T>;
}
