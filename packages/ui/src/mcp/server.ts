import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadComponents } from "./manifest";
import { loadTokens, tokenCategories } from "./tokens";
import { loadUsage } from "./usage";

const PKG_VERSION = "1.1.1";

function jsonContent(payload: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

export function createServer(): McpServer {
  // Read both data sources once, up front — the manifest and token source of
  // truth never change while the process runs.
  const components = loadComponents();
  const server = new McpServer(
    { name: "arkaes-mcp", version: PKG_VERSION },
    {
      instructions:
        "Local, offline access to the Arkaes design system (@arkaes/ui + @arkaes/tokens). "
        + "Start with list_components to see what exists, then get_component_api for the exact "
        + "props/slots/events of the elements you'll use, and get_tokens to pull real --ark-* "
        + "values instead of hardcoding. All answers come from the built component manifest and "
        + "the token source of truth — there is no network access.",
    },
  );

  // ── list_components ─────────────────────────────────────────────────────
  server.registerTool(
    "list_components",
    {
      title: "List Arkaes components",
      description:
        "List every Arkaes custom element as a compact index: tag name, layer "
        + "(primitive/component/pattern), a one-line summary, its variant names, and its slot "
        + "names. Call this FIRST to discover what exists and roughly how to place each element. "
        + "It deliberately omits prop, event, and CSS detail to stay small — when you need the "
        + "full API of a specific element (props, events, slots, CSS custom properties, or a "
        + "usage snippet), follow up with get_component_api. Takes no arguments.",
      inputSchema: {},
    },
    () => {
      const list = [...components.values()].map((component) => ({
        tag: component.tagName,
        layer: component.layer,
        summary: component.summary ?? component.description ?? null,
        variants: component.variants,
        slots: component.slots.map((slot) => slot.name),
      }));
      return jsonContent({ count: list.length, components: list });
    },
  );

  // ── get_component_api ───────────────────────────────────────────────────
  server.registerTool(
    "get_component_api",
    {
      title: "Get Arkaes component API",
      description:
        "Return the full API for one or more Arkaes elements: props (name, attribute, type, "
        + "allowed options, default, required, description), events, slots, CSS custom "
        + "properties, and CSS parts. By default it also returns a canonical usage snippet "
        + "showing idiomatic markup and slot composition (set includeUsage:false to omit). Pass "
        + "every element you plan to use in one call via `names`. Use this after list_components "
        + "once you know which tags you need. Unknown tags return an error listing valid names.",
      inputSchema: {
        names: z
          .array(z.string())
          .min(1)
          .describe("Tag names to fetch, e.g. [\"ark-input\", \"ark-button\"]."),
        includeUsage: z
          .boolean()
          .optional()
          .describe("Include the authored usage snippet for each element. Defaults to true."),
      },
    },
    ({ names, includeUsage = true }) => {
      const known: unknown[] = [];
      const unknown: string[] = [];
      for (const name of names) {
        const component = components.get(name);
        if (!component) {
          unknown.push(name);
          continue;
        }
        const usage = includeUsage ? loadUsage(component.tagName) : null;
        known.push({
          ...component,
          usage,
          ...(includeUsage && usage === null
            ? { usageNote: "No authored usage snippet is available for this element yet." }
            : {}),
        });
      }

      if (unknown.length > 0) {
        return jsonContent(
          {
            error: `Unknown component(s): ${unknown.join(", ")}.`,
            validComponents: [...components.keys()],
            components: known,
          },
          known.length === 0,
        );
      }
      return jsonContent({ components: known });
    },
  );

  // ── get_tokens ──────────────────────────────────────────────────────────
  server.registerTool(
    "get_tokens",
    {
      title: "Get Arkaes design tokens",
      description:
        "Query Arkaes design tokens — the --ark-* CSS custom properties that theme every "
        + "component. Each token includes its CSS custom property, raw value, fully resolved "
        + "value, and category; color and spacing tokens (generated from DTCG sources) also "
        + "carry a type and description. Filter by `category` (color, spacing, typography, "
        + "radius, shadow, motion, layout) and/or `prefix` (prefix match on the token name, "
        + "e.g. 'color-accent' or 'space'). With NO arguments it returns the list of available "
        + "categories with counts, never the full token dump. Use it to pick real token values "
        + "instead of hardcoding colors, spacing, or type.",
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe("Exact category: color, spacing, typography, radius, shadow, motion, layout."),
        prefix: z
          .string()
          .optional()
          .describe("Prefix match on the token name, e.g. 'color-', 'space', or '--ark-radius'."),
      },
    },
    ({ category, prefix }) => {
      if (!category && !prefix) {
        return jsonContent({
          categories: tokenCategories(),
          hint: "Pass a category and/or prefix to list matching tokens.",
        });
      }

      const normalizedPrefix = prefix?.replace(/^--(ark-)?/, "").toLowerCase();
      const matches = loadTokens().filter((token) => {
        if (category && token.category !== category.toLowerCase()) return false;
        if (normalizedPrefix) {
          const bare = token.cssProperty.replace(/^--(ark-)?/, "").toLowerCase();
          if (!token.name.toLowerCase().startsWith(normalizedPrefix)
            && !bare.startsWith(normalizedPrefix)) {
            return false;
          }
        }
        return true;
      });

      if (matches.length === 0) {
        return jsonContent(
          {
            error: "No tokens matched.",
            filters: { category: category ?? null, prefix: prefix ?? null },
            availableCategories: tokenCategories(),
          },
          true,
        );
      }
      return jsonContent({ count: matches.length, tokens: matches });
    },
  );

  return server;
}

export async function runServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Never write to stdout — it carries the JSON-RPC stream.
  console.error("arkaes-mcp server running on stdio");
}
