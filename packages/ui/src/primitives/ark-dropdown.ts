import { css, html, LitElement, nothing } from "lit";
import type { PropertyValues } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";

const OPTION_SELECTOR = "ark-dropdown-option";

interface DropdownOption {
  value: string;
  label: string;
}

/**
 * How the listbox popover is sized horizontally.
 * - `fit-trigger` (default): exactly the trigger width.
 * - `fit-content` / `max-content`: sized to the options, but never narrower
 *   than the trigger.
 * - `min-content`: fully content-driven (can be narrower than the trigger).
 */
export enum DropdownListboxWidth {
  FitTrigger = "fit-trigger",
  FitContent = "fit-content",
  MinContent = "min-content",
  MaxContent = "max-content",
}

/**
 * ArkDropdownOption is a lightweight, non-rendered data source for ArkDropdown.
 * It carries a `value` attribute and exposes its text content as the label. The
 * parent dropdown reads these from its default slot and renders the interactive
 * listbox itself, so the option element stays visually hidden.
 */
export class ArkDropdownOption extends LitElement {
  static override properties = {
    value: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: none;
    }
  `;

  value = "";

  get label(): string {
    return (this.textContent ?? "").trim();
  }
}

/**
 * ArkDropdown is an accessible single-select combobox. Options are provided as
 * slotted `ark-dropdown-option` children (a hidden data source); the trigger
 * and listbox are rendered in this element's shadow DOM. Selecting an option
 * dispatches a composed, bubbling `change` event with `{ value, name }`.
 */
export class ArkDropdown extends LitElement {
  static override properties = {
    value: { type: String, reflect: true },
    placeholder: { type: String },
    label: { type: String },
    name: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    maxVisible: { type: Number, attribute: "max-visible", reflect: true },
    listboxWidth: { type: String, attribute: "listbox-width", reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-block;
      font-family: var(--ark-font-sans);
      max-width: 100%;
      position: relative;
      /* Row height that drives both the option height and the listbox
         max-height (max-visible-options * this). Overridable per instance. */
      --ark-dropdown-option-height: 2.5rem;
    }

    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }

    .trigger {
      align-items: center;
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-sm);
      box-sizing: border-box;
      color: var(--ark-color-text);
      cursor: var(--ark-cursor-interactive, pointer);
      display: flex;
      font: inherit;
      font-size: var(--ark-text-sm);
      gap: var(--ark-space-3);
      justify-content: space-between;
      min-width: min(12rem, 100%);
      padding: var(--ark-space-2) var(--ark-space-3);
      transition: border-color var(--ark-duration-fast) var(--ark-ease-standard);
      width: 100%;
    }

    .trigger:hover {
      border-color: color-mix(in srgb, var(--ark-color-accent) 55%, var(--ark-color-border));
    }

    .trigger:focus-visible {
      border-color: var(--ark-color-accent);
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ark-color-accent), transparent 75%);
    }

    :host([open]) .trigger {
      border-color: var(--ark-color-accent);
    }

    .trigger-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chevron {
      color: var(--ark-color-text-subtle);
      flex: none;
      height: 1.15rem;
      width: 1.15rem;
      transition: transform var(--ark-duration-fast) var(--ark-ease-standard);
    }

    :host([open]) .chevron {
      transform: rotate(180deg);
    }

    /* Positioned wrapper that owns the border, radius and shadow. The
       overflow:hidden here is what clips the inner scrollbar to the rounded
       corners — a scroll container's own border-radius does NOT clip its
       scrollbar on Chromium/Android (the bug seen in Brave on Android), so
       the clipping has to happen on a non-scrolling ancestor. */
    .popover {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-md);
      box-shadow: var(--ark-shadow-lg);
      box-sizing: border-box;
      left: 0;
      /* Default width strategy: match the trigger ("fit-trigger"). The guard
         keeps content-sized variants from spilling past the viewport. */
      max-width: max(100%, calc(100vw - 2 * var(--ark-space-4)));
      overflow: hidden;
      position: absolute;
      top: calc(100% + var(--ark-space-1));
      width: 100%;
      z-index: 50;
    }

    /* Width strategies (see the listbox-width attribute). fit-content and
       max-content are floored at the trigger width so the popover is never
       narrower than its trigger; min-content is left fully content-driven. */
    :host([listbox-width="fit-content"]) .popover {
      min-width: 100%;
      width: fit-content;
    }

    :host([listbox-width="max-content"]) .popover {
      min-width: 100%;
      width: max-content;
    }

    :host([listbox-width="min-content"]) .popover {
      width: min-content;
    }

    .listbox {
      list-style: none;
      margin: 0;
      /* Show at most --ark-dropdown-max-visible rows; scroll past that. The
         two extra space-1 units account for the listbox's own padding. */
      max-height: calc(
        var(--ark-dropdown-max-visible, 6) * var(--ark-dropdown-option-height) +
          2 * var(--ark-space-1)
      );
      /* hidden on the x-axis avoids a horizontal scrollbar; the wrapper clips
         the vertical one to the rounded corners. */
      overflow: hidden auto;
      padding: var(--ark-space-1);

      /* Elegant, unobtrusive scrollbar for the overflow case. */
      scrollbar-color: var(--ark-color-border-strong) transparent;
      scrollbar-width: thin;

      &::-webkit-scrollbar {
        width: 0.6rem;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background-color: var(--ark-color-border-strong);
        border: 0.18rem solid var(--ark-color-surface);
        border-radius: var(--ark-radius-full);
      }

      &::-webkit-scrollbar-thumb:hover {
        background-color: var(--ark-color-accent);
      }
    }

    .option {
      border-radius: var(--ark-radius-xs);
      color: var(--ark-color-text);
      cursor: var(--ark-cursor-interactive, pointer);
      font-size: var(--ark-text-sm);
      /* line-height sets the row height so option count maps to a known
         max-height; overflow + ellipsis keeps long labels inside the
         trigger's width instead of widening the popover. */
      line-height: var(--ark-dropdown-option-height);
      overflow: hidden;
      padding: 0 var(--ark-space-3);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .option.active {
      background: var(--ark-color-accent-soft);
    }

    .option[aria-selected="true"] {
      color: var(--ark-color-accent-strong);
      font-weight: var(--ark-weight-medium);
    }
  `;

