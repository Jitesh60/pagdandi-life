/**
 * The storefront's own data model.
 *
 * Deliberately decoupled from the WooCommerce Store API shape: the ingest
 * script is the only code that knows what Woo returns. Everything downstream
 * consumes these types, so the source store could be replaced without
 * touching a single component.
 */

export type ProductImage = {
  /** Repo-relative path under /public, already downloaded and optimised. */
  src: string;
  width: number;
  height: number;
  /** Tiny inline base64 LQIP — the honest skeleton for image loads. */
  blurDataURL: string;
  alt: string;
};

/** A selectable option group, e.g. Colour with two values. */
export type ProductOption = {
  name: string;
  values: string[];
};

export type Product = {
  slug: string;
  name: string;
  sku: string;
  /** Integer minor units (paise). Formatting happens at the edge, in one place. */
  price: number;
  /** Original price when discounted, else null. */
  compareAtPrice: number | null;
  images: ProductImage[];
  /** Curated category ids this product belongs to. */
  categoryIds: string[];
  /** Curated subcategory ids, namespaced as `<categoryId>/<subId>`. */
  subcategoryIds: string[];
  /** Sanitised HTML — safe to render. */
  description: string;
  /** Short plain-text summary, used for cards and meta descriptions. */
  summary: string;
  /**
   * True when `summary` came from the shop's own short description rather than
   * being derived from the opening of `description`. A derived summary is
   * still good for meta tags, but rendering it above the full description
   * would just repeat the same sentence twice on the page.
   */
  hasOwnSummary: boolean;
  inStock: boolean;
  /** Variant option groups. Empty for simple products. */
  options: ProductOption[];
  /** True when the item belongs to the rental catalogue rather than retail. */
  rental: boolean;
  rating: number | null;
  reviewCount: number;
  /** Original WooCommerce path, retained to generate redirects. */
  legacyPath: string;
};

export type Catalog = {
  /** ISO timestamp of the ingest run that produced this snapshot. */
  generatedAt: string;
  products: Product[];
};

/** The price fields any card needs; `Product` satisfies this structurally. */
export type Priced = { price: number; compareAtPrice: number | null };

/** Discount as a whole percentage, or null when the item isn't reduced. */
export function discountPercent(product: Priced): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Formats integer paise as rupees. The single place prices become strings. */
export function formatPrice(minorUnits: number): string {
  return INR.format(minorUnits / 100);
}

/**
 * True when the item carries a real list price.
 *
 * Rental stock is priced per trip rather than listed, so those records come
 * through with a zero price. Showing "₹0" would be wrong, so callers ask this
 * first and fall back to `PRICE_ON_REQUEST`.
 */
export function hasListedPrice(product: Priced): boolean {
  return product.price > 0;
}

export const PRICE_ON_REQUEST = "Rate on request";

/**
 * The subset of a product a grid card renders.
 *
 * Browsing pages filter and sort on the client, so the whole catalogue is
 * serialised into the page. Descriptions are by far the largest field and a
 * card never shows them, so they are dropped and the gallery is trimmed to the
 * single image the card displays.
 */
export type CardProduct = Pick<
  Product,
  | "slug"
  | "name"
  | "price"
  | "compareAtPrice"
  | "inStock"
  | "rental"
  | "categoryIds"
  | "subcategoryIds"
  | "rating"
  | "reviewCount"
> & {
  images: ProductImage[];
  /** True when a variant must be chosen, so the card links out instead of quick-adding. */
  hasOptions: boolean;
  /** Set for products created in the dashboard, whose image is a plain URL. */
  custom?: boolean;
};

export function toCardProduct(product: Product): CardProduct {
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    inStock: product.inStock,
    rental: product.rental,
    categoryIds: product.categoryIds,
    subcategoryIds: product.subcategoryIds,
    rating: product.rating,
    reviewCount: product.reviewCount,
    images: product.images.slice(0, 1),
    hasOptions: product.options.length > 0,
  };
}

/** Absolute saving, in paise, or null when the item isn't reduced. */
export function savingAmount(product: Priced): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return product.compareAtPrice - product.price;
}
