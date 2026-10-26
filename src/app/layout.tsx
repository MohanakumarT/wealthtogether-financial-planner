import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { Providers } from "@/components/providers";
import { absoluteSiteUrl, getSiteOrigin } from "@/lib/site-url";
import {
  brandName,
  defaultDescription,
  isIndexableDeployment,
} from "@/lib/seo";
import "./globals.css";

function trustedSocialUrl(value: string | undefined, domain: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === domain || url.hostname.endsWith(`.${domain}`))
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
const contactPhone =
  process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.replace(/\D/g, "") ?? "";
const instagram = trustedSocialUrl(
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  "instagram.com",
);
const linkedIn = trustedSocialUrl(
  process.env.NEXT_PUBLIC_LINKEDIN_URL,
  "linkedin.com",
);

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: "Financial Planning Calculators | WealthTogether Investments",
    template: "%s | WealthTogether Investments",
  },
  description: defaultDescription,
  applicationName: brandName,
  keywords: [
    "financial planning calculator",
    "SIP calculator",
    "retirement planner",
    "goal planner",
    "investment planning tools",
  ],
  authors: [{ name: brandName }],
  creator: brandName,
  publisher: brandName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: brandName,
    title: "Financial Planning Calculators | WealthTogether Investments",
    description: defaultDescription,
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "WealthTogether Investments — plan your next financial step together",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Financial Planning Calculators | WealthTogether Investments",
    description: defaultDescription,
    images: ["/opengraph-image"],
  },
  robots: isIndexableDeployment()
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#081B3A",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${getSiteOrigin()}/#organization`,
                name: brandName,
                url: absoluteSiteUrl("/"),
                logo: absoluteSiteUrl("/brand-mark.svg"),
                description:
                  "Educational financial planning tools for comparing savings, retirement, and life-goal scenarios.",
                sameAs: [instagram, linkedIn].filter(Boolean),
                ...(contactEmail?.includes("@") || contactPhone.length >= 8
                  ? {
                      contactPoint: [
                        {
                          "@type": "ContactPoint",
                          contactType: "customer support",
                          url: absoluteSiteUrl("/contact"),
                          ...(contactEmail?.includes("@")
                            ? { email: contactEmail }
                            : {}),
                          ...(contactPhone.length >= 8
                            ? { telephone: `+${contactPhone}` }
                            : {}),
                        },
                      ],
                    }
                  : {}),
              },
              {
                "@type": "WebSite",
                "@id": `${getSiteOrigin()}/#website`,
                name: brandName,
                url: absoluteSiteUrl("/"),
                inLanguage: "en-IN",
                publisher: { "@id": `${getSiteOrigin()}/#organization` },
              },
              {
                "@type": "WebApplication",
                "@id": `${getSiteOrigin()}/#financial-planner`,
                name: "WealthTogether Financial Planner",
                url: absoluteSiteUrl("/"),
                applicationCategory: "FinanceApplication",
                operatingSystem: "Web browser",
                isAccessibleForFree: true,
                description: defaultDescription,
                featureList: [
                  "SIP and step-up SIP projections",
                  "Retirement and education planning",
                  "Home, car, and life-goal planning",
                  "Inflation and withdrawal projections",
                ],
                provider: { "@id": `${getSiteOrigin()}/#organization` },
              },
            ],
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
