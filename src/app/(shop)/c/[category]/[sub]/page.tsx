import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { toCardProduct } from "@/lib/catalog/types";
import { Container, Eyebrow } from "@/components/ui/container";
import { CURATED_CATEGORIES, getCategory, getSubcategory } from "@/lib/catalog/categories";
import { getProductsInSubcategory } from "@/lib/catalog/queries";
import { JsonLd, breadcrumbSchema, itemListSchema } from "@/lib/seo/json-ld";

export const revalidate = 86400;
export const dynamicParams = false;

/** Only subcategories that actually hold stock become routes. */
export function generateStaticParams() {
  return CURATED_CATEGORIES.flatMap((category) =>
    category.subcategories
      .filter((sub) => getProductsInSubcategory(category.id, sub.id).length > 0)
      .map((sub) => ({ category: category.id, sub: sub.id })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/c/[category]/[sub]">): Promise<Metadata> {
  const { category: categoryId, sub: subId } = await params;
  const category = getCategory(categoryId);
  const sub = getSubcategory(categoryId, subId);
  if (!category || !sub) return {};

  const count = getProductsInSubcategory(categoryId, subId).length;
  const description = `${sub.name} — ${count} items from our ${category.name.toLowerCase()} range, stocked in Kathgodam.`;

  return {
    title: `${sub.name} · ${category.name}`,
    description,
    alternates: { canonical: `/c/${category.id}/${sub.id}` },
    openGraph: { title: sub.name, description, url: `/c/${category.id}/${sub.id}` },
  };
}

export default async function SubcategoryPage({ params }: PageProps<"/c/[category]/[sub]">) {
  const { category: categoryId, sub: subId } = await params;
  const category = getCategory(categoryId);
  const sub = getSubcategory(categoryId, subId);
  if (!category || !sub) notFound();

  const products = getProductsInSubcategory(categoryId, subId);
  if (products.length === 0) notFound();

  return (
    <>
      <JsonLd data={itemListSchema(products, sub.name)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Shop", path: "/shop" },
          { name: category.name, path: `/c/${category.id}` },
          { name: sub.name, path: `/c/${category.id}/${sub.id}` },
        ])}
      />

      <Container className="py-(--spacing-section-sm)">
        <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
          <Link href="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
          <span className="px-2 text-ink-faint">/</span>
          <Link href={`/c/${category.id}`} className="transition-colors hover:text-ink">
            {category.name}
          </Link>
        </nav>

        <header className="mt-10 max-w-3xl">
          <Eyebrow>{products.length} items</Eyebrow>
          <h1 className="mt-6 text-(length:--text-display-lg)">{sub.name}</h1>
        </header>

        <div className="mt-16">
          <ProductGrid products={products.map(toCardProduct)} />
        </div>
      </Container>
    </>
  );
}
