import type { FamilyFinanceDocument } from "@/features/family/model";
import { familyProfileLabel } from "@/features/family/model";
import type { PortfolioHolding } from "@/features/portfolio/model";
import type { UserProfile } from "@/lib/auth/types";

export type PlanningGoal = {
  id: string;
  owner: string;
  title: string;
  type: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  progress: number;
};

export type PlanningSnapshot = {
  age: number | null;
  monthlyIncome: number;
  monthlyExpenses: number;
  estimatedMonthlySavings: number | null;
  savingsRate: number | null;
  currentMonthlySip: number;
  riskProfile: string;
  emergencySavings: number;
  emergencyFundMonths: number | null;
  investedAmount: number;
  portfolioValue: number;
  portfolioGainLoss: number;
  portfolioByCategory: Array<{ category: string; currentValue: number }>;
  goals: PlanningGoal[];
  overallGoalProgress: number | null;
  retirementGoalProgress: number | null;
  retirementGoal: PlanningGoal | null;
  investmentDiscipline: {
    status: string;
    explanation: string;
  };
};

/** A minimized, name-free snapshot intended for an explicit AI sharing opt-in. */
export function buildShareablePlanningSnapshot(snapshot: PlanningSnapshot) {
  return {
    age: snapshot.age,
    monthlyIncome: snapshot.monthlyIncome,
    monthlyExpenses: snapshot.monthlyExpenses,
    estimatedMonthlySavings: snapshot.estimatedMonthlySavings,
    savingsRate: snapshot.savingsRate,
    currentMonthlySip: snapshot.currentMonthlySip,
    riskProfile: snapshot.riskProfile,
    emergencySavings: snapshot.emergencySavings,
    emergencyFundMonths: snapshot.emergencyFundMonths,
    investedAmount: snapshot.investedAmount,
    portfolioValue: snapshot.portfolioValue,
    portfolioGainLoss: snapshot.portfolioGainLoss,
    portfolioByCategory: snapshot.portfolioByCategory,
    goals: snapshot.goals.map((goal) => ({
      type: goal.type,
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount,
      targetDate: goal.targetDate,
      progress: goal.progress,
    })),
    overallGoalProgress: snapshot.overallGoalProgress,
    retirementGoalProgress: snapshot.retirementGoalProgress,
    investmentDiscipline: snapshot.investmentDiscipline,
  };
}

function getAge(dob: string | null) {
  if (!dob) return null;
  const [year, month, day] = dob.split("-").map(Number);
  if (!year || !month || !day) return null;
  const now = new Date();
  let age = now.getFullYear() - year;
  if (
    now.getMonth() + 1 < month ||
    (now.getMonth() + 1 === month && now.getDate() < day)
  ) {
    age -= 1;
  }
  return age >= 0 && age <= 120 ? age : null;
}

