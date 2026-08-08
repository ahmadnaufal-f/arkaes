import { html, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";
import {
  MarkdownHeadingStyle,
  type MarkdownFeatureValue,
  type MarkdownHeadingStyleValue,
  type MarkdownTrustValue,
  normalizeMarkdownFeatures,
  normalizeMarkdownHeadingStyle,
  normalizeMarkdownTrust,
  renderMarkdown,
} from "../markdown";

/**
 * Renders markdown as arkaes prose.
 *
 * Deliberately renders into the **light DOM**. Astro renders a body server-side
 * with `renderMarkdown()` and passes it as children — this element leaves that
 * markup untouched, so long-form pages ship their text in the HTML with no
 * client JavaScript and no flash. Setting `source` instead renders on the
 * client, which is what the streaming chat path uses.
 *
 * Styling comes from `@arkaes/ui/markdown.css`, which the consuming app loads
 * once (a shadow root would be the wrong place for it — see the module docs on
 * `src/markdown/styles.ts`).
 *
 * @summary Markdown body rendered as arkaes prose.
 * @slot - Pre-rendered markdown HTML, when the server did the rendering.
 * @attr {article|section|flat} heading-style - Heading treatment. `article`
 *   emits real h1–h6 with slug ids in the display face; `section` shifts every
 *   level down one and renders a quiet sans subheading; `flat` pins every level
 *   to a single h4. Default `article`.
 * @attr {trusted|untrusted} trust - `untrusted` (the default) escapes raw HTML
 *   to literal text and allowlists every href. Use `trusted` for your own content.
 * @attr {string} features - Comma-separated opt-in syntaxes:
 *   `proof-cards`, `figures`, `glyph-bullets`, `citations`.
 */
export class ArkMarkdown extends LitElement {
  static override properties = {
    features: { type: String },
    headingStyle: { attribute: "heading-style", reflect: true, type: String },
    softBreaks: { attribute: "soft-breaks", type: Boolean },
    source: { type: String },
    trust: { reflect: true, type: String },
  };

  declare source?: string;
  declare softBreaks: boolean;

  private _headingStyle?: MarkdownHeadingStyleValue;
  private _trust?: MarkdownTrustValue;
  private _features: MarkdownFeatureValue[] = [];
  private _serverRendered = false;

  constructor() {
    super();

    this.headingStyle = MarkdownHeadingStyle.Article;
    this.softBreaks = false;
    this.trust = "";
  }

  get headingStyle() {
    return this._headingStyle ?? MarkdownHeadingStyle.Article;
  }

  set headingStyle(value: MarkdownHeadingStyleValue | string) {
    const oldHeadingStyle = this._headingStyle;
    this._headingStyle = normalizeMarkdownHeadingStyle(value);
    this.requestUpdate("headingStyle", oldHeadingStyle);
  }

  get trust() {
    return this._trust ?? normalizeMarkdownTrust("");
  }

  set trust(value: MarkdownTrustValue | string) {
    const oldTrust = this._trust;
    this._trust = normalizeMarkdownTrust(value);
    this.requestUpdate("trust", oldTrust);
  }

  get features(): MarkdownFeatureValue[] {
    return this._features;
  }

  /** Accepts an array, or a comma-separated list so it can be set as an attribute. */
  set features(value: readonly string[] | string | null | undefined) {
    const oldFeatures = this._features;
    const list =
      typeof value === "string" ? value.split(",").map((item) => item.trim()) : (value ?? []);
    this._features = normalizeMarkdownFeatures(list);
    this.requestUpdate("features", oldFeatures);
  }

  // The light DOM is the point: server-rendered prose stays in the page markup
  // and the app's global stylesheet reaches it.
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    // Captured before the first render: children present without a `source` are
    // the server's output, and rendering over them would throw away the markup
    // that search engines and no-JS visitors actually see.
    this._serverRendered = this.source === undefined && this.childNodes.length > 0;
    super.connectedCallback();
  }

  override render() {
    return when(!this._serverRendered && Boolean(this.source), () =>
      html`${unsafeHTML(
        renderMarkdown(this.source ?? "", {
          features: this.features,
          headings: this.headingStyle,
          softBreaks: this.softBreaks,
          trust: this.trust,
        }),
      )}`);
  }
}

export const defineArkMarkdown = () => {
  defineElement("ark-markdown", ArkMarkdown);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-markdown": ArkMarkdown;
  }
}
