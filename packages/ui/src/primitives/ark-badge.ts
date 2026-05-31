import { css, html, LitElement } from "lit";

export enum BadgeVariant {
  Eyebrow = "eyebrow",
  Contact = "contact",
  Soft = "soft",
  Pill = "pill",
}

export type BadgeSize = "sm" | "md" | "lg";
export type BadgeVariantValue = `${BadgeVariant}`;

const badgeSizes = new Set<string>(["sm", "md", "lg"]);
const badgeVariants = new Set<string>(Object.values(BadgeVariant));

const normalizeBadgeSize = (size: string): BadgeSize =>
  (badgeSizes.has(size) ? size : "md") as BadgeSize;

const normalizeBadgeVariant = (variant: string): BadgeVariantValue =>
  (badgeVariants.has(variant) ? variant : BadgeVariant.Eyebrow) as BadgeVariantValue;

export class ArkBadge extends LitElement {
  static override properties = {
    size: { reflect: true, type: String },
    variant: { reflect: true, type: String },
  };

  static override styles = css`
    :host {
      --badge-font-size: calc(var(--ark-font-size-xs) * 0.83);
      --badge-gap: var(--ark-space-4);
      --badge-line-width: 28px;
      --badge-pill-font-size: var(--ark-font-size-xs);
      --badge-pill-padding-block: calc(var(--ark-space-1) * 0.8);
      --badge-pill-padding-inline: 0.65rem;

      display: inline-flex;
    }

    :host([size="sm"]) {
      --badge-font-size: calc(var(--ark-font-size-xs) * 0.73);
      --badge-gap: var(--ark-space-3);
      --badge-line-width: 20px;
      --badge-pill-font-size: var(--badge-font-size);
      --badge-pill-padding-block: calc(var(--ark-space-1) * 0.6);
      --badge-pill-padding-inline: var(--ark-space-2);
    }

    :host([size="lg"]) {
      --badge-font-size: var(--ark-font-size-xs);
      --badge-gap: var(--ark-space-5);
      --badge-line-width: 36px;
      --badge-pill-font-size: var(--badge-font-size);
      --badge-pill-padding-block: var(--ark-space-1);
      --badge-pill-padding-inline: 0.8rem;
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

    :host(:not([variant])) .badge::before,
    :host([variant="eyebrow"]) .badge::before,
    :host([variant="contact"]) .badge::before {
      background: currentColor;
      content: "";
      display: block;
      height: 1px;
      width: var(--badge-line-width);
    }

    :host([variant="soft"]) .badge {
      color: var(--ark-color-text-ghost);
      letter-spacing: var(--ark-letter-spacing-mono);
    }

    :host([variant="pill"]) .badge {
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-full);
      color: var(--ark-color-text-ghost);
      font-size: var(--badge-pill-font-size);
      letter-spacing: 0.14em;
      padding: var(--badge-pill-padding-block) var(--badge-pill-padding-inline);
    }

    :host([variant="contact"]) .badge {
      color: var(--ark-color-accent);
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
