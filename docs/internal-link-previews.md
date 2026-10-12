# Internal content link previews

Markdown links to individual case studies, projects, and blog posts can show an inline preview card after the paragraph containing the link. The linked sentence remains ordinary linked text, so the destination still works when JavaScript is unavailable or a preview request fails.

The enhancement is opt-in: rendered article content must carry the internal-link-preview root attribute consumed by the browser controller. The controller only considers links that resolve to one supported content kind and one safe slug on the production site or current site origin. External links, listing pages, fragment-only links, and malformed paths remain ordinary anchors.

The normalizer in `apps/portfolio/src/lib/internal-content-link.ts` owns URL classification. Its `key` is the canonical content path without query or fragment and is suitable for deduplication. Its `href` is root-relative while retaining the source query and fragment. Its `endpoint` addresses the same-origin preview fragment route.

Preview fragments are served by `/api/link-preview/<kind>/<slug>`. Successful fragments can be cached by the browser for 60 seconds and by shared caches for 300 seconds. Errors use `Cache-Control: no-store`; these preview requests are excluded from page ISR. The browser controller lazily requests cards as their source paragraphs approach the viewport. Repeated links to the same canonical target share one request and response; each source paragraph gets its own card after the paragraph, leaving the sentence in place.

The API route is server-rendered HTML. Case study and project visuals reuse the portfolio's existing case-study visual component; blog covers use their CMS image URL through a native image element. A missing content entry returns `404`; an unavailable CMS returns `503`. In both cases the article link remains usable.

The URL contract and edge cases are covered by `apps/portfolio/src/lib/__tests__/internal-content-link.test.ts`. Run the portfolio suite from the repository root with:

```sh
pnpm --filter @arkaes/portfolio test
```
