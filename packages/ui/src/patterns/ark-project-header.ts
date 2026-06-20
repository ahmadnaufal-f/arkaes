import { css, html, LitElement } from "lit";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";

/**
 * ArkProjectHeader is the hero header shown at the top of a case study or
 * project detail page. A meta column (eyebrow, tags, title) sits beside a large
 * faded visual watermark.
 *
 * The `visual` slot takes the page thumbnail and the `tag` slot takes the
 * tag/stack chips. `eyebrow` and `heading` are plain-text attributes; a `title`
 * slot can override the heading with custom markup.
 *
 * The hero pins to the top of the viewport and collapses its padding once
 * scrolled past. `:host` is `display: contents` so the sticky header's
 * containing block is the page ancestor (e.g. `.cs-page`) rather than the host
 * box, letting it stay pinned across the whole article. The stick offset is
 * configurable via the `--ark-project-header-stick-top` custom property.
 */
export class ArkProjectHeader extends LitElement {
  static override properties = {
    eyebrow: { type: String },
    heading: { type: String, attribute: "heading" },
  };

  eyebrow = "";
  heading = "";

  private _sentinel: HTMLElement | null = null;
  private _hero: HTMLElement | null = null;
  private _stuck = false;
  private _ticking = false;

  static override styles = css`
    :host {
      display: contents;
      --_stick-top: var(--ark-project-header-stick-top, 60px);
    }

    /* Spacer in normal flow above the hero that the IntersectionObserver
       watches. Its height matches the stick offset so (a) the hero pins with no
       jump and (b) once this spacer scrolls fully past the top of the viewport,
       the hero is pinned and we mark it "stuck". */
    .sentinel {
      display: block;
      height: var(--_stick-top);
    }

    .hero {
      align-items: center;
      background: var(--ark-color-background);
      display: flex;
      flex-direction: row-reverse;
      gap: 80px;
      min-height: 240px;
      overflow: hidden;
      padding-block: 100px;
      padding-inline: var(--site-content-padding);
      position: sticky;
      top: var(--_stick-top);
      z-index: 10;
      transition:
        padding-block var(--ark-duration-slow) var(--ark-ease-standard),
        min-height var(--ark-duration-slow) var(--ark-ease-standard);
    }

    /* Stuck: collapse the vertical padding (and the min-height so the shrink is
       actually visible) for a compact, pinned header. */
    .hero.is-stuck {
      min-height: 0;
      padding-block: 20px;
      box-shadow: var(--ark-shadow-md);
    }

    /* Visual illustration: a faint, background-less watermark beside the meta. */
    .visual {
      --thumbnail-background: none;
      --thumbnail-height: 100%;
      flex: 1;
      pointer-events: none;
    }

    /* The faded opacity must live on the thumbnail itself — the element that
       carries the view-transition-name — not on this wrapper. A named element
       is snapshotted without its ancestors' effects, so wrapper opacity is
       dropped during the transition (causing a hard jump at the end). Applied
       to the named element it is baked into the snapshot and cross-fades
       smoothly. */
    ::slotted([slot="visual"]) {
      opacity: 0.5;
    }

    .meta {
      display: flex;
      flex-direction: column;
      max-width: 920px;
      position: relative;
      width: 100%;
    }

    /* Eyebrow + tags collapse away when the hero is stuck. The grid-rows
       1fr → 0fr trick animates the height smoothly (alongside the fade) and
       reclaims the space so the pinned header stays compact. */
    .meta-collapse {
      display: grid;
      grid-template-rows: 1fr;
      transition:
        grid-template-rows var(--ark-duration-slow) var(--ark-ease-standard),
        opacity var(--ark-duration-slow) var(--ark-ease-standard);
    }

    .meta-collapse-inner {
      min-height: 0;
      overflow: hidden;
    }

    .hero.is-stuck .meta-collapse {
      grid-template-rows: 0fr;
      opacity: 0;
    }

    .eyebrow {
      color: var(--ark-color-accent-strong);
      font-family: var(--ark-font-mono);
      font-size: 0.6rem;
      letter-spacing: 0.16em;
      margin-bottom: 20px;
      text-transform: uppercase;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 24px;
    }

    .title,
    ::slotted([slot="title"]) {
      color: var(--ark-color-text);
      display: -webkit-box;
      font-family: var(--ark-font-display);
      font-size: clamp(1.8rem, 3vw, 2.8rem);
      font-weight: var(--ark-weight-thin);
      line-height: 1.12;
      margin: 0;
      overflow: hidden;
      /* Cap the title at three lines so an unexpectedly long heading can't push
         the hero out of proportion on narrow screens. */
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }

    /* ── Responsive ─────────────────────────────────────────────────── */
    @media (max-width: 860px) {
      .hero {
        min-height: 320px;
        padding-block: 72px 56px;
      }

      .hero.is-stuck {
        padding-block: 10px;
      }

      .visual {
        display: none;
      }
    }

    @media (max-width: 520px) {
      .meta {
        padding: 32px 20px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .hero,
      .meta-collapse {
        transition: none;
      }
    }
  `;

