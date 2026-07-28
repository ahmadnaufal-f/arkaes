import { css, html, LitElement } from "lit";
import { when } from "lit/directives/when.js";
import { defineArkCard } from "../components/ark-card";
import { defineElement } from "../define-element";

export type ArkMediaCardVariant = "featured" | "compact";

/**
 * Publish dates are calendar dates, not instants, so they are formatted in UTC.
 * Formatting in the viewer's zone would shift the day backwards for anyone west
 * of UTC — a date stored as `2026-07-25T00:00:00.000Z` would read "July 24" in
 * the Americas. Built once; constructing an Intl formatter is not cheap.
 */
const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
  timeZone: "UTC",
});

/**
 * ArkMediaCard is a linked card composition with optional media, category,
 * date, summary, and tag content — used for case studies, projects, and blog
 * posts alike.
 *
 * @summary Linked media card.
 * @slot media - The card thumbnail / cover media (updates dynamically on slotchange).
 * @slot tag - The tag / stack chips.
 */
export class ArkMediaCard extends LitElement {
  static override properties = {
    category: { type: String },
    dateTime: { attribute: "datetime", type: String },
    href: { type: String },
    summary: { type: String },
    title: { type: String },
    variant: { reflect: true, type: String },
    _hasMedia: { state: true },
  };

  static override styles = css`
    :host {
      display: block;
      height: 100%;
      --_thumb-scale: 1;
    }

    :host(:hover) {
      --_thumb-scale: 1.07;
    }

    ark-card {
      height: 100%;
    }

    .link {
      background: var(--ark-color-background);
      color: inherit;
      cursor: var(--ark-cursor-interactive, pointer);
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

    .media[hidden] {
      display: none;
    }

    slot[name="media"]::slotted(*) {
      transform: scale(var(--_thumb-scale));
      transition: transform 700ms var(--ark-ease-standard);
      width: 100%;
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

    /* Category + date share one metadata line above the title. Wraps rather
       than overflowing when a long category meets a long date on a narrow card. */
    .meta {
      align-items: baseline;
      display: flex;
      flex-wrap: wrap;
      gap: var(--ark-space-2);
      margin: 0 0 var(--ark-space-3);
    }

    .category,
    .date {
      font-family: var(--ark-font-mono);
      font-size: var(--ark-font-size-xs);
      letter-spacing: 0.14em;
      margin: 0;
      text-transform: uppercase;
    }

    .category {
      color: var(--ark-color-accent-strong);
    }

    .date,
    .meta-separator {
      color: var(--ark-color-text-muted);
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
      display: -webkit-box;
      font-family: var(--ark-font-sans);
      font-size: var(--ark-font-size-sm);
      line-height: var(--ark-line-height-relaxed);
      margin: var(--ark-space-3) 0 0;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
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
  /**
   * Machine-readable date, e.g. `2026-07-25T00:00:00.000Z` or `2026-07-25`. The
   * displayed label is derived from it (in UTC — see `dateFormatter`), so
   * callers pass one value rather than keeping a label and a value in sync.
   * Omitted entirely when empty or unparseable.
   */
  dateTime = "";
  href = "";
  summary = "";
  override title = "";
  variant: ArkMediaCardVariant = "featured";

  // Whether any media is projected into the "media" slot. Drives showing the
  // thumbnail region for any variant (so compact listing cards can carry a
  // visual), instead of gating it on the variant alone. Seeded from the light
  // DOM for a flash-free first paint, then kept in sync via @slotchange.
  _hasMedia = false;

  override connectedCallback() {
    super.connectedCallback();
    this._hasMedia = this.querySelector(':scope > [slot="media"]') !== null;
    this.addEventListener("click", this.#forwardClickToLink);
  }

  /**
   * The display label for `dateTime`, or "" when it is absent or not a date the
   * platform can parse — rendering nothing beats rendering "Invalid Date".
   */
  get #dateLabel(): string {
    if (!this.dateTime) return "";
    const parsed = new Date(this.dateTime);
    return Number.isNaN(parsed.getTime()) ? "" : dateFormatter.format(parsed);
  }

  #onMediaSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this._hasMedia = slot.assignedElements().length > 0;
  };

  override disconnectedCallback() {
    this.removeEventListener("click", this.#forwardClickToLink);
    super.disconnectedCallback();
  }

  // The navigating <a> lives in this element's shadow DOM, but the media is
  // projected light-DOM (slotted) content. Slotted nodes are not DOM
  // descendants of the shadow <a>, so a click on the thumbnail has no anchor
  // in its event path — SPA routers (e.g. Astro's ClientRouter, which does
  // `composedPath()[0].closest('a')`) can't see the link and fall back to a
  // full page load (skipping view transitions). Re-dispatch such clicks on the
  // real anchor so they route normally, preserving modifier keys for new-tab.
  #forwardClickToLink = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;

    // Mirror how SPA routers locate the link: the real-DOM `.closest('a')` from
    // the deepest target. Shadow content inside the anchor (and our own
    // re-dispatch) resolves to an anchor here, so we leave it untouched and
    // avoid re-entrancy. Slotted light-DOM media has no anchor ancestor in the
    // real tree — even though it appears under the <a> in the flat tree — so it
    // resolves to null and needs forwarding.
    const target = event.composedPath()[0];
    if (!(target instanceof Element) || target.closest("a, area")) return;

    const link = this.renderRoot.querySelector<HTMLAnchorElement>("a.link");
    if (!link) return;

    event.preventDefault();
    link.dispatchEvent(
      new MouseEvent("click", {
        altKey: event.altKey,
        bubbles: true,
        button: event.button,
        cancelable: true,
        composed: true,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
      }),
    );
  };

  override render() {
    const dateLabel = this.#dateLabel;

    return html`
      <ark-card
        interactive
        variant=${this.variant === "featured" ? "project" : "surface"}
      >
        <a class="link" href=${this.href || "#"}>
          <div class="media" ?hidden=${!this._hasMedia}>
            <slot name="media" @slotchange=${this.#onMediaSlotChange}></slot>
          </div>
          <div class="content">
            <div class="copy">
              ${when(
                this.category || dateLabel,
                () => html`
                  <div class="meta">
                    ${when(
                      this.category,
                      () => html`<p class="category">${this.category}</p>`,
                    )}
                    ${when(
                      this.category && dateLabel,
                      () =>
                        html`<span class="meta-separator" aria-hidden="true"
                          >&middot;</span
                        >`,
                    )}
                    ${when(
                      dateLabel,
                      () =>
                        html`<time class="date" datetime=${this.dateTime}
                          >${dateLabel}</time
                        >`,
                    )}
                  </div>
                `,
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

export const defineArkMediaCard = () => {
  defineArkCard();
  defineElement("ark-media-card", ArkMediaCard);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-media-card": ArkMediaCard;
  }
}
