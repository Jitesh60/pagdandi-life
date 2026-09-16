"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/mock/store";
import { formatPrice } from "@/lib/catalog/types";
import { effectiveStock, LOW_STOCK_THRESHOLD } from "@/lib/mock/stock";
import { AdminHeading, FilterChips, InlineNumber, TableWrap, Td, Th } from "./admin-ui";
import { ProductForm } from "./product-form";

export type AdminProduct = {
  slug: string;
  name: string;
  price: number;
  inStock: boolean;
  rental: boolean;
  category: string;
};

/**
 * Catalogue management.
 *
 * The committed snapshot is read-only, so edits are stored as overrides keyed
 * by slug and layered on top. That keeps the source of truth intact and makes
 * "reset prototype data" a single action.
 */
export function ProductsScreen({ products }: { products: AdminProduct[] }) {
  const { state, dispatch } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [creating, setCreating] = useState(false);

  // Dashboard-created products sit at the top of the table, flagged as new.
  const custom: AdminProduct[] = state.customProducts.map((product) => ({
    slug: product.slug,
    name: product.name,
    price: product.price,
    inStock: product.stock > 0,
    rental: false,
    category: "Added here",
  }));
  const all = [...custom, ...products];
  const customSlugs = new Set(custom.map((product) => product.slug));

  const term = query.trim().toLowerCase();
  const visible = all.filter((product) => {
    if (term && !product.name.toLowerCase().includes(term)) return false;
    const custom_ = state.customProducts.find((c) => c.slug === product.slug);
    const override = state.overrides[product.slug];
    const stock = custom_
      ? custom_.stock
      : effectiveStock(product.slug, product.inStock, override);
    const hidden = custom_ ? custom_.hidden : override?.hidden === true;
    if (filter === "low") return stock > 0 && stock < LOW_STOCK_THRESHOLD;
    if (filter === "out") return stock === 0;
    if (filter === "hidden") return hidden;
    if (filter === "added") return customSlugs.has(product.slug);
    if (filter === "rental") return product.rental;
    return true;
  });

  return (
    <div>
      <AdminHeading
        title="Products"
        detail={`${all.length} in the catalogue · ${custom.length} added here · ${Object.keys(state.overrides).length} edited`}
        action={
          <button
            type="button"
            onClick={() => setCreating((open) => !open)}
            className="bg-ink px-5 py-2.5 text-[0.875rem] text-paper transition-colors hover:bg-moss"
          >
            {creating ? "Cancel" : "New product"}
          </button>
        }
      />

      <ProductForm open={creating} onClose={() => setCreating(false)} />

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <FilterChips
          options={["all", "added", "low", "out", "hidden", "rental"]}
          value={filter}
          onChange={setFilter}
        />
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          className="min-w-48 flex-1 border-b border-line bg-transparent pb-2 outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
        />
      </div>

      <p className="mt-5 text-[0.8125rem] text-ink-muted">
        {visible.length} shown · click a price or stock figure to edit it
      </p>

      <TableWrap>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th align="right">Price</Th>
            <Th align="right">Stock</Th>
            <Th>Visible</Th>
          </tr>
        </thead>
        <tbody>
          {visible.map((product) => {
            const custom_ = state.customProducts.find((c) => c.slug === product.slug);
            const override = state.overrides[product.slug];
            const price = custom_ ? custom_.price : (override?.price ?? product.price);
            const stock = custom_
              ? custom_.stock
              : effectiveStock(product.slug, product.inStock, override);
            const hidden = custom_ ? custom_.hidden : override?.hidden === true;

            const setPrice = (rupees: number) =>
              custom_
                ? dispatch({ type: "product/update", slug: product.slug, patch: { price: rupees * 100 } })
                : dispatch({ type: "product/override", slug: product.slug, override: { price: rupees * 100 } });

            const setStock = (units: number) =>
              custom_
                ? dispatch({ type: "product/update", slug: product.slug, patch: { stock: units } })
                : dispatch({
                    type: "product/override",
                    slug: product.slug,
                    override: { stock: units, inStock: units > 0 },
                  });

            const toggleHidden = () =>
              custom_
                ? dispatch({ type: "product/update", slug: product.slug, patch: { hidden: !hidden } })
                : dispatch({ type: "product/override", slug: product.slug, override: { hidden: !hidden } });

            return (
              <tr key={product.slug} className="transition-colors hover:bg-paper-alt">
                <Td className={hidden ? "text-ink-faint" : ""}>
                  <Link
                    href={product.rental ? `/rent/${product.slug}` : `/p/${product.slug}`}
                    className="transition-colors hover:text-moss"
                  >
                    {product.name}
                  </Link>
                  {custom_ && (
                    <span className="ml-2 bg-moss px-1.5 py-0.5 text-[0.6875rem] uppercase tracking-wider text-paper">
                      New
                    </span>
                  )}
                </Td>
                <Td className="text-ink-muted">{product.category}</Td>
                <Td align="right">
                  {price > 0 ? (
                    <InlineNumber
                      value={Math.round(price / 100)}
                      prefix="₹"
                      onCommit={setPrice}
                    />
                  ) : (
                    <span className="text-ink-muted">On request</span>
                  )}
                </Td>
                <Td align="right">
                  <span className={stock === 0 ? "text-clay" : stock < LOW_STOCK_THRESHOLD ? "text-clay" : ""}>
                    <InlineNumber
                      value={stock}
                      onCommit={setStock}
                    />
                  </span>
                </Td>
                <Td>
                  <button
                    type="button"
                    onClick={toggleHidden}
                    aria-pressed={!hidden}
                    className="border border-line px-3 py-1 text-[0.75rem] transition-colors hover:border-ink"
                  >
                    {hidden ? "Hidden" : "Visible"}
                  </button>
                  {custom_ && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "product/delete", slug: product.slug })}
                      className="ml-2 text-[0.75rem] text-ink-muted underline underline-offset-4 transition-colors hover:text-clay"
                    >
                      Delete
                    </button>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>

      {visible.length === 0 && <p className="mt-8 text-ink-muted">Nothing matches that filter.</p>}

      <p className="mt-8 text-[0.8125rem] text-ink-muted">
        Catalogue value at current prices:{" "}
        {formatPrice(
          all.reduce(
            (sum, product) => sum + (state.overrides[product.slug]?.price ?? product.price),
            0,
          ),
        )}
      </p>
    </div>
  );
}
