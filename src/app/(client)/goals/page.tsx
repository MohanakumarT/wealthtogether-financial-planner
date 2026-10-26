import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CarFront,
  GraduationCap,
  Heart,
  House,
  Palmtree,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";

import { ClientWorkspaceShell } from "@/components/auth/client-workspace-shell";
import { Card } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/typography";
import { requireClientAccess } from "@/lib/server/user-auth";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Your goals",
  description: "Choose a goal-based financial planning tool.",
  path: "/goals",
  noIndex: true,
});
export const dynamic = "force-dynamic";

const goals = [
  {
    title: "Retirement",
    href: "/calculators/retirement",
    detail: "Estimate a future retirement corpus and contribution path.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Child education",
    href: "/calculators/child-education",
    detail: "Project education costs and explore a savings timeline.",
    icon: GraduationCap,
  },
  {
    title: "Home purchase",
    href: "/calculators/house-purchase",
    detail: "Plan for an inflation-adjusted down payment goal.",
    icon: House,
  },
  {
    title: "Marriage",
    href: "/calculators/marriage-goal",
    detail: "Explore how time and inflation affect a future event goal.",
    icon: Heart,
  },
  {
    title: "Car",
    href: "/calculators/car-purchase",
    detail: "Compare savings options against a future car purchase.",
    icon: CarFront,
  },
  {
    title: "Vacation",
    href: "/calculators/goal-planner",
    detail: "Model a personal goal with a flexible timeline.",
    icon: Palmtree,
  },
  {
    title: "Wealth creation",
    href: "/calculators/mutual-fund-goal-planner",
    detail: "Compare contribution scenarios against a target corpus.",
    icon: PiggyBank,
  },
  {
    title: "Emergency fund",
    href: "/calculators/emergency-fund",
    detail: "Estimate a reserve based on monthly expenses.",
    icon: ShieldCheck,
  },
];

export default async function GoalsPage() {
  await requireClientAccess("/goals");
  return (
    <ClientWorkspaceShell>
      <div>
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          Your planning workspace
        </p>
        <PageHeading className="mt-2">Plan around what matters.</PageHeading>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
          Choose a goal to explore the assumptions, timelines, and contribution
          levels that shape a plan.
        </p>
        <section
          aria-label="Goal planning calculators"
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {goals.map(({ title, href, detail, icon: Icon }) => (
            <Link className="group block h-full" href={href} key={title}>
              <Card className="group-hover:border-gold/60 flex h-full min-h-48 flex-col p-5 transition-colors sm:p-6">
                <span className="bg-accent text-accent-foreground grid size-11 place-items-center rounded-xl">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h2 className="font-display mt-5 text-xl tracking-tight">
                  {title}
                </h2>
                <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
                  {detail}
                </p>
                <span className="text-primary mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                  Open planner
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </span>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </ClientWorkspaceShell>
  );
}
