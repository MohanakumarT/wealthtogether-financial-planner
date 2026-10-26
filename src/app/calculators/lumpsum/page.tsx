import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { LumpsumCalculator } from "@/features/calculators/lumpsum/lumpsum-calculator";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Lumpsum Calculator",
  description:
    "Estimate the future value, profit, and year-wise growth of a one-time investment.",
  path: "/calculators/lumpsum",
});

export default function LumpsumCalculatorPage() {
  return (
    <>
      <Navigation />
      <main>
        <LumpsumCalculator />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How this estimate works</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              The full investment is assumed to be invested at the start of the
              period and compounded once per year at the same rate. No
              additional contributions or withdrawals are included. Fees, taxes,
              inflation, and market fluctuations are not included.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
