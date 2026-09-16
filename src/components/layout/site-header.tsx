"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CURATED_CATEGORIES } from "@/lib/catalog/categories";
import { SearchOverlay } from "./search-overlay";
import { site } from "@/lib/site";
import { useCart, useWishlist } from "@/lib/mock/store";
import type { SearchEntry } from "@/lib/catalog/queries";

/**
 * Site chrome: a thin, quiet bar that gains a hairline and a paper backdrop
 * once the page scrolls, so it never competes with the hero.
 */
export function SiteHeader({ searchIndex }: { searchIndex: SearchEntry[] }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // The menu records the route it was opened on, so any navigation closes it
  // implicitly — including back/forward — with no effect to keep in sync.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const menuOpen = openedOn === pathname;
  const [searchOpen, setSearchOpen] = useState(false);
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // Read the initial position in a frame callback rather than synchronously,
    // so a reload part-way down the page still gets the solid header.
    const initial = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-500 ease-[var(--ease-calm)] ${
        scrolled ? "border-b border-line-soft bg-paper/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-8 px-6 py-5 lg:px-10">
        <Link
          href="/"
          className="font-display text-xl tracking-tight whitespace-nowrap"
          aria-label={`${site.name} — home`}
        >
          {site.name}
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.8125rem]">
            {CURATED_CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/c/${category.id}`}
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/rent" className="text-moss transition-colors hover:text-ink">
                Rent
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-5 text-[0.8125rem]">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-expanded={searchOpen}
            aria-controls="header-search-panel"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            {searchOpen ? "Close" : "Search"}
          </button>
          <Link
            href="/wishlist"
            className="hidden text-ink-muted transition-colors hover:text-ink sm:block"
          >
            Saved{wishCount > 0 && <span className="ml-1 text-ink">({wishCount})</span>}
          </Link>
          <Link href="/account" className="hidden text-ink-muted transition-colors hover:text-ink sm:block">
            Account
          </Link>
          <Link href="/cart" className="text-ink transition-colors hover:text-moss">
            Cart{cartCount > 0 && <span className="ml-1">({cartCount})</span>}
          </Link>
          <button
            type="button"
            onClick={() => setOpenedOn(menuOpen ? null : pathname)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="lg:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div id="header-search-panel">
          <SearchOverlay index={searchIndex} onClose={() => setSearchOpen(false)} />
        </div>
      )}

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary mobile"
          className="border-t border-line-soft bg-paper px-6 pb-8 pt-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {CURATED_CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link href={`/c/${category.id}`} className="block py-2 font-display text-2xl">
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/rent" className="block py-2 font-display text-2xl text-moss">
                Rent Gear
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
