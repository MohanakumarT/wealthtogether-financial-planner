"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CircleHelp,
  FileHeart,
  HeartHandshake,
  LoaderCircle,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/ui/input-field";
import { NumberCard } from "@/components/ui/number-card";
import {
  familyProfileSeed,
  formatFamilyCurrency,
  type FamilyGoal,
  type FamilyInsurance,
  type FamilyProfile,
  type FamilyProfileId,
} from "@/features/family/model";
import { useFamilyFinance } from "@/features/family/use-family-finance";
import { usePortfolio } from "@/features/portfolio/use-portfolio";
import {
  formatPortfolioCurrency,
  getCategoryLabel,
  portfolioCategories,
} from "@/features/portfolio/model";
import type { PortfolioHolding } from "@/features/portfolio/model";

const goalTypes = [
  { value: "retirement", label: "Retirement" },
  { value: "education", label: "Education" },
  { value: "house", label: "House" },
  { value: "marriage", label: "Marriage" },
  { value: "car", label: "Car" },
  { value: "vacation", label: "Vacation" },
  { value: "emergency", label: "Emergency fund" },
  { value: "other", label: "Other" },
] as const;
const insuranceTypes = [
  { value: "health", label: "Health" },
  { value: "life", label: "Life" },
  { value: "vehicle", label: "Vehicle" },
  { value: "home", label: "Home" },
  { value: "other", label: "Other" },
] as const;
const chartTooltipContentStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--popover-foreground)",
};
const chartTooltipItemStyle = { color: "var(--popover-foreground)" };
const chartTooltipLabelStyle = { color: "var(--muted-foreground)" };

function money(value: number) {
  return formatFamilyCurrency(value);
}
function localDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function displayDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function pct(value: number) {
  return `${Math.round(value)}%`;
}

function getHoldingValue(holdings: PortfolioHolding[], id: FamilyProfileId) {
  return holdings
    .filter((holding) => holding.profileId === id)
    .reduce((sum, holding) => sum + holding.currentValue, 0);
}
function getProfileNetWorth(
  profile: FamilyProfile,
  holdings: PortfolioHolding[],
) {
  return (
    getHoldingValue(holdings, profile.id) +
    profile.emergencySavings +
    profile.otherAssets -
    profile.liabilities
  );
}

