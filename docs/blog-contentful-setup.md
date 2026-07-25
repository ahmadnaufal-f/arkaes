# Blog: Contentful + ISR setup

The blog (`/blog`) keeps content **out of git**: posts live in Contentful, the
blog routes fetch them at request time, and Vercel ISR caches the rendered
pages at the edge. Publishing in Contentful triggers `/api/revalidate`, which
refreshes just the affected pages — no rebuild, no commit.

## Architecture

```
Contentful (posts, markdown body)
    │  publish/unpublish webhook (x-webhook-secret)
    ▼
POST /api/revalidate            src/pages/api/revalidate.ts
    │  re-request with x-prerender-revalidate: <bypass token>
    ▼
/blog, /blog/<slug>             ISR-cached, prerender = false
    │  getAllPosts()/getPostBySlug()   src/lib/contentful.ts
    │  renderPostBody() (GFM + Shiki)  src/lib/markdown.ts
    ▼
Fresh HTML stored in the edge cache
```

- ISR is configured on the Vercel adapter in `astro.config.mjs` (`isr:` block).
  `expiration: 3600` is a safety net; on-demand revalidation is the primary path.
- Everything else on the site stays statically prerendered.
- Without Contentful env vars, `/blog` renders an empty listing (same graceful
  degradation as the RAG/chat features).

## One-time Contentful setup

1. **Space + content type.** Create a space, then a content type with API id
   `blogPost` and these fields (field ids must match exactly — see
   `BlogPostSkeleton` in `src/lib/contentful.ts`):

   | Field id      | Type                  | Notes                                  |
   | ------------- | --------------------- | -------------------------------------- |
   | `title`       | Short text            | required                               |
   | `slug`        | Short text            | required, unique — becomes the URL     |
   | `excerpt`     | Short text            | card summary + meta description        |
   | `category`    | Short text            | add an "Accept only specified values" validation with your category list |
   | `tags`        | Short text, list — or plain Short text | either works: a plain Short text field is split on commas and trimmed |
   | `publishDate` | Date & time           | required                               |
   | `coverImage`  | Media (one asset)     | optional                               |
   | `body`        | Long text             | the markdown body (GFM supported)      |
   | `featured`    | Boolean               | optional                               |

2. **API key.** Settings → API keys → add a key; copy the Space ID and the
   **Content Delivery API** access token.

3. **Env vars.** Locally in `apps/portfolio/.env` and in the Vercel project:

   ```sh
   CONTENTFUL_SPACE_ID=...
   CONTENTFUL_DELIVERY_TOKEN=...
   # CONTENTFUL_ENVIRONMENT=master        # only if not "master"
   VERCEL_ISR_BYPASS_TOKEN=<32+ random chars, e.g. `openssl rand -hex 24`>
   CONTENTFUL_WEBHOOK_SECRET=<another random secret>
   ```

   Redeploy after setting them so the adapter picks up the bypass token.

4. **Webhook** (after the first deploy). Contentful → Settings → Webhooks →
   Add webhook:
   - URL: `https://arkaes.dev/api/revalidate`, method POST
   - Triggers: Entry **publish** and **unpublish** (filter to the `blogPost`
     content type)
   - Custom header: `x-webhook-secret: <CONTENTFUL_WEBHOOK_SECRET>`

## Verifying

- **Local:** `pnpm --filter @arkaes/portfolio dev` → `/blog` lists posts,
  `/blog/<slug>` renders the markdown body (tables, code blocks, blockquotes)
  inside `.ark-readable`. Dev always fetches fresh from Contentful.
- **Prod:** publish an edit in Contentful → the webhook returns 200 from
  `/api/revalidate` (see the webhook log in Contentful) → the page reflects
  the change within seconds, with no redeploy and no commit.

## Related code

- `src/lib/contentful.ts` — typed Delivery client + `BlogPost` mapping
- `src/lib/markdown.ts` — GFM + Shiki rendering (css-variables theme; palette
  mapped to `--ark-*` tokens in `src/pages/blog/_blog.css`)
- `src/components/BlogListing.astro` — listing grid + category/tag filters
- `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro` — ISR routes
- `src/pages/api/revalidate.ts` — webhook → ISR cache refresh
- `/blogs` permanently redirects to `/blog` (`vercel.json`)
