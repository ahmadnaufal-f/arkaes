import { css, html, LitElement } from "lit";
import { defineElement } from "../define-element";

export enum BadgeVariant {
  Eyebrow = "eyebrow",
  Soft = "soft",
}

export type BadgeSize = "sm" | "md" | "lg";
export type BadgeVariantValue = `${BadgeVariant}`;

const badgeSizes = new Set<string>(["sm", "md", "lg"]);
const badgeVariants = new Set<string>(Object.values(BadgeVariant));

const normalizeBadgeSize = (size: string): BadgeSize =>
  (badgeSizes.has(size) ? size : "md") as BadgeSize;

const normalizeBadgeVariant = (variant: string): BadgeVariantValue =>
  (badgeVariants.has(variant) ? variant : BadgeVariant.Eyebrow) as BadgeVariantValue;

/**
 * Compact, text-only label for eyebrow kickers and status tags. Put the label
 * text in the default slot. Use `variant="eyebrow"` for the mono, rule-prefixed
 * section kicker and `variant="soft"` for a filled pill.
 *
 * @summary Eyebrow / status label.
 * @slot - The badge label text.
 */
export class ArkBadge extends LitElement {
  static override properties = {
    size: { reflect: true, type: String },
    variant: { reflect: true, type: String },
  };

  static override styles = css`
    :host {
      --badge-font-size: calc(var(--ark-font-size-xs) * 0.83);
      --badge-gap: var(--ark-space-4);

      display: inline-flex;
    }

    /* The eyebrow is a row, not a pill: it fills its container so the trailing
       rule has somewhere to run to. Soft stays inline so it can sit in text. */
    :host(:not([variant])),
    :host([variant="eyebrow"]) {
      display: flex;
    }

    :host([size="sm"]) {
      --badge-font-size: calc(var(--ark-font-size-xs) * 0.73);
      --badge-gap: var(--ark-space-3);
    }

    :host([size="lg"]) {
      --badge-font-size: var(--ark-font-size-xs);
      --badge-gap: var(--ark-space-5);
    }

    .badge {
      align-items: center;
      color: var(--ark-color-accent-strong);
      display: inline-flex;
      font-family: var(--ark-font-mono);
      font-size: var(--badge-font-size);
      gap: var(--badge-gap);
      letter-spacing: var(--ark-letter-spacing-wide);
      line-height: 1;
      text-transform: uppercase;
    }

    /* The rule follows the label and runs to the end of the row, rather than
       sitting in front of it as a fixed 28px stub. The stub — a short rule on
       the same baseline as a mono uppercase kicker — is the single most
       recognisable piece of generated-portfolio chrome; a long rule reads as a
       section divider doing a job instead. */
    :host(:not([variant])) .badge,
    :host([variant="eyebrow"]) .badge {
      display: flex;
      width: 100%;
    }

    /* currentColor, not a border token: the eyebrow is used on the light page
       ground and on the dark contact panel, and a fixed dark hairline
       disappears on the latter. Tying the rule to the label's own colour means
       it is legible wherever the label is. */
    :host(:not([variant])) .badge::after,
    :host([variant="eyebrow"]) .badge::after {
      background: currentColor;
      content: "";
      flex: 1;
      height: 1px;
      opacity: 0.38;
    }

    :host([variant="soft"]) .badge {
      color: var(--ark-color-text-ghost);
      letter-spacing: var(--ark-letter-spacing-mono);
    }
  `;

  private _size?: BadgeSize;
  private _variant?: BadgeVariantValue;

  constructor() {
    super();

    this.size = "md";
    this.variant = BadgeVariant.Eyebrow;
  }

  get size() {
    return this._size ?? "md";
  }

  set size(value: BadgeSize | string) {
    const oldSize = this._size;
    this._size = normalizeBadgeSize(value);
    this.requestUpdate("size", oldSize);
  }

  get variant() {
    return this._variant ?? BadgeVariant.Eyebrow;
  }

  set variant(value: BadgeVariantValue | string) {
    const oldVariant = this._variant;
    this._variant = normalizeBadgeVariant(value);
    this.requestUpdate("variant", oldVariant);
  }

  override render() {
    return html`<span class="badge"><slot></slot></span>`;
  }
}

export const defineArkBadge = () => {
  defineElement("ark-badge", ArkBadge);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-badge": ArkBadge;
  }
}
