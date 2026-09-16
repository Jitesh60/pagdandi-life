/**
 * Stock levels for the prototype.
 *
 * The catalogue snapshot only records whether an item is in stock, not how
 * many. Inventory screens need a number, so one is derived deterministically
 * from the slug — stable across reloads, and overridable from the dashboard.
 */

import type { ProductOverride } from "./types";

export const LOW_STOCK_THRESHOLD = 5;

/** Stable hash so a given product always starts at the same level. */
function hash(slug: string): number {
  let value = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    value ^= slug.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value);
}

export function baseStock(slug: string, inStock: boolean): number {
  if (!inStock) return 0;
  // Weighted low so the low-stock and reorder automations have something to do.
  const roll = hash(slug) % 100;
  if (roll < 12) return hash(slug) % 5;
  if (roll < 40) return 5 + (hash(slug) % 10);
  return 15 + (hash(slug) % 30);
}

export function effectiveStock(
  slug: string,
  inStock: boolean,
  override?: ProductOverride,
): number {
  if (override?.inStock === false) return 0;
  return override?.stock ?? baseStock(slug, inStock);
}
