import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, nothing, type TemplateResult } from "lit";
import { findDrift, groupByTier, tokensOfType, type TokenRow } from "./tokens-data";

interface ColorTokensArgs {
  filter: string;
  tier: string;
}

const COLOR_TOKENS = tokensOfType("color");
const GROUPS = groupByTier(COLOR_TOKENS);
// Options come from the data, so a new tier directory appears in the dropdown
// without an edit here.
const TIER_OPTIONS = ["all", ...GROUPS.map((group) => group.tier)];

const matches = (row: TokenRow, filter: string): boolean => {
  const needle = filter.trim().toLowerCase();
  if (needle === "") return true;
  return [row.path, row.cssProperty, row.value, row.reference, row.description].some(
    (field) => field !== undefined && field.toLowerCase().includes(needle),
  );
};

/**
 * Copy the `var()` reference rather than the raw value: in this system that is
 * the thing you actually paste into CSS, and copying a hex would encourage the
 * hardcoding CLAUDE.md forbids.
 */
const copy = (event: Event, text: string) => {
  const button = event.currentTarget;
  if (!(button instanceof HTMLButtonElement)) return;
  void navigator.clipboard?.writeText(text).then(() => {
    button.dataset.copied = "";
    setTimeout(() => delete button.dataset.copied, 1200);
  });
};

// The chip renders from the CSS custom property, not from the JSON value, so it
// exercises the real custom-property chain a consumer would write — including
// the `var()` indirection `outputReferences` produces. The value column prints
// the JSON copy, so if the two generated artifacts ever disagree the row shows
// it side by side.
const renderChip = (row: TokenRow) => html`
  <span class="ark-token-chip" aria-hidden="true">
    <span class="ark-token-chip__fill" style="background: var(${row.cssProperty});"></span>
  </span>
`;

const renderRow = (row: TokenRow) => html`
  <tr>
    <td class="ark-token-cell--chip">${renderChip(row)}</td>
    <th scope="row"><code>${row.cssProperty}</code></th>
    <td><code>${row.value}</code></td>
    <td>
      ${row.reference
        ? html`<code class="ark-token-alias">${row.reference}</code>`
        : html`<span aria-hidden="true">—</span
            ><span class="ark-token-sr-only">no alias</span>`}
    </td>
    <td class="ark-token-cell--description">
      ${row.description ?? html`<span aria-hidden="true">—</span>`}
    </td>
    <td>
      <button
        type="button"
        class="ark-token-copy"
        aria-label=${`Copy var(${row.cssProperty})`}
        @click=${(event: Event) => copy(event, `var(${row.cssProperty})`)}
      >
        Copy
      </button>
    </td>
  </tr>
`;

const renderGroup = (tier: string, rows: TokenRow[]) => html`
  <section class="ark-token-section">
    <h2 class="ark-token-heading">${tier} <span class="ark-token-count">${rows.length}</span></h2>
    <table class="ark-token-table">
      <thead>
        <tr>
          <th scope="col"><span class="ark-token-sr-only">Swatch</span></th>
          <th scope="col">Token</th>
          <th scope="col">Value</th>
          <th scope="col">Alias</th>
          <th scope="col">Description</th>
          <th scope="col"><span class="ark-token-sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(renderRow)}
      </tbody>
    </table>
  </section>
`;

const renderDrift = () => {
  const drift = findDrift(COLOR_TOKENS, "color");
  if (drift === null) return nothing;
  if (drift.missingInJson.length === 0 && drift.missingInCss.length === 0) return nothing;

  return html`
    <div class="ark-token-drift" role="status">
      <strong>Token drift detected.</strong>
      ${drift.missingInJson.length > 0
        ? html`<p>
            Declared in CSS but absent from the generated JSON, so they are missing from the
            list below — likely hand-authored into
            <code>packages/tokens/src/styles/tokens.css</code> instead of the DTCG sources:
            <code>${drift.missingInJson.join(", ")}</code>
          </p>`
        : nothing}
      ${drift.missingInCss.length > 0
        ? html`<p>
            In the generated JSON but never declared in CSS — the generated stylesheet is
            stale. Run <code>pnpm --filter @arkaes/tokens generate</code>:
            <code>${drift.missingInCss.join(", ")}</code>
          </p>`
        : nothing}
    </div>
  `;
};

