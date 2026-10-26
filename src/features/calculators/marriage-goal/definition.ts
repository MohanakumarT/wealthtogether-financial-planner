import { z } from "zod";

import type {
  CalculatorDefinition,
  CalculatorResult,
} from "@/features/calculators/types";
import {
  futureValueAtAnnualRate,
  projectMonthlyBalance,
  requiredMonthlyContribution,
} from "@/features/calculators/finance";

export const marriageGoalInputSchema = z.object({
  currentCost: z.number().positive().max(100_000_000),
  yearsUntilGoal: z.number().int().min(1).max(40),
  inflation: z.number().min(0).max(20),
  expectedReturn: z.number().min(0).max(30),
  currentSavings: z.number().min(0).max(1_000_000_000),
});

export type MarriageGoalInputs = z.infer<typeof marriageGoalInputSchema>;

export function calculateMarriageGoal(
  values: MarriageGoalInputs,
): CalculatorResult {
  const years = values.yearsUntilGoal;
  const months = years * 12;
  const monthlyRate = values.expectedReturn / 100 / 12;
  const inflationRate = values.inflation / 100;
  const futureMarriageCost = futureValueAtAnnualRate(
    values.currentCost,
    inflationRate,
    years,
  );
  const futureExistingSavings = projectMonthlyBalance(
    values.currentSavings,
    0,
    monthlyRate,
    months,
  );

  const requiredSIP = requiredMonthlyContribution(
    futureMarriageCost,
    futureExistingSavings,
    monthlyRate,
    months,
  );
  const goalProgress = Math.min(
    100,
    (futureExistingSavings / futureMarriageCost) * 100,
  );

  const chartData: Array<Record<string, string | number>> = [];
  const timelineRows: Array<Record<string, string | number | null>> = [];
  for (let year = 0; year <= years; year += 1) {
    const projectedCorpus = projectMonthlyBalance(
      values.currentSavings,
      requiredSIP,
      monthlyRate,
      year * 12,
    );
    const projectedCost = futureValueAtAnnualRate(
      values.currentCost,
      inflationRate,
      year,
    );
    chartData.push({ year, projectedCorpus, projectedCost });
    if (year === 0) continue;
    timelineRows.push({
      year: `Year ${year}`,
      annualSIP: requiredSIP * 12,
      totalContributions: requiredSIP * year * 12,
      projectedCorpus,
      projectedCost,
    });
  }

  const chart = {
    title: "Your marriage goal timeline",
    description:
      "Track your projected savings against the estimated cost as it rises with inflation.",
    xKey: "year",
    valueFormat: "currency" as const,
    currency: "INR",
    data: chartData,
    series: [
      { key: "projectedCorpus", label: "Projected corpus", color: "#4D78B8" },
      { key: "projectedCost", label: "Future goal cost", color: "#D4AF37" },
    ],
    kind: "area" as const,
  };

  return {
    metrics: [
      {
        id: "future-marriage-cost",
        label: "Future marriage cost",
        value: futureMarriageCost,
        format: "currency",
        currency: "INR",
        detail: `In ${years} years, based on ${values.inflation}% annual inflation`,
      },
      {
        id: "required-sip",
        label: "Required monthly SIP",
        value: requiredSIP,
        format: "currency",
        currency: "INR",
        detail: "Estimated contribution from now until your goal date",
      },
      {
        id: "planned-contributions",
        label: "Planned contributions",
        value: requiredSIP * months,
        format: "currency",
        currency: "INR",
        detail: `Over ${years} years, excluding investment growth`,
      },
      {
        id: "goal-progress",
        label: "Goal progress",
        value: `${goalProgress.toFixed(0)}%`,
        format: "text",
        detail: `Current savings projected to cover ${((futureExistingSavings / futureMarriageCost) * 100).toFixed(0)}% of the future goal`,
      },
    ],
    chart,
    yearTable: {
      title: "Marriage goal timeline",
      description:
        "Annual SIP contributions and projected corpus compared with the inflation-adjusted goal cost.",
      columns: [
        { key: "year", label: "Timeline", format: "text" },
        {
          key: "annualSIP",
          label: "Annual SIP",
          format: "currency",
          currency: "INR",
        },
        {
          key: "totalContributions",
          label: "Total contributions",
          format: "currency",
          currency: "INR",
        },
        {
          key: "projectedCorpus",
          label: "Projected corpus",
          format: "currency",
          currency: "INR",
        },
        {
          key: "projectedCost",
          label: "Estimated goal cost",
          format: "currency",
          currency: "INR",
        },
      ],
      rows: timelineRows,
    },
  };
}

export const marriageGoalCalculatorDefinition: CalculatorDefinition<MarriageGoalInputs> =
  {
    id: "marriage-goal-planner",
    title: "Marriage Goal Planner",
    description:
      "Estimate the future cost of a marriage goal and the monthly SIP that could help you prepare for it.",
    schema: marriageGoalInputSchema,
    defaultValues: {
      currentCost: 2_000_000,
      yearsUntilGoal: 10,
      inflation: 6,
      expectedReturn: 10,
      currentSavings: 100_000,
    },
    fields: [
      {
        name: "currentCost",
        label: "Estimated cost today",
        type: "currency",
        description: "Your current estimate for the full goal cost.",
        prefix: "₹",
        min: 1,
        max: 100_000_000,
        step: 10_000,
        wide: true,
      },
      {
        name: "yearsUntilGoal",
        label: "Years until goal",
        type: "number",
        description: "When you expect to use the savings.",
        suffix: "years",
        min: 1,
        max: 40,
        step: 1,
      },
      {
        name: "inflation",
        label: "Annual cost inflation",
        type: "percentage",
        description: "Annual increase in the estimated goal cost.",
        suffix: "% p.a.",
        min: 0,
        max: 20,
        step: 0.1,
      },
      {
        name: "expectedReturn",
        label: "Expected return",
        type: "percentage",
        description:
          "Illustrative return for your goal savings, compounded monthly.",
        suffix: "% p.a.",
        min: 0,
        max: 30,
        step: 0.1,
      },
      {
        name: "currentSavings",
        label: "Current goal savings",
        type: "currency",
        description: "Existing savings dedicated to this goal.",
        prefix: "₹",
        min: 0,
        max: 1_000_000_000,
        step: 10_000,
        wide: true,
      },
    ],
    calculate: calculateMarriageGoal,
  };
