import { ArkBadge } from "./ark-badge";
import { ArkButton } from "./ark-button";
import { ArkCard } from "./ark-card";

const defineElement = (tagName: string, element: CustomElementConstructor) => {
  if (typeof customElements !== "undefined" && !customElements.get(tagName)) {
    customElements.define(tagName, element);
  }
};

defineElement("ark-badge", ArkBadge);
defineElement("ark-button", ArkButton);
defineElement("ark-card", ArkCard);

export { ArkBadge, ArkButton, ArkCard };

declare global {
  interface HTMLElementTagNameMap {
    "ark-badge": ArkBadge;
    "ark-button": ArkButton;
    "ark-card": ArkCard;
  }
}

