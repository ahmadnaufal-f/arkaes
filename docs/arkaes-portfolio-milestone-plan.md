# Arkaes Portfolio Rebuild — Milestone Plan

## Project Direction

Build a new portfolio website from scratch using:

- **Astro** for the portfolio website structure, routing, static rendering, content, and SEO
- **Lit** for a small framework-agnostic design system
- **TypeScript** across the project
- **CSS custom properties** for design tokens
- **Turborepo + pnpm workspaces** for a simple monorepo setup

The main goal is not only to launch a portfolio, but to make the portfolio itself a technical case study:

> A performance-first portfolio powered by a small Lit-based design system, demonstrating framework-agnostic frontend engineering, strong visual taste, and product-oriented case-study writing.

---

## Project Inventory

The portfolio should clearly separate professional work from side projects.

### Professional Works

```txt
1. SmartThings Air Care Service
2. Virtual Home — SmartThings Simulator Plugin
3. Virtual Home for TV
```

### Side Projects

```txt
1. Treely — Family Tree Maker App
2. Milk Tracker App — Name not finalized yet
```

### Recommended Visibility Strategy

Use two different structures depending on context:

```txt
Homepage:
- Show selected featured work only
- Mix professional and side projects based on strength
- Use category labels such as "Professional Work" and "Side Project"

Projects page:
- Clearly separate Professional Works and Side Projects
```

Recommended homepage featured work:

```txt
1. SmartThings Air Care Service
2. Virtual Home — SmartThings Simulator Plugin
3. Treely
```

Recommended project page structure:

```txt
Projects
├── Professional Works
│   ├── SmartThings Air Care Service
│   ├── Virtual Home — SmartThings Simulator Plugin
│   └── Virtual Home for TV
│
└── Side Projects
    ├── Treely
    └── Milk Tracker App
```

### Recommended Case Study Depth

| Project | Category | Suggested Depth | Main Signal |
|---|---|---|---|
| SmartThings Air Care Service | Professional Work | Deep | Performance, caching, production impact |
| Virtual Home — SmartThings Simulator Plugin | Professional Work | Deep/Medium | Refactoring, maintainability, bundle/output optimization |
| Virtual Home for TV | Professional Work | Medium/Short | Platform adaptation, TV interaction, large-screen UX |
| Treely | Side Project | Deep | Product ownership, React Native, leadership, cross-platform direction |
| Milk Tracker App | Side Project | Medium/Short | Personal product thinking, utility, AI-assisted insights |

---

## Time Assumption

Available time:

- **5–6 hours per week**
- Mostly on **weekends**
- Development style: **semi-vibe-coding**

Because of the limited time, the plan avoids overbuilding. The design system will be prepared from day one, but it will grow only when the portfolio needs it.

---

## Guiding Principles

### 1. Prepare the path from day one

Use a monorepo from the beginning so the project does not need a painful restructure later.

```txt
arkaes/
  apps/
    portfolio/
  packages/
    ui/
```

### 2. Build the portfolio and design system together

Do not build the design system as a separate, isolated product first.

The portfolio is the first real consumer of the design system.

### 3. Keep the design system small

Start with only the foundations:

- design tokens
- typography
- button
- card
- badge
- theme toggle
- maybe custom cursor

Avoid building unused components.

### 4. Use vibe-coding carefully

AI can help move fast, but every weekend should end with a manual review:

- inspect generated code
- remove unnecessary abstractions
- check accessibility
- check responsive layout
- check performance
- write notes about what changed

### 5. Ship before perfection

The goal is to launch a polished v1, not a complete design system platform.

---

## Target Timeline Overview

| Week | Focus | Main Output |
|---|---|---|
| Week 1 | Project setup and architecture | Monorepo, Astro app, Lit UI package |
| Week 2 | Design foundations | Tokens, typography, base styling |
| Week 3 | Core UI components | Button, card, badge, basic layout primitives |
| Week 4 | Portfolio shell | Homepage structure, navigation, footer |
| Week 5 | Project content system | Professional Works and Side Projects content structure |
| Week 6 | Homepage polish | Hero, selected featured work, positioning |
| Week 7 | Case study template | Reusable case-study layout |
| Week 8 | First professional case study | SmartThings Air Care Service case study |
| Week 9 | Remaining project pages | Professional Works and Side Projects pages |
| Week 10 | Lit interaction layer | Theme toggle, cursor, project filter, small interactions |
| Week 11 | Responsive and accessibility pass | Mobile/tablet/desktop polish |
| Week 12 | Performance, SEO, and launch | Metadata, Lighthouse, deployment |

