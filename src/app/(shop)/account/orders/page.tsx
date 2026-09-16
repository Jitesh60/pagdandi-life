import type { Metadata } from "next";
import { OrderList } from "@/components/commerce/account-views";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrderList />;
}
