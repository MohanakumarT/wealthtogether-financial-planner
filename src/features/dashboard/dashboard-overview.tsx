import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  ChartNoAxesCombined,
  FileText,
  Goal,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const workspaceCards = [
  {
    href: "/portfolio",
    label: "Portfolio",
    description: "Review and update your investment holdings.",
    action: "Open portfolio",
    icon: ChartNoAxesCombined,
  },
  {
    href: "/goals",
    label: "Goals",
    description: "Plan for retirement, education, a home, and more.",
    action: "Explore goals",
    icon: Goal,
  },
  {
    href: "/reports",
    label: "Reports",
    description: "Revisit your saved calculations and planning history.",
    action: "View reports",
    icon: FileText,
  },
  {
    href: "/assistant",
    label: "AI Assistant",
    description: "Get plain-language explanations of planning concepts.",
    action: "Ask a question",
    icon: Bot,
  },
  {
    href: "/consultation",
    label: "Book consultation",
    description: "Arrange a conversation with WealthTogether Investments.",
    action: "Book a time",
    icon: CalendarDays,
  },
  {
    href: "/profile",
    label: "Your profile",
    description: "Keep the details on your account up to date.",
    action: "Manage profile",
    icon: UserRound,
  },
];

export function DashboardOverview({ firstName }: { firstName: string }) {
  return (
    <div className="space-y-8">
      <section className="bg-navy relative overflow-hidden rounded-[1.75rem] px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="bg-gold/10 absolute -top-24 -right-20 size-72 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-gold text-xs font-semibold tracking-[0.18em] uppercase">
              Your private planning space
            </p>
            <h1 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
              Welcome, {firstName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              Your plans are here when you need them. Choose a next step and
              update your assumptions as life changes.
            </p>
          </div>
          <Button asChild className="shrink-0" variant="gold">
            <Link href="/calculators/goal-planner">
              <Goal aria-hidden="true" className="size-4" />
              Start a goal plan
            </Link>
          </Button>
        </div>
      </section>

      <section
        aria-label="Planning workspace"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {workspaceCards.map(
          ({ href, label, description, action, icon: Icon }) => (
            <Card
              className="group flex min-h-52 flex-col p-5 sm:p-6"
              key={href}
            >
              <span className="bg-accent text-accent-foreground grid size-11 place-items-center rounded-xl">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h2 className="font-display mt-5 text-xl tracking-tight">
                {label}
              </h2>
              <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
                {description}
              </p>
              <Link
                className="text-primary mt-5 inline-flex items-center gap-2 text-sm font-semibold"
                href={href}
              >
                {action}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </Card>
          ),
        )}
      </section>

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="bg-secondary text-secondary-foreground grid size-10 shrink-0 place-items-center rounded-xl">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">
              A clear view, at your pace
            </h2>
            <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">
              Calculators use the assumptions you provide. Projections are
              educational illustrations and are not guaranteed outcomes or
              individualized investment advice.
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0" variant="outline">
          <Link href="/consultation">Talk with our team</Link>
        </Button>
      </Card>
    </div>
  );
}
