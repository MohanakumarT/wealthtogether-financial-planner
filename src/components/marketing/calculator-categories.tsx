import {
  ArrowRight,
  ArrowUpRight,
  Baby,
  BriefcaseBusiness,
  House,
  Landmark,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Eyebrow, SectionHeading } from "@/components/ui/typography";

type CalculatorCategory = {
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
  actions?: Array<{ href: string; label: string }>;
};

const categories: CalculatorCategory[] = [
  {
    icon: PiggyBank,
    title: "Saving & everyday money",
    description:
      "Build a cushion, plan a purchase, and make monthly money feel more intentional.",
    tags: ["Savings goals", "Monthly planning"],
    actions: [
      {
        href: "/calculators/emergency-fund",
        label: "Emergency fund calculator",
      },
      { href: "/calculators/inflation", label: "Inflation calculator" },
      { href: "/calculators/goal-planner", label: "Compare life goals" },
    ],
  },
  {
    icon: Landmark,
    title: "Retirement & later life",
    description:
      "Explore the choices that shape the life you want your future selves to enjoy.",
    tags: ["Retirement", "Income planning"],
    actions: [{ href: "/calculators/retirement", label: "Retirement planner" }],
  },
  {
    icon: BriefcaseBusiness,
    title: "Investing & growth",
    description:
      "Understand how time, contributions, and assumptions can shape a long-term plan.",
    tags: ["Investment growth", "Contributions"],
    actions: [
      { href: "/calculators/sip", label: "SIP calculator" },
      { href: "/calculators/lumpsum", label: "Lumpsum calculator" },
      { href: "/calculators/step-up-sip", label: "Step-up SIP calculator" },
      {
        href: "/calculators/mutual-fund-goal-planner",
        label: "Mutual fund goal planner",
      },
      { href: "/calculators/swp", label: "SWP calculator" },
      { href: "/portfolio", label: "Portfolio tracker" },
    ],
  },
  {
    icon: House,
    title: "Home & big milestones",
    description:
      "Bring a home, a move, or another meaningful milestone into view.",
    tags: ["Home buying", "Life goals"],
    actions: [
      { href: "/calculators/house-purchase", label: "House purchase planner" },
      { href: "/calculators/car-purchase", label: "Car purchase planner" },
    ],
  },
  {
    icon: Baby,
    title: "Family & education",
    description:
      "Make room for the people and opportunities you hope to support.",
    tags: ["Education", "Family goals"],
    actions: [
      {
        href: "/calculators/child-education",
        label: "Child education planner",
      },
      { href: "/calculators/marriage-goal", label: "Marriage goal planner" },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Protection & preparedness",
    description:
      "Think through the buffers and decisions that can help a plan feel more resilient.",
    tags: ["Emergency fund", "What-if planning"],
  },
];

export function CalculatorCategories() {
  return (
    <section className="bg-secondary/60" id="calculators">
      <div className="px-content mx-auto max-w-7xl py-20 sm:py-24">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>TOOLS FOR THE BIG PICTURE</Eyebrow>
            <SectionHeading className="mt-3 text-3xl sm:text-4xl">
              Start with what&apos;s on your mind.
            </SectionHeading>
            <p className="text-muted-foreground mt-4 text-base leading-7">
              Explore planning topics by the decisions you&apos;re making, not
              by financial jargon.
            </p>
          </div>
          <p className="text-muted-foreground max-w-xs text-xs leading-5">
            Estimates use the assumptions you choose and are illustrative, not
            financial advice.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map(
            ({ icon: Icon, title, description, tags, actions }) => (
              <Card
                className="hover:border-gold/60 flex h-full flex-col p-5 transition-colors sm:p-6"
                key={title}
              >
                <div className="flex items-center justify-between">
                  <span className="bg-card text-primary grid size-11 place-items-center rounded-xl shadow-sm">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="text-muted-foreground size-4"
                  />
                </div>
                <h3 className="font-display mt-5 text-xl tracking-tight">
                  {title}
                </h3>
                <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
                  {description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      className="border-border text-muted-foreground rounded-full border px-2.5 py-1 text-[11px]"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {actions ? (
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
                    {actions.map((action) => (
                      <Link
                        className="text-primary inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                        href={action.href}
                        key={action.href}
                      >
                        {action.label}
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </Card>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
