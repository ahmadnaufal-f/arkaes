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
  defineArkCursor,
  defineArkDialog,
  defineArkHero,
  defineArkNavigation,
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
  defineArkCursor();
  defineArkDialog();
  defineArkHero();
  defineArkNavigation();
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
