---
"@arkaes/ui": minor
---

Make `ark-project-header` travel with `ark-navigation`'s immersive header instead of holding a gap where it used to be. The hero reserves `--ark-project-header-chrome-clearance` at its top for the fixed chrome that floats over it, but once the pills tuck away mid-scroll that band is room held for something no longer there — a dead strip above a pinned title, on every case study, for as long as the reader keeps scrolling. The pinned hero now rides up by exactly that clearance while the pills are away and settles back with them, so the reader gets the band back while the page is moving and the title returns to its place when it stops.

The two are joined by `--ark-nav-chrome-away`, published on `:root` by `ark-navigation-root` as `1` while its pills are hidden and `0` otherwise, with the same owner-token guard `--ark-project-header-pinned-bottom` uses so a ClientRouter navigation's outgoing header cannot clear the value its replacement just wrote. The header multiplies the flag into its travel rather than branching on it, since a custom property cannot be tested in a selector, and a page with no immersive header never writes the flag — the `0` fallback leaves consumers exactly where they were. Only the pinned hero travels: unpinned it is the top of the page rather than chrome over the article, so there is no clearance to reclaim.

`--ark-project-header-pinned-bottom` still reports the edge the header comes to rest at, with the travel taken back out of it. The travel ends on the nav's settle timer, with no scroll event behind it to publish again, so an edge sampled mid-travel would stand uncorrected and a consumer offsetting against it would park content under the header once it settled back.
