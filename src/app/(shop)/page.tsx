import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { CategoryTiles } from "@/components/home/category-tiles";
import type { CategoryTile } from "@/components/home/category-tiles";
import { StoreNote } from "@/components/home/store-note";
import { ProductGrid } from "@/components/product/product-grid";
import { toCardProduct } from "@/lib/catalog/types";
import { Container, Eyebrow } from "@/components/ui/container";
import {
  getCatalogMeta,
  getFeaturedProducts,
  getPopulatedCategories,
  getProductsInCategory,
  getRentalProducts,
} from "@/lib/catalog/queries";
import { JsonLd, localBusinessSchema, organizationSchema } from "@/lib/seo/json-ld";

export default function HomePage() {
  const populated = getPopulatedCategories();
  const featured = getFeaturedProducts(8);
  const { retailCount, rentalCount } = getCatalogMeta();

  // Lead with a photograph from the tents range, falling back to any stock.
  const heroSource = getProductsInCategory("tents-shelter").find((p) => p.images.length > 0);
  const heroImage = (heroSource ?? featured[0])?.images[0] ?? null;

  const tiles: CategoryTile[] = populated.map(({ category, products }) => ({
    category,
    image: products.find((p) => p.images.length > 0)?.images[0] ?? null,
    count: products.length,
  }));

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={localBusinessSchema()} />

      <Hero image={heroImage} categories={populated.map((entry) => entry.category)} />

      <section className="mt-(--spacing-section)">
        <Container>
          <div className="flex items-baseline justify-between gap-6">
            <Eyebrow>Find your kit</Eyebrow>
            <Link href="/shop" className="text-[0.8125rem] text-ink-muted transition-colors hover:text-ink">
              All {retailCount} items
            </Link>
          </div>
          <div className="mt-10">
            <CategoryTiles tiles={tiles} />
          </div>
        </Container>
      </section>

      <section className="mt-(--spacing-section)">
        <Container>
          <Eyebrow>Selected gear</Eyebrow>
          <h2 className="mt-6 max-w-[18ch] text-(length:--text-display-lg)">
            What people come back for.
          </h2>
          <div className="mt-14">
            <ProductGrid products={featured.map(toCardProduct)} />
          </div>
        </Container>
      </section>

      <StoreNote retailCount={retailCount} />

      <section className="mt-(--spacing-section)">
        <Container>
          <div className="border-t border-line pt-12 lg:flex lg:items-end lg:justify-between">
            <div>
              <Eyebrow>Rent instead</Eyebrow>
              <h2 className="mt-6 max-w-[16ch] text-(length:--text-display-lg)">
                One trip doesn&apos;t need a lifetime of kit.
              </h2>
            </div>
            <p className="mt-7 max-w-sm text-ink-muted lg:mt-0">
              {rentalCount} pieces available to rent — tents, sleeping bags, spikes and
              cameras. Message us with your dates.
            </p>
          </div>
          <div className="mt-14">
            <ProductGrid products={getRentalProducts().slice(0, 4).map(toCardProduct)} />
          </div>
        </Container>
      </section>
    </>
  );
}
