/**
 * Deterministic sample data for the prototype.
 *
 * Generated from the committed catalogue with a seeded PRNG rather than
 * Math.random or Date.now, so the server and the client produce byte-identical
 * output and the admin screens never flicker or mismatch on hydration.
 */

import { getAllProducts, getRentalProducts } from "@/lib/catalog/queries";
import type {
  ActivityEntry,
  AutomationRule,
  Address,
  BookingStatus,
  CartLine,
  Customer,
  Order,
  OrderStatus,
  RentalBooking,
} from "./types";

/** mulberry32 — small, fast, and stable across runs. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(random: () => number, list: T[]): T =>
  list[Math.floor(random() * list.length) % list.length];

const int = (random: () => number, min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1));

/** Fixed reference point so "days ago" never drifts between renders. */
export const TODAY = new Date("2026-09-16T00:00:00.000Z");

function daysAgo(days: number): string {
  return new Date(TODAY.getTime() - days * 86_400_000).toISOString();
}

function dateOnly(offsetDays: number): string {
  return new Date(TODAY.getTime() + offsetDays * 86_400_000).toISOString().slice(0, 10);
}

const FIRST = ["Aarav", "Priya", "Rohit", "Neha", "Vikram", "Ananya", "Kabir", "Meera", "Arjun", "Divya", "Sanjay", "Ritu", "Karan", "Isha", "Tenzing", "Dolma", "Prakash", "Sunita"];
const LAST = ["Bisht", "Rawat", "Negi", "Joshi", "Pandey", "Bhatt", "Sharma", "Chand", "Koranga", "Mehta", "Rana", "Sah"];
const CITIES: [string, string][] = [
  ["Haldwani", "Uttarakhand"],
  ["Nainital", "Uttarakhand"],
  ["Dehradun", "Uttarakhand"],
  ["Delhi", "Delhi"],
  ["Noida", "Uttar Pradesh"],
  ["Gurugram", "Haryana"],
  ["Bareilly", "Uttar Pradesh"],
  ["Rudrapur", "Uttarakhand"],
];

function makeAddress(random: () => number, name: string): Address {
  const [city, state] = pick(random, CITIES);
  return {
    id: `addr-${Math.floor(random() * 1e6)}`,
    fullName: name,
    line1: `${int(random, 1, 240)}, ${pick(random, ["Mall Road", "Nainital Road", "Kaladhungi Road", "Station Road", "Tallital"])}`,
    city,
    state,
    pincode: String(int(random, 244001, 263199)),
    phone: `+91 ${int(random, 70000, 99999)} ${int(random, 10000, 99999)}`,
  };
}

