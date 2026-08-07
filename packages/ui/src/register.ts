import {
  defineArkBadge,
  defineArkBrandLogo,
  defineArkButton,
  defineArkChip,
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
  defineArkCarousel,
  defineArkCursor,
  defineArkDialog,
  defineArkFloatingActionContainer,
  defineArkHero,
  defineArkMarkdown,
  defineArkNavigation,
  defineArkScrollTop,
  defineArkToast,
} from "./components";
import {
  defineArkMediaCard,
  defineArkPageHeader,
  defineArkProjectHeader,
} from "./patterns";

export const registerArkPrimitives = () => {
  defineArkBadge();
  defineArkBrandLogo();
  defineArkButton();
  defineArkChip();
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
  defineArkCarousel();
  defineArkCursor();
  defineArkDialog();
  defineArkFloatingActionContainer();
  defineArkHero();
  defineArkMarkdown();
  defineArkNavigation();
  defineArkScrollTop();
  defineArkToast();
};

export const registerArkPatterns = () => {
  defineArkMediaCard();
  defineArkPageHeader();
  defineArkProjectHeader();
};

export const registerArkUi = () => {
  registerArkPrimitives();
  registerArkComponents();
  registerArkPatterns();
};

registerArkUi();
