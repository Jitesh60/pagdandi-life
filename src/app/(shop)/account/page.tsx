import type { Metadata } from "next";
import { AccountOverview } from "@/components/commerce/account-views";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountOverview />;
}