export function buildCustomers(count = 42): Customer[] {
  const random = rng(20260916);
  return Array.from({ length: count }, (_, i) => {
    const name = `${pick(random, FIRST)} ${pick(random, LAST)}`;
    const orderCount = int(random, 1, 6);
    return {
      id: `cust-${String(i + 1).padStart(3, "0")}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: `+91 ${int(random, 70000, 99999)} ${int(random, 10000, 99999)}`,
      joinedAt: daysAgo(int(random, 20, 900)),
      orderCount,
      lifetimeValue: orderCount * int(random, 120_000, 800_000),
    };
  });
}

const WEIGHTED_STATUS: OrderStatus[] = [
  "delivered", "delivered", "delivered", "delivered", "delivered",
  "shipped", "shipped", "packed", "confirmed", "pending", "cancelled",
];

export function buildOrders(count = 64): Order[] {
  const random = rng(77712);
  const products = getAllProducts().filter((p) => p.images.length > 0);
  const customers = buildCustomers();

  return Array.from({ length: count }, (_, i) => {
    const customer = pick(random, customers);
    const lineCount = int(random, 1, 3);

    const lines: CartLine[] = Array.from({ length: lineCount }, () => {
      const product = pick(random, products);
      const quantity = int(random, 1, 2);
      return {
        id: `${product.slug}::`,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0]?.src ?? null,
        quantity,
        options: {},
      };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    const shipping = subtotal > 200_000 ? 0 : 9900;
    const placedDays = int(random, 0, 89);

    return {
      id: `PL-${2600 + i}`,
      placedAt: daysAgo(placedDays),
      // Recent orders should still be working their way through the pipeline.
      status: placedDays < 3 ? pick(random, ["pending", "confirmed", "packed"] as OrderStatus[]) : pick(random, WEIGHTED_STATUS),
      customerName: customer.name,
      customerEmail: customer.email,
      lines,
      subtotal,
      shipping,
      total: subtotal + shipping,
      paymentMethod: pick(random, ["cod", "upi", "card"] as const),
      address: makeAddress(random, customer.name),
    };
  }).sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export function buildBookings(count = 14): RentalBooking[] {
  const random = rng(31337);
  const rentals = getRentalProducts().filter((p) => p.images.length > 0);
  const customers = buildCustomers();

  return Array.from({ length: count }, (_, i) => {
    const customer = pick(random, customers);
    const start = int(random, -20, 14);
    const nights = int(random, 2, 9);
    const status: BookingStatus =
      start + nights < -1
        ? pick(random, ["returned", "returned", "overdue"] as BookingStatus[])
        : start <= 0
          ? "out"
          : pick(random, ["requested", "confirmed"] as BookingStatus[]);

    const lines = Array.from({ length: int(random, 1, 2) }, () => {
      const product = pick(random, rentals);
      return {
        id: `${product.slug}::rental`,
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.src ?? null,
        quantity: 1,
        from: dateOnly(start),
        to: dateOnly(start + nights),
      };
    });

    return {
      id: `RB-${480 + i}`,
      requestedAt: daysAgo(Math.max(0, -start) + int(random, 1, 5)),
      status,
      customerName: customer.name,
      customerPhone: customer.phone,
      lines,
      from: dateOnly(start),
      to: dateOnly(start + nights),
      quote: status === "requested" ? null : int(random, 3, 22) * 10_000,
    };
  }).sort((a, b) => a.from.localeCompare(b.from));
}

export function buildAutomations(): AutomationRule[] {
  return [
    {
      id: "auto-low-stock",
      name: "Low stock alert",
      trigger: "low-stock",
      condition: "Stock falls below 5 units",
      action: "Notify the shop on WhatsApp and flag the item in Inventory",
      enabled: true,
      runCount: 23,
      lastRunAt: daysAgo(1),
    },
    {
      id: "auto-reorder",
      name: "Reorder suggestion",
      trigger: "low-stock",
      condition: "Stock hits 0 and the item sold in the last 30 days",
      action: "Draft a reorder line for the next supplier purchase",
      enabled: true,
      runCount: 7,
      lastRunAt: daysAgo(4),
    },
    {
      id: "auto-abandoned",
      name: "Abandoned cart nudge",
      trigger: "abandoned-cart",
      condition: "Cart untouched for 24 hours",
      action: "Send a single WhatsApp reminder with the cart contents",
      enabled: true,
      runCount: 41,
      lastRunAt: daysAgo(0),
    },
    {
      id: "auto-rental-due",
      name: "Rental return reminder",
      trigger: "rental-due",
      condition: "Return date is tomorrow",
      action: "Message the customer with the return date and late fee",
      enabled: true,
      runCount: 16,
      lastRunAt: daysAgo(2),
    },
    {
      id: "auto-price-drop",
      name: "Scheduled sale",
      trigger: "price-drop",
      condition: "A scheduled sale window opens",
      action: "Apply the sale price and revert it when the window closes",
      enabled: false,
      runCount: 3,
      lastRunAt: daysAgo(31),
    },
  ];
}

export function buildActivity(): ActivityEntry[] {
  const random = rng(9091);
  const rules = buildAutomations().filter((rule) => rule.enabled);
  const products = getAllProducts();

  return Array.from({ length: 18 }, (_, i) => {
    const rule = pick(random, rules);
    const product = pick(random, products);
    const detail =
      rule.trigger === "low-stock"
        ? `${product.name} dropped to ${int(random, 0, 4)} units`
        : rule.trigger === "abandoned-cart"
          ? `Reminder sent for a cart with ${int(random, 1, 3)} items`
          : rule.trigger === "rental-due"
            ? `Return reminder sent for ${product.name}`
            : `Sale window applied to ${product.name}`;
    return {
      id: `act-${i}`,
      at: daysAgo(i * 0.4),
      ruleId: rule.id,
      ruleName: rule.name,
      detail,
    };
  });
}
