import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";
import { defineArkSpinner } from "./ark-spinner";

export enum ButtonVariant {
  Primary = "primary",
  Secondary = "secondary",
  Outline = "outline",
  Ghost = "ghost",
  Link = "link",
}

export enum ButtonTone {
  Neutral = "neutral",
  Danger = "danger",
}

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariantValue = `${ButtonVariant}`;
export type ButtonToneValue = `${ButtonTone}`;

const buttonSizes = new Set<string>(["sm", "md", "lg"]);
const buttonVariants = new Set<string>(Object.values(ButtonVariant));
const buttonTones = new Set<string>(Object.values(ButtonTone));

const normalizeButtonSize = (size: string): ButtonSize =>
  (buttonSizes.has(size) ? size : "md") as ButtonSize;

const normalizeButtonVariant = (variant: string): ButtonVariantValue =>
  (buttonVariants.has(variant) ? variant : ButtonVariant.Primary) as ButtonVariantValue;

const normalizeButtonTone = (tone: string): ButtonToneValue =>
  (buttonTones.has(tone) ? tone : ButtonTone.Neutral) as ButtonToneValue;

/**
 * Action control spanning a five-step emphasis scale: `primary` (the one loud
 * action per view), `secondary` (supporting), `outline` (alternate paths),
 * `ghost` (quiet utility), and `link` (inline serif navigation). Renders a
 * native `<button>` by default, or an `<a>` when `href` is set. Shows a
 * spinner while `loading` is true or while a `loadingPromise` is pending.
 * Set `tone="danger"` on any variant for destructive actions.
 *
 * @summary Button / link action.
 * @slot - The button label.
 * @slot prefix - Leading glyph (e.g. a back arrow).
 * @slot suffix - Trailing glyph (e.g. a forward arrow).
 * @cssprop [--ark-button-primary-bg=var(--ark-color-text)] - Primary variant background.
 * @cssprop [--ark-button-primary-bg-hover=var(--ark-color-text-soft)] - Primary hover background.
 * @cssprop [--ark-button-primary-fg=var(--ark-color-bg)] - Primary variant text color.
 */
export class ArkButton extends LitElement {
  static override properties = {
    disabled: { reflect: true, type: Boolean },
    fullWidth: { attribute: "full-width", reflect: true, type: Boolean },
    href: { type: String },
    loading: { reflect: true, type: Boolean },
    loadingPromise: { attribute: false },
    rel: { type: String },
    size: { reflect: true, type: String },
    target: { type: String },
    tone: { reflect: true, type: String },
    type: { type: String },
    variant: { reflect: true, type: String },
  };

