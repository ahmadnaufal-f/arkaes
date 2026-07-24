Labeled text input. The label, hint, and error live on attributes — there are
no slots. Show the error message by setting `invalid` together with `error`.

```html
<ark-input
  label="Email"
  name="email"
  type="email"
  placeholder="you@studio.com"
  hint="We'll never share it"
  required
></ark-input>

<!-- Invalid state -->
<ark-input
  label="Email"
  name="email"
  type="email"
  invalid
  error="Enter a valid email address"
></ark-input>
```

Read the value from the `input` (per keystroke) or `change` (on commit) event:

```js
const input = document.querySelector("ark-input");
input.addEventListener("change", (e) => console.log(e.detail.value));
```

`type="password"` adds a built-in show/hide toggle. The element mirrors the
native constraint-validation API: `input.checkValidity()`, `input.reportValidity()`,
and `input.validity`.
