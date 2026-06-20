---
title: "Modernizing SmartThings Air Care's legacy frontend"
shortDesc: "Led a small frontend team to modernize a legacy air quality experience, migrating it to TypeScript, introducing Zustand, and improving first load by around 50% and second load by around 80%."
projectName: "SmartThings Air Care"
order: 4
featured: false
visual: "air-care"
category: "professional-work"
tags:
  - TypeScript
  - Lit
  - Zustand
  - Vite
  - Project Lead
---

## Overview

SmartThings Air Care is a smart home experience that helps users monitor indoor and outdoor air quality and control air related smart devices from one place.

Through this experience, users can check the air condition around them and manage devices such as air conditioners, air purifiers, and dehumidifiers more easily.

I worked as the project lead in a team of three engineers, including myself. My responsibilities included planning tasks, defining the technical direction, reviewing pull requests, coordinating with another team, and guiding the migration of the legacy codebase into a more maintainable frontend foundation.

The modernization improved maintainability, made debugging easier, and helped the app load faster. After moving to the newer architecture, the first load became around 50% faster, while the second load became around 80% faster.

Some product details are generalized for confidentiality.

## Project context

SmartThings Air Care was received as a legacy project from another team.

The original application was built with plain JavaScript and handled state management through its own custom approach. This worked when the project was smaller, but it became harder to maintain as the application grew.

The team needed to continue delivering product improvements while also improving the technical foundation. Because the team was small and the schedule was tight, the migration had to be practical. We could not stop everything and rewrite the whole project at once.

The project became the first major playground for my team to explore a more modern frontend setup. It helped us experiment with Lit components, Zustand state management, TypeScript migration, and Vite before those ideas influenced later projects.

## My role

I worked as the project lead for this project.

My responsibilities included:

• Leading a team of three engineers, including myself
• Planning development tasks
• Defining the technical direction
• Reviewing pull requests
• Coordinating with another team
• Guiding the gradual migration from JavaScript to TypeScript
• Introducing Zustand for simpler state management
• Building the early caching mechanism
• Exploring Vite as a faster build tool
• Helping the team create a cleaner and easier to debug frontend structure

## The problem

The original frontend had become harder to maintain.

Since the app was built with plain JavaScript, many data structures and state changes were not explicit. This made it easier to introduce mistakes and harder to understand the expected shape of the data.

State management was also handled through a custom approach. As more features were added, the flow of data became harder to trace. Debugging took more effort because the team needed to understand both the product behavior and the custom state handling pattern.

The team also needed to improve loading performance. Air quality and device related information can involve multiple data sources, so unnecessary loading time could make the experience feel slower than it needed to be.

## Goals

The modernization had several goals:

• Gradually migrate the codebase from JavaScript to TypeScript
• Replace custom state handling with a simpler state management solution
• Improve maintainability without blocking product delivery
• Make debugging easier for the team
• Improve first load and second load performance
• Explore a faster build setup with Vite
• Create a better technical foundation for future frontend projects

## Technical direction

### Gradual JavaScript to TypeScript migration

The migration to TypeScript was done gradually.

This approach allowed the team to keep delivering work while improving the codebase step by step. Over time, the project became fully TypeScript.

TypeScript made the code easier to understand because data structures became more explicit. It also helped the team catch mistakes earlier and work with more confidence when changing existing features.

![Gradual migration from JavaScript to TypeScript](/case-studies/air-care/migration-approach.svg)

### Zustand for simpler state management

The previous state management approach was custom and became harder to maintain.

Because the team was small and the schedule was tight, I chose Zustand as a simpler state management solution. It gave the team a clear way to manage shared state without adding too much structure or setup.

This made the state flow easier to follow and helped reduce the mental overhead when debugging application behavior.

### Caching for faster loading

In the earlier phase, I built a caching mechanism to improve the loading experience.

The goal was to reduce unnecessary waiting time when users opened the app and returned to previously loaded data. This was especially useful because the app handled air quality information and device related data that did not always need to be fetched again immediately.

After moving to the newer architecture, the first load became around 50% faster and the second load became around 80% faster.

### Exploring Vite

The project also became a place for the team to experiment with Vite.

At that time, the migration from Webpack to Vite was more of an experiment than the main product goal. However, it helped the team understand how a faster build tool could improve the development experience.

This experiment later influenced how we approached other frontend projects.

## Architecture improvement

The modernization focused on making the codebase easier to maintain and easier to debug.

The newer foundation separated responsibilities more clearly. UI components were built with Lit, state management was moved to Zustand, and TypeScript helped define data more safely.

The separation allowed the team to understand where UI logic, shared state, and data related behavior should live. This structure made the project easier to navigate and gave each engineer a clearer mental model of how the different pieces fit together.

## Implementation approach

I started by understanding the existing legacy codebase and identifying the parts that caused the most maintenance and debugging friction.

Because the team still needed to deliver product work, the migration was planned gradually. We introduced TypeScript step by step instead of rewriting everything at once. This allowed the team to reduce risk while still improving the foundation over time.

I also guided the team in introducing Zustand as the new state management solution. The goal was not to create a heavy architecture, but to make state changes easier to understand and debug.

In parallel, I built the early caching mechanism to improve the loading experience. This helped the app avoid unnecessary repeated work and made the experience feel faster for users.

The project also gave the team space to experiment with Lit and Vite. These experiments helped us build confidence with newer frontend tools and shaped the way we approached later projects.

## Results

The modernization produced several improvements:

• Around 50% faster first load after moving to the newer architecture
• Around 80% faster second load after moving to the newer architecture
• Full migration from JavaScript to TypeScript
• Simpler state management with Zustand
• Improved maintainability
• Easier debugging
• A cleaner foundation for future product development
• Early team experience with Lit, Zustand, TypeScript, and Vite

![Loading performance improvement — first load ~50% faster, second load ~80% faster](/case-studies/air-care/loading-improvement.svg)

The main result was not only a faster app, but also a healthier codebase. The team could understand the project more easily, debug issues with less friction, and build on top of a more reliable frontend foundation.

## What I learned

This project taught me that modernization does not always need to start with a large rewrite.

With a small team and a tight schedule, the better approach was to improve the codebase gradually while still delivering product work. Moving step by step helped the team reduce risk and keep progress realistic.

I also learned that simple tools can be the right choice when they match the team size and project constraints. Zustand worked well because it gave us enough structure without slowing the team down.

Most importantly, SmartThings Air Care became the first place where my team learned and tested ideas that later influenced bigger projects. It helped us build confidence with modern frontend practices before applying them at a larger scale.
