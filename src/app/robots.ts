import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Netlify sets CONTEXT to "production" only for the live site. Preview and
  // branch deploys must never be indexed, or they compete with the real one.
  const isProduction = !process.env.CONTEXT || process.env.CONTEXT === "production";

  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Search results add nothing to an index built from the sitemap.
      disallow: ["/search"],
    },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
