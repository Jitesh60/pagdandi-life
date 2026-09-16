"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/mock/store";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/rentals", label: "Rentals" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/automations", label: "Automations" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { state, dispatch } = useStore();

  const pending = state.orders.filter((order) => order.status === "pending").length;
  const requests = state.bookings.filter((booking) => booking.status === "requested").length;

  const badge = (href: string) =>
    href === "/admin/orders" ? pending : href === "/admin/rentals" ? requests : 0;

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="font-display text-lg tracking-tight">
        PagdandiLife
      </Link>
      <p className="eyebrow mt-1">Admin</p>

      <nav aria-label="Dashboard" className="mt-9 flex flex-1 flex-col gap-0.5">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          const count = badge(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 text-[0.875rem] transition-colors ${
                active ? "bg-ink text-paper" : "text-ink-muted hover:bg-paper-deep hover:text-ink"
              }`}
            >
              {link.label}
              {count > 0 && (
                <span className={active ? "text-paper" : "text-clay"}>{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-line pt-5">
        <Link href="/" className="block text-[0.8125rem] text-ink-muted transition-colors hover:text-ink">
          View storefront
        </Link>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset all prototype data back to the sample set?")) {
              dispatch({ type: "reset" });
            }
          }}
          className="mt-3 block text-[0.8125rem] text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          Reset prototype data
        </button>
      </div>
    </div>
  );
}
