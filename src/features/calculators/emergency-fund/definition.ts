import { z } from "zod";

import type {
  CalculatorDefinition,
  CalculatorResult,
} from "@/features/calculators/types";

export const emergencyFundInputSchema = z.object({
  monthlyExpenses: z.number().positive().max(20_000_000),
  coverageMonths: z.enum(["3", "6", "9", "12"]),
  currentSavings: z.number().min(0).max(1_000_000_000),
  monthlySavings: z.number().positive().max(20_000_000),
});

export type EmergencyFundInputs = z.infer<typeof emergencyFundInputSchema>;

function formatGoalTimeline(months: number, alreadyFunded: boolean) {
  if (alreadyFunded) return "Goal reached";
  if (months > 50 * 12) return "More than 50 years";
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} months`;
  if (remainingMonths === 0) return `${years} years`;
  return `${years} years, ${remainingMonths} months`;
}

export function calculateEmergencyFund(
  values: EmergencyFundInputs,
): CalculatorResult {
  const targetMonths = Number(values.coverageMonths);
  const recommendedFund = values.monthlyExpenses * targetMonths;
  const remainingAmount = Math.max(0, recommendedFund - values.currentSavings);
  const monthsToGoal = Math.ceil(remainingAmount / values.monthlySavings);
  const alreadyFunded = remainingAmount === 0;
  const displayedMonths = Math.min(monthsToGoal, 50 * 12);
  const totalTimelineYears = Math.ceil(displayedMonths / 12);
  const currentCoverageMonths = values.currentSavings / values.monthlyExpenses;
  const progressPercent = Math.min(
    100,
    (values.currentSavings / recommendedFund) * 100,
  );

  const chartData: Array<Record<string, string | number>> = [
    {
      timeline: "Today",
      projectedFund: values.currentSavings,
      recommendedFund,
    },
  ];
  const timelineRows: Array<Record<string, string | number | null>> = [];
  for (let year = 1; year <= totalTimelineYears; year += 1) {
    const elapsedMonths = Math.min(year * 12, displayedMonths);
    const projectedFund =
      values.currentSavings + values.monthlySavings * elapsedMonths;
    const isGoalPoint = !alreadyFunded && elapsedMonths === monthsToGoal;
    const timelineLabel = isGoalPoint
      ? `Goal · ${formatGoalTimeline(monthsToGoal, false)}`
      : `Year ${year}`;
    chartData.push({ timeline: timelineLabel, projectedFund, recommendedFund });
    timelineRows.push({
      timeline: timelineLabel,
      monthlySavings: values.monthlySavings,
      contributionsToDate: values.monthlySavings * elapsedMonths,
      projectedFund,
      progressPercent: Math.min(1, projectedFund / recommendedFund),
    });
  }

  const chart = {
    title: "Emergency fund goal timeline",
    description:
      totalTimelineYears > 0 && monthsToGoal > 50 * 12
        ? "Projected fund value and recommended target across the next 50 years."
        : "Track your current savings and monthly additions toward the recommended fund.",
    xKey: "timeline",
    valueFormat: "currency" as const,
    currency: "INR",
    data: chartData,
    series: [
      {
        key: "projectedFund",
        label: "Projected emergency fund",
        color: "#4D78B8",
      },
      { key: "recommendedFund", label: "Recommended fund", color: "#D4AF37" },
    ],
    kind: "line" as const,
  };

  return {
    metrics: [
      {
        id: "recommended-fund",
        label: "Recommended emergency fund",
        value: recommendedFund,
        format: "currency",
        currency: "INR",
        detail: `${targetMonths} months of expenses`,
      },
      {
        id: "expenses-covered",
        label: "Current coverage",
        value: `${currentCoverageMonths.toFixed(1)} months`,
        format: "text",
        detail: `Based on monthly expenses of ₹${values.monthlyExpenses.toLocaleString("en-IN")}`,
      },
      {
        id: "remaining-amount",
        label: "Remaining to target",
        value: remainingAmount,
        format: "currency",
        currency: "INR",
        detail: `${progressPercent.toFixed(0)}% of your recommended fund is covered`,
      },
      {
        id: "goal-timeline",
        label: "Goal timeline",
        value: formatGoalTimeline(monthsToGoal, alreadyFunded),
        format: "text",
        detail: alreadyFunded
          ? "Your current savings meet the selected target"
          : monthsToGoal > 50 * 12
            ? `At ₹${values.monthlySavings.toLocaleString("en-IN")} saved each month`
            : `${monthsToGoal} monthly contributions at your selected savings amount`,
      },
    ],
    chart,
    yearTable: {
      title: "Savings timeline",
      description:
        "Projected emergency fund balance at each year or the goal date, whichever comes first.",
      columns: [
        { key: "timeline", label: "Timeline", format: "text" },
        {
          key: "monthlySavings",
          label: "Monthly savings",
          format: "currency",
          currency: "INR",
        },
        {
          key: "contributionsToDate",
          label: "Contributions to date",
          format: "currency",
          currency: "INR",
        },
        {
          key: "projectedFund",
          label: "Projected fund",
          format: "currency",
          currency: "INR",
        },
        { key: "progressPercent", label: "Goal progress", format: "percent" },
      ],
      rows: timelineRows,
    },
  };
}

export const emergencyFundCalculatorDefinition: CalculatorDefinition<EmergencyFundInputs> =
  {
    id: "emergency-fund-calculator",
    title: "Emergency Fund Calculator",
    description:
      "Set a practical cash reserve target based on your monthly expenses and see how long it may take to build.",
    schema: emergencyFundInputSchema,
    defaultValues: {
      monthlyExpenses: 60_000,
      coverageMonths: "6",
      currentSavings: 100_000,
      monthlySavings: 15_000,
    },
    fields: [
      {
        name: "monthlyExpenses",
        label: "Monthly expenses",
        type: "currency",
        description: "Essential household expenses to cover each month.",
        prefix: "₹",
        min: 1,
        max: 20_000_000,
        step: 1_000,
        wide: true,
      },
      {
        name: "coverageMonths",
        label: "Recommended coverage",
        type: "select",
        description: "Choose how many months of expenses to keep in reserve.",
        options: [
          { label: "3 months", value: "3" },
          { label: "6 months", value: "6" },
          { label: "9 months", value: "9" },
          { label: "12 months", value: "12" },
        ],
      },
      {
        name: "currentSavings",
        label: "Current emergency savings",
        type: "currency",
        description: "Liquid savings already set aside for emergencies.",
        prefix: "₹",
        min: 0,
        max: 1_000_000_000,
        step: 5_000,
        wide: true,
      },
      {
        name: "monthlySavings",
        label: "Monthly amount to save",
        type: "currency",
        description: "Amount you plan to add to the emergency fund each month.",
        prefix: "₹",
        min: 1,
        max: 20_000_000,
        step: 500,
        wide: true,
      },
    ],
    calculate: calculateEmergencyFund,
  };
