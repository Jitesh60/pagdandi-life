import type { Metadata } from "next";
import { WishlistView } from "@/components/commerce/wishlist-view";
import { Container, Eyebrow } from "@/components/ui/container";
import { getAllProducts, getRentalProducts } from "@/lib/catalog/queries";
import { toCardProduct } from "@/lib/catalog/types";

export const metadata: Metadata = {
  title: "Saved items",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  const index = [...getAllProducts(), ...getRentalProducts()].map(toCardProduct);

  return (
    <Container className="py-(--spacing-section-sm)">
      <Eyebrow>Saved</Eyebrow>
      <h1 className="mt-6 text-(length:--text-display-lg)">Things you’re considering</h1>
      <WishlistView index={index} />
    </Container>
  );
}
