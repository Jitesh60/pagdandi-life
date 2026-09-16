import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { MockStoreProvider } from "@/lib/mock/store";
import { site } from "@/lib/site";
import "./globals.css";

/** Editorial display face — warm, slightly gritty, suits outdoor subject matter. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

/** Quiet, humanist body face. */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

/**
 * Root layout: document shell and shared providers only.
 *
 * Page chrome lives in the route groups — `(shop)` renders the storefront
 * header and footer, `admin` renders the dashboard sidebar instead.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${fraunces.variable} ${dmSans.variable} h-full`}
    >
      <head>
        {/* Without JS the reveal observer never runs, so pin revealed content visible. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <MockStoreProvider>{children}</MockStoreProvider>
      </body>
    </html>
  );
}
