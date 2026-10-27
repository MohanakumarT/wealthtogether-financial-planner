import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  Compass,
  Landmark,
  Sparkles,
  Video,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Footer } from "@/components/footer";
import { ServiceAgenda } from "@/components/marketing/service-agenda";
import { ServiceChecklist } from "@/components/marketing/service-checklist";
import { ServicesComparison } from "@/components/marketing/services-comparison";
import { ServicesFAQ } from "@/components/marketing/services-faq";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Financial Planning Services",
  description:
    "Explore WealthTogether’s investment blueprint, financial freedom cohort, and investing services.",
  path: "/services",
});

const blueprintSessions = [
  {
    label: "SESSION 01",
    title: "Session 1",
    duration: "60 Minutes",
    topics: [
      "Mutual Fund Basics",
      "Types of Mutual Funds",
      "SIP vs Lump Sum",
      "Risk & Returns",
      "Compounding",
      "Fund Selection",
      "Common Mistakes",
      "Q&A",
    ],
  },
  {
    label: "SESSION 02",
    title: "Session 2",
    duration: "60 Minutes",
    topics: [
      "Financial Goal Planning",
      "Goal Identification",
      "Inflation Planning",
      "Future Goal Calculation",
      "Monthly Investment Planning",
      "Time Horizon",
      "Personalized Investment Roadmap",
    ],
  },
];

const cohortWeeks = [
  {
    label: "WEEK 01",
    title: "Money Management",
    topics: [
      "Budgeting",
      "Cash Flow",
      "Emergency Fund",
      "Financial Goal Setting",
    ],
  },
  {
    label: "WEEK 02",
    title: "Protection Planning",
    topics: [
      "Health Insurance",
      "Term Insurance",
      "Good Debt vs Bad Debt",
      "Credit Score",
    ],
  },
  {
    label: "WEEK 03",
    title: "Investment Mastery",
    topics: [
      "Mutual Fund Basics",
      "SIP",
      "Lumpsum",
      "Asset Allocation",
      "Risk Profile",
      "Portfolio Building",
    ],
  },
  {
    label: "WEEK 04",
    title: "Financial Freedom Blueprint",
    topics: [
      "Retirement Planning",
      "Kids Education Planning",
      "Tax Saving Basics",
      "Portfolio Review",
      "Long-Term Wealth Creation",
    ],
  },
];

const blueprintIncludes = [
  {
    title: "Two Private Sessions",
    description: "Two focused 60-minute sessions on Google Meet.",
  },
  {
    title: "Personalized Goal Planning",
    description: "Organize your goals around what matters to you.",
  },
  {
    title: "Investment Blueprint",
    description: "A clear roadmap for your investment journey.",
  },
  {
    title: "Goal Calculation",
    description: "Explore future goals and monthly investment needs.",
  },
  {
    title: "Action Plan",
    description: "Take away practical next steps from your sessions.",
  },
  {
    title: "Doubt Clarification",
    description: "Bring your questions and get them addressed.",
  },
];

const cohortIncludes = [
  { title: "Live Interactive Sessions" },
  { title: "Worksheets & Templates" },
  { title: "Practical Assignments" },
  { title: "Community Support" },
  { title: "Session Recordings (if available)" },
  { title: "Q&A Sessions" },
  { title: "Financial Freedom Blueprint" },
];

const investmentBenefits = [
  {
    title: "Goal-Based Investment Planning",
    description:
      "Bring your goals and time horizons into the planning process.",
  },
  {
    title: "Mutual Fund Portfolio Creation",
    description: "Build a portfolio around your goals and investment plan.",
  },
  {
    title: "Regular Portfolio Reviews",
    description: "Review portfolio activity and progress at regular intervals.",
  },
  {
    title: "Annual Portfolio Review",
    description: "Set aside time for a dedicated yearly review.",
  },
  {
    title: "Portfolio Rebalancing Guidance",
    description: "Discuss portfolio allocation as your plan evolves.",
  },
  {
    title: "SIP Tracking",
    description: "Keep track of your systematic investment plans.",
  },
  {
    title: "Goal Progress Monitoring",
    description: "Check progress against your financial milestones.",
  },
  {
    title: "Dedicated Investment Support",
    description: "Get ongoing support for your investing journey.",
  },
];

