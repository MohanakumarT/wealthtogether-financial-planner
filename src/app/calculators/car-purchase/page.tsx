import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { CarPurchasePlanner } from "@/features/calculators/car-purchase/car-purchase-planner";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Car Purchase Planner",
  description:
    "Compare a cash car purchase with financing, including a savings goal, required SIP, EMI, and loan interest estimate.",
  path: "/calculators/car-purchase",
});

export default function CarPurchasePlannerPage() {
  return (
    <>
      <Navigation />
      <main>
        <CarPurchasePlanner />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How this estimate works</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              The estimated car price grows annually at the car price inflation
              assumption. Both savings scenarios use monthly compounding at the
              expected return, with contributions invested at the start of each
              month. The financed scenario targets the selected down payment;
              the remaining future price is treated as a fixed-rate loan with
              monthly repayments. Loan fees, insurance, maintenance, taxes, and
              market variability are not included.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
