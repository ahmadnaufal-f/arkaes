import { css, html, LitElement } from "lit";
import { when } from "lit/directives/when.js";

export class ArkToggle extends LitElement {
  static override properties = {
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
    hint: { type: String },
    size: { type: String, reflect: true },
    labelPosition: { type: String, attribute: "label-position", reflect: true },
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
      align-items: center;
      cursor: pointer;
      display: inline-flex;
      gap: var(--gap);
      outline: none;
      user-select: none;
    }

    :host([label-position="left"]) .root {
      flex-direction: row-reverse;
    }

    .root:focus-visible .track {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ark-color-accent), transparent 75%);
    }

    /* ── Track ──────────────────────────────────────────────────── */
    .track {
      background: var(--ark-color-border);
      border-radius: var(--ark-radius-full);
      flex-shrink: 0;
      height: var(--track-h);
      position: relative;
      transition:
        background var(--ark-duration-fast) var(--ark-ease-standard),
        box-shadow var(--ark-duration-fast) var(--ark-ease-standard);
      width: var(--track-w);
    }

    :host([checked]) .track {
      background: var(--ark-color-accent);
    }

    .root:not(:focus-visible):hover .track {
      background: color-mix(in srgb, var(--ark-color-accent), var(--ark-color-border) 45%);
    }

    :host([checked]) .root:not(:focus-visible):hover .track {
      background: color-mix(in srgb, var(--ark-color-accent) 80%, var(--ark-color-bg));
    }

    /* ── Thumb ──────────────────────────────────────────────────── */
    .thumb {
      background: var(--ark-color-bg);
      border-radius: 50%;
      height: var(--thumb-size);
      left: var(--thumb-inset);
      position: absolute;
      top: var(--thumb-inset);
      transition:
        transform var(--ark-duration-fast) var(--ark-ease-standard),
        background var(--ark-duration-fast) var(--ark-ease-standard);
      width: var(--thumb-size);
      will-change: transform;
    }

    :host(:not([checked])) .thumb {
      background: color-mix(in srgb, var(--ark-color-bg) 80%, transparent);
    }

    :host([checked]) .thumb {
      transform: translateX(var(--thumb-travel));
    }

    /* ── Indicator dot ──────────────────────────────────────────── */
    .thumb::after {
      background: var(--ark-color-border);
      border-radius: 50%;
      content: "";
      display: block;
      height: var(--dot-size);
      left: 50%;
      opacity: 0;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%) scale(0);
      transition:
        opacity var(--ark-duration-fast) var(--ark-ease-standard),
        transform var(--ark-duration-fast) var(--ark-ease-standard);
      width: var(--dot-size);
    }

    :host([checked]) .thumb::after {
      background: var(--ark-color-accent);
      opacity: 0.35;
      transform: translate(-50%, -50%) scale(1);
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
    :host([size="sm"]) {
      --track-w: 28px;
      --track-h: 16px;
      --thumb-size: 11px;
      --thumb-inset: 2.5px;
      --thumb-travel: 12px;
      --dot-size: 4px;
      --gap: 8px;
      --label-size: 0.75rem;
      --hint-size: 0.625rem;
    }

    :host,
    :host([size="md"]) {
      --track-w: 40px;
      --track-h: 22px;
      --thumb-size: 15px;
      --thumb-inset: 3.5px;
      --thumb-travel: 18px;
      --dot-size: 5px;
      --gap: 10px;
      --label-size: 0.8125rem;
      --hint-size: 0.6875rem;
    }

    :host([size="lg"]) {
      --track-w: 52px;
      --track-h: 28px;
      --thumb-size: 20px;
      --thumb-inset: 4px;
      --thumb-travel: 24px;
      --dot-size: 7px;
      --gap: 12px;
      --label-size: 0.9375rem;
      --hint-size: 0.75rem;
    }
  `;

  name = "";
  value = "on";
  checked = false;
  disabled = false;
  label = "";
  hint = "";
  size = "md";
  labelPosition = "right";

  private _toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { checked: this.checked, value: this.value },
      }),
    );
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this._toggle();
    }
  }

  override render() {
    return html`
      <div
        class="root"
        role="switch"
        aria-checked=${this.checked}
        aria-disabled=${this.disabled}
        aria-label=${this.label}
        tabindex=${when(this.disabled, () => "-1", () => "0")}
        @click=${this._toggle}
        @keydown=${this._handleKeyDown}
      >
        <div class="track">
          <div class="thumb"></div>
        </div>
        ${when(
          this.label,
          () => html`
            <div class="text">
              <span class="label">${this.label}</span>
              ${when(this.hint, () => html`<span class="hint">${this.hint}</span>`)}
            </div>
          `,
        )}
      </div>
    `;
  }
}
