## Summary

I'm **Ahmad Naufal**, a frontend engineer. I work on design systems, interaction details, and the architecture under both.

At **Samsung Research Indonesia** I've built product interfaces for mobile, TV, and connected device screens. I led the frontend rewrite that merged two SmartThings Virtual Home variants into one monorepo, and I lead **OneUX Lab**, the React design system now built by more than 15 engineers across several product teams.

Most of that work sits one layer below the product. Design tokens, component APIs, navigation models, architecture. I like building that layer because it decides whether the hundredth screen gets the same care as the first.

Every claim on this page links to the work behind it.

→ ±87% shared | [SmartThings Virtual Home](/case-studies/virtual-home) | Tech lead for the monorepo rewrite that merged two product variants. Also ±40% smaller app size, ±65% faster Time To Interactive, and ±31% quicker onboarding.
→ 15+ engineers | [OneUX Lab Design System](/projects/oneux-lab-design-system) | Project lead. I set the architecture, component API conventions, accessibility standards, and release process for a design system used across several product teams.
→ ~80% faster | [SmartThings Air Care](/case-studies/air-care) | Project lead on a legacy modernization. Second load ~80% faster, first load ~50% faster, and a full JavaScript to TypeScript migration done without pausing delivery.

## What I value

### Clarity before complexity

Most frontend problems get easier once you describe them properly. I spend time there first.

On **Virtual Home for TV** I looked for one navigation algorithm that would work on every page. There wasn't one. The project moved once I stopped looking and sorted the pages into three groups instead: structured grids, static scattered layouts, and scattered layouts rendered at runtime. Each group got its own strategy. Index math for grids, declared focus targets for static pages, position mapping for dynamic ones. One problem I could not solve became three that I could.

The same thinking applies to tools. On **Air Care** I picked Zustand over a bigger state library. The team was three people on a tight schedule, and everyone would have paid for a heavier abstraction every day.

→ 3 layout models | [Focus navigation for TV](/case-studies/virtual-home-tv) | I joined with no TV experience and owned the focus system end to end. Grouping the layouts is what made a remote control feel predictable.
→ [Choosing Zustand on Air Care](/case-studies/air-care) | Replacing a custom state layer with the smallest tool that fit the team.

### Systems over screens

I build frontend systems that let a product grow without the interface drifting apart.

On **Virtual Home**, around ±87% of the UI and logic ended up shared between a mobile variant and a Family Hub refrigerator variant. Reaching that number was a design question as much as an architecture question. We had to decide, component by component, what "the same" means across a phone in your hand and a screen on a fridge door, and where the shared foundation should stop.

On **OneUX Lab**, writing the components was the straightforward part. Keeping them consistent across a growing group of contributors was harder. As more engineers joined, agreeing on API conventions mattered more than any single component. I put work into versioning through Changesets, accessibility and keyboard reviews, and Storybook documentation so an engineer from another team can understand a component without asking anyone.

→ ±87% shared UI and logic | [Merging two product variants](/case-studies/virtual-home) | One monorepo, clear boundaries between the shared foundation and product specific layers, coordinated across 10+ engineers.
→ 6 years unmaintained | [Reviving an internal framework](/projects/oneux-lab-design-system) | What started as a revival became a React design system for data dense dashboards and CMS platforms, with conventions that keep 15+ contributors aligned.

### Design decisions are engineering decisions

The change I think about most is a small one.

While building the **Milk Pumping Tracker**, I put the start and stop buttons near the top of the screen. It looked fine in the design file. The person using the app is a mother who may be holding a pump in one hand and the phone in the other, often tired, often in the middle of something else. Reading how One UI treats thumb reach made the problem obvious. I had been solving for the layout when I should have been solving for the moment the app gets used. I moved the controls to a floating position at the bottom, where the hand already rests.

The architecture did not change at all. The app just stopped working against the person using it. Most of the frontend work I enjoy sits in that gap between an interface that is technically correct and one that fits the moment it gets used.

