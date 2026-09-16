"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/mock/store";
import { toCard, visibleCustomProducts } from "@/lib/mock/custom-products";
import { ProductGrid } from "./product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { discountPercent } from "@/lib/catalog/types";
import type { CardProduct } from "@/lib/catalog/types";

const SORTS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  discount: "Biggest saving",
  name: "Name: A–Z",
} as const;

type SortKey = keyof typeof SORTS;

/** Price bands in rupees, chosen to spread this catalogue sensibly. */
const BANDS = [
  { id: "under-1000", label: "Under ₹1,000", min: 0, max: 100_000 },
  { id: "1000-3000", label: "₹1,000 – ₹3,000", min: 100_000, max: 300_000 },
  { id: "3000-6000", label: "₹3,000 – ₹6,000", min: 300_000, max: 600_000 },
  { id: "over-6000", label: "Over ₹6,000", min: 600_000, max: Infinity },
];

const PAGE_SIZE = 24;

export type BrowserFacet = { id: string; name: string };

/**
 * Filtering, sorting and paging for a product listing.
 *
 * A flat grid of 150 items is not browsable, so everything here exists to let
 * someone narrow down quickly. Filtering happens on the client over a slim
 * card payload, which keeps the page static while staying instant.
 */
export function ProductBrowser({
  products,
  facets = [],
  facetField = "categoryIds",
}: {
  products: CardProduct[];
  /**
   * Optional extra filter: curated categories on the shop page, subcategories
   * within a single category page.
   */
  facets?: BrowserFacet[];
  facetField?: "categoryIds" | "subcategoryIds";
}) {
  const [sort, setSort] = useState<SortKey>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [band, setBand] = useState<string | null>(null);
  const [facet, setFacet] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const { state, hydrated } = useStore();

  /**
   * Products added in the dashboard live only in the browser, so they are
   * merged in here rather than at build time. They lead the list so a newly
   * added product is immediately obvious.
   */
  const all = useMemo(() => {
    // Custom products carry no subcategory, so they are left out of a
    // subcategory-faceted listing where they could never be filtered to.
    if (!hydrated || facetField === "subcategoryIds") return products;
    const custom = visibleCustomProducts(state.customProducts).map(toCard);
    return custom.length > 0 ? [...custom, ...products] : products;
  }, [products, state.customProducts, hydrated, facetField]);

  const filtered = useMemo(() => {
    const active = BANDS.find((b) => b.id === band);
    const result = all.filter((product) => {
      if (inStockOnly && !product.inStock) return false;
      if (onSaleOnly && !discountPercent(product)) return false;
      if (facet && !product[facetField].includes(facet)) return false;
      if (active) {
        // Items priced on request have no band to fall into.
        if (product.price <= 0) return false;
        if (product.price < active.min || product.price >= active.max) return false;
      }
      return true;
    });

    const sorted = [...result];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        sorted.sort((a, b) => (discountPercent(b) ?? 0) - (discountPercent(a) ?? 0));
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break; // `featured` keeps the order the server sent.
    }
    return sorted;
  }, [all, sort, inStockOnly, onSaleOnly, band, facet, facetField]);

  const shown = filtered.slice(0, visible);
  const activeFilters = [inStockOnly, onSaleOnly, band, facet].filter(Boolean).length;

  const reset = () => {
    setInStockOnly(false);
    setOnSaleOnly(false);
    setBand(null);
    setFacet(null);
    setVisible(PAGE_SIZE);
  };

  // Any filter change should return the visitor to the top of the results.
  const change = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      <div className="flex flex-col gap-6 border-y border-line-soft py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <Toggle active={inStockOnly} onClick={() => change(setInStockOnly)(!inStockOnly)}>
            In stock
          </Toggle>
          <Toggle active={onSaleOnly} onClick={() => change(setOnSaleOnly)(!onSaleOnly)}>
            On sale
          </Toggle>
          {BANDS.map((b) => (
            <Toggle
              key={b.id}
              active={band === b.id}
              onClick={() => change(setBand)(band === b.id ? null : b.id)}
            >
              {b.label}
            </Toggle>
          ))}
          {facets.map((f) => (
            <Toggle
              key={f.id}
              active={facet === f.id}
              onClick={() => change(setFacet)(facet === f.id ? null : f.id)}
            >
              {f.name}
            </Toggle>
          ))}
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={reset}
              className="ml-1 text-[0.8125rem] text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 whitespace-nowrap">
          <label htmlFor="sort" className="eyebrow">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="border-b border-line bg-transparent py-1 pr-6 text-[0.875rem] outline-none transition-colors focus:border-ink"
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-6 text-[0.8125rem] text-ink-muted" aria-live="polite">
        {filtered.length === all.length
          ? `${filtered.length} items`
          : `${filtered.length} of ${all.length} items`}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-16 border-t border-line-soft pt-14">
          <p className="font-display text-(length:--text-display-sm)">Nothing matches that.</p>
          <p className="mt-4 max-w-sm text-ink-muted">
            Try widening the price range or clearing a filter.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-7 border-b border-ink pb-1 transition-colors hover:border-moss hover:text-moss"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="mt-10">
            <ProductGrid products={shown} />
          </div>

          {visible < filtered.length && (
            <div className="mt-20 flex flex-col items-center gap-5">
              <p className="text-[0.8125rem] text-ink-muted">
                Showing {shown.length} of {filtered.length}
              </p>
              <button
                type="button"
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
                className="border border-line px-10 py-4 transition-colors duration-500 ease-[var(--ease-calm)] hover:border-ink"
              >
                Show more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-4 py-2 text-[0.8125rem] transition-colors duration-300 ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line text-ink-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/** Matches the toolbar's height so the listing doesn't jump while hydrating. */
export function ProductBrowserSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between border-y border-line-soft py-5">
        <div className="flex gap-2.5">
          {["w-20", "w-20", "w-28", "w-36"].map((width) => (
            <Skeleton key={width} className={`h-9 ${width}`} />
          ))}
        </div>
        <Skeleton className="h-6 w-28" />
      </div>
      <Skeleton className="mt-6 h-3 w-20" />
    </div>
  );
}