const investorProfiles = [
  "First-Time Investors",
  "Salaried Employees",
  "Families",
  "Parents Planning for Children",
  "Long-Term Wealth Builders",
];

const investmentProcess = [
  {
    title: "Book Consultation",
    description: "Share what you are planning for and the questions you have.",
  },
  {
    title: "Complete Financial Assessment",
    description: "Discuss your goals, financial picture, and time horizons.",
  },
  {
    title: "Receive Personalized Investment Plan",
    description: "Review a plan shaped around the assessment and your goals.",
  },
  {
    title: "Start Investing Through WealthTogether",
    description: "Move forward through the WealthTogether investment process.",
  },
  {
    title: "Regular Reviews & Ongoing Support",
    description: "Review progress and discuss next steps over time.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navigation />
      <main>
        <section className="bg-navy relative isolate overflow-hidden text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(ellipse at 78% 24%, rgba(212,175,55,.2), transparent 32%), radial-gradient(ellipse at 12% 100%, rgba(54,91,141,.35), transparent 42%)",
            }}
          />
          <div className="px-content relative mx-auto grid max-w-7xl items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium tracking-wide text-white/80">
                <Sparkles aria-hidden="true" className="text-gold size-3.5" />
                Thoughtful support for your next step
              </p>
              <h1 className="font-display text-5xl leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                Financial Planning Services
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                Choose the service that best fits your financial journey.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg" variant="gold">
                  <Link href="/consultation">
                    Book Consultation
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="border-white/25 text-white hover:bg-white/10"
                  size="lg"
                  variant="outline"
                >
                  <Link href="/consultation">
                    Explore Services
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-10 flex items-center gap-3 text-sm text-white/60">
                <span className="bg-gold/15 text-gold grid size-9 place-items-center rounded-full">
                  <BadgeCheck aria-hidden="true" className="size-4" />
                </span>
                <span>Practical guidance, built around your priorities.</span>
              </div>
            </div>

            <div
              aria-label="A simple three-step view of financial planning"
              className="relative mx-auto w-full max-w-[30rem]"
              role="img"
            >
              <div
                aria-hidden="true"
                className="bg-gold/10 absolute -inset-7 rounded-full blur-3xl"
              />
              <div className="relative rounded-[1.75rem] border border-white/15 bg-white/[0.08] p-4 shadow-2xl shadow-black/25 backdrop-blur sm:p-5">
                <div className="rounded-[1.25rem] bg-[#0d2342] p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium tracking-[0.17em] text-white/55 uppercase">
                        YOUR FINANCIAL JOURNEY
                      </p>
                      <p className="font-display mt-2 text-2xl tracking-tight sm:text-3xl">
                        Clarity, one step at a time
                      </p>
                    </div>
                    <span className="bg-gold/15 text-gold grid size-11 shrink-0 place-items-center rounded-full">
                      <Compass aria-hidden="true" className="size-5" />
                    </span>
                  </div>
                  <div className="mt-7 space-y-3">
                    {[
                      {
                        icon: Landmark,
                        label: "Your goals",
                        detail: "Start here",
                      },
                      {
                        icon: Compass,
                        label: "A clearer direction",
                        detail: "Find focus",
                      },
                      {
                        icon: Check,
                        label: "Your next step",
                        detail: "Move forward",
                      },
                    ].map(({ icon: Icon, label, detail }, index) => (
                      <div
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3"
                        key={label}
                      >
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-lg ${index === 0 ? "bg-gold text-navy" : "bg-white/10 text-white"}`}
                        >
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium">
                          {label}
                        </span>
                        <span className="text-xs text-white/50">{detail}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gold text-navy mt-5 flex items-center justify-between gap-3 rounded-xl px-4 py-3.5">
                    <span>
                      <span className="block text-[10px] font-semibold tracking-[0.14em] uppercase">
                        WealthTogether
                      </span>
                      <span className="mt-1 block text-sm font-semibold">
                        Your plan, your pace
                      </span>
                    </span>
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </div>
                </div>
                <p className="px-2 pt-3 text-center text-[10px] text-white/50">
                  A clearer path begins with a conversation
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="px-content mx-auto max-w-7xl py-16 sm:py-20 lg:py-24"
          id="services"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              WAYS TO MOVE FORWARD
            </p>
            <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
              Find the support that fits your next step
            </h2>
            <p className="text-muted-foreground mt-4 text-sm leading-6 sm:text-base">
              Choose a focused planning session, a guided cohort, or support to
              begin investing through WealthTogether.
            </p>
          </div>

          <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
            <Card className="border-gold/40 bg-navy shadow-navy/10 relative flex h-full flex-col overflow-hidden text-white shadow-xl">
              <div
                aria-hidden="true"
                className="bg-gold/10 pointer-events-none absolute -top-24 -right-24 size-56 rounded-full blur-3xl"
              />
              <CardContent className="relative flex h-full flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="bg-gold text-navy inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase">
                    <Sparkles aria-hidden="true" className="size-3" />
                    Most Popular
                  </span>
                  <span className="text-gold grid size-10 place-items-center rounded-xl border border-white/15 bg-white/5">
                    <Compass aria-hidden="true" className="size-5" />
                  </span>
                </div>
                <h3 className="font-display mt-6 text-2xl leading-tight tracking-tight sm:text-[1.7rem]">
                  WealthTogether Investment Blueprint™
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  A focused session to bring your financial goals and next
                  decisions into clearer view.
                </p>

                <div
                  aria-label="Discounted price: ₹1,499, previously ₹4,999"
                  className="mt-7 flex items-center gap-3"
                >
                  <span className="text-sm text-white/45 line-through">
                    ₹4,999
                  </span>
                  <span aria-hidden="true" className="text-white/45">
                    →
                  </span>
                  <span className="font-display text-gold text-4xl tracking-tight">
                    ₹1,499
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-white/75">
                    <Clock3
                      aria-hidden="true"
                      className="text-gold size-4 shrink-0"
                    />
                    120 Minutes
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-white/75">
                    <Video
                      aria-hidden="true"
                      className="text-gold size-4 shrink-0"
                    />
                    Google Meet
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap gap-2.5 pt-7">
                  <Button asChild className="flex-1" size="sm" variant="gold">
                    <Link href="/consultation">
                      Book Now
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="border-white/25 text-white hover:bg-white/10"
                    size="sm"
                    variant="outline"
                  >
                    <Link href="/consultation">Learn More</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <CardContent className="flex h-full flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="bg-accent text-accent-foreground inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase">
                    Learn together
                  </span>
                  <span className="bg-secondary text-secondary-foreground grid size-10 place-items-center rounded-xl">
                    <UsersRound aria-hidden="true" className="size-5" />
                  </span>
                </div>
                <h3 className="font-display mt-6 text-2xl leading-tight tracking-tight sm:text-[1.7rem]">
                  WealthTogether Financial Freedom Cohort™
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-6">
                  A four-week live online learning experience for building
                  confidence around your financial journey.
                </p>

                <p className="font-display mt-7 text-4xl tracking-tight">
                  ₹4,999
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  <div className="bg-muted/70 text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs">
                    <CalendarDays
                      aria-hidden="true"
                      className="text-primary size-4 shrink-0"
                    />
                    4 Weeks
                  </div>
                  <div className="bg-muted/70 text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs">
                    <Video
                      aria-hidden="true"
                      className="text-primary size-4 shrink-0"
                    />
                    Live Online
                  </div>
                </div>

                <div className="mt-auto pt-7">
                  <Button
                    asChild
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    <Link href="/consultation">
                      Join Next Batch
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <CardContent className="flex h-full flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="bg-accent text-accent-foreground inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase">
                    Start with clarity
                  </span>
                  <span className="bg-secondary text-secondary-foreground grid size-10 place-items-center rounded-xl">
                    <Landmark aria-hidden="true" className="size-5" />
                  </span>
                </div>
                <h3 className="font-display mt-6 text-2xl leading-tight tracking-tight sm:text-[1.7rem]">
                  Invest Through WealthTogether
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-6">
                  Explore an investing relationship through WealthTogether and
                  get support with the account-opening process.
                </p>

                <div className="border-border bg-muted/45 mt-7 space-y-3 rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">ARN</span>
                    <span className="font-semibold tracking-wide">
                      ARN-362166
                    </span>
                  </div>
                  <div className="border-border flex items-center gap-2 border-t pt-3 text-sm">
                    <Check
                      aria-hidden="true"
                      className="text-primary size-4 shrink-0"
                    />
                    <span className="font-semibold">Free Account Opening</span>
                  </div>
                </div>

                <div className="mt-auto pt-7">
                  <Button
                    asChild
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    <Link href="/consultation">
                      Start Investing
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-muted-foreground mt-6 text-center text-xs leading-5">
            Services are educational and goal-focused. Investing involves risk;
            consider your circumstances before making financial decisions.
          </p>
        </section>

        <section
          aria-labelledby="blueprint-title"
          className="border-border border-y"
          id="blueprint-details"
        >
          <div className="bg-navy relative isolate overflow-hidden text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(ellipse at 83% 18%, rgba(212,175,55,.22), transparent 32%), radial-gradient(ellipse at 10% 100%, rgba(54,91,141,.3), transparent 40%)",
              }}
            />
            <div className="px-content relative mx-auto flex max-w-7xl flex-col items-start gap-8 py-14 sm:py-18 lg:py-20">
              <div className="max-w-3xl">
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold tracking-wide text-white/80">
                  <Sparkles aria-hidden="true" className="text-gold size-3.5" />
                  WEALTHTOGETHER INVESTMENT BLUEPRINT™
                </p>
                <h2
                  className="font-display text-4xl leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl"
                  id="blueprint-title"
                >
                  WealthTogether Investment Blueprint™
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                  Two private sessions to build your understanding, plan your
                  financial goals, and shape a practical investment roadmap.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/85">
                  <Clock3 aria-hidden="true" className="text-gold size-4" />
                  120 Minutes
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/85">
                  <Video aria-hidden="true" className="text-gold size-4" />
                  Google Meet
                </span>
                <span
                  aria-label="Price reduced from ₹4,999 to ₹1,499"
                  className="border-gold/35 bg-gold/10 inline-flex items-center gap-2 rounded-xl border px-4 py-3"
                >
                  <span className="text-sm text-white/55 line-through">
                    ₹4,999
                  </span>
                  <span aria-hidden="true" className="text-gold/80">
                    →
                  </span>
                  <span className="font-display text-gold text-2xl tracking-tight">
                    ₹1,499
                  </span>
                </span>
              </div>

              <Button asChild size="lg" variant="gold">
                <Link href="/consultation">
                  Book Now
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="px-content mx-auto max-w-7xl py-14 sm:py-18 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                YOUR TWO-SESSION BLUEPRINT
              </p>
              <h3 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
                Two focused sessions. One clearer investment path.
              </h3>
              <p className="text-muted-foreground mt-4 text-sm leading-6 sm:text-base">
                Start with the fundamentals, then apply your learning to your
                own goals and time horizon.
              </p>
            </div>

            <div className="mt-9">
              <ServiceAgenda items={blueprintSessions} />
            </div>

            <div className="mt-16 sm:mt-20">
              <div className="max-w-2xl">
                <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                  INCLUDED IN YOUR BLUEPRINT
                </p>
                <h3 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
                  What’s Included
                </h3>
              </div>
              <div className="mt-8">
                <ServiceChecklist items={blueprintIncludes} />
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="cohort-title"
          className="border-border border-b"
          id="cohort-details"
        >
          <div className="bg-navy relative isolate overflow-hidden text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(ellipse at 82% 16%, rgba(212,175,55,.2), transparent 34%), radial-gradient(ellipse at 12% 100%, rgba(54,91,141,.3), transparent 40%)",
              }}
            />
            <div className="px-content relative mx-auto flex max-w-7xl flex-col items-start gap-8 py-14 sm:py-18 lg:py-20">
              <div className="max-w-3xl">
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold tracking-wide text-white/80">
                  <Sparkles aria-hidden="true" className="text-gold size-3.5" />
                  LEARN • IMPLEMENT • BUILD WEALTH
                </p>
                <h2
                  className="font-display text-4xl leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl"
                  id="cohort-title"
                >
                  WealthTogether Financial Freedom Cohort™
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                  A structured financial education program designed for salaried
                  professionals and beginners who want to confidently manage
                  money, invest wisely, and achieve financial freedom.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/85">
                  ₹4,999
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/85">
                  <Clock3 aria-hidden="true" className="text-gold size-4" />4
                  Weeks
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/85">
                  <Video aria-hidden="true" className="text-gold size-4" />
                  Live Online
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/85">
                  <UsersRound aria-hidden="true" className="text-gold size-4" />
                  Tamil + English
                </span>
              </div>

              <Button asChild size="lg" variant="gold">
                <Link href="/consultation">
                  Join Now
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="px-content mx-auto max-w-7xl py-14 sm:py-18 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                FOUR WEEKS OF PRACTICAL LEARNING
              </p>
              <h3 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
                What You’ll Learn
              </h3>
              <p className="text-muted-foreground mt-4 text-sm leading-6 sm:text-base">
                Move from everyday money management to a long-term financial
                freedom blueprint, one week at a time.
              </p>
            </div>
            <div className="mt-9">
              <ServiceAgenda items={cohortWeeks} layout="weeks" />
            </div>

            <div className="mt-16 sm:mt-20">
              <div className="max-w-2xl">
                <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                  YOUR COHORT EXPERIENCE
                </p>
                <h3 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
                  What’s Included
                </h3>
              </div>
              <div className="mt-8">
                <ServiceChecklist columns="four" items={cohortIncludes} />
              </div>
            </div>
          </div>

          <div className="px-content mx-auto max-w-7xl pb-14 sm:pb-18 lg:pb-20">
            <Card className="bg-navy shadow-navy/10 relative isolate overflow-hidden border-0 text-white shadow-xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background:
                    "radial-gradient(ellipse at 84% 10%, rgba(212,175,55,.2), transparent 35%)",
                }}
              />
              <CardContent className="relative flex flex-col items-start justify-between gap-7 p-7 sm:p-10 lg:flex-row lg:items-center lg:p-12">
                <div className="max-w-2xl">
                  <p className="text-gold text-xs font-semibold tracking-[0.16em] uppercase">
                    LEARN • IMPLEMENT • BUILD WEALTH
                  </p>
                  <h3 className="font-display mt-3 text-3xl leading-tight tracking-tight sm:text-4xl">
                    Join the Next Cohort
                  </h3>
                </div>
                <Button asChild className="shrink-0" size="lg" variant="gold">
                  <Link href="/consultation">
                    Join Now
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          aria-labelledby="invest-through-title"
          className="border-border border-b"
          id="invest-through-details"
        >
          <div className="bg-navy relative isolate overflow-hidden text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(ellipse at 82% 16%, rgba(212,175,55,.2), transparent 34%), radial-gradient(ellipse at 12% 100%, rgba(54,91,141,.3), transparent 40%)",
              }}
            />
            <div className="px-content relative mx-auto flex max-w-7xl flex-col items-start gap-8 py-14 sm:py-18 lg:py-20">
              <div className="max-w-3xl">
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold tracking-wide text-white/80">
                  <Landmark aria-hidden="true" className="text-gold size-3.5" />
                  WEALTHTOGETHER INVESTMENTS
                </p>
                <h2
                  className="font-display text-4xl leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl"
                  id="invest-through-title"
                >
                  Invest Through WealthTogether
                </h2>
                <p className="text-gold mt-4 text-sm font-semibold tracking-wide sm:text-base">
                  Invest with Confidence | ARN-362166
                </p>
                <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                  Start your investment journey through WealthTogether
                  Investments and receive ongoing guidance, portfolio
                  monitoring, and long-term financial support.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="border-gold/35 bg-gold/10 text-gold inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold">
                  <BadgeCheck aria-hidden="true" className="size-4" />
                  Free Account Opening
                </span>
              </div>

              <Button asChild size="lg" variant="gold">
                <Link href="/consultation">
                  Start Investing
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="px-content mx-auto max-w-7xl py-14 sm:py-18 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                CONTINUED SUPPORT FOR YOUR PLAN
              </p>
              <h3 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
                Investment Benefits
              </h3>
            </div>
            <div className="mt-8">
              <ServiceChecklist columns="four" items={investmentBenefits} />
            </div>

            <div className="mt-16 sm:mt-20">
              <div className="max-w-2xl">
                <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                  A PLACE TO START
                </p>
                <h3 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
                  Who Can Join
                </h3>
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {investorProfiles.map((profile) => (
                  <li key={profile}>
                    <Card className="flex h-full items-center gap-3.5 p-4 transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transform-none sm:p-5">
                      <span className="bg-accent text-accent-foreground grid size-9 shrink-0 place-items-center rounded-xl">
                        <UsersRound aria-hidden="true" className="size-4" />
                      </span>
                      <span className="text-sm font-semibold">{profile}</span>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-16 sm:mt-20">
              <div className="max-w-2xl">
                <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                  YOUR PATH WITH WEALTHTOGETHER
                </p>
                <h3 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
                  Investment Process
                </h3>
              </div>
              <ol className="mt-8 grid max-w-4xl gap-3">
                {investmentProcess.map((step, index) => (
                  <li
                    className="flex flex-col items-center gap-2"
                    key={step.title}
                  >
                    <Card className="w-full transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transform-none">
                      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                        <span className="bg-navy text-gold grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold">
                          0{index + 1}
                        </span>
                        <span>
                          <span className="text-primary block text-[10px] font-bold tracking-[0.16em] uppercase">
                            STEP {index + 1}
                          </span>
                          <span className="font-display mt-1 block text-lg leading-tight tracking-tight sm:text-xl">
                            {step.title}
                          </span>
                          <span className="text-muted-foreground mt-1 block text-sm leading-5">
                            {step.description}
                          </span>
                        </span>
                      </CardContent>
                    </Card>
                    {index < investmentProcess.length - 1 ? (
                      <ArrowDown
                        aria-hidden="true"
                        className="text-gold size-5"
                      />
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="px-content mx-auto max-w-7xl pb-14 sm:pb-18 lg:pb-20">
            <Card className="bg-navy shadow-navy/10 relative isolate overflow-hidden border-0 text-white shadow-xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background:
                    "radial-gradient(ellipse at 84% 10%, rgba(212,175,55,.2), transparent 35%)",
                }}
              />
              <CardContent className="relative flex flex-col items-start justify-between gap-7 p-7 sm:p-10 lg:flex-row lg:items-center lg:p-12">
                <div className="max-w-2xl">
                  <p className="text-gold text-xs font-semibold tracking-[0.16em] uppercase">
                    START WITH A CONVERSATION
                  </p>
                  <h3 className="font-display mt-3 text-3xl leading-tight tracking-tight sm:text-4xl">
                    Start Your Investment Journey Today
                  </h3>
                </div>
                <Button asChild className="shrink-0" size="lg" variant="gold">
                  <Link href="/consultation">
                    Start Investing
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <ServicesComparison />
        <ServicesFAQ />

        <section className="px-content mx-auto max-w-7xl py-14 sm:py-18 lg:py-20">
          <Card className="bg-navy shadow-navy/10 relative isolate overflow-hidden border-0 text-white shadow-xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(ellipse at 85% 10%, rgba(212,175,55,.22), transparent 35%)",
              }}
            />
            <CardContent className="relative flex flex-col items-start justify-between gap-7 p-7 sm:p-10 lg:flex-row lg:items-center lg:p-12">
              <div className="max-w-2xl">
                <p className="text-gold text-xs font-semibold tracking-[0.16em] uppercase">
                  YOUR NEXT STEP STARTS HERE
                </p>
                <h2 className="font-display mt-3 text-3xl leading-tight tracking-tight sm:text-4xl">
                  Ready to Build Your Financial Future?
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                  Take the first step toward financial freedom with
                  WealthTogether Investments.
                </p>
              </div>
              <div className="flex w-full flex-wrap gap-3 lg:w-auto lg:shrink-0">
                <Button
                  asChild
                  className="flex-1 sm:flex-none"
                  size="lg"
                  variant="gold"
                >
                  <Link href="/consultation">
                    Book Consultation
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="flex-1 border-white/25 text-white hover:bg-white/10 sm:flex-none"
                  size="lg"
                  variant="outline"
                >
                  <Link href="/consultation">
                    Contact Us
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
