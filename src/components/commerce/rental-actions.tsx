"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore, useWishlist } from "@/lib/mock/store";
import { contact, whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/catalog/types";

/** Tomorrow, as yyyy-mm-dd — rentals are collected from the shop, not same-day. */
function defaultFrom(): string {
  return new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  return new Date(new Date(date).getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

function nightsBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);
}

/**
 * Rental booking: pick dates, add to the rental request.
 *
 * Rates are quoted by the shop rather than listed, so this gathers dates and
 * builds a request instead of pricing anything.
 */
export function RentalActions({ product }: { product: Product }) {
  const { state, dispatch } = useStore();
  const wishlist = useWishlist();

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(() => addDays(defaultFrom(), 3));
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const nights = nightsBetween(from, to);
  const inRequest = state.rentalCart.some((line) => line.slug === product.slug);

  const addToRequest = () => {
    if (nights < 1) {
      setError("The return date must be after the collection date.");
      return;
    }
    setError("");
    dispatch({
      type: "rental/add",
      line: {
        id: `${product.slug}::${from}::${to}`,
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.src ?? null,
        from,
        to,
      },
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2600);
  };

  return (
    <div className="mt-9">
      <fieldset>
        <legend className="eyebrow">Dates</legend>
        <div className="mt-3 flex flex-wrap gap-5">
          <div>
            <label htmlFor="rent-from" className="block text-[0.8125rem] text-ink-muted">
              Collect
            </label>
            <input
              id="rent-from"
              type="date"
              value={from}
              min={defaultFrom()}
              onChange={(event) => {
                setFrom(event.target.value);
                if (nightsBetween(event.target.value, to) < 1) {
                  setTo(addDays(event.target.value, 3));
                }
              }}
              className="mt-2 border-b border-line bg-transparent pb-2 outline-none transition-colors focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="rent-to" className="block text-[0.8125rem] text-ink-muted">
              Return
            </label>
            <input
              id="rent-to"
              type="date"
              value={to}
              min={addDays(from, 1)}
              onChange={(event) => setTo(event.target.value)}
              className="mt-2 border-b border-line bg-transparent pb-2 outline-none transition-colors focus:border-ink"
            />
          </div>
        </div>
      </fieldset>

      <p className="mt-4 text-[0.875rem] text-ink-muted">
        {nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Choose a return date"}
      </p>

      {error && (
        <p role="alert" className="mt-3 text-[0.875rem] text-clay">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={addToRequest}
          className="bg-ink px-8 py-4 text-paper transition-colors duration-500 ease-[var(--ease-calm)] hover:bg-moss"
        >
          {inRequest ? "Add these dates too" : "Add to rental request"}
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

      <div className="mt-4 min-h-6" aria-live="polite">
        {added && (
          <p className="text-[0.875rem] text-moss">
            Added.{" "}
            <Link href="/rent/request" className="border-b border-moss pb-0.5">
              Review your request
            </Link>
          </p>
        )}
      </div>

      <p className="mt-3 text-[0.8125rem] text-ink-muted">
        We confirm availability and the rate before anything is held.{" "}
        <a
          href={whatsappLink(`renting ${product.name} from ${from} to ${to}`)}
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
