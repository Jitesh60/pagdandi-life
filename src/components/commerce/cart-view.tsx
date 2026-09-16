"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/mock/store";
import { formatPrice } from "@/lib/catalog/types";
import { PrototypeNote } from "./prototype-note";

export function CartView() {
  const { lines, subtotal, shipping, total, setQuantity, remove, hydrated } = useCart();

  if (!hydrated) {
    return <p className="mt-10 text-ink-muted">Loading your cart…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="mt-12 border-t border-line pt-14">
        <p className="font-display text-(length:--text-display-sm)">Your cart is empty.</p>
        <p className="mt-4 max-w-sm text-ink-muted">
          Nothing in here yet. Have a look through the shop, or the rental catalogue if
          you only need something for one trip.
        </p>
        <div className="mt-8 flex gap-8">
          <Link href="/shop" className="border-b border-ink pb-1 transition-colors hover:border-moss hover:text-moss">
            Browse the shop
          </Link>
          <Link href="/rent" className="border-b border-line pb-1 text-ink-muted transition-colors hover:border-ink hover:text-ink">
            Rent gear
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
      <ul className="divide-y divide-line-soft border-y border-line-soft">
        {lines.map((line) => (
          <li key={line.id} className="flex gap-5 py-6">
            <Link
              href={`/p/${line.slug}`}
              className="relative aspect-square w-24 shrink-0 overflow-hidden bg-panel"
            >
              {line.image && (
                <Image src={line.image} alt="" fill sizes="96px" className="object-contain p-2" />
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              <div>
                <Link href={`/p/${line.slug}`} className="text-[0.9375rem] transition-colors hover:text-moss">
                  {line.name}
                </Link>
                {Object.keys(line.options).length > 0 && (
                  <p className="mt-1 text-[0.8125rem] text-ink-muted">
                    {Object.entries(line.options)
                      .map(([name, value]) => `${name}: ${value}`)
                      .join(" · ")}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-line">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.id, line.quantity - 1)}
                    aria-label={`Decrease quantity of ${line.name}`}
                    className="px-3 py-2 text-ink-muted transition-colors hover:text-ink"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-[0.875rem]">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.id, line.quantity + 1)}
                    aria-label={`Increase quantity of ${line.name}`}
                    className="px-3 py-2 text-ink-muted transition-colors hover:text-ink"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(line.id)}
                  className="text-[0.8125rem] text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
                >
                  Remove
                </button>
              </div>
            </div>

            <p className="shrink-0 text-[0.9375rem]">{formatPrice(line.price * line.quantity)}</p>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="eyebrow">Summary</h2>
        <dl className="mt-6 flex flex-col gap-3 border-b border-line pb-6 text-[0.9375rem]">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Delivery</dt>
            <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex justify-between">
          <span className="font-display text-(length:--text-display-sm)">Total</span>
          <span className="font-display text-(length:--text-display-sm)">{formatPrice(total)}</span>
        </div>
        {shipping > 0 && (
          <p className="mt-3 text-[0.8125rem] text-ink-muted">
            Free delivery on orders over {formatPrice(200_000)}.
          </p>
        )}

        <Link
          href="/checkout"
          className="mt-8 block bg-ink px-8 py-4 text-center text-paper transition-colors duration-500 ease-[var(--ease-calm)] hover:bg-moss"
        >
          Checkout
        </Link>
        <Link
          href="/shop"
          className="mt-4 block text-center text-[0.875rem] text-ink-muted transition-colors hover:text-ink"
        >
          Continue shopping
        </Link>

        <div className="mt-8">
          <PrototypeNote>
            No payment is taken and no order reaches the shop. Checkout writes to your
            browser only.
          </PrototypeNote>
        </div>
      </aside>
    </div>
  );
}
