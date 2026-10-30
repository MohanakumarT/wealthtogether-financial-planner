import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { SIPCalculator } from "@/features/calculators/sip/sip-calculator";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "WealthTogether SIP Planner",
  description:
    "Educational SIP planning tool to estimate potential investment growth using your own assumptions. Illustrative estimates only. Not investment advice.",
  path: "/calculators/sip",
});

export default function SIPCalculatorPage() {
  return (
    <>
      <Navigation />

      <main>
        <SIPCalculator />

        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="space-y-6 p-6">

            <div>
              <h2 className="text-xl font-semibold">
                About the WealthTogether SIP Planner
              </h2>

              <p className="text-muted-foreground mt-3 leading-7">
                This planner is designed to help you understand how regular
                monthly investments may grow over time using different
                assumptions. It is an educational planning tool and should not
                be considered investment advice or a recommendation to invest in
                any particular mutual fund.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                How the estimate is calculated
              </h3>

              <p className="text-muted-foreground mt-2 leading-7">
                The calculator assumes your monthly SIP is invested at the
                beginning of each month. The expected annual return is converted
                into monthly compounding, and any annual step-up increases are
                applied once every 12 months.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Important assumptions
              </h3>

              <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-5">
                <li>Returns are only assumptions entered by you.</li>
                <li>Actual mutual fund returns can be higher or lower.</li>
                <li>Taxes, inflation, exit loads and expenses are not included.</li>
                <li>Markets do not deliver fixed annual returns.</li>
                <li>This tool is intended only for financial education and planning.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-5">
              <h3 className="font-semibold text-amber-300">
                Disclaimer
              </h3>

              <p className="mt-2 text-sm leading-6 text-amber-100">
                WealthTogether Investments is an AMFI Registered Mutual Fund
                Distributor (ARN-362166). This calculator provides illustrative
                estimates for educational purposes only and should not be
                interpreted as investment advice, portfolio advice, or a return
                guarantee.
              </p>
            </div>

          </Card>
        </section>
      </main>

      <Footer />
    </>
  );
}