import { z } from "zod";

import type { CalculatorDefinition } from "@/features/calculators/types";

export const lumpsumInputSchema = z.object({
  investment: z
    .number({ error: "Enter a valid investment amount." })
    .positive("Investment must be greater than zero.")
    .max(100_000_000, "Investment must be ₹10 crore or less."),
  years: z
    .number({ error: "Enter an investment period." })
    .int("Enter a whole number of years.")
    .min(1, "Invest for at least 1 year.")
    .max(60, "The maximum investment period is 60 years."),
  annualReturn: z
    .number({ error: "Enter an annual return rate." })
    .min(-99, "Return cannot be below -99% per year.")
    .max(100, "Return must be 100% or less per year."),
});

export type LumpsumInputs = z.infer<typeof lumpsumInputSchema>;

export function calculateLumpsum(values: LumpsumInputs) {
  const annualRate = values.annualReturn / 100;
  let futureValue = values.investment;
  const chartData: Array<Record<string, string | number>> = [
    { period: "Today", invested: values.investment, value: values.investment },
  ];
  const yearlyRows: Array<Record<string, string | number | null>> = [];

  for (let year = 1; year <= values.years; year += 1) {
    const startingValue = futureValue;
    futureValue *= 1 + annualRate;
    const annualGrowth = futureValue - startingValue;
    const profit = futureValue - values.investment;

    chartData.push({
      period: `Year ${year}`,
      invested: values.investment,
      value: futureValue,
    });
    yearlyRows.push({
      year: `Year ${year}`,
      startingValue,
      annualGrowth,
      futureValue,
      profit,
    });
  }

  return {
    metrics: [
      {
        id: "future-value",
        label: "Future Value",
        value: futureValue,
        format: "currency" as const,
        currency: "INR",
        detail: `Projected value after ${values.years} years`,
      },
      {
        id: "profit",
        label: "Profit",
        value: futureValue - values.investment,
        format: "currency" as const,
        currency: "INR",
        detail:
          futureValue >= values.investment
            ? "Estimated growth above your initial investment"
            : "Estimated change below your initial investment",
        changeDirection:
          futureValue >= values.investment
            ? ("up" as const)
            : ("down" as const),
      },
    ],
    chart: {
      title: "One investment, growing over time",
      description: "Projected value compared with your original investment.",
      xKey: "period",
      valueFormat: "currency" as const,
      currency: "INR",
      data: chartData,
      series: [
        { key: "invested", label: "Initial investment", color: "#7894B8" },
        { key: "value", label: "Projected value", color: "#D4AF37" },
      ],
      kind: "area" as const,
    },
    yearTable: {
      title: "Year-wise growth",
      description:
        "Annual compounding with no additional contributions or withdrawals.",
      columns: [
        { key: "year", label: "Year", format: "text" as const },
        {
          key: "startingValue",
          label: "Starting value",
          format: "currency" as const,
          currency: "INR",
        },
        {
          key: "annualGrowth",
          label: "Annual growth",
          format: "currency" as const,
          currency: "INR",
        },
        {
          key: "futureValue",
          label: "Future value",
          format: "currency" as const,
          currency: "INR",
        },
        {
          key: "profit",
          label: "Profit to date",
          format: "currency" as const,
          currency: "INR",
        },
      ],
      rows: yearlyRows,
    },
  };
}

export const lumpsumCalculatorDefinition: CalculatorDefinition<LumpsumInputs> =
  {
    id: "lumpsum-calculator",
    title: "Lumpsum Calculator",
    description:
      "Estimate how a one-time investment could grow with annual compounding. Adjust the assumptions to explore the outcome over time.",
    schema: lumpsumInputSchema,
    defaultValues: {
      investment: 100_000,
      years: 10,
      annualReturn: 12,
    },
    fields: [
      {
        name: "investment",
        label: "Investment",
        type: "currency",
        description: "Your one-time initial investment.",
        prefix: "₹",
        min: 1,
        max: 100_000_000,
        step: 1_000,
      },
      {
        name: "years",
        label: "Investment period",
        type: "number",
        description: "Choose 1 to 60 whole years.",
        suffix: "years",
        min: 1,
        max: 60,
        step: 1,
      },
      {
        name: "annualReturn",
        label: "Return",
        type: "percentage",
        description:
          "A fixed illustrative annual rate, compounded once per year.",
        suffix: "% p.a.",
        min: -99,
        max: 100,
        step: 0.1,
      },
    ],
    calculate: calculateLumpsum,
  };
