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
 * Identity of the header that last wrote {@link PINNED_BOTTOM_PROP}. A page has
 * one header, but ClientRouter navigations overlap two — the incoming one
 * publishes while the outgoing one is still mounted, and without this the
 * outgoing teardown would clear the value its replacement had just written.
 *
 * Each instance's own token stands in for the instance: only identity is ever
 * compared, and holding an element reference here would keep a disconnected
 * header alive for as long as the module is loaded.
 */
let pinnedBottomOwner: symbol | null = null;

/** An element's current translateY in px, 0 when it is not transformed. */
function translateYOf(el: HTMLElement): number {
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === "none") return 0;
  // Absent in a DOM shim; a test environment has no layout to correct for.
  if (typeof DOMMatrixReadOnly === "undefined") return 0;
  try {
    return new DOMMatrixReadOnly(transform).f;
  } catch {
    // An unparseable transform is not worth failing a scroll frame over.
    return 0;
  }
}

/**
 * ArkProjectHeader is the hero header shown at the top of a case study or
 * project detail page. A meta column (eyebrow, tags, title) sits beside a large
 * faded visual watermark.
 *
 * The `visual` slot takes the page thumbnail and the `tag` slot takes the
 * tag/stack chips. `eyebrow` and `heading` are plain-text attributes; a `title`
 * slot can override the heading with custom markup.
 *
 * The hero pins flush with the top of the viewport and collapses its padding
 * once scrolled past. `:host` is `display: contents` so the sticky header's
 * containing block is the page ancestor (e.g. `.cs-page`) rather than the host
 * box, letting it stay pinned across the whole article.
 *
 * The fixed site nav floats over the pinned hero rather than pushing it down —
 * that is what keeps article text from scrolling through the gap between the
 * two while ark-navigation is in its see-through immersive state — so the hero
 * reserves room for the chrome as start padding instead of as a stick offset.
 * Both are configurable: `--ark-project-header-chrome-clearance` and
 * `--ark-project-header-stick-top`.
 *
 * While pinned it publishes its bottom edge on `:root` as
 * `--ark-project-header-pinned-bottom` (`0px` when not pinned) so page CSS can
 * keep in-page scrolling clear of it. That edge is the one the header rests at,
 * transform excluded — see `_chromeTravel`.
 *
 * The pinned hero travels with the site chrome instead of sitting under a gap
 * where it used to be: while `ark-navigation` has its immersive pills tucked
 * away mid-scroll it publishes `--ark-nav-chrome-away: 1`, and the hero rides up
 * by the clearance it holds for those pills, less its own end padding so the
 * travelled header stays evenly padded. The reader gets that band back until
 * scrolling stops. Pages without an immersive header never see the flag and
 * never move.
 *
 * @summary Sticky project / case-study header.
 * @slot visual - The page thumbnail / watermark visual.
 * @slot title - Overrides the `heading` attribute with custom markup.
 * @slot tag - The tag / stack chips.
 * @cssprop [--ark-project-header-stick-top=0px] - Offset from the top when pinned.
 * @cssprop [--ark-project-header-chrome-clearance=76px] - Room held at the top
 *   of the hero for the fixed nav that floats over it.
 * @cssprop [--ark-project-header-title-lines=2] - Lines the title may run to
 *   while pinned before it is ellipsised. Unpinned it is never clamped.
 */
export class ArkProjectHeader extends LitElement {
  static override properties = {
    eyebrow: { type: String },
    heading: { type: String, attribute: "heading" },
  };

  eyebrow = "";
  heading = "";

