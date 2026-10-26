import { Quote } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Eyebrow, SectionHeading } from "@/components/ui/typography";

const perspectives = [
  {
    quote:
      "We want to enjoy today and still feel good about the choices we are making for later.",
    label: "Balancing today with tomorrow",
    context: "A common planning conversation",
  },
  {
    quote:
      "We each have our own goals. It helps to find the parts of the future we want to build together.",
    label: "Making room for two perspectives",
    context: "A shared-goals perspective",
  },
  {
    quote:
      "Big decisions feel more manageable when we can take them one step at a time.",
    label: "Finding a first next step",
    context: "A milestone-planning perspective",
  },
];

export function Testimonials() {
  return (
    <section
      className="px-content mx-auto max-w-7xl py-20 sm:py-24"
      id="stories"
    >
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>REAL LIFE, REAL PRIORITIES</Eyebrow>
        <SectionHeading className="mt-3 text-3xl sm:text-4xl">
          The conversations are the point.
        </SectionHeading>
        <p className="text-muted-foreground mt-4 text-base leading-7">
          Every shared plan starts with a different question. Here are a few of
          the moments WealthTogether is designed to make room for.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {perspectives.map((item) => (
          <Card className="flex h-full flex-col p-6 sm:p-7" key={item.label}>
            <Quote
              aria-hidden="true"
              className="fill-gold/20 text-primary size-5"
            />
            <blockquote className="font-display mt-5 flex-1 text-xl leading-8 tracking-tight">
              “{item.quote}”
            </blockquote>
            <div className="border-border mt-7 border-t pt-4">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {item.context}
              </p>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-muted-foreground mx-auto mt-5 max-w-3xl text-center text-[11px] leading-5">
        Representative planning perspectives, not customer testimonials or
        endorsements.
      </p>
    </section>
  );
}
