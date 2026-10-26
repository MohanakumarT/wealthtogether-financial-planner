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

export const housePurchaseInputSchema = z.object({
  houseCost: z.number().positive().max(1_000_000_000),
  downPaymentPercent: z.number().min(5).max(100),
  inflation: z.number().min(0).max(20),
  years: z.number().int().min(1).max(50),
  expectedReturn: z.number().min(0).max(30),
  currentSavings: z.number().min(0).max(1_000_000_000),
});

export type HousePurchaseInputs = z.infer<typeof housePurchaseInputSchema>;

export function calculateHousePurchase(
  values: HousePurchaseInputs,
): CalculatorResult {
  const monthlyRate = values.expectedReturn / 100 / 12;
  const inflationRate = values.inflation / 100;
  const months = values.years * 12;
  const futureCost = futureValueAtAnnualRate(
    values.houseCost,
    inflationRate,
    values.years,
  );
  const downPaymentGoal = futureCost * (values.downPaymentPercent / 100);
  const projectedCurrentSavings = projectMonthlyBalance(
    values.currentSavings,
    0,
    monthlyRate,
    months,
  );

  const requiredSIP = requiredMonthlyContribution(
    downPaymentGoal,
    projectedCurrentSavings,
    monthlyRate,
    months,
  );
  const goalProgress =
    downPaymentGoal === 0
      ? 100
      : Math.min(100, (projectedCurrentSavings / downPaymentGoal) * 100);

  const chartData: Array<Record<string, string | number>> = [];
  const timelineRows: Array<Record<string, string | number | null>> = [];
  for (let year = 0; year <= values.years; year += 1) {
    const futureHouseCost = futureValueAtAnnualRate(
      values.houseCost,
      inflationRate,
      year,
    );
    const annualDownPayment =
      futureHouseCost * (values.downPaymentPercent / 100);
    const projectedCorpus = projectMonthlyBalance(
      values.currentSavings,
      requiredSIP,
      monthlyRate,
      year * 12,
    );
    chartData.push({
      year,
      projectedCorpus,
      downPaymentGoal: annualDownPayment,
    });
    if (year === 0) continue;
    timelineRows.push({
      year: `Year ${year}`,
      futureHouseCost,
      downPaymentGoal: annualDownPayment,
      projectedCorpus,
      annualSIP: requiredSIP * 12,
    });
  }

  const chart = {
    title: "Your home savings timeline",
    description:
      "See how a monthly SIP could grow toward the inflation-adjusted down payment goal.",
    xKey: "year",
    valueFormat: "currency" as const,
    currency: "INR",
    data: chartData,
    series: [
      { key: "projectedCorpus", label: "Projected savings", color: "#4D78B8" },
      { key: "downPaymentGoal", label: "Down payment goal", color: "#D4AF37" },
    ],
    kind: "area" as const,
  };

  return {
    metrics: [
      {
        id: "future-house-cost",
        label: "Future house cost",
        value: futureCost,
        format: "currency",
        currency: "INR",
        detail: `In ${values.years} years, based on ${values.inflation}% annual inflation`,
      },
      {
        id: "required-sip",
        label: "Required monthly SIP",
        value: requiredSIP,
        format: "currency",
        currency: "INR",
        detail: `Targets a ${values.downPaymentPercent}% down payment`,
      },
      {
        id: "goal-progress",
        label: "Goal progress",
        value: `${goalProgress.toFixed(0)}%`,
        format: "text",
        detail: `Current savings projected to cover ${((projectedCurrentSavings / downPaymentGoal) * 100).toFixed(0)}% of the future down payment`,
      },
      {
        id: "down-payment-corpus",
        label: "Down payment corpus",
        value: downPaymentGoal,
        format: "currency",
        currency: "INR",
        detail: `${values.downPaymentPercent}% of the estimated future house cost`,
      },
    ],
    chart,
    yearTable: {
      title: "Home purchase goal timeline",
      description:
        "Projected house cost, down payment target, and savings path at each year of the plan.",
      columns: [
        { key: "year", label: "Timeline", format: "text" },
        {
          key: "futureHouseCost",
          label: "Estimated house cost",
          format: "currency",
          currency: "INR",
        },
        {
          key: "downPaymentGoal",
          label: "Down payment goal",
          format: "currency",
          currency: "INR",
        },
        {
          key: "annualSIP",
          label: "Annual SIP",
          format: "currency",
          currency: "INR",
        },
        {
          key: "projectedCorpus",
          label: "Projected corpus",
          format: "currency",
          currency: "INR",
        },
      ],
      rows: timelineRows,
    },
  };
}

export const housePurchaseCalculatorDefinition: CalculatorDefinition<HousePurchaseInputs> =
  {
    id: "house-purchase-planner",
    title: "House Purchase Planner",
    description:
      "Estimate what a home may cost in the future and plan a monthly SIP toward its down payment.",
    schema: housePurchaseInputSchema,
    defaultValues: {
      houseCost: 8_000_000,
      downPaymentPercent: 20,
      inflation: 6,
      years: 8,
      expectedReturn: 10,
      currentSavings: 500_000,
    },
    fields: [
      {
        name: "houseCost",
        label: "House cost today",
        type: "currency",
        description: "Estimated purchase price in today’s money.",
        prefix: "₹",
        min: 1,
        max: 1_000_000_000,
        step: 100_000,
        wide: true,
      },
      {
        name: "downPaymentPercent",
        label: "Down payment",
        type: "percentage",
        description: "Percentage of the estimated future house cost.",
        suffix: "%",
        min: 5,
        max: 100,
        step: 1,
      },
      {
        name: "inflation",
        label: "House price inflation",
        type: "percentage",
        description: "Annual increase in the estimated house price.",
        suffix: "% p.a.",
        min: 0,
        max: 20,
        step: 0.1,
      },
      {
        name: "years",
        label: "Years until purchase",
        type: "number",
        suffix: "years",
        min: 1,
        max: 50,
        step: 1,
      },
      {
        name: "expectedReturn",
        label: "Expected return",
        type: "percentage",
        description: "Illustrative return, compounded monthly.",
        suffix: "% p.a.",
        min: 0,
        max: 30,
        step: 0.1,
      },
      {
        name: "currentSavings",
        label: "Current house savings",
        type: "currency",
        description: "Existing savings dedicated to this down payment.",
        prefix: "₹",
        min: 0,
        max: 1_000_000_000,
        step: 10_000,
        wide: true,
      },
    ],
    calculate: calculateHousePurchase,
  };
