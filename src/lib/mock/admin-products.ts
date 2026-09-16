import { getAllProducts, getRentalProducts } from "@/lib/catalog/queries";
import { getCategory } from "@/lib/catalog/categories";
import type { AdminProduct } from "@/components/admin/products-screen";

/**
 * The catalogue slice the dashboard tables need, built on the server so the
 * full product records (descriptions, galleries) never cross into the client.
 */
export function buildAdminProducts(): AdminProduct[] {
  return [...getAllProducts(), ...getRentalProducts()].map((product) => ({
    slug: product.slug,
    name: product.name,
    price: product.price,
    inStock: product.inStock,
    rental: product.rental,
    category: product.rental
      ? "Rental"
      : (getCategory(product.categoryIds[0] ?? "")?.name ?? "Gear"),
  }));
}
