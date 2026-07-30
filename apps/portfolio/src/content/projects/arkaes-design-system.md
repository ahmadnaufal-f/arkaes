---
title: "Arkaes Design System"
projectName: "Arkaes Design System"
shippedDate: 2026-06-30
featured: false
role: "Project Owner"
challenges: "Built a reusable Web Components based design system while exploring modern design system architecture, including DTCG design tokens, MCP server integration for AI, accessibility, documentation, and component scalability without overengineering."
stack:
  - Lit
  - Web Components
  - TypeScript
  - Storybook
  - Design Tokens (DTCG)
  - MCP Server
  - Astro
  - Accessibility
category: "side-project"
links:
  - label: "GitHub"
    url: "https://github.com/ahmadnaufal-f/arkaes"
  - label: "Storybook"
    url: "https://ds.arkaes.dev"
  - label: "Brand Guideline"
    url: "https://brand.arkaes.dev"
screenshots: []
---

Arkaes Design System is a personal design system project built to explore how reusable UI foundations can be designed, documented, and implemented with **Web Components**. The project focuses on creating accessible, reusable, and themeable components using **Lit**, supported by **DTCG-compliant design tokens**, documented through **Storybook**, and exposed through an **MCP server** to enable AI assistants to retrieve component specifications in real time.

I built this project as both a design and engineering playground. It allows me to practice the kind of frontend work that sits between product design, *component architecture*, accessibility, and *developer experience*. Instead of only building isolated UI components, I use Arkaes to think about how components should behave, how design tokens should drive visual consistency, how documentation should improve discoverability, and how AI can interact with a design system through standardized protocols.

One area I have been particularly interested in is how **Model Context Protocol (MCP)** changes the way AI interacts with design systems. Unlike a traditional **RAG** pipeline that relies on periodically indexed documentation, an MCP server enables AI models to retrieve the latest component specifications, design tokens, and documentation directly from the source. This ensures that AI generated answers remain synchronized with the current state of the design system instead of relying on potentially outdated snapshots.

Another focus of the project is adopting the **Design Tokens Community Group (DTCG)** specification. Rather than treating design tokens as a collection of CSS variables, Arkaes manages them as structured JSON files following the DTCG format. This approach improves maintainability, enables interoperability across design and development tools, and provides a machine readable structure that AI systems and MCP servers can consume more accurately.

The main challenge is building a system that feels flexible without becoming overengineered. Since this is a side project, the scope needs to stay realistic, while the architecture should still demonstrate thoughtful approaches to *component APIs*, design token management, accessibility, documentation, AI integration, and developer experience.

This project is meaningful because it reflects the kind of frontend engineering I enjoy most: designing clear UI systems, translating visual decisions into maintainable code, and creating reusable foundations that can grow over time. It also allows me to explore emerging standards around AI assisted development and design systems while supporting my long term goal of becoming a frontend engineer who contributes not only to application features, but also to the systems, tooling, and standards behind them.
