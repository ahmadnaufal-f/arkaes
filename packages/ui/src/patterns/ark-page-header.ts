import { css, html, LitElement } from "lit";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";
import { defineArkBadge } from "../primitives/ark-badge";

/**
 * ArkPageHeader is the page-level header used at the top of portfolio
 * sub-pages (projects, about). It pairs an eyebrow badge with a display title
 * and an optional lead paragraph, and exposes a trailing default slot for
 * supplementary content such as a meta list.
 *
 * The attribute API covers the common cases; named slots (`eyebrow`, `title`,
 * `lead`) override any field with custom markup, and the default slot appends
 * content below the lead.
 */
export class ArkPageHeader extends LitElement {
  static override properties = {
    eyebrow: { type: String },
    heading: { type: String, attribute: "heading" },
    lead: { type: String },
  };

  eyebrow = "";
  heading = "";
  lead = "";

  static override styles = css`
    :host {
      display: block;
    }

    .header {
      align-items: flex-start;
      display: flex;
      flex-direction: column;
      gap: var(--ark-space-6);
    }

    /* ── Title ──────────────────────────────────────────────────────── */
    .title,
    ::slotted([slot="title"]) {
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      font-size: 4rem;
      font-weight: var(--ark-weight-thin);
      letter-spacing: 0;
      line-height: var(--ark-line-height-tight);
      margin: 0;
      text-wrap: balance;
    }

    .title em,
    ::slotted([slot="title"]) em {
      color: var(--ark-color-accent-strong);
      font-style: italic;
      font-weight: var(--ark-weight-thin);
    }

    /* ── Lead ───────────────────────────────────────────────────────── */
    .lead,
    ::slotted([slot="lead"]) {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-font-size-xl);
      line-height: var(--ark-line-height-relaxed);
      margin: 0;
      max-width: 680px;
    }

    /* ── Trailing content ───────────────────────────────────────────── */
    .extra {
      width: 100%;
    }

    /* ── Responsive ─────────────────────────────────────────────────── */
    @media (max-width: 520px) {
      .title,
      ::slotted([slot="title"]) {
        font-size: 3rem;
      }
    }
  `;

  override render() {
    const hasEyebrowSlot = !!this.querySelector('[slot="eyebrow"]');
    const hasTitleSlot = !!this.querySelector('[slot="title"]');
    const hasLeadSlot = !!this.querySelector('[slot="lead"]');
    const hasExtra = !!this.querySelector(":scope > :not([slot])");

    const showEyebrow = !!this.eyebrow || hasEyebrowSlot;
    const showLead = !!this.lead || hasLeadSlot;

    return html`
      <header class="header" part="header">
        ${when(
          showEyebrow,
          () => html`
            <div class="eyebrow">
              <slot name="eyebrow">
                <ark-badge>${this.eyebrow}</ark-badge>
              </slot>
            </div>
          `,
        )}
        ${when(
          hasTitleSlot,
          () => html`<slot name="title"></slot>`,
          () => html`<h1 class="title">${this.heading}</h1>`,
        )}
        ${when(
          showLead,
          () => html`
            <slot name="lead">
              <p class="lead">${this.lead}</p>
            </slot>
          `,
        )}
        ${when(
          hasExtra,
          () => html`
            <div class="extra">
              <slot></slot>
            </div>
          `,
        )}
      </header>
    `;
  }
}

export const defineArkPageHeader = () => {
  defineArkBadge();
  defineElement("ark-page-header", ArkPageHeader);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-page-header": ArkPageHeader;
  }
}
