import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    name: "WealthTogether Investment Blueprint™",
    badge: "Most Popular",
    price: "₹1,499",
    action: "Book Now",
    features: [
      "Two private sessions · 120 minutes",
      "Google Meet",
      "Mutual fund basics + goal planning",
      "—",
      "—",
    ],
  },
  {
    name: "WealthTogether Financial Freedom Cohort™",
    badge: "",
    price: "₹4,999",
    action: "Join Next Batch",
    features: [
      "Four-week learning cohort",
      "Live online",
      "Money, protection & investment curriculum",
      "Tamil + English",
      "—",
    ],
  },
  {
    name: "Invest Through WealthTogether",
    badge: "",
    price: "Free Account Opening",
    action: "Start Investing",
    features: [
      "Account opening",
      "Through WealthTogether",
      "Goal planning · SIP tracking · portfolio support",
      "—",
      "ARN-362166",
    ],
  },
];

const featureLabels = ["Format", "Delivery", "Focus", "Language", "ARN"];

export function ServicesComparison() {
  return (
    <section className="bg-secondary/35 border-border border-y">
      <div className="px-content mx-auto max-w-7xl py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            COMPARE YOUR OPTIONS
          </p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            A clear view of each service
          </h2>
          <p className="text-muted-foreground mt-4 text-sm leading-6 sm:text-base">
            Compare the format, focus, and starting price to find the right next
            step for you.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:hidden">
          {services.map((service, index) => (
            <Card
              className={`overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${index === 0 ? "border-gold/50" : ""}`}
              key={service.name}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex min-h-16 items-start justify-between gap-3">
                  <h3 className="font-display text-xl leading-tight tracking-tight">
                    {service.name}
                  </h3>
                  {service.badge ? (
                    <span className="bg-accent text-accent-foreground shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wide uppercase">
                      {service.badge}
                    </span>
                  ) : null}
                </div>
                <p className="font-display mt-4 text-2xl tracking-tight">
                  {service.price}
                </p>
                <dl className="mt-5 space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <div
                      className="border-border flex items-start justify-between gap-4 border-t pt-3 text-sm"
                      key={featureLabels[featureIndex]}
                    >
                      <dt className="text-muted-foreground shrink-0">
                        {featureLabels[featureIndex]}
                      </dt>
                      <dd className="text-right font-medium">{feature}</dd>
                    </div>
                  ))}
                </dl>
                <Button
                  asChild
                  className="mt-6 w-full"
                  size="sm"
                  variant="outline"
                >
                  <Link href="/consultation">
                    {service.action}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-border bg-card shadow-card rounded-card mt-10 hidden overflow-x-auto border xl:block">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <caption className="sr-only">
              Compare the WealthTogether Investment Blueprint, Financial Freedom
              Cohort, and Invest Through WealthTogether services.
            </caption>
            <thead>
              <tr>
                <th
                  className="border-border bg-muted/65 text-muted-foreground w-44 border-b px-5 py-5 text-xs font-semibold tracking-wide uppercase"
                  scope="col"
                >
                  Service details
                </th>
                {services.map((service, index) => (
                  <th
                    className={`border-border border-b px-5 py-5 align-top ${index === 0 ? "bg-navy text-white" : "bg-card text-card-foreground"}`}
                    key={service.name}
                    scope="col"
                  >
                    {service.badge ? (
                      <span className="bg-gold text-navy mb-2 inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wide uppercase">
                        {service.badge}
                      </span>
                    ) : null}
                    <span className="font-display block text-lg leading-tight tracking-tight">
                      {service.name}
                    </span>
                    <span
                      className={`mt-2 block text-sm font-semibold ${index === 0 ? "text-gold" : "text-primary"}`}
                    >
                      {service.price}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureLabels.map((label, featureIndex) => (
                <tr key={label}>
                  <th
                    className="border-border bg-muted/45 text-muted-foreground border-b px-5 py-4 text-xs font-semibold"
                    scope="row"
                  >
                    {label}
                  </th>
                  {services.map((service, index) => (
                    <td
                      className={`border-border border-b px-5 py-4 text-sm leading-6 ${index === 0 ? "bg-accent/25" : ""}`}
                      key={service.name}
                    >
                      {service.features[featureIndex] === "—" ? (
                        <span
                          aria-label="Not applicable"
                          className="text-muted-foreground"
                        >
                          —
                        </span>
                      ) : (
                        service.features[featureIndex]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th
                  className="bg-muted/45 text-muted-foreground px-5 py-4 text-xs font-semibold"
                  scope="row"
                >
                  Next step
                </th>
                {services.map((service, index) => (
                  <td
                    className={`px-5 py-4 ${index === 0 ? "bg-accent/25" : ""}`}
                    key={service.name}
                  >
                    <Button
                      asChild
                      size="sm"
                      variant={index === 0 ? "gold" : "outline"}
                    >
                      <Link href="/consultation">
                        {service.action}
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-muted-foreground mt-5 text-center text-xs leading-5">
          Investing involves risk. Account opening is subject to applicable
          eligibility and onboarding requirements.
        </p>
      </div>
    </section>
  );
}
