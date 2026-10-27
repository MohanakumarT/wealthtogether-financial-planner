import { Accordion, type AccordionItem } from "@/components/ui/accordion";

const questions: AccordionItem[] = [
  {
    id: "services-who-for",
    title: "Who is this for?",
    content:
      "The services are for salaried professionals, beginners, families, and people planning for major financial goals who want to build a clearer path forward.",
  },
  {
    id: "services-beginners",
    title: "Can beginners join?",
    content:
      "Yes. The Cohort is designed for beginners as well as salaried professionals. It starts with money management and protection planning before covering investing and financial goals.",
  },
  {
    id: "services-fund-recommendations",
    title: "Will you recommend mutual funds?",
    content:
      "The Blueprint covers fund-selection concepts. If you are considering Invest Through WealthTogether, book a consultation to understand how portfolio creation, risk, and suitability are handled for your circumstances. Investments involve risk.",
  },
  {
    id: "services-nri",
    title: "Can NRIs join?",
    content:
      "Please contact us before booking so the team can confirm eligibility and any account-opening requirements for your country of residence.",
  },
  {
    id: "services-couples",
    title: "Can couples join?",
    content:
      "Yes. Couples can join sessions together to discuss shared goals while making room for each person’s individual priorities. Contact us to discuss Cohort enrollment as a couple.",
  },
  {
    id: "services-advice",
    title: "Is this investment advice?",
    content:
      "The Blueprint and Cohort are educational services. Invest Through WealthTogether is a separate investing service; book a consultation to discuss its scope, suitability process, and relevant disclosures. Investments involve risk, including possible loss of principal.",
  },
];

export function ServicesFAQ() {
  return (
    <section className="px-content mx-auto max-w-7xl py-16 sm:py-20 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            GOOD TO KNOW
          </p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            A few answers to help you choose your next step.
          </p>
        </div>
        <Accordion items={questions} />
      </div>
    </section>
  );
}
