On/off switch with an inline label (attribute, not a slot). `label-position`
places the label `before` or `after` the switch.

```html
<ark-toggle name="notifications" label="Email notifications" checked></ark-toggle>
<ark-toggle label="Dark mode" label-position="before"></ark-toggle>
```

```js
toggle.addEventListener("change", (e) => console.log(e.detail.checked));
```