Estimated timeline: **12 weekends**.

This can be shortened if the design is already clear, or extended if the case studies need deeper writing.

---

# Phase 1 — Foundation

## Week 1 — Monorepo and Project Setup

### Goal

Create the technical foundation from day one so the project path is stable.

### Tasks

- Create repository
- Set up pnpm workspaces
- Set up Turborepo
- Create Astro app in `apps/portfolio`
- Create Lit UI package in `packages/ui`
- Configure TypeScript
- Configure basic linting/formatting
- Verify the Astro app can import from `@arkaes/ui`

### Suggested structure

```txt
arkaes/
  apps/
    portfolio/
      src/
        pages/
        layouts/
        components/
        styles/
      package.json

  packages/
    ui/
      src/
        components/
        styles/
        index.ts
      package.json

  package.json
  turbo.json
  tsconfig.base.json
```

### Semi-vibe-coding prompt idea

```txt
Create a minimal Turborepo + pnpm workspace setup with:
- apps/portfolio using Astro and TypeScript
- packages/ui using Lit and TypeScript
- shared TypeScript base config
- ability for the Astro app to import @arkaes/ui
Keep the setup simple and avoid unnecessary tooling.
```

### Done criteria

- `pnpm install` works
- `pnpm dev` runs the Astro app
- `packages/ui` can export at least one test Lit component
- Astro can render the test custom element

---

## Week 2 — Design Tokens and Base Styling

### Goal

Create the Arkaes visual foundation before building pages.

### Tasks

- Create `tokens.css`
- Define color tokens based on the Arkaes brand guideline
- Define typography tokens
- Define spacing scale
- Define radius scale
- Define shadow/elevation tokens
- Define global base styles
- Import tokens into Astro
- Make Lit components consume the same tokens

### Suggested files

```txt
packages/ui/src/styles/tokens.css
packages/ui/src/styles/reset.css
packages/ui/src/styles/typography.css
apps/portfolio/src/styles/global.css
```

### Token categories

```txt
Color:
- background
- surface
- text
- muted text
- border
- accent
- accent soft
- danger/success if needed

Typography:
- font family
- text sizes
- line heights
- font weights

Spacing:
- 4px scale or similar

Radius:
- small
- medium
- large
- full

Motion:
- duration fast
- duration normal
- easing standard
```

### Semi-vibe-coding prompt idea

```txt
Based on this brand direction, create a CSS token system for an elegant portfolio website.
Use CSS custom properties.
The style should feel warm, polished, soft, professional, and suitable for a frontend engineer who also cares about design.
Do not overcomplicate the token system.
```

### Done criteria

- Tokens are defined
- Astro pages can use the tokens
- Lit components can use the tokens
- No hardcoded random colors in components unless temporary

---

# Phase 2 — Minimal Design System

## Week 3 — Core UI Components

### Goal

Build only the components that are immediately useful for the portfolio.

### Components

Start with:

- `ark-button`
- `ark-card`
- `ark-badge`
- `ark-theme-toggle`

Optional:

- `ark-link`
- `ark-section-title`

### Suggested structure

```txt
packages/ui/src/components/button/ark-button.ts
packages/ui/src/components/card/ark-card.ts
packages/ui/src/components/badge/ark-badge.ts
packages/ui/src/components/theme-toggle/ark-theme-toggle.ts
packages/ui/src/components/index.ts
```

### Component rules

Each component should:

- use TypeScript
- use Lit
- expose clear attributes/properties
- use CSS variables
- support slots where appropriate
- avoid project-specific content
- be accessible by default

### Example component responsibility

```txt
ark-button:
- visual button primitive
- variants: primary, secondary, ghost
- sizes: sm, md, lg
- supports slot content
- does not know about portfolio navigation

ark-card:
- surface primitive
- supports slot content
- optional interactive state

ark-badge:
- small label/chip

ark-theme-toggle:
- switches theme
- stores preference
- updates document attribute
```

### Semi-vibe-coding prompt idea

```txt
Create a small Lit-based UI component package for a personal portfolio.
Implement ark-button, ark-card, and ark-badge.
Use CSS custom properties from tokens.css.
Keep the API small, accessible, and easy to consume from Astro.
```

### Done criteria

- Components work in Astro
- Components are styled with tokens
- Components are not over-abstracted
- Components have basic keyboard/accessibility behavior where relevant

