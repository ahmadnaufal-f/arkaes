Toasts are driven imperatively. Mount one `ark-toaster` region (usually once,
near the end of `<body>`), then call the `toast()` helper. You rarely render
`ark-toast` yourself — the toaster spawns them.

```html
<!-- Mount the region once -->
<ark-toaster position="bottom-center"></ark-toaster>
```

```js
import { toast } from "@arkaes/ui/components/toast-store";

toast("Saved", { variant: "success" });
toast("Something went wrong", { variant: "error", heading: "Error" });

// Update an existing toast in place (e.g. loading -> success)
const id = toast("Uploading…", { variant: "loading", duration: 0 });
await upload();
toast("Uploaded", { id, variant: "success" });
```

Options: `variant` (default | success | error | warning | info | loading),
`heading`, `duration` (ms; `0` = sticky), `position`, `id`. Positions:
`top-left | top-center | top-right | bottom-left | bottom-center | bottom-right`
— a toast lands in the `ark-toaster` whose `position` matches.
