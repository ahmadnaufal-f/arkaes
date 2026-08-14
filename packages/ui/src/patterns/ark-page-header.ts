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
 *
 * @summary Page-level header (eyebrow + title + lead).
 * @slot eyebrow - Overrides the `eyebrow` attribute with custom markup.
 * @slot title - Overrides the `title` attribute with custom markup.
 * @slot lead - Overrides the `lead` attribute with custom markup.
 * @slot - Supplementary content appended below the lead (e.g. a meta list).
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

    /* .header aligns children to flex-start, which shrink-wraps the eyebrow to
       its label — leaving ark-badge's trailing rule nothing to run into. */
    .eyebrow {
      align-self: stretch;
    }

    /* ── Title ──────────────────────────────────────────────────────── */
    /* Sized and weighted to match the rest of the type system: ark-hero tops
       out at 60px and owns the largest type, so a page header sits below it. */
    .title,
    ::slotted([slot="title"]) {
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      font-size: 3rem;
      font-weight: var(--ark-weight-medium);
      letter-spacing: -0.015em;
      line-height: 1.12;
      margin: 0;
      text-wrap: balance;
    }

    /* Accent colour without the italic — the italic accent run reads as the
       generated-portfolio pattern the hero redesign removed. */
    .title em,
    ::slotted([slot="title"]) em {
      color: var(--ark-color-accent-strong);
      font-style: normal;
      font-weight: inherit;
    }

    /* ── Lead ───────────────────────────────────────────────────────── */
    /* The measure is set on the slot, not through ::slotted(). For a slotted
       element the outer tree wins the cascade for normal declarations, so a
       consumer's global p { max-width: … } would override anything declared
       here and the lead would run wider than intended. The slot is shadow DOM
       proper and out of the document's reach, so capping it constrains the
       lead identically whether it arrives via the attribute or the slot.
       (display: block is required — a slot is display: contents by default
       and would generate no box to cap.) */
    slot[name="lead"] {
      display: block;
      max-width: 680px;
    }

    .lead,
    ::slotted([slot="lead"]) {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-font-size-xl);
      line-height: var(--ark-line-height-relaxed);
      margin: 0;
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
