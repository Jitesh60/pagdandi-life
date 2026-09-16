"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { productHref, searchProducts } from "@/lib/catalog/search";
import type { SearchEntry } from "@/lib/catalog/queries";

/**
 * The full search page. Shares its ranking with the header overlay, and seeds
 * itself from `?q=` so "see all results" carries the query across.
 */
export function ProductSearch({
  index,
  initialQuery = "",
}: {
  index: SearchEntry[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => searchProducts(index, query), [index, query]);
  const trimmed = query.trim();

  return (
    <div>
      <label htmlFor="search" className="sr-only">
        Search gear
      </label>
      <input
        id="search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tent, stove, rucksack…"
        autoComplete="off"
        autoFocus
        className="w-full max-w-xl border-b border-line bg-transparent pb-4 font-display text-(length:--text-display-sm) outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
      />

      <div className="mt-12" aria-live="polite">
        {trimmed === "" ? (
          <p className="text-ink-muted">Start typing to search {index.length} items.</p>
        ) : results.length === 0 ? (
          <p className="text-ink-muted">
            Nothing matches “{trimmed}”. Try a broader word, like “tent” or “stove”.
          </p>
        ) : (
          <>
            <p className="eyebrow">
              {results.length} {results.length === 1 ? "result" : "results"}
            </p>
            <ul className="mt-8 divide-y divide-line-soft border-t border-line-soft">
              {results.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={productHref(entry)}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 transition-colors hover:text-moss"
                  >
                    <span>{entry.name}</span>
                    <span className="text-[0.8125rem] text-ink-faint">
                      {entry.rental ? "For rent" : entry.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
