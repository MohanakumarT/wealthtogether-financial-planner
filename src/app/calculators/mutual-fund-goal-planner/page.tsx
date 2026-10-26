import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { MutualFundGoalPlanner } from "@/features/calculators/mutual-fund-goal-planner/mutual-fund-goal-planner";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Mutual Fund Goal Planner",
  description:
    "Estimate an inflation-adjusted goal corpus, required monthly SIP, and compare two goal-based savings scenarios.",
  path: "/calculators/mutual-fund-goal-planner",
});

export default function MutualFundGoalPlannerPage() {
  return (
    <>
      <Navigation />
      <main>
        <MutualFundGoalPlanner />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">
              How this goal estimate works
            </h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              The planner increases today’s goal amount by the annual inflation
              assumption, projects current savings at the expected annual return
              divided by 12, and estimates a monthly SIP to cover any remaining
              amount. Scenario contributions are assumed to be invested at the
              start of each month. Actual mutual fund returns vary; this tool
              does not recommend funds and excludes fees, taxes, and market
              fluctuations.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
