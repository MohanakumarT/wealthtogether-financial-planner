import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { ChildEducationPlanner } from "@/features/calculators/education/child-education-planner";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Child Education Planner",
  description:
    "Estimate future education costs, a target corpus, and the monthly SIP needed to prepare for a child’s education goal.",
  path: "/calculators/child-education",
});

export default function ChildEducationPlannerPage() {
  return (
    <>
      <Navigation />
      <main>
        <ChildEducationPlanner />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How this estimate works</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              The estimated education cost grows annually using your education
              inflation assumption. Existing goal savings and monthly SIP
              contributions compound monthly at the expected annual return,
              divided by 12. Contributions are assumed at the start of each
              month. The required SIP is the contribution that aims to reach the
              inflation-adjusted target at the goal date. Fees, taxes, and
              market variability are not included.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
