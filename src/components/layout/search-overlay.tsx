"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { productHref, searchProducts } from "@/lib/catalog/search";
import type { SearchEntry } from "@/lib/catalog/queries";

/**
 * Instant search, opened from the header.
 *
 * Previously "Search" navigated to a separate page, which meant leaving
 * whatever you were looking at to find anything. This keeps you in place:
 * results appear as you type, Escape closes, and Enter opens the first hit.
 */
export function SearchOverlay({
  index,
  onClose,
}: {
  index: SearchEntry[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchProducts(index, query, 8), [index, query]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const trimmed = query.trim();

  return (
    <div className="border-t border-line-soft bg-paper">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-10">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            if (results[0]) window.location.assign(productHref(results[0]));
          }}
        >
          <label htmlFor="header-search" className="sr-only">
            Search gear
          </label>
          <input
            ref={inputRef}
            id="header-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tent, stove, rucksack…"
            autoComplete="off"
            className="w-full border-b border-line bg-transparent pb-4 font-display text-(length:--text-display-sm) outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
          />
        </form>

        <div className="mt-6" aria-live="polite">
          {trimmed === "" ? (
            <p className="text-[0.875rem] text-ink-muted">
              Search {index.length} items across the shop and rental catalogue.
            </p>
          ) : results.length === 0 ? (
            <p className="text-[0.875rem] text-ink-muted">
              Nothing matches “{trimmed}”.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft border-t border-line-soft">
              {results.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={productHref(entry)}
                    onClick={onClose}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5 text-[0.9375rem] transition-colors hover:text-moss"
                  >
                    <span>{entry.name}</span>
                    <span className="text-[0.8125rem] text-ink-faint">
                      {entry.rental ? "For rent" : entry.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {trimmed !== "" && results.length > 0 && (
            <Link
              href={`/search?q=${encodeURIComponent(trimmed)}`}
              onClick={onClose}
              className="mt-6 inline-block text-[0.8125rem] text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
            >
              See all results
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
