/**
 * Types for the prototype commerce layer.
 *
 * There is no backend: carts, orders, bookings and admin edits all live in the
 * browser. These shapes are deliberately close to what a real API would return
 * so that swapping in a server later is a matter of replacing the store, not
 * rewriting the screens.
 */

export type CartLine = {
  /** Composite of slug + chosen options, so variants are separate lines. */
  id: string;
  slug: string;
  name: string;
  /** Integer paise, captured at the time of adding. */
  price: number;
  image: string | null;
  quantity: number;
  options: Record<string, string>;
};

export type RentalLine = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  quantity: number;
  /** ISO dates (yyyy-mm-dd). */
  from: string;
  to: string;
};

export type Address = {
  id: string;
  fullName: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export type Order = {
  id: string;
  /** ISO timestamp. */
  placedAt: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  lines: CartLine[];
  /** Integer paise. */
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: "cod" | "upi" | "card";
  address: Address;
};

export type BookingStatus = "requested" | "confirmed" | "out" | "returned" | "overdue";

export type RentalBooking = {
  id: string;
  requestedAt: string;
  status: BookingStatus;
  customerName: string;
  customerPhone: string;
  lines: RentalLine[];
  from: string;
  to: string;
  /** Integer paise, quoted by the shop. */
  quote: number | null;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
  orderCount: number;
  /** Integer paise. */
  lifetimeValue: number;
};

/** Admin edits layered over the committed catalogue snapshot. */
export type ProductOverride = {
  price?: number;
  /** Units on hand, once edited from the dashboard. */
  stock?: number;
  inStock?: boolean;
  hidden?: boolean;
};

export type AutomationTrigger =
  | "low-stock"
  | "abandoned-cart"
  | "rental-due"
  | "price-drop"
  | "new-order";

export type AutomationRule = {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  /** Human-readable condition, e.g. "stock below 5". */
  condition: string;
  action: string;
  enabled: boolean;
  /** Times this rule has fired in the simulated log. */
  runCount: number;
  lastRunAt: string | null;
};

export type ActivityEntry = {
  id: string;
  at: string;
  ruleId: string;
  ruleName: string;
  detail: string;
};

export type Session = {
  name: string;
  email: string;
};

/**
 * A product created in the dashboard.
 *
 * The committed catalogue is read-only, so new products live in browser state
 * and are merged into listings at render time. The image is an arbitrary URL
 * rather than an optimised local asset, which is why cards render it with a
 * plain <img> instead of next/image.
 */
export type CustomProduct = {
  slug: string;
  name: string;
  /** Integer paise. */
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  /** Curated category id this product appears under. */
  categoryId: string;
  stock: number;
  description: string;
  createdAt: string;
  /** Hidden products stay out of the storefront but remain in the dashboard. */
  hidden: boolean;
};
