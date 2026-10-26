import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { MarriageGoalPlanner } from "@/features/calculators/marriage-goal/marriage-goal-planner";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Marriage Goal Planner",
  description:
    "Estimate a future marriage goal cost using inflation and calculate a monthly SIP to prepare for it.",
  path: "/calculators/marriage-goal",
});

export default function MarriageGoalPlannerPage() {
  return (
    <>
      <Navigation />
      <main>
        <MarriageGoalPlanner />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How this estimate works</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              The estimated goal cost increases annually at the inflation rate
              you enter. Current goal savings and monthly SIP contributions
              compound monthly at the expected annual return, divided by 12.
              Contributions are assumed at the start of each month. The required
              SIP targets the estimated future cost after accounting for
              existing savings. Fees, taxes, and market variability are not
              included.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