export function FamilyDashboard() {
  const family = useFamilyFinance();
  const portfolio = usePortfolio();
  const [selectedId, setSelectedId] = useState<FamilyProfileId>("self");
  const profiles = family.data.profiles;
  const activeProfile =
    profiles.find((profile) => profile.id === selectedId) ?? profiles[0];
  const allGoals = profiles.flatMap((profile) =>
    profile.goals.map((goal) => ({
      ...goal,
      profileId: profile.id,
      profileName: profile.name,
      profileColor:
        familyProfileSeed.find((seed) => seed.id === profile.id)?.color ??
        "#4D78B8",
    })),
  );
  const investmentAllocation = portfolioCategories
    .map((category) => ({
      category: category.value,
      label: category.label,
      color: category.color,
      amount: portfolio.holdings
        .filter((holding) => holding.category === category.value)
        .reduce((sum, holding) => sum + holding.currentValue, 0),
    }))
    .filter((category) => category.amount > 0);
  const emergencyAllocation = profiles.reduce(
    (sum, profile) => sum + profile.emergencySavings,
    0,
  );
  const otherAssetAllocation = profiles.reduce(
    (sum, profile) => sum + profile.otherAssets,
    0,
  );
  const allocation = [
    ...investmentAllocation,
    ...(emergencyAllocation > 0
      ? [
          {
            category: "emergency-reserves",
            label: "Emergency reserves",
            color: "#7A8FA9",
            amount: emergencyAllocation,
          },
        ]
      : []),
    ...(otherAssetAllocation > 0
      ? [
          {
            category: "other-assets",
            label: "Other assets",
            color: "#A879B6",
            amount: otherAssetAllocation,
          },
        ]
      : []),
  ];
  const activeHoldings = portfolio.holdings.filter(
    (holding) => holding.profileId === selectedId,
  );
  const familyNetWorth = profiles.reduce(
    (sum, profile) => sum + getProfileNetWorth(profile, portfolio.holdings),
    0,
  );
  const goalTarget = allGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const goalSaved = allGoals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const goalProgress = goalTarget > 0 ? (goalSaved / goalTarget) * 100 : 0;
  const retirementGoals = allGoals.filter((goal) => goal.type === "retirement");
  const retirementTarget = retirementGoals.reduce(
    (sum, goal) => sum + goal.targetAmount,
    0,
  );
  const retirementSaved = retirementGoals.reduce(
    (sum, goal) => sum + goal.savedAmount,
    0,
  );
  const retirementProgress =
    retirementTarget > 0
      ? Math.min(100, (retirementSaved / retirementTarget) * 100)
      : null;
  const memberGoalData = profiles
    .map((profile) => {
      const goals = profile.goals;
      const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
      const saved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
      return {
        name: profile.name,
        id: profile.id,
        color:
          familyProfileSeed.find((seed) => seed.id === profile.id)?.color ??
          "#4D78B8",
        progress: target ? Math.min(100, (saved / target) * 100) : 0,
        goalCount: goals.length,
      };
    })
    .filter((member) => member.goalCount > 0);
  const milestones = useMemo(() => {
    const today = localDate(new Date());
    const limit = new Date();
    limit.setFullYear(limit.getFullYear() + 1);
    const end = localDate(limit);
    const goals = profiles.flatMap((profile) =>
      profile.goals
        .filter((goal) => goal.targetDate >= today && goal.targetDate <= end)
        .map((goal) => ({
          id: `goal-${profile.id}-${goal.id}`,
          name: goal.name,
          member: profile.name,
          date: goal.targetDate,
          detail: `${goal.type[0]?.toUpperCase()}${goal.type.slice(1)} goal`,
          icon: FileHeart,
        })),
    );
    const renewals = profiles.flatMap((profile) =>
      profile.insurance
        .filter(
          (policy) =>
            policy.renewalDate &&
            policy.renewalDate >= today &&
            policy.renewalDate <= end,
        )
        .map((policy) => ({
          id: `policy-${profile.id}-${policy.id}`,
          name: policy.name,
          member: profile.name,
          date: policy.renewalDate,
          detail: "Insurance renewal",
          icon: Shield,
        })),
    );
    return [...goals, ...renewals]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [profiles]);

  if (!family.hydrated || !portfolio.hydrated)
    return (
      <div
        className="text-muted-foreground flex min-h-72 items-center justify-center gap-3 text-sm"
        role="status"
      >
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        Loading your family overview…
      </div>
    );

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            Plan as one family
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            Family financial dashboard
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
            See goals, coverage and investments across your household in one
            calm, clear view.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/portfolio">
            <WalletCards aria-hidden="true" className="size-4" />
            Manage investments
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </header>

      <div className="border-border bg-card text-muted-foreground rounded-xl border px-4 py-3 text-xs leading-5">
        <ShieldCheck
          aria-hidden="true"
          className="text-primary mr-2 inline size-4"
        />
        Family and portfolio details stay in local storage on this browser. They
        are not synced or encrypted by the app. Keep this browser account
        private.
      </div>
      {family.warning || portfolio.warning ? (
        <p
          className="border-border bg-secondary rounded-lg border px-4 py-3 text-sm"
          role="status"
        >
          {family.warning ?? portfolio.warning}
        </p>
      ) : null}
      {family.error || portfolio.error ? (
        <p
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm"
          role="alert"
        >
          {family.error ?? portfolio.error}
        </p>
      ) : null}

      <section
        aria-label="Family financial overview"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <NumberCard
          detail="Investments + savings + other assets − liabilities"
          icon={WalletCards}
          label="Combined family net worth"
          value={money(familyNetWorth)}
        />
        <NumberCard
          change={goalTarget ? pct(goalProgress) : undefined}
          changeDirection="neutral"
          detail={
            goalTarget
              ? `${money(goalSaved)} saved toward ${money(goalTarget)}`
              : "Add goals to see household progress"
          }
          icon={HeartHandshake}
          label="Goal progress"
          value={goalTarget ? pct(goalProgress) : "No goals yet"}
        />
        <NumberCard
          change={
            retirementProgress === null ? undefined : pct(retirementProgress)
          }
          changeDirection="neutral"
          detail={
            retirementProgress === null
              ? "Add a retirement goal for a progress view"
              : `${money(retirementSaved)} saved toward ${money(retirementTarget)}`
          }
          icon={BriefcaseBusiness}
          label="Retirement readiness"
          value={
            retirementProgress === null ? "Not set" : pct(retirementProgress)
          }
        />
        <NumberCard
          detail="Based on the emergency fund balances entered"
          icon={ShieldCheck}
          label="Emergency savings"
          value={money(
            profiles.reduce(
              (sum, profile) => sum + profile.emergencySavings,
              0,
            ),
          )}
        />
      </section>
      <p className="text-muted-foreground -mt-5 flex items-start gap-2 text-xs leading-5">
        <CircleHelp aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        Retirement readiness is a simple progress measure against goals you
        enter. It is not a retirement forecast or investment advice.
      </p>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">
                Family asset allocation
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Current assets entered across the family profiles
              </p>
            </div>
            <span className="bg-accent text-primary grid size-9 place-items-center rounded-xl">
              <WalletCards aria-hidden="true" className="size-4" />
            </span>
          </div>
          {allocation.length ? (
            <div className="mt-5 h-64">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    dataKey="amount"
                    nameKey="label"
                    innerRadius={54}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {allocation.map((item) => (
                      <Cell key={item.category} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipContentStyle}
                    formatter={(value) => money(Number(value))}
                    itemStyle={chartTooltipItemStyle}
                    labelStyle={chartTooltipLabelStyle}
                  />
                  <Legend
                    align="center"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-muted-foreground text-xs">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart
              icon={WalletCards}
              title="No investments to chart"
              body="Add a family holding in Portfolio tracker to see allocation here."
              link="/portfolio"
              linkLabel="Open portfolio"
            />
          )}
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">
                Goal progress by member
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Saved amount as a share of each member’s goal targets
              </p>
            </div>
            <span className="bg-accent text-primary grid size-9 place-items-center rounded-xl">
              <HeartHandshake aria-hidden="true" className="size-4" />
            </span>
          </div>
          {memberGoalData.length ? (
            <div className="mt-5 h-64">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart
                  data={memberGoalData}
                  layout="vertical"
                  margin={{ left: 0, right: 10, top: 4, bottom: 2 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={false}
                  />
                  <XAxis
                    domain={[0, 100]}
                    tickFormatter={(value: number) => `${value}%`}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    type="number"
                  />
                  <YAxis
                    dataKey="name"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    type="category"
                    width={72}
                  />
                  <Tooltip
                    contentStyle={chartTooltipContentStyle}
                    formatter={(value) => [
                      `${Number(value).toFixed(1)}%`,
                      "Goal progress",
                    ]}
                    itemStyle={chartTooltipItemStyle}
                    labelStyle={chartTooltipLabelStyle}
                  />
                  <Bar dataKey="progress" radius={[0, 6, 6, 0]}>
                    {memberGoalData.map((item) => (
                      <Cell fill={item.color} key={item.id} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart
              icon={HeartHandshake}
              title="Your goal map is ready"
              body="Add a goal to any profile to compare progress across the family."
              link="#family-profiles"
              linkLabel="Choose a profile"
            />
          )}
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <CalendarClock
                aria-hidden="true"
                className="text-primary size-4"
              />
              Upcoming milestones
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Goals and policy renewals in the next 12 months
            </p>
          </div>
          <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs">
            {milestones.length} scheduled
          </span>
        </div>
        {milestones.length ? (
          <ul className="bg-border grid gap-px sm:grid-cols-2 xl:grid-cols-4">
            {milestones.map((milestone) => (
              <li
                className="bg-card flex min-w-0 items-start gap-3 p-4 sm:p-5"
                key={milestone.id}
              >
                <span className="bg-accent text-primary grid size-9 shrink-0 place-items-center rounded-xl">
                  <milestone.icon aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {milestone.name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {milestone.member} · {milestone.detail}
                  </p>
                  <p className="text-primary mt-2 text-xs font-semibold">
                    {displayDate(milestone.date)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-7 text-center">
            <CalendarClock
              aria-hidden="true"
              className="text-muted-foreground/60 mx-auto size-6"
            />
            <p className="mt-3 text-sm font-medium">
              No milestones in the next 12 months
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Add a goal target date or policy renewal to see it here.
            </p>
          </div>
        )}
      </Card>

      <section
        aria-labelledby="family-profiles-title"
        className="space-y-4"
        id="family-profiles"
      >
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
            Household members
          </p>
          <h2
            className="font-display mt-2 text-2xl tracking-tight"
            id="family-profiles-title"
          >
            Profiles & finances
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Choose a profile to review goals, coverage, savings and investments.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {profiles.map((profile) => {
            const selected = profile.id === selectedId;
            const profileWorth = getProfileNetWorth(
              profile,
              portfolio.holdings,
            );
            return (
              <button
                aria-pressed={selected}
                className={`focus-visible:ring-ring rounded-2xl border p-4 text-left transition focus-visible:ring-2 focus-visible:outline-none ${selected ? "border-primary bg-accent/60 shadow-card" : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"}`}
                key={profile.id}
                onClick={() => setSelectedId(profile.id)}
                type="button"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">
                    {profile.name}
                  </span>
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: familyProfileSeed.find(
                        (seed) => seed.id === profile.id,
                      )?.color,
                    }}
                  />
                </span>
                <span className="text-muted-foreground mt-3 block text-[11px]">
                  Net worth
                </span>
                <span className="mt-1 block truncate text-sm font-semibold tabular-nums">
                  {money(profileWorth)}
                </span>
                <span className="text-muted-foreground mt-2 block text-[11px]">
                  {profile.goals.length} goals · {profile.insurance.length}{" "}
                  policies
                </span>
              </button>
            );
          })}
        </div>
        <FamilyProfilePanel
          key={activeProfile.id}
          profile={activeProfile}
          holdings={activeHoldings}
          netWorth={getProfileNetWorth(activeProfile, portfolio.holdings)}
          family={family}
        />
      </section>
    </div>
  );
}

function EmptyChart({
  icon: Icon,
  title,
  body,
  link,
  linkLabel,
}: {
  icon: typeof WalletCards;
  title: string;
  body: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
      <span className="bg-muted text-muted-foreground grid size-10 place-items-center rounded-xl">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-5">
        {body}
      </p>
      <Link
        className="text-primary mt-3 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
        href={link}
      >
        {linkLabel}
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </div>
  );
}

function FamilyProfilePanel({
  profile,
  holdings,
  netWorth,
  family,
}: {
  profile: FamilyProfile;
  holdings: PortfolioHolding[];
  netWorth: number;
  family: ReturnType<typeof useFamilyFinance>;
}) {
  const emergencyTarget = profile.monthlyExpenses * profile.emergencyFundMonths;
  const emergencyProgress =
    emergencyTarget > 0
      ? Math.min(100, (profile.emergencySavings / emergencyTarget) * 100)
      : 0;
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
      <div className="space-y-5">
        <ProfileDetailsForm
          onSave={(details) => family.updateProfile(profile.id, details)}
          profile={profile}
        />
        <section aria-labelledby="profile-goals-title">
          <Card className="overflow-hidden">
            <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
              <div>
                <h3
                  className="flex items-center gap-2 text-sm font-semibold"
                  id="profile-goals-title"
                >
                  <HeartHandshake
                    aria-hidden="true"
                    className="text-primary size-4"
                  />
                  Goals
                </h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Track target dates and current savings
                </p>
              </div>
              <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs">
                {profile.goals.length}
              </span>
            </div>
            <GoalManager
              goals={profile.goals}
              onAdd={(value) => family.addGoal(profile.id, value)}
              onDelete={(id) => family.removeGoal(profile.id, id)}
              onUpdate={(id, value) => family.updateGoal(profile.id, id, value)}
            />
          </Card>
        </section>
        <section aria-labelledby="profile-insurance-title">
          <Card className="overflow-hidden">
            <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
              <div>
                <h3
                  className="flex items-center gap-2 text-sm font-semibold"
                  id="profile-insurance-title"
                >
                  <Shield aria-hidden="true" className="text-primary size-4" />
                  Insurance
                </h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Keep coverage amounts and renewals in view
                </p>
              </div>
              <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs">
                {profile.insurance.length}
              </span>
            </div>
            <InsuranceManager
              policies={profile.insurance}
              onAdd={(value) => family.addInsurance(profile.id, value)}
              onDelete={(id) => family.removeInsurance(profile.id, id)}
              onUpdate={(id, value) =>
                family.updateInsurance(profile.id, id, value)
              }
            />
          </Card>
        </section>
      </div>
      <div className="space-y-5">
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Individual net worth
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                {money(netWorth)}
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <WalletCards aria-hidden="true" className="size-5" />
            </span>
          </div>
          <div className="border-border mt-5 space-y-2 border-t pt-4 text-xs">
            <BalanceRow
              label="Investment holdings"
              value={getHoldingValue(holdings, profile.id)}
            />
            <BalanceRow
              label="Emergency fund"
              value={profile.emergencySavings}
            />
            <BalanceRow label="Other assets" value={profile.otherAssets} />
            <BalanceRow label="Liabilities" value={-profile.liabilities} />
          </div>
          <p className="text-muted-foreground mt-4 text-[11px] leading-5">
            Emergency savings are included in net worth. Avoid recording the
            same cash again as a separate holding.
          </p>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Emergency fund
              </p>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {money(profile.emergencySavings)}{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  of {money(emergencyTarget)}
                </span>
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {profile.emergencyFundMonths} months of entered expenses
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
          </div>
          <div
            aria-label={`${Math.round(emergencyProgress)} percent of emergency fund target`}
            className="bg-muted mt-5 h-2 overflow-hidden rounded-full"
          >
            <div
              className="bg-gold h-full rounded-full transition-[width]"
              style={{ width: `${emergencyProgress}%` }}
            />
          </div>
          <div className="text-muted-foreground mt-2 flex justify-between text-[11px]">
            <span>{pct(emergencyProgress)} funded</span>
            <span>
              {emergencyTarget
                ? money(
                    Math.max(0, emergencyTarget - profile.emergencySavings),
                  ) + " to go"
                : "Enter monthly expenses"}
            </span>
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold">Investment holdings</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                {holdings.length} tracked for {profile.name}
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/portfolio">
                <Pencil aria-hidden="true" className="size-3.5" />
                Manage
              </Link>
            </Button>
          </div>
          {holdings.length ? (
            <ul className="divide-border divide-y">
              {holdings.slice(0, 8).map((holding) => (
                <li
                  className="flex items-center justify-between gap-3 px-5 py-3"
                  key={holding.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">
                      {holding.name}
                    </p>
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      {getCategoryLabel(holding.category)}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold tabular-nums">
                    {formatPortfolioCurrency(holding.currentValue)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-xs font-medium">
                No holdings linked to this profile
              </p>
              <Button asChild className="mt-3" size="sm" variant="ghost">
                <Link href="/portfolio">
                  Add an investment
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function BalanceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-medium tabular-nums ${value < 0 ? "text-destructive" : ""}`}
      >
        {money(Math.abs(value))}
        {value < 0 ? " −" : ""}
      </span>
    </div>
  );
}

function ProfileDetailsForm({
  profile,
  onSave,
}: {
  profile: FamilyProfile;
  onSave: (
    details: Partial<Omit<FamilyProfile, "id" | "goals" | "insurance">>,
  ) => boolean;
}) {
  const [name, setName] = useState(profile.name);
  const [monthly, setMonthly] = useState(String(profile.monthlyExpenses || ""));
  const [emergency, setEmergency] = useState(
    String(profile.emergencySavings || ""),
  );
  const [months, setMonths] = useState(String(profile.emergencyFundMonths));
  const [assets, setAssets] = useState(String(profile.otherAssets || ""));
  const [liabilities, setLiabilities] = useState(
    String(profile.liabilities || ""),
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const result = onSave({
      name,
      monthlyExpenses: Number(monthly || 0),
      emergencySavings: Number(emergency || 0),
      emergencyFundMonths: Number(months) as 3 | 6 | 9 | 12,
      otherAssets: Number(assets || 0),
      liabilities: Number(liabilities || 0),
    });
    setSaved(result);
    if (!result) setError("Review the profile values and try again.");
    window.setTimeout(() => setSaved(false), 3000);
  }
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold">Profile & balance sheet</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          Name, monthly costs and assets not tracked in the investment list
        </p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Family member name"
            maxLength={80}
            minLength={1}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <CurrencyInput
            label="Monthly expenses"
            onChange={setMonthly}
            value={monthly}
          />
          <CurrencyInput
            label="Emergency savings"
            onChange={setEmergency}
            value={emergency}
          />
          <label className="space-y-2 text-sm font-medium">
            Emergency fund target
            <select
              className="border-input bg-background text-foreground mt-2 h-11 w-full rounded-lg border px-3 text-sm"
              onChange={(event) => setMonths(event.target.value)}
              value={months}
            >
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="9">9 months</option>
              <option value="12">12 months</option>
            </select>
          </label>
          <CurrencyInput
            label="Other assets"
            hint="Exclude portfolio holdings and emergency savings above."
            onChange={setAssets}
            value={assets}
          />
          <CurrencyInput
            label="Liabilities"
            onChange={setLiabilities}
            value={liabilities}
          />
        </div>
        {error ? (
          <p className="text-destructive text-xs" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end">
          <Button
            size="sm"
            type="submit"
            variant={saved ? "secondary" : "gold"}
          >
            {saved ? <Check aria-hidden="true" className="size-4" /> : null}
            {saved ? "Saved" : "Save profile"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function CurrencyInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <InputField
      error={Number(value) < 0 ? "Enter zero or a positive amount." : undefined}
      hint={hint}
      label={label}
      leading="₹"
      max={Number.MAX_SAFE_INTEGER}
      min={0}
      onChange={(event) => onChange(event.target.value)}
      placeholder="0"
      step="any"
      type="number"
      value={value}
    />
  );
}

function GoalManager({
  goals,
  onAdd,
  onUpdate,
  onDelete,
}: {
  goals: FamilyGoal[];
  onAdd: (value: Omit<FamilyGoal, "id">) => boolean;
  onUpdate: (id: string, value: Omit<FamilyGoal, "id">) => boolean;
  onDelete: (id: string) => boolean;
}) {
  const [editing, setEditing] = useState<FamilyGoal | "new" | null>(null);
  return (
    <div>
      {goals.length ? (
        <ul className="divide-border divide-y">
          {goals.map((goal) => {
            const progress = Math.min(
              100,
              (goal.savedAmount / goal.targetAmount) * 100,
            );
            return (
              <li className="px-5 py-4 sm:px-6" key={goal.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {goal.name}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {
                        goalTypes.find((type) => type.value === goal.type)
                          ?.label
                      }{" "}
                      · Target {displayDate(goal.targetDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      aria-label={`Edit ${goal.name}`}
                      onClick={() => setEditing(goal)}
                      size="icon"
                      variant="ghost"
                    >
                      <Pencil aria-hidden="true" className="size-3.5" />
                    </Button>
                    <Button
                      aria-label={`Delete ${goal.name}`}
                      onClick={() => onDelete(goal.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2
                        aria-hidden="true"
                        className="text-destructive size-3.5"
                      />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span>{money(goal.savedAmount)} saved</span>
                  <span className="text-muted-foreground">
                    of {money(goal.targetAmount)}
                  </span>
                </div>
                <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground px-5 py-7 text-center text-xs">
          No goals recorded for this profile.
        </p>
      )}
      {editing ? (
        <GoalEditor
          initial={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSave={(value) => {
            const ok =
              editing === "new" ? onAdd(value) : onUpdate(editing.id, value);
            if (ok) setEditing(null);
          }}
          key={editing === "new" ? "new" : editing.id}
        />
      ) : (
        <div className="border-border border-t p-4">
          <Button onClick={() => setEditing("new")} size="sm" variant="outline">
            <Plus aria-hidden="true" className="size-4" />
            Add goal
          </Button>
        </div>
      )}
    </div>
  );
}

function GoalEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: FamilyGoal;
  onSave: (goal: Omit<FamilyGoal, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "retirement");
  const [target, setTarget] = useState(String(initial?.targetAmount ?? ""));
  const [saved, setSaved] = useState(String(initial?.savedAmount ?? ""));
  const [date, setDate] = useState(
    initial?.targetDate ??
      localDate(
        new Date(
          new Date().getFullYear() + 5,
          new Date().getMonth(),
          new Date().getDate(),
        ),
      ),
  );
  return (
    <form
      className="border-border bg-muted/30 space-y-3 border-t p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          name,
          type,
          targetAmount: Number(target),
          savedAmount: Number(saved || 0),
          targetDate: date,
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <InputField
          label="Goal name"
          maxLength={100}
          minLength={2}
          onChange={(event) => setName(event.target.value)}
          required
          value={name}
        />
        <label className="space-y-2 text-sm font-medium">
          Goal type
          <select
            className="border-input bg-background text-foreground mt-2 h-11 w-full rounded-lg border px-3 text-sm"
            onChange={(event) =>
              setType(event.target.value as FamilyGoal["type"])
            }
            value={type}
          >
            {goalTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <CurrencyInput
          label="Target amount"
          onChange={setTarget}
          value={target}
        />
        <CurrencyInput
          label="Already saved"
          onChange={setSaved}
          value={saved}
        />
        <InputField
          label="Target date"
          onChange={(event) => setDate(event.target.value)}
          required
          type="date"
          value={date}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
        <Button
          disabled={
            !name.trim() ||
            Number(target) <= 0 ||
            Number(saved || 0) < 0 ||
            !date
          }
          size="sm"
          type="submit"
          variant="gold"
        >
          {initial ? "Save goal" : "Add goal"}
        </Button>
      </div>
    </form>
  );
}

function InsuranceManager({
  policies,
  onAdd,
  onUpdate,
  onDelete,
}: {
  policies: FamilyInsurance[];
  onAdd: (value: Omit<FamilyInsurance, "id">) => boolean;
  onUpdate: (id: string, value: Omit<FamilyInsurance, "id">) => boolean;
  onDelete: (id: string) => boolean;
}) {
  const [editing, setEditing] = useState<FamilyInsurance | "new" | null>(null);
  return (
    <div>
      {policies.length ? (
        <ul className="divide-border divide-y">
          {policies.map((policy) => (
            <li
              className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6"
              key={policy.id}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{policy.name}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {
                    insuranceTypes.find((type) => type.value === policy.type)
                      ?.label
                  }{" "}
                  · Cover {money(policy.coverageAmount)} · Premium{" "}
                  {money(policy.annualPremium)}/yr
                  {policy.renewalDate
                    ? ` · Renews ${displayDate(policy.renewalDate)}`
                    : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  aria-label={`Edit ${policy.name}`}
                  onClick={() => setEditing(policy)}
                  size="icon"
                  variant="ghost"
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                </Button>
                <Button
                  aria-label={`Delete ${policy.name}`}
                  onClick={() => onDelete(policy.id)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2
                    aria-hidden="true"
                    className="text-destructive size-3.5"
                  />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground px-5 py-7 text-center text-xs">
          No insurance details recorded for this profile.
        </p>
      )}
      {editing ? (
        <InsuranceEditor
          initial={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSave={(value) => {
            const ok =
              editing === "new" ? onAdd(value) : onUpdate(editing.id, value);
            if (ok) setEditing(null);
          }}
          key={editing === "new" ? "new-policy" : editing.id}
        />
      ) : (
        <div className="border-border border-t p-4">
          <Button onClick={() => setEditing("new")} size="sm" variant="outline">
            <Plus aria-hidden="true" className="size-4" />
            Add coverage
          </Button>
        </div>
      )}
    </div>
  );
}

function InsuranceEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: FamilyInsurance;
  onSave: (policy: Omit<FamilyInsurance, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "health");
  const [coverage, setCoverage] = useState(
    String(initial?.coverageAmount ?? ""),
  );
  const [premium, setPremium] = useState(String(initial?.annualPremium ?? ""));
  const [renewal, setRenewal] = useState(initial?.renewalDate ?? "");
  return (
    <form
      className="border-border bg-muted/30 space-y-3 border-t p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          name,
          type,
          coverageAmount: Number(coverage || 0),
          annualPremium: Number(premium || 0),
          renewalDate: renewal,
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <InputField
          label="Policy name"
          maxLength={100}
          minLength={2}
          onChange={(event) => setName(event.target.value)}
          required
          value={name}
        />
        <label className="space-y-2 text-sm font-medium">
          Coverage type
          <select
            className="border-input bg-background text-foreground mt-2 h-11 w-full rounded-lg border px-3 text-sm"
            onChange={(event) =>
              setType(event.target.value as FamilyInsurance["type"])
            }
            value={type}
          >
            {insuranceTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <CurrencyInput
          label="Coverage amount"
          onChange={setCoverage}
          value={coverage}
        />
        <CurrencyInput
          label="Annual premium"
          onChange={setPremium}
          value={premium}
        />
        <InputField
          label="Renewal date (optional)"
          onChange={(event) => setRenewal(event.target.value)}
          type="date"
          value={renewal}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
        <Button
          disabled={
            !name.trim() ||
            Number(coverage || 0) < 0 ||
            Number(premium || 0) < 0
          }
          size="sm"
          type="submit"
          variant="gold"
        >
          {initial ? "Save policy" : "Add policy"}
        </Button>
      </div>
    </form>
  );
}
