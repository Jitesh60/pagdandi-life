import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetail } from "@/components/commerce/account-views";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

/**
 * The order is identified by `?id=`, which keeps this a single static page
 * rather than a route that would have to be generated per order — orders are
 * created in the browser and the build cannot know about them.
 */
export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="mt-12" role="status" aria-label="Loading order">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-10 h-20 w-full" />
          <Skeleton className="mt-12 h-40 w-full" />
        </div>
      }
    >
      <OrderDetail />
    </Suspense>
  );
}
