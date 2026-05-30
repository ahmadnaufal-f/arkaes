import { css, html, LitElement } from "lit";
import { when } from "lit/directives/when.js";

export class ArkRadio extends LitElement {
  static override properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    checked: { type: Boolean, reflect: true },
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

    .control {
      background: var(--ark-color-bg);
      border: 1.5px solid var(--ark-color-border);
      border-radius: 50%;
      flex-shrink: 0;
      height: var(--ctrl-size);
      margin-top: var(--ctrl-offset);
      position: relative;
      transition:
        border-color var(--ark-duration-normal) var(--ark-ease-standard),
        background var(--ark-duration-normal) var(--ark-ease-standard),
        box-shadow var(--ark-duration-normal) var(--ark-ease-standard);
      width: var(--ctrl-size);
    }

    :host([checked]) .control {
      background: color-mix(in srgb, var(--ark-color-accent) 8%, var(--ark-color-bg));
      border-color: var(--ark-color-accent);
    }

    .root:not([aria-checked="true"]):hover .control {
      border-color: color-mix(in srgb, var(--ark-color-accent) 55%, var(--ark-color-border));
    }

    .dot {
      align-items: center;
      bottom: 0;
      display: flex;
      justify-content: center;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    }

    .dot::after {
      background: var(--ark-color-accent);
      border-radius: 50%;
      content: "";
      display: block;
      height: var(--dot-size);
      opacity: 0;
      transform: scale(0);
      transition:
        transform var(--ark-duration-normal) var(--ark-ease-emphasized),
        opacity var(--ark-duration-fast) var(--ark-ease-standard);
      width: var(--dot-size);
    }

    :host([checked]) .dot::after {
      opacity: 1;
      transform: scale(1);
    }

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
      transition: color var(--ark-duration-fast) var(--ark-ease-standard);
    }

    .hint {
      color: var(--ark-color-text-subtle);
      font-family: var(--ark-font-mono);
      font-size: var(--hint-size);
      letter-spacing: var(--ark-tracking-label);
      line-height: var(--ark-leading-relaxed);
    }

    :host,
    :host([size="md"]) {
      --ctrl-size: 18px;
      --dot-size: 7px;
      --ctrl-offset: 2px;
      --gap: 10px;
      --label-size: 0.8125rem;
      --hint-size: 0.6875rem;
    }

    :host([size="sm"]) {
      --ctrl-size: 14px;
      --dot-size: 5px;
      --ctrl-offset: 2px;
      --gap: 8px;
      --label-size: 0.75rem;
      --hint-size: 0.625rem;
    }

    :host([size="lg"]) {
      --ctrl-size: 22px;
      --dot-size: 9px;
      --ctrl-offset: 1px;
      --gap: 12px;
      --label-size: 0.9375rem;
      --hint-size: 0.75rem;
    }
  `;

  name = "";
  value = "";
  checked = false;
  disabled = false;
  label = "";
  hint = "";
  size = "md";

  private _handleClick() {
    if (this.disabled || this.checked) return;
    this.checked = true;
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
    if (this.name) {
      const root = this.getRootNode() as Document | ShadowRoot;
      root
        .querySelectorAll<ArkRadio>(`ark-radio[name="${this.name}"]`)
        .forEach((el) => {
          if (el !== this) el.checked = false;
        });
    }
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this._handleClick();
    }
  }

  override render() {
    return html`
      <div
        class="root"
        role="radio"
        aria-checked=${this.checked}
        aria-disabled=${this.disabled}
        aria-label=${this.label}
        tabindex=${when(this.disabled, () => "-1", () => "0")}
        @click=${this._handleClick}
        @keydown=${this._handleKeyDown}
      >
        <div class="control">
          <div class="dot"></div>
        </div>
        ${when(
          this.label,
          () => html`
              <div class="text">
                <span class="label">${this.label}</span>
                ${when(
                  this.hint,
                  () => html`<span class="hint">${this.hint}</span>`,
                )}
              </div>
            `,
        )}
      </div>
    `;
  }
}
