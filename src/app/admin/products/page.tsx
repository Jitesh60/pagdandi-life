import { ProductsScreen } from "@/components/admin/products-screen";
import { buildAdminProducts } from "@/lib/mock/admin-products";

export const metadata = { title: "Products" };

export default function AdminProductsPage() {
  return <ProductsScreen products={buildAdminProducts()} />;
}
