/**
 * Policy page scaffolding.
 *
 * The real legal text lives on the current WordPress site and must be supplied
 * by the shop — inventing shipping, refund or privacy terms would be worse
 * than leaving a visible gap. Each page renders its heading and intent, and
 * flags clearly that the copy is outstanding.
 */

export type Policy = {
  slug: string;
  title: string;
  summary: string;
  /** Section headings the final copy should cover. */
  outline: string[];
};

export const POLICIES: Policy[] = [
  {
    slug: "shipping",
    title: "Shipping",
    summary:
      "How and where we send gear, what it costs, and how long it takes to reach you.",
    outline: ["Where we ship", "Dispatch times", "Charges", "Tracking your order"],
  },
  {
    slug: "returns",
    title: "Returns & exchange",
    summary: "Our seven-day exchange policy on unused gear, and how to arrange one.",
    outline: ["What can be exchanged", "The seven-day window", "How to start an exchange", "Condition of goods"],
  },
  {
    slug: "refund",
    title: "Refund policy",
    summary: "When a refund applies, how it is calculated, and how long it takes.",
    outline: ["When refunds apply", "Processing time", "Non-refundable items"],
  },
  {
    slug: "privacy",
    title: "Privacy",
    summary: "What we collect when you contact us, and what we do with it.",
    outline: ["What we collect", "How it is used", "Third parties", "Contacting us"],
  },
  {
    slug: "terms",
    title: "Terms & conditions",
    summary: "The terms under which we sell and rent gear.",
    outline: ["Use of this site", "Pricing and availability", "Rental terms", "Liability"],
  },
];

export function getPolicy(slug: string): Policy | undefined {
  return POLICIES.find((policy) => policy.slug === slug);
}