  /** This instance's stand-in for `this` in {@link pinnedBottomOwner}. */
  private readonly _ownerToken = Symbol("ark-project-header");

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
      /* Pinned flush with the top of the page rather than under the nav: the
         nav is see-through in its immersive small-screen state, and parking the
         hero below it left a band of article text scrolling between the two.
         The clearance below is what keeps the title out from under the chrome. */
      --_stick-top: var(--ark-project-header-stick-top, 0px);
      /* Room reserved at the top of the hero for the fixed site chrome that
         floats over it — the condensed nav bar (60px) and, on small screens,
         ark-navigation's immersive floating row (68px) — plus breathing room.
         The scrim under that row fades out at its own bottom edge, so the title
         only has to clear the row itself, not the gradient. */
      --_chrome-clearance: var(--ark-project-header-chrome-clearance, 76px);
      /* 1 while ark-navigation has tucked its immersive pills away mid-scroll,
         0 otherwise; 0 on a page whose header never goes immersive, or has no
         ark-navigation at all. Multiplied into the travel below rather than
         branched on, since a custom property cannot be tested in a selector. */
      --_chrome-away: var(--ark-nav-chrome-away, 0);
      /* The pinned hero's end padding. Named because the travel below is
         measured against it. */
      --_stuck-padding-end: var(--ark-space-5);
      /* How far the pinned hero rides up while the pills are away. The
         clearance is room held for chrome that is no longer there, so it is
         what there is to reclaim — but not all of it: stopping short by the
         hero's own end padding leaves the title in a band matching the one
         under it, so the travelled header reads as evenly padded rather than
         as a title shoved against the top edge. */
      --_chrome-travel: calc(
        var(--_chrome-away) *
          (var(--_chrome-clearance) - var(--_stuck-padding-end))
      );
      /* Applied only while pinned: past this many lines the header eats the
         reading area it is supposed to be labelling. */
      --_title-lines: var(--ark-project-header-title-lines, 2);
      /* Floor for the unstuck hero. It exists to give the slotted visual room;
         a consumer that slots no visual (the blog does not) is left with that
         much empty space under the title, so it is tunable. */
      --_min-height: var(--ark-project-header-min-height, 240px);
    }

    /* Zero-height marker in normal flow, sitting exactly on the hero's top
       edge: once its bottom passes the top of the viewport the hero has reached
       its stick offset, which is the moment to mark it "stuck". */
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
      /* The start padding carries the chrome clearance in both states — pinned
         at the top of the viewport, the hero slides under the nav, so the gap
         has to come from inside the hero rather than from a sticky offset. */
      padding-block: calc(var(--_chrome-clearance) + var(--ark-space-2)) 36px;
      padding-inline: var(--site-content-padding);
      position: sticky;
      top: var(--_stick-top);
      z-index: 10;
      transition:
        padding var(--ark-duration-slow) var(--ark-ease-standard),
        min-height var(--ark-duration-slow) var(--ark-ease-standard),
        /* Not the slow duration the collapse uses: this one has to leave and
           arrive with the nav pills, so it borrows their timing exactly. */
        transform var(--ark-duration-normal) var(--ark-ease-standard);
    }

    /* Stuck: collapse the vertical padding (and the min-height so the shrink is
       actually visible) for a compact, pinned header.

       Only the pinned hero travels. Unpinned it is the top of the page rather
       than chrome sitting over the article, so there is no clearance to reclaim
       and nothing above it to move with. */
    .hero.is-stuck {
      min-height: 0;
      padding-block: var(--_chrome-clearance) var(--_stuck-padding-end);
      box-shadow: var(--ark-shadow-md);
      transform: translateY(calc(-1 * var(--_chrome-travel)));
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

    /* Label then a rule running to the end of the row — the same treatment as
       ark-badge's eyebrow variant and the homepage section headers. */
    .eyebrow {
      align-items: center;
      color: var(--ark-color-accent-strong);
      display: flex;
      font-family: var(--ark-font-mono);
      font-size: 0.6rem;
      gap: 20px;
      letter-spacing: 0.16em;
      margin-bottom: 20px;
      text-transform: uppercase;
    }

    .eyebrow::after {
      background: currentColor;
      content: "";
      flex: 1;
      height: 1px;
      opacity: 0.38;
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
      font-weight: var(--ark-weight-medium);
      line-height: 1.12;
      margin: 0;
    }

    /* Only the pinned header clamps the title. Unstuck it is the top of the
       page and can afford however many lines the title runs to; pinned it is a
       label sitting on top of the article, and past --_title-lines it starts
       eating the reading area it is supposed to be labelling.

       The -webkit- prefixed box is the only form of line-clamp with universal
       support. The text stays whole in the DOM, so the accessible name and the
       page's h1 are unaffected by what the box hides.

       The end padding is for descenders: the clamp clips at the padding box, and
       a g/y/j/q/p on the last line hangs below its line box, which a 1.12
       line-height leaves no room for. In em so it tracks the responsive size. */
    .hero.is-stuck .title,
    .hero.is-stuck ::slotted([slot="title"]) {
      display: -webkit-box;
      overflow: hidden;
      padding-block-end: 0.16em;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: var(--_title-lines);
    }

    /* ── Responsive ─────────────────────────────────────────────────── */
    @media (max-width: 860px) {
      .hero {
        min-height: 200px;
        padding-block: calc(var(--_chrome-clearance) + var(--ark-space-2))
          var(--ark-space-5);
      }

      .hero.is-stuck {
        padding-block: var(--_chrome-clearance) var(--ark-space-3);
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

  // How far (px) the page scrolls past the hero's flow position before the
  // collapse engages. The hero pins at the very top of the viewport, and on
  // these pages it starts there, so it is pinned from the first frame — this
  // distance is what separates "at the top of the article" from "reading it",
  // and it is the collapse, not the pinning, that it gates.
  private static readonly _COLLAPSE_AFTER = 60;

  // Hysteresis band (px). Having engaged, the collapse only releases once the
  // page has scrolled back up through this band. The dead-zone between the two
  // thresholds stops the state flickering when a smooth-scroll library (Lenis)
  // oscillates by sub-pixels around the threshold — each flip would otherwise
  // restart the collapse transition and make the header jiggle.
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
    if (pinnedBottomOwner === this._ownerToken) {
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
    const bottom = this._stuck ? this._restingBottom(this._hero) : 0;
    if (
      bottom === this._publishedPinnedBottom &&
      pinnedBottomOwner === this._ownerToken
    ) {
      return;
    }

    this._publishedPinnedBottom = bottom;
    pinnedBottomOwner = this._ownerToken;
    document.documentElement.style.setProperty(
      PINNED_BOTTOM_PROP,
      `${bottom}px`,
    );
  };

  /**
   * The hero's bottom edge with the mid-scroll chrome travel taken back out, so
   * the published edge is where the header comes to rest rather than where it
   * happens to be while the page is moving. That travel ends on the nav's settle
   * timer, with no scroll event behind it to publish again, so an edge sampled
   * mid-travel would stand uncorrected and a consumer offsetting against it
   * would park content under the header once it settled back.
   *
   * The offset is read off the computed transform rather than recomputed from
   * the clearance: that is exact whatever unit the clearance is authored in, and
   * mid-transition it carries the same offset the rect already has, so the two
   * cancel wherever in the travel it is sampled.
   */
  private _restingBottom(hero: HTMLElement): number {
    return Math.round(hero.getBoundingClientRect().bottom - translateYOf(hero));
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

    // The sentinel is not sticky, so its bottom edge tracks the hero's flow
    // position: it goes negative by exactly the distance scrolled past it.
    const bottom = this._sentinel.getBoundingClientRect().bottom;
    const engageAt = -ArkProjectHeader._COLLAPSE_AFTER;
    if (!this._stuck && bottom <= engageAt) {
      this._stuck = true;

      const thumbnail = this.querySelector('[slot="visual"]');
      if (thumbnail && this._visualEl) {
        const naturalH = thumbnail.getBoundingClientRect().height;
        const scale = naturalH > 0 && naturalH > 160 ? 160 / naturalH : 1;
        this._visualEl.style.setProperty("--_visual-scale", String(scale));
        this._visualEl.style.setProperty("--_visual-collapsed-h", "160px");
      }

      this._hero.classList.add("is-stuck");
    } else if (
      this._stuck &&
      bottom > engageAt + ArkProjectHeader._UNSTICK_BAND
    ) {
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