// House style is inline `style` attributes, which suits a handful of elements
// but would mean several hundred duplicated attributes across this table. One
// scoped stylesheet instead: every selector is nested under `.ark-token-page`
// so nothing leaks onto the canvas, and every value is an `--ark-*` token. The
// swatch fill is the sole exception — it *is* the token value.
const styles = html`
  <style>
    .ark-token-page {
      background: var(--ark-color-bg);
      color: var(--ark-color-text);
      font-family: var(--ark-font-sans);
      min-height: 100vh;
      padding: var(--ark-space-8);
    }
    .ark-token-page code {
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
    }
    .ark-token-sr-only {
      clip-path: inset(50%);
      height: 1px;
      overflow: hidden;
      position: absolute;
      white-space: nowrap;
      width: 1px;
    }
    .ark-token-intro {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-text-sm);
      margin-bottom: var(--ark-space-8);
      max-width: var(--ark-measure-md);
    }
    .ark-token-totals {
      color: var(--ark-color-text-subtle);
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      letter-spacing: var(--ark-tracking-label);
      margin-bottom: var(--ark-space-8);
      text-transform: uppercase;
    }
    .ark-token-drift {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-danger);
      border-radius: var(--ark-radius-sm);
      font-size: var(--ark-text-sm);
      margin-bottom: var(--ark-space-8);
      padding: var(--ark-space-4);
    }
    .ark-token-section {
      margin-bottom: var(--ark-space-10);
    }
    .ark-token-heading {
      align-items: center;
      display: flex;
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      font-weight: var(--ark-weight-medium);
      gap: var(--ark-space-2);
      letter-spacing: var(--ark-tracking-label);
      margin-bottom: var(--ark-space-4);
      text-transform: uppercase;
    }
    .ark-token-count {
      background: var(--ark-color-surface-soft);
      border-radius: var(--ark-radius-full);
      color: var(--ark-color-text-subtle);
      padding: 0 var(--ark-space-2);
    }
    .ark-token-table {
      border-collapse: collapse;
      width: 100%;
    }
    .ark-token-table th,
    .ark-token-table td {
      border-bottom: 1px solid var(--ark-color-border);
      padding: var(--ark-space-2) var(--ark-space-3);
      text-align: left;
      vertical-align: middle;
    }
    .ark-token-table thead th {
      color: var(--ark-color-text-subtle);
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      font-weight: var(--ark-weight-regular);
      letter-spacing: var(--ark-tracking-label);
      text-transform: uppercase;
    }
    /* The token name is the row's identifier and gets copied by hand — breaking
       it across lines mid-word makes it unreadable. */
    .ark-token-table tbody th {
      font-weight: var(--ark-weight-regular);
      white-space: nowrap;
    }
    .ark-token-cell--chip {
      width: 5rem;
    }
    .ark-token-cell--description {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-text-sm);
    }
    .ark-token-alias {
      color: var(--ark-color-text-subtle);
    }
    /* Alpha tokens (--ark-color-border is neutral-700 at 22%) are meaningless
       over a flat backdrop, so every chip sits on a checkerboard — every chip,
       not just the transparent ones, because which tokens carry alpha is not
       something this story should have to know. Coincident gradient stops keep
       the squares hard-edged with no interpolation band. */
    .ark-token-chip {
      background-color: var(--ark-color-neutral-0);
      background-image: conic-gradient(
        var(--ark-color-neutral-200) 0deg 90deg,
        transparent 90deg 180deg,
        var(--ark-color-neutral-200) 180deg 270deg,
        transparent 270deg 360deg
      );
      background-size: 12px 12px;
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-xs);
      display: block;
      height: 2.5rem;
      overflow: hidden;
      width: 4rem;
    }
    .ark-token-chip__fill {
      display: block;
      height: 100%;
      width: 100%;
    }
    .ark-token-copy {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-xs);
      color: var(--ark-color-text-muted);
      cursor: var(--ark-cursor-interactive);
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      padding: var(--ark-space-1) var(--ark-space-2);
      transition: color var(--ark-duration-fast) var(--ark-ease-standard);
    }
    .ark-token-copy:hover {
      color: var(--ark-color-text);
    }
    .ark-token-copy[data-copied]::after {
      content: "ed";
    }
    .ark-token-copy[data-copied] {
      color: var(--ark-color-secondary);
    }
    .ark-token-empty {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-text-sm);
      padding: var(--ark-space-6) 0;
    }
  </style>
`;

