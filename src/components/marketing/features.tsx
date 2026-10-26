import {
  ArrowUpRight,
  Compass,
  MessagesSquare,
  SlidersHorizontal,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Eyebrow, SectionHeading } from "@/components/ui/typography";

const features = [
  {
    icon: MessagesSquare,
    title: "Make space for both voices",
    description:
      "Bring separate perspectives into one shared conversation, so the plan can reflect the people behind it.",
  },
  {
    icon: Compass,
    title: "See a clearer path forward",
    description:
      "Turn big ambitions into smaller decisions you can understand, discuss, and revisit together.",
  },
  {
    icon: SlidersHorizontal,
    title: "Shape a plan that can flex",
    description:
      "Life changes. Keep your priorities visible and adjust your direction as the next chapter takes shape.",
  },
];

export function Features() {
  return (
    <section
      className="px-content mx-auto max-w-7xl py-20 sm:py-24"
      id="features"
    >
      <div className="max-w-2xl">
        <Eyebrow>PLANNING, MADE PERSONAL</Eyebrow>
        <SectionHeading className="mt-3 text-3xl sm:text-4xl">
          A shared plan should feel like yours.
        </SectionHeading>
        <p className="text-muted-foreground mt-4 text-base leading-7">
          Less financial noise. More room for the conversations that help you
          move forward.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }, index) => (
          <Card
            className="group relative overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
            key={title}
          >
            <span className="bg-accent text-accent-foreground grid size-11 place-items-center rounded-xl">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <p className="text-muted-foreground mt-7 text-xs font-semibold tracking-widest">
              0{index + 1}
            </p>
            <h3 className="font-display mt-2 text-2xl tracking-tight">
              {title}
            </h3>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              {description}
            </p>
            <ArrowUpRight
              aria-hidden="true"
              className="text-muted-foreground group-hover:text-primary absolute top-6 right-6 size-4 transition-colors"
            />
          </Card>
        ))}
      </div>
    </section>
  );
}
