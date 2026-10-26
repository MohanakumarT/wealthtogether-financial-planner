import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { InflationCalculator } from "@/features/calculators/inflation/inflation-calculator";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Inflation Calculator",
  description:
    "Project the future cost of today’s money and understand how inflation changes purchasing power over time.",
  path: "/calculators/inflation",
});

export default function InflationCalculatorPage() {
  return (
    <>
      <Navigation />
      <main>
        <InflationCalculator />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How this estimate works</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              Future value is the present amount multiplied by annual inflation
              compounded over the selected period. Purchasing power is the
              present-day value of that same fixed amount after accounting for
              cumulative inflation. This is an illustrative constant-rate
              projection; actual inflation can vary over time.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
