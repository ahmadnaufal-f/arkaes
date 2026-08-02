import { css, html, LitElement } from "lit";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";

/**
 * Custom property published on `:root` carrying the viewport-relative bottom
 * edge of the pinned hero (`0px` while it is not pinned). Page CSS offsets
 * in-page scrolling against it — see `_publishPinnedBottom`.
 */
const PINNED_BOTTOM_PROP = "--ark-project-header-pinned-bottom";

/**
 * The header that last wrote {@link PINNED_BOTTOM_PROP}. A page has one header,
 * but ClientRouter navigations overlap two — the incoming one publishes while the
 * outgoing one is still mounted, and without this the outgoing teardown would
 * clear the value its replacement had just written.
 */
let pinnedBottomOwner: ArkProjectHeader | null = null;

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
 *
 * While pinned it publishes its bottom edge on `:root` as
 * `--ark-project-header-pinned-bottom` (`0px` when not pinned) so page CSS can
 * keep in-page scrolling clear of it.
 *
 * @summary Sticky project / case-study header.
 * @slot visual - The page thumbnail / watermark visual.
 * @slot title - Overrides the `heading` attribute with custom markup.
 * @slot tag - The tag / stack chips.
 * @cssprop --ark-project-header-stick-top - Offset from the top when pinned.
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
  private _visualEl: HTMLElement | null = null;
  private _stuck = false;
  private _ticking = false;
  private _heroResize: ResizeObserver | null = null;
  private _publishedPinnedBottom = -1;

  static override styles = css`
    :host {
      display: contents;
      --_stick-top: var(--ark-project-header-stick-top, 60px);
      /* Floor for the unstuck hero. It exists to give the slotted visual room;
         a consumer that slots no visual (the blog does not) is left with that
         much empty space under the title, so it is tunable. */
      --_min-height: var(--ark-project-header-min-height, 240px);
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
      min-height: var(--_min-height);
      overflow: hidden;
      padding-block: 36px;
      padding-inline: var(--site-content-padding);
      position: sticky;
      top: var(--_stick-top);
      z-index: 10;
      transition:
        padding var(--ark-duration-slow) var(--ark-ease-standard),
        min-height var(--ark-duration-slow) var(--ark-ease-standard);
    }

    /* Stuck: collapse the vertical padding (and the min-height so the shrink is
       actually visible) for a compact, pinned header. */
    .hero.is-stuck {
      min-height: 0;
      padding-block: 40px 20px;
      box-shadow: var(--ark-shadow-md);
    }

    /* Visual illustration: a faint, background-less watermark beside the meta. */
    .visual {
      --thumbnail-background: none;
      --thumbnail-height: 100%;
      flex: 1;
      pointer-events: none;
      height: var(--_visual-collapsed-h, auto);
      transition: height var(--ark-duration-slow) var(--ark-ease-standard);
    }

    /* The faded opacity must live on the thumbnail itself — the element that
       carries the view-transition-name — not on this wrapper. A named element
       is snapshotted without its ancestors' effects, so wrapper opacity is
       dropped during the transition (causing a hard jump at the end). Applied
       to the named element it is baked into the snapshot and cross-fades
       smoothly. */
    ::slotted([slot="visual"]) {
      opacity: 0.5;
      transform: scale(var(--_visual-scale, 1));
      transform-origin: center;
      transition: transform var(--ark-duration-slow) var(--ark-ease-standard);
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
      font-family: var(--ark-font-display);
      font-size: clamp(1.8rem, 3vw, 2.8rem);
      font-weight: var(--ark-weight-thin);
      line-height: 1.12;
      margin: 0;
    }

    /* ── Responsive ─────────────────────────────────────────────────── */
    @media (max-width: 860px) {
      .hero {
        min-height: 200px;
        padding-block: 24px 20px;
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
        padding: 12px;
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
    this._heroResize?.disconnect();
    this._heroResize = null;
    if (pinnedBottomOwner === this) {
      document.documentElement.style.removeProperty(PINNED_BOTTOM_PROP);
      pinnedBottomOwner = null;
    }
    this._publishedPinnedBottom = -1;
    this._sentinel = null;
    this._hero = null;
    super.disconnectedCallback();
  }

  private _setupStick() {
    this._sentinel = this.renderRoot.querySelector<HTMLElement>(".sentinel");
    this._hero = this.renderRoot.querySelector<HTMLElement>(".hero");
    this._visualEl = this.renderRoot.querySelector<HTMLElement>(".visual");
    if (!this._sentinel || !this._hero) return;

    this._disableScrollAnchoring();
    window.removeEventListener("scroll", this._onScroll);
    window.addEventListener("scroll", this._onScroll, { passive: true });

    // Scrolling alone doesn't tell us the hero's height: it collapses over a
    // transition once stuck, and reflows on resize or when the title rewraps.
    // Observing it keeps the published edge honest between scroll frames.
    this._heroResize?.disconnect();
    this._heroResize = new ResizeObserver(this._publishPinnedBottom);
    this._heroResize.observe(this._hero);

    this._update();
  }

  /**
   * Publish the pinned hero's bottom edge on `:root` so page CSS can scroll
   * content clear of it — `ark-accordion`'s `auto-scroll-when-expanded` on a case
   * study would otherwise park a trigger underneath the header. No stylesheet
   * could hardcode this: the collapsed hero measures ~220px with the visual
   * watermark, ~52px once the visual is dropped below 860px, and more again when
   * the title wraps. `0px` while unpinned leaves consumers on their own floor.
   */
  private _publishPinnedBottom = () => {
    if (!this._hero) return;
    const bottom = this._stuck
      ? Math.round(this._hero.getBoundingClientRect().bottom)
      : 0;
    if (bottom === this._publishedPinnedBottom && pinnedBottomOwner === this) {
      return;
    }

    this._publishedPinnedBottom = bottom;
    pinnedBottomOwner = this;
    document.documentElement.style.setProperty(
      PINNED_BOTTOM_PROP,
      `${bottom}px`,
    );
  };

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

      const thumbnail = this.querySelector('[slot="visual"]');
      if (thumbnail && this._visualEl) {
        const naturalH = thumbnail.getBoundingClientRect().height;
        const scale = naturalH > 0 && naturalH > 160 ? 160 / naturalH : 1;
        this._visualEl.style.setProperty("--_visual-scale", String(scale));
        this._visualEl.style.setProperty("--_visual-collapsed-h", "160px");
      }

      this._hero.classList.add("is-stuck");
    } else if (this._stuck && bottom > ArkProjectHeader._UNSTICK_BAND) {
      this._stuck = false;
      this._visualEl?.style.removeProperty("--_visual-scale");
      this._visualEl?.style.removeProperty("--_visual-collapsed-h");
      this._hero.classList.remove("is-stuck");
    }

    // Pinning is a position change, not a size change, so the ResizeObserver
    // does not see it — publish from the scroll frame too.
    this._publishPinnedBottom();
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
