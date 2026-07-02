import { css, html, LitElement, nothing } from "lit";
import type { PropertyValues } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";

export enum InputType {
  Text = "text",
  Password = "password",
  Email = "email",
  Url = "url",
  Number = "number",
  Tel = "tel",
  Search = "search",
}

export class ArkInput extends LitElement {
  static override properties = {
    // ── Core ────────────────────────────────────────────────────────
    type: { type: String, reflect: true },
    name: { type: String, reflect: true },
    value: { type: String },
    placeholder: { type: String },

    // ── UI meta ─────────────────────────────────────────────────────
    label: { type: String },
    hint: { type: String },
    error: { type: String },
    size: { type: String, reflect: true },

    // ── Boolean states ───────────────────────────────────────────────
    disabled: { type: Boolean, reflect: true },
    invalid: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    autofocus: { type: Boolean, reflect: true },

    // ── Text / pattern ───────────────────────────────────────────────
    autocomplete: { type: String },
    pattern: { type: String },
    inputmode: { type: String },
    minlength: { type: Number },
    maxlength: { type: Number },

    // ── Numeric range ────────────────────────────────────────────────
    min: { type: String },
    max: { type: String },
    step: { type: String },

    // ── Form association ─────────────────────────────────────────────
    form: { type: String },
  };

  static override styles = css`
    /* ── Host ───────────────────────────────────────────────────── */
    :host {
      display: block;
    }

    /* Default (md) size tokens */
    :host,
    :host([size="md"]) {
      --input-height: 2.5rem;
      --input-font: var(--ark-text-md);
      --label-size: 0.8125rem;
      --hint-size: 0.6875rem;
      --icon-size: 16px;
    }
    :host([size="sm"]) {
      --input-height: 2rem;
      --input-font: var(--ark-text-sm);
      --label-size: 0.75rem;
      --hint-size: 0.6875rem;
      --icon-size: 14px;
    }
    :host([size="lg"]) {
      --input-height: 3rem;
      --input-font: var(--ark-text-lg);
      --label-size: 0.875rem;
      --hint-size: 0.75rem;
      --icon-size: 18px;
    }

    /* Disabled */
    :host([disabled]) {
      opacity: 0.38;
      pointer-events: none;
    }

    /* ── Field wrapper ───────────────────────────────────────────── */
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--ark-space-1);
    }

    /* ── Label ───────────────────────────────────────────────────── */
    /* Plus Jakarta Sans — correct for UI prose labels (SKILL.md §3) */
    label.label {
      color: var(--ark-color-text);
      cursor: default;
      font-family: var(--ark-font-sans);
      font-size: var(--label-size);
      font-weight: var(--ark-weight-medium);
      line-height: var(--ark-leading-normal);
    }

    /* Required asterisk via CSS — no extra element */
    :host([required]) label.label::after {
      color: var(--ark-color-danger);
      content: " *";
    }

    /* ── Control (input row) ─────────────────────────────────────── */
    /* No static shadow at rest (SKILL.md §5) */
    .control {
      align-items: center;
      background: var(--ark-color-surface);
      border: 1.5px solid var(--ark-color-border);
      border-radius: var(--ark-radius-xs);
      display: flex;
      gap: var(--ark-space-2);
      height: var(--input-height);
      overflow: hidden;
      padding-inline: var(--ark-space-3);
      transition:
        border-color var(--ark-duration-fast) var(--ark-ease-standard),
        box-shadow var(--ark-duration-fast) var(--ark-ease-standard);
    }

    /* Hover */
    .control:hover {
      border-color: color-mix(in srgb, var(--ark-color-secondary) 55%, var(--ark-color-border));
    }

    /* Focus — box-shadow only on :focus-within (SKILL.md §5) */
    .control:focus-within {
      border-color: var(--ark-color-secondary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ark-color-secondary), transparent 75%);
      outline: none;
    }

    /* Invalid */
    :host([invalid]) .control {
      border-color: var(--ark-color-danger);
    }
    :host([invalid]) .control:hover {
      border-color: color-mix(in srgb, var(--ark-color-danger) 80%, var(--ark-color-border));
    }
    :host([invalid]) .control:focus-within {
      border-color: var(--ark-color-danger);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ark-color-danger), transparent 75%);
    }

    /* Readonly */
    :host([readonly]) .control {
      background: color-mix(in srgb, var(--ark-color-surface) 60%, transparent);
    }

    /* ── Native input ────────────────────────────────────────────── */
    input {
      background: transparent;
      border: none;
      color: var(--ark-color-text);
      cursor: var(--ark-cursor-text, text);
      flex: 1;
      font-family: var(--ark-font-sans);
      font-size: var(--input-font);
      font-weight: var(--ark-weight-regular);
      height: 100%;
      line-height: var(--ark-leading-normal);
      min-width: 0;
      outline: none;
      padding: 0;
      width: 100%;
    }
    input::placeholder {
      color: var(--ark-color-text-subtle);
    }
    /* Remove browser number spinners */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      appearance: none;
    }
    input[type="number"] {
      -moz-appearance: textfield;
    }

    /* ── Password toggle button ──────────────────────────────────── */
    .toggle-pw {
      align-items: center;
      background: transparent;
      border: none;
      color: var(--ark-color-text-muted);
      cursor: var(--ark-cursor-interactive, pointer);
      display: flex;
      flex-shrink: 0;
      height: var(--icon-size);
      justify-content: center;
      padding: 0;
      transition: color var(--ark-duration-fast) var(--ark-ease-standard);
      width: var(--icon-size);
    }
    .toggle-pw:hover {
      color: var(--ark-color-secondary);
    }
    .toggle-pw:focus-visible {
      border-radius: var(--ark-radius-xs);
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 2px;
    }

    /* ── Hint text ───────────────────────────────────────────────── */
    /* DM Mono, uppercase + letter-spaced — mandatory (SKILL.md §3) */
    .hint {
      color: var(--ark-color-text-subtle);
      font-family: var(--ark-font-mono);
      font-size: var(--hint-size);
      letter-spacing: var(--ark-tracking-label);
      line-height: var(--ark-leading-relaxed);
      text-transform: uppercase;
    }

    /* ── Error message ───────────────────────────────────────────── */
    /* DM Mono, uppercase + letter-spaced — mandatory (SKILL.md §3) */
    .error-msg {
      align-items: center;
      color: var(--ark-color-danger);
      display: flex;
      font-family: var(--ark-font-mono);
      font-size: var(--hint-size);
      gap: var(--ark-space-1);
      letter-spacing: var(--ark-tracking-label);
      line-height: var(--ark-leading-relaxed);
      text-transform: uppercase;
    }
    .error-icon {
      flex-shrink: 0;
      height: var(--icon-size);
      width: var(--icon-size);
    }
  `;

