import { css, html, LitElement } from "lit";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";

/**
 * ArkEmpty is a calm, on-brand empty state. It centres a subtly oversized
 * brand mark (the Æ ligature by default) above a mono eyebrow, a Fraunces
 * headline with an optional emphasised word, a muted description, and an
 * optional default slot for an action (e.g. an ark-button to reset filters).
 */
export class ArkEmpty extends LitElement {
  static override properties = {
    eyebrow: { type: String },
    heading: { type: String },
    headingEmphasis: { attribute: "heading-emphasis", type: String },
    description: { type: String },
    symbol: { type: String },
  };

  static override styles = css`
    :host {
      display: block;
    }

    .root {
      align-items: center;
      display: flex;
      flex-direction: column;
      margin-inline: auto;
      max-width: 32rem;
      padding-block: var(--ark-space-12);
      text-align: center;
    }

    .motif {
      color: var(--ark-color-accent-strong);
      font-family: var(--ark-font-display);
      font-size: clamp(4rem, 11vw, 7rem);
      font-style: italic;
      font-weight: var(--ark-weight-thin);
      line-height: 1;
      opacity: 0.14;
      user-select: none;
    }

    .rule {
      background: var(--ark-color-secondary);
      height: 2px;
      margin-block: var(--ark-space-6);
      opacity: 0.8;
      width: 28px;
    }

    .eyebrow {
      color: var(--ark-color-accent-strong);
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      font-weight: var(--ark-weight-bold);
      letter-spacing: var(--ark-tracking-label);
      text-transform: uppercase;
    }

    .heading {
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: var(--ark-weight-thin);
      line-height: var(--ark-leading-tight);
      margin: var(--ark-space-3) 0 0;
    }

    .heading em {
      color: var(--ark-color-accent-strong);
      font-style: italic;
    }

    .description {
      color: var(--ark-color-text-muted);
      font-family: var(--ark-font-sans);
      font-size: var(--ark-text-md);
      line-height: var(--ark-leading-relaxed);
      margin: var(--ark-space-4) 0 0;
      max-width: 30rem;
    }

    .actions {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: var(--ark-space-3);
      justify-content: center;
      margin-top: var(--ark-space-8);
    }

    .actions[hidden] {
      display: none;
    }
  `;

  eyebrow = "";
  heading = "";
  headingEmphasis = "";
  description = "";
  symbol = "Æ";

  private _hasActions = false;

  private _handleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    const hasActions = slot.assignedElements().length > 0;
    if (hasActions !== this._hasActions) {
      this._hasActions = hasActions;
      this.requestUpdate();
    }
  };

  override render() {
    return html`
      <div class="root" role="status" aria-live="polite">
        ${when(
          this.symbol,
          () => html`<div class="motif" aria-hidden="true">${this.symbol}</div>`,
        )}
        <div class="rule" aria-hidden="true"></div>
        ${when(
          this.eyebrow,
          () => html`<span class="eyebrow">${this.eyebrow}</span>`,
        )}
        ${when(
          this.heading,
          () => html`
            <h2 class="heading">
              ${this.heading}${when(
                this.headingEmphasis,
                () => html` <em>${this.headingEmphasis}</em>`,
              )}
            </h2>
          `,
        )}
        ${when(
          this.description,
          () => html`<p class="description">${this.description}</p>`,
        )}
        <div class="actions" ?hidden=${!this._hasActions}>
          <slot @slotchange=${this._handleSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

export const defineArkEmpty = () => {
  defineElement("ark-empty", ArkEmpty);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-empty": ArkEmpty;
  }
}
