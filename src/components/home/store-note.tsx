import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { address, googleRating } from "@/lib/site";

/**
 * The shop itself, stated plainly. Figures are shown as quiet facts rather
 * than marketing counters — no odometers, no animation on numbers.
 */
export function StoreNote({ retailCount }: { retailCount: number }) {
  const facts = [
    { value: `${retailCount}+`, label: "Items in stock", detail: "Across seven gear categories." },
    {
      value: `${googleRating.value} ★`,
      label: "Google rating",
      detail: `From ${googleRating.count.toLocaleString("en-IN")} customer reviews.`,
    },
    { value: "7 days", label: "Easy exchange", detail: "On unused gear, with the receipt." },
  ];

  return (
    <section className="mt-(--spacing-section) bg-paper-alt py-(--spacing-section)">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <div>
            <Eyebrow>The shop</Eyebrow>
            <h2 className="mt-6 text-(length:--text-display-lg)">
              Come in and handle it first.
            </h2>
            <p className="mt-7 max-w-md text-ink-muted">
              Our store in {address.area} sits on the road most Kumaon treks start from.
              Bring your itinerary and we&apos;ll help you pick gear for the trip you&apos;re
              actually taking — and rent you the pieces you&apos;ll only need once.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block border-b border-ink pb-1 transition-colors hover:border-moss hover:text-moss"
            >
              Find the store
            </Link>
          </div>

          <dl className="grid gap-10 sm:grid-cols-3 lg:gap-8">
            {facts.map((fact, index) => (
              <Reveal key={fact.label} delay={index * 90}>
                <div>
                  <dt className="font-display text-(length:--text-display-md)">{fact.value}</dt>
                  <dd className="mt-3">
                    <span className="eyebrow">{fact.label}</span>
                    <p className="mt-2 text-[0.875rem] text-ink-muted">{fact.detail}</p>
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
