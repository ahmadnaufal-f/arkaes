# Setting up the Arkhe RAG database from your phone

A step-by-step guide to stand up the Supabase vector store and get the
**knowledge admin UI** (`/admin/knowledge`) working — done entirely from a
mobile browser, no terminal required.

> **Before you start**, make sure your portfolio is deployed to Vercel with the
> chatbot stack merged **through the admin UI (PR #76)**. The admin page and
> `/api/admin/ingest` route only exist once that PR is live.

You'll fill in five environment variables along the way:

| Variable | What it is | Where it comes from |
| --- | --- | --- |
| `OPENAI_API_KEY` | OpenAI key (chat + embeddings) | platform.openai.com |
| `SUPABASE_URL` | Your project URL | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret key | Supabase → Settings → API |
| `ADMIN_PASSWORD` | Password that unlocks `/admin` | You choose it |
| `ADMIN_USER` *(optional)* | Admin username (defaults to `admin`) | You choose it |

---

## Step 1 — Create the Supabase project

1. On your phone, open **https://supabase.com/dashboard** and sign in.
2. Tap **New project**.
3. Pick an organization, give the project a name.
4. Set a **database password** — tap the generate button and **save it**
   somewhere safe (a password manager). You may need it later.
5. Choose a **region** close to your Vercel deployment region for lower latency.
6. Tap **Create new project** and wait ~1–2 minutes for it to provision.

---

## Step 2 — Run the database migration

This creates the `documents` table, the vector index, and the
`match_documents()` search function. The migration also enables the `vector`
(pgvector) extension for you, so there's nothing to toggle manually.

1. **Get the migration SQL onto your phone.** In another browser tab, open the
   file in the repo:
   `supabase/migrations/0001_init_rag.sql`
   (open it on GitHub, tap the **raw** / copy button, and copy the whole file).
2. Back in Supabase, open the left menu and tap **SQL Editor**.
3. Tap **New query**, paste the SQL, and tap **Run**.
4. You should see a success message. To confirm, open **Table Editor** — a
   `documents` table should now exist.

> On a small screen the SQL editor is cramped but works. Paste the whole file in
> one go rather than typing.

---

## Step 3 — Copy your Supabase credentials

1. Tap the **Settings** (gear) icon, then **API**
   *(in some dashboards this is under **Data API** / **API Keys**)*.
2. Copy **Project URL** → this is `SUPABASE_URL`
   (format: `https://<project-ref>.supabase.co`).
3. Under **Project API keys**, reveal and copy the **`service_role`** key →
   this is `SUPABASE_SERVICE_ROLE_KEY`.

> ⚠️ The `service_role` key bypasses row-level security. Treat it like a
> password — it goes **only** into server-side environment variables, never into
> anything client-facing.

---

## Step 4 — Add the environment variables in Vercel

1. On your phone, open **https://vercel.com/dashboard** and select the portfolio
   project.
2. Go to **Settings → Environment Variables**.
3. Add each of these (apply them to the **Production** environment — and
   **Preview** too if you want the chatbot live on preview deploys):

   | Name | Value |
   | --- | --- |
   | `OPENAI_API_KEY` | your OpenAI key |
   | `SUPABASE_URL` | from Step 3 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Step 3 (mark as **Sensitive**) |
   | `ADMIN_PASSWORD` | a strong password you choose |
   | `ADMIN_USER` *(optional)* | a username, or skip to use `admin` |

   All are **server-only** — do **not** add a `PUBLIC_` prefix.

4. Save.

---

## Step 5 — Redeploy so the variables take effect

Vercel only picks up environment-variable changes on a **new deployment**.

1. In the Vercel project, open the **Deployments** tab.
2. Open the most recent production deployment and tap the **⋯** menu →
   **Redeploy**.
3. Wait for the build to finish and go **Ready**.

---

## Step 6 — Open the knowledge admin UI

1. In your mobile browser, go to:
   `https://<your-domain>/admin/knowledge`
2. Your browser will show an **HTTP Basic Auth** prompt.
3. Enter:
   - **Username:** `admin` (or your `ADMIN_USER` if you set one)
   - **Password:** your `ADMIN_PASSWORD`
4. The admin page loads.

> If you get a **503**, `ADMIN_PASSWORD` isn't set or the project hasn't been
> redeployed yet — recheck Steps 4 and 5.

---

## Step 7 — Load knowledge into the store

On the admin page:

1. **Content** — paste the text you want Arkhe to know (a bio paragraph, a
   project write-up, an FAQ answer, etc.). *Required.*
2. **Source** — a label for this document (e.g. `bio`, `project-milk-tracker`).
   Optional but recommended — it lets you replace or clear this document later.
3. **Metadata** *(optional)* — a small JSON object (e.g.
   `{"category": "about"}`). Leave blank if unsure.
4. **Replace by source** — turn this on to wipe any existing chunks with the
   same source before inserting (useful when re-uploading an updated version).
5. Submit. The text is chunked, embedded, and stored automatically.
6. The page lists your **loaded sources with chunk counts** — confirm your new
   document appears. You can clear a single source or everything from here too.

Repeat for each piece of knowledge you want the chatbot grounded in.

---

## Step 8 — Test the chatbot

1. Open your live site in the mobile browser.
2. Open the **Arkhe** chat widget.
3. Ask something that only your ingested content would answer.
4. The reply should reflect the knowledge you loaded.

If retrieval isn't configured correctly, chat still works but falls back to the
static knowledge base — so a generic-but-working answer usually means the
Supabase variables didn't take (recheck Steps 3–5).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `/admin/knowledge` returns **503** | `ADMIN_PASSWORD` not set, or not redeployed | Set it in Vercel (Step 4), redeploy (Step 5) |
| Basic Auth keeps rejecting you | Wrong username/password | Username is `admin` unless you set `ADMIN_USER`; password is `ADMIN_PASSWORD` |
| Admin page loads but ingest fails with **"RAG is not configured"** | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` missing | Add both in Vercel, redeploy |
| Chat works but ignores your uploaded knowledge | Same as above, or the migration didn't run | Verify the `documents` table exists (Step 2) and the Supabase vars are set |
| SQL editor error on migration | Partial paste | Re-copy the **entire** `0001_init_rag.sql` and run again (it's safe to re-run) |

---

## What you did *not* need

- **No terminal / CLI.** The `pnpm ingest` command is an alternative to the
  admin UI for bulk-loading site content from a computer — you skipped it by
  ingesting through the browser instead.
- **No manual pgvector setup.** The migration enables the extension for you.