---

# Phase 3 — Portfolio Structure

## Week 4 — Portfolio Shell

### Goal

Build the website shell without worrying about final content perfection.

### Tasks

- Create base layout
- Create navigation
- Create footer
- Create homepage skeleton
- Add responsive page container
- Add placeholder sections

### Suggested Astro files

```txt
apps/portfolio/src/layouts/BaseLayout.astro
apps/portfolio/src/components/SiteHeader.astro
apps/portfolio/src/components/SiteFooter.astro
apps/portfolio/src/pages/index.astro
apps/portfolio/src/pages/about.astro
apps/portfolio/src/pages/projects/index.astro
```

### Homepage sections

```txt
- Hero
- Selected projects
- Engineering approach
- Design-system note
- About summary
- Contact CTA
```

### Semi-vibe-coding prompt idea

```txt
Create an Astro portfolio homepage shell for a frontend engineer brand called Arkaes.
Use a refined, warm, professional tone.
The page should include hero, selected projects, engineering approach, about summary, and contact CTA.
Use existing @arkaes/ui components where appropriate.
Do not write final copy yet; use editable placeholder copy.
```

### Done criteria

- Website has a complete navigable shell
- Layout works on desktop and mobile
- Placeholder content is acceptable
- Header/footer are present

---

## Week 5 — Project Content System

### Goal

Create a scalable project content system that separates **Professional Works** and **Side Projects** clearly.

### Tasks

- Decide between `.md`, `.mdx`, or data files
- Create project schema
- Add category support
- Add project metadata
- Add project listing page
- Add dynamic project detail route
- Render separate sections for Professional Works and Side Projects
- Add featured project support for the homepage

### Recommended project categories

```txt
professional-work
side-project
```

### Recommended project fields

```txt
title
slug
category
summary
role
timeline
stack
status
featured
coverImage
problem
solution
impact
links
```

### Project content list

```txt
Professional Works:
- SmartThings Air Care Service
- Virtual Home — SmartThings Simulator Plugin
- Virtual Home for TV

Side Projects:
- Treely
- Milk Tracker App
```

### Suggested structure

```txt
apps/portfolio/src/content/projects/smartthings-air-care-service.md
apps/portfolio/src/content/projects/virtual-home-smartthings-simulator.md
apps/portfolio/src/content/projects/virtual-home-for-tv.md
apps/portfolio/src/content/projects/treely.md
apps/portfolio/src/content/projects/milk-tracker-app.md
apps/portfolio/src/pages/projects/[slug].astro
```

### Projects page structure

```txt
Professional Works
- SmartThings Air Care Service
- Virtual Home — SmartThings Simulator Plugin
- Virtual Home for TV

Side Projects
- Treely
- Milk Tracker App
```

### Homepage featured work

```txt
Featured Work
- SmartThings Air Care Service
- Virtual Home — SmartThings Simulator Plugin
- Treely
```

The homepage can mix professional work and side projects because it should highlight the strongest stories. The full projects page should separate them by context.

### Semi-vibe-coding prompt idea

```txt
Create an Astro content collection for portfolio projects.
Each project should support metadata such as title, slug, category, summary, role, stack, impact, featured status, and links.
The project index page should separate projects into Professional Works and Side Projects.
The homepage should be able to display only featured projects regardless of category.
Keep the content structure easy to maintain.
```

### Done criteria

- Projects can be added as content files
- Each project has a clear category
- Project listing renders Professional Works and Side Projects separately
- Dynamic project pages work
- Featured projects can be shown on the homepage

---

## Week 6 — Homepage Polish

### Goal

Turn the homepage from a skeleton into a strong first impression.

### Tasks

- Finalize hero copy
- Add selected projects
- Add engineering/design positioning
- Add visual hierarchy
- Improve spacing and responsive behavior
- Add subtle interactions only if they support the experience

### Positioning idea

```txt
Frontend engineer crafting polished, performance-minded interfaces across web and cross-platform products.
```

Alternative direction:

```txt
I build user-facing systems where architecture, interaction, and aesthetics meet.
```

### Homepage message should communicate

- You are a frontend engineer
- You care about design
- You can work beyond React
- You understand performance
- You can lead projects
- You can explain product impact

### Semi-vibe-coding prompt idea

```txt
Refine this Astro homepage for a frontend engineer portfolio.
The positioning should emphasize frontend architecture, visual craft, performance, and framework-agnostic UI engineering.
Keep the tone confident but not arrogant.
Improve the section hierarchy and CTA clarity.
```

