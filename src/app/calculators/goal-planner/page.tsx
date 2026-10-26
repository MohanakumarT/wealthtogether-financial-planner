import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { GoalPlanner } from "@/features/calculators/goal-planner/goal-planner";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Goal Planner",
  description:
    "Compare retirement, house, education, marriage, car, vacation, and emergency fund goals in one financial plan.",
  path: "/calculators/goal-planner",
});

export default function GoalPlannerPage() {
  return (
    <>
      <Navigation />
      <main>
        <GoalPlanner />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How goal projections work</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              Each goal&apos;s target amount is increased annually by its own
              inflation assumption. Existing savings and monthly SIPs grow at
              that goal&apos;s expected annual return, divided by 12 and
              compounded monthly. SIP contributions are assumed at the start of
              each month. The combined SIP is the sum of the separate goal
              contributions; it does not assume shared or overlapping
              withdrawals. Fees, taxes, and market variability are not included.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
