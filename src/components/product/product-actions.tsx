"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, useWishlist } from "@/lib/mock/store";
import { formatPrice, hasListedPrice } from "@/lib/catalog/types";
import { contact, whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/catalog/types";

/**
 * Buying actions for a retail product.
 *
 * Add to cart leads; the WhatsApp enquiry stays available underneath because
 * that is still how the shop actually answers questions about stock and fit.
 * Variant options must be chosen before the item can be added.
 */
export function ProductActions({ product }: { product: Product }) {
  const { add } = useCart();
  const wishlist = useWishlist();

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    // Pre-select when a group has only one possible value.
    Object.fromEntries(
      product.options
        .filter((option) => option.values.length === 1)
        .map((option) => [option.name, option.values[0]]),
    ),
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const missing = product.options.filter((option) => !selected[option.name]);
  const canAdd = product.inStock && missing.length === 0;

  const handleAdd = () => {
    if (!canAdd) return;
    const suffix = Object.entries(selected)
      .map(([name, value]) => `${name}:${value}`)
      .sort()
      .join("|");
    add(
      {
        id: `${product.slug}::${suffix}`,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0]?.src ?? null,
        options: selected,
      },
      quantity,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2600);
  };

  return (
    <div className="mt-9">
      {product.options.map((option) => (
        <fieldset key={option.name} className="mt-7 first:mt-0">
          <legend className="eyebrow">
            {option.name}
            {selected[option.name] && (
              <span className="ml-2 normal-case tracking-normal text-ink">
                {selected[option.name]}
              </span>
            )}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {option.values.map((value) => {
              const active = selected[option.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value }))}
                  className={`border px-4 py-2 text-[0.875rem] transition-colors duration-300 ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-line text-ink-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center border border-line">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="px-4 py-3.5 text-ink-muted transition-colors hover:text-ink"
          >
            −
          </button>
          <span aria-live="polite" className="w-10 text-center text-[0.9375rem]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            aria-label="Increase quantity"
            className="px-4 py-3.5 text-ink-muted transition-colors hover:text-ink"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="flex-1 bg-ink px-8 py-4 text-paper transition-colors duration-500 ease-[var(--ease-calm)] hover:bg-moss disabled:cursor-not-allowed disabled:bg-ink-faint sm:flex-none"
        >
          {!product.inStock
            ? "Out of stock"
            : missing.length > 0
              ? `Choose ${missing[0].name.toLowerCase()}`
              : hasListedPrice(product)
                ? `Add to cart · ${formatPrice(product.price * quantity)}`
                : "Add to cart"}
        </button>

        <button
          type="button"
          onClick={() => wishlist.toggle(product.slug)}
          aria-pressed={wishlist.has(product.slug)}
          className="border border-line px-6 py-4 transition-colors duration-500 ease-[var(--ease-calm)] hover:border-ink"
        >
          {wishlist.has(product.slug) ? "Saved" : "Save"}
        </button>
      </div>

      <div className="mt-4 min-h-6" aria-live="polite">
        {added && (
          <p className="text-[0.875rem] text-moss">
            Added to cart.{" "}
            <Link href="/cart" className="border-b border-moss pb-0.5">
              View cart
            </Link>
          </p>
        )}
      </div>

      <p className="mt-3 text-[0.8125rem] text-ink-muted">
        {product.inStock
          ? "In stock at our Kathgodam store."
          : "Currently out of stock — message us and we'll tell you when it's back."}{" "}
        <a
          href={whatsappLink(`${product.name} (${product.sku})`)}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-line-soft text-ink transition-colors hover:border-moss hover:text-moss"
        >
          Ask on WhatsApp
        </a>{" "}
        or call {contact.phoneDisplay}.
      </p>
    </div>
  );
}
