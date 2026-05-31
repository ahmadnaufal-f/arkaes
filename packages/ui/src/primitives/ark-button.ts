import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

export enum ButtonVariant {
  Primary = "primary",
  Secondary = "secondary",
  Ghost = "ghost",
}

export class ArkButton extends LitElement {
  static override properties = {
    disabled: { reflect: true, type: Boolean },
    fullWidth: { attribute: "full-width", reflect: true, type: Boolean },
    href: { type: String },
    rel: { type: String },
    size: { reflect: true, type: String },
    target: { type: String },
    type: { type: String },
    variant: { reflect: true, type: String },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    :host([full-width]) {
      width: 100%;
    }

    a,
    button {
      align-items: center;
      border: 0;
      cursor: pointer;
      display: inline-flex;
      font-family: var(--ark-font-mono);
      justify-content: center;
      min-height: 3rem;
      position: relative;
      text-decoration: none;
      border-radius: var(--ark-radius-xs);
      transition:
        background var(--ark-duration-normal) var(--ark-ease-out),
        border-color var(--ark-duration-normal) var(--ark-ease-out),
        color var(--ark-duration-normal) var(--ark-ease-out);
    }

    a:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 4px;
    }

    .primary {
      background: var(--ark-color-text);
      color: var(--ark-color-background);
      font-size: var(--ark-font-size-sm);
      letter-spacing: var(--ark-letter-spacing-mono);
      overflow: hidden;
      padding: 1rem 2.25rem;
      text-transform: uppercase;
    }

    .primary::after {
      background: var(--ark-color-accent);
      bottom: 0;
      content: "";
      height: 2px;
      left: 0;
      position: absolute;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 350ms var(--ark-ease-out);
      width: 100%;
    }

    :host([full-width]) a,
    :host([full-width]) button {
      width: 100%;
    }

    .primary:not(:disabled):not([aria-disabled="true"]):hover {
      background: #2d2724;
    }

    .primary:not(:disabled):not([aria-disabled="true"]):hover::after {
      transform: scaleX(1);
    }

    .secondary {
      background: var(--ark-color-accent-soft);
      border: 1px solid var(--ark-color-border);
      color: var(--ark-color-accent-strong);
      font-size: var(--ark-font-size-sm);
      letter-spacing: var(--ark-letter-spacing-mono);
      padding: 0.75rem 1.35rem;
      text-transform: uppercase;
    }

    .secondary:not(:disabled):not([aria-disabled="true"]):hover {
      border-color: var(--ark-color-accent);
    }

    .ghost {
      background: transparent;
      border-bottom: 1px solid var(--ark-color-border);
      color: var(--ark-color-text-muted);
      font-family: var(--ark-font-serif);
      font-size: var(--ark-font-size-md);
      font-style: italic;
      min-height: auto;
      padding: 0 0 0.2rem;
    }

    .ghost:not(:disabled):not([aria-disabled="true"]):hover {
      border-color: var(--ark-color-accent);
      color: var(--ark-color-accent-strong);
    }

    a[aria-disabled="true"],
    button:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    :host([size="sm"]) a,
    :host([size="sm"]) button {
      min-height: 2.25rem;
      padding: 0.65rem 1rem;
    }

    :host([size="lg"]) a,
    :host([size="lg"]) button {
      min-height: 3.25rem;
      padding: 1rem 2.5rem;
    }

    @media (max-width: 520px) {
      .primary {
        width: 100%;
      }
    }
  `;

  href = "";
  disabled = false;
  fullWidth = false;
  rel = "";
  size = "md";
  target = "";
  type: "button" | "submit" | "reset" = "button";
  variant: ButtonVariant | string = ButtonVariant.Primary;

  private get _buttonType() {
    return this.type === "submit" || this.type === "reset" ? this.type : "button";
  }

  private get _linkRel() {
    if (this.rel) return this.rel;
    return this.target === "_blank" ? "noopener noreferrer" : undefined;
  }

  private get _variantClass() {
    return Object.values(ButtonVariant).includes(this.variant as ButtonVariant)
      ? this.variant
      : ButtonVariant.Primary;
  }

  private _handleDisabledClick(event: Event) {
    if (!this.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  override render() {
    const className = this._variantClass;

    if (this.href) {
      return html`
        <a
          class=${className}
          href=${ifDefined(this.disabled ? undefined : this.href)}
          target=${ifDefined(this.target || undefined)}
          rel=${ifDefined(this._linkRel)}
          aria-disabled=${ifDefined(this.disabled ? "true" : undefined)}
          tabindex=${ifDefined(this.disabled ? "-1" : undefined)}
          @click=${this._handleDisabledClick}
        >
          <slot></slot>
        </a>
      `;
    }

    return html`
      <button class=${className} type=${this._buttonType} ?disabled=${this.disabled}>
        <slot></slot>
      </button>
    `;
  }
}
