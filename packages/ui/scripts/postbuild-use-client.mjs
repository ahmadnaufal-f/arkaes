// Prepend the React Server Components "use client" directive to every built
// react wrapper. We inject it post-build (rather than in src) so ESLint, which
// only scans src, never sees a bare directive expression, and so the directive
// is guaranteed to survive bundling.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../dist/react/", import.meta.url));

let files = [];
try {
  files = await readdir(dir);
} catch {
  console.warn("[postbuild-use-client] dist/react not found; nothing to do.");
  process.exit(0);
}

for (const name of files) {
  if (!name.endsWith(".js")) continue;
  const path = `${dir}${name}`;
  const code = await readFile(path, "utf8");
  if (code.startsWith('"use client"') || code.startsWith("'use client'")) continue;
  await writeFile(path, `"use client";\n${code}`);
}
