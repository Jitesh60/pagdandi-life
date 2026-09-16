import type { MetadataRoute } from "next";
import {
  getAllProducts,
  getCatalogMeta,
  getPopulatedCategories,
  getPopulatedSubcategories,
  getRentalProducts,
} from "@/lib/catalog/queries";
import { POLICIES } from "@/lib/policies";
import { site } from "@/lib/site";

/**
 * Full sitemap generated from the catalogue snapshot.
 * The source WordPress site serves no sitemap at all, so this is net-new.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, site.url).toString();
  const lastModified = new Date(getCatalogMeta().generatedAt);

  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: url("/shop"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/rent"), lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: url("/about"), lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/contact"), lastModified, changeFrequency: "yearly", priority: 0.6 },
  ];

  const categories = getPopulatedCategories().flatMap(({ category }) => [
    { url: url(`/c/${category.id}`), lastModified, changeFrequency: "weekly" as const, priority: 0.8 },
    ...getPopulatedSubcategories(category.id).map(({ sub }) => ({
      url: url(`/c/${category.id}/${sub.id}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]);

  const products = getAllProducts().map((product) => ({
    url: url(`/p/${product.slug}`),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const rentals = getRentalProducts().map((product) => ({
    url: url(`/rent/${product.slug}`),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const policies = POLICIES.map((policy) => ({
    url: url(`/policies/${policy.slug}`),
    lastModified,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  return [...staticPages, ...categories, ...products, ...rentals, ...policies];
}
