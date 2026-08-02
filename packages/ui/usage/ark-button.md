Action control spanning a five-step emphasis scale: `primary` (the one loud
action per view), `secondary` (supporting), `outline` (alternate paths),
`ghost` (quiet utility), and `link` (inline serif navigation). The label goes
in the default slot. Renders a `<button>` unless `href` is set, in which case
it renders an `<a>`.

```html
<ark-button variant="primary">Get in touch</ark-button>
<ark-button variant="secondary">Browse all projects</ark-button>
<ark-button variant="outline">See the archive</ark-button>
<ark-button variant="ghost" size="sm">Cancel</ark-button>
<ark-button variant="link" href="/">Back to home page</ark-button>

<!-- Directional glyphs go in the prefix/suffix slots -->
<ark-button variant="primary" href="/case-studies">
  View all case studies
  <span slot="suffix" aria-hidden="true">&rarr;</span>
</ark-button>

<!-- Destructive actions: tone composes with any variant -->
<ark-button variant="outline" tone="danger">Discard changes</ark-button>

<!-- Full-width submit inside a form -->
<ark-button variant="primary" type="submit" full-width>Submit</ark-button>

<!-- Loading -->
<ark-button variant="primary" loading>Saving…</ark-button>
```

Sizes `sm` / `md` / `lg` scale the box for the four button-shaped variants and
only the font size for `link`.

For async work, assign a promise to the `loadingPromise` JS property and the
button shows a spinner until it settles:

```js
button.loadingPromise = fetch("/api/save", { method: "POST" });
```
