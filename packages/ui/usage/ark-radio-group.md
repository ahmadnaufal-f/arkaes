A radio group wraps `ark-radio` options in its default slot and owns the shared
`name`, selection, and keyboard navigation. Set each option's label via the
`label` attribute. Read the selection from the group's `change` event — not from
individual radios.

```html
<ark-radio-group name="plan" label="Choose a plan" value="pro">
  <ark-radio value="free" label="Free"></ark-radio>
  <ark-radio value="pro" label="Pro" hint="Most popular"></ark-radio>
  <ark-radio value="team" label="Team"></ark-radio>
</ark-radio-group>
```

```js
const group = document.querySelector("ark-radio-group");
group.addEventListener("change", (e) => console.log(e.detail.value));
```

Use `orientation="horizontal"` to lay the options out in a row.
