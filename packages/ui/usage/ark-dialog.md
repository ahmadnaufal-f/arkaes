A dialog is composed from subpart elements under `ark-dialog-root`, which owns
the open state. Wrap the trigger control in `ark-dialog-trigger`; put the dialog
surface in `ark-dialog-content` (optionally inside `ark-dialog-portal` to escape
parent stacking contexts). `ark-dialog-overlay` is the scrim; `ark-dialog-close`
dismisses.

```html
<ark-dialog-root>
  <ark-dialog-trigger>
    <ark-button variant="primary">Open dialog</ark-button>
  </ark-dialog-trigger>

  <ark-dialog-portal>
    <ark-dialog-overlay></ark-dialog-overlay>
    <ark-dialog-content>
      <ark-dialog-close absolute></ark-dialog-close>
      <ark-dialog-title>Delete project</ark-dialog-title>
      <ark-dialog-description>
        This action cannot be undone.
      </ark-dialog-description>

      <div style="display: flex; gap: var(--ark-space-3); justify-content: flex-end; margin-top: var(--ark-space-6);">
        <ark-button variant="ghost" size="sm">Cancel</ark-button>
        <ark-button variant="primary" size="sm">Confirm</ark-button>
      </div>
    </ark-dialog-content>
  </ark-dialog-portal>
</ark-dialog-root>
```

Drop `ark-dialog-portal` to render the content inline under its real parent.
Control it programmatically via the root's `open` property, or listen for
`ark-dialog:open` / `ark-dialog:close` on `ark-dialog-root`.
