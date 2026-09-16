import type { Metadata } from "next";
import { CheckoutView } from "@/components/commerce/checkout-view";
import { Container, Eyebrow } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Container className="py-(--spacing-section-sm)">
      <Eyebrow>Checkout</Eyebrow>
      <h1 className="mt-6 text-(length:--text-display-lg)">Almost there</h1>
      <CheckoutView />
    </Container>
  );
}
