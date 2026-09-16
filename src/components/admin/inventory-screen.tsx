"use client";

import Link from "next/link";
import { useStore } from "@/lib/mock/store";
import { effectiveStock, LOW_STOCK_THRESHOLD } from "@/lib/mock/stock";
import { AdminHeading, InlineNumber, TableWrap, Td, Th } from "./admin-ui";
import { StatTile } from "./stat-tile";
import type { AdminProduct } from "./products-screen";

/**
 * Stock levels, worst first. This is the screen the low-stock and reorder
 * automations feed, so it leads with what needs action rather than the
 * full catalogue.
 */
export function InventoryScreen({ products }: { products: AdminProduct[] }) {
  const { state, dispatch } = useStore();

  const rows = products
    .map((product) => ({
      product,
      stock: effectiveStock(product.slug, product.inStock, state.overrides[product.slug]),
    }))
    .sort((a, b) => a.stock - b.stock);

  const out = rows.filter((row) => row.stock === 0);
  const low = rows.filter((row) => row.stock > 0 && row.stock < LOW_STOCK_THRESHOLD);
  const healthy = rows.length - out.length - low.length;

  const reorderRule = state.automations.find((rule) => rule.id === "auto-reorder");

  return (
    <div>
      <AdminHeading title="Inventory" detail="Units on hand across the catalogue" />

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <StatTile label="Out of stock" value={String(out.length)} detail="Needs reordering" />
        <StatTile label="Low stock" value={String(low.length)} detail={`Below ${LOW_STOCK_THRESHOLD} units`} />
        <StatTile label="Healthy" value={String(healthy)} />
      </div>

      {reorderRule?.enabled && out.length > 0 && (
        <p className="mt-6 border border-line bg-paper-alt px-5 py-4 text-[0.875rem] text-ink-muted">
          <strong className="font-medium text-ink">{reorderRule.name}</strong> is on — the{" "}
          {out.length} items below would be drafted into the next supplier order.
        </p>
      )}

      <TableWrap>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th align="right">On hand</Th>
            <Th>State</Th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 40).map(({ product, stock }) => (
            <tr key={product.slug} className="transition-colors hover:bg-paper-alt">
              <Td>
                <Link
                  href={product.rental ? `/rent/${product.slug}` : `/p/${product.slug}`}
                  className="transition-colors hover:text-moss"
                >
                  {product.name}
                </Link>
              </Td>
              <Td className="text-ink-muted">{product.category}</Td>
              <Td align="right">
                <InlineNumber
                  value={stock}
                  onCommit={(units) =>
                    dispatch({
                      type: "product/override",
                      slug: product.slug,
                      override: { stock: units, inStock: units > 0 },
                    })
                  }
                />
              </Td>
              <Td>
                <span className={stock === 0 || stock < LOW_STOCK_THRESHOLD ? "text-clay" : "text-ink-muted"}>
                  {stock === 0 ? "Out of stock" : stock < LOW_STOCK_THRESHOLD ? "Low" : "In stock"}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <p className="mt-6 text-[0.8125rem] text-ink-muted">
        Showing the 40 lowest. Stock levels are generated for the prototype and can be
        edited inline.
      </p>
    </div>
  );
}
