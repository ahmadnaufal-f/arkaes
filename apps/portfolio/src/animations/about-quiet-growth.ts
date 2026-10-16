// Keep the supplied animation in small source files for repository uploads.
// Vite bundles them into one lazy-loaded module without changing the artwork.
const parts = import.meta.glob<string>("./about-quiet-growth/part-*.txt", {
  query: "?raw",
  import: "default",
  eager: true,
});

export default JSON.parse(
  Object.entries(parts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, content]) => content)
    .join(""),
);
