import { css, html, LitElement } from "lit";

export enum BadgeVariant {
  Eyebrow = "eyebrow",
  Contact = "contact",
  Soft = "soft",
  Pill = "pill",
}

export class ArkBadge extends LitElement {
  static override properties = {
    size: { reflect: true, type: String },
    variant: { reflect: true, type: String },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    .badge {
      align-items: center;
      color: var(--ark-color-accent-strong);
      display: inline-flex;
      font-family: var(--ark-font-mono);
      font-size: 0.62rem;
      gap: 1rem;
      letter-spacing: var(--ark-letter-spacing-wide);
      line-height: 1;
      text-transform: uppercase;
    }

    :host([variant="eyebrow"]) .badge::before,
    :host([variant="contact"]) .badge::before {
      background: currentColor;
      content: "";
      display: block;
      height: 1px;
      width: 28px;
    }

    :host([variant="soft"]) .badge {
      color: var(--ark-color-text-ghost);
      letter-spacing: var(--ark-letter-spacing-mono);
    }

    :host([variant="pill"]) .badge {
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-full);
      color: var(--ark-color-text-ghost);
      font-size: var(--ark-font-size-xs);
      letter-spacing: 0.14em;
      padding: 0.2rem 0.65rem;
    }

    :host([variant="contact"]) .badge {
      color: var(--ark-color-accent);
    }

    /* Size variants */
    :host([size="sm"]) .badge {
      font-size: 0.55rem;
      gap: 0.75rem;
    }

    :host([size="sm"]) .badge::before {
      width: 20px;
    }

    :host([size="sm"][variant="pill"]) .badge {
      padding: 0.15rem 0.5rem;
    }

    :host([size="lg"]) .badge {
      font-size: 0.75rem;
      gap: 1.25rem;
    }

    :host([size="lg"]) .badge::before {
      width: 36px;
    }

    :host([size="lg"][variant="pill"]) .badge {
      padding: 0.25rem 0.8rem;
    }
  `;

  size = "md";
  variant: BadgeVariant | string = BadgeVariant.Eyebrow;

  override render() {
    return html`<span class="badge"><slot></slot></span>`;
  }
}
