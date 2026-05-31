import { ArkBadge, BadgeVariant } from "./ark-badge";
import { ArkBrandLogo } from "./ark-brand-logo";
import { ArkButton, ButtonVariant } from "./ark-button";
import { ArkCheckbox } from "./ark-checkbox";
import { ArkInput, InputType } from "./ark-input";
import { ArkRadio } from "./ark-radio";
import { ArkSpinner, SpinnerVariant } from "./ark-spinner";
import { ArkToggle } from "./ark-toggle";

const defineElement = (tagName: string, element: CustomElementConstructor) => {
  if (typeof customElements !== "undefined" && !customElements.get(tagName)) {
    customElements.define(tagName, element);
  }
};

defineElement("ark-badge", ArkBadge);
defineElement("ark-brand-logo", ArkBrandLogo);
defineElement("ark-button", ArkButton);
defineElement("ark-checkbox", ArkCheckbox);
defineElement("ark-input", ArkInput);
defineElement("ark-radio", ArkRadio);
defineElement("ark-spinner", ArkSpinner);
defineElement("ark-toggle", ArkToggle);

export {
  ArkBadge,
  BadgeVariant,
  ArkBrandLogo,
  ArkButton,
  ButtonVariant,
  ArkCheckbox,
  ArkInput,
  InputType,
  ArkRadio,
  ArkSpinner,
  SpinnerVariant,
  ArkToggle,
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-badge": ArkBadge;
    "ark-brand-logo": ArkBrandLogo;
    "ark-button": ArkButton;
    "ark-checkbox": ArkCheckbox;
    "ark-input": ArkInput;
    "ark-radio": ArkRadio;
    "ark-spinner": ArkSpinner;
    "ark-toggle": ArkToggle;
  }
}
