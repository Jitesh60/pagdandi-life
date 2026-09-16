import type { Metadata } from "next";
import { AddressBook } from "@/components/commerce/account-views";

export const metadata: Metadata = {
  title: "Addresses",
  robots: { index: false, follow: false },
};

export default function AddressesPage() {
  return <AddressBook />;
}
