import { css, html, LitElement, nothing, svg } from "lit";
import type { PropertyValues } from "lit";
import { when } from "lit/directives/when.js";

export class ArkCheckbox extends LitElement {
  static formAssociated = true;

  static override properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    checked: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
    hint: { type: String },
    size: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    :host([disabled]) {
      opacity: 0.38;
      pointer-events: none;
    }

    .root {
      align-items: flex-start;
      cursor: pointer;
      display: inline-flex;
      gap: var(--gap);
      outline: none;
      user-select: none;
    }

    .root:focus-visible .control {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ark-color-accent), transparent 75%);
    }

    /* ── Control shell ──────────────────────────────────────────── */
    .control {
      background: var(--ark-color-bg);
      border: 1.5px solid var(--ark-color-border);
      border-radius: var(--ark-radius-xs);
      flex-shrink: 0;
      height: var(--ctrl-size);
      margin-top: var(--ctrl-offset);
      overflow: hidden;
      position: relative;
      transition:
        border-color var(--ark-duration-fast) var(--ark-ease-standard),
        background var(--ark-duration-fast) var(--ark-ease-standard);
      width: var(--ctrl-size);
    }

    :host([checked]) .control,
    :host([indeterminate]) .control {
      background: color-mix(in srgb, var(--ark-color-accent) 12%, var(--ark-color-bg));
      border-color: var(--ark-color-accent);
    }

    .root:not(:focus-visible):hover .control {
      border-color: color-mix(in srgb, var(--ark-color-accent) 55%, var(--ark-color-border));
    }

    /* ── Fill layer (slides in from bottom on check) ────────────── */
    .fill {
      background: var(--ark-color-accent);
      inset: 0;
      position: absolute;
      transform: translateY(100%);
      transition: transform var(--ark-duration-normal) var(--ark-ease-emphasized);
    }

    :host([checked]) .fill {
      transform: translateY(0);
    }

    :host([indeterminate]) .fill {
      transform: translateY(50%);
    }

    /* ── SVG icon ───────────────────────────────────────────────── */
    .icon {
      align-items: center;
      display: flex;
      inset: 0;
      justify-content: center;
      position: absolute;
      z-index: 1;
    }

    .icon svg {
      overflow: visible;
    }

    .check-path {
      fill: none;
      stroke: var(--ark-color-accent-contrast);
      stroke-dasharray: 20;
      stroke-dashoffset: 20;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 2;
      transition: stroke-dashoffset var(--ark-duration-normal) var(--ark-ease-standard) 0.04s;
    }

    :host([checked]) .check-path {
      stroke-dashoffset: 0;
    }

    .dash-path {
      fill: none;
      stroke: var(--ark-color-accent-contrast);
      stroke-dasharray: 10;
      stroke-dashoffset: 10;
      stroke-linecap: round;
      stroke-width: 2;
      transition: stroke-dashoffset var(--ark-duration-fast) var(--ark-ease-standard) 0.04s;
    }

    :host([indeterminate]) .dash-path {
      stroke-dashoffset: 0;
    }

    /* ── Label area ─────────────────────────────────────────────── */
    .text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .label {
      color: var(--ark-color-text);
      font-family: var(--ark-font-sans);
      font-size: var(--label-size);
      font-weight: var(--ark-weight-regular);
      line-height: var(--ark-leading-normal);
    }

    .hint {
      color: var(--ark-color-text-subtle);
      font-family: var(--ark-font-mono);
      font-size: var(--hint-size);
      letter-spacing: var(--ark-tracking-label);
      line-height: var(--ark-leading-relaxed);
    }

    /* ── Sizes ──────────────────────────────────────────────────── */
    :host,
    :host([size="md"]) {
      --ctrl-size: 18px;
      --ctrl-offset: 2px;
      --gap: 10px;
      --label-size: 0.8125rem;
      --hint-size: 0.6875rem;
    }

    :host([size="sm"]) {
      --ctrl-size: 14px;
      --ctrl-offset: 2px;
      --gap: 8px;
      --label-size: 0.75rem;
      --hint-size: 0.625rem;
    }

    :host([size="lg"]) {
      --ctrl-size: 22px;
      --ctrl-offset: 1px;
      --gap: 12px;
      --label-size: 0.9375rem;
      --hint-size: 0.75rem;
    }
  `;

  name = "";
  value = "";
  checked = false;
  indeterminate = false;
  disabled = false;
  label = "";
  hint = "";
  size = "md";

  private readonly _internals = this.attachInternals();
  private readonly _labelId = `ark-checkbox-label-${Math.random().toString(36).substring(2, 9)}`;
  private readonly _hintId = `ark-checkbox-hint-${Math.random().toString(36).substring(2, 9)}`;
  private _defaultChecked = false;
  private _defaultIndeterminate = false;
  private _hasCapturedDefaults = false;

  override connectedCallback() {
    super.connectedCallback();

    if (!this._hasCapturedDefaults) {
      this._defaultChecked = this.checked;
      this._defaultIndeterminate = this.indeterminate;
      this._hasCapturedDefaults = true;
    }

    this._syncFormValue();
  }

  protected override updated(changedProperties: PropertyValues<this>) {
    if (
      changedProperties.has("checked")
      || changedProperties.has("disabled")
      || changedProperties.has("indeterminate")
      || changedProperties.has("value")
    ) {
      this._syncFormValue();
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
    this._syncFormValue();
  }

  formResetCallback() {
    this.checked = this._defaultChecked;
    this.indeterminate = this._defaultIndeterminate;
    this._syncFormValue();
  }

  formStateRestoreCallback(state: string | File | FormData | null) {
    const restoredState = String(state);
    this.checked = restoredState === "checked";
    this.indeterminate = restoredState === "indeterminate";
    this._syncFormValue();
  }

  private _syncFormValue() {
    const submittedValue = this.value || "on";
    const formValue = this.checked && !this.disabled ? submittedValue : null;
    const state = this.indeterminate ? "indeterminate" : this.checked ? "checked" : "unchecked";

    this._internals.setFormValue(formValue, state);
  }

  private _toggle() {
    if (this.disabled) return;
    if (this.indeterminate) {
      this.indeterminate = false;
      this.checked = true;
    } else {
      this.checked = !this.checked;
    }
    this._syncFormValue();
    this.dispatchEvent(
      new CustomEvent("input", {
        bubbles: true,
        composed: true,
        detail: { checked: this.checked, value: this.value },
      }),
    );
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { checked: this.checked, value: this.value },
      }),
    );
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (e.key === " ") {
      e.preventDefault();
      this._toggle();
    }
  }

  private _renderIcon() {
    if (this.indeterminate) {
      return svg`
        <svg width="10" height="10" viewBox="0 0 10 10">
          <line class="dash-path" x1="2" y1="5" x2="8" y2="5"/>
        </svg>
      `;
    }
    return svg`
      <svg width="10" height="10" viewBox="0 0 10 10">
        <polyline class="check-path" points="1.5,5 4,7.5 8.5,2.5"/>
      </svg>
    `;
  }

  override render() {
    const ariaChecked = this.indeterminate ? "mixed" : String(this.checked);
    const labelledBy = this.label ? this._labelId : nothing;
    const describedBy = this.label && this.hint ? this._hintId : nothing;

    return html`
      <div
        class="root"
        role="checkbox"
        aria-checked=${ariaChecked}
        aria-disabled=${this.disabled}
        aria-labelledby=${labelledBy}
        aria-describedby=${describedBy}
        tabindex=${when(this.disabled, () => "-1", () => "0")}
        @click=${this._toggle}
        @keydown=${this._handleKeyDown}
      >
        <div class="control">
          <div class="fill"></div>
          <div class="icon">${this._renderIcon()}</div>
        </div>
        ${when(
          this.label,
          () => html`
              <div class="text">
                <span class="label" id=${this._labelId}>${this.label}</span>
                ${when(
                  this.hint,
                  () => html`<span class="hint" id=${this._hintId}>${this.hint}</span>`,
                )}
              </div>
            `,
        )}
      </div>
    `;
  }
}