  value = "";
  placeholder = "Select";
  label = "";
  name = "";
  open = false;
  disabled = false;
  /** Maximum number of options shown before the listbox scrolls. */
  maxVisible = 6;
  /** How the listbox popover is sized horizontally. */
  listboxWidth: DropdownListboxWidth | string = DropdownListboxWidth.FitTrigger;

  private readonly _listboxId = `ark-dropdown-listbox-${Math.random().toString(36).substring(2, 9)}`;
  private _options: DropdownOption[] = [];
  private _activeIndex = -1;

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener("pointerdown", this._handleDocumentPointerDown, true);
  }

  override disconnectedCallback() {
    document.removeEventListener("pointerdown", this._handleDocumentPointerDown, true);
    super.disconnectedCallback();
  }

  private get _optionId() {
    return (index: number) => `${this._listboxId}-option-${index}`;
  }

  private get _selectedLabel(): string {
    return this._options.find((opt) => opt.value === this.value)?.label ?? "";
  }

  private _readOptions = () => {
    const slot = this.renderRoot.querySelector("slot");
    const assigned = slot
      ? (slot.assignedElements() as ArkDropdownOption[])
      : (Array.from(this.querySelectorAll(OPTION_SELECTOR)) as ArkDropdownOption[]);
    this._options = assigned.map((opt) => ({ value: opt.value, label: opt.label }));
    this.requestUpdate();
  };

  protected override firstUpdated() {
    this._readOptions();
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has("open") && this.open) {
      const selectedIndex = this._options.findIndex((opt) => opt.value === this.value);
      this._activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
      this.requestUpdate();
    }
  }

  private _toggle() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  private _close(focusTrigger = false) {
    if (!this.open) return;
    this.open = false;
    if (focusTrigger) {
      this.renderRoot.querySelector<HTMLButtonElement>(".trigger")?.focus();
    }
  }

  private _select(value: string) {
    const changed = value !== this.value;
    this.value = value;
    this._close(true);
    if (changed) {
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          composed: true,
          detail: { value: this.value, name: this.name },
        }),
      );
    }
  }

  private _setActive(index: number) {
    const count = this._options.length;
    if (count === 0) return;
    this._activeIndex = Math.max(0, Math.min(count - 1, index));
    this.requestUpdate();
  }

  private _handleDocumentPointerDown = (event: PointerEvent) => {
    if (!this.open) return;
    if (!event.composedPath().includes(this)) {
      this._close();
    }
  };

  private _handleKeyDown = (event: KeyboardEvent) => {
    if (this.disabled) return;

    if (!this.open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        this.open = true;
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this._setActive(this._activeIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        this._setActive(this._activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        this._setActive(0);
        break;
      case "End":
        event.preventDefault();
        this._setActive(this._options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (this._options[this._activeIndex]) {
          this._select(this._options[this._activeIndex]!.value);
        }
        break;
      case "Escape":
        event.preventDefault();
        this._close(true);
        break;
      case "Tab":
        this._close();
        break;
      default:
        break;
    }
  };

  override render() {
    const activeId = this.open && this._activeIndex >= 0
      ? this._optionId(this._activeIndex)
      : undefined;
    const triggerLabel = this._selectedLabel || this.placeholder;

    return html`
      <div class="root" @keydown=${this._handleKeyDown}>
        <button
          class="trigger"
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded=${this.open ? "true" : "false"}
          aria-controls=${this._listboxId}
          aria-activedescendant=${ifDefined(activeId)}
          aria-label=${ifDefined(this.label || undefined)}
          ?disabled=${this.disabled}
          @click=${this._toggle}
        >
          <span class="trigger-label">${triggerLabel}</span>
          <svg
            class="chevron"
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        ${when(
          this.open,
          () => html`
            <div
              class="popover"
              style=${styleMap({
                "--ark-dropdown-max-visible": String(Math.max(1, this.maxVisible)),
              })}
            >
              <ul
                class="listbox"
                id=${this._listboxId}
                role="listbox"
                aria-label=${ifDefined(this.label || undefined)}
              >
                ${this._options.map((opt, index) => html`
                  <li
                    id=${this._optionId(index)}
                    class=${classMap({ option: true, active: index === this._activeIndex })}
                    role="option"
                    aria-selected=${opt.value === this.value ? "true" : "false"}
                    @click=${() => this._select(opt.value)}
                    @mousemove=${() => this._setActive(index)}
                  >
                    ${opt.label}
                  </li>
                `)}
              </ul>
            </div>
          `,
        )}

        <slot @slotchange=${this._readOptions} hidden>${nothing}</slot>
      </div>
    `;
  }
}

export const defineArkDropdown = () => {
  defineElement("ark-dropdown-option", ArkDropdownOption);
  defineElement("ark-dropdown", ArkDropdown);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-dropdown": ArkDropdown;
    "ark-dropdown-option": ArkDropdownOption;
  }
}
