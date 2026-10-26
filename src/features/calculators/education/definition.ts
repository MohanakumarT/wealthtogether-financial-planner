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

export const educationInputSchema = z.object({
  yearsUntilEducation: z.number().int().min(1).max(30),
  currentEducationCost: z.number().positive().max(100_000_000),
  inflation: z.number().min(0).max(20),
  expectedReturn: z.number().min(0).max(30),
  currentSavings: z.number().min(0).max(1_000_000_000),
});

export type EducationInputs = z.infer<typeof educationInputSchema>;

export function calculateEducation(values: EducationInputs): CalculatorResult {
  const years = values.yearsUntilEducation;
  const months = years * 12;
  const monthlyRate = values.expectedReturn / 100 / 12;
  const inflationRate = values.inflation / 100;
  const futureEducationCost = futureValueAtAnnualRate(
    values.currentEducationCost,
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
    futureEducationCost,
    futureExistingSavings,
    monthlyRate,
    months,
  );
  const chartData: Array<Record<string, string | number>> = [];
  const yearRows: Array<Record<string, string | number | null>> = [];
  for (let year = 0; year <= years; year += 1) {
    const projectedCorpus = projectMonthlyBalance(
      values.currentSavings,
      requiredSIP,
      monthlyRate,
      year * 12,
    );
    const educationCost = futureValueAtAnnualRate(
      values.currentEducationCost,
      inflationRate,
      year,
    );
    chartData.push({ year, projectedCorpus, educationCost });
    if (year === 0) continue;
    yearRows.push({
      year: `Year ${year}`,
      annualSIP: requiredSIP * 12,
      totalContributions: requiredSIP * 12 * year,
      projectedCorpus,
      educationCost,
    });
  }

  const chart = {
    title: "Your education savings timeline",
    description:
      "Compare the projected corpus from your required SIP with the education cost as it rises with inflation.",
    xKey: "year",
    valueFormat: "currency" as const,
    currency: "INR",
    data: chartData,
    series: [
      { key: "projectedCorpus", label: "Projected corpus", color: "#4D78B8" },
      {
        key: "educationCost",
        label: "Future education cost",
        color: "#D4AF37",
      },
    ],
    kind: "area" as const,
  };

  return {
    metrics: [
      {
        id: "future-education-cost",
        label: "Future education cost",
        value: futureEducationCost,
        format: "currency",
        currency: "INR",
        detail: `In ${years} years, based on ${values.inflation}% annual inflation`,
      },
      {
        id: "inflation-assumption",
        label: "Inflation assumption",
        value: values.inflation / 100,
        format: "percent",
        detail: "Annual education cost increase",
      },
      {
        id: "required-sip",
        label: "Required monthly SIP",
        value: requiredSIP,
        format: "currency",
        currency: "INR",
        detail: "Estimated monthly contribution from now until the goal",
      },
      {
        id: "education-corpus",
        label: "Corpus at education start",
        value: futureEducationCost,
        format: "currency",
        currency: "INR",
        detail: "Target corpus for the estimated future cost",
      },
    ],
    chart,
    yearTable: {
      title: "Education goal timeline",
      description:
        "Annual contributions and projected savings compared with the inflation-adjusted goal cost.",
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
          key: "educationCost",
          label: "Education cost",
          format: "currency",
          currency: "INR",
        },
      ],
      rows: yearRows,
    },
  };
}

export const educationCalculatorDefinition: CalculatorDefinition<EducationInputs> =
  {
    id: "child-education-planner",
    title: "Child Education Planner",
    description:
      "Plan toward a future education goal by estimating its inflation-adjusted cost, the corpus to target, and a monthly SIP to get there.",
    schema: educationInputSchema,
    defaultValues: {
      yearsUntilEducation: 12,
      currentEducationCost: 2_500_000,
      inflation: 8,
      expectedReturn: 10,
      currentSavings: 250_000,
    },
    fields: [
      {
        name: "yearsUntilEducation",
        label: "Years until education",
        type: "number",
        description: "When you expect the education goal to begin.",
        suffix: "years",
        min: 1,
        max: 30,
        step: 1,
      },
      {
        name: "currentEducationCost",
        label: "Education cost today",
        type: "currency",
        description: "Estimated total cost in today’s money.",
        prefix: "₹",
        min: 1,
        max: 100_000_000,
        step: 10_000,
        wide: true,
      },
      {
        name: "inflation",
        label: "Education inflation",
        type: "percentage",
        description: "Annual increase in education costs.",
        suffix: "% p.a.",
        min: 0,
        max: 20,
        step: 0.1,
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
        label: "Current education savings",
        type: "currency",
        description: "Existing investments for this goal.",
        prefix: "₹",
        min: 0,
        max: 1_000_000_000,
        step: 10_000,
        wide: true,
      },
    ],
    calculate: calculateEducation,
  };
