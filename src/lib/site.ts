/**
 * Single source of truth for brand, contact and location facts.
 * Used by layout chrome, structured data and every enquiry CTA.
 */

export const site = {
  name: "PagdandiLife",
  tagline: "Camping, trekking and outdoor gear",
  /** Update to the production origin before launch — drives canonicals and sitemap. */
  url: "https://pagdandilife.com",
  description:
    "Camping, trekking and outdoor gear for the Himalaya — tents, stoves, rucksacks, sleeping bags and apparel, stocked and rented from our store in Kathgodam, Uttarakhand.",
  locale: "en_IN",
  currency: "INR",
} as const;

export const contact = {
  /** E.164 without the leading +, as wa.me expects. */
  whatsapp: "919625569592",
  phoneDisplay: "+91 96255 69592",
  phoneHref: "tel:+919625569592",
} as const;

export const address = {
  locality: "Kathgodam",
  region: "Uttarakhand",
  area: "Haldwani, Nainital",
  country: "IN",
} as const;

export const socials = [
  { label: "Instagram", href: "https://www.instagram.com/pagdandilife" },
  { label: "YouTube", href: "https://youtube.com/@pagdandilife1562" },
  { label: "Facebook", href: "https://facebook.com/pagdandilife" },
] as const;

/** Aggregate rating shown on the storefront and in LocalBusiness JSON-LD. */
export const googleRating = { value: 4.9, count: 1126 } as const;

/**
 * Builds a wa.me deep link with a pre-filled enquiry.
 * Kept here so every CTA phrases the enquiry identically.
 */
export function whatsappLink(subject?: string): string {
  const message = subject
    ? `Hi ${site.name}, I'd like to ask about: ${subject}`
    : `Hi ${site.name}, I'd like to ask about your gear.`;
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
