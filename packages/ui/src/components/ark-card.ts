import { css, html, LitElement } from "lit";
import { defineElement } from "../define-element";

/**
 * ArkCard is the root card container.
 */
export class ArkCard extends LitElement {
  static override properties = {
    interactive: { reflect: true, type: Boolean },
    variant: { reflect: true, type: String },
  };

  static override styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-md);
      box-sizing: border-box;
      color: var(--ark-color-text);
      height: 100%;
      overflow: hidden;
      transition:
        border-color var(--ark-duration-normal) var(--ark-ease-out),
        transform var(--ark-duration-slow) var(--ark-ease-standard);
      width: 100%;
    }

    :host([interactive]:hover) .card {
      border-color: var(--ark-color-accent);
      transform: translateY(-2px);
    }

    :host([variant="project"]) .card {
      background: var(--ark-color-background);
      border: 0;
      border-radius: 0;
    }
  `;

  interactive = false;
  variant = "surface";

  override render() {
    return html`<div class="card"><slot></slot></div>`;
  }
}

/**
 * ArkCardHeader contains title, description, and action.
 */
export class ArkCardHeader extends LitElement {
  static override styles = css`
    :host {
      align-items: start;
      display: grid;
      gap: var(--ark-space-1) var(--ark-space-4);
      grid-template-columns: minmax(0, 1fr) auto;
      padding: var(--ark-space-6);
    }

    slot {
      display: contents;
    }

    ::slotted(ark-card-title) {
      grid-column: 1;
      min-width: 0;
    }

    ::slotted(ark-card-description) {
      grid-column: 1;
      min-width: 0;
    }

    ::slotted(ark-card-action) {
      align-self: flex-start;
      grid-column: 2;
      grid-row: 1 / span 2;
    }
  `;

  override render() {
    return html`<slot></slot>`;
  }
}

/**
 * ArkCardTitle provides the main heading inside the card header.
 */
export class ArkCardTitle extends LitElement {
  static override styles = css`
    :host {
      display: block;
      min-width: 0;
    }
    .title {
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      font-size: var(--ark-font-size-xl);
      font-weight: 300;
      line-height: var(--ark-line-height-tight);
      margin: 0;
    }
  `;

  override render() {
    return html`
      <h3 class="title">
        <slot></slot>
      </h3>
    `;
  }
}

/**
 * ArkCardDescription provides secondary supporting text inside the card header.
 */
export class ArkCardDescription extends LitElement {
  static override properties = {
    truncate: { reflect: true, type: Boolean },
  };

  static override styles = css`
    :host {
      display: block;
      min-width: 0;
    }
    .desc {
      color: var(--ark-color-text-muted);
      font-family: var(--ark-font-sans);
      font-size: var(--ark-font-size-sm);
      font-weight: 300;
      line-height: var(--ark-line-height-normal);
      margin: 0;
    }

    :host([truncate]) .desc {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;

  truncate = false;

  override render() {
    return html`
      <p class="desc">
        <slot></slot>
      </p>
    `;
  }
}

/**
 * ArkCardAction contains action elements like buttons or badges in the card header.
 */
export class ArkCardAction extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }
  `;

  override render() {
    return html`<slot></slot>`;
  }
}

/**
 * ArkCardContent contains the main body content of the card.
 */
export class ArkCardContent extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: var(--ark-space-6);
    }

    :host(:not(:first-child)) {
      padding-top: 0;
    }
  `;

  override render() {
    return html`<slot></slot>`;
  }
}

/**
 * ArkCardFooter contains supplementary actions or metadata at the bottom of the card.
 */
export class ArkCardFooter extends LitElement {
  static override styles = css`
    :host {
      align-items: center;
      display: flex;
      gap: var(--ark-space-3);
      justify-content: flex-end;
      padding: var(--ark-space-6);
    }

    :host(:not(:first-child)) {
      padding-top: 0;
    }
  `;

  override render() {
    return html`<slot></slot>`;
  }
}

/**
 * Compound namespace helper Card to allow:
 * <Card.Root>...
 */
export const Card = {
  Root: ArkCard,
  Header: ArkCardHeader,
  Title: ArkCardTitle,
  Description: ArkCardDescription,
  Action: ArkCardAction,
  Content: ArkCardContent,
  Footer: ArkCardFooter,
};

export const defineArkCardRoot = () => {
  defineElement("ark-card", ArkCard);
};

export const defineArkCardHeader = () => {
  defineElement("ark-card-header", ArkCardHeader);
};

export const defineArkCardTitle = () => {
  defineElement("ark-card-title", ArkCardTitle);
};

export const defineArkCardDescription = () => {
  defineElement("ark-card-description", ArkCardDescription);
};

export const defineArkCardAction = () => {
  defineElement("ark-card-action", ArkCardAction);
};

export const defineArkCardContent = () => {
  defineElement("ark-card-content", ArkCardContent);
};

export const defineArkCardFooter = () => {
  defineElement("ark-card-footer", ArkCardFooter);
};

export const defineArkCard = () => {
  defineArkCardRoot();
  defineArkCardHeader();
  defineArkCardTitle();
  defineArkCardDescription();
  defineArkCardAction();
  defineArkCardContent();
  defineArkCardFooter();
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-card": ArkCard;
    "ark-card-header": ArkCardHeader;
    "ark-card-title": ArkCardTitle;
    "ark-card-description": ArkCardDescription;
    "ark-card-action": ArkCardAction;
    "ark-card-content": ArkCardContent;
    "ark-card-footer": ArkCardFooter;
  }
}
