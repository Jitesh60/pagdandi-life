"use client";

import Link from "next/link";
import { useStore } from "@/lib/mock/store";
import { formatPrice } from "@/lib/catalog/types";
import {
  averageOrderValue,
  bookingsNeedingAttention,
  ordersByStatus,
  revenue,
  revenueByWeek,
  topProducts,
} from "@/lib/mock/analytics";
import { AdminHeading, StatusPill, TableWrap, Td, Th } from "./admin-ui";
import { BarList } from "./bar-list";
import { RevenueChart } from "./revenue-chart";
import { StatTile } from "./stat-tile";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function AdminOverview() {
  const { state } = useStore();
  const { orders, bookings, customers } = state;

  const attention = bookingsNeedingAttention(bookings);
  const pending = orders.filter((order) => order.status === "pending");
  const recent = orders.slice(0, 6);

  return (
    <div>
      <AdminHeading
        title="Overview"
        detail="Last 90 days of trading, refreshed from the prototype data in this browser."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Revenue"
          value={formatPrice(revenue(orders))}
          detail="Excludes cancelled orders"
        />
        <StatTile label="Orders" value={String(orders.length)} detail={`${pending.length} awaiting action`} />
        <StatTile label="Average order" value={formatPrice(averageOrderValue(orders))} />
        <StatTile
          label="Rentals out"
          value={String(bookings.filter((b) => b.status === "out").length)}
          detail={`${attention.length} need attention`}
        />
      </div>

      <div className="mt-6">
        <RevenueChart points={revenueByWeek(orders)} title="Revenue by week" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <BarList
          title="Orders by stage"
          data={ordersByStatus(orders)}
          format={(value) => String(value)}
        />
        <BarList
          title="Top products by revenue"
          data={topProducts(orders)}
          format={formatPrice}
        />
      </div>

      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[0.9375rem]">Recent orders</h2>
          <Link href="/admin/orders" className="text-[0.8125rem] text-ink-muted transition-colors hover:text-ink">
            All orders
          </Link>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Placed</Th>
              <Th>Status</Th>
              <Th align="right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {recent.map((order) => (
              <tr key={order.id}>
                <Td>
                  <Link href={`/admin/orders?id=${order.id}`} className="transition-colors hover:text-moss">
                    {order.id}
                  </Link>
                </Td>
                <Td>{order.customerName}</Td>
                <Td>{formatDate(order.placedAt)}</Td>
                <Td><StatusPill status={order.status} /></Td>
                <Td align="right">{formatPrice(order.total)}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </section>

      <p className="mt-8 text-[0.8125rem] text-ink-muted">
        {customers.length} customers on file.
      </p>
    </div>
  );
}
