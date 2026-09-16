import type { Metadata } from "next";
import { CartView } from "@/components/commerce/cart-view";
import { Container, Eyebrow } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <Container className="py-(--spacing-section-sm)">
      <Eyebrow>Cart</Eyebrow>
      <h1 className="mt-6 text-(length:--text-display-lg)">Your cart</h1>
      <CartView />
    </Container>
  );
}
