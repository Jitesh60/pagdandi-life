import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui/container";
import { POLICIES, getPolicy } from "@/lib/policies";
import { contact, whatsappLink } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return POLICIES.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return {};
  return {
    title: policy.title,
    description: policy.summary,
    alternates: { canonical: `/policies/${policy.slug}` },
  };
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <Container className="py-(--spacing-section-sm)">
      <header className="max-w-3xl">
        <Eyebrow>Policy</Eyebrow>
        <h1 className="mt-6 text-(length:--text-display-lg)">{policy.title}</h1>
        <p className="mt-7 max-w-xl text-ink-muted">{policy.summary}</p>
      </header>

      <div className="mt-14 max-w-xl border-t border-line pt-10">
        <p className="text-ink-muted">
          The full text of this policy is still to be supplied by the shop. It should
          cover:
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {policy.outline.map((item) => (
            <li key={item} className="border-b border-line-soft pb-3 text-ink">
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-10 text-[0.875rem] text-ink-muted">
          In the meantime, ask us directly on{" "}
          <a
            href={whatsappLink(`the ${policy.title.toLowerCase()} policy`)}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-ink text-ink transition-colors hover:border-moss hover:text-moss"
          >
            WhatsApp
          </a>{" "}
          or call {contact.phoneDisplay}.
        </p>
      </div>
    </Container>
  );
}
