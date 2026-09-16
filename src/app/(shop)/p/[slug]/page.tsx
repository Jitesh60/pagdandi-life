import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomProductView } from "@/components/commerce/custom-product-view";
import { ProductGallery } from "@/components/product/product-gallery";
import { MobileEnquiryBar } from "@/components/product/mobile-enquiry-bar";
import { ProductActions } from "@/components/product/product-actions";
import { ProductGrid } from "@/components/product/product-grid";
import { Container, Eyebrow } from "@/components/ui/container";
import { getAllProducts, getProduct, getRelatedProducts } from "@/lib/catalog/queries";
import { getCategory } from "@/lib/catalog/categories";
import { discountPercent, formatPrice, toCardProduct } from "@/lib/catalog/types";
import {
  JsonLd,
  breadcrumbSchema,
  priceSentence,
  productSchema,
} from "@/lib/seo/json-ld";

/** Refresh the snapshot-backed pages daily. */
export const revalidate = 86400;
/**
 * Unknown slugs must still render: products created in the dashboard exist
 * only in browser state, so the build cannot know their slugs. The page falls
 * through to a client component that resolves them.
 */
export const dynamicParams = true;

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  const description =
    product.summary || `${product.name} — ${priceSentence(product)}. Available at our Kathgodam store.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/p/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/p/${product.slug}`,
      images: product.images[0] ? [{ url: product.images[0].src }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  // A rental reached through /p/ is a genuine 404; an unknown slug may be a
  // product added in the dashboard, so hand it to the client resolver.
  if (product?.rental) notFound();
  if (!product) return <CustomProductView slug={slug} />;

  const category = getCategory(product.categoryIds[0] ?? "");
  const discount = discountPercent(product);
  const related = getRelatedProducts(product);

  return (
    <>
      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Shop", path: "/shop" },
          ...(category ? [{ name: category.name, path: `/c/${category.id}` }] : []),
          { name: product.name, path: `/p/${product.slug}` },
        ])}
      />

      <Container className="py-(--spacing-section-sm) pb-28 lg:pb-(--spacing-section-sm)">
        <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
          <Link href="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
          {category && (
            <>
              <span className="px-2 text-ink-faint">/</span>
              <Link href={`/c/${category.id}`} className="transition-colors hover:text-ink">
                {category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div className="lg:pt-4">
            {category && <Eyebrow>{category.name}</Eyebrow>}

            <h1 className="mt-5 text-(length:--text-display-md)">{product.name}</h1>

            <p className="mt-7 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="text-(length:--text-display-sm) font-display">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-ink-faint line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {discount && <span className="text-clay">{discount}% less</span>}
            </p>

            {/* Stated as text rather than a star row — the same information
                without the retail-template look. */}
            {product.rating && product.reviewCount > 0 && (
              <p className="mt-4 text-[0.875rem] text-ink-muted">
                Rated {product.rating} out of 5 · {product.reviewCount} reviews
              </p>
            )}

            {/* Only shown when the shop wrote a real short description —
                a derived summary would repeat the Details text verbatim. */}
            {product.hasOwnSummary && product.summary && (
              <p className="mt-7 max-w-prose text-ink-muted">{product.summary}</p>
            )}

            <ProductActions product={product} />

            {product.description && (
              <div className="mt-14 border-t border-line pt-10">
                <Eyebrow>Details</Eyebrow>
                <div
                  className="prose-editorial mt-6 max-w-prose text-[0.9375rem] text-ink-muted"
                  // Sanitised at ingest: tags are allow-listed and attributes stripped.
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            <dl className="mt-12 flex gap-12 border-t border-line pt-8 text-[0.8125rem]">
              <div>
                <dt className="eyebrow">Item code</dt>
                <dd className="mt-2 text-ink-muted">{product.sku}</dd>
              </div>
              <div>
                <dt className="eyebrow">Availability</dt>
                <dd className="mt-2 text-ink-muted">
                  {product.inStock ? "In stock" : "Out of stock"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-(--spacing-section) border-t border-line pt-14">
            <Eyebrow>More like this</Eyebrow>
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
