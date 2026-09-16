import type { CardProduct } from "@/lib/catalog/types";
import type { CustomProduct } from "./types";

/** Slugify a product name, with a short suffix so duplicates can't collide. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "product"}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Presents a dashboard-created product in the same shape the grids consume,
 * so custom products flow through every listing without special cases.
 */
export function toCard(product: CustomProduct): CardProduct {
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    inStock: product.stock > 0,
    rental: false,
    categoryIds: [product.categoryId],
    subcategoryIds: [],
    rating: null,
    reviewCount: 0,
    images: product.imageUrl
      ? [{ src: product.imageUrl, width: 800, height: 1000, blurDataURL: "", alt: product.name }]
      : [],
    hasOptions: false,
    custom: true,
  };
}

/** Storefront-visible custom products, newest first. */
export function visibleCustomProducts(products: CustomProduct[]): CustomProduct[] {
  return products.filter((product) => !product.hidden);
}
