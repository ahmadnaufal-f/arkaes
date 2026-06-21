# Implementation Plan: React component wrappers for `@arkaes/ui`

> Audience: an implementing engineer/model. Follow this top to bottom. Code blocks are
> copy‑paste ready. Do **not** redesign the approach — just implement it.

## 0. Goal

Ship React bindings for every Arkaes custom element as a **subpath of the existing package**:
`@arkaes/ui/react`. Consumers will write:

```tsx
import { ArkButton, ArkDialogRoot } from "@arkaes/ui/react";
import "@arkaes/tokens/css";

<ArkButton variant="primary" onClick={...}>Save</ArkButton>
```

We use [`@lit/react`](https://www.npmjs.com/package/@lit/react) `createComponent`, which turns a
Lit element into a real React component: reactive properties become typed props, and custom
events are mapped to `on*` props. React stays **opt-in** (optional peer dependency) — vanilla
consumers who never import `@arkaes/ui/react` never pull React into their bundle.

**Do NOT create a separate package.** Everything lives in `packages/ui`.

---

## 1. Dependencies

Run from the repo root:

```sh
pnpm --filter @arkaes/ui add @lit/react
pnpm --filter @arkaes/ui add -D react react-dom @types/react @types/react-dom
```

Then hand‑edit `packages/ui/package.json` to add React as an **optional peer** (so it is not
force‑installed for non‑React consumers). Add these top‑level keys:

```jsonc
"peerDependencies": {
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0"
},
"peerDependenciesMeta": {
  "react": { "optional": true },
  "react-dom": { "optional": true }
},
```

`@lit/react` stays in `dependencies` (it is small and always used by the wrappers).
`react`/`react-dom` must **not** be in `dependencies` — only in `peerDependencies` +
`devDependencies` (the dev copies are just for building/typechecking).

---

## 2. Package exports

`packages/ui/package.json` has two export maps: the top‑level `exports` (points at `src`, used
for local dev) and `publishConfig.exports` (points at `dist`, used on npm). Add a `./react` and
`./react/*` entry to **both**, mirroring the existing `./components` pattern.

In the top‑level `exports`, add:

```jsonc
"./react": {
  "types": "./src/react/index.ts",
  "default": "./src/react/index.ts"
},
"./react/*": {
  "types": "./src/react/*.ts",
  "default": "./src/react/*.ts"
},
```

In `publishConfig.exports`, add:

```jsonc
"./react": {
  "types": "./dist/react/index.d.ts",
  "default": "./dist/react/index.js"
},
"./react/*": {
  "types": "./dist/react/*.d.ts",
  "default": "./dist/react/*.js"
},
```

No change to `files` (already `["dist", "README.md"]`) or `sideEffects` is required.

---

## 3. Build (tsdown)

The tsdown entry is already `src/**/*.ts`, so new `src/react/*.ts` files are picked up
automatically with the same 1:1 unbundled output. `react`, `react-dom`, `@lit/react`, and
`@arkaes/*` are all externalized automatically (they are deps/peerDeps), so nothing extra is
needed in `tsdown.config.ts`.

### `"use client"` (React Server Components)

The wrappers use refs/effects, so each emitted react module should carry a `"use client"`
banner for RSC consumers (Next.js app router, etc.).

1. Put `"use client";` as the **literal first line** of every `src/react/*.ts` file (templates
   below already include it).
2. After implementing, run `pnpm --filter @arkaes/ui build` and check whether the directive
   survives in `packages/ui/dist/react/*.js`.
3. **If it does not survive**, add this post‑build script and wire it into the build:

   `packages/ui/scripts/postbuild-use-client.mjs`:
   ```js
   import { readFile, writeFile, readdir } from "node:fs/promises";
   import { join } from "node:path";

   const dir = new URL("../dist/react/", import.meta.url);
   for (const name of await readdir(dir)) {
     if (!name.endsWith(".js")) continue;
     const path = join(dir.pathname, name);
     const code = await readFile(path, "utf8");
     if (!code.startsWith('"use client"')) {
       await writeFile(path, `"use client";\n${code}`);
     }
   }
   ```

   Then set the build script in `packages/ui/package.json`:
   ```jsonc
   "build": "tsdown && node ./scripts/postbuild-use-client.mjs",
   ```

---

## 4. Directory layout

Create `packages/ui/src/react/` with **one file per source family** (mirrors the existing
`primitives`/`components`/`patterns` files), plus a barrel:

```
src/react/
  index.ts                 # barrel: re-exports all wrappers + enums/types
  ark-badge.ts
  ark-brand-logo.ts
  ark-button.ts
  ark-checkbox.ts
  ark-chip.ts
  ark-dropdown.ts          # ArkDropdown + ArkDropdownOption
  ark-empty.ts
  ark-input.ts
  ark-radio.ts
  ark-radio-group.ts
  ark-spinner.ts
  ark-toggle.ts
  ark-accordion.ts         # ArkAccordion + ArkAccordionItem
  ark-card.ts              # ArkCard + 6 card subparts
  ark-cursor.ts
  ark-dialog.ts            # ArkDialogRoot + 7 dialog subparts
  ark-hero.ts
  ark-navigation.ts        # ArkNavigation* (7 elements)
  ark-toast.ts             # ArkToast + ArkToaster
  ark-case-study-card.ts
  ark-page-header.ts
  ark-project-header.ts
```

Each `src/react/<family>.ts` becomes importable as `@arkaes/ui/react/<family>` automatically
via the `./react/*` export.

---

## 5. Authoring convention

For **every** element:

1. Import the element **class** and its family `defineArk*` helper and any enums from the
   side‑effect‑free root barrel `@arkaes/ui`. Alias the class with an `Element` suffix so the
   React component can keep the clean `Ark*` name.
2. Call the family `defineArk*()` once at module top level so the element is registered before
   React renders it (the helper is idempotent — guarded by `customElements.get`).
3. Export a `createComponent({...})` per element, named the same as the element class
   (e.g. `ArkButton`). Re‑export any enums/types the React component’s props need.

### Template A — simple element (no custom events)

`src/react/ark-button.ts`:
```ts
"use client";
import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkButton as ArkButtonElement, ButtonVariant, defineArkButton } from "@arkaes/ui";

defineArkButton();

export const ArkButton = createComponent({
  react: React,
  tagName: "ark-button",
  elementClass: ArkButtonElement,
});

export { ButtonVariant };
```

### Template B — element with custom events

Map each DOM event name to an `on*` prop via the `events` option. `createComponent` types the
handler as `(e: Event) => void`; for events with a typed `detail`, cast inside the handler (or
augment via the element’s `CustomEvent` typing if present).

`src/react/ark-input.ts`:
```ts
"use client";
import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkInput as ArkInputElement, InputType, defineArkInput } from "@arkaes/ui";

defineArkInput();

export const ArkInput = createComponent({
  react: React,
  tagName: "ark-input",
  elementClass: ArkInputElement,
  events: {
    onInput: "input",
    onChange: "change",
  },
});

export { InputType };
```

### Template C — family with multiple elements (one `defineArk*` registers all)

`src/react/ark-dialog.ts` (all 8 dialog elements share `defineArkDialog`):
```ts
"use client";
import * as React from "react";
import { createComponent } from "@lit/react";
import {
  ArkDialogRoot as ArkDialogRootElement,
  ArkDialogTrigger as ArkDialogTriggerElement,
  ArkDialogPortal as ArkDialogPortalElement,
  ArkDialogOverlay as ArkDialogOverlayElement,
  ArkDialogContent as ArkDialogContentElement,
  ArkDialogTitle as ArkDialogTitleElement,
  ArkDialogDescription as ArkDialogDescriptionElement,
  ArkDialogClose as ArkDialogCloseElement,
  defineArkDialog,
} from "@arkaes/ui";

defineArkDialog();

export const ArkDialogRoot = createComponent({
  react: React,
  tagName: "ark-dialog-root",
  elementClass: ArkDialogRootElement,
  events: { onOpen: "ark-dialog:open", onClose: "ark-dialog:close" },
});
export const ArkDialogTrigger = createComponent({
  react: React, tagName: "ark-dialog-trigger", elementClass: ArkDialogTriggerElement,
});
export const ArkDialogPortal = createComponent({
  react: React, tagName: "ark-dialog-portal", elementClass: ArkDialogPortalElement,
});
export const ArkDialogOverlay = createComponent({
  react: React, tagName: "ark-dialog-overlay", elementClass: ArkDialogOverlayElement,
});
export const ArkDialogContent = createComponent({
  react: React, tagName: "ark-dialog-content", elementClass: ArkDialogContentElement,
});
export const ArkDialogTitle = createComponent({
  react: React, tagName: "ark-dialog-title", elementClass: ArkDialogTitleElement,
});
export const ArkDialogDescription = createComponent({
  react: React, tagName: "ark-dialog-description", elementClass: ArkDialogDescriptionElement,
});
export const ArkDialogClose = createComponent({
  react: React, tagName: "ark-dialog-close", elementClass: ArkDialogCloseElement,
});
```

---

## 6. Complete element inventory

Every element below must get a wrapper. **Class names are exact.** Tag names are exact. The
`defineArk*` helper is the family registration call to put at the top of the file.

### `ark-badge.ts`
| Element class | Tag | defineArk* | Events |
|---|---|---|---|
| `ArkBadge` | `ark-badge` | `defineArkBadge` | — |
Re-export enum/type: `BadgeVariant`, type `BadgeSize`, `BadgeVariantValue`.

### `ark-brand-logo.ts`
| `ArkBrandLogo` | `ark-brand-logo` | `defineArkBrandLogo` | — |

### `ark-button.ts`
| `ArkButton` | `ark-button` | `defineArkButton` | — |
Re-export enum: `ButtonVariant`.

### `ark-checkbox.ts`
| `ArkCheckbox` | `ark-checkbox` | `defineArkCheckbox` | `onInput`→`input`, `onChange`→`change` |

### `ark-chip.ts`
| `ArkChip` | `ark-chip` | `defineArkChip` | — |
Re-export enum/type: `ChipVariant`, type `ChipSize`, `ChipVariantValue`.

### `ark-dropdown.ts`
| `ArkDropdown` | `ark-dropdown` | `defineArkDropdown` | `onChange`→`change` |
| `ArkDropdownOption` | `ark-dropdown-option` | `defineArkDropdown` | — |
Re-export enum: `DropdownListboxWidth`.

### `ark-empty.ts`
| `ArkEmpty` | `ark-empty` | `defineArkEmpty` | — |

### `ark-input.ts`
| `ArkInput` | `ark-input` | `defineArkInput` | `onInput`→`input`, `onChange`→`change` |
Re-export enum: `InputType`. (Events carry `detail: { value: string }`.)

### `ark-radio.ts`
| `ArkRadio` | `ark-radio` | `defineArkRadio` | `onInput`→`input`, `onChange`→`change`, `onSelect`→`ark-radio-select` |

### `ark-radio-group.ts`
| `ArkRadioGroup` | `ark-radio-group` | `defineArkRadioGroup` | `onInput`→`input`, `onChange`→`change` |

### `ark-spinner.ts`
| `ArkSpinner` | `ark-spinner` | `defineArkSpinner` | — |
Re-export enum: `SpinnerVariant`.

### `ark-toggle.ts`
| `ArkToggle` | `ark-toggle` | `defineArkToggle` | `onInput`→`input`, `onChange`→`change` |

### `ark-accordion.ts`
| `ArkAccordion` | `ark-accordion` | `defineArkAccordion` | — |
| `ArkAccordionItem` | `ark-accordion-item` | `defineArkAccordion` | `onToggle`→`ark-accordion:toggle` |

### `ark-card.ts` (all share `defineArkCard`)
| `ArkCard` | `ark-card` | `defineArkCard` | — |
| `ArkCardHeader` | `ark-card-header` | `defineArkCard` | — |
| `ArkCardTitle` | `ark-card-title` | `defineArkCard` | — |
| `ArkCardDescription` | `ark-card-description` | `defineArkCard` | — |
| `ArkCardAction` | `ark-card-action` | `defineArkCard` | — |
| `ArkCardContent` | `ark-card-content` | `defineArkCard` | — |
| `ArkCardFooter` | `ark-card-footer` | `defineArkCard` | — |

### `ark-cursor.ts`
| `ArkCursor` | `ark-cursor` | `defineArkCursor` | — |

### `ark-dialog.ts` (all share `defineArkDialog`) — see Template C
| `ArkDialogRoot` | `ark-dialog-root` | `defineArkDialog` | `onOpen`→`ark-dialog:open`, `onClose`→`ark-dialog:close` |
| `ArkDialogTrigger` | `ark-dialog-trigger` | `defineArkDialog` | — |
| `ArkDialogPortal` | `ark-dialog-portal` | `defineArkDialog` | — |
| `ArkDialogOverlay` | `ark-dialog-overlay` | `defineArkDialog` | — |
| `ArkDialogContent` | `ark-dialog-content` | `defineArkDialog` | — |
| `ArkDialogTitle` | `ark-dialog-title` | `defineArkDialog` | — |
| `ArkDialogDescription` | `ark-dialog-description` | `defineArkDialog` | — |
| `ArkDialogClose` | `ark-dialog-close` | `defineArkDialog` | — |

> The dialog `ark-dialog:open` / `ark-dialog:close` events are dispatched by the trigger/overlay/
> content/close parts and bubble up to `ark-dialog-root`. Expose them on `ArkDialogRoot` as above.
> **Verify** in `src/components/ark-dialog.ts` that those `CustomEvent`s are created with
> `bubbles: true`; if any are not, also add the matching `on*` prop to the part that dispatches it.

### `ark-hero.ts`
| `ArkHero` | `ark-hero` | `defineArkHero` | — |

### `ark-navigation.ts` (all share `defineArkNavigation`)
| `ArkNavigationRoot` | `ark-navigation-root` | `defineArkNavigation` | — |
| `ArkNavigationBrand` | `ark-navigation-brand` | `defineArkNavigation` | — |
| `ArkNavigationLinks` | `ark-navigation-links` | `defineArkNavigation` | — |
| `ArkNavLink` | `ark-nav-link` | `defineArkNavigation` | — |
| `ArkNavigationCta` | `ark-navigation-cta` | `defineArkNavigation` | — |
| `ArkNavigationMobileToggle` | `ark-navigation-mobile-toggle` | `defineArkNavigation` | `onMenuToggle`→`ark-nav:menu-toggle` |
| `ArkNavigationMobileMenu` | `ark-navigation-mobile-menu` | `defineArkNavigation` | — |

### `ark-toast.ts` (share `defineArkToast`)
| `ArkToast` | `ark-toast` | `defineArkToast` | `onDismiss`→`ark-toast:dismiss` |
| `ArkToaster` | `ark-toaster` | `defineArkToast` | — |

### `ark-case-study-card.ts`
| `ArkCaseStudyCard` | `ark-case-study-card` | `defineArkCaseStudyCard` | — |

### `ark-page-header.ts`
| `ArkPageHeader` | `ark-page-header` | `defineArkPageHeader` | — |

### `ark-project-header.ts`
| `ArkProjectHeader` | `ark-project-header` | `defineArkProjectHeader` | — |

> If any class/enum import fails to resolve from `@arkaes/ui`, import it instead from the
> specific layer module (e.g. `@arkaes/ui/primitives/ark-button`,
> `@arkaes/ui/components/ark-dialog`, `@arkaes/ui/patterns/ark-page-header`). The root barrel
> re-exports all of them, so the root import should work.

---

## 7. Barrel — `src/react/index.ts`

```ts
"use client";
export * from "./ark-badge";
export * from "./ark-brand-logo";
export * from "./ark-button";
export * from "./ark-checkbox";
export * from "./ark-chip";
export * from "./ark-dropdown";
export * from "./ark-empty";
export * from "./ark-input";
export * from "./ark-radio";
export * from "./ark-radio-group";
export * from "./ark-spinner";
export * from "./ark-toggle";
export * from "./ark-accordion";
export * from "./ark-card";
export * from "./ark-cursor";
export * from "./ark-dialog";
export * from "./ark-hero";
export * from "./ark-navigation";
export * from "./ark-toast";
export * from "./ark-case-study-card";
export * from "./ark-page-header";
export * from "./ark-project-header";
```

---

## 8. README

Add a `## React` section to `packages/ui/README.md` (after “Register elements”). It must say:

- Import components from `@arkaes/ui/react`; you do **not** need the `@arkaes/ui/register/*`
  imports — the React wrappers register their elements themselves.
- You still must import the token CSS once: `import "@arkaes/tokens/css";`.
- React 18+ is required (peer dependency).
- Custom events are exposed as `on*` props; include the event prop table for the form elements
  and dialog (from §6).

Example to include:
```tsx
import { ArkButton, ArkInput } from "@arkaes/ui/react";
import "@arkaes/tokens/css";

export function Demo() {
  return (
    <form>
      <ArkInput onChange={(e) => console.log((e.target as HTMLInputElement).value)} />
      <ArkButton variant="primary">Submit</ArkButton>
    </form>
  );
}
```

---

## 9. Changeset

Add `.changeset/react-wrappers.md`:

```md
---
"@arkaes/ui": minor
---

Add React bindings for every element under the `@arkaes/ui/react` entrypoint, built with
`@lit/react`. React is an optional peer dependency, so non-React consumers are unaffected.
```

---

## 10. Verification (must all pass)

```sh
# from repo root
pnpm --filter @arkaes/ui build      # tsdown emits dist/react/*.js + *.d.ts
pnpm check                          # tsc typechecks the new files
rm -rf apps/storybook/storybook-static && pnpm lint   # eslint, max-warnings=0
```

Then confirm the published shape:

```sh
cd packages/ui && pnpm pack --pack-destination /tmp
tar -tzf /tmp/arkaes-ui-*.tgz | grep dist/react | head      # wrappers present
tar -xzOf /tmp/arkaes-ui-*.tgz package/package.json | grep -A2 '"./react"'  # export present
```

Also verify `"use client";` is present at the top of `packages/ui/dist/react/ark-button.js`
(if not, wire in the §3 post-build script).

### Acceptance criteria
- [ ] One React wrapper exported for **all 43 elements** listed in §6, names matching the
      element classes exactly.
- [ ] Every custom event in §6 is exposed as the specified `on*` prop.
- [ ] `react`/`react-dom` are **optional peerDependencies**, not `dependencies`.
- [ ] `@arkaes/ui/react` (and `@arkaes/ui/react/ark-dialog` etc.) resolve in both the `src`
      exports and the `publishConfig` (dist) exports.
- [ ] `pnpm --filter @arkaes/ui build`, `pnpm check`, and `pnpm lint` are green.
- [ ] `dist/react/*.js` carry the `"use client"` directive.
- [ ] A changeset is added.

---

## 11. Out of scope
- No Storybook stories for the React wrappers.
- No separate `@arkaes/react` package.
- No changes to the underlying elements’ behavior, props, or events.
