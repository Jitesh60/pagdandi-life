"use client";

import Link from "next/link";
import { useCart, useStore, useWishlist } from "@/lib/mock/store";
import { Container, Eyebrow } from "@/components/ui/container";
import { discountPercent, formatPrice, savingAmount } from "@/lib/catalog/types";
import { getCategory } from "@/lib/catalog/categories";
import { PrototypeNote } from "./prototype-note";

/**
 * Detail page for a product created in the dashboard.
 *
 * These exist only in browser state, so the build cannot pre-render them.
 * `/p/[slug]` falls through to this component when a slug isn't in the
 * committed catalogue, which keeps one URL scheme for every product.
 */
export function CustomProductView({ slug }: { slug: string }) {
  const { state, hydrated } = useStore();
  const { add } = useCart();
  const wishlist = useWishlist();

  const product = state.customProducts.find((candidate) => candidate.slug === slug);

  if (!hydrated) {
    return (
      <Container className="py-(--spacing-section-sm)">
        <p className="text-ink-muted">Loading…</p>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-(--spacing-section)">
        <Eyebrow>Not found</Eyebrow>
        <h1 className="mt-6 max-w-[16ch] text-(length:--text-display-lg)">
          We don&apos;t stock that.
        </h1>
        <p className="mt-7 max-w-md text-ink-muted">
          The page you were after has moved or never existed.
        </p>
        <Link
          href="/shop"
          className="mt-9 inline-block border-b border-ink pb-1 transition-colors hover:border-moss hover:text-moss"
        >
          Browse the shop
        </Link>
      </Container>
    );
  }

  const priced = { price: product.price, compareAtPrice: product.compareAtPrice };
  const discount = discountPercent(priced);
  const saving = savingAmount(priced);
  const category = getCategory(product.categoryId);

  return (
    <Container className="py-(--spacing-section-sm)">
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
        <div className="relative aspect-[4/5] overflow-hidden bg-panel">
          {product.imageUrl ? (
            // An arbitrary URL, so next/image would need a remote pattern for it.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 size-full object-contain p-8"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-faint">
              <span className="eyebrow">No photograph</span>
            </div>
          )}
        </div>

        <div className="lg:pt-4">
          {category && <Eyebrow>{category.name}</Eyebrow>}
          <h1 className="mt-5 text-(length:--text-display-md)">{product.name}</h1>

          <p className="mt-7 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <span className="font-display text-(length:--text-display-sm)">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-ink-faint line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            {discount !== null && (
              <span className="bg-clay px-2.5 py-1 text-[0.75rem] font-medium uppercase tracking-wider text-paper">
                {discount}% off
              </span>
            )}
          </p>
          {saving !== null && (
            <p className="mt-2 text-[0.875rem] font-medium text-clay">
              Save {formatPrice(saving)}
            </p>
          )}

          {product.description && (
            <p className="mt-7 max-w-prose text-ink-muted">{product.description}</p>
          )}

          <div className="mt-9 flex flex-wrap gap-4">
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() =>
                add(
                  {
                    id: `${product.slug}::`,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.imageUrl,
                    options: {},
                  },
                  1,
                )
              }
              className="bg-ink px-8 py-4 text-paper transition-colors duration-500 hover:bg-moss disabled:cursor-not-allowed disabled:bg-ink-faint"
            >
              {product.stock > 0 ? "Add to cart" : "Out of stock"}
            </button>
            <button
              type="button"
              onClick={() => wishlist.toggle(product.slug)}
              aria-pressed={wishlist.has(product.slug)}
              className="border border-line px-6 py-4 transition-colors duration-500 hover:border-ink"
            >
              {wishlist.has(product.slug) ? "Saved" : "Save"}
            </button>
          </div>

          <p className="mt-4 text-[0.8125rem] text-ink-muted">
            {product.stock > 0 ? `${product.stock} in stock` : "None left"}
          </p>

          <div className="mt-10 max-w-md">
            <PrototypeNote>
              This product was added in the dashboard, so it lives in your browser rather
              than the published catalogue.
            </PrototypeNote>
          </div>
        </div>
      </div>
    </Container>
  );
}
