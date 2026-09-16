import { contact, whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/catalog/types";
import { formatPrice, hasListedPrice } from "@/lib/catalog/types";

/**
 * The storefront has no cart by design — enquiries go to the shop directly.
 * The WhatsApp message is pre-filled with the exact item and price so staff
 * can answer without a round trip.
 */
export function EnquiryActions({ product }: { product: Product }) {
  // Rental stock has no list price, so quote the item rather than "₹0".
  const price = hasListedPrice(product) ? ` — ${formatPrice(product.price)}` : "";
  const subject = `${product.name} (${product.sku})${price}${
    product.rental ? ", for rent" : ""
  }`;

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappLink(subject)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-ink px-8 py-4 text-paper transition-colors duration-500 ease-[var(--ease-calm)] hover:bg-moss"
        >
          {product.rental ? "Ask about renting this" : "Enquire on WhatsApp"}
        </a>
        <a
          href={contact.phoneHref}
          className="inline-flex items-center justify-center border border-line px-8 py-4 transition-colors duration-500 ease-[var(--ease-calm)] hover:border-ink"
        >
          Call {contact.phoneDisplay}
        </a>
      </div>
      <p className="mt-4 text-[0.8125rem] text-ink-muted">
        {product.inStock
          ? "In stock at our Kathgodam store. We confirm availability and current price on WhatsApp."
          : "Currently out of stock — message us and we'll tell you when it's back."}
      </p>
    </div>
  );
}
