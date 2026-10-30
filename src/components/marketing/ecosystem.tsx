import {
  BookOpen,
  Calculator,
  GraduationCap,
  LineChart,
  Sparkles,
  Target,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Eyebrow, SectionHeading } from "@/components/ui/typography";

const sections = [
  {
    icon: BookOpen,
    title: "Financial Learning Hub",
    description:
      "Simple articles and guides to help you understand money, investing, insurance and personal finance.",
    status: "Explore →",
  },
  {
    icon: Target,
    title: "Financial Planners",
    description:
      "Goal-based planners for retirement, child education, home purchase, emergency fund and financial freedom.",
    status: "Start Planning →",
  },
  {
    icon: Calculator,
    title: "Interactive Calculators",
    description:
      "Educational calculators that help you estimate, compare and understand different financial scenarios.",
    status: "Open Calculators →",
  },
  {
    icon: LineChart,
    title: "Goal Tracker",
    description:
      "Track your progress, savings and milestones as you work toward your financial goals.",
    status: "Coming Soon",
  },
  {
    icon: Sparkles,
    title: "AI Financial Assistant",
    description:
      "Ask questions and receive simple educational explanations whenever you need financial clarity.",
    status: "Coming Soon",
  },
  {
    icon: GraduationCap,
    title: "WealthTogether Academy",
    description:
      "Premium workshops, courses and financial education programs designed to build long-term confidence.",
    status: "Coming Soon",
  },
];

export function Ecosystem() {
  return (
    <section
      className="px-content mx-auto max-w-7xl py-20 sm:py-24"
      id="ecosystem"
    >
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow>EXPLORE WEALTHTOGETHER</Eyebrow>

        <SectionHeading className="mt-3 text-3xl sm:text-4xl">
          Everything you need to build your financial future.
        </SectionHeading>

        <p className="text-muted-foreground mt-5 text-base leading-7">
          WealthTogether brings together financial education, planners,
          calculators and learning experiences to help you make informed
          financial decisions with confidence.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ icon: Icon, title, description, status }) => (
          <Card
            key={title}
            className="group flex h-full flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-2 hover:border-yellow-500/40 hover:shadow-xl"
          >
            <div className="bg-gold/10 text-gold flex h-14 w-14 items-center justify-center rounded-2xl">
              <Icon className="h-7 w-7" />
            </div>

            <h3 className="font-display mt-6 text-2xl">
              {title}
            </h3>

            <p className="text-muted-foreground mt-4 flex-1 leading-7">
              {description}
            </p>

            <div className="mt-8 border-t pt-5">
              <span className="text-primary font-semibold transition-colors group-hover:text-yellow-600">
                {status}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-14 rounded-3xl bg-[#081B3A] px-8 py-10 text-center text-white">
        <p className="text-gold text-sm font-semibold tracking-widest">
          OUR MISSION
        </p>

        <h3 className="mt-3 text-3xl font-bold">
          Learn. Plan. Grow.
        </h3>

        <p className="mx-auto mt-5 max-w-3xl text-white/75 leading-7">
          We believe financial planning should be simple, practical and
          accessible. Our goal is to help every individual and family make
          better financial decisions through education and interactive planning
          tools.
        </p>
      </div>
    </section>
  );
}