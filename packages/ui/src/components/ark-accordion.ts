import { css, html, LitElement, type PropertyValues } from "lit";
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
 *   auto-scroll-when-expanded (boolean) — when the item opens, scroll the page
 *     so the trigger sits at the top of the viewport. Set --accordion-scroll-margin
 *     to clear a sticky header. Never fires for an item rendered open on load.
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
 *   --accordion-scroll-margin   (default: 0px)
 *
 * @summary A single expandable accordion section.
 * @slot trigger - Optional rich-text heading; falls back to the `heading` attribute.
 * @slot - The expandable body content.
 * @fires ark-accordion:toggle - Bubbles, composed. detail: `{ open: boolean }`.
 * @cssprop [--accordion-trigger-padding=28px 0] - Padding around the trigger row.
 * @cssprop [--accordion-heading-size=clamp(1.25rem, 2vw, 1.75rem)] - Heading font size.
 * @cssprop [--accordion-duration=360ms] - Expand/collapse animation duration.
 * @cssprop [--accordion-body-padding=40px] - Padding around the body content.
 * @cssprop [--accordion-scroll-margin=0px] - Gap left above the trigger when
 *   `auto-scroll-when-expanded` scrolls it to the top — size it to a sticky header.
 */
export class ArkAccordionItem extends LitElement {
  static override properties = {
    heading: { type: String },
    open: { type: Boolean, reflect: true },
    expandCursorLabel: { type: String, attribute: "expand-cursor-label" },
    collapseCursorLabel: { type: String, attribute: "collapse-cursor-label" },
    autoScrollWhenExpanded: {
      type: Boolean,
      reflect: true,
      attribute: "auto-scroll-when-expanded",
    },
  };

  /**
   * How far (px) the trigger may already sit from its scroll target before an
   * auto-scroll is worth doing — keeps a sub-pixel offset from nudging the page.
   */
  private static readonly SCROLL_TOLERANCE_PX = 2;

  private _uid = `ark-acc-${Math.random().toString(36).slice(2, 9)}`;
  private _hasCompletedFirstUpdate = false;
  private _realignScrollOnSettle = false;

  heading = "";
  open = false;
  expandCursorLabel = "Expand";
  collapseCursorLabel = "Collapse";
  autoScrollWhenExpanded = false;

  static override styles = css`
    :host {
      border-bottom: 1px solid var(--ark-color-border);
      display: block;
      /* Honoured by scrollIntoView() when auto-scroll-when-expanded is on. */
      scroll-margin-top: var(--accordion-scroll-margin, 0px);
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

  override updated(changed: PropertyValues) {
    const isFirstUpdate = !this._hasCompletedFirstUpdate;
    this._hasCompletedFirstUpdate = true;

    // An item rendered `open` on load reaches this in its first update; scrolling
    // then would yank the viewport away from the top of the page on arrival.
    if (isFirstUpdate || !changed.has("open")) return;
    if (!this.open || !this.autoScrollWhenExpanded) return;

    this._scrollTriggerToTop();
    // The body reveal animates over --accordion-duration, and in type="single" a
    // sibling above may be collapsing across the same window — either shifts this
    // trigger while the scroll above is in flight, so re-align once it settles.
    this._realignScrollOnSettle = true;
  }

  /**
   * Bring the trigger to the top of its scrollport, unless it is already there.
   * `scroll-margin-top` (via --accordion-scroll-margin) offsets the landing spot,
   * and is measured here so the "already there" test agrees with the browser.
   */
  private _scrollTriggerToTop() {
    const distanceFromTarget =
      this.getBoundingClientRect().top -
      (parseFloat(getComputedStyle(this).scrollMarginTop) || 0);
    const tolerance = ArkAccordionItem.SCROLL_TOLERANCE_PX;
    if (Math.abs(distanceFromTarget) <= tolerance) return;

    this.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  private _handleBodyTransitionEnd = (event: TransitionEvent) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "grid-template-rows") return;
    if (!this._realignScrollOnSettle) return;

    this._realignScrollOnSettle = false;
    // A quick open → close leaves the flag set for a collapse transition; the
    // item the user ended up on is closed, so there is nothing to scroll to.
    if (this.open) this._scrollTriggerToTop();
  };

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
        @transitionend=${this._handleBodyTransitionEnd}
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
 *   auto-scroll-when-expanded (boolean) — opt every item in to scrolling its
 *     trigger to the top of the viewport when it opens. Purely additive: an item
 *     can set the attribute on itself, and this never switches one back off.
 *
 * @summary Optional accordion root that coordinates its items.
 * @slot - The `ark-accordion-item` children.
 */
export class ArkAccordion extends LitElement {
  static override properties = {
    type: { type: String, reflect: true },
    autoScrollWhenExpanded: {
      type: Boolean,
      reflect: true,
      attribute: "auto-scroll-when-expanded",
    },
  };

  type: "multiple" | "single" = "multiple";
  autoScrollWhenExpanded = false;

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

  override updated(changed: PropertyValues) {
    if (changed.has("autoScrollWhenExpanded")) this._syncAutoScroll();
  }

  // Also runs on slotchange, so items added later inherit the root's setting.
  private _syncAutoScroll = () => {
    if (!this.autoScrollWhenExpanded) return;
    this.querySelectorAll<ArkAccordionItem>("ark-accordion-item").forEach(
      (item) => {
        item.autoScrollWhenExpanded = true;
      },
    );
  };

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
    return html`<slot @slotchange=${this._syncAutoScroll}></slot>`;
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
