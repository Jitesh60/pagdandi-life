import { Suspense } from "react";
import { OrdersScreen } from "@/components/admin/orders-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <OrdersScreen />
    </Suspense>
  );
}
