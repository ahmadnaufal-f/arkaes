Action control. The label goes in the default slot. Renders a `<button>` unless
`href` is set, in which case it renders an `<a>`.

```html
<ark-button variant="primary">Get in touch</ark-button>
<ark-button variant="secondary" size="sm">Cancel</ark-button>
<ark-button variant="ghost">Read more</ark-button>

<!-- As a link -->
<ark-button variant="primary" href="/contact">Contact</ark-button>

<!-- Full-width submit inside a form -->
<ark-button variant="primary" type="submit" full-width>Submit</ark-button>

<!-- Loading -->
<ark-button variant="primary" loading>Saving…</ark-button>
```

For async work, assign a promise to the `loadingPromise` JS property and the
button shows a spinner until it settles:

```js
button.loadingPromise = fetch("/api/save", { method: "POST" });
```
