/**
 * Validates raw WooCommerce records and converts them into the storefront's
 * own `Product` model. This is the ONLY module that understands the Woo shape.
 */

import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import {
  CURATED_CATEGORIES,
  RENTAL_ROOT_SLUG,
  toCuratedCategoryIds,
} from "../../src/lib/catalog/categories.ts";
import type { Product, ProductImage, ProductOption } from "../../src/lib/catalog/types.ts";

const WooImage = z.object({
  src: z.string().url(),
  alt: z.string().default(""),
  name: z.string().default(""),
});

const WooCategory = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

const WooAttribute = z.object({
  name: z.string(),
  has_variations: z.boolean().default(false),
  terms: z.array(z.object({ name: z.string() })).default([]),
});

const WooProduct = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  sku: z.string().default(""),
  permalink: z.string().default(""),
  description: z.string().default(""),
  short_description: z.string().default(""),
  is_in_stock: z.boolean().default(true),
  average_rating: z.string().default("0"),
  review_count: z.number().default(0),
  prices: z.object({
    price: z.string(),
    regular_price: z.string(),
  }),
  images: z.array(WooImage).default([]),
  categories: z.array(WooCategory).default([]),
  attributes: z.array(WooAttribute).default([]),
});

export const WooCategoryRecord = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  parent: z.number().default(0),
  count: z.number().default(0),
});

export type WooCategoryRecord = z.infer<typeof WooCategoryRecord>;

/** Source slug -> `<categoryId>/<subId>`, built from the curated taxonomy. */
const SUBCATEGORY_LOOKUP = new Map<string, string[]>();
for (const category of CURATED_CATEGORIES) {
  for (const sub of category.subcategories) {
    for (const slug of sub.wooSlugs) {
      const key = `${category.id}/${sub.id}`;
      SUBCATEGORY_LOOKUP.set(slug, [...(SUBCATEGORY_LOOKUP.get(slug) ?? []), key]);
    }
  }
}

/**
 * Collects every category slug at or beneath the rental root, so rental stock
 * is separated from retail no matter how deeply it is nested.
 */
export function collectRentalSlugs(categories: WooCategoryRecord[]): Set<string> {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const isRental = (category: WooCategoryRecord): boolean => {
    let current: WooCategoryRecord | undefined = category;
    for (let depth = 0; current && depth < 8; depth++) {
      if (current.slug === RENTAL_ROOT_SLUG) return true;
      current = byId.get(current.parent);
    }
    return false;
  };
  return new Set(categories.filter(isRental).map((c) => c.slug));
}

/**
 * Decodes HTML entities into real characters.
 *
 * The Store API returns entity-encoded text (`&#038;`, `&amp;`, `&#8217;`).
 * That renders correctly inside HTML, but `name` and `summary` are rendered as
 * React text nodes, where an undecoded entity shows up literally on the page.
 * `&amp;` is handled last so `&amp;lt;` cannot decode twice.
 */
function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lsquo;|&rsquo;/g, "\u2019")
    .replace(/&ldquo;|&rdquo;/g, "\u201d")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Removes emoji and pictographs.
 *
 * Supplier descriptions use emoji as bullet glyphs (🎒, ✈️, 🛡️). They fight the
 * typography badly at this size, and carry no information the text doesn't
 * already state, so they are dropped rather than styled around.
 */
function stripEmoji(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/(^|>)\s+/g, "$1")
    .trim();
}

/** WPBakery leaves shortcodes and inline styles behind; strip them hard. */
function cleanDescription(html: string): string {
  const withoutShortcodes = stripEmoji(html.replace(/\[\/?[a-z_]+[^\]]*\]/gi, " "));
  return sanitizeHtml(withoutShortcodes, {
    allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li", "h3", "h4", "table", "thead", "tbody", "tr", "th", "td"],
    allowedAttributes: {},
    transformTags: { b: "strong", i: "em", h1: "h3", h2: "h3", h5: "h4", h6: "h4" },
  })
    .replace(/\s+/g, " ")
    .trim();
}

