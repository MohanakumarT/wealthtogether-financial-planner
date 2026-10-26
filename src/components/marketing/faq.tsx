import { ChevronDown } from "lucide-react";

import { Eyebrow, SectionHeading } from "@/components/ui/typography";

const questions = [
  {
    question: "Who is WealthTogether designed for?",
    answer:
      "For individuals and partners who want a more thoughtful way to talk about money, compare priorities, and plan the next chapter.",
  },
  {
    question: "Do we need to have the same goals to plan together?",
    answer:
      "No. A shared plan can hold individual priorities alongside the goals you have in common. The point is to make those priorities easier to discuss.",
  },
  {
    question: "What kinds of planning topics can I explore?",
    answer:
      "The categories cover everyday saving, retirement, investing, a home purchase, family and education goals, and financial preparedness.",
  },
  {
    question: "Are planning estimates personal financial advice?",
    answer:
      "No. Planning scenarios and estimates are educational starting points, not individualized investment, tax, or legal advice. Consider speaking with a qualified professional about your situation.",
  },
  {
    question: "Do I have to connect a financial account?",
    answer:
      "You can begin by thinking about your goals and priorities. Any account connections or data-sharing features should be clearly explained before you choose to use them.",
  },
];

export function FAQ() {
  return (
    <section className="bg-secondary/60" id="faq">
      <div className="px-content mx-auto grid max-w-7xl gap-10 py-20 sm:py-24 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
        <div>
          <Eyebrow>GOOD TO KNOW</Eyebrow>
          <SectionHeading className="mt-3 text-3xl sm:text-4xl">
            A few thoughtful answers.
          </SectionHeading>
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            Have another question? Start with what matters most to you.
          </p>
        </div>
        <div className="divide-border divide-y">
          {questions.map(({ question, answer }) => (
            <details className="group py-5 first:pt-0" key={question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  aria-hidden="true"
                  className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="text-muted-foreground max-w-2xl pt-3 pr-8 text-sm leading-6">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
