import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ProductBrowser,
  ProductBrowserSkeleton,
} from "@/components/product/product-browser";
import { Container, Eyebrow } from "@/components/ui/container";
import { CURATED_CATEGORIES, FALLBACK_CATEGORY, getCategory } from "@/lib/catalog/categories";
import { getPopulatedSubcategories, getProductsInCategory } from "@/lib/catalog/queries";
import { toCardProduct } from "@/lib/catalog/types";
import { JsonLd, breadcrumbSchema, itemListSchema } from "@/lib/seo/json-ld";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return [...CURATED_CATEGORIES, FALLBACK_CATEGORY].map((category) => ({
    category: category.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/c/[category]">): Promise<Metadata> {
  const { category: id } = await params;
  const category = getCategory(id);
  if (!category) return {};

  const count = getProductsInCategory(id).length;
  const description = `${category.blurb} ${count} items in stock at our Kathgodam store, with rental available.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: `/c/${category.id}` },
    openGraph: { title: category.name, description, url: `/c/${category.id}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/c/[category]">) {
  const { category: id } = await params;
  const category = getCategory(id);
  if (!category) notFound();

  const products = getProductsInCategory(id);
  if (products.length === 0) notFound();

  const subcategories = getPopulatedSubcategories(id);

  return (
    <>
      <JsonLd data={itemListSchema(products, category.name)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Shop", path: "/shop" },
          { name: category.name, path: `/c/${category.id}` },
        ])}
      />

      <Container className="py-(--spacing-section-sm)">
        <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
          <Link href="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
        </nav>

        <header className="mt-10 max-w-3xl">
          <Eyebrow>{products.length} items</Eyebrow>
          <h1 className="mt-6 text-(length:--text-display-lg)">{category.name}</h1>
          <p className="mt-6 max-w-xl text-ink-muted">{category.blurb}</p>
        </header>

        {subcategories.length > 0 && (
          <nav
            aria-label="Subcategories"
            className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[0.875rem]"
          >
            {subcategories.map(({ sub, products: subProducts }) => (
              <Link
                key={sub.id}
                href={`/c/${category.id}/${sub.id}`}
                className="text-ink-muted transition-colors hover:text-ink"
              >
                {sub.name} <span className="text-ink-faint">({subProducts.length})</span>
              </Link>
            ))}
          </nav>
        )}

        <div className="mt-14">
          <Suspense fallback={<ProductBrowserSkeleton />}>
            <ProductBrowser
              products={products.map(toCardProduct)}
              facets={subcategories.map(({ sub }) => ({
                id: `${category.id}/${sub.id}`,
                name: sub.name,
              }))}
              facetField="subcategoryIds"
            />
          </Suspense>
        </div>
      </Container>
    </>
  );
}
