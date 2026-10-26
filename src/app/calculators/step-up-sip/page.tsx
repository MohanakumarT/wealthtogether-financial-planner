import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { StepUpSIPCalculator } from "@/features/calculators/step-up-sip/step-up-sip-calculator";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Step-up SIP Calculator",
  description:
    "Compare 5%, 10%, and custom annual SIP step-ups with an interactive chart and year-wise growth table.",
  path: "/calculators/step-up-sip",
});

export default function StepUpSIPCalculatorPage() {
  return (
    <>
      <Navigation />
      <main>
        <StepUpSIPCalculator />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How this estimate works</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              The starting monthly contribution is invested at the start of each
              month. The expected annual return is divided by 12 and compounded
              monthly. At the start of each new 12-month period, the monthly SIP
              increases by the selected annual step-up percentage. Fees, taxes,
              inflation, and market fluctuations are not included.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
