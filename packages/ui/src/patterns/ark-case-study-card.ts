import { css, html, LitElement } from "lit";
import { when } from "lit/directives/when.js";
import { defineArkCard } from "../components/ark-card";
import { defineElement } from "../define-element";

export type ArkCaseStudyCardVariant = "featured" | "compact";

/**
 * ArkCaseStudyCard is a linked portfolio card composition with optional media,
 * category, summary, and tag content.
 */
export class ArkCaseStudyCard extends LitElement {
  static override properties = {
    category: { type: String },
    href: { type: String },
    summary: { type: String },
    title: { type: String },
    variant: { reflect: true, type: String },
  };

  static override styles = css`
    :host {
      display: block;
      height: 100%;
    }

    ark-card {
      height: 100%;
    }

    .link {
      background: var(--ark-color-background);
      color: inherit;
      display: grid;
      height: 100%;
      overflow: hidden;
      text-decoration: none;
    }

    .link:focus-visible {
      outline: 2px solid var(--ark-color-focus);
      outline-offset: -2px;
    }

    .media {
      min-height: 0;
      overflow: hidden;
    }

    .media::slotted(*) {
      transition: transform 700ms var(--ark-ease-standard);
      width: 100%;
    }

    :host(:hover) .media::slotted(*) {
      transform: scale(1.04);
    }

    .content {
      align-items: flex-start;
      background: var(--ark-color-background);
      display: flex;
      gap: var(--ark-space-4);
      justify-content: space-between;
      padding: 22px 26px;
    }

    .copy {
      min-width: 0;
    }

    .category {
      color: var(--ark-color-accent-strong);
      font-family: var(--ark-font-mono);
      font-size: var(--ark-font-size-xs);
      letter-spacing: 0.14em;
      margin: 0 0 var(--ark-space-3);
      text-transform: uppercase;
    }

    .title {
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      font-size: 1.25rem;
      font-weight: var(--ark-weight-thin);
      line-height: var(--ark-line-height-tight);
      margin: 0;
    }

    .summary {
      color: var(--ark-color-text-muted);
      font-family: var(--ark-font-sans);
      font-size: var(--ark-font-size-sm);
      line-height: var(--ark-line-height-relaxed);
      margin: var(--ark-space-3) 0 0;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: var(--ark-space-2);
    }

    .tags:empty {
      display: none;
    }

    .arrow {
      color: var(--ark-color-border);
      flex: none;
      font-size: 1.1rem;
      line-height: 1;
      margin-top: 2px;
      transition:
        color var(--ark-duration-normal),
        transform var(--ark-duration-normal);
    }

    :host(:hover) .arrow {
      color: var(--ark-color-accent-strong);
      transform: translate(3px, -3px);
    }

    :host([variant="compact"]) .link {
      background: var(--ark-color-surface);
    }

    :host([variant="compact"]) .content {
      background: var(--ark-color-surface);
      min-height: 100%;
      padding: var(--ark-space-5);
    }

    :host([variant="compact"]) .title {
      font-size: var(--ark-font-size-xl);
    }
  `;

  category = "";
  href = "";
  summary = "";
  override title = "";
  variant: ArkCaseStudyCardVariant = "featured";

  override render() {
    const hasMedia = this.variant !== "compact";

    return html`
      <ark-card
        interactive
        variant=${this.variant === "featured" ? "project" : "surface"}
      >
        <a class="link" href=${this.href || "#"}>
          ${when(
            hasMedia,
            () => html`
                <div class="media">
                  <slot name="media"></slot>
                </div>
              `,
          )}
          <div class="content">
            <div class="copy">
              ${when(
                this.category,
                () => html`<p class="category">${this.category}</p>`,
              )}
              <h3 class="title">${this.title}</h3>
              ${when(
                this.summary,
                () => html`<p class="summary">${this.summary}</p>`,
              )}
              <div class="tags">
                <slot name="tag"></slot>
              </div>
            </div>
            <span class="arrow" aria-hidden="true">&nearr;</span>
          </div>
        </a>
      </ark-card>
    `;
  }
}

export const defineArkCaseStudyCard = () => {
  defineArkCard();
  defineElement("ark-case-study-card", ArkCaseStudyCard);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-case-study-card": ArkCaseStudyCard;
  }
}
