import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductBrowser, ProductBrowserSkeleton } from "@/components/product/product-browser";
import { Container, Eyebrow } from "@/components/ui/container";
import { getAllProducts, getPopulatedCategories } from "@/lib/catalog/queries";
import { toCardProduct } from "@/lib/catalog/types";
import { JsonLd, itemListSchema } from "@/lib/seo/json-ld";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Shop all gear",
  description:
    "Every piece of camping, trekking and outdoor gear we stock — tents, stoves, rucksacks, furniture, lights and apparel, from our store in Kathgodam, Uttarakhand.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  const products = getAllProducts();
  const facets = getPopulatedCategories().map(({ category }) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <>
      <JsonLd data={itemListSchema(products, "All gear")} />

      <Container className="py-(--spacing-section-sm)">
        <header className="max-w-3xl">
          <Eyebrow>{products.length} items</Eyebrow>
          <h1 className="mt-6 text-(length:--text-display-lg)">Everything we stock.</h1>
          <p className="mt-6 max-w-xl text-ink-muted">
            Narrow it down by category, price or availability. Prices are confirmed on
            WhatsApp — message us and we&apos;ll hold the item.
          </p>
        </header>

        <div className="mt-14">
          <Suspense fallback={<ProductBrowserSkeleton />}>
            <ProductBrowser products={products.map(toCardProduct)} facets={facets} />
          </Suspense>
        </div>
      </Container>
    </>
  );
}
