import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { HousePurchasePlanner } from "@/features/calculators/house-purchase/house-purchase-planner";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "House Purchase Planner",
  description:
    "Estimate future house costs and the monthly SIP needed to prepare for a home down payment.",
  path: "/calculators/house-purchase",
});

export default function HousePurchasePlannerPage() {
  return (
    <>
      <Navigation />
      <main>
        <HousePurchasePlanner />
        <section className="px-content mx-auto max-w-7xl pb-12">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">How this estimate works</h2>
            <p className="text-muted-foreground mt-2 max-w-4xl text-sm leading-6">
              The house price is increased annually using the house price
              inflation assumption. The down payment is treated as a percentage
              of that future price. Current house savings and monthly SIP
              contributions compound monthly at the expected annual return,
              divided by 12. Contributions are assumed at the start of each
              month. Goal progress measures how much of the future down payment
              is covered by projected current savings before adding the
              recommended SIP. Taxes, fees, mortgage costs, and market
              variability are not included.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
