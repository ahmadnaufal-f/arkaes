---
title: "Modernizing Virtual Home into a shared frontend platform"
shortDesc: "Led a frontend monorepo migration for a smart home simulation platform, unifying two product variants and achieving ±87% code sharing, ±40% smaller app size, and ±65% faster Time To Interactive."
projectName: "Virtual Home"
order: 1
featured: true
visual: "virtual-home"
tags:
  - TypeScript
  - Lit
  - Redux
  - Monorepo
  - Tech Lead
---

## Overview

Virtual Home is a smart home simulation platform used across different product environments. It helps teams develop, test, and validate smart home experiences without depending on every physical device setup.

The original application had been developed several years earlier. As the product grew, the codebase accumulated different implementation styles, which made changes harder to reason about. When another product variant was introduced, the team needed a more scalable foundation that could support both variants without duplicating too much work.

As the tech lead, I led more than 10 engineers across multiple teams to rewrite and unify the frontend into a single monorepo. The new foundation used TypeScript, Lit, Redux, lazy loading, and clearer architectural boundaries.

The project was shipped and led to a smaller app size, faster interaction time, faster bug resolution, smoother onboarding, and better maintainability.

Some product details are generalized for confidentiality.

## Project context

Virtual Home needed to support more than one product context.

One variant was built for a mobile experience. Another variant was built for the Family Hub Refrigerator screen. Both variants shared many parts of the same foundation, including UI, logic, assets, translations, and device related behavior.

Maintaining those variants separately would create repeated work and make future changes harder to align. The team needed a shared foundation that could support both variants while still allowing product specific behavior where needed.

## My role

I worked as the tech lead for this project.

My responsibilities included:

• Leading the technical direction
• Designing the new frontend architecture
• Planning the repository unification
• Coordinating more than 10 engineers across multiple teams
• Reviewing implementation quality
• Defining clearer coding standards
• Guiding the migration from JavaScript to TypeScript
• Choosing Lit as the main UI foundation
• Choosing Redux for predictable state management at project scale
• Helping engineers understand and follow the new structure

## The problem

The original frontend had grown over several years and used different implementation patterns across the codebase.

As the product scope expanded, the team started to face several challenges.

Changes required more careful validation because the code flow was not always easy to trace. Similar UI and logic existed in more than one place. Bug investigation took longer than expected. New engineers also needed extra time to understand how the project was structured.

When the second product variant was introduced, these challenges became more visible. The team needed a stronger shared foundation instead of continuing to maintain similar work in separate places.

## Goals

The modernization had several goals:

• Unify the product variants into one repository
• Reduce duplicated UI, logic, assets, and translations
• Improve app size and initial interaction speed
• Make bug investigation and bug resolution faster
• Make onboarding smoother for new engineers
• Create clearer architectural boundaries
• Keep shared behavior reusable while preserving product specific flexibility

## Why a monorepo

The two product variants shared most of their foundation. Around ±87% of the UI and logic could be shared, while the remaining parts were specific to each product context.

A monorepo allowed the team to keep shared code in one place and separate product specific behavior only where needed.

This helped us share:

• UI components
• Assets
• Translations
• Device related logic
• Common utilities
• Build and development pipeline

The result was a cleaner development model with fewer duplicated changes.

## Technical direction

### JavaScript to TypeScript

The new foundation was moved from JavaScript to TypeScript.

TypeScript helped the team make data structures more explicit, catch mistakes earlier, and work with shared logic more confidently.

### Imperative UI to declarative UI

The previous implementation relied heavily on imperative UI updates. As the app grew, this made UI behavior harder to follow.

The rewrite used Lit to create a more declarative component model. This made components easier to reason about, reuse, and maintain across variants.

### Clearer architectural boundaries

The previous structure did not make responsibilities clear enough.

In the new foundation, UI rendering, state management, shared logic, and product specific behavior were separated more clearly. This helped engineers understand where each type of code should live.

### Lazy loading

The previous implementation loaded all major sections during the first launch.

In the new architecture, sections were loaded only when needed. This reduced initial work and helped improve Time To Interactive.

### Redux for state management

I chose Redux because the project scale required predictable state management.

The app needed to support shared behavior across variants, many device states, and many engineers working in the same repository. Redux gave the team a consistent way to manage state changes and debug application behavior.

## Architecture

The new repository was organized around shared foundation code and product specific code.

![Monorepo architecture — shared foundation with product-specific variant layers](/case-studies/virtual-home/architecture.svg)

```txt
Virtual Home monorepo

Shared foundation
  Shared UI components
  Shared assets
  Shared translations
  Shared utilities
  Shared device logic
  Shared state management

Product variants
  Mobile variant
  Larger screen variant

Product specific layer
  Product specific behavior
  Layout adaptation
  Integration details
```

This structure allowed the team to reuse most of the foundation while keeping each product variant flexible.

## Implementation approach

I started by analyzing the existing codebase and identifying which parts could be shared across variants.

After that, I helped define the new repository structure and separated the project into shared foundation code and product specific code. Shared UI, logic, assets, and translations were moved into reusable areas. Product specific behavior stayed isolated in its own layer.

I also introduced clearer rules for adding new features. This helped the team avoid repeating the same structural problems as the product continued to grow.

Since the project involved more than 10 engineers across multiple teams, the architecture had to be easy to explain and easy to follow. I spent part of my role reviewing implementation, aligning the team on technical direction, and helping engineers contribute within the new structure.

The rewrite was shipped successfully.

## Results

The modernization produced measurable improvements:

![Key results — 87% code sharing, 40% smaller app, 65% faster TTI, 70% faster bug resolution, 31% quicker onboarding](/case-studies/virtual-home/results.svg)

• ±40% smaller app size
• ±65% faster Time To Interactive
• ±70% faster bug resolution
• ±31% quicker onboarding
• ±87% shared UI and logic across variants
• One unified repository for both product variants
• Fewer duplicated assets, translations, and shared logic

The main result was a more maintainable frontend foundation. The team could develop shared behavior more efficiently, isolate product specific logic more clearly, and onboard engineers with less friction.

## What I learned

This project taught me that frontend architecture becomes more important when a product needs to support multiple product contexts.

The previous app had served its purpose, but the growing scope required a stronger foundation. The rewrite helped the team improve performance, maintainability, collaboration, and delivery speed.

I also learned that a large rewrite needs more than technical decisions. It requires clear communication, shared standards, careful coordination, and an architecture that many engineers can understand quickly.
