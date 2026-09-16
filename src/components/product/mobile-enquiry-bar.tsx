import { hasListedPrice, formatPrice } from "@/lib/catalog/types";
import { whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/catalog/types";

/**
 * Persistent enquiry bar on small screens.
 *
 * Product pages are long, and on a phone the CTA otherwise scrolls out of
 * reach after the first screen. Hidden on desktop, where the sticky gallery
 * column keeps the action in view.
 */
export function MobileEnquiryBar({ product }: { product: Product }) {
  const subject = `${product.name} (${product.sku})${product.rental ? ", for rent" : ""}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between gap-4 px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="min-w-0">
          <p className="truncate text-[0.8125rem] text-ink-muted">{product.name}</p>
          <p className="text-[0.9375rem]">
            {hasListedPrice(product) ? formatPrice(product.price) : "Rate on request"}
          </p>
        </div>
        <a
          href={whatsappLink(subject)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-ink px-6 py-3 text-[0.875rem] text-paper"
        >
          Enquire
        </a>
      </div>
    </div>
  );
}
