# Catalogue ingest

The storefront renders from a **committed snapshot**, not from WordPress.
`next build` reads `data/catalog.json` and `public/catalog/**` and makes no
network calls at all. These scripts are the only things that ever talk to the
source store, and they are run by hand.

## Why a snapshot rather than build-time fetching

The source origin (`pagdandilife.com`) sits behind a JS bot-challenge (hCDN):

- plain `fetch`/`curl` receives **HTTP 403** and an HTML challenge page, not JSON
- repeated API calls get rate-limited part-way through a run
- **product images 403 as well**, so `next/image` cannot optimise them remotely
  and hotlinking would fail for real visitors

Fetching during the build would therefore be slow and flaky, and the images
would not render. Pulling everything local once solves all three, and lets us
generate the LQIP blur placeholders the site uses as image skeletons.

## Refreshing the catalogue

The API and the images both require a session from a browser that has solved
the challenge.

1. Open `https://pagdandilife.com` in a real browser and let the "Checking your
   browser" screen finish (about 5–8 seconds).
2. Copy the `hcdn` and `PHPSESSID` cookies. `hcdn` is **HttpOnly**, so read it
   from DevTools → Application → Cookies, not `document.cookie`.
3. Write them to `.env.local` (gitignored — never commit this):

   ```
   PAGDANDI_COOKIE="hcdn=…; PHPSESSID=…"
   PAGDANDI_UA="<the same browser's User-Agent>"
   ```

4. Run the ingest:

   ```bash
   pnpm ingest --refetch      # re-pull from the Store API, then images
   pnpm build:redirects       # regenerate legacy WordPress → new URL redirects
   ```

5. Commit the changed `data/catalog.json`, `data/redirects.json` and
   `public/catalog/**`.

The session expires. If you see `challenge page instead of JSON`, harvest a
fresh cookie and re-run.

### Flags

| Flag | Effect |
|---|---|
| *(none)* | Normalise from `data/raw`, downloading any missing images |
| `--refetch` | Re-pull products and categories from the Store API first |
| `--skip-images` | Metadata only; keeps the images already resolved |

Downloads are cached by content-addressed filename, so re-running is cheap —
only genuinely new or changed images are fetched.

## Files

| Path | Purpose |
|---|---|
| `ingest.ts` | Orchestrates the run and writes `data/catalog.json` |
| `lib/woo-client.ts` | Store API access: session headers, retry, pagination |
| `lib/normalize.ts` | Validates Woo records and maps them to our own model |
| `lib/images.ts` | Downloads, optimises and generates blur placeholders |
| `build-redirects.ts` | Emits `data/redirects.json` for `next.config.ts` |

`data/raw/` holds the unmodified API responses so the catalogue can be
re-normalised offline, without a fresh session.
