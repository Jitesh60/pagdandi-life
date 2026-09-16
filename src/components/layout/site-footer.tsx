import Link from "next/link";
import { CURATED_CATEGORIES } from "@/lib/catalog/categories";
import { address, contact, site, socials, whatsappLink } from "@/lib/site";

const CUSTOMER_LINKS = [
  { label: "Visit the store", href: "/contact" },
  { label: "Shipping", href: "/policies/shipping" },
  { label: "Returns & exchange", href: "/policies/returns" },
  { label: "Refund policy", href: "/policies/refund" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Rent gear", href: "/rent" },
  { label: "Privacy", href: "/policies/privacy" },
  { label: "Terms", href: "/policies/terms" },
];

export function SiteFooter() {
  return (
    <footer className="mt-(--spacing-section) border-t border-line-soft bg-paper-alt">
      <div className="mx-auto max-w-[1400px] px-6 py-(--spacing-section-sm) lg:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-display text-3xl">{site.name}</p>
            <p className="mt-4 text-ink-muted">
              Gear for the Himalaya, stocked and rented from our shop in{" "}
              {address.locality}, {address.region}.
            </p>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block border-b border-ink pb-0.5 text-ink transition-colors hover:border-moss hover:text-moss"
            >
              Message us on WhatsApp
            </a>
            <p className="mt-3 text-ink-muted">
              <a href={contact.phoneHref} className="hover:text-ink">
                {contact.phoneDisplay}
              </a>
            </p>
          </div>

          <FooterColumn title="Shop">
            {CURATED_CATEGORIES.map((category) => (
              <FooterLink key={category.id} href={`/c/${category.id}`}>
                {category.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Customer">
            {CUSTOMER_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Company">
            {COMPANY_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 text-[0.8125rem] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-ink"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-5 flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-ink-muted transition-colors hover:text-ink">
        {children}
      </Link>
    </li>
  );
}
