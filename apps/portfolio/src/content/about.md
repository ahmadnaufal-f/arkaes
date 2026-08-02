## Summary

I'm **Ahmad Naufal**, a frontend engineer who works at the seam between design and engineering: design systems, interaction detail, and the architecture underneath both.

At **Samsung Research Indonesia** I've shipped product experiences across mobile, TV, and connected device screens. I led the frontend rewrite that unified two SmartThings Virtual Home variants into a single monorepo, and I lead **OneUX Lab**, the React design system now built by more than 15 engineers across multiple product teams.

What connects that work is a preference for building the layer other people build on — design tokens, component APIs, navigation models, architecture. Not because systems are tidy, but because they decide whether the hundredth screen gets the same care as the first.

Every claim on this page links to the work behind it.

→ ±87% shared | [SmartThings Virtual Home](/case-studies/virtual-home) | Tech lead for the monorepo rewrite that unified two product variants — also ±40% smaller app size, ±65% faster Time To Interactive, and ±31% quicker onboarding.
→ 15+ engineers | [OneUX Lab Design System](/projects/oneux-lab-design-system) | Project lead. I set the architecture, component API conventions, accessibility bar, and release process for a design system used across multiple product teams.
→ ~80% faster | [SmartThings Air Care](/case-studies/air-care) | Project lead on a legacy modernization — second load ~80% faster, first load ~50% faster, and a full JavaScript to TypeScript migration done without pausing delivery.

## What I value

### Clarity before complexity

The hardest part of most frontend problems is not the implementation. It is describing the problem precisely enough that the implementation becomes obvious.

On **Virtual Home for TV** I spent a long time looking for one navigation algorithm that would work on every page, and there wasn't one. What unlocked the project was giving up on that and sorting the pages into three categories instead — structured grids, static scattered layouts, and dynamically rendered scattered layouts. Each got its own strategy: index math for grids, declared focus targets for static pages, position mapping for dynamic ones. One unsolvable problem became three tractable ones.

The same instinct shows up in tool choices. On **Air Care** I picked Zustand over a more capable state library because the team was three people on a tight schedule, and the cost of a heavier abstraction would have been paid every day by everyone.

→ 3 layout models | [Focus navigation for TV](/case-studies/virtual-home-tv) | I joined with no TV experience and owned the focus system end to end — classifying layouts was what made a remote control feel predictable.
→ [Choosing Zustand on Air Care](/case-studies/air-care) | Replacing a custom state layer with the simplest thing that fit the team, not the most powerful thing available.

### Systems over screens

I care about frontend systems that let a product grow without the interface drifting apart.

On **Virtual Home**, around ±87% of the UI and logic ended up shared between a mobile variant and a Family Hub refrigerator variant. That number was as much a design question as an architectural one: it meant deciding, component by component, what "the same" actually means across a phone in your hand and a screen on a fridge door — and where a shared foundation should stop and product specific behavior should begin.

On **OneUX Lab**, the components were never the hard part. Keeping them coherent across a growing contributor base was. As more engineers joined, agreeing on API conventions mattered more than any individual component, so I put effort into versioning through Changesets, accessibility and keyboard reviews, and Storybook documentation that let someone from another team understand a component without asking anyone.

→ ±87% shared UI and logic | [Unifying two product variants](/case-studies/virtual-home) | One monorepo, clear boundaries between shared foundation and product specific layers, coordinated across 10+ engineers.
→ 6 years unmaintained | [Reviving an internal framework](/projects/oneux-lab-design-system) | What began as a revival became a React design system for data dense dashboards and CMS platforms, with conventions to keep 15+ contributors aligned.

### Design decisions are engineering decisions

The change I'm most attached to is a small one.

While building the **Milk Pumping Tracker**, I had put the start and stop buttons near the top of the screen. Reasonable on paper. But the person using it is a mother who may be holding a pump in one hand and the phone in the other, often tired, often mid task. Reading about One UI's approach to thumb reachability made me see it clearly: that wasn't a layout problem, it was an empathy problem. I moved the controls to a floating position at the bottom, where the hand already rests.

