/**
 * Generates permanent redirects from the old WordPress URLs to the new routes.
 *
 *   node scripts/build-redirects.ts
 *
 * The existing site uses /product/<slug>/ and /product-category/<path>/, while
 * the rebuild uses /p/, /rent/ and /c/. Without these, every indexed URL would
 * 404 on launch and the store would lose its search ranking.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  FALLBACK_CATEGORY,
  RENTAL_ROOT_SLUG,
  toCuratedCategoryIds,
} from "../src/lib/catalog/categories.ts";
import type { Catalog } from "../src/lib/catalog/types.ts";

type Redirect = { source: string; destination: string; permanent: true };

const root = process.cwd();

async function main() {
  const catalog = JSON.parse(
    await readFile(path.join(root, "data", "catalog.json"), "utf8"),
  ) as Catalog;

  const redirects: Redirect[] = [];
  const seen = new Set<string>();

  const add = (source: string, destination: string) => {
    // Normalise away the trailing slash; Next matches the canonical form.
    const clean = source.replace(/\/+$/, "");
    // A rule pointing at itself is a redirect loop, not a migration.
    if (!clean || clean === destination || seen.has(clean)) return;
    seen.add(clean);
    redirects.push({ source: clean, destination, permanent: true });
  };

  for (const product of catalog.products) {
    const destination = product.rental ? `/rent/${product.slug}` : `/p/${product.slug}`;
    add(product.legacyPath, destination);
  }

  // Source category permalinks -> curated category pages.
  try {
    const raw = JSON.parse(
      await readFile(path.join(root, "data", "raw", "categories.json"), "utf8"),
    );
    type SourceCategory = { id: number; slug: string; parent?: number; permalink?: string };
    const categories: SourceCategory[] = raw.categories ?? raw;
    const byId = new Map(categories.map((c) => [c.id, c]));

    /** Walks up the source tree to find the nearest ancestor under `rental`. */
    const isRental = (category: SourceCategory): boolean => {
      let current: SourceCategory | undefined = category;
      for (let depth = 0; current && depth < 8; depth++) {
        if (current.slug === RENTAL_ROOT_SLUG) return true;
        current = byId.get(current.parent ?? 0);
      }
      return false;
    };

    /**
     * A child term like `apparel/accessories` may not be mapped itself while
     * its parent is, so walk up rather than dumping it in the fallback bucket.
     */
    const resolveCurated = (category: SourceCategory): string | null => {
      let current: SourceCategory | undefined = category;
      for (let depth = 0; current && depth < 8; depth++) {
        const [id] = toCuratedCategoryIds([current.slug]);
        if (id && id !== FALLBACK_CATEGORY.id) return id;
        current = byId.get(current.parent ?? 0);
      }
      return null;
    };

    for (const category of categories) {
      let pathname = `/product-category/${category.slug}/`;
      try {
        if (category.permalink) pathname = new URL(category.permalink).pathname;
      } catch {
        // Fall back to the flat form.
      }

      if (isRental(category)) {
        add(pathname, "/rent");
        continue;
      }

      const curatedId = resolveCurated(category);
      // Unmappable terms go to the full shop rather than a misleading category.
      add(pathname, curatedId ? `/c/${curatedId}` : "/shop");
    }
  } catch {
    console.warn("  ! no data/raw/categories.json — category redirects skipped");
  }

  // Pages that no longer exist in a catalogue-only storefront.
  // Old WooCommerce paths that the rebuild renames rather than drops.
  // Anything the new site actually serves — /shop, /cart, /checkout,
  // /wishlist — must NOT appear here, or it would redirect over itself.
  const RETIRED: Record<string, string> = {
    "/my-account": "/account",
    "/my-account-2": "/account",
    "/my-account/orders": "/account/orders",
    "/rent-cart": "/rent/request",
    "/rent-gears": "/rent",
    "/rental-catalogue": "/rent",
  };
  for (const [legacy, destination] of Object.entries(RETIRED)) add(legacy, destination);

  await writeFile(
    path.join(root, "data", "redirects.json"),
    `${JSON.stringify(redirects, null, 2)}\n`,
    "utf8",
  );
  console.log(`  wrote data/redirects.json — ${redirects.length} redirects`);
}

main().catch((error) => {
  console.error(`build-redirects failed: ${error.message}`);
  process.exitCode = 1;
});
