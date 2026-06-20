# GitHub workflows (manual install)

These two workflow files could not be committed to `.github/workflows/` automatically
because the session's credentials lack the GitHub `workflow` OAuth scope. Move them into
place yourself:

```sh
mkdir -p .github/workflows
git mv docs/github-workflows/ci.yml .github/workflows/ci.yml
git mv docs/github-workflows/release.yml .github/workflows/release.yml
git commit -m "ci: add CI and release workflows"
git push
```

(You can delete this README afterwards.)

- **ci.yml** — runs build / type check / lint on every PR and push to `main`.
- **release.yml** — Changesets pipeline: opens a "version packages" PR, and on merge
  publishes `@arkaes/tokens` and `@arkaes/ui` to npm. Requires an `NPM_TOKEN` repo secret
  (see `RELEASING.md`).
