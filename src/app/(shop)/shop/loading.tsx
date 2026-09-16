import { Container } from "@/components/ui/container";
import { ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="py-(--spacing-section-sm)">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-10 h-3 w-20" />
      <Skeleton className="mt-6 h-12 w-80 max-w-full" />
      <Skeleton className="mt-6 h-4 w-96 max-w-full" />
      <div className="mt-16">
        <ProductGridSkeleton count={8} />
      </div>
    </Container>
  );
}
