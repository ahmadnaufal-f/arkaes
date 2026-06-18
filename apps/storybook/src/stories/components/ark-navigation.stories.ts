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

const meta = {
  component: "ark-navigation-root",
  parameters: {
    docs: {
      description: {
        component: `
\`ark-navigation\` is a fixed-position header with responsive mobile toggle and collapsible menu.

Structure the header with \`ark-navigation-root\`, \`ark-navigation-brand\`, \`ark-navigation-links\`, \`ark-navigation-cta\`, \`ark-navigation-mobile-toggle\`, and \`ark-navigation-mobile-menu\`. Use \`ark-nav-link\` for menu items and set \`active\` to highlight the current page. The \`scrolled\` attribute changes appearance when the page is scrolled.
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
