import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { RetirementPlanner } from "@/features/calculators/retirement/retirement-planner";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Retirement Planner",
  description:
    "Estimate future retirement expenses, a target corpus, an additional monthly SIP, and an illustrative retirement readiness score.",
  path: "/calculators/retirement",
});

export default function RetirementPlannerPage() {
  return (
    <>
      <Navigation />
      <main>
        <RetirementPlanner />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How this estimate works</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              Current monthly expenses are increased by the inflation assumption
              through retirement. The target corpus is the present value of
              monthly, inflation-adjusted retirement spending, discounted at the
              expected return. Current savings and contributions are projected
              with monthly compounding; the additional SIP is assumed invested
              at the beginning of each month. The same return assumption is
              applied during retirement. Taxes, fees, and market variability are
              not included. The score compares projected current savings with
              the target and is a planning indicator, not a probability of
              success.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
