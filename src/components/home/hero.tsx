import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { address } from "@/lib/site";
import type { CuratedCategory } from "@/lib/catalog/categories";
import type { ProductImage } from "@/lib/catalog/types";

/**
 * Opening statement: an asymmetric split rather than a full-bleed crop.
 *
 * The shop's photography is supplier imagery — cutouts and studio shots, not
 * landscapes — so a full-width cropped hero looked like a mistake. Containing
 * one photograph on a panel beside the type is honest about what we have and
 * sits consistently with the rest of the catalogue.
 */
export function Hero({
  image,
  categories,
}: {
  image: ProductImage | null;
  /** Quick links so the first screen offers a way in, not just a statement. */
  categories: CuratedCategory[];
}) {
  return (
    <section className="pt-(--spacing-section-sm)">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="eyebrow">
              {address.locality} · {address.region}
            </p>

            <h1 className="mt-7 max-w-[13ch] text-(length:--text-display-xl)">
              Gear that gets out of the way.
            </h1>

            <p className="mt-8 max-w-md text-ink-muted">
              Tents, stoves, rucksacks and layers for the Himalaya — chosen by people who
              use them, stocked in our shop below the hills, and available to rent when a
              trip doesn&apos;t warrant buying.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="inline-flex bg-ink px-8 py-4 text-paper transition-colors duration-500 ease-[var(--ease-calm)] hover:bg-moss"
              >
                Browse the shop
              </Link>
              <Link
                href="/rent"
                className="inline-flex border border-line px-8 py-4 transition-colors duration-500 ease-[var(--ease-calm)] hover:border-ink"
              >
                Rent gear
              </Link>
            </div>
          </div>

          {image && (
            <div className="relative aspect-[4/5] overflow-hidden bg-panel lg:aspect-[5/6]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                placeholder="blur"
                blurDataURL={image.blurDataURL}
                priority
                className="object-contain p-10"
              />
            </div>
          )}
        </div>

        {/* A way in from the first screen, rather than a statement alone. */}
        {categories.length > 0 && (
          <nav
            aria-label="Shop by category"
            className="mt-16 flex flex-wrap gap-x-7 gap-y-3 border-t border-line-soft pt-8 text-[0.875rem]"
          >
            <span className="eyebrow self-center">Shop</span>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/c/${category.id}`}
                className="text-ink-muted transition-colors hover:text-ink"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        )}
      </Container>
    </section>
  );
}
