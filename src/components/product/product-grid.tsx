import { ProductCard } from "./product-card";
import { Reveal } from "@/components/motion/reveal";
import type { CardProduct } from "@/lib/catalog/types";

/**
 * The standard product grid. The first row is revealed immediately and marked
 * priority, so the LCP image never waits on an intersection observer.
 */
export function ProductGrid({
  products,
  columns = 4,
}: {
  products: CardProduct[];
  columns?: 3 | 4;
}) {
  const lgColumns = columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <div className={`grid grid-cols-2 gap-x-6 gap-y-14 ${lgColumns} lg:gap-x-8`}>
      {products.map((product, index) => {
        const aboveFold = index < columns;
        const card = <ProductCard product={product} priority={aboveFold} />;
        return aboveFold ? (
          <div key={product.slug}>{card}</div>
        ) : (
          <Reveal key={product.slug} delay={(index % columns) * 70}>
            {card}
          </Reveal>
        );
      })}
    </div>
  );
}
