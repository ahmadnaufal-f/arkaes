import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { tokensOfType, type TokenRow } from "./foundations/tokens-data";

/**
 * One source file per component is the unit that matters here. Counting
 * exported element classes instead would triple-count the multi-part
 * components — `ark-card` alone exports seven elements, `ark-dialog` eight —
 * and report thirty-two components where there are eleven.
 *
 * `import.meta.glob` is resolved by Vite at build time, so these stay correct
 * when a component is added or removed. The `ark-*` pattern excludes helpers
 * that are not elements, such as `components/toast-store.ts`.
 */
const LAYER_FILES = {
  primitives: import.meta.glob("../../../../packages/ui/src/primitives/ark-*.ts"),
  components: import.meta.glob("../../../../packages/ui/src/components/ark-*.ts"),
  patterns: import.meta.glob("../../../../packages/ui/src/patterns/ark-*.ts"),
};

const countFiles = (layer: keyof typeof LAYER_FILES): number =>
  Object.keys(LAYER_FILES[layer]).length;

const COLOR_TOKENS = tokensOfType("color");
const SPACING_TOKENS = tokensOfType("dimension");

/**
 * Primitive ramps, grouped by family: `color.blush-300` -> family `blush`, step
 * 300. Reads the families out of the data rather than naming them, so a fourth
 * ramp would draw itself.
 */
const RAMPS = (() => {
  const families = new Map<string, TokenRow[]>();
  for (const row of COLOR_TOKENS) {
    if (row.tier !== "primitive") continue;
    const match = /^color\.([a-z]+)-\d+$/.exec(row.path);
    if (match === null) continue;
    const family = match[1] as string;
    const existing = families.get(family);
    if (existing) existing.push(row);
    else families.set(family, [row]);
  }
  return [...families.entries()].map(([family, rows]) => ({ family, rows }));
})();

const LAYERS = [
  {
    name: "Tokens",
    count: String(COLOR_TOKENS.length + SPACING_TOKENS.length),
    entry: "@arkaes/tokens",
    body: `Colour and spacing are generated from DTCG sources with Style Dictionary;
      typography, radius, shadow and motion are still hand-authored CSS. Everything
      downstream reads them as ‑‑ark‑* custom properties.`,
  },
  {
    name: "Primitives",
    count: String(countFiles("primitives")),
    entry: "@arkaes/ui/primitives",
    body: `Single-purpose Lit elements — button, chip, badge, input, toggle. Styles are
      inlined in the shadow root and driven entirely by tokens, so a primitive never
      hardcodes a colour or a spacing value.`,
  },
  {
    name: "Components",
    count: String(countFiles("components")),
    entry: "@arkaes/ui/components",
    body: `Compositions with behaviour — card, dialog, accordion, navigation, toast.
      Multi-part components ship as a set of elements plus a namespace object.`,
  },
  {
    name: "Patterns",
    count: String(countFiles("patterns")),
    entry: "@arkaes/ui/patterns",
    body: `Page-level furniture assembled from the layers below it — media card, page
      header, project header.`,
  },
];

const TYPE_FACES = [
  {
    token: "--ark-font-display",
    role: "Display — headings and titles",
    sample: "Considered, quiet interfaces",
    className: "ark-overview-face--display",
  },
  {
    token: "--ark-font-sans",
    role: "Body — running text and UI",
    sample: "Readability first: long measures, generous leading, few weights.",
    className: "ark-overview-face--sans",
  },
  {
    token: "--ark-font-mono",
    role: "Mono — labels, code, metadata",
    sample: "--ark-color-accent",
    className: "ark-overview-face--mono",
  },
];

const IMPORTS = [
  { code: 'import "@arkaes/tokens/css";', note: "Tokens, reset and typography. Load once." },
  { code: 'import "@arkaes/ui/register";', note: "Registers every element." },
  { code: 'import "@arkaes/ui/register/ark-chip";', note: "Registers exactly one." },
  { code: 'import { ChipVariant } from "@arkaes/ui";', note: "Types and enums. No side effects." },
];

const renderRamp = (family: string, rows: TokenRow[]) => html`
  <div class="ark-overview-ramp">
    <span class="ark-overview-ramp__name">${family}</span>
    <div class="ark-overview-ramp__steps">
      ${rows.map(
        (row) => html`
          <span
            class="ark-overview-ramp__step"
            style="background: var(${row.cssProperty});"
            title=${`${row.cssProperty} — ${row.value}`}
          ></span>
        `,
      )}
    </div>
  </div>
`;

