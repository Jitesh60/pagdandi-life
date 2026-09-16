import { Container } from "@/components/ui/container";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";

/** Shown during route transitions on slow connections. */
export default function Loading() {
  return (
    <Container className="py-(--spacing-section-sm)">
      <div className="mt-10">
        <ProductDetailSkeleton />
      </div>
    </Container>
  );
}
