import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/product-grid";
import { toCardProduct } from "@/lib/catalog/types";
import { Container, Eyebrow } from "@/components/ui/container";
import { getRentalProducts } from "@/lib/catalog/queries";
import { JsonLd, itemListSchema } from "@/lib/seo/json-ld";
import { whatsappLink } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Rent gear",
  description:
    "Rent tents, sleeping bags, trekking poles, micro spikes and cameras for your Kumaon trek. Browse the rental catalogue and message us with your dates.",
  alternates: { canonical: "/rent" },
};

export default function RentPage() {
  const products = getRentalProducts();

  return (
    <>
      <JsonLd data={itemListSchema(products, "Rental catalogue")} />

      <Container className="py-(--spacing-section-sm)">
        <header className="max-w-3xl">
          <Eyebrow>{products.length} items to rent</Eyebrow>
          <h1 className="mt-6 text-(length:--text-display-lg)">
            Borrow what you&apos;ll only need once.
          </h1>
          <p className="mt-7 max-w-xl text-ink-muted">
            A four-season tent or a pair of micro spikes is a lot to buy for one trek.
            Rent it from us instead — everything below is checked and cleaned between
            trips. Tell us your dates on WhatsApp and we&apos;ll confirm availability and
            the rate.
          </p>
          <a
            href={whatsappLink("renting gear")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex bg-ink px-8 py-4 text-paper transition-colors duration-500 ease-[var(--ease-calm)] hover:bg-moss"
          >
            Ask about availability
          </a>
        </header>

        <div className="mt-16">
          <ProductGrid products={products.map(toCardProduct)} />
        </div>
      </Container>
    </>
  );
}
