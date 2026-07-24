// Custom Elements Manifest config for @arkaes/ui.
//
// The manifest is the single source of truth the bundled MCP server reads to
// answer questions about the component API (see `src/mcp`). Lit's analyzer
// captures properties, attributes, slots, events, CSS custom properties, and
// CSS parts straight from the source and its JSDoc — nothing here is
// hand-authored.
//
// Two gaps the stock analyzer leaves, filled by the plugin below:
//   1. Enum-typed attributes (`variant: ButtonVariant | string`) land in the
//      manifest as the opaque type text `ButtonVariant | string`, hiding the
//      actual allowed values.
//   2. Some elements express their variants purely through CSS attribute
//      selectors (`:host([variant="project"])`) with a plain `string` field,
//      so the allowed values live only in the stylesheet.
// The plugin resolves both back to concrete string-literal unions so the MCP
// server can present real option lists.

// Attribute names whose values we are willing to harvest from CSS attribute
// selectors. Kept to genuine "pick one of a set" style hooks so we never
// mistake a state selector (`[disabled]`) or an incidental native selector
// (`input[type="number"]`) for a variant enumeration.
const CSS_OPTION_ATTRS = new Set([
  "variant",
  "size",
  "width",
  "orientation",
  "align",
  "tone",
  "position",
  "label-position",
  "density",
  "placement",
]);

/**
 * @returns {import("@custom-elements-manifest/analyzer").Plugin}
 */
function optionResolutionPlugin() {
  /** enum name -> string member values */
  const enumValues = new Map();
  /** class name -> (attribute name -> Set of values seen in CSS selectors) */
  const cssOptions = new Map();
  /** class name -> registered custom element tag name */
  const tagNames = new Map();

  const collectCssOptions = (className, cssText) => {
    const seen = cssOptions.get(className) ?? new Map();
    const re = /\[([a-z][a-z0-9-]*)=["']([^"']+)["']\]/gi;
    let match;
    while ((match = re.exec(cssText)) !== null) {
      const attr = match[1].toLowerCase();
      if (!CSS_OPTION_ATTRS.has(attr)) continue;
      const set = seen.get(attr) ?? new Set();
      set.add(match[2]);
      seen.set(attr, set);
    }
    if (seen.size) cssOptions.set(className, seen);
  };

  return {
    name: "arkaes-option-resolution",

    analyzePhase({ ts, node }) {
      // Elements register through the `defineElement("tag", Class)` guard rather
      // than `customElements.define`, so the stock analyzer never links a tag
      // name. Recover the mapping from those calls.
      if (
        ts.isCallExpression(node) &&
        node.expression.getText() === "defineElement" &&
        node.arguments.length >= 2 &&
        ts.isStringLiteral(node.arguments[0]) &&
        ts.isIdentifier(node.arguments[1])
      ) {
        tagNames.set(node.arguments[1].getText(), node.arguments[0].text);
      }

      // Harvest string enums so enum-typed attributes can be expanded.
      if (ts.isEnumDeclaration(node)) {
        const values = [];
        for (const member of node.members) {
          if (member.initializer && ts.isStringLiteral(member.initializer)) {
            values.push(member.initializer.text);
          }
        }
        if (values.length) enumValues.set(node.name.getText(), values);
      }

      // Harvest `static styles = css`...`` so CSS-only variants are recoverable.
      if (ts.isClassDeclaration(node) && node.name) {
        const className = node.name.getText();
        for (const member of node.members) {
          const isStyles =
            ts.isPropertyDeclaration(member) &&
            member.name &&
            member.name.getText() === "styles" &&
            member.initializer;
          if (isStyles) collectCssOptions(className, member.initializer.getText());
        }
      }
    },

    packageLinkPhase({ customElementsManifest }) {
      /** Expand a type's text into a concrete string-literal union when possible. */
      const expandEnum = (typeText) => {
        if (!typeText || !typeText.includes("|") && !enumValues.has(typeText)) return typeText;
        const parts = typeText.split("|").map((part) => part.trim());
        let changed = false;
        const out = [];
        for (const part of parts) {
          if (enumValues.has(part)) {
            changed = true;
            for (const value of enumValues.get(part)) out.push(JSON.stringify(value));
          } else {
            out.push(part);
          }
        }
        if (!changed) return typeText;
        // Drop a lone `string` fallback so the union reads as real options.
        const cleaned = out.filter((part) => part !== "string");
        return (cleaned.length ? cleaned : out).join(" | ");
      };

      for (const mod of customElementsManifest.modules) {
        for (const decl of mod.declarations ?? []) {
          // Link the recovered tag name onto the declaration and expose the
          // standard custom-element-definition export.
          if (decl.customElement && !decl.tagName && tagNames.has(decl.name)) {
            decl.tagName = tagNames.get(decl.name);
            mod.exports = mod.exports ?? [];
            const hasDefinition = mod.exports.some(
              (exp) => exp.kind === "custom-element-definition" && exp.name === decl.tagName,
            );
            if (!hasDefinition) {
              mod.exports.push({
                kind: "custom-element-definition",
                name: decl.tagName,
                declaration: { name: decl.name, module: mod.path },
              });
            }
          }

          const perClassCss = cssOptions.get(decl.name);

          const resolve = (attrName, typeObj) => {
            if (typeObj?.text) {
              const expanded = expandEnum(typeObj.text);
              if (expanded !== typeObj.text) {
                typeObj.text = expanded;
                return;
              }
            }
            // No enum expansion happened — try CSS-derived options.
            const values = perClassCss?.get(String(attrName).toLowerCase());
            if (values && values.size) {
              const union = [...values].map((value) => JSON.stringify(value)).join(" | ");
              if (typeObj) typeObj.text = union;
            }
          };

          for (const attr of decl.attributes ?? []) {
            if (!attr.type) attr.type = { text: "string" };
            resolve(attr.name, attr.type);
          }
          for (const member of decl.members ?? []) {
            if (member.attribute && member.type) resolve(member.attribute, member.type);
          }
        }
      }
    },
  };
}

export default {
  globs: ["src/primitives/**/*.ts", "src/components/**/*.ts", "src/patterns/**/*.ts"],
  exclude: ["**/*.test.ts", "**/__tests__/**", "**/index.ts"],
  litelement: true,
  outdir: ".",
  plugins: [optionResolutionPlugin()],
};
