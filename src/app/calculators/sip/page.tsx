import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { SIPCalculator } from "@/features/calculators/sip/sip-calculator";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "SIP Calculator",
  description:
    "Estimate your SIP corpus, total investment, returns, and year-wise growth with an annual step-up.",
  path: "/calculators/sip",
});

export default function SIPCalculatorPage() {
  return (
    <>
      <Navigation />
      <main>
        <SIPCalculator />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How this estimate works</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              The first monthly contribution is assumed to be invested at the
              start of month one. The annual expected return is divided by 12
              and compounded monthly. Your SIP amount increases once at the
              start of each 12-month period by the step-up rate. Fees, taxes,
              inflation, and market fluctuations are not included.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
