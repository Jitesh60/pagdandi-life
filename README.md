# PagdandiLife

A static storefront for an outdoor gear shop in Kathgodam, Uttarakhand — a
rebuild of the WordPress/WooCommerce site as a Next.js catalogue.

## What this is

A **browse-and-enquire catalogue**, not a transactional store. There is no
cart, checkout or account system by design: every product carries a WhatsApp
enquiry that reaches the shop directly, which is how the store actually sells.

- **179 products** across seven curated categories, plus a **29-item rental
  catalogue** (browse-only)
- Fully pre-rendered — every page is static, with daily ISR revalidation
- No runtime dependency on WordPress at all

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Lenis

## Getting started

```bash
pnpm install
pnpm dev
```

The catalogue snapshot is committed, so the site builds and runs with **no
network access and no credentials**.

```bash
pnpm build     # production build
pnpm lint      # eslint
```

## How the data works

Product data lives in `data/catalog.json` and imagery in `public/catalog/**`,
both committed to the repo. They are produced by a manual ingest step that is
never part of the build — see [`scripts/README.md`](scripts/README.md) for why,
and for how to refresh the catalogue.

```bash
pnpm ingest --refetch     # re-pull from the source store (needs a session)
pnpm build:redirects      # regenerate legacy WordPress → new URL redirects
```

## Deploying to Netlify

**No environment variables are required.** The catalogue is a committed
snapshot, so `next build` makes no network calls and needs no credentials. The
`PAGDANDI_*` values in `.env.local` are used only by `pnpm ingest`, which is run
by hand and never during a build.

`netlify.toml` sets the build command, pins Node 22 and enables
`@netlify/plugin-nextjs` (needed for the App Router, ISR revalidation, and the
on-demand rendering that dashboard-created product pages use).

### Optional

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Overrides the site origin used for canonicals, the sitemap, OG tags and JSON-LD. |

Netlify supplies `URL` and `DEPLOY_PRIME_URL` automatically, and
`src/lib/site.ts` reads them, so canonicals resolve to the deploy's own domain
rather than the old WordPress site. Set `NEXT_PUBLIC_SITE_URL` once a custom
domain is attached.

`robots.ts` reads Netlify's `CONTEXT` and blocks indexing on preview and branch
deploys, so they never compete with production in search.

## Architecture notes

| Concern | Approach |
|---|---|
| **Taxonomy** | The source store has 60 categories across 16 overlapping roots. `src/lib/catalog/categories.ts` maps those onto seven curated categories; the messy source taxonomy never reaches the UI. |
| **Data model** | `src/lib/catalog/types.ts` defines our own `Product` shape. Only the ingest script knows the WooCommerce format, so the source store could be swapped out without touching a component. |
| **Prices** | Stored as integer minor units (paise) and formatted in exactly one place. |
| **Skeletons** | Only where a real wait exists: route transitions (`loading.tsx`), search hydration, and LQIP blur placeholders on every image. No artificial delays, and every skeleton matches its content's dimensions so CLS stays at zero. |
| **Motion** | Lenis smooth scroll and scroll reveals, both hard-disabled under `prefers-reduced-motion` — the provider never constructs Lenis at all. |
| **SEO** | Per-route metadata, JSON-LD (Organization, LocalBusiness, Product, BreadcrumbList, ItemList), generated sitemap and robots. The source site had none of this. |
| **URL migration** | `data/redirects.json` maps every old `/product/` and `/product-category/` URL to its new route, wired up in `next.config.ts`. |

## Outstanding — needs the shop

These cannot be migrated from the API and are marked in-page where they appear:

1. **Real photography** — current images come from the WooCommerce media
   library and vary in quality; an editorial layout exposes weak images.
2. **Brand copy** — the About story and homepage headline are placeholders.
3. **Policy text** — shipping, returns, refund, privacy and terms are
   scaffolded with outlines only. Legal copy must come from the shop.
4. **Store address, hours and geo coordinates** — needed for `/contact` and for
   `localBusinessSchema()` to rank in local search.
5. **The production domain** — `site.url` in `src/lib/site.ts` drives canonicals
   and the sitemap, and decides whether the legacy redirects are needed.

> The source store describes itself as a prototype with sample data. Re-run the
> ingest once real products are in place.