### Done criteria

- Homepage feels close to launch quality
- Above-the-fold section is strong
- CTAs are clear
- The design direction feels consistent with Arkaes

---

# Phase 5 — Case Studies

## Week 7 — Case Study Template

### Goal

Create a reusable case-study layout.

### Case study sections

```txt
- Overview
- Context
- Problem
- Role
- Constraints
- Process
- Solution
- Technical decisions
- Result / impact
- Reflection
```

### Suggested layout components

```txt
CaseStudyHero.astro
CaseStudyMeta.astro
CaseStudySection.astro
CaseStudyImage.astro
CaseStudyCallout.astro
```

### Semi-vibe-coding prompt idea

```txt
Create a reusable Astro case study layout for a frontend engineer portfolio.
The layout should support overview, problem, constraints, process, solution, technical decisions, impact, and reflection.
Make it elegant, readable, and suitable for long-form project storytelling.
```

### Done criteria

- Case-study template exists
- One dummy case study can use it
- Layout is readable on mobile
- Metadata is clear

---

## Week 8 — First Professional Case Study

### Goal

Complete one high-quality professional case study first instead of writing many weak project pages.

### Recommended first case study

Start with:

```txt
SmartThings Air Care Service
```

Reason:

```txt
This is likely the strongest professional signal because it can show production work, performance thinking, caching strategy, collaboration, and measurable impact.
```

### Suggested case study angle

```txt
A SmartThings service plugin where I contributed to the frontend experience and improved loading performance through a caching mechanism.
```

### Sections to write

```txt
- Overview
- Context
- Problem
- My role
- Constraints
- Technical decisions
- Caching/performance strategy
- Result / impact
- Reflection
```

### Important notes

Be specific, but avoid exposing confidential company information.

Use careful wording:

```txt
Good:
- Improved page load time by around 30%
- Implemented a caching mechanism to reduce repeated loading cost
- Worked within production constraints

Avoid:
- Internal architecture details that should not be public
- Private business data
- Unapproved screenshots
```

### Semi-vibe-coding prompt idea

```txt
Help me write a professional portfolio case study for SmartThings Air Care Service.
The case study should emphasize frontend performance, caching strategy, production constraints, my contribution, and measurable impact.
Keep the tone professional and credible.
Avoid exposing confidential implementation details.
```

### Done criteria

- SmartThings Air Care Service has a complete case study
- The problem-solution-impact flow is clear
- Your contribution is specific
- The impact is believable and not exaggerated
- The content does not expose confidential information

---

## Week 9 — Remaining Project Pages

### Goal

Add the remaining project pages and keep the Professional Works / Side Projects separation clear.

### Professional Works

```txt
1. SmartThings Air Care Service
2. Virtual Home — SmartThings Simulator Plugin
3. Virtual Home for TV
```

### Side Projects

```txt
1. Treely
2. Milk Tracker App
```

### Suggested depth

| Project | Depth | Focus |
|---|---|---|
| SmartThings Air Care Service | Deep | Performance, caching, production impact |
| Virtual Home — SmartThings Simulator Plugin | Deep/Medium | Refactoring, maintainability, optimization |
| Virtual Home for TV | Medium/Short | TV platform adaptation and interaction model |
| Treely | Deep | Product ownership, React Native, team leadership |
| Milk Tracker App | Medium/Short | Personal utility, AI-assisted summaries, product empathy |

### Tasks

- Add Virtual Home — SmartThings Simulator Plugin page
- Add Virtual Home for TV page
- Add Treely page
- Add Milk Tracker App page
- Add category labels to project cards
- Add project cards to the homepage and project index
- Decide whether Treely should become the second deep case study

### Recommended writing strategy

Use different page depths:

```txt
Deep case studies:
- SmartThings Air Care Service
- Treely

Medium case studies:
- Virtual Home — SmartThings Simulator Plugin

Short project notes:
- Virtual Home for TV
- Milk Tracker App
```

This keeps the portfolio realistic for the available weekend-only timeline.

### Semi-vibe-coding prompt idea

```txt
Help me create concise but credible portfolio project pages for:
- Virtual Home — SmartThings Simulator Plugin
- Virtual Home for TV
- Treely
- Milk Tracker App

Keep Professional Works and Side Projects clearly separated.
For each project, write summary, role, stack, problem, solution, impact, and reflection.
Use deeper detail for Treely and shorter treatment for the others.
```