→ [Designing for a one handed moment](/case-studies/milk-tracker) | A shipped personal product where the design constraint set the implementation.
→ [What One UI taught me](https://www.linkedin.com/posts/ahmad-naufal-f_oneui-taught-me-something-activity-7462405914063540224-z2tb?utm_source=share&utm_medium=member_android&rcm=ACoAACBA6AwBV5_PTernV1TdRQgzpNomavm4nzk) | I wrote up the reasoning after shipping the change.

### Product minded engineering

Frontend work covers more than building screens. I want to know why a feature exists and whether the implementation still holds up a year later.

That usually means holding back. In the **Milk Pumping Tracker**, AI sits on top as a review layer that summarizes sessions and suggests follow up questions. The tracker still works fine without it, because the main job is logging a session fast. In **Arkhe**, the assistant on this site, the infrastructure was the easy half. Most of the hard decisions were about how it behaves. It speaks about me in the third person, never pretends to be me, stays inside my documented work, and refuses personal or confidential topics.

→ AI as a review layer | [Milk Pumping Tracker](/case-studies/milk-tracker) | Fast logging first. Summaries and follow up questions sit on top of data the app already captures well.
→ [Arkhe, the assistant on this site](/case-studies/arkhe-ai-chatbot) | Grounded in my own content with citations, a fallback path when retrieval fails, and rate limiting, origin validation, and request limits before the model is ever called.

### Growing with the team

On **Virtual Home**, the numbers I care about most are ±70% faster bug resolution and ±31% quicker onboarding. Both of those measure how the team works. The real deliverable was an architecture that more than 10 engineers across several teams could keep in their heads. The code followed from that.

When I review code or mentor junior engineers, I explain the tradeoff instead of handing over the fix. The goal is that the next decision does not need me in the room.

→ ±31% quicker onboarding | [Leading 10+ engineers through a rewrite](/case-studies/virtual-home) | Clear standards, a structure I could explain, and reviews aimed at helping people contribute inside the new architecture.

### Continuous exploration

I learn by building something and finding out where I was wrong.

On **OneUX Lab** I planned to feed the component documentation into a RAG pipeline so AI tools could answer questions about it. Building it showed me the flaw. Documentation in a vector database goes stale as soon as the design system changes, and a design system changes all the time. I built an **MCP server** instead, so AI tools read the current component APIs and design tokens straight from the source. Around the same time we moved tokens to the **DTCG** specification with Style Dictionary. That generates CSS custom properties and typed exports from one source of truth, and CI now blocks raw hex values from coming back.

The RAG work still got used. It became the retrieval pipeline behind **Arkhe**, where a fixed set of my own writing suits RAG well.

→ RAG → MCP | [Why I replaced my own approach](/projects/oneux-lab-design-system) | Documentation in a vector store goes stale. An MCP server reads component specs and tokens live from the source.
→ DTCG + Style Dictionary | [Tokens as a single source of truth](/projects/arkaes-design-system) | Structured JSON that generates CSS custom properties and typed exports, explored in the open here and applied at work.

## About Arkaes

**Arkaes** stands for **Architecture and Aesthetics**, the two sides of frontend work I care about most.

It exists for a practical reason. My design system work at Samsung sits under a strict NDA. I can describe the approach, but I cannot show a component, a token file, or a line of code. So I built the public version. **Arkaes** is a design system where I make the same kind of decisions in the open, so anyone reviewing my work can read the source instead of taking my word for it.

The system runs on **Lit** and Web Components, so it stays framework agnostic. It is themed with **DTCG** design tokens, documented in **Storybook**, and served through an **MCP server** so AI tools can read component specifications directly. This site runs on it. The accordion, buttons, and type on this page are the same components documented in the Storybook.

Working without product deadlines lets me think harder about the parts that usually get rushed: what a component API should look like, how tokens should cascade, how a component behaves under keyboard and reduced motion, and how much flexibility is enough before a system gets too complicated.

![The Arkaes design system, from design tokens to the apps built on them](/about/arkaes-layers.svg)

→ [Component documentation](https://ds.arkaes.dev) | The live Storybook. Every component, variant, and API, documented in isolation.
→ [Brand guideline](https://brand.arkaes.dev) | The visual language behind the system: type scale, color, tone, and usage rules.
→ [Source on GitHub](https://github.com/ahmadnaufal-f/arkaes) | The monorepo behind this site, the design system, and the assistant. Open to read.

## How I work

![How I work, from understanding the problem to handing off to the next engineer](/about/how-i-work.svg)

### I start by understanding the problem

Before I write code, I want to know what the product needs, what users are doing, and what limits the team is working with. On **Air Care** that meant reading a legacy codebase we inherited from another team and finding which parts cost us the most debugging time, before I proposed any migration.

### I turn ambiguity into structure

Most frontend problems arrive messy. Unclear requirements, incomplete flows, a codebase that grew without a pattern. I enjoy turning that into groups, boundaries, and a plan other people can follow. The three TV layout models and the split between shared and product specific code in the Virtual Home monorepo both came out of that step.

### I care about the details users can feel

Performance, accessibility, empty and loading states, focus behavior, motion. On TV, focus movement is the whole interaction model, because there is no pointer to fall back on. I calculated the focus map once at render time instead of querying the DOM on every remote press. Details like that decide whether an interface feels reliable.

### I build for the next engineer

I would rather ship something a colleague can extend than something only I understand. That means explicit types, documented component APIs, and a structure that answers "where does this code go?" without a meeting. The onboarding and bug resolution numbers on Virtual Home are the closest thing I have to a measurement of it.

### I communicate through reasoning

In code review, technical direction, and mentoring, I explain the tradeoff instead of handing out instructions. Leading a rewrite across more than 10 engineers only worked because the architecture was easy to explain. People route around a structure they do not understand.

→ [Modernizing a legacy frontend](/case-studies/air-care) | Gradual TypeScript migration, simpler state, and caching, while the team kept shipping product work.
→ [Focus navigation from scratch](/case-studies/virtual-home-tv) | Calculating focus relationships at render time so remote control navigation stays fast as pages grow.

## Beyond work

My degree is in **electrical engineering**, so I picked up software on my own, through practice. Side projects are how I close that gap. I pick something I do not know yet and ship it, because shipping shows me the parts I only thought I understood.

Each one taught me something specific. The **Milk Pumping Tracker** came from a real family routine and taught me how to let AI support a product without taking it over. **Treely** put me in front of a relationship data model that has to stay correct as a family grows, covering parents, spouses, children, and siblings without broken branches or overlapping nodes. It also ran on a React Native and NestJS stack I had never shipped before. **Arkhe** made me design a retrieval pipeline, a streaming response, and safety boundaries that hold up in front of strangers. **Arkaes** is the long game, a place to keep working on component API design, tokens, accessibility, and documentation without a deadline forcing a shortcut.

None of them are finished, which is mostly the point. They are where I test ideas before I bring them to work, and sometimes the reverse.

![The side project loop: identify a real problem, design, build, ship, then learn and repeat](/about/learning-loop.svg)

→ [Milk Pumping Tracker](/case-studies/milk-tracker) | Shipped. React, Vite, Firebase, and an OpenAI powered weekly review layer.
→ [Treely, a family tree app](/projects/treely-app) | React Native and Expo on the front, NestJS and PostgreSQL behind, with a relationship model built to stay correct as it grows.
→ [Arkhe AI assistant](/case-studies/arkhe-ai-chatbot) | Retrieval augmented generation over my own writing, with streaming responses and cited sources.
