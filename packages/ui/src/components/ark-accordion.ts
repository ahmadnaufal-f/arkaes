import { css, html, LitElement } from "lit";
import { defineElement } from "../define-element";

/**
 * ArkAccordionItem — a single expandable section.
 *
 * Attributes:
 *   heading (string)  — plain-text trigger label; override with slot="trigger" for rich content.
 *   open    (boolean) — reflects open state; toggled on trigger click.
 *   expand-cursor-label / collapse-cursor-label (string) — wording for the
 *     ark-cursor label chip while the trigger is hovered (defaults "Expand" /
 *     "Collapse", picked by open state); inert when no cursor is mounted.
 *
 * Slots:
 *   trigger  — optional rich-text heading; falls back to the `heading` attribute.
 *   (default) — the expandable body content.
 *
 * Events:
 *   ark-accordion:toggle — bubbles, composed. detail: { open: boolean }
 *
 * CSS custom properties:
 *   --accordion-trigger-padding (default: 28px 0)
 *   --accordion-heading-size    (default: clamp(1.25rem, 2vw, 1.75rem))
 *   --accordion-duration        (default: 360ms)
 *   --accordion-body-padding    (default: 40px)
 */
export class ArkAccordionItem extends LitElement {
  static override properties = {
    heading: { type: String },
    open: { type: Boolean, reflect: true },
    expandCursorLabel: { type: String, attribute: "expand-cursor-label" },
    collapseCursorLabel: { type: String, attribute: "collapse-cursor-label" },
  };

  private _uid = `ark-acc-${Math.random().toString(36).slice(2, 9)}`;

  heading = "";
  open = false;
  expandCursorLabel = "Expand";
  collapseCursorLabel = "Collapse";

  static override styles = css`
    :host {
      border-bottom: 1px solid var(--ark-color-border);
      display: block;
    }

    .trigger {
      align-items: center;
      background: transparent;
      border: none;
      color: inherit;
      cursor: var(--ark-cursor-interactive, pointer);
      display: flex;
      font: inherit;
      justify-content: space-between;
      padding: var(--accordion-trigger-padding, 28px 0);
      text-align: left;
      width: 100%;
    }

    .trigger:focus-visible {
      border-radius: var(--ark-radius-xs);
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 4px;
    }

    .heading-slot {
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      font-size: var(--accordion-heading-size, clamp(1.25rem, 2vw, 1.75rem));
      font-weight: var(--ark-weight-thin);
      line-height: 1.1;
      transition: color var(--ark-duration-fast);
    }

    :host(:hover) .heading-slot,
    :host([open]) .heading-slot {
      color: var(--ark-color-accent-strong);
    }

    .icon {
      color: var(--ark-color-text-subtle);
      flex-shrink: 0;
      margin-left: var(--ark-space-6);
      transition: transform var(--ark-duration-normal) var(--ark-ease-standard);
    }

    :host([open]) .icon {
      transform: rotate(180deg);
    }

    /*
     * Grid-row animation: 0fr → 1fr smoothly reveals height without
     * needing a known pixel value. The inner .body-min wrapper keeps
     * min-height: 0 so it can collapse to nothing.
     */
    .body-clip {
      display: grid;
      grid-template-rows: 0fr;
      overflow: hidden;
      transition: grid-template-rows var(--accordion-duration, 360ms)
        var(--ark-ease-standard, cubic-bezier(0.4, 0, 0.2, 1));
    }

    :host([open]) .body-clip {
      grid-template-rows: 1fr;
    }

    .body-min {
      min-height: 0;
      overflow: hidden;
    }

    .body-content {
      padding-bottom: var(--accordion-body-padding, 40px);
    }
  `;

  private _toggle() {
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent("ark-accordion:toggle", {
        bubbles: true,
        composed: true,
        detail: { open: this.open },
      }),
    );
  }

  override render() {
    const triggerId = `${this._uid}-trigger`;
    const contentId = `${this._uid}-content`;

    return html`
      <button
        id=${triggerId}
        class="trigger"
        type="button"
        aria-expanded=${this.open ? "true" : "false"}
        aria-controls=${contentId}
        data-cursor-label=${this.open
          ? this.collapseCursorLabel
          : this.expandCursorLabel}
        @click=${this._toggle}
      >
        <span class="heading-slot">
          <slot name="trigger">${this.heading}</slot>
        </span>
        <span class="icon" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M3 6l5 5 5-5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        id=${contentId}
        class="body-clip"
        role="region"
        aria-labelledby=${triggerId}
      >
        <div class="body-min">
          <div class="body-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * ArkAccordion — optional root that coordinates items.
 *
 * Attributes:
 *   type ("multiple" | "single") — "single" closes other items when one opens.
 */
export class ArkAccordion extends LitElement {
  static override properties = {
    type: { type: String, reflect: true },
  };

  type: "multiple" | "single" = "multiple";

  static override styles = css`
    :host {
      border-top: 1px solid var(--ark-color-border);
      display: block;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("ark-accordion:toggle", this._handleToggle);
  }

  override disconnectedCallback() {
    this.removeEventListener("ark-accordion:toggle", this._handleToggle);
    super.disconnectedCallback();
  }

  private _handleToggle = (e: Event) => {
    if (this.type !== "single") return;
    const opened = e.target as ArkAccordionItem;
    if (!opened.open) return;
    this.querySelectorAll<ArkAccordionItem>("ark-accordion-item").forEach(
      (item) => {
        if (item !== opened) item.open = false;
      },
    );
  };

  override render() {
    return html`<slot></slot>`;
  }
}

export const defineArkAccordion = () => {
  defineElement("ark-accordion", ArkAccordion);
  defineElement("ark-accordion-item", ArkAccordionItem);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-accordion": ArkAccordion;
    "ark-accordion-item": ArkAccordionItem;
  }
}