const renderColorTokens = ({ filter, tier }: ColorTokensArgs): TemplateResult => {
  const visible = GROUPS.filter((group) => tier === "all" || group.tier === tier)
    .map((group) => ({ ...group, rows: group.rows.filter((row) => matches(row, filter)) }))
    .filter((group) => group.rows.length > 0);
  const shown = visible.reduce((total, group) => total + group.rows.length, 0);

  return html`
    ${styles}
    <div class="ark-token-page">
      <p class="ark-token-intro">
        Every color token in <code>@arkaes/tokens</code>, read from the generated DTCG
        artifact — the same source the CSS custom properties are built from, so this list
        cannot drift from the tokens themselves.
      </p>
      <p class="ark-token-totals">
        ${shown} of ${COLOR_TOKENS.length} shown ·
        ${GROUPS.map((group) => `${group.rows.length} ${group.tier}`).join(" · ")}
      </p>
      ${renderDrift()}
      ${visible.length === 0
        ? html`<p class="ark-token-empty">No color token matches “${filter}”.</p>`
        : visible.map((group) => renderGroup(group.tier, group.rows))}
    </div>
  `;
};

const meta = {
  argTypes: {
    filter: { control: "text" },
    tier: { control: "select", options: TIER_OPTIONS },
  },
  args: {
    filter: "",
    tier: "all",
  },
  parameters: {
    docs: {
      description: {
        component: `
Every color token in the system, generated from the DTCG sources in \`packages/tokens/tokens/\` rather than hand-listed — a token added there shows up here with no edit to this story.

Colors are authored in three tiers. **Primitive** tokens are the raw ramps (\`blush\`, \`sage\`, \`neutral\`); **semantic** tokens name an intent (\`--ark-color-accent\`, \`--ark-color-border\`) and are the ones components should consume; **component** tokens are legacy aliases kept so existing portfolio and UI code keeps working. Reach for a semantic token first — a primitive in component CSS is usually a missing semantic token.

The swatch renders from \`var(--ark-color-*)\` while the value column prints the JSON copy, so the two generated artifacts are cross-checked on every row. Every swatch sits on a checkerboard because some tokens carry alpha (\`--ark-color-border\` is \`neutral-700\` at 22%). Click **Copy** to put the \`var()\` reference on your clipboard.

The palette is deliberately light-only — \`theme.css\` ships no dark theme.
        `,
      },
    },
    layout: "fullscreen",
  },
  render: renderColorTokens,
  title: "Foundations/Color",
} satisfies Meta<ColorTokensArgs>;

export default meta;
type Story = StoryObj<ColorTokensArgs>;

export const AllColors = {} satisfies Story;

export const Primitive = {
  args: { tier: "primitive" },
} satisfies Story;

export const Semantic = {
  args: { tier: "semantic" },
} satisfies Story;

export const Component = {
  args: { tier: "component" },
} satisfies Story;

// Filters on the value, not on names, so any token that gains alpha later shows
// up here on its own.
export const Transparent = {
  args: { filter: "color-mix" },
} satisfies Story;
