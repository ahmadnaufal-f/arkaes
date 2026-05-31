import {
  ArkCard,
  ArkCardHeader,
  ArkCardTitle,
  ArkCardDescription,
  ArkCardAction,
  ArkCardContent,
  ArkCardFooter,
  Card,
} from "./ark-card";
import {
  ArkDialogRoot,
  ArkDialogTrigger,
  ArkDialogPortal,
  ArkDialogOverlay,
  ArkDialogContent,
  ArkDialogTitle,
  ArkDialogDescription,
  ArkDialogClose,
  Dialog,
} from "./ark-dialog";
import { ArkHero, Hero, HeroTitleVariant } from "./ark-hero";
import {
  ArkNavigationRoot,
  ArkNavigationBrand,
  ArkNavigationLinks,
  ArkNavLink,
  ArkNavigationCta,
  ArkNavigationMobileToggle,
  ArkNavigationMobileMenu,
  Navigation,
} from "./ark-navigation";

const defineElement = (tagName: string, element: CustomElementConstructor) => {
  if (typeof customElements !== "undefined" && !customElements.get(tagName)) {
    customElements.define(tagName, element);
  }
};

defineElement("ark-card", ArkCard);
defineElement("ark-card-header", ArkCardHeader);
defineElement("ark-card-title", ArkCardTitle);
defineElement("ark-card-description", ArkCardDescription);
defineElement("ark-card-action", ArkCardAction);
defineElement("ark-card-content", ArkCardContent);
defineElement("ark-card-footer", ArkCardFooter);

defineElement("ark-dialog-root", ArkDialogRoot);
defineElement("ark-dialog-trigger", ArkDialogTrigger);
defineElement("ark-dialog-portal", ArkDialogPortal);
defineElement("ark-dialog-overlay", ArkDialogOverlay);
defineElement("ark-dialog-content", ArkDialogContent);
defineElement("ark-dialog-title", ArkDialogTitle);
defineElement("ark-dialog-description", ArkDialogDescription);
defineElement("ark-dialog-close", ArkDialogClose);

defineElement("ark-hero", ArkHero);

defineElement("ark-navigation-root", ArkNavigationRoot);
defineElement("ark-navigation-brand", ArkNavigationBrand);
defineElement("ark-navigation-links", ArkNavigationLinks);
defineElement("ark-nav-link", ArkNavLink);
defineElement("ark-navigation-cta", ArkNavigationCta);
defineElement("ark-navigation-mobile-toggle", ArkNavigationMobileToggle);
defineElement("ark-navigation-mobile-menu", ArkNavigationMobileMenu);

export {
  ArkCard,
  ArkCardHeader,
  ArkCardTitle,
  ArkCardDescription,
  ArkCardAction,
  ArkCardContent,
  ArkCardFooter,
  Card,
  ArkDialogRoot,
  ArkDialogTrigger,
  ArkDialogPortal,
  ArkDialogOverlay,
  ArkDialogContent,
  ArkDialogTitle,
  ArkDialogDescription,
  ArkDialogClose,
  Dialog,
  ArkHero,
  Hero,
  HeroTitleVariant,
  ArkNavigationRoot,
  ArkNavigationBrand,
  ArkNavigationLinks,
  ArkNavLink,
  ArkNavigationCta,
  ArkNavigationMobileToggle,
  ArkNavigationMobileMenu,
  Navigation,
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-card": ArkCard;
    "ark-card-header": ArkCardHeader;
    "ark-card-title": ArkCardTitle;
    "ark-card-description": ArkCardDescription;
    "ark-card-action": ArkCardAction;
    "ark-card-content": ArkCardContent;
    "ark-card-footer": ArkCardFooter;
    "ark-dialog-root": ArkDialogRoot;
    "ark-dialog-trigger": ArkDialogTrigger;
    "ark-dialog-portal": ArkDialogPortal;
    "ark-dialog-overlay": ArkDialogOverlay;
    "ark-dialog-content": ArkDialogContent;
    "ark-dialog-title": ArkDialogTitle;
    "ark-dialog-description": ArkDialogDescription;
    "ark-dialog-close": ArkDialogClose;
    "ark-hero": ArkHero;
    "ark-navigation-root": ArkNavigationRoot;
    "ark-navigation-brand": ArkNavigationBrand;
    "ark-navigation-links": ArkNavigationLinks;
    "ark-nav-link": ArkNavLink;
    "ark-navigation-cta": ArkNavigationCta;
    "ark-navigation-mobile-toggle": ArkNavigationMobileToggle;
    "ark-navigation-mobile-menu": ArkNavigationMobileMenu;
  }
}