  // Hysteresis band (px). The stuck state engages when the sentinel's bottom
  // edge reaches the viewport top and only releases once it has scrolled back
  // down past this band. The dead-zone between the two thresholds stops the
  // state flickering when a smooth-scroll library (Lenis) oscillates by
  // sub-pixels around the pin point — each flip would otherwise restart the
  // collapse transition and make the header jiggle.
  private static readonly _UNSTICK_BAND = 24;

  override connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this._setupStick();
  }

  protected override firstUpdated() {
    this._setupStick();
  }

  override disconnectedCallback() {
    window.removeEventListener("scroll", this._onScroll);
    this._restoreScrollAnchoring();
    this._sentinel = null;
    this._hero = null;
    super.disconnectedCallback();
  }

  private _setupStick() {
    this._sentinel = this.renderRoot.querySelector<HTMLElement>(".sentinel");
    this._hero = this.renderRoot.querySelector<HTMLElement>(".hero");
    if (!this._sentinel || !this._hero) return;

    this._disableScrollAnchoring();
    window.removeEventListener("scroll", this._onScroll);
    window.addEventListener("scroll", this._onScroll, { passive: true });
    this._update();
  }

  // Collapsing the pinned hero shrinks its in-flow box above the viewport. With
  // native scroll anchoring on (the default), the browser would compensate by
  // shifting the scroll position to keep visible content stable — and that shift
  // moves the sentinel back across the stuck threshold, creating a feedback loop
  // that flips the stuck state on and off. Disabling anchoring while the header
  // is mounted lets the content follow the collapse smoothly instead.
  private _anchoredRoot: HTMLElement | null = null;

  private _disableScrollAnchoring() {
    if (this._anchoredRoot) return;
    const root = document.documentElement;
    root.style.setProperty("overflow-anchor", "none");
    this._anchoredRoot = root;
  }

  private _restoreScrollAnchoring() {
    this._anchoredRoot?.style.removeProperty("overflow-anchor");
    this._anchoredRoot = null;
  }

  // Coalesce scroll events into one read per frame.
  private _onScroll = () => {
    if (this._ticking) return;
    this._ticking = true;
    requestAnimationFrame(this._update);
  };

  private _update = () => {
    this._ticking = false;
    if (!this._sentinel || !this._hero) return;

    const bottom = this._sentinel.getBoundingClientRect().bottom;
    if (!this._stuck && bottom <= 0) {
      this._stuck = true;
      this._hero.classList.add("is-stuck");
    } else if (this._stuck && bottom > ArkProjectHeader._UNSTICK_BAND) {
      this._stuck = false;
      this._hero.classList.remove("is-stuck");
    }
  };

  override render() {
    const hasTitleSlot = !!this.querySelector('[slot="title"]');

    return html`
      <span class="sentinel" aria-hidden="true"></span>
      <header class="hero" part="hero">
        <div class="visual">
          <slot name="visual"></slot>
        </div>

        <div class="meta">
          <div class="meta-collapse">
            <div class="meta-collapse-inner">
              ${when(
                this.eyebrow,
                () => html`<div class="eyebrow">${this.eyebrow}</div>`,
              )}
              <div class="tags">
                <slot name="tag"></slot>
              </div>
            </div>
          </div>
          ${when(
            hasTitleSlot,
            () => html`<slot name="title"></slot>`,
            () => html`<h1 class="title">${this.heading}</h1>`,
          )}
        </div>
      </header>
    `;
  }
}

export const defineArkProjectHeader = () => {
  defineElement("ark-project-header", ArkProjectHeader);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-project-header": ArkProjectHeader;
  }
}
