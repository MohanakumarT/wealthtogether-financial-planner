import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { EmergencyFundCalculator } from "@/features/calculators/emergency-fund/emergency-fund-calculator";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Emergency Fund Calculator",
  description:
    "Estimate an emergency savings target from monthly expenses and plan a timeline to build your cash reserve.",
  path: "/calculators/emergency-fund",
});

export default function EmergencyFundCalculatorPage() {
  return (
    <>
      <Navigation />
      <main>
        <EmergencyFundCalculator />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How this estimate works</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              The recommended fund equals your monthly expenses multiplied by
              the selected coverage period. The timeline adds your monthly
              savings to your current reserve without assuming any investment
              return, so it represents a straightforward cash savings plan. Keep
              emergency money accessible and consider tailoring the coverage
              period to your income stability, dependents, insurance, and
              essential obligations.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
