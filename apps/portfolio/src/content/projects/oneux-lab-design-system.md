---
title: "OneUX Lab Design System"
projectName: "OneUX Lab"
shippedDate: 2026-05-31
featured: true
role: "Project Lead"
challenges: "Started as a revival of an internal frontend framework left unmaintained for six years, and grew into a React and TypeScript design system for internal dashboards and CMS platforms, developed by 15+ engineers across multiple product teams. The challenge was to learn the discipline while leading it: component API standards for data dense interfaces, accessibility, versioning, and release, then move the system toward DTCG tokens and MCP based AI integration."
stack:
  - React
  - TypeScript
  - Turborepo
  - tsdown
  - shadcn/ui
  - Storybook
  - Design Tokens (DTCG)
  - Changesets
  - MCP Server
  - Accessibility
category: "professional-work"
links:
  - label: "The Story Behind It"
    url: "https://www.arkaes.dev/blog/discovering-the-world-of-design-systems"
screenshots: []
---

OneUX Lab is a **React** and **TypeScript** design system developed by more than 15 engineers across multiple product teams. As the *project lead*, I define the overall architecture, *component API conventions*, versioning strategy, and release process. The goal is simple: give every team a **shared foundation** so they can focus on building products instead of rebuilding the same UI components.

The design system is built specifically for **internal dashboards and CMS platforms**. That focus influences almost every design decision. Rather than covering every possible use case, the library is optimized for *data heavy interfaces*, including tables, forms, filters, navigation, and layouts that people use throughout their workday.

The project actually began as an attempt to **revive an internal frontend framework** that had been left untouched for nearly six years. As interest grew, another frontend team joined the effort and we split the work. My team focused on *reusable UI components*, while the other team handled *charts and data visualization*. Around that time, someone casually referred to the project as a **design system**. That was when I started learning from projects like *Material Design*, *Polaris*, and *Carbon*, and realized we had already been moving in that direction without calling it one.

Since then, I have worked closely with designers to turn **Figma** designs into reusable React components. The library uses **shadcn/ui** as a starting point, but the components are heavily adapted to match our own *design language* and engineering standards. Every component is documented in **Storybook** so contributors from different teams can quickly understand how everything fits together.

Building components is only part of the challenge. *Keeping them consistent across a growing contributor base is much harder.* As more engineers joined the project, establishing clear **API conventions** became just as important as writing the components themselves. We also introduced **accessibility** reviews, keyboard support, **ARIA** standards, and a predictable release workflow. The repository is managed with **Turborepo**, bundled with **tsdown**, and versioned through **Changesets** so consuming teams always know what has changed.

As the design system matured, I started exploring newer standards that could make it more maintainable. One of them was the **Design Tokens Community Group (DTCG)** specification. Instead of treating tokens as a collection of *CSS variables*, we now maintain them as *structured JSON* using **Style Dictionary v4**, allowing us to generate CSS custom properties, typed exports, and machine readable token files from a *single source of truth*. We also enforce token usage in **CI** to prevent raw colors and spacing values from creeping back into the codebase.

Another area I explored was **AI integration**. My initial idea was to build a **RAG** system over the component documentation, but that quickly revealed a limitation. Documentation in a *vector database* becomes outdated as soon as the design system evolves. Instead, I built an **MCP server** so AI tools can retrieve the *latest component APIs and design tokens directly from the source*. Both the DTCG pipeline and MCP server have been merged into the project, with rollout to product teams currently in progress.

This project has taught me that a design system is far more than a component library. It is about creating *shared conventions*, improving collaboration across teams, and building **tooling that helps other engineers work more efficiently**. It has also given me the opportunity to experiment with emerging standards like **DTCG** and **MCP** in a production environment where *maintainability matters as much as the components themselves*.

This project is covered by a **strict NDA**, so product names, screenshots, and proprietary implementation details cannot be shared. To demonstrate the same engineering approach publicly, I built the [**Arkaes Design System**](/projects/arkaes-design-system), where I explore *component API design*, accessibility, **DTCG** tokens, documentation, and **MCP** integration in the open.
