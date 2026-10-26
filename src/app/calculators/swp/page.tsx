import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { SWPCalculator } from "@/features/calculators/swp/swp-calculator";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "SWP Calculator",
  description:
    "Project monthly withdrawals, remaining corpus, cumulative withdrawals, and estimated corpus exhaustion for a systematic withdrawal plan.",
  path: "/calculators/swp",
});

export default function SWPCalculatorPage() {
  return (
    <>
      <Navigation />
      <main>
        <SWPCalculator />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How this estimate works</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              The expected annual return is divided by 12 and compounded
              monthly. The corpus earns the assumed monthly return before each
              month-end withdrawal. The exhaustion estimate uses the same fixed
              withdrawal and return assumptions; it is shown separately from the
              selected chart period when depletion falls later. Returns, fees,
              taxes, and withdrawal amounts can vary in real portfolios, so
              actual results may differ.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