  static override styles = css`
    :host {
      --button-font-size: var(--ark-font-size-sm);
      --button-link-font-size: var(--ark-font-size-md);
      --button-min-height: 3rem;
      --button-padding: var(--ark-space-4) var(--ark-space-8);

      display: inline-flex;
    }

    :host([size="sm"]) {
      --button-font-size: var(--ark-font-size-xs);
      --button-link-font-size: var(--ark-font-size-sm);
      --button-min-height: 2.25rem;
      --button-padding: var(--ark-space-2) var(--ark-space-4);
    }

    :host([size="lg"]) {
      --button-link-font-size: var(--ark-font-size-lg);
      --button-min-height: 3.25rem;
      --button-padding: var(--ark-space-4) var(--ark-space-10);
    }

    :host([full-width]) {
      width: 100%;
    }

    ark-spinner {
      --spinner-color: currentColor;
    }

    .button {
      align-items: center;
      background: var(--button-bg, transparent);
      border: 1px solid var(--button-border-color, transparent);
      border-radius: var(--ark-radius-xs);
      color: var(--button-fg);
      cursor: var(--ark-cursor-interactive, pointer);
      display: inline-flex;
      font-family: var(--ark-font-mono);
      font-size: var(--button-font-size);
      gap: var(--button-gap, var(--ark-space-2));
      justify-content: center;
      letter-spacing: var(--ark-letter-spacing-mono);
      min-height: var(--button-min-height);
      overflow: hidden;
      padding: var(--button-padding);
      position: relative;
      text-decoration: none;
      text-transform: uppercase;
      transition:
        background var(--ark-duration-normal) var(--ark-ease-out),
        border-color var(--ark-duration-normal) var(--ark-ease-out),
        box-shadow var(--ark-duration-normal) var(--ark-ease-out),
        color var(--ark-duration-normal) var(--ark-ease-out),
        transform var(--ark-duration-normal) var(--ark-ease-out);
      width: 100%;

      /* The family signature: an underline that wipes in from the left on the
         variants that declare an underline color (primary and link). */
      &::after {
        background: var(--button-underline-color, transparent);
        bottom: 0;
        content: "";
        height: var(--button-underline-height, 0);
        left: 0;
        position: absolute;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform var(--ark-duration-slow) var(--ark-ease-out);
        width: 100%;
      }

      &:not(:disabled):not([aria-disabled="true"]) {
        &:hover {
          background: var(--button-bg-hover, var(--button-bg, transparent));
          border-color: var(--button-border-color-hover, var(--button-border-color, transparent));
          box-shadow: var(--button-shadow-hover, none);
          color: var(--button-fg-hover, var(--button-fg));
          transform: var(--button-transform-hover, none);

          &::after {
            transform: scaleX(1);
          }

          ::slotted([slot="prefix"]) {
            transform: translateX(-2px);
          }

          ::slotted([slot="suffix"]) {
            transform: translateX(2px);
          }
        }

        /* Press settles the button back down for a tactile click. */
        &:active {
          background: var(--button-bg-active, var(--button-bg-hover, var(--button-bg, transparent)));
          box-shadow: var(--button-shadow-active, none);
          transform: none;
        }
      }

      &:focus-visible {
        outline: 2px solid var(--ark-color-focus);
        outline-offset: 4px;
      }
    }

    ::slotted([slot="prefix"]),
    ::slotted([slot="suffix"]) {
      transition: transform var(--ark-duration-normal) var(--ark-ease-out);
    }

    :host(:not([variant])),
    :host([variant="primary"]) {
      --button-bg: var(--ark-button-primary-bg, var(--ark-color-text));
      --button-bg-hover: var(--ark-button-primary-bg-hover, var(--ark-color-text-soft));
      --button-fg: var(--ark-button-primary-fg, var(--ark-color-bg));
      --button-shadow-active: var(--ark-shadow-sm);
      --button-shadow-hover: var(--ark-shadow-md);
      --button-transform-hover: translateY(-2px);
      --button-underline-color: var(--ark-color-accent);
      --button-underline-height: 2px;
    }

    :host([variant="secondary"]) {
      --button-bg: var(--ark-color-accent-soft);
      --button-bg-hover: color-mix(in srgb, var(--ark-color-accent) 14%, var(--ark-color-accent-soft));
      --button-border-color: var(--ark-color-border);
      --button-border-color-hover: var(--ark-color-accent);
      --button-fg: var(--ark-color-accent-strong);
      --button-shadow-hover: var(--ark-shadow-sm);
      --button-transform-hover: translateY(-2px);
    }

    :host([variant="outline"]) {
      --button-bg-hover: var(--ark-color-surface-soft);
      --button-border-color: var(--ark-color-border);
      --button-border-color-hover: var(--ark-color-accent);
      --button-fg: var(--ark-color-text);
      --button-fg-hover: var(--ark-color-accent-strong);
      --button-shadow-hover: var(--ark-shadow-sm);
      --button-transform-hover: translateY(-2px);
    }

    :host([variant="ghost"]) {
      --button-bg-active: var(--ark-color-accent-soft);
      --button-bg-hover: var(--ark-color-surface-soft);
      --button-fg: var(--ark-color-text-muted);
      --button-fg-hover: var(--ark-color-text);
    }

    :host([variant="link"]) {
      --button-fg: var(--ark-color-text-muted);
      --button-fg-hover: var(--ark-color-accent-strong);
      --button-gap: var(--ark-space-1);
      --button-underline-color: var(--ark-color-accent-strong);
      --button-underline-height: 1px;
    }

    /* The link variant is an inline serif navigation affordance, not a boxed
       button: sizes change its font-size only, never its box metrics. */
    :host([variant="link"]) .button {
      border-radius: 0;
      font-family: var(--ark-font-serif);
      font-size: var(--button-link-font-size);
      font-style: italic;
      letter-spacing: normal;
      min-height: auto;
      overflow: visible;
      padding: 0 0 var(--ark-space-1);
      text-transform: none;
      width: auto;
    }

    :host(:not([variant])[tone="danger"]),
    :host([variant="primary"][tone="danger"]) {
      --button-bg: var(--ark-color-danger);
      --button-bg-hover: color-mix(in srgb, var(--ark-color-danger), var(--ark-color-text) 20%);
      --button-fg: var(--ark-color-bg);
      --button-underline-color: color-mix(in srgb, var(--ark-color-danger), var(--ark-color-text) 35%);
    }

    :host([variant="secondary"][tone="danger"]) {
      --button-bg: color-mix(in srgb, var(--ark-color-danger) 12%, var(--ark-color-bg));
      --button-bg-hover: color-mix(in srgb, var(--ark-color-danger) 20%, var(--ark-color-bg));
      --button-border-color-hover: var(--ark-color-danger);
      --button-fg: color-mix(in srgb, var(--ark-color-danger), var(--ark-color-text) 25%);
    }

    :host([variant="outline"][tone="danger"]) {
      --button-bg-hover: color-mix(in srgb, var(--ark-color-danger) 8%, var(--ark-color-bg));
      --button-border-color-hover: var(--ark-color-danger);
      --button-fg: var(--ark-color-danger);
      --button-fg-hover: var(--ark-color-danger);
    }

    :host([variant="ghost"][tone="danger"]) {
      --button-bg-active: color-mix(in srgb, var(--ark-color-danger) 14%, var(--ark-color-bg));
      --button-bg-hover: color-mix(in srgb, var(--ark-color-danger) 8%, var(--ark-color-bg));
      --button-fg: var(--ark-color-danger);
      --button-fg-hover: var(--ark-color-danger);
    }

    :host([variant="link"][tone="danger"]) {
      --button-fg: var(--ark-color-danger);
      --button-fg-hover: var(--ark-color-danger);
      --button-underline-color: var(--ark-color-danger);
    }

    :host([full-width]) .button {
      width: 100%;
    }

    .button:disabled,
    .button[aria-disabled="true"] {
      cursor: not-allowed;
      opacity: 0.55;
    }

    /* Loading state: keep full opacity and swap cursor; works for both loading and loadingPromise */
    .button:disabled[aria-busy="true"] {
      cursor: progress;
      opacity: 1;
    }

    .button[aria-disabled="true"][aria-busy="true"] {
      cursor: progress;
    }
  `;

