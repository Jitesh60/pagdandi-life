import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import type { CuratedCategory } from "@/lib/catalog/categories";
import type { ProductImage } from "@/lib/catalog/types";

export type CategoryTile = {
  category: CuratedCategory;
  image: ProductImage | null;
  count: number;
};

/** Categories as editorial tiles — photograph, name, and a quiet count. */
export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
      {tiles.map((tile, index) => (
        <Reveal key={tile.category.id} delay={(index % 4) * 70}>
          <Link href={`/c/${tile.category.id}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-panel">
              {tile.image && (
                <Image
                  src={tile.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  placeholder="blur"
                  blurDataURL={tile.image.blurDataURL}
                  className="object-contain p-7 transition-transform duration-[1200ms] ease-[var(--ease-calm)] group-hover:scale-[1.05]"
                />
              )}
            </div>
            <h3 className="mt-5 font-display text-(length:--text-display-sm)">
              {tile.category.name}
            </h3>
            <p className="mt-1.5 text-[0.8125rem] text-ink-muted">{tile.count} items</p>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
