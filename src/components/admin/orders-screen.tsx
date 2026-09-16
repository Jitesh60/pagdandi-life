"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/mock/store";
import { formatPrice } from "@/lib/catalog/types";
import { ORDER_STATUSES } from "@/lib/mock/types";
import { AdminHeading, FilterChips, StatusPill, TableWrap, Td, Th } from "./admin-ui";
import type { OrderStatus } from "@/lib/mock/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function OrdersScreen() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = params.get("id");
  const [filter, setFilter] = useState("all");

  const selected = state.orders.find((order) => order.id === selectedId);

  if (selected) {
    return (
      <div>
        <AdminHeading
          title={selected.id}
          detail={`${selected.customerName} · placed ${formatDate(selected.placedAt)}`}
          action={
            <button
              type="button"
              onClick={() => router.push("/admin/orders")}
              className="border border-line px-5 py-2.5 text-[0.875rem] transition-colors hover:border-ink"
            >
              Back to orders
            </button>
          }
        />

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <span className="eyebrow">Status</span>
          <FilterChips
            options={ORDER_STATUSES}
            value={selected.status}
            onChange={(status) =>
              dispatch({ type: "order/status", id: selected.id, status: status as OrderStatus })
            }
          />
        </div>

        <div className="mt-9 grid gap-9 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-[0.9375rem]">Items</h2>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th align="right">Qty</Th>
                  <Th align="right">Line total</Th>
                </tr>
              </thead>
              <tbody>
                {selected.lines.map((line) => (
                  <tr key={line.id}>
                    <Td>
                      <Link href={`/p/${line.slug}`} className="transition-colors hover:text-moss">
                        {line.name}
                      </Link>
                    </Td>
                    <Td align="right">{line.quantity}</Td>
                    <Td align="right">{formatPrice(line.price * line.quantity)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>

          <aside>
            <h2 className="text-[0.9375rem]">Delivery</h2>
            <address className="mt-4 not-italic text-[0.875rem] text-ink-muted">
              {selected.address.fullName}
              <br />
              {selected.address.line1}
              <br />
              {selected.address.city}, {selected.address.state} {selected.address.pincode}
              <br />
              {selected.address.phone}
            </address>
            <dl className="mt-7 flex flex-col gap-2 border-t border-line pt-5 text-[0.875rem]">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(selected.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Delivery</dt>
                <dd className="tabular-nums">{selected.shipping === 0 ? "Free" : formatPrice(selected.shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Payment</dt>
                <dd className="uppercase">{selected.paymentMethod}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-line pt-3">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(selected.total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    );
  }

  const visible =
    filter === "all" ? state.orders : state.orders.filter((order) => order.status === filter);

  return (
    <div>
      <AdminHeading title="Orders" detail={`${state.orders.length} orders in the prototype`} />

      <div className="mt-6">
        <FilterChips options={["all", ...ORDER_STATUSES]} value={filter} onChange={setFilter} />
      </div>

      <p className="mt-5 text-[0.8125rem] text-ink-muted">{visible.length} shown</p>

      <TableWrap>
        <thead>
          <tr>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>Placed</Th>
            <Th>Items</Th>
            <Th>Status</Th>
            <Th align="right">Total</Th>
          </tr>
        </thead>
        <tbody>
          {visible.map((order) => (
            <tr key={order.id} className="transition-colors hover:bg-paper-alt">
              <Td>
                <Link href={`/admin/orders?id=${order.id}`} className="transition-colors hover:text-moss">
                  {order.id}
                </Link>
              </Td>
              <Td>{order.customerName}</Td>
              <Td>{formatDate(order.placedAt)}</Td>
              <Td>{order.lines.reduce((n, line) => n + line.quantity, 0)}</Td>
              <Td><StatusPill status={order.status} /></Td>
              <Td align="right">{formatPrice(order.total)}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
