"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/mock/store";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/wishlist", label: "Saved" },
];

export function AccountNav() {
  const pathname = usePathname();
  const { state, dispatch } = useStore();

  return (
    <nav aria-label="Account" className="flex flex-wrap items-center gap-x-7 gap-y-3 border-y border-line-soft py-5 text-[0.875rem]">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className={pathname === link.href ? "text-ink" : "text-ink-muted transition-colors hover:text-ink"}
        >
          {link.label}
        </Link>
      ))}
      {state.session && (
        <button
          type="button"
          onClick={() => dispatch({ type: "session/set", session: null })}
          className="ml-auto text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          Sign out
        </button>
      )}
    </nav>
  );
}
