import type { MetadataRoute } from "next";

import { absoluteSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  };
}
