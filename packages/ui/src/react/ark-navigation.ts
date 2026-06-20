import * as React from "react";
import { createComponent } from "@lit/react";
import {
  ArkNavigationRoot as ArkNavigationRootElement,
  ArkNavigationBrand as ArkNavigationBrandElement,
  ArkNavigationLinks as ArkNavigationLinksElement,
  ArkNavLink as ArkNavLinkElement,
  ArkNavigationCta as ArkNavigationCtaElement,
  ArkNavigationMobileToggle as ArkNavigationMobileToggleElement,
  ArkNavigationMobileMenu as ArkNavigationMobileMenuElement,
  defineArkNavigation,
} from "@arkaes/ui";

defineArkNavigation();

export const ArkNavigationRoot = createComponent({
  react: React,
  tagName: "ark-navigation-root",
  elementClass: ArkNavigationRootElement,
});

export const ArkNavigationBrand = createComponent({
  react: React,
  tagName: "ark-navigation-brand",
  elementClass: ArkNavigationBrandElement,
});

export const ArkNavigationLinks = createComponent({
  react: React,
  tagName: "ark-navigation-links",
  elementClass: ArkNavigationLinksElement,
});

export const ArkNavLink = createComponent({
  react: React,
  tagName: "ark-nav-link",
  elementClass: ArkNavLinkElement,
});

export const ArkNavigationCta = createComponent({
  react: React,
  tagName: "ark-navigation-cta",
  elementClass: ArkNavigationCtaElement,
});

export const ArkNavigationMobileToggle = createComponent({
  react: React,
  tagName: "ark-navigation-mobile-toggle",
  elementClass: ArkNavigationMobileToggleElement,
  events: {
    onMenuToggle: "ark-nav:menu-toggle",
  },
});

export const ArkNavigationMobileMenu = createComponent({
  react: React,
  tagName: "ark-navigation-mobile-menu",
  elementClass: ArkNavigationMobileMenuElement,
});
