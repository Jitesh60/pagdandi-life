import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { address, googleRating } from "@/lib/site";
import { getCatalogMeta } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "About",
  description:
    "PagdandiLife is an outdoor gear shop in Kathgodam, Uttarakhand — stocking and renting tents, stoves, rucksacks and layers for treks across Kumaon.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const { retailCount, rentalCount } = getCatalogMeta();

  return (
    <Container className="py-(--spacing-section-sm)">
      <header className="max-w-3xl">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-6 text-(length:--text-display-lg)">
          A pagdandi is a footpath.
        </h1>
      </header>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
        <div className="max-w-prose text-ink-muted">
          <p>
            We are an outdoor gear shop in {address.area}, at the point where the plains
            give way to the Kumaon hills. Most of our customers are heading up — to
            Rathan Kharak, to Pindari, to a first night under canvas somewhere quieter.
          </p>
          <p className="mt-6">
            We stock {retailCount} items and rent another {rentalCount}, because a
            four-season tent is a lot to buy for one weekend. What we carry, we have
            mostly used. If something is wrong for your trip, we will say so.
          </p>
          <p className="mt-6">
            There is no cart on this site by design. Message us on WhatsApp and you will
            reach the people in the shop, who can tell you what is actually on the shelf
            today.
          </p>
          <p className="mt-10 rounded-(--radius-subtle) bg-paper-alt p-6 text-[0.875rem]">
            <strong className="font-medium text-ink">Note for the shop:</strong> this is
            placeholder copy. Replace it with the real story — when the shop opened, who
            runs it, and what you want people to know before they visit.
          </p>
        </div>

        <Reveal>
          <dl className="flex flex-col gap-10 border-t border-line pt-10">
            <div>
              <dt className="eyebrow">Where</dt>
              <dd className="mt-3 font-display text-(length:--text-display-sm)">
                {address.locality}
              </dd>
              <dd className="mt-2 text-[0.875rem] text-ink-muted">
                {address.area}, {address.region}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Rated</dt>
              <dd className="mt-3 font-display text-(length:--text-display-sm)">
                {googleRating.value} ★
              </dd>
              <dd className="mt-2 text-[0.875rem] text-ink-muted">
                {googleRating.count.toLocaleString("en-IN")} Google reviews
              </dd>
            </div>
            <div>
              <Link
                href="/contact"
                className="border-b border-ink pb-1 text-ink transition-colors hover:border-moss hover:text-moss"
              >
                Visit the store
              </Link>
            </div>
          </dl>
        </Reveal>
      </div>
    </Container>
  );
}