### Done criteria

- All five projects exist
- Professional Works and Side Projects are clearly separated
- At least one professional project has a deep case study
- At least one side project has a strong story
- The project list feels complete but not bloated

---

# Phase 6 — Interaction Layer

## Week 10 — Lit Enhancements

### Goal

Use Lit to add meaningful, tasteful interactivity.

### Candidate Lit components

```txt
ark-theme-toggle
ark-custom-cursor
ark-project-filter
ark-scroll-progress
ark-command-menu
```

### Recommended priority

```txt
1. ark-theme-toggle
2. ark-custom-cursor
3. ark-project-filter
4. ark-scroll-progress
```

Only build `ark-command-menu` if there is enough time.

### Interaction rules

- Must not hurt accessibility
- Must not hurt performance
- Must work on mobile or gracefully disable
- Must not distract from the content
- Must have reduced-motion consideration

### Semi-vibe-coding prompt idea

```txt
Create a Lit custom cursor component for a portfolio website.
It should feel polished and subtle, support reduced-motion preferences, and gracefully disable on touch devices.
Use CSS custom properties for styling.
Avoid excessive animation complexity.
```

### Done criteria

- Lit components enhance the site
- No interaction feels gimmicky
- Components degrade gracefully
- Reduced motion is respected

---

# Phase 7 — Quality Pass

## Week 11 — Responsive, Accessibility, and Content Review

### Goal

Make the website feel professional across devices.

### Tasks

- Check mobile layout
- Check tablet layout
- Check desktop layout
- Check keyboard navigation
- Check color contrast
- Check focus states
- Check semantic HTML
- Check headings structure
- Review all copy
- Remove weak sections
- Remove unused components

### Manual checklist

```txt
Navigation:
- Can I use the site with keyboard only?
- Is the active/focus state visible?

Responsive:
- Does the hero work on small screens?
- Are project cards readable?
- Are case studies comfortable to read?

Accessibility:
- Are buttons actually buttons?
- Are links actually links?
- Are images described properly?
- Is reduced motion handled?

Content:
- Does every section have a purpose?
- Does the portfolio clearly say what I do?
- Are project impacts believable and specific?
```

### Done criteria

- Site works well on mobile
- Site works well on desktop
- No obviously broken responsive section
- Keyboard navigation is acceptable
- Copy feels professional

---

## Week 12 — Performance, SEO, Deployment, and Launch

### Goal

Prepare the site for public sharing.

### Tasks

- Add metadata per page
- Add Open Graph image
- Add sitemap
- Add robots.txt
- Optimize images
- Check Lighthouse
- Check bundle size
- Deploy
- Test production URL
- Add README
- Write technical architecture note

### Suggested deployment targets

```txt
- Vercel
- Netlify
- Cloudflare Pages
```

### Launch checklist

```txt
SEO:
- title
- description
- canonical URL
- Open Graph
- Twitter card
- sitemap

Performance:
- optimized images
- minimal client JavaScript
- no unnecessary hydration
- no heavy animation library unless needed

Content:
- no placeholder text
- no broken links
- no empty project pages
- contact links work

Technical:
- README explains stack
- architecture note explains Astro + Lit + design system
```

### Done criteria

- Website is live
- Lighthouse score is strong
- Main pages have metadata
- Project links work
- README exists
- You can confidently share the URL

---

# Optional Phase 8 — After Launch Improvements

Do these only after the first public version is already live.

## Possible improvements

```txt
- Add blog/articles
- Add design system documentation page
- Add component playground
- Extract more components into @arkaes/ui
- Add visual regression testing
- Add Playwright smoke tests
- Add command palette
- Add animation polish
- Add more case studies
```

## Design system documentation idea

Add a page like:

```txt
/projects/arkaes-ui
```

or

```txt
/design-system
```

Use it to explain:

- why you used Lit
- how tokens work
- how components are structured
- how Astro consumes the components
- what you learned about framework-agnostic UI

---

# Weekly Working Method

Each weekend, use this rhythm.

## 1. Start with a clear target

Before coding, write:

```txt
This weekend's goal:
By the end of this session, I want to finish ______.
```

Example:

```txt
This weekend's goal:
Set up the monorepo and make Astro render one Lit component from @arkaes/ui.
```

## 2. Ask AI for implementation help

Use AI for:

- boilerplate
- setup
- first drafts
- component scaffolding
- copywriting drafts
- refactoring suggestions
- accessibility review
- bug investigation

