/**
 * Derived figures for the dashboard.
 *
 * Pure functions over the prototype state, so every screen computes the same
 * numbers and nothing is cached or duplicated.
 */

import { TODAY } from "./seed";
import type { Order, RentalBooking } from "./types";

/** Orders that represent real revenue — cancelled ones never count. */
export function billable(orders: Order[]): Order[] {
  return orders.filter((order) => order.status !== "cancelled");
}

export function revenue(orders: Order[]): number {
  return billable(orders).reduce((sum, order) => sum + order.total, 0);
}

export function averageOrderValue(orders: Order[]): number {
  const paid = billable(orders);
  return paid.length === 0 ? 0 : Math.round(revenue(paid) / paid.length);
}

/**
 * Revenue bucketed into weeks, oldest first.
 *
 * Daily points over a quarter are mostly noise at this volume, so the series
 * is aggregated weekly — the trend is the thing being read, not any one day.
 */
export function revenueByWeek(orders: Order[], weeks = 13) {
  const buckets = Array.from({ length: weeks }, (_, i) => ({
    label: `W${i + 1}`,
    value: 0,
  }));

  for (const order of billable(orders)) {
    const daysAgo = Math.floor(
      (TODAY.getTime() - new Date(order.placedAt).getTime()) / 86_400_000,
    );
    if (daysAgo < 0 || daysAgo >= weeks * 7) continue;
    const index = weeks - 1 - Math.floor(daysAgo / 7);
    if (buckets[index]) buckets[index].value += order.total;
  }

  return buckets;
}

export function ordersByStatus(orders: Order[]) {
  const counts = new Map<string, number>();
  for (const order of orders) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }
  // Pipeline order, so the ramp reads as progression rather than ranking.
  const order_ = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];
  return order_
    .filter((status) => counts.has(status))
    .map((status) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: counts.get(status) ?? 0,
      tone: status === "cancelled" ? ("negative" as const) : undefined,
    }));
}

export function topProducts(orders: Order[], limit = 6) {
  const totals = new Map<string, { label: string; value: number }>();
  for (const order of billable(orders)) {
    for (const line of order.lines) {
      const entry = totals.get(line.slug) ?? { label: line.name, value: 0 };
      entry.value += line.price * line.quantity;
      totals.set(line.slug, entry);
    }
  }
  return [...totals.values()]
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((entry) => ({
      // Long product names crowd the bar labels.
      label: entry.label.length > 38 ? `${entry.label.slice(0, 36)}…` : entry.label,
      value: entry.value,
    }));
}

export function bookingsNeedingAttention(bookings: RentalBooking[]) {
  return bookings.filter(
    (booking) => booking.status === "requested" || booking.status === "overdue",
  );
}
