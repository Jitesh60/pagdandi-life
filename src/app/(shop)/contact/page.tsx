import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui/container";
import { JsonLd, localBusinessSchema } from "@/lib/seo/json-ld";
import { address, contact, socials, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Visit the store",
  description:
    "Find PagdandiLife in Kathgodam, Uttarakhand. Message us on WhatsApp or call for stock, rental availability and trek advice.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={localBusinessSchema()} />

      <Container className="py-(--spacing-section-sm)">
        <header className="max-w-3xl">
          <Eyebrow>Visit</Eyebrow>
          <h1 className="mt-6 text-(length:--text-display-lg)">
            We&apos;re on the road up.
          </h1>
          <p className="mt-7 max-w-xl text-ink-muted">
            Come in and handle the gear before you commit to it. If you&apos;re already
            on your way, message ahead and we&apos;ll set things aside.
          </p>
        </header>

        <div className="mt-16 grid gap-12 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="eyebrow">Store</p>
            <p className="mt-4 text-ink">
              {address.locality}
              <br />
              {address.area}
              <br />
              {address.region}, India
            </p>
          </div>

          <div>
            <p className="eyebrow">Talk to us</p>
            <p className="mt-4 flex flex-col gap-2">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink transition-colors hover:text-moss"
              >
                WhatsApp
              </a>
              <a href={contact.phoneHref} className="text-ink-muted transition-colors hover:text-ink">
                {contact.phoneDisplay}
              </a>
            </p>
          </div>

          <div>
            <p className="eyebrow">Elsewhere</p>
            <ul className="mt-4 flex flex-col gap-2">
              {socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-muted transition-colors hover:text-ink"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-14 max-w-xl rounded-(--radius-subtle) bg-paper-alt p-6 text-[0.875rem] text-ink-muted">
          <strong className="font-medium text-ink">Note for the shop:</strong> add the
          street address, opening hours and a map embed here, and the geo coordinates to{" "}
          <code>localBusinessSchema()</code> so the store shows correctly in local search.
        </p>
      </Container>
    </>
  );
}
