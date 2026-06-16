import type {
  TransitionAnimationPair,
  TransitionDirectionalAnimations,
} from "astro";

// A "fade through blank" page transition: instead of cross-dissolving the two
// pages (where both are partially visible at once), the outgoing page fades
// fully out to the page background first, then the incoming page fades in from
// it. Because both snapshots sit at opacity 0 around the midpoint, the viewer
// briefly sees the blank background — a clean cut rather than a blend.
//
// Keyframes `ark-fade-out` / `ark-fade-in` are defined globally in
// styles/global.css (view-transition pseudo-elements live on the document
// root, so the keyframes must not be scoped).

// Duration of each half (out, then in). Total transition ≈ 2× this.
const HALF = 540;

const animation: TransitionAnimationPair = {
  old: {
    name: "ark-fade-out",
    duration: `${HALF}ms`,
    easing: "cubic-bezier(0.4, 0, 1, 1)", // ease-in: accelerate to blank
    fillMode: "forwards", // hold at opacity 0 while the new page fades in
  },
  new: {
    name: "ark-fade-in",
    delay: `${HALF}ms`, // wait for the old page to clear before appearing
    duration: `${HALF}ms`,
    easing: "cubic-bezier(0, 0, 0.2, 1)", // ease-out: settle in from blank
    fillMode: "backwards", // stay at opacity 0 during the delay
  },
};

// Direction-agnostic: navigating forwards or backwards looks identical.
export const fadeThroughBlank: TransitionDirectionalAnimations = {
  forwards: animation,
  backwards: animation,
};
