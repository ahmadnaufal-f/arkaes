---
title: "Leading SmartThings Find for iOS Through Changing Requirements"
shortDesc: "Led a team of four frontend engineers to bring SmartThings Find to iOS, navigating platform limitations, evolving requirements, and demanding QA while delivering on schedule."
projectName: "SmartThings Find for iOS"
order: 1
featured: true
visual: "find-ios"
category: "professional-work"
tags:
  - TypeScript
  - Lit
  - Web Components
  - Map Integration
  - Tech Lead
---

## Overview

SmartThings Find helps users locate supported devices and items through the SmartThings ecosystem.

Bringing this experience to iOS meant reproducing much of the functionality that had evolved over years on Android, while adapting it to a different platform and its technical limitations.

I led a team of four frontend engineers, including myself, at Samsung R&D Institute Indonesia. We were responsible for delivering a substantial set of features within a demanding schedule, with requirements that continued evolving throughout development and quality assurance.

Some project details are generalized for confidentiality.

## My role

As the frontend team lead, I was responsible for defining the technical direction, designing the architecture, distributing tasks, reviewing implementations, and coordinating priorities with the project manager.

I also contributed directly to the implementation, particularly the map architecture supporting multiple providers.

My main responsibility was **keeping the team productive and the implementation maintainable while navigating changing requirements and delivery constraints.**

## The challenge

### More than meets the eye

The project initially appeared relatively straightforward based on its UI guide. However, the underlying application logic was considerably more complex than the interface suggested.

Some features also depended on native operating system capabilities that weren't directly available in our web based environment.

We needed to investigate alternatives while ensuring that the iOS experience remained consistent with the established Android version. Where limitations couldn't be reasonably addressed, I worked with the project manager to negotiate priorities and adjust the scope.

I explored what this experience taught me about evaluating project complexity in my article, [**The UI Looked Simple. The Engineering Wasn't.**](https://www.arkaes.dev/blog/the-ui-looked-simple-the-engineering-wasnt).

### Requirements that kept changing

Another challenge was the evolving scope, with new requirements arriving even during the QA phase.

As the deadline approached, we needed to balance new requests, existing functionality, and issue resolution without overwhelming the team.

**Prioritization became as important as implementation.**

## Designing for maintainability

One decision that proved valuable was establishing clear architectural boundaries early in development.

For example, the application needed to support both Google Maps and Naver Maps. Rather than integrating their SDKs directly into application logic, I designed a shared abstraction with consistent interfaces for maps, markers, and polylines.

This included custom Lit Web Components to provide similar integration patterns where equivalent components weren't available.

The architecture helped us accommodate changes without repeatedly restructuring the application or duplicating provider specific behavior.

I explained the technical approach in [**Designing Map Integrations for Change**](https://www.arkaes.dev/blog/designing-map-integrations-for-change).

## Leading the team through QA

The most demanding period came near release, when we received a large number of issue reports within a short time.

With only four engineers and an approaching deadline, I needed to make sure the workload remained manageable.

I reviewed the issues, redistributed tasks based on urgency and complexity, and coordinated with the project manager to determine which problems required immediate attention.

I also took responsibility for communicating progress and managing stakeholder expectations.

**I wanted my team to focus on solving engineering problems without carrying the additional pressure surrounding the release.**

Meanwhile, we relied on automated tests to verify expected behavior and reduce regression risks as we addressed issues.

Through careful prioritization, testing, and the team's combined effort, we managed to resolve the reported issues within our responsibilities before the deadline.

## Results

SmartThings Find for iOS was publicly released in September 2026.

Our team **completed its responsibilities on schedule**, despite the broad feature scope, platform limitations, and evolving requirements.

Alongside delivering the required functionality, we established a maintainable map architecture and resolved a substantial volume of issues during QA.

For me, the most meaningful achievement was seeing our small team navigate those challenges together and contribute to a production release.

## What I learned

Looking back, I would spend more time evaluating the underlying behavior and technical dependencies before estimating an unfamiliar project. My initial assessment relied too heavily on the interface, which caused me to underestimate the work involved.

At the same time, the project reinforced the value of thoughtful architecture. The foundations we established helped us respond to changes that we couldn't have anticipated from the beginning.

Most importantly, I learned that **engineering leadership requires knowing when to focus on technical decisions and when to focus on supporting the team.**

During the most demanding periods, managing priorities, communicating expectations, and protecting the team's focus became some of my most important responsibilities.

I'm proud of what we accomplished together and grateful to the engineers who made it possible.
