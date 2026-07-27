Checkbox with an inline label. The label is an attribute, not a slot.

```html
<ark-checkbox name="terms" value="accepted" label="I agree to the terms"></ark-checkbox>
<ark-checkbox label="Subscribe" hint="Occasional updates only" checked></ark-checkbox>
<ark-checkbox label="Select all" indeterminate></ark-checkbox>
```

```js
checkbox.addEventListener("change", (e) => {
  console.log(e.detail.checked, e.detail.value);
});
```
