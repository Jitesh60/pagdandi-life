"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/catalog/types";

/**
 * Product imagery: one large frame with thumbnails beneath.
 *
 * Every frame carries its LQIP blur placeholder, which is the real loading
 * state for images — no artificial spinner, just the photograph resolving.
 */
export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-panel text-ink-faint">
        <span className="eyebrow">No photograph</span>
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-panel">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt || name}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          placeholder="blur"
          blurDataURL={current.blurDataURL}
          priority
          className="object-contain p-8"
        />
      </div>

      {images.length > 1 && (
        <ul className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-current={index === active}
                className={`relative block aspect-square w-full overflow-hidden bg-panel transition-all duration-500 ${
                  index === active
                    ? "ring-1 ring-ink"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="15vw"
                  placeholder="blur"
                  blurDataURL={image.blurDataURL}
                  className="object-contain p-2"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
