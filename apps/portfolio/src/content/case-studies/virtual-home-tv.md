---
title: "Building focus navigation for Virtual Home for TV"
shortDesc: "Designed and implemented a TV remote navigation system from scratch, supporting three distinct page layout patterns with precalculated focus mapping for performant directional navigation."
projectName: "SmartThings Virtual Home for TV"
order: 2
featured: true
visual: "virtual-home-tv"
tags:
  - TypeScript
  - Redux
  - TV Apps
  - Focus Navigation
---

## Overview

Virtual Home for TV is a smart home simulation experience designed for TV based environments. Unlike mobile or desktop apps, TV apps need to support remote control navigation, focus states, and predictable movement between UI elements.

I joined this project with no prior experience in TV app development. My main contribution was designing and implementing the focus navigation system by myself.

The project was shipped in early 2025. The final solution supported different page layout patterns, improved navigation performance through precalculated focus mapping, and created a reusable base system that could be used across pages.

Some product details are generalized for confidentiality.

## Project context

Virtual Home for TV needed to work in a TV based environment where users interact with the app differently from mobile or desktop.

On mobile, users can tap directly on the screen. On desktop, users can use a mouse. On TV, the main interaction model often depends on a remote control. This means the app needs to manage which element is currently focused and where the focus should move when the user presses up, down, left, or right.

The broader project also needed to support various TV contexts, including different input modes and screen behavior. Those areas were handled by other team members. My main ownership was the focus navigation system.

The challenge was that the pages did not share one consistent layout pattern. Some pages used structured grid layouts, while others had scattered elements with different visual arrangements.

## My role

I worked as the main contributor for the TV focus navigation system.

My responsibilities included:

• Learning the TV app interaction model from scratch
• Designing the focus navigation strategy
• Implementing the base focus navigation system
• Handling different page layout patterns
• Improving navigation performance
• Reducing repeated DOM queries during navigation
• Making the focus navigation system reusable across pages
• Working with TypeScript and Redux in the existing codebase

## The problem

TV navigation is different from web navigation on desktop or mobile.

On desktop, users can click any visible element with a mouse. On mobile, users can tap directly on the screen. On TV, users often move through the interface using directional buttons on a remote control.

This means the app needs to decide which element should receive focus when the user presses up, down, left, or right.

At first, this seemed like a simple problem. However, Virtual Home for TV had pages with many different layouts.

Some pages were easier to handle because the elements followed a clear grid. Other pages had scattered elements where the next focus target was not obvious from the DOM order alone. Some pages also rendered dynamic content, so the available focus targets could change after rendering.

The focus system needed to work across all of these cases while keeping navigation predictable and performant.

## Goals

The focus navigation system had several goals:

• Support directional navigation using a TV remote
• Make focus movement predictable across different layouts
• Support structured grid pages
• Support scattered pages with static content
• Support scattered pages with dynamic content
• Reduce repeated DOM queries during navigation
• Create a reusable foundation for focus behavior across pages
• Keep the system flexible enough to work with the broader TV app behavior

## Layout classification

I started by classifying the pages into three main categories.

![Three page layout categories — structured grid, static scattered, and dynamic scattered — each with a different navigation strategy](/case-studies/virtual-home-tv/layout-classification.svg)

### Structured grid pages

Some pages had a clear row and column structure, but not always inside a single grid container. A page could contain multiple grid sections, and the focus system needed to move naturally inside one grid before continuing to the next available section.

For this category, I used an index based mathematical approach. Horizontal navigation moved the active index by one. Vertical navigation moved the active index based on the number of columns in the current grid.

When the calculated next index was available, the focus moved inside the same grid. When the next index was not available, the system checked whether another grid container existed in the requested direction and moved the focus there instead.

```txt
Right  active index + 1, or move to the next grid container
Left   active index - 1, or move to the previous grid container
Down   active index + column count, or move to the next grid container
Up     active index - column count, or move to the previous grid container
```

### Static scattered pages

Some pages had scattered elements with fixed content. The visual layout did not follow a clean grid, but the focus relationship between elements was known.

For these pages, I used predefined navigation targets through HTML data attributes. Each focusable element could define which element should receive focus when the user pressed a specific direction.

This gave precise control over focus behavior on pages where the visual layout was custom and static.

### Dynamic scattered pages

Some scattered pages rendered content dynamically. In these pages, predefined navigation was not enough because the number and position of focusable elements could change after rendering.

For this category, I calculated the position of all focusable elements after each render and generated the next focus mapping based on their positions. The navigation system could then reuse that mapping during directional input.

## Technical direction

The focus navigation system was built with TypeScript and Redux in the existing application.

TypeScript helped define the focus data structure more clearly. Redux helped coordinate focus related state with the rest of the app behavior.

The core idea was to separate focus calculation from focus movement.

Focus calculation happened when the page structure was ready. Focus movement happened when the user pressed directional buttons.

This made the system more efficient because the app did not need to search the DOM repeatedly for every navigation action.

## Performance approach

A straightforward implementation would search the DOM every time the user pressed a remote control button — easier to start with, but less efficient as the number of focusable elements grew.

To improve this, I used precalculated next focus mapping. After a page rendered, the system prepared the relationship between focusable elements in advance.

![Performance approach — separating focus calculation at render time from focus movement at navigation time](/case-studies/virtual-home-tv/performance-approach.svg)

When the user pressed up, down, left, or right, the system could use the prepared mapping directly instead of running repeated DOM queries. This made navigation more efficient and helped keep focus movement responsive.

## Results

The focus navigation system helped Virtual Home for TV support complex navigation behavior across different page layouts.

The result included:

• A reusable base focus navigation system across pages
• Predictable directional navigation for TV remote users
• Support for structured grid pages with multiple grid containers
• Support for static scattered pages with predefined focus targets
• Support for dynamic scattered pages with position-based mapping
• Better navigation performance through precalculated focus mapping
• Reduced repeated DOM queries during remote control navigation
• Shipped in early 2025

## What I learned

This project taught me that TV app development requires a different way of thinking about frontend interaction.

On desktop and mobile, users can directly point to what they want. On TV, the app needs to guide the user through focus movement. That makes focus behavior part of the core user experience.

I also learned that one navigation strategy does not fit every layout. A grid page, a static scattered page, and a dynamic scattered page each need a different approach.

The most valuable part of the project was learning how to break a difficult interaction problem into smaller layout categories, then design a reusable system that could support each one.
