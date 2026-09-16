/**
 * Skeleton placeholders.
 *
 * Used only where a genuine wait exists — route transitions and client-side
 * filtering. Each skeleton mirrors the dimensions of the content it stands in
 * for, so nothing shifts when the real thing arrives.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-(--radius-subtle) ${className}`} />;
}

/** Matches ProductCard: 4:5 image, two text lines, a price line. */
export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-5 h-3 w-20" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <Skeleton className="mt-4 h-4 w-24" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4 lg:gap-x-8"
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Matches the product detail layout: gallery beside a text column. */
export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-20" role="status" aria-label="Loading product">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="pt-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-6 h-10 w-full" />
        <Skeleton className="mt-3 h-10 w-3/4" />
        <Skeleton className="mt-8 h-6 w-32" />
        <Skeleton className="mt-10 h-12 w-56" />
        <Skeleton className="mt-12 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
      </div>
    </div>
  );
}
