import {
  defineArkBadge,
  defineArkBrandLogo,
  defineArkButton,
  defineArkCheckbox,
  defineArkInput,
  defineArkRadio,
  defineArkSpinner,
  defineArkToggle,
} from "./primitives";
import {
  defineArkCard,
  defineArkDialog,
  defineArkHero,
  defineArkNavigation,
} from "./components";

export const registerArkPrimitives = () => {
  defineArkBadge();
  defineArkBrandLogo();
  defineArkButton();
  defineArkCheckbox();
  defineArkInput();
  defineArkRadio();
  defineArkSpinner();
  defineArkToggle();
};

export const registerArkComponents = () => {
  defineArkCard();
  defineArkDialog();
  defineArkHero();
  defineArkNavigation();
};

export const registerArkUi = () => {
  registerArkPrimitives();
  registerArkComponents();
};

registerArkUi();