## 3. Manually review everything

Do not accept generated code blindly.

Check:

```txt
- Does this abstraction make sense?
- Is the code readable?
- Is there a simpler way?
- Is this component actually needed?
- Is the styling consistent?
- Does it hurt performance?
```

## 4. End with a checkpoint

At the end of each weekend, write a short note:

```txt
Completed:
- ...

Problems:
- ...

Next weekend:
- ...
```

This prevents vibe-coding drift.

---

# AI Usage Rules for Semi-Vibe-Coding

## Good AI tasks

```txt
- Generate initial project setup
- Create component scaffolds
- Suggest file structure
- Refactor repetitive code
- Improve copy
- Review accessibility
- Review responsive CSS
- Generate test cases
- Explain unfamiliar Astro or Lit concepts
```

## Risky AI tasks

```txt
- Creating too many abstractions
- Adding unnecessary dependencies
- Inventing complex design-system APIs
- Overengineering animations
- Writing generic portfolio copy
- Making the site look like a template
```

## Required review prompts

Use these prompts regularly.

### Architecture review

```txt
Review this architecture. Tell me what is overengineered, what is missing, and what should be simplified.
```

### Component review

```txt
Review this Lit component for API design, accessibility, performance, and unnecessary complexity.
```

### Copy review

```txt
Review this portfolio copy. Make it more specific, less generic, and more credible without exaggerating my impact.
```

### Visual review

```txt
Review this UI direction. Does it feel polished, professional, and aligned with a frontend engineer who also cares about design?
```

### Performance review

```txt
Review this Astro page and tell me what might increase JavaScript, layout shift, or loading cost unnecessarily.
```

---

# Scope Control

## Must-have for v1

```txt
- Homepage
- About section/page
- Project listing separated into Professional Works and Side Projects
- All 3 Professional Works listed
- Both Side Projects listed
- At least 1 deep professional case study
- At least 1 strong side-project story
- Contact section
- Responsive layout
- SEO metadata
- Deployed website
```

## Nice-to-have for v1

```txt
- Theme toggle
- Custom cursor
- Project filter
- Smooth page transitions
- Design system explanation page
```

## Not needed for v1

```txt
- Full Storybook setup
- Complete component documentation
- NPM publishing
- Blog
- CMS
- Authentication
- Complex animation system
- Dozens of components
```

---

# Decision Log

Use this section to record important project decisions.

## Decision 1 — Use Astro for the portfolio

Reason:

```txt
The portfolio is mostly a content-driven website. Astro provides routing, static rendering, content support, SEO, and performance benefits without forcing unnecessary client-side JavaScript.
```

## Decision 2 — Use Lit for the UI package

Reason:

```txt
Lit demonstrates framework-agnostic UI engineering and deeper web platform knowledge. It also supports the positioning of Arkaes as architecture + aesthetics, not merely another React portfolio.
```

## Decision 3 — Use a monorepo from day one

Reason:

```txt
This keeps the path stable and allows the portfolio to consume the Lit-based UI package from the beginning.
```

## Decision 4 — Keep the design system minimal at first

Reason:

```txt
The design system should serve the portfolio, not delay it. Components should be created when the portfolio actually needs them.
```

---

# Definition of Done for v1

The portfolio v1 is considered done when:

```txt
- The website is deployed publicly
- The homepage clearly communicates your positioning
- The homepage features the strongest selected work
- The projects page separates Professional Works and Side Projects
- All 3 Professional Works are listed
- Both Side Projects are listed
- At least 1 professional case study is deep and polished
- At least 1 side project has a strong product story
- The site uses Astro and the Lit-based UI package
- The design tokens are centralized
- The site works well on mobile and desktop
- Basic accessibility is handled
- SEO metadata exists
- The README explains the technical architecture
```

---

# Suggested Final README Summary

```txt
Arkaes Portfolio is a performance-first personal portfolio built with Astro and a small Lit-based design system.

The project uses Astro for static content delivery, routing, SEO, and page structure, while Lit powers reusable framework-agnostic UI components. The goal is to demonstrate frontend engineering beyond framework familiarity: design tokens, component architecture, performance awareness, accessibility, and polished visual execution.
```

---

# Final Reminder

The main risk is not technical failure.

The main risk is spending too much time building the design system and not enough time finishing the portfolio.

Keep the design system real, small, and useful.

Build only what the portfolio needs.

Launch v1 first.
