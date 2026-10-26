import { z } from "zod";

import type {
  CalculatorDefinition,
  CalculatorResult,
} from "@/features/calculators/types";

export const swpInputSchema = z.object({
  initialCorpus: z.number().positive().max(10_000_000_000),
  monthlyWithdrawal: z.number().positive().max(100_000_000),
  expectedReturn: z.number().min(0).max(30),
  projectionYears: z.number().int().min(1).max(80),
});

export type SWPInputs = z.infer<typeof swpInputSchema>;

function formatDuration(months: number | null) {
  if (months === null) return "Not projected to deplete";
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${months} months`;
  if (remainingMonths === 0) return `${years} years`;
  return `${years} years, ${remainingMonths} months`;
}

function getExhaustionMonths(
  corpus: number,
  monthlyWithdrawal: number,
  monthlyRate: number,
) {
  if (monthlyRate === 0) return Math.ceil(corpus / monthlyWithdrawal);
  if (corpus * monthlyRate >= monthlyWithdrawal) return null;
  const ratio = monthlyWithdrawal / (monthlyWithdrawal - corpus * monthlyRate);
  return Math.max(1, Math.ceil(Math.log(ratio) / Math.log(1 + monthlyRate)));
}

export function calculateSWP(values: SWPInputs): CalculatorResult {
  const monthlyRate = values.expectedReturn / 100 / 12;
  const exhaustionMonths = getExhaustionMonths(
    values.initialCorpus,
    values.monthlyWithdrawal,
    monthlyRate,
  );
  let balance = values.initialCorpus;
  let cumulativeWithdrawals = 0;
  const chartData: Array<Record<string, string | number>> = [
    { year: 0, remainingCorpus: balance, cumulativeWithdrawals },
  ];
  const yearRows: Array<Record<string, string | number | null>> = [];

  for (let year = 1; year <= values.projectionYears; year += 1) {
    let annualWithdrawals = 0;
    for (let month = 0; month < 12; month += 1) {
      if (balance <= 0) break;
      balance *= 1 + monthlyRate;
      const withdrawal = Math.min(balance, values.monthlyWithdrawal);
      balance -= withdrawal;
      annualWithdrawals += withdrawal;
      cumulativeWithdrawals += withdrawal;
    }
    chartData.push({ year, remainingCorpus: balance, cumulativeWithdrawals });
    yearRows.push({
      year: `Year ${year}`,
      annualWithdrawals,
      cumulativeWithdrawals,
      remainingCorpus: balance,
    });
  }

  const chart = {
    title: "Your SWP projection",
    description:
      "Track the corpus remaining and withdrawals received over your selected projection period.",
    xKey: "year",
    valueFormat: "currency" as const,
    currency: "INR",
    data: chartData,
    series: [
      { key: "remainingCorpus", label: "Remaining corpus", color: "#D4AF37" },
      {
        key: "cumulativeWithdrawals",
        label: "Cumulative withdrawals",
        color: "#4D78B8",
      },
    ],
    kind: "line" as const,
  };

  return {
    metrics: [
      {
        id: "monthly-withdrawal",
        label: "Monthly withdrawal",
        value: values.monthlyWithdrawal,
        format: "currency",
        currency: "INR",
        detail: "Planned withdrawal at each month end",
      },
      {
        id: "remaining-corpus",
        label: "Remaining corpus",
        value: balance,
        format: "currency",
        currency: "INR",
        detail: `After ${values.projectionYears} years`,
      },
      {
        id: "total-withdrawn",
        label: "Total withdrawn",
        value: cumulativeWithdrawals,
        format: "currency",
        currency: "INR",
        detail: `Across ${values.projectionYears} years`,
      },
      {
        id: "corpus-exhaustion",
        label: "Corpus exhaustion",
        value: formatDuration(exhaustionMonths),
        format: "text",
        detail:
          exhaustionMonths === null
            ? "At this return assumption, growth is projected to cover the withdrawal"
            : `Estimated from a ₹${values.initialCorpus.toLocaleString("en-IN")} starting corpus`,
      },
    ],
    chart,
    yearTable: {
      title: "Year-wise withdrawal schedule",
      description:
        "Monthly withdrawals are taken at month end; any shortfall in the final month is limited to the available balance.",
      columns: [
        { key: "year", label: "Timeline", format: "text" },
        {
          key: "annualWithdrawals",
          label: "Withdrawn this year",
          format: "currency",
          currency: "INR",
        },
        {
          key: "cumulativeWithdrawals",
          label: "Total withdrawn",
          format: "currency",
          currency: "INR",
        },
        {
          key: "remainingCorpus",
          label: "Remaining corpus",
          format: "currency",
          currency: "INR",
        },
      ],
      rows: yearRows,
    },
  };
}

export const swpCalculatorDefinition: CalculatorDefinition<SWPInputs> = {
  id: "swp-calculator",
  title: "SWP Calculator",
  description:
    "Estimate a monthly withdrawal plan, see how your remaining corpus may change, and understand its projected longevity.",
  schema: swpInputSchema,
  defaultValues: {
    initialCorpus: 10_000_000,
    monthlyWithdrawal: 60_000,
    expectedReturn: 8,
    projectionYears: 25,
  },
  fields: [
    {
      name: "initialCorpus",
      label: "Starting corpus",
      type: "currency",
      description: "Total amount invested before withdrawals begin.",
      prefix: "₹",
      min: 1,
      max: 10_000_000_000,
      step: 100_000,
      wide: true,
    },
    {
      name: "monthlyWithdrawal",
      label: "Monthly withdrawal",
      type: "currency",
      description: "The amount you plan to withdraw each month.",
      prefix: "₹",
      min: 1,
      max: 100_000_000,
      step: 1_000,
    },
    {
      name: "expectedReturn",
      label: "Expected annual return",
      type: "percentage",
      description: "Illustrative return, compounded monthly.",
      suffix: "% p.a.",
      min: 0,
      max: 30,
      step: 0.1,
    },
    {
      name: "projectionYears",
      label: "Projection period",
      type: "number",
      description: "How many years to show in the corpus chart and table.",
      suffix: "years",
      min: 1,
      max: 80,
      step: 1,
      wide: true,
    },
  ],
  calculate: calculateSWP,
};
