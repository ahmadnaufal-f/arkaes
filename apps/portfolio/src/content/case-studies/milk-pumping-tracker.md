---
title: "Building a milk pumping tracker with AI summaries"
shortDesc: "Designed, built, and shipped a milk pumping tracker for busy mothers — a fast logging flow backed by Firebase, plus an OpenAI-powered review layer that summarizes sessions and suggests follow-up questions."
featured: true
visual: "milk-pumping"
tags:
  - React
  - Vite
  - Firebase
  - OpenAI
  - Side Project
---

## Overview

I built and shipped a milk pumping tracker for mothers who need a simple way to record and review pumping sessions.

The app helps users track pumping time, milk amount, and pumping duration. I also added an AI summarizer using the OpenAI API, so users can review their logs more easily without manually reading every entry.

This project started from a real parenting workflow. Pumping data often needs to be recorded during busy or tiring moments, so the app needed to be fast, simple, and easy to use.

As a personal product, this case study uses real screenshots from the shipped app.

## My role

I designed, built, and shipped the app on my own as a personal product.

My responsibilities included:

• Designing the main tracking flow
• Building the app with React and Vite
• Using Firebase as the backend as a service
• Structuring the pumping session data
• Integrating the OpenAI API
• Designing the AI summary and follow-up question flow

## The problem

Tracking pumping sessions sounds simple, but the real context makes it harder.

Mothers may need to record data while caring for a baby, preparing bottles, washing pump parts, or handling other tasks. A tracker that takes too many steps can quickly become frustrating.

The app needed to support two key moments:

• Fast recording when the user finishes a pumping session
• Easy review when the user wants to understand recent patterns

## Product approach

The core tracking flow focuses on three required pieces of data: pumping time, milk amount, and pumping duration. I kept the main form focused on these essentials so users can record sessions quickly, then start a live timer for the session itself.

![Home screen with the daily greeting and today's pumping summary](/case-studies/milk-pumping-tracker/home-screen.png)
![Active pumping session with an elapsed and remaining timer](/case-studies/milk-pumping-tracker/pumping-session.png)

For users who want AI summaries, the app can also use optional context:

• Baby birth date
• Feeding method
• Pumping goals

This keeps the main tracker simple while giving the AI enough context to create more useful summaries.

## AI integration

The AI feature uses the OpenAI API to summarize the user's pumping logs.

It can summarize recent sessions, describe visible patterns, and generate follow-up questions. Users can select one of those questions, and the app answers it based on the recorded logs and optional context.

![Weekly insights screen with an AI summary, suggestions, and selectable follow-up questions](/case-studies/milk-pumping-tracker/weekly-insights.png)

The AI feature is designed as a review layer. It helps users understand their data, while the core tracker remains useful even without AI.

## Technical direction

The app was built with React, Vite, Firebase, and the OpenAI API.

Before sending data to the AI, the app prepares the relevant logs and optional context. This keeps the input focused and avoids passing unnecessary information to the model.

![Data flow — session logs and optional context are prepared into focused input before reaching the OpenAI API, which returns the review layer](/case-studies/milk-pumping-tracker/ai-flow.svg)

```txt
Pumping session input
  ↓
Firebase data storage
  ↓
Session history
  ↓
Prepared AI context
  ↓
OpenAI API
  ↓
Summary and follow-up questions
```

## Results

The project resulted in a shipped product that combines simple tracking with AI-assisted review.

The app provides:

• Fast pumping session logging
• History based on time, amount, and duration
• Optional AI context for better summaries
• AI-generated summaries from recorded logs
• Follow-up questions that help users explore their data

The main result was a product where AI supports a real user need instead of becoming the whole experience.

## What I learned

This project taught me that small products still need careful design.

A tired or busy user does not need a complicated interface. They need a tool that respects their situation.

I also learned that AI works best when it supports a clear workflow. In this app, AI helps users review their data with less effort, while the structured tracking flow stays simple and reliable.
