"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/mock/store";
import {
  PRICE_ON_REQUEST,
  discountPercent,
  formatPrice,
  hasListedPrice,
  savingAmount,
} from "@/lib/catalog/types";
import type { CardProduct } from "@/lib/catalog/types";

/**
 * A product in a grid.
 *
 * Louder than the first pass by intent: the saving is stated as a badge rather
 * than a footnote, the price carries display weight, and the rating is shown
 * where it helps a decision. Quick-add appears on hover for simple products;
 * anything with a variant links through, because a colour must be chosen.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: CardProduct;
  /** Set for above-the-fold cards so the LCP image isn't lazy-loaded. */
  priority?: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const image = product.images[0];
  const discount = discountPercent(product);
  const saving = savingAmount(product);
  const href = product.rental ? `/rent/${product.slug}` : `/p/${product.slug}`;

  const quickAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    add(
      {
        id: `${product.slug}::`,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: image?.src ?? null,
        options: {},
      },
      1,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="group/card">
      <Link href={href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-panel">
          {image ? (
            product.custom ? (
              // Dashboard-created products carry an arbitrary image URL, which
              // next/image would refuse without a configured remote pattern.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.src}
                alt={image.alt}
                className="absolute inset-0 size-full object-contain p-5 transition-transform duration-[1200ms] ease-[var(--ease-calm)] group-hover/card:scale-[1.04] lg:p-7"
              />
            ) : (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                placeholder="blur"
                blurDataURL={image.blurDataURL}
                priority={priority}
                className="object-contain p-5 transition-transform duration-[1200ms] ease-[var(--ease-calm)] group-hover/card:scale-[1.04] lg:p-7"
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-ink-faint">
              <span className="eyebrow">No photograph</span>
            </div>
          )}

          {/* Saving stated plainly and prominently, not as a footnote. */}
          {discount !== null && product.inStock && (
            <span className="absolute left-0 top-4 bg-clay px-3 py-1.5 text-[0.75rem] font-medium uppercase tracking-wider text-paper">
              {discount}% off
            </span>
          )}

          {!product.inStock && (
            <span className="absolute left-0 top-4 bg-ink px-3 py-1.5 text-[0.75rem] font-medium uppercase tracking-wider text-paper">
              Sold out
            </span>
          )}

          {product.rental && (
            <span className="absolute right-0 top-4 bg-moss px-3 py-1.5 text-[0.75rem] font-medium uppercase tracking-wider text-paper">
              For rent
            </span>
          )}

          {/* Quick action, revealed on hover and always reachable by keyboard. */}
          {product.inStock && !product.rental && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-500 ease-[var(--ease-calm)] group-hover/card:translate-y-0 group-hover/card:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
              {product.hasOptions ? (
                <span className="block bg-ink/92 py-3.5 text-center text-[0.8125rem] font-medium uppercase tracking-wider text-paper backdrop-blur-sm">
                  Choose options
                </span>
              ) : (
                <button
                  type="button"
                  onClick={quickAdd}
                  className="block w-full bg-ink/92 py-3.5 text-center text-[0.8125rem] font-medium uppercase tracking-wider text-paper backdrop-blur-sm transition-colors hover:bg-moss"
                >
                  {added ? "Added ✓" : "Add to cart"}
                </button>
              )}
            </div>
          )}
        </div>

        <h3 className="mt-5 text-[1rem] font-medium leading-snug text-ink">{product.name}</h3>

        {product.rating !== null && product.reviewCount > 0 && (
          <p className="mt-2 text-[0.8125rem] text-ink-muted">
            <span className="text-ink">{product.rating} ★</span> · {product.reviewCount} reviews
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {hasListedPrice(product) ? (
            <>
              <span className="font-display text-[1.375rem] leading-none text-ink">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-[0.875rem] text-ink-faint line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </>
          ) : (
            <span className="font-display text-[1.375rem] leading-none text-ink-muted">
              {PRICE_ON_REQUEST}
            </span>
          )}
        </div>

        {saving !== null && (
          <p className="mt-1.5 text-[0.8125rem] font-medium text-clay">
            Save {formatPrice(saving)}
          </p>
        )}
      </Link>
    </article>
  );
}
