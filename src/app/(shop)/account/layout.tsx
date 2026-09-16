import { AccountNav } from "@/components/commerce/account-nav";
import { Container, Eyebrow } from "@/components/ui/container";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <Container className="py-(--spacing-section-sm)">
      <Eyebrow>Account</Eyebrow>
      <h1 className="mt-6 mb-12 text-(length:--text-display-lg)">Your account</h1>
      <AccountNav />
      {children}
    </Container>
  );
}
