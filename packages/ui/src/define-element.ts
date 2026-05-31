export const defineElement = (
  tagName: string,
  element: CustomElementConstructor,
) => {
  if (typeof customElements !== "undefined" && !customElements.get(tagName)) {
    customElements.define(tagName, element);
  }
};