function toPlainText(html: string): string {
  const stripped = sanitizeHtml(html.replace(/\[\/?[a-z_]+[^\]]*\]/gi, " "), {
    allowedTags: [],
    allowedAttributes: {},
  });
  return stripEmoji(decodeEntities(stripped));
}

function buildSummary(short: string, full: string): { summary: string; own: boolean } {
  const owned = toPlainText(short);
  const text = owned || toPlainText(full);
  const summary = text.length <= 160 ? text : `${text.slice(0, 157).replace(/\s+\S*$/, "")}…`;
  return { summary, own: owned.length > 0 };
}

/**
 * Collapses Woo attributes into option groups.
 *
 * The source uses inconsistent casing for the same attribute ("Color" and
 * "color", "Size" and "size"), so groups are merged case-insensitively and
 * given a single tidy label.
 */
function buildOptions(attributes: z.infer<typeof WooAttribute>[]): ProductOption[] {
  const groups = new Map<string, { name: string; values: Set<string> }>();

  for (const attribute of attributes) {
    if (!attribute.has_variations || attribute.terms.length === 0) continue;
    const key = attribute.name.trim().toLowerCase();
    const label = key === "color" ? "Colour" : key.charAt(0).toUpperCase() + key.slice(1);
    const group = groups.get(key) ?? { name: label, values: new Set<string>() };
    for (const term of attribute.terms) {
      // Source casing is inconsistent ("Army Green" alongside "black"), and the
      // values are shown as chips, so normalise them to title case.
      const value = decodeEntities(term.name).replace(
        /\w\S*/g,
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      );
      if (value) group.values.add(value);
    }
    groups.set(key, group);
  }

  return [...groups.values()]
    .filter((group) => group.values.size > 0)
    .map((group) => ({ name: group.name, values: [...group.values] }));
}

export type NormalizeInput = {
  raw: unknown;
  rentalSlugs: Set<string>;
  /** Resolves remote image URLs to downloaded, optimised local assets. */
  resolveImages: (urls: { src: string; alt: string }[], slug: string) => Promise<ProductImage[]>;
};

export async function normalizeProduct({
  raw,
  rentalSlugs,
  resolveImages,
}: NormalizeInput): Promise<Product> {
  const woo = WooProduct.parse(raw);
  const slugs = woo.categories.map((c) => c.slug);

  const price = Number.parseInt(woo.prices.price, 10) || 0;
  const regular = Number.parseInt(woo.prices.regular_price, 10) || 0;
  const rating = Number.parseFloat(woo.average_rating);

  const subcategoryIds = [...new Set(slugs.flatMap((s) => SUBCATEGORY_LOOKUP.get(s) ?? []))];

  let legacyPath = `/product/${woo.slug}/`;
  try {
    if (woo.permalink) legacyPath = new URL(woo.permalink).pathname;
  } catch {
    // Keep the derived default when the permalink is malformed.
  }

  const { summary, own } = buildSummary(woo.short_description, woo.description);

  return {
    slug: woo.slug,
    name: decodeEntities(woo.name),
    sku: woo.sku || String(woo.id),
    price,
    compareAtPrice: regular > price ? regular : null,
    images: await resolveImages(
      woo.images.map((i) => ({ src: i.src, alt: i.alt || i.name || woo.name })),
      woo.slug,
    ),
    categoryIds: toCuratedCategoryIds(slugs),
    subcategoryIds,
    description: cleanDescription(woo.description),
    summary,
    hasOwnSummary: own,
    inStock: woo.is_in_stock,
    options: buildOptions(woo.attributes),
    rental: slugs.some((s) => rentalSlugs.has(s)),
    rating: Number.isFinite(rating) && rating > 0 ? rating : null,
    reviewCount: woo.review_count,
    legacyPath,
  };
}
