import { z } from "zod";

import type {
  CalculatorDefinition,
  CalculatorResult,
  CalculatorYearTable,
} from "@/features/calculators/types";
import {
  futureValueAtAnnualRate,
  projectMonthlyBalance,
  requiredMonthlyContribution,
} from "@/features/calculators/finance";

export const retirementInputSchema = z
  .object({
    currentAge: z.number().int().min(18).max(70),
    retirementAge: z.number().int().min(19).max(80),
    monthlyExpenses: z.number().positive().max(10_000_000),
    inflation: z.number().min(0).max(20),
    expectedReturn: z.number().min(0).max(30),
    retirementYears: z.number().int().min(1).max(50),
    currentSavings: z.number().min(0).max(1_000_000_000),
    monthlyContribution: z.number().min(0).max(10_000_000),
  })
  .superRefine((values, context) => {
    if (values.retirementAge <= values.currentAge) {
      context.addIssue({
        code: "custom",
        message: "Retirement age must be greater than current age.",
        path: ["retirementAge"],
      });
    }
  });

export type RetirementInputs = z.infer<typeof retirementInputSchema>;

export function calculateRetirement(
  values: RetirementInputs,
): CalculatorResult {
  const yearsToRetirement = values.retirementAge - values.currentAge;
  const monthsToRetirement = yearsToRetirement * 12;
  const retirementMonths = values.retirementYears * 12;
  const monthlyRate = values.expectedReturn / 100 / 12;
  const inflationRate = values.inflation / 100;
  const futureMonthlyExpense = futureValueAtAnnualRate(
    values.monthlyExpenses,
    inflationRate,
    yearsToRetirement,
  );

  let requiredCorpus = 0;
  for (let month = 0; month < retirementMonths; month += 1) {
    const expense =
      futureMonthlyExpense * (1 + inflationRate) ** Math.floor(month / 12);
    requiredCorpus += expense / (1 + monthlyRate) ** month;
  }

  const projectedCurrentSavings = projectMonthlyBalance(
    values.currentSavings,
    values.monthlyContribution,
    monthlyRate,
    monthsToRetirement,
  );
  const additionalMonthlySIP = requiredMonthlyContribution(
    requiredCorpus,
    projectedCurrentSavings,
    monthlyRate,
    monthsToRetirement,
  );
  const retirementScore =
    requiredCorpus === 0
      ? 100
      : Math.min(100, (projectedCurrentSavings / requiredCorpus) * 100);

  const savingsRows: Array<Record<string, string | number | null>> = [];
  const savingsChartData: Array<Record<string, string | number>> = [];
  for (let year = 0; year <= yearsToRetirement; year += 1) {
    const projected = projectMonthlyBalance(
      values.currentSavings,
      values.monthlyContribution,
      monthlyRate,
      year * 12,
    );
    const planned = projectMonthlyBalance(
      values.currentSavings,
      values.monthlyContribution + additionalMonthlySIP,
      monthlyRate,
      year * 12,
    );
    savingsChartData.push({
      year,
      currentProjection: projected,
      plannedProjection: planned,
      requiredCorpus,
    });
    if (year === 0) continue;
    savingsRows.push({
      year: `Year ${year}`,
      age: values.currentAge + year,
      currentAnnualContribution: values.monthlyContribution * 12,
      plannedAnnualContribution:
        (values.monthlyContribution + additionalMonthlySIP) * 12,
      currentProjection: projected,
      plannedProjection: planned,
      requiredCorpus,
    });
  }

  let retirementBalance = projectMonthlyBalance(
    values.currentSavings,
    values.monthlyContribution + additionalMonthlySIP,
    monthlyRate,
    monthsToRetirement,
  );
  const retirementRows: Array<Record<string, string | number | null>> = [];
  const drawdownChartData: Array<Record<string, string | number>> = [
    {
      year: 0,
      corpus: retirementBalance,
      annualExpenses: futureMonthlyExpense * 12,
    },
  ];
  for (let year = 1; year <= values.retirementYears; year += 1) {
    const annualExpenses =
      futureMonthlyExpense * (1 + inflationRate) ** (year - 1) * 12;
    const startingBalance = retirementBalance;
    for (let month = 0; month < 12; month += 1) {
      const monthlyExpense =
        futureMonthlyExpense * (1 + inflationRate) ** (year - 1);
      retirementBalance = Math.max(0, retirementBalance - monthlyExpense);
      retirementBalance *= 1 + monthlyRate;
    }
    drawdownChartData.push({ year, corpus: retirementBalance, annualExpenses });
    retirementRows.push({
      year: `Retirement ${year}`,
      age: values.retirementAge + year - 1,
      annualExpenses,
      startingCorpus: startingBalance,
      endingCorpus: retirementBalance,
    });
  }

  const accumulationTable: CalculatorYearTable = {
    title: "Savings timeline to retirement",
    description:
      "Compare your current savings path with the path that includes the recommended additional SIP and the estimated corpus target.",
    columns: [
      { key: "year", label: "Timeline", format: "text" },
      { key: "age", label: "Age", format: "number" },
      {
        key: "currentAnnualContribution",
        label: "Current annual contribution",
        format: "currency",
        currency: "INR",
      },
      {
        key: "plannedAnnualContribution",
        label: "Planned annual contribution",
        format: "currency",
        currency: "INR",
      },
      {
        key: "currentProjection",
        label: "Current plan",
        format: "currency",
        currency: "INR",
      },
      {
        key: "plannedProjection",
        label: "With recommended SIP",
        format: "currency",
        currency: "INR",
      },
      {
        key: "requiredCorpus",
        label: "Corpus target",
        format: "currency",
        currency: "INR",
      },
    ],
    rows: savingsRows,
  };
  const retirementTable: CalculatorYearTable = {
    title: "Retirement drawdown timeline",
    description:
      "Illustrative annual withdrawals and remaining corpus during retirement, assuming the recommended SIP is followed until retirement.",
    columns: [
      { key: "year", label: "Timeline", format: "text" },
      { key: "age", label: "Age", format: "number" },
      {
        key: "annualExpenses",
        label: "Annual expenses",
        format: "currency",
        currency: "INR",
      },
      {
        key: "startingCorpus",
        label: "Starting corpus",
        format: "currency",
        currency: "INR",
      },
      {
        key: "endingCorpus",
        label: "Estimated remaining",
        format: "currency",
        currency: "INR",
      },
    ],
    rows: retirementRows,
  };
  const accumulationChart = {
    title: "Build your retirement corpus",
    description:
      "Compare projected existing savings and contributions with the estimated corpus target.",
    xKey: "year",
    valueFormat: "currency" as const,
    currency: "INR",
    data: savingsChartData,
    series: [
      { key: "currentProjection", label: "Current plan", color: "#4D78B8" },
      {
        key: "plannedProjection",
        label: "With recommended SIP",
        color: "#4D9273",
      },
      { key: "requiredCorpus", label: "Corpus target", color: "#D4AF37" },
    ],
    kind: "area" as const,
  };
  const drawdownChart = {
    title: "Retirement spending timeline",
    description:
      "Estimated corpus balance after inflation-adjusted withdrawals during retirement.",
    xKey: "year",
    valueFormat: "currency" as const,
    currency: "INR",
    data: drawdownChartData,
    series: [
      { key: "corpus", label: "Remaining corpus", color: "#D4AF37" },
      { key: "annualExpenses", label: "Annual expenses", color: "#4D78B8" },
    ],
    kind: "line" as const,
  };

  return {
    metrics: [
      {
        id: "future-expenses",
        label: "Future monthly expenses",
        value: futureMonthlyExpense,
        format: "currency",
        currency: "INR",
        detail: `At age ${values.retirementAge}, after ${yearsToRetirement} years of inflation`,
      },
      {
        id: "corpus-required",
        label: "Corpus required",
        value: requiredCorpus,
        format: "currency",
        currency: "INR",
        detail: `${values.retirementYears} years of inflation-adjusted spending`,
      },
      {
        id: "required-sip",
        label: "Additional monthly SIP",
        value: additionalMonthlySIP,
        format: "currency",
        currency: "INR",
        detail: "On top of your current monthly contribution",
      },
      {
        id: "retirement-score",
        label: "Retirement score",
        value: `${retirementScore.toFixed(0)} / 100`,
        format: "text",
        detail: `${((projectedCurrentSavings / requiredCorpus) * 100).toFixed(0)}% of the target is covered by projected current savings`,
      },
    ],
    chart: accumulationChart,
    charts: [accumulationChart, drawdownChart],
    yearTable: accumulationTable,
    comparisonTable: retirementTable,
  };
}

