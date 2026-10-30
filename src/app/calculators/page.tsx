import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { CalculatorCategories } from "@/components/marketing/calculator-categories";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Financial Calculators",
  description:
    "Explore WealthTogether's collection of financial planning calculators including SIP, Retirement, Child Education, Goal Planning, Emergency Fund and more.",
  path: "/calculators",
});

export default function CalculatorsPage() {
  return (
    <>
      <Navigation />

      <main>
        {/* Hero */}
        <section className="bg-navy text-white">
          <div className="px-content mx-auto max-w-7xl py-24 text-center">

            <p className="text-gold text-sm font-semibold uppercase tracking-[0.25em]">
              Financial Planning Tools
            </p>

            <h1 className="mt-5 text-5xl font-bold tracking-tight">
              WealthTogether Financial Calculators
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70">
              Explore simple, practical and easy-to-use financial calculators
              designed to help you plan your investments, retirement, family
              goals and wealth creation with confidence.
            </p>

          </div>
        </section>

        <CalculatorCategories />

      </main>

      <Footer />
    </>
  );
}