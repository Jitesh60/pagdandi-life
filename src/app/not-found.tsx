import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="py-(--spacing-section)">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-6 max-w-[16ch] text-(length:--text-display-lg)">
        This path doesn&apos;t go anywhere.
      </h1>
      <p className="mt-7 max-w-md text-ink-muted">
        The page you were after has moved or never existed. Try the shop, or search for
        what you need.
      </p>
      <div className="mt-10 flex gap-8">
        <Link href="/shop" className="border-b border-ink pb-1 transition-colors hover:border-moss hover:text-moss">
          Browse the shop
        </Link>
        <Link href="/search" className="border-b border-line pb-1 text-ink-muted transition-colors hover:border-ink hover:text-ink">
          Search
        </Link>
      </div>
    </Container>
  );
}
