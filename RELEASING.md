# Releasing

The publishable packages are `@arkaes/tokens` and `@arkaes/ui`. Releases are managed with
[Changesets](https://github.com/changesets/changesets). The apps (`portfolio`, `brand-guideline`,
`storybook`) are private and never published.

## One-time setup

1. Own the **`@arkaes`** scope on [npmjs.com](https://www.npmjs.com) (create the org — free for
   public packages).
2. Create an npm **automation access token** with publish rights.
3. Add it to the GitHub repository as a secret named **`NPM_TOKEN`**
   (Settings → Secrets and variables → Actions).

## Day-to-day flow

1. Make changes on a branch. For anything that should ship, add a changeset:

   ```sh
   pnpm changeset
   ```

   Pick the affected packages and the bump type (patch / minor / major), and write a one-line
   summary. This creates a markdown file under `.changeset/` — commit it with your work.

2. Open a PR to `main`. CI runs build, type check, and lint.

3. On merge to `main`, the **Release** workflow opens (or updates) a `chore: version packages`
   PR that consumes the changesets and bumps versions + changelogs.

4. Merge that PR. The workflow then builds and runs `changeset publish`, pushing the updated
   packages to npm (with provenance).

## First publish

The very first release has no prior versions on npm. Either:

- **Automatic:** once `NPM_TOKEN` is set, the first push to `main` with no pending changesets
  publishes the current `0.1.0` of both packages, **or**
- **Manual** (to verify locally first):

  ```sh
  npm login
  pnpm release        # builds @arkaes/tokens + @arkaes/ui, then changeset publish
  ```

  Publish order is handled automatically (`@arkaes/tokens` before `@arkaes/ui`).

## Inspect what will publish

```sh
pnpm changeset status        # pending bumps
cd packages/ui && pnpm pack --dry-run   # exact file list in the tarball
```
