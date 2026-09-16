/**
 * Structured data builders.
 *
 * The source site ships none of this, so it is the clearest SEO win in the
 * rebuild. Every emitter renders a single JSON-LD script tag.
 */

import { address, googleRating, site, socials } from "@/lib/site";
import { discountPercent, formatPrice } from "@/lib/catalog/types";
import type { Product } from "@/lib/catalog/types";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is generated from our own snapshot, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.description,
    sameAs: socials.map((s) => s.href),
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SportingGoodsStore",
    name: site.name,
    url: site.url,
    description: site.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: address.locality,
      addressRegion: address.region,
      addressCountry: address.country,
    },
    priceRange: "₹₹",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: googleRating.value,
      reviewCount: googleRating.count,
    },
    sameAs: socials.map((s) => s.href),
  };
}

export function productSchema(product: Product) {
  const path = product.rental ? `/rent/${product.slug}` : `/p/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary || product.name,
    sku: product.sku,
    image: product.images.map((i) => new URL(i.src, site.url).toString()),
    // Rental stock has no list price, and an Offer with price 0 is invalid
    // markup — emit the offer only when there is a real price to state.
    ...(product.price > 0
      ? {
          offers: {
            "@type": "Offer",
            url: new URL(path, site.url).toString(),
            priceCurrency: site.currency,
            // Schema.org expects major units; our snapshot stores paise.
            price: (product.price / 100).toFixed(2),
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }
      : {}),
    ...(product.rating && product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: new URL(crumb.path, site.url).toString(),
    })),
  };
}

export function itemListSchema(products: Product[], listName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: new URL(
        product.rental ? `/rent/${product.slug}` : `/p/${product.slug}`,
        site.url,
      ).toString(),
      name: product.name,
    })),
  };
}

/** Plain-text price summary reused in meta descriptions. */
export function priceSentence(product: Product): string {
  const discount = discountPercent(product);
  const base = `${formatPrice(product.price)}`;
  return discount ? `${base}, ${discount}% off` : base;
}
