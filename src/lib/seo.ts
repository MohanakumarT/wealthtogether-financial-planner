import type { Metadata } from "next";

export const brandName = "WealthTogether Investments";
export const defaultDescription =
  "Plan your financial goals with clear, assumption-led calculators for SIPs, retirement, education, home buying, and more.";
export const socialImagePath = "/opengraph-image";

export function isIndexableDeployment() {
  return process.env.VERCEL_ENV !== "preview";
}

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const image = {
    url: socialImagePath,
    width: 1200,
    height: 630,
    alt: `${brandName} — plan your next financial step together`,
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    robots:
      noIndex || !isIndexableDeployment()
        ? { index: false, follow: false }
        : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: brandName,
      title,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
