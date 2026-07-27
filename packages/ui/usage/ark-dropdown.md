Single-select combobox. Options are supplied as `ark-dropdown-option` children
in the default slot — each carries a `value` attribute and its text content is
the visible label. The dropdown renders its own trigger and listbox; the slotted
options are just a data source.

```html
<ark-dropdown name="role" label="Role" placeholder="Select a role">
  <ark-dropdown-option value="frontend">Frontend Engineer</ark-dropdown-option>
  <ark-dropdown-option value="design">Product Designer</ark-dropdown-option>
  <ark-dropdown-option value="pm">Product Manager</ark-dropdown-option>
</ark-dropdown>
```

```js
dropdown.addEventListener("change", (e) => {
  console.log(e.detail.value, e.detail.name);
});
```

Set an initial selection with the `value` attribute on `ark-dropdown`. Tune the
menu width with `listbox-width` ("fit-trigger", "fit-content", "min-content",
"max-content") and cap its height with `max-visible`.
