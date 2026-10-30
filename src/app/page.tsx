import { CalculatorCategories } from "@/components/marketing/calculator-categories";
import { CallToAction } from "@/components/marketing/call-to-action";
import { FAQ } from "@/components/marketing/faq";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { Ecosystem  } from "@/components/marketing/ecosystem";
import { TrustStats } from "@/components/marketing/trust-stats";
import { WhyWealthTogether } from "@/components/marketing/why-wealthtogether";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Financial Planning Tools",
  description:
    "Explore clear, assumption-led SIP, retirement, education, and goal-planning calculators from WealthTogether Investments.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Navigation />

      <main>
        <Hero />

        <TrustStats />

        <Features />

        <CalculatorCategories />

        <WhyWealthTogether />

        <Ecosystem  />

        <FAQ />

        <CallToAction />
      </main>

      <Footer />
    </>
  );
}