export function buildPlanningSnapshot(
  profile: UserProfile,
  family: FamilyFinanceDocument,
  holdings: PortfolioHolding[],
): PlanningSnapshot {
  const self = family.profiles.find((item) => item.id === "self");
  const goals = family.profiles.flatMap((person) =>
    person.goals.map((goal) => ({
      id: `${person.id}:${goal.id}`,
      owner: familyProfileLabel(person.id, family.profiles),
      title: goal.name,
      type: goal.type,
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount,
      targetDate: goal.targetDate,
      progress: Math.min(100, (goal.savedAmount / goal.targetAmount) * 100),
    })),
  );
  const investedAmount = holdings.reduce(
    (total, holding) => total + holding.investedAmount,
    0,
  );
  const portfolioValue = holdings.reduce(
    (total, holding) => total + holding.currentValue,
    0,
  );
  const categories = new Map<string, number>();
  for (const holding of holdings) {
    categories.set(
      holding.category,
      (categories.get(holding.category) ?? 0) + holding.currentValue,
    );
  }

  const monthlyIncome = Number(profile.monthly_income) || 0;
  const monthlyExpenses = self?.monthlyExpenses ?? 0;
  const hasIncomeAndExpenses = monthlyIncome > 0 && monthlyExpenses > 0;
  const estimatedMonthlySavings = hasIncomeAndExpenses
    ? monthlyIncome - monthlyExpenses
    : null;
  const savingsRate = hasIncomeAndExpenses
    ? (monthlyIncome - monthlyExpenses) / monthlyIncome
    : null;
  const emergencySavings = self?.emergencySavings ?? 0;
  const emergencyFundMonths =
    monthlyExpenses > 0 ? emergencySavings / monthlyExpenses : null;
  const retirementGoal =
    goals.find((goal) => goal.type === "retirement") ?? null;
  const totalTarget = goals.reduce(
    (total, goal) => total + goal.targetAmount,
    0,
  );
  const totalSaved = goals.reduce((total, goal) => total + goal.savedAmount, 0);
  const hasRecurringContribution = Number(profile.current_monthly_sip) > 0;

  return {
    age: getAge(profile.dob),
    monthlyIncome,
    monthlyExpenses,
    estimatedMonthlySavings,
    savingsRate,
    currentMonthlySip: Number(profile.current_monthly_sip) || 0,
    riskProfile: profile.risk_profile ?? "not_assessed",
    emergencySavings,
    emergencyFundMonths,
    investedAmount,
    portfolioValue,
    portfolioGainLoss: portfolioValue - investedAmount,
    portfolioByCategory: Array.from(categories, ([category, currentValue]) => ({
      category,
      currentValue,
    })),
    goals,
    overallGoalProgress:
      totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : null,
    retirementGoalProgress: retirementGoal?.progress ?? null,
    retirementGoal,
    investmentDiscipline: hasRecurringContribution
      ? {
          status: "Contribution recorded",
          explanation:
            "A monthly SIP amount is recorded. A single amount cannot show whether contributions have been consistent over time.",
        }
      : {
          status: "Not enough history",
          explanation:
            "Add your current monthly SIP in your profile to include a recurring contribution in planning illustrations.",
        },
  };
}

export function projectCorpus(
  currentPortfolio: number,
  monthlySip: number,
  years: number,
  annualReturnPercent: number,
) {
  const months = Math.max(0, Math.round(years * 12));
  const annualRate = Math.max(-99, annualReturnPercent) / 100;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  if (months === 0) return currentPortfolio;
  if (monthlyRate === 0) return currentPortfolio + monthlySip * months;
  const growth = Math.pow(1 + monthlyRate, months);
  return currentPortfolio * growth + monthlySip * ((growth - 1) / monthlyRate);
}

export function futureGoalCost(
  amountToday: number,
  years: number,
  inflationPercent: number,
) {
  return (
    amountToday * Math.pow(1 + Math.max(-99, inflationPercent) / 100, years)
  );
}

export type ScenarioResult = {
  name: string;
  corpus: number;
  goalCost: number;
  difference: number;
  years: number;
  sip: number;
  annualReturn: number;
  inflation: number;
};

export function buildScenarioComparison(
  snapshot: PlanningSnapshot,
  goal: PlanningGoal | null,
  years: number,
  annualReturn: number,
  inflation: number,
): ScenarioResult[] {
  const target = goal?.targetAmount ?? 0;
  const scenarios = [
    {
      name: "Current assumptions",
      years,
      sip: snapshot.currentMonthlySip,
      annualReturn,
      inflation,
    },
    {
      name: "Monthly SIP +10%",
      years,
      sip: snapshot.currentMonthlySip * 1.1,
      annualReturn,
      inflation,
    },
    {
      name: "Goal timeline +2 years",
      years: Math.min(50, years + 2),
      sip: snapshot.currentMonthlySip,
      annualReturn,
      inflation,
    },
    {
      name: "Return assumption +1 pp",
      years,
      sip: snapshot.currentMonthlySip,
      annualReturn: annualReturn + 1,
      inflation,
    },
    {
      name: "Inflation assumption +1 pp",
      years,
      sip: snapshot.currentMonthlySip,
      annualReturn,
      inflation: inflation + 1,
    },
  ];
  return scenarios.map((scenario) => {
    const corpus = projectCorpus(
      snapshot.portfolioValue,
      scenario.sip,
      scenario.years,
      scenario.annualReturn,
    );
    const goalCost = futureGoalCost(target, scenario.years, scenario.inflation);
    return {
      ...scenario,
      corpus,
      goalCost,
      difference: corpus - goalCost,
    };
  });
}

export const suggestedQuestions = [
  "How much SIP do I need?",
  "Explain inflation",
  "Explain XIRR",
  "Explain CAGR",
  "How can I retire early?",
  "Should I increase my SIP?",
];

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatCompactMoney = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
