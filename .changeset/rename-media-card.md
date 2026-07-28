---
"@arkaes/ui": major
---

**Breaking:** rename `ark-case-study-card` to `ark-media-card`. The card is used for case studies, projects, and now blog posts, so the name no longer described it. Renamed alongside the tag: `ArkCaseStudyCard` → `ArkMediaCard`, `ArkCaseStudyCardVariant` → `ArkMediaCardVariant`, `defineArkCaseStudyCard` → `defineArkMediaCard`, the `@arkaes/ui/register/ark-case-study-card` entrypoint → `@arkaes/ui/register/ark-media-card`, and the React wrapper export `ArkCaseStudyCard` → `ArkMediaCard`.

`ark-cursor`'s built-in defaults follow the rename: `ark-media-card` is now in `DEFAULT_INTERACTIVE_SELECTOR` and carries the "View" label. Apps that passed `labels: { "ark-case-study-card": … }` to `enableArkCursor` need to update that key.

Add optional `date` and `datetime` attributes to `ark-media-card`. `date` is the human-readable label and `datetime` the machine-readable value for the rendered `<time>`; both are omitted when empty, so existing usage is unchanged. They render on a metadata line beside `category` — keeping dates inside the card box, where a sibling element could be overlapped by neighbouring cards in a grid.