Nothing about the architecture changed. The app just stopped fighting the person using it. I think that gap — between an interface that is technically correct and one that fits the moment it's used in — is where most of the interesting frontend work lives.

→ [Designing for a one handed moment](/case-studies/milk-tracker) | A shipped personal product where the design constraint drove the implementation, not the other way round.
→ [What One UI taught me](https://www.linkedin.com/posts/ahmad-naufal-f_oneui-taught-me-something-activity-7462405914063540224-z2tb?utm_source=share&utm_medium=member_android&rcm=ACoAACBA6AwBV5_PTernV1TdRQgzpNomavm4nzk) | I wrote up the reasoning after shipping the change.

### Product minded engineering

I don't think of frontend work as implementing screens. I care why a feature exists and whether the implementation still serves the product a year later.

That usually shows up as restraint. In the **Milk Pumping Tracker**, AI is a review layer that summarizes sessions and suggests follow up questions — the tracker stays completely useful without it, because the core job is logging a session quickly, not talking to a model. In **Arkhe**, the assistant on this site, the interesting decisions were behavioral rather than technical: it speaks about me in the third person, never impersonates me, stays inside my documented work, and declines personal or confidential topics.

→ AI as a layer, not the product | [Milk Pumping Tracker](/case-studies/milk-tracker) | Fast logging first; summaries and follow up questions sit on top of data the app is already good at capturing.
→ [Arkhe, the assistant on this site](/case-studies/arkhe-ai-chatbot) | Grounded in my own content with citations, graceful fallback when retrieval fails, and rate limiting, origin validation, and request limits before the model is ever called.

### Growing with the team

The results I'm proudest of on **Virtual Home** aren't the performance numbers. They're ±70% faster bug resolution and ±31% quicker onboarding — team measurements, not code measurements. An architecture that more than 10 engineers across multiple teams could hold in their heads was the actual deliverable; the code was downstream of that.

When I review code or mentor junior engineers, I try to explain the tradeoff rather than the fix, so the next decision doesn't need me in the room.

→ ±31% quicker onboarding | [Leading 10+ engineers through a rewrite](/case-studies/virtual-home) | Clear standards, explainable structure, and reviews aimed at helping people contribute inside the new architecture.

### Continuous exploration

I learn by building the thing and finding out where I was wrong.

On **OneUX Lab** I planned to put the component documentation into a RAG pipeline so AI tools could answer questions about it. Building it surfaced the flaw: documentation in a vector database is stale the moment the design system changes, and a design system changes constantly. So I built an **MCP server** instead, letting AI tools read the current component APIs and design tokens straight from the source. Around the same time we moved tokens to the **DTCG** specification with Style Dictionary, generating CSS custom properties and typed exports from one source of truth, with token usage enforced in CI so raw hex values can't creep back in.

I kept the RAG work, though — it became the retrieval pipeline behind **Arkhe**, where a fixed corpus of my own writing is exactly the case RAG is good at.

→ RAG → MCP | [Why I replaced my own approach](/projects/oneux-lab-design-system) | Documentation in a vector store goes stale; an MCP server reads component specs and tokens live from the source.
→ DTCG + Style Dictionary | [Tokens as a single source of truth](/projects/arkaes-design-system) | Structured JSON generating CSS custom properties and typed exports, explored in the open here and applied at work.

## About Arkaes

**Arkaes** stands for **Architecture and Aesthetics** — the two sides of frontend work I care about most.

It exists for a practical reason. My design system work at Samsung sits under a strict NDA: I can describe the approach, but I can't show a component, a token file, or a line of code. So I built the public counterpart. **Arkaes** is a design system where I make the same class of decisions in the open, and anyone evaluating my work can read the actual source instead of taking my word for it.

The system is built on **Lit** and Web Components so it stays framework agnostic, themed entirely through **DTCG** design tokens, documented in **Storybook**, and exposed through an **MCP server** so AI tools can retrieve component specifications directly. The site you're reading is built on it — this page's accordion, buttons, and typography are the same components documented in the Storybook.

Working without product deadlines lets me think more carefully about the parts that usually get rushed: what a component's API should be, how tokens should cascade, how a component behaves under keyboard and reduced motion, and how much flexibility is enough before a system becomes overengineered.

![The Arkaes design system, from design tokens to the apps built on them](/about/arkaes-layers.svg)

→ [Component documentation](https://ds.arkaes.dev) | The live Storybook — every component, variant, and API, documented in isolation.
→ [Brand guideline](https://brand.arkaes.dev) | The visual language behind the system: type scale, color, tone, and usage rules.
→ [Source on GitHub](https://github.com/ahmadnaufal-f/arkaes) | The monorepo behind this site, the design system, and the assistant — open to read.

## How I work

![How I work, from understanding the problem to handing off to the next engineer](/about/how-i-work.svg)

### I start by understanding the problem

Before implementing, I want to know what the product needs, what users are actually doing, and what constraints the team is under. On **Air Care** that meant reading a legacy codebase inherited from another team and finding which parts caused the most debugging friction, before proposing any migration at all.

### I turn ambiguity into structure

Most frontend problems arrive messy — unclear requirements, incomplete flows, a codebase grown without a pattern. Turning that into categories, boundaries, and a plan other people can follow is the part I enjoy most. The three TV layout models and the shared-versus-product-specific split in the Virtual Home monorepo both came out of that step.

### I care about the details users can feel

Performance, accessibility, empty and loading states, focus behavior, motion. On TV, focus movement *is* the interaction model — there's no pointer to fall back on — so I precalculated the focus map at render time rather than querying the DOM on every remote press. Details like that decide whether an interface feels reliable or frustrating.

### I build for the next engineer

I'd rather ship something a colleague can extend than something only I understand. That means explicit types, documented component APIs, and architecture that answers "where does this code go?" without a meeting. The onboarding and bug resolution improvements on Virtual Home are the closest I have to a measurement of it.

### I communicate through reasoning

In code review, technical direction, and mentoring, I try to explain the tradeoff rather than issue the instruction. Leading a rewrite across more than 10 engineers only worked because the architecture was explainable — a structure people don't understand is one they'll route around.

→ [Modernizing a legacy frontend](/case-studies/air-care) | Gradual TypeScript migration, simpler state, and caching — improving the foundation while still shipping product work.
→ [Focus navigation from scratch](/case-studies/virtual-home-tv) | Precalculating focus relationships at render time so remote control navigation stays responsive as pages grow.

## Beyond work

My degree is in **electrical engineering**, so I grew into software through practice rather than coursework. Side projects are how I close that gap: I pick something I don't know yet and ship it, because shipping is what exposes the parts I only thought I understood.

Each one taught me something specific. The **Milk Pumping Tracker** came from a real family workflow and became my first real lesson in AI supporting a product rather than becoming it. **Treely** pushed me into a relationship data model that has to stay consistent as families grow — parents, spouses, children, siblings — without broken branches or colliding nodes, plus a React Native and NestJS stack I hadn't shipped before. **Arkhe** made me design a retrieval pipeline, a streaming response, and a set of safety boundaries that would hold up in front of strangers. And **Arkaes** is the long game: a place to keep refining component API design, tokens, accessibility, and documentation without a deadline forcing a shortcut.

None of them are finished. That's mostly the point — they're where I test ideas before bringing them to work, and occasionally the other way around.

![The side project loop: identify a real problem, design, build, ship, then learn and repeat](/about/learning-loop.svg)

→ [Milk Pumping Tracker](/case-studies/milk-tracker) | Shipped. React, Vite, Firebase, and an OpenAI powered weekly review layer.
→ [Treely, a family tree app](/projects/treely-app) | React Native and Expo on the front, NestJS and PostgreSQL behind, with a relationship model built to stay consistent as it grows.
→ [Arkhe AI assistant](/case-studies/arkhe-ai-chatbot) | Retrieval augmented generation over my own writing, with streaming responses and cited sources.
