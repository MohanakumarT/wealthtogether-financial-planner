import { ChevronDown } from "lucide-react";

import { Eyebrow, SectionHeading } from "@/components/ui/typography";

const questions = [
  {
    question: "Is WealthTogether free to use?",
    answer:
      "Yes. Our financial calculators and educational resources are available free to help you understand your finances better. Some premium planners, workshops, and personalized consultation services are offered separately.",
  },
  {
    question: "Are these calculators accurate?",
    answer:
      "Our calculators use standard financial formulas and assumptions to provide educational estimates. Actual investment returns depend on market performance, inflation, taxes, and your personal financial situation.",
  },
  {
    question: "Do I need investment knowledge before using these tools?",
    answer:
      "Not at all. WealthTogether is designed for beginners, young professionals, families, and anyone who wants to learn money management step by step using simple language and practical examples.",
  },
  {
    question: "Will WealthTogether recommend specific mutual funds?",
    answer:
      "No. Our calculators help you understand your financial goals and estimate investment requirements. Personalized mutual fund recommendations are provided only during a dedicated consultation after understanding your goals and risk profile.",
  },
  {
    question: "Can I book a personalized financial consultation?",
    answer:
      "Yes. If you'd like a customized financial roadmap, goal planning, portfolio review, or investment guidance, you can book a one-on-one consultation with WealthTogether Investments directly from our website.",
  },
];

export function FAQ() {
  return (
    <section className="bg-secondary/60" id="faq">
      <div className="px-content mx-auto grid max-w-7xl gap-10 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <Eyebrow>BEFORE YOU START</Eyebrow>

          <SectionHeading className="mt-3 text-3xl sm:text-4xl">
            Frequently Asked Questions
          </SectionHeading>

          <p className="text-muted-foreground mt-4 text-base leading-7">
            Everything you need to know before using WealthTogether&apos;s financial
            calculators, planners, and educational resources.
          </p>

          <div className="mt-8 rounded-2xl border border-gold/20 bg-card p-6">
            <h3 className="font-display text-xl">
              Still have a question?
            </h3>

            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Our goal is to simplify financial planning for everyone. If you
              need personalized guidance, our team is here to help.
            </p>

            <a
              href="/consultation"
              className="bg-gold text-navy mt-6 inline-flex rounded-lg px-5 py-3 text-sm font-semibold transition hover:opacity-90"
            >
              Book a 1:1 Consultation
            </a>
          </div>
        </div>

        <div className="divide-border divide-y rounded-2xl border bg-card px-6">
          {questions.map(({ question, answer }) => (
            <details className="group py-6" key={question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-base font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                {question}

                <ChevronDown
                  aria-hidden="true"
                  className="text-muted-foreground size-5 shrink-0 transition-transform duration-300 group-open:rotate-180"
                />
              </summary>

              <p className="text-muted-foreground max-w-2xl pt-4 pr-8 text-sm leading-7">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}