  // ── Core ──────────────────────────────────────────────────────────
  type: InputType | string = InputType.Text;
  name = "";
  value = "";
  placeholder = "";

  // ── UI meta ───────────────────────────────────────────────────────
  label = "";
  hint = "";
  error = "";
  size = "md";

  // ── Boolean states ────────────────────────────────────────────────
  disabled = false;
  invalid = false;
  required = false;
  readonly = false;
  override autofocus = false;

  // ── Text / pattern ────────────────────────────────────────────────
  autocomplete: string | undefined = undefined;
  pattern: string | undefined = undefined;
  inputmode: string | undefined = undefined;
  minlength: number | undefined = undefined;
  maxlength: number | undefined = undefined;

  // ── Numeric range ─────────────────────────────────────────────────
  min: string | undefined = undefined;
  max: string | undefined = undefined;
  step: string | undefined = undefined;

  // ── Form association ──────────────────────────────────────────────
  form: string | undefined = undefined;

  private _showPassword = false;
  private readonly _inputId = `ark-input-${Math.random().toString(36).substring(2, 9)}`;
  private readonly _errorId = `ark-input-err-${Math.random().toString(36).substring(2, 9)}`;
  private readonly _hintId = `ark-input-hint-${Math.random().toString(36).substring(2, 9)}`;

  // ── Public API ────────────────────────────────────────────────────

  /**
   * Programmatically focus the internal `<input>`.
   * Delegates to the native element so that the browser's focus ring
   * and `:focus-within` styling on the control wrapper both activate.
   */
  override focus(options?: FocusOptions) {
    this._nativeInput?.focus(options);
  }

  /**
   * Programmatically blur the internal `<input>`.
   */
  override blur() {
    this._nativeInput?.blur();
  }

  /**
   * Returns the `ValidityState` of the internal `<input>`, or an object
   * that reports `valid: true` when the shadow root is not yet available.
   */
  get validity(): ValidityState {
    return this._nativeInput?.validity ?? ({ valid: true } as ValidityState);
  }

