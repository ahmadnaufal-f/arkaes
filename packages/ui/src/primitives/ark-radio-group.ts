import { css, html, LitElement } from "lit";
import type { PropertyValues } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";
import type { ArkRadio } from "./ark-radio";

const RADIO_SELECTOR = "ark-radio";

export class ArkRadioGroup extends LitElement {
  static override properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
    hint: { type: String },
    orientation: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    :host([disabled]) {
      opacity: 0.75;
    }

    .root {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .label {
      color: var(--ark-color-text);
      font-family: var(--ark-font-sans);
      font-size: 0.8125rem;
      font-weight: var(--ark-weight-medium);
      line-height: var(--ark-leading-normal);
    }

    .hint {
      color: var(--ark-color-text-subtle);
      font-family: var(--ark-font-mono);
      font-size: 0.6875rem;
      letter-spacing: var(--ark-tracking-label);
      line-height: var(--ark-leading-relaxed);
    }

    .items {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    :host([orientation="horizontal"]) .items {
      align-items: center;
      flex-direction: row;
      flex-wrap: wrap;
    }
  `;

  name = "";
  value = "";
  disabled = false;
  label = "";
  hint = "";
  orientation = "vertical";

  private readonly _labelId = `ark-radio-group-label-${Math.random().toString(36).substring(2, 9)}`;
  private readonly _hintId = `ark-radio-group-hint-${Math.random().toString(36).substring(2, 9)}`;
  private _defaultValue = "";
  private _hasCapturedDefault = false;

  override connectedCallback() {
    super.connectedCallback();

    if (!this._hasCapturedDefault) {
      this._defaultValue = this.value;
      this._hasCapturedDefault = true;
    }

    this.addEventListener("ark-radio-select", this._handleRadioSelect as EventListener);
    this.addEventListener("keydown", this._handleKeyDown);
  }

  override disconnectedCallback() {
    this.removeEventListener("ark-radio-select", this._handleRadioSelect as EventListener);
    this.removeEventListener("keydown", this._handleKeyDown);
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: PropertyValues<this>) {
    if (
      changedProperties.has("name")
      || changedProperties.has("value")
      || changedProperties.has("disabled")
    ) {
      this._syncRadios();
    }
  }

  formResetCallback() {
    this.value = this._defaultValue;
    this._syncRadios();
  }

  private _getRadios() {
    return Array.from(this.querySelectorAll<ArkRadio>(RADIO_SELECTOR));
  }

  private _getEnabledRadios() {
    return this._getRadios().filter((radio) => !radio.disabled && !radio.groupDisabled);
  }

  private _syncRadios() {
    const radios = this._getRadios();
    const enabledRadios = radios.filter((radio) => !radio.disabled && !this.disabled);
    const checkedRadio = radios.find((radio) => radio.value === this.value);
    const tabbableRadio = checkedRadio && !checkedRadio.disabled && !this.disabled
      ? checkedRadio
      : enabledRadios[0];

    radios.forEach((radio) => {
      radio.name = this.name;
      radio.groupDisabled = this.disabled;
      radio.tabbable = radio === tabbableRadio;
      radio.setCheckedFromGroup(Boolean(this.value) && radio.value === this.value);
    });
  }

  private _selectRadio(radio: ArkRadio, shouldFocus = false) {
    if (radio.disabled || radio.groupDisabled) return;

    const previousValue = this.value;
    this.value = radio.value;
    this._syncRadios();

    if (shouldFocus) {
      radio.focus();
    }

    if (previousValue === this.value) return;

    radio.notifySelectionChange();
    this.dispatchEvent(
      new CustomEvent("input", {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
  }

  private _handleRadioSelect = (event: CustomEvent<{ value: string; radio: ArkRadio }>) => {
    event.preventDefault();
    this._selectRadio(event.detail.radio);
  };

  private _handleSlotChange() {
    this._syncRadios();
  }

  private _getActiveElement() {
    const root = this.getRootNode();
    return root instanceof ShadowRoot ? root.activeElement : document.activeElement;
  }

  private _handleKeyDown = (event: KeyboardEvent) => {
    const handledKeys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];

    if (!handledKeys.includes(event.key)) return;

    const enabledRadios = this._getEnabledRadios();
    if (!enabledRadios.length) return;

    event.preventDefault();

    const activeElement = this._getActiveElement();
    const activeIndex = enabledRadios.findIndex((radio) => {
      return radio === activeElement || Boolean(activeElement && radio.shadowRoot?.contains(activeElement));
    });
    const checkedIndex = enabledRadios.findIndex((radio) => radio.checked);
    const currentIndex = activeIndex >= 0 ? activeIndex : checkedIndex >= 0 ? checkedIndex : 0;

    let nextIndex = currentIndex;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % enabledRadios.length;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + enabledRadios.length) % enabledRadios.length;
    }

    if (event.key === "Home") {
      nextIndex = 0;
    }

    if (event.key === "End") {
      nextIndex = enabledRadios.length - 1;
    }

    this._selectRadio(enabledRadios[nextIndex], true);
  };

  override render() {
    const labelledBy = this.label ? this._labelId : undefined;
    const describedBy = this.label && this.hint ? this._hintId : undefined;

    return html`
      <div class="root">
        ${when(
          this.label,
          () => html`<span class="label" id=${this._labelId}>${this.label}</span>`,
        )}
        ${when(
          this.hint,
          () => html`<span class="hint" id=${this._hintId}>${this.hint}</span>`,
        )}
        <div
          class="items"
          role="radiogroup"
          aria-disabled=${this.disabled}
          aria-labelledby=${ifDefined(labelledBy)}
          aria-describedby=${ifDefined(describedBy)}
          aria-orientation=${this.orientation}
        >
          <slot @slotchange=${this._handleSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

export const defineArkRadioGroup = () => {
  defineElement("ark-radio-group", ArkRadioGroup);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-radio-group": ArkRadioGroup;
  }
}
