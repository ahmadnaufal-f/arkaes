---
"@arkaes/ui": minor
---

**Breaking:** rename `ark-case-study-card` to `ark-media-card`. The card is used for case studies, projects, and now blog posts, so the name no longer described it. Renamed alongside the tag: `ArkCaseStudyCard` → `ArkMediaCard`, `ArkCaseStudyCardVariant` → `ArkMediaCardVariant`, `defineArkCaseStudyCard` → `defineArkMediaCard`, the `@arkaes/ui/register/ark-case-study-card` entrypoint → `@arkaes/ui/register/ark-media-card`, and the React wrapper export `ArkCaseStudyCard` → `ArkMediaCard`.

`ark-cursor`'s built-in defaults follow the rename: `ark-media-card` is now in `DEFAULT_INTERACTIVE_SELECTOR` and carries the "View" label. Apps that passed `labels: { "ark-case-study-card": … }` to `enableArkCursor` need to update that key.

Add an optional `datetime` attribute to `ark-media-card` — an ISO string or `YYYY-MM-DD`. The card derives the displayed label from it, so callers pass a single value instead of keeping a label and a machine value in sync. It renders on a metadata line beside `category`, keeping the date inside the card box, where a sibling element could be overlapped by neighbouring cards in a grid. Omitted when empty, so existing usage is unchanged.

The label is formatted in UTC: a publish date is a calendar date rather than an instant, and formatting in the viewer's zone would render `2026-07-25T00:00:00.000Z` as "July 24" everywhere west of UTC. An unparseable value renders nothing rather than "Invalid Date".
