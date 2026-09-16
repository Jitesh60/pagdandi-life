import { AutomationsScreen } from "@/components/admin/automations-screen";
import { buildAdminProducts } from "@/lib/mock/admin-products";

export const metadata = { title: "Automations" };

export default function AdminAutomationsPage() {
  return <AutomationsScreen products={buildAdminProducts()} />;
}
