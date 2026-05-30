import { ArkCard } from "./ark-card";

const defineElement = (tagName: string, element: CustomElementConstructor) => {
  if (typeof customElements !== "undefined" && !customElements.get(tagName)) {
    customElements.define(tagName, element);
  }
};

defineElement("ark-card", ArkCard);

export { ArkCard };

declare global {
  interface HTMLElementTagNameMap {
    "ark-card": ArkCard;
  }
}

