import { InventoryScreen } from "@/components/admin/inventory-screen";
import { buildAdminProducts } from "@/lib/mock/admin-products";

export const metadata = { title: "Inventory" };

export default function AdminInventoryPage() {
  return <InventoryScreen products={buildAdminProducts()} />;
}
