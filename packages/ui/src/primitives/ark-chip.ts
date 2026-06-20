import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { defineElement } from "../define-element";

export enum ChipVariant {
  Default = "default",
  Primary = "primary",
  Emerging = "emerging",
  Accent = "accent",
  Learning = "learning",
}

export type ChipSize = "sm" | "md";
export type ChipVariantValue = `${ChipVariant}`;

const chipSizes = new Set<string>(["sm", "md"]);
const chipVariants = new Set<string>(Object.values(ChipVariant));

const normalizeChipSize = (size: string): ChipSize =>
  (chipSizes.has(size) ? size : "md") as ChipSize;

const normalizeChipVariant = (variant: string): ChipVariantValue =>
  (chipVariants.has(variant) ? variant : ChipVariant.Default) as ChipVariantValue;

export class ArkChip extends LitElement {
  static override properties = {
    href: { type: String },
    isHovered: { attribute: "data-is-hovered", reflect: true, type: Boolean },
    rel: { type: String },
    size: { reflect: true, type: String },
    target: { type: String },
    variant: { reflect: true, type: String },
  };

  static override styles = css`
    :host {
      --chip-font-size: 0.7rem;

      display: inline-flex;
    }

    :host([size="sm"]) {
      --chip-font-size: 0.68rem;
    }

    .chip {
      align-items: center;
      background: var(--ark-color-neutral-50);
      border: 1px solid var(--ark-color-neutral-300);
      border-radius: var(--ark-radius-full);
      color: var(--ark-color-ink-muted);
      display: inline-flex;
      font-family: var(--ark-font-mono);
      font-size: var(--chip-font-size);
      letter-spacing: var(--ark-letter-spacing-wide);
      padding: var(--ark-space-1) var(--ark-space-3);
      text-transform: uppercase;
      transition:
        background var(--ark-duration-fast) var(--ark-ease-out),
        border-color var(--ark-duration-fast) var(--ark-ease-out),
        color var(--ark-duration-fast) var(--ark-ease-out);
      white-space: nowrap;

      &:is(a) {
        cursor: pointer;
        text-decoration: none;
      }
    }

    :host([variant="default"]) {
      &:is([data-is-hovered], :hover) .chip {
        background: var(--ark-color-neutral-100);
        border-color: var(--ark-color-neutral-400);
      }
    }

    :host([variant="primary"]) {
      .chip {
        background: var(--ark-color-blush-50);
        border-color: var(--ark-color-blush);
        color: var(--ark-color-blush-deep);
      }

      &:is([data-is-hovered], :hover) .chip {
        background: var(--ark-color-blush-100);
        border-color: var(--ark-color-blush-400);
        color: var(--ark-color-ink);
      }
    }

    :host([variant="emerging"]) {
      .chip {
        background: var(--ark-color-sage-50);
        border-color: var(--ark-color-sage-300);
        color: var(--ark-color-sage);
      }

      &:is([data-is-hovered], :hover) .chip {
        background: var(--ark-color-sage-100);
        border-color: var(--ark-color-sage-400);
        color: var(--ark-color-ink);
      }
    }

    :host([variant="accent"]) .chip {
      background: var(--ark-color-accent-soft);
      border-color: transparent;
      color: var(--ark-color-accent-strong);
    }

    :host([variant="learning"]) .chip {
      background: transparent;
      border-color: var(--ark-color-sage-light);
      border-style: dashed;
      color: var(--ark-color-sage);
    }
  `;

  private _size?: ChipSize;
  private _variant?: ChipVariantValue;

  href?: string;
  isHovered = false;
  rel?: string;
  target?: string;

  constructor() {
    super();

    this.size = "md";
    this.variant = ChipVariant.Default;
  }

  get size() {
    return this._size ?? "md";
  }

  set size(value: ChipSize | string) {
    const oldSize = this._size;
    this._size = normalizeChipSize(value);
    this.requestUpdate("size", oldSize);
  }

  get variant() {
    return this._variant ?? ChipVariant.Default;
  }

  set variant(value: ChipVariantValue | string) {
    const oldVariant = this._variant;
    this._variant = normalizeChipVariant(value);
    this.requestUpdate("variant", oldVariant);
  }

  override render() {
    if (this.href) {
      return html`<a
        class="chip"
        href=${this.href}
        target=${ifDefined(this.target || undefined)}
        rel=${ifDefined(this.rel || (this.target === "_blank" ? "noopener noreferrer" : undefined))}
        ><slot></slot
      ></a>`;
    }

    return html`<span class="chip"><slot></slot></span>`;
  }
}

export const defineArkChip = () => {
  defineElement("ark-chip", ArkChip);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-chip": ArkChip;
  }
}
