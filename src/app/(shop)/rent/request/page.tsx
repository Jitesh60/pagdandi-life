import type { Metadata } from "next";
import { RentalRequestView } from "@/components/commerce/rental-request-view";
import { Container, Eyebrow } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Rental request",
  robots: { index: false, follow: false },
};

export default function RentalRequestPage() {
  return (
    <Container className="py-(--spacing-section-sm)">
      <Eyebrow>Rental request</Eyebrow>
      <h1 className="mt-6 text-(length:--text-display-lg)">Gear and dates</h1>
      <RentalRequestView />
    </Container>
  );
}