export const retirementCalculatorDefinition: CalculatorDefinition<RetirementInputs> =
  {
    id: "retirement-planner",
    title: "Retirement Planner",
    description:
      "Estimate the retirement corpus your spending may require, and see how current savings and a monthly SIP could support your plan.",
    schema: retirementInputSchema,
    defaultValues: {
      currentAge: 35,
      retirementAge: 60,
      monthlyExpenses: 75_000,
      inflation: 6,
      expectedReturn: 10,
      retirementYears: 25,
      currentSavings: 500_000,
      monthlyContribution: 15_000,
    },
    fields: [
      {
        name: "currentAge",
        label: "Current age",
        type: "number",
        suffix: "years",
        min: 18,
        max: 70,
        step: 1,
      },
      {
        name: "retirementAge",
        label: "Retirement age",
        type: "number",
        suffix: "years",
        min: 19,
        max: 80,
        step: 1,
      },
      {
        name: "monthlyExpenses",
        label: "Current monthly expenses",
        type: "currency",
        prefix: "₹",
        min: 1,
        max: 10_000_000,
        step: 1_000,
        wide: true,
      },
      {
        name: "inflation",
        label: "Annual inflation",
        type: "percentage",
        suffix: "% p.a.",
        min: 0,
        max: 20,
        step: 0.1,
      },
      {
        name: "expectedReturn",
        label: "Expected return",
        type: "percentage",
        description: "Used for savings growth and retirement withdrawals.",
        suffix: "% p.a.",
        min: 0,
        max: 30,
        step: 0.1,
      },
      {
        name: "retirementYears",
        label: "Retirement duration",
        type: "number",
        suffix: "years",
        min: 1,
        max: 50,
        step: 1,
      },
      {
        name: "currentSavings",
        label: "Current retirement savings",
        type: "currency",
        prefix: "₹",
        min: 0,
        max: 1_000_000_000,
        step: 10_000,
      },
      {
        name: "monthlyContribution",
        label: "Current monthly contribution",
        type: "currency",
        prefix: "₹",
        min: 0,
        max: 10_000_000,
        step: 500,
      },
    ],
    calculate: calculateRetirement,
  };
