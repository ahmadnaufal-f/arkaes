import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

// Wrapper helper to give the fixed-position header a visible frame in Storybook
const navWrapper = (content: ReturnType<typeof html>) => html`
  <div style="position: relative; height: 80px; overflow: visible;">
    ${content}
  </div>
`;

const renderDefault = () => navWrapper(html`
  <ark-navigation-root>
    <ark-navigation-brand href="/"></ark-navigation-brand>
    <ark-navigation-links>
      <ark-nav-link href="/#case-studies">Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-links>
    <ark-navigation-cta href="/#contact">Let's Talk</ark-navigation-cta>
    <ark-navigation-mobile-toggle></ark-navigation-mobile-toggle>
    <ark-navigation-mobile-menu>
      <ark-nav-link href="/#case-studies">Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-mobile-menu>
  </ark-navigation-root>
`);

const renderScrolled = () => navWrapper(html`
  <ark-navigation-root scrolled>
    <ark-navigation-brand href="/"></ark-navigation-brand>
    <ark-navigation-links>
      <ark-nav-link href="/#case-studies">Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-links>
    <ark-navigation-cta href="/#contact">Let's Talk</ark-navigation-cta>
    <ark-navigation-mobile-toggle></ark-navigation-mobile-toggle>
    <ark-navigation-mobile-menu>
      <ark-nav-link href="/#case-studies">Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-mobile-menu>
  </ark-navigation-root>
`);

const renderWithActiveLink = () => navWrapper(html`
  <ark-navigation-root>
    <ark-navigation-brand href="/"></ark-navigation-brand>
    <ark-navigation-links>
      <ark-nav-link href="/#case-studies" active>Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-links>
    <ark-navigation-cta href="/#contact">Let's Talk</ark-navigation-cta>
    <ark-navigation-mobile-toggle></ark-navigation-mobile-toggle>
    <ark-navigation-mobile-menu>
      <ark-nav-link href="/#case-studies" active>Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-mobile-menu>
  </ark-navigation-root>
`);

const renderMobileOpen = () => navWrapper(html`
  <ark-navigation-root menu-open>
    <ark-navigation-brand href="/"></ark-navigation-brand>
    <ark-navigation-links>
      <ark-nav-link href="/#case-studies">Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-links>
    <ark-navigation-cta href="/#contact">Let's Talk</ark-navigation-cta>
    <ark-navigation-mobile-toggle menu-open></ark-navigation-mobile-toggle>
    <ark-navigation-mobile-menu menu-open>
      <ark-nav-link href="/#case-studies">Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-mobile-menu>
  </ark-navigation-root>
`);

// Immersive mode paints a gradient scrim, so the story needs page content
// behind it for the fill to read as a fill.
const immersiveWrapper = (content: ReturnType<typeof html>) => html`
  <div
    style="position: relative; height: 220px; overflow: hidden; background:
      repeating-linear-gradient(135deg, var(--ark-color-surface-soft) 0 18px,
      var(--ark-color-bg) 18px 36px);"
  >
    ${content}
  </div>
`;

const renderImmersive = () => immersiveWrapper(html`
  <ark-navigation-root immersive>
    <ark-navigation-brand href="/"></ark-navigation-brand>
    <ark-navigation-links>
      <ark-nav-link href="/#case-studies">Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-links>
    <ark-navigation-cta href="/#contact">Let's Talk</ark-navigation-cta>
    <ark-navigation-mobile-toggle></ark-navigation-mobile-toggle>
    <ark-navigation-mobile-menu>
      <ark-nav-link href="/#case-studies">Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-mobile-menu>
  </ark-navigation-root>
`);

const renderImmersiveHidden = () => immersiveWrapper(html`
  <ark-navigation-root immersive immersive-hidden>
    <ark-navigation-brand href="/"></ark-navigation-brand>
    <ark-navigation-links>
      <ark-nav-link href="/#case-studies">Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-links>
    <ark-navigation-cta href="/#contact">Let's Talk</ark-navigation-cta>
    <ark-navigation-mobile-toggle></ark-navigation-mobile-toggle>
    <ark-navigation-mobile-menu>
      <ark-nav-link href="/#case-studies">Case Studies</ark-nav-link>
      <ark-nav-link href="/#expertise">Expertise</ark-nav-link>
      <ark-nav-link href="/#about">About</ark-nav-link>
      <ark-nav-link href="/projects">Writing</ark-nav-link>
    </ark-navigation-mobile-menu>
  </ark-navigation-root>
`);

const meta = {
  component: "ark-navigation-root",
  parameters: {
    docs: {
      description: {
        component: `
\`ark-navigation\` is a fixed-position header with responsive mobile toggle and collapsible menu.

Structure the header with \`ark-navigation-root\`, \`ark-navigation-brand\`, \`ark-navigation-links\`, \`ark-navigation-cta\`, \`ark-navigation-mobile-toggle\`, and \`ark-navigation-mobile-menu\`. Use \`ark-nav-link\` for menu items and set \`active\` to highlight the current page. The \`scrolled\` attribute changes appearance when the page is scrolled.

On viewports up to 900px the root also drives **immersive mode**: once the page scrolls past the resting height of the bar, the bar dissolves and the brand and hamburger become separate floating pills over a gradient scrim. The pills tuck away while the page is moving and settle back in when scrolling stops. The root sets \`immersive\` and \`immersive-hidden\` itself — the stories below pin them so the states are visible at any canvas width.
        `,
      },
    },
  },
  render: renderDefault,
  title: "Components/Ark Navigation",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default = {} satisfies Story;

export const Scrolled = {
  render: renderScrolled,
} satisfies Story;

export const WithActiveLink = {
  render: renderWithActiveLink,
} satisfies Story;

export const MobileOpen = {
  render: renderMobileOpen,
} satisfies Story;

export const Immersive = {
  render: renderImmersive,
} satisfies Story;

export const ImmersiveHidden = {
  render: renderImmersiveHidden,
} satisfies Story;