// House style is inline `style` attributes; one scoped stylesheet instead, since
// this page has too many repeated elements for that to stay readable. Every
// selector is nested under `.ark-overview` so nothing leaks onto the canvas, and
// every value is an `--ark-*` token.
const styles = html`
  <style>
    .ark-overview {
      background: var(--ark-color-bg);
      color: var(--ark-color-text);
      font-family: var(--ark-font-sans);
      min-height: 100vh;
      padding: clamp(2rem, 5vw, 5rem);
    }
    .ark-overview section + section {
      margin-top: var(--ark-space-16);
    }
    .ark-overview h2 {
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      font-weight: var(--ark-weight-medium);
      letter-spacing: var(--ark-tracking-label);
      margin: 0 0 var(--ark-space-6);
      text-transform: uppercase;
    }
    .ark-overview code {
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
    }
    .ark-overview-masthead h1 {
      font-family: var(--ark-font-display);
      font-size: var(--ark-text-4xl);
      font-weight: var(--ark-weight-thin);
      letter-spacing: var(--ark-tracking-tight);
      line-height: var(--ark-leading-tight);
      margin: var(--ark-space-4) 0 0;
    }
    .ark-overview-lede {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-text-lg);
      line-height: var(--ark-leading-normal);
      margin: var(--ark-space-6) 0 0;
      max-width: var(--ark-measure-sm);
    }
    .ark-overview-facts {
      color: var(--ark-color-text-subtle);
      display: flex;
      flex-wrap: wrap;
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      gap: var(--ark-space-4);
      letter-spacing: var(--ark-tracking-label);
      list-style: none;
      margin: var(--ark-space-8) 0 0;
      padding: 0;
      text-transform: uppercase;
    }
    /* Trailing rather than leading, so a wrap leaves the separator at the end
       of the line — reading as "continues" — instead of orphaning it. */
    .ark-overview-facts li:not(:last-child)::after {
      content: "·";
      margin-left: var(--ark-space-4);
    }
    .ark-overview-grid {
      display: grid;
      gap: var(--ark-space-4);
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    }
    .ark-overview-layer {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-md);
      display: flex;
      flex-direction: column;
      gap: var(--ark-space-3);
      padding: var(--ark-space-5);
    }
    .ark-overview-layer__head {
      align-items: baseline;
      display: flex;
      gap: var(--ark-space-2);
      justify-content: space-between;
    }
    .ark-overview-layer__name {
      font-family: var(--ark-font-display);
      font-size: var(--ark-text-xl);
    }
    .ark-overview-layer__count {
      color: var(--ark-color-text-subtle);
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      white-space: nowrap;
    }
    .ark-overview-layer p {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-text-sm);
      line-height: var(--ark-leading-normal);
      margin: 0;
    }
    .ark-overview-layer code {
      color: var(--ark-color-text-subtle);
    }
    .ark-overview-ramp {
      align-items: center;
      display: flex;
      gap: var(--ark-space-4);
      margin-bottom: var(--ark-space-3);
    }
    .ark-overview-ramp__name {
      color: var(--ark-color-text-subtle);
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      letter-spacing: var(--ark-tracking-label);
      text-transform: uppercase;
      width: 5rem;
    }
    .ark-overview-ramp__steps {
      border-radius: var(--ark-radius-sm);
      /* The 50 and 100 steps sit within a hair of the page background, so
         without an outline the strip looks like it starts a third of the way
         in. Inset so it does not add to the swatch box. */
      box-shadow: inset 0 0 0 1px var(--ark-color-border);
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .ark-overview-ramp__step {
      flex: 1;
      height: 2.5rem;
    }
    .ark-overview-face {
      border-top: 1px solid var(--ark-color-border);
      padding: var(--ark-space-5) 0;
    }
    .ark-overview-face__role {
      color: var(--ark-color-text-subtle);
      display: flex;
      flex-wrap: wrap;
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      gap: var(--ark-space-3);
      margin-bottom: var(--ark-space-3);
    }
    .ark-overview-face--display {
      font-family: var(--ark-font-display);
      font-size: var(--ark-text-3xl);
      font-weight: var(--ark-weight-thin);
      line-height: var(--ark-leading-tight);
    }
    .ark-overview-face--sans {
      font-family: var(--ark-font-sans);
      font-size: var(--ark-text-lg);
      line-height: var(--ark-leading-normal);
      max-width: var(--ark-measure-md);
    }
    .ark-overview-face--mono {
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-md);
      letter-spacing: var(--ark-tracking-label);
    }
    .ark-overview-import {
      align-items: baseline;
      border-bottom: 1px solid var(--ark-color-border);
      display: flex;
      flex-wrap: wrap;
      gap: var(--ark-space-4);
      justify-content: space-between;
      padding: var(--ark-space-3) 0;
    }
    .ark-overview-import span {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-text-sm);
    }
    .ark-overview-demo {
      display: grid;
      gap: var(--ark-space-4);
      max-width: 22rem;
      padding: var(--ark-space-6);
    }
    .ark-overview-demo h3 {
      font-family: var(--ark-font-display);
      font-size: var(--ark-text-xl);
      font-weight: var(--ark-weight-thin);
      margin: 0;
    }
    .ark-overview-demo p {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-text-sm);
      line-height: var(--ark-leading-normal);
      margin: 0;
    }
    .ark-overview-demo__actions {
      display: flex;
      gap: var(--ark-space-3);
    }
  </style>
`;