  /**
   * Returns `true` if the internal `<input>` satisfies its constraints.
   * Triggers the browser's built-in validation UI on the native input.
   */
  checkValidity(): boolean {
    return this._nativeInput?.checkValidity() ?? true;
  }

  /**
   * Reports validity and, if invalid, shows the browser's built-in
   * validation tooltip on the native `<input>`.
   */
  reportValidity(): boolean {
    return this._nativeInput?.reportValidity() ?? true;
  }

  // ── Lifecycle ────────────────────────────────────────────────────

  protected override updated(changed: PropertyValues<this>) {
    // Keep the live .value property in sync when the property changes
    // programmatically after first render (Lit sets it via .value binding
    // already, but we re-sync to be safe for external mutations).
    if (changed.has("value") && this._nativeInput) {
      if (this._nativeInput.value !== this.value) {
        this._nativeInput.value = this.value;
      }
    }

    // Forward autofocus after first render — native autofocus only fires
    // during HTML parse; we replicate it for dynamically inserted elements.
    if (changed.has("autofocus") && this.autofocus) {
      this._nativeInput?.focus();
    }
  }

  // ── Private helpers ───────────────────────────────────────────────

  private get _nativeInput(): HTMLInputElement | null {
    return this.renderRoot?.querySelector("input") ?? null;
  }

  private _handleInput(e: Event) {
    e.stopPropagation();
    this.value = (e.target as HTMLInputElement).value;
    this.dispatchEvent(
      new CustomEvent<{ value: string }>("input", {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
  }

  private _handleChange(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<{ value: string }>("change", {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
  }

  private _togglePassword() {
    this._showPassword = !this._showPassword;
    this.requestUpdate();
  }

  private _renderEyeIcon() {
    return html`
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
        <circle cx="8" cy="8" r="2"/>
      </svg>
    `;
  }

  private _renderEyeOffIcon() {
    return html`
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
        <circle cx="8" cy="8" r="2"/>
        <line x1="2" y1="2" x2="14" y2="14"/>
      </svg>
    `;
  }

  private _renderPasswordToggle() {
    const toggleLabel = this._showPassword ? "Hide password" : "Show password";
    return html`
      <button
        type="button"
        class="toggle-pw"
        aria-label=${toggleLabel}
        @click=${this._togglePassword}
      >
        ${when(
          this._showPassword,
          () => this._renderEyeOffIcon(),
          () => this._renderEyeIcon(),
        )}
      </button>
    `;
  }

  override render() {
    const resolvedType =
      this.type === InputType.Password
        ? (this._showPassword ? "text" : "password")
        : this.type;

    let describedBy: string | typeof nothing = nothing;
    if (this.invalid && this.error) {
      describedBy = this._errorId;
    } else if (this.hint) {
      describedBy = this._hintId;
    }

    return html`
      <div class="field">
        ${when(
          this.label,
          () => html`<label class="label" for=${this._inputId}>${this.label}</label>`,
        )}

        <div class="control">
          <input
            id=${this._inputId}
            type=${resolvedType}
            name=${this.name}
            .value=${this.value}
            placeholder=${this.placeholder}
            ?disabled=${this.disabled}
            ?required=${this.required}
            ?readonly=${this.readonly}
            autocomplete=${ifDefined(this.autocomplete)}
            inputmode=${ifDefined(this.inputmode)}
            pattern=${ifDefined(this.pattern)}
            min=${ifDefined(this.min)}
            max=${ifDefined(this.max)}
            step=${ifDefined(this.step)}
            minlength=${ifDefined(this.minlength)}
            maxlength=${ifDefined(this.maxlength)}
            form=${ifDefined(this.form)}
            aria-invalid=${this.invalid ? "true" : "false"}
            aria-required=${this.required ? "true" : "false"}
            aria-describedby=${describedBy || nothing}
            @input=${this._handleInput}
            @change=${this._handleChange}
          />
          ${when(
            this.type === InputType.Password,
            () => this._renderPasswordToggle(),
          )}
        </div>

        ${when(
          this.hint && !this.invalid,
          () => html`<span class="hint" id=${this._hintId}>${this.hint}</span>`,
        )}

        ${when(
          this.invalid && !!this.error,
          () => html`
            <span class="error-msg" id=${this._errorId} role="alert" aria-live="polite">
              ${this.error}
            </span>
          `,
        )}
      </div>
    `;
  }
}

export const defineArkInput = () => {
  defineElement("ark-input", ArkInput);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-input": ArkInput;
  }
}
