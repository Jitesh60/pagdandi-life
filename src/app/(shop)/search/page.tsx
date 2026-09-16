import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductSearch } from "@/components/product/product-search";
import { Container, Eyebrow } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { getSearchIndex } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Search",
  description: "Search our full range of camping, trekking and outdoor gear.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const index = getSearchIndex();
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";

  return (
    <Container className="py-(--spacing-section-sm)">
      <header className="max-w-3xl">
        <Eyebrow>Search</Eyebrow>
        <h1 className="mt-6 text-(length:--text-display-lg)">What are you looking for?</h1>
      </header>

      <div className="mt-14">
        {/* The index hydrates before the field is usable — a real wait, so a real skeleton. */}
        <Suspense
          fallback={
            <div role="status" aria-label="Loading search">
              <Skeleton className="h-12 w-full max-w-xl" />
              <Skeleton className="mt-12 h-4 w-52" />
            </div>
          }
        >
          <ProductSearch index={index} initialQuery={initialQuery} />
        </Suspense>
      </div>
    </Container>
  );
}
