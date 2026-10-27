import type { MetadataRoute } from "next";

import { absoluteSiteUrl } from "@/lib/site-url";

const publicPaths = [
  "/",
  "/services",
  "/consultation",
  "/contact",
  "/calculators/sip",
  "/calculators/lumpsum",
  "/calculators/step-up-sip",
  "/calculators/swp",
  "/calculators/goal-planner",
  "/calculators/mutual-fund-goal-planner",
  "/calculators/retirement",
  "/calculators/child-education",
  "/calculators/house-purchase",
  "/calculators/car-purchase",
  "/calculators/marriage-goal",
  "/calculators/emergency-fund",
  "/calculators/inflation",
  "/portfolio",
];

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.VERCEL_ENV === "preview") return [];

  return publicPaths.map((path) => ({
    url: absoluteSiteUrl(path),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/calculators/") ? 0.8 : 0.7,
  }));
}
