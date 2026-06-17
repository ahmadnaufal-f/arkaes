import {
  defineArkBadge,
  defineArkBrandLogo,
  defineArkButton,
  defineArkCheckbox,
  defineArkDropdown,
  defineArkEmpty,
  defineArkInput,
  defineArkRadio,
  defineArkRadioGroup,
  defineArkSpinner,
  defineArkToggle,
} from "./primitives";
import {
  defineArkAccordion,
  defineArkCard,
  defineArkCursor,
  defineArkDialog,
  defineArkHero,
  defineArkNavigation,
} from "./components";
import { defineArkCaseStudyCard } from "./patterns";

export const registerArkPrimitives = () => {
  defineArkBadge();
  defineArkBrandLogo();
  defineArkButton();
  defineArkCheckbox();
  defineArkDropdown();
  defineArkEmpty();
  defineArkInput();
  defineArkRadio();
  defineArkRadioGroup();
  defineArkSpinner();
  defineArkToggle();
};

export const registerArkComponents = () => {
  defineArkAccordion();
  defineArkCard();
  defineArkCursor();
  defineArkDialog();
  defineArkHero();
  defineArkNavigation();
};

export const registerArkPatterns = () => {
  defineArkCaseStudyCard();
};

export const registerArkUi = () => {
  registerArkPrimitives();
  registerArkComponents();
  registerArkPatterns();
};

registerArkUi();
