"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { useWishlist } from "@/lib/mock/store";
import type { CardProduct } from "@/lib/catalog/types";

/**
 * Saved items. The whole card index is passed in from the server and filtered
 * here, because which items are saved is only known in the browser.
 */
export function WishlistView({ index }: { index: CardProduct[] }) {
  const { slugs, count } = useWishlist();
  const saved = index.filter((product) => slugs.includes(product.slug));

  if (count === 0) {
    return (
      <div className="mt-12 border-t border-line pt-14">
        <p className="font-display text-(length:--text-display-sm)">Nothing saved yet.</p>
        <p className="mt-4 max-w-sm text-ink-muted">
          Use “Save” on any product to keep it here while you decide.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block border-b border-ink pb-1 transition-colors hover:border-moss hover:text-moss"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <p className="text-[0.8125rem] text-ink-muted">{saved.length} saved</p>
      <div className="mt-8">
        <ProductGrid products={saved} />
      </div>
    </div>
  );
}