const renderOverview = () => html`
  ${styles}
  <main class="ark-overview">
    <section class="ark-overview-masthead">
      <ark-badge variant="eyebrow">Design system</ark-badge>
      <h1>Arkaes</h1>
      <p class="ark-overview-lede">
        A readability-first system for a personal portfolio: a warm, deliberately
        light-only palette, a small set of Lit custom elements, and one set of design
        tokens that every surface reads from.
      </p>
      <!-- A list, not a <p>: reset.css caps every paragraph at the reading
           measure, which is right for prose and wrong for a metadata row. -->
      <ul class="ark-overview-facts">
        <li>${COLOR_TOKENS.length} colour tokens</li>
        <li>Light-only by design</li>
        <li>Shadow DOM, no framework</li>
      </ul>
    </section>

    <section>
      <h2>Layers</h2>
      <div class="ark-overview-grid">
        ${LAYERS.map(
          (layer) => html`
            <article class="ark-overview-layer">
              <div class="ark-overview-layer__head">
                <span class="ark-overview-layer__name">${layer.name}</span>
                <span class="ark-overview-layer__count">${layer.count}</span>
              </div>
              <p>${layer.body}</p>
              <code>${layer.entry}</code>
            </article>
          `,
        )}
      </div>
    </section>

    <section>
      <h2>Colour</h2>
      ${RAMPS.map((ramp) => renderRamp(ramp.family, ramp.rows))}
      <p class="ark-overview-lede">
        Three ramps carry the whole palette. Semantic tokens name an intent on top of
        them — <code>--ark-color-accent</code>, <code>--ark-color-border</code> — and are
        what components should actually consume. See <strong>Foundations → Color</strong>
        for every token.
      </p>
    </section>

    <section>
      <h2>Type</h2>
      ${TYPE_FACES.map(
        (face) => html`
          <div class="ark-overview-face">
            <div class="ark-overview-face__role">
              <code>${face.token}</code>
              <span>${face.role}</span>
            </div>
            <div class=${face.className}>${face.sample}</div>
          </div>
        `,
      )}
    </section>

    <section>
      <h2>Using it</h2>
      ${IMPORTS.map(
        (entry) => html`
          <div class="ark-overview-import">
            <code>${entry.code}</code>
            <span>${entry.note}</span>
          </div>
        `,
      )}
    </section>

    <section>
      <h2>In practice</h2>
      <ark-card interactive>
        <div class="ark-overview-demo">
          <ark-chip variant="accent">Case study</ark-chip>
          <h3>Surface container</h3>
          <p>
            Every element here is a real custom element reading the same tokens as the
            swatches above — nothing on this page is a mockup.
          </p>
          <div class="ark-overview-demo__actions">
            <ark-button>View project</ark-button>
            <ark-button variant="ghost" size="sm">Read notes</ark-button>
          </div>
        </div>
      </ark-card>
    </section>
  </main>
`;

const meta = {
  parameters: {
    docs: {
      description: {
        component: `
An introduction to the Arkaes design system — what it is made of and how to consume it, rather than a catalogue of every component. Browse the sidebar for those.

Counts on this page are derived at runtime: colour tokens from the generated DTCG artifact, element counts from the layer barrels. Nothing here is a number someone has to remember to update.
        `,
      },
    },
    layout: "fullscreen",
  },
  render: renderOverview,
  title: "Overview",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Introduction = {} satisfies Story;