  href = "";
  disabled = false;
  fullWidth = false;
  loading = false;
  rel = "";
  target = "";
  type: "button" | "submit" | "reset" = "button";

  private _size?: ButtonSize;
  private _tone?: ButtonToneValue;
  private _variant?: ButtonVariantValue;

  private _loadingPromiseValue: Promise<unknown> | undefined;
  private _promisePending = false;

  constructor() {
    super();

    this.size = "md";
    this.tone = ButtonTone.Neutral;
    this.variant = ButtonVariant.Primary;
  }

  get size() {
    return this._size ?? "md";
  }

  set size(value: ButtonSize | string) {
    const oldSize = this._size;
    this._size = normalizeButtonSize(value);
    this.requestUpdate("size", oldSize);
  }

  get tone() {
    return this._tone ?? ButtonTone.Neutral;
  }

  set tone(value: ButtonToneValue | string) {
    const oldTone = this._tone;
    this._tone = normalizeButtonTone(value);
    this.requestUpdate("tone", oldTone);
  }

  get variant() {
    return this._variant ?? ButtonVariant.Primary;
  }

  set variant(value: ButtonVariantValue | string) {
    const oldVariant = this._variant;
    this._variant = normalizeButtonVariant(value);
    this.requestUpdate("variant", oldVariant);
  }

  get loadingPromise(): Promise<unknown> | undefined {
    return this._loadingPromiseValue;
  }

  set loadingPromise(p: Promise<unknown> | undefined) {
    const old = this._loadingPromiseValue;
    this._loadingPromiseValue = p;

    if (p) {
      this._promisePending = true;
      p.finally(() => {
        if (this._loadingPromiseValue === p) {
          this._promisePending = false;
          this.requestUpdate();
        }
      });
    } else {
      this._promisePending = false;
    }

    this.requestUpdate("loadingPromise", old);
  }

  private get _isEffectivelyLoading() {
    return this.loading || this._promisePending;
  }

  private get _buttonType() {
    return this.type === "submit" || this.type === "reset" ? this.type : "button";
  }

  private get _linkRel() {
    if (this.rel) return this.rel;
    return this.target === "_blank" ? "noopener noreferrer" : undefined;
  }

  private _handleDisabledClick(event: Event) {
    if (!this.disabled && !this._isEffectivelyLoading) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private _renderContent(isLoading: boolean) {
    const spinner = when(isLoading, () => html`<ark-spinner size="sm" decorative></ark-spinner>`);
    return html`${spinner}<slot name="prefix"></slot><slot></slot><slot name="suffix"></slot>`;
  }

  override render(): unknown {
    const isLoading = this._isEffectivelyLoading;

    if (this.href) {
      const inactive = this.disabled || isLoading;
      return html`
        <a
          class="button"
          href=${ifDefined(inactive ? undefined : this.href)}
          target=${ifDefined(this.target || undefined)}
          rel=${ifDefined(this._linkRel)}
          aria-disabled=${ifDefined(inactive ? "true" : undefined)}
          aria-busy=${ifDefined(isLoading ? "true" : undefined)}
          tabindex=${ifDefined(inactive ? "-1" : undefined)}
          @click=${this._handleDisabledClick}
        >
          ${this._renderContent(isLoading)}
        </a>
      `;
    }

    return html`
      <button
        class="button"
        type=${this._buttonType}
        ?disabled=${this.disabled || isLoading}
        aria-busy=${ifDefined(isLoading ? "true" : undefined)}
      >
        ${this._renderContent(isLoading)}
      </button>
    `;
  }
}

export const defineArkButton = () => {
  defineArkSpinner();
  defineElement("ark-button", ArkButton);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-button": ArkButton;
  }
}
