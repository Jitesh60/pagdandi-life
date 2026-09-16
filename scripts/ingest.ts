/**
 * Builds the committed catalogue snapshot from the source WooCommerce store.
 *
 *   node --env-file=.env.local scripts/ingest.ts [--refetch] [--skip-images]
 *
 * Run by hand, never during `next build`. The build must stay hermetic: it
 * reads data/catalog.json and public/catalog/** and touches no network.
 *
 *   --refetch      re-pull from the Store API instead of reusing data/raw
 *   --skip-images  normalise metadata only, leaving existing images in place
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchAllCategories, fetchAllProducts } from "./lib/woo-client.ts";
import { resolveProductImages } from "./lib/images.ts";
import {
  WooCategoryRecord,
  collectRentalSlugs,
  normalizeProduct,
} from "./lib/normalize.ts";
import type { Catalog, Product, ProductImage } from "../src/lib/catalog/types.ts";

const RAW_DIR = path.join(process.cwd(), "data", "raw");
const OUT_FILE = path.join(process.cwd(), "data", "catalog.json");

const flags = new Set(process.argv.slice(2));

async function readRaw<T>(
  file: string,
  pick: (json: Record<string, unknown>) => T,
): Promise<T | null> {
  try {
    return pick(JSON.parse(await readFile(path.join(RAW_DIR, file), "utf8")));
  } catch {
    return null;
  }
}

async function loadSource(): Promise<{ products: unknown[]; categories: unknown[] }> {
  if (!flags.has("--refetch")) {
    const products = await readRaw("products.json", (j) => j.products ?? j);
    const categories = await readRaw("categories.json", (j) => j.categories ?? j);
    if (Array.isArray(products) && Array.isArray(categories)) {
      console.log(`  reusing data/raw (${products.length} products) — pass --refetch to re-pull`);
      return { products, categories };
    }
  }

  console.log("  fetching from the Store API…");
  const [products, categories] = [await fetchAllProducts(), await fetchAllCategories()];
  await mkdir(RAW_DIR, { recursive: true });
  await writeFile(path.join(RAW_DIR, "products.json"), JSON.stringify({ products }), "utf8");
  await writeFile(path.join(RAW_DIR, "categories.json"), JSON.stringify({ categories }), "utf8");
  return { products, categories };
}

async function main() {
  console.log("\nPagdandiLife catalogue ingest\n");

  const { products: rawProducts, categories: rawCategories } = await loadSource();

  const categories = rawCategories.map((c) => WooCategoryRecord.parse(c));
  const rentalSlugs = collectRentalSlugs(categories);
  console.log(`  ${categories.length} source categories, ${rentalSlugs.size} rental`);

  // Reuse previously resolved images when only metadata is being refreshed.
  const previous = new Map<string, ProductImage[]>();
  if (flags.has("--skip-images")) {
    try {
      const existing = JSON.parse(await readFile(OUT_FILE, "utf8")) as Catalog;
      for (const product of existing.products) previous.set(product.slug, product.images);
    } catch {
      console.warn("  ! --skip-images: no existing snapshot, products will have no images");
    }
  }

  const resolveImages = flags.has("--skip-images")
    ? async (_: { src: string; alt: string }[], slug: string) => previous.get(slug) ?? []
    : resolveProductImages;

  const products: Product[] = [];
  const failures: string[] = [];

  for (const [index, raw] of rawProducts.entries()) {
    try {
      products.push(await normalizeProduct({ raw, rentalSlugs, resolveImages }));
    } catch (error) {
      const name = (raw as { slug?: string })?.slug ?? `#${index}`;
      failures.push(`${name}: ${(error as Error).message.split("\n")[0]}`);
    }
    if (products.length % 10 === 0 || products.length === rawProducts.length) {
      process.stdout.write(`\r  normalised ${products.length}/${rawProducts.length}`);
    }
  }
  process.stdout.write("\n");

  // A product with no usable imagery would render as a hole in the grid.
  const withoutImages = products.filter((p) => p.images.length === 0);

  const catalog: Catalog = { generatedAt: new Date().toISOString(), products };
  await writeFile(OUT_FILE, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const retail = products.filter((p) => !p.rental).length;
  console.log(`
  wrote data/catalog.json
    ${products.length} products (${retail} retail, ${products.length - retail} rental)
    ${products.reduce((n, p) => n + p.images.length, 0)} images
    ${withoutImages.length} without images${withoutImages.length ? `: ${withoutImages.slice(0, 5).map((p) => p.slug).join(", ")}` : ""}
    ${failures.length} failed${failures.length ? `:\n      ${failures.slice(0, 10).join("\n      ")}` : ""}
`);

  if (products.length === 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`\ningest failed: ${error.message}\n`);
  process.exitCode = 1;
});
