/**
 * Read access to the committed catalogue snapshot.
 *
 * Every function here is a pure lookup over a JSON file that ships with the
 * repo, so pages render at build time with no network and no database. The
 * snapshot is loaded once per process and indexed up front.
 */

import catalogJson from "../../../data/catalog.json" with { type: "json" };
import {
  CURATED_CATEGORIES,
  FALLBACK_CATEGORY,
  getCategory,
} from "./categories";
import type { Catalog, Product } from "./types";

const catalog = catalogJson as Catalog;

/** Retail stock — everything the shop sells outright. */
const retail: Product[] = catalog.products.filter((p) => !p.rental);
/** Rental stock, presented as its own browse-only catalogue. */
const rental: Product[] = catalog.products.filter((p) => p.rental);

const bySlug = new Map(catalog.products.map((p) => [p.slug, p]));

/** Sort: in-stock first, then by review count, so grids lead with real stock. */
function byProminence(a: Product, b: Product): number {
  if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
  return b.reviewCount - a.reviewCount;
}

export function getAllProducts(): Product[] {
  return [...retail].sort(byProminence);
}

export function getRentalProducts(): Product[] {
  return [...rental].sort(byProminence);
}

export function getProduct(slug: string): Product | undefined {
  return bySlug.get(slug);
}

export function getProductsInCategory(categoryId: string): Product[] {
  return retail.filter((p) => p.categoryIds.includes(categoryId)).sort(byProminence);
}

export function getProductsInSubcategory(categoryId: string, subId: string): Product[] {
  const key = `${categoryId}/${subId}`;
  return retail.filter((p) => p.subcategoryIds.includes(key)).sort(byProminence);
}

/** Categories that actually have stock — empty ones are never linked. */
export function getPopulatedCategories() {
  return [...CURATED_CATEGORIES, FALLBACK_CATEGORY]
    .map((category) => ({
      category,
      products: getProductsInCategory(category.id),
    }))
    .filter((entry) => entry.products.length > 0);
}

/** Subcategories of a category that have stock. */
export function getPopulatedSubcategories(categoryId: string) {
  const category = getCategory(categoryId);
  if (!category) return [];
  return category.subcategories
    .map((sub) => ({ sub, products: getProductsInSubcategory(categoryId, sub.id) }))
    .filter((entry) => entry.products.length > 0);
}

/** Homepage selection: the best-reviewed discounted items, one per category. */
export function getFeaturedProducts(limit = 8): Product[] {
  const seen = new Set<string>();
  const picks: Product[] = [];
  const candidates = retail
    .filter((p) => p.images.length > 0 && p.inStock)
    .sort((a, b) => b.reviewCount - a.reviewCount);

  // First pass: spread across categories so the grid isn't all stoves.
  for (const product of candidates) {
    const key = product.categoryIds[0] ?? "";
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push(product);
    if (picks.length === limit) return picks;
  }
  // Second pass: top up if there were fewer categories than slots.
  for (const product of candidates) {
    if (picks.includes(product)) continue;
    picks.push(product);
    if (picks.length === limit) break;
  }
  return picks;
}

/**
 * Related stock, ranked rather than merely filtered.
 *
 * Sharing a curated category is a weak signal on its own — it put a cookware
 * bag next to an 80L rucksack. Subcategory matches score highest, then
 * category overlap, then similarity of price, so suggestions are things
 * someone might actually cross-shop.
 */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const pool = product.rental ? rental : retail;

  return pool
    .filter((candidate) => candidate.slug !== product.slug && candidate.images.length > 0)
    .map((candidate) => {
      const sharedSubs = candidate.subcategoryIds.filter((id) =>
        product.subcategoryIds.includes(id),
      ).length;
      const sharedCats = candidate.categoryIds.filter((id) =>
        product.categoryIds.includes(id),
      ).length;
      if (sharedSubs === 0 && sharedCats === 0) return null;

      // Price proximity as a ratio, so it works across the whole range.
      const priceGap =
        product.price > 0 && candidate.price > 0
          ? Math.abs(Math.log(candidate.price / product.price))
          : 2;

      const score = sharedSubs * 10 + sharedCats * 4 - priceGap + (candidate.inStock ? 1 : 0);
      return { candidate, score };
    })
    .filter((hit): hit is { candidate: Product; score: number } => hit !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((hit) => hit.candidate);
}

/** Compact client-side search index — names and categories only, not prose. */
export type SearchEntry = {
  slug: string;
  name: string;
  category: string;
  rental: boolean;
};

export function getSearchIndex(): SearchEntry[] {
  return catalog.products.map((product) => ({
    slug: product.slug,
    name: product.name,
    category: getCategory(product.categoryIds[0] ?? "")?.name ?? "Gear",
    rental: product.rental,
  }));
}

export function getCatalogMeta() {
  return {
    generatedAt: catalog.generatedAt,
    retailCount: retail.length,
    rentalCount: rental.length,
  };
}
