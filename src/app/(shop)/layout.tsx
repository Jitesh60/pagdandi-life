import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import { getSearchIndex } from "@/lib/catalog/queries";

/** Storefront chrome. The admin dashboard deliberately shares none of this. */
export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <SmoothScrollProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <SiteHeader searchIndex={getSearchIndex()} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </SmoothScrollProvider>
  );
}
