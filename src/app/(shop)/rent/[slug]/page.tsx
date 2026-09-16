import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { MobileEnquiryBar } from "@/components/product/mobile-enquiry-bar";
import { RentalActions } from "@/components/commerce/rental-actions";
import { ProductGrid } from "@/components/product/product-grid";
import { Container, Eyebrow } from "@/components/ui/container";
import { getProduct, getRelatedProducts, getRentalProducts } from "@/lib/catalog/queries";
import { formatPrice, hasListedPrice, toCardProduct } from "@/lib/catalog/types";
import { JsonLd, breadcrumbSchema, productSchema } from "@/lib/seo/json-ld";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return getRentalProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/rent/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  const description =
    product.summary || `Rent ${product.name} for your trek, from our Kathgodam store.`;

  return {
    title: `Rent ${product.name}`,
    description,
    alternates: { canonical: `/rent/${product.slug}` },
    openGraph: {
      title: `Rent ${product.name}`,
      description,
      url: `/rent/${product.slug}`,
      images: product.images[0] ? [{ url: product.images[0].src }] : undefined,
    },
  };
}

export default async function RentalItemPage({ params }: PageProps<"/rent/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || !product.rental) notFound();

  const related = getRelatedProducts(product);

  return (
    <>
      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Rent gear", path: "/rent" },
          { name: product.name, path: `/rent/${product.slug}` },
        ])}
      />

      <Container className="py-(--spacing-section-sm) pb-28 lg:pb-(--spacing-section-sm)">
        <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
          <Link href="/rent" className="transition-colors hover:text-ink">
            Rent gear
          </Link>
        </nav>

        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div className="lg:pt-4">
            <Eyebrow>For rent</Eyebrow>
            <h1 className="mt-5 text-(length:--text-display-md)">{product.name}</h1>

            {hasListedPrice(product) && (
              <p className="mt-7">
                <span className="font-display text-(length:--text-display-sm)">
                  {formatPrice(product.price)}
                </span>
                <span className="ml-3 text-ink-muted">to buy outright</span>
              </p>
            )}
            <p className="mt-7 max-w-prose text-ink-muted">
              Rental rates depend on how long you need it and when you&apos;re going.
              Message us with your dates and we&apos;ll quote you directly.
            </p>

            {/* Only shown when the shop wrote a real short description —
                a derived summary would repeat the Details text verbatim. */}
            {product.hasOwnSummary && product.summary && (
              <p className="mt-7 max-w-prose text-ink-muted">{product.summary}</p>
            )}

            <RentalActions product={product} />

            {product.description && (
              <div className="mt-14 border-t border-line pt-10">
                <Eyebrow>Details</Eyebrow>
                <div
                  className="prose-editorial mt-6 max-w-prose text-[0.9375rem] text-ink-muted"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-(--spacing-section) border-t border-line pt-14">
            <Eyebrow>Also available to rent</Eyebrow>
            <div className="mt-10">
              <ProductGrid products={related.map(toCardProduct)} />
            </div>
          </section>
        )}
      </Container>

      <MobileEnquiryBar product={product} />
    </>
  );
}
