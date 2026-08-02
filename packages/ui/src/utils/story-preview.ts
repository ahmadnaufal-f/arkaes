/**
 * True inside the Storybook preview iframe.
 *
 * Elements that read their state from the page (scroll position, current URL)
 * use this to stand down there: a story canvas never scrolls and never
 * navigates, so the reading would be a constant that overwrites whatever state
 * the story is trying to demonstrate.
 */
export const isStoryPreview = (): boolean =>
  typeof window !== "undefined" &&
  window.location.pathname.includes("iframe.html");
