import { z } from "zod";

import type { CalculatorDefinition } from "@/features/calculators/types";

export const sipInputSchema = z.object({
  monthlySip: z
    .number({ error: "Enter a valid monthly SIP amount." })
    .positive("Monthly SIP must be greater than zero.")
    .max(100_000_000, "Monthly SIP must be ₹10 crore or less."),
  years: z
    .number({ error: "Enter an investment period." })
    .int("Enter a whole number of years.")
    .min(1, "Invest for at least 1 year.")
    .max(60, "The maximum investment period is 60 years."),
  expectedReturn: z
    .number({ error: "Enter an expected annual return." })
    .min(0, "Expected return cannot be below 0%.")
    .max(50, "Expected return must be 50% or less."),
  stepUpPercent: z
    .number({ error: "Enter an annual step-up percentage." })
    .min(0, "Step-up cannot be below 0%.")
    .max(100, "Step-up must be 100% or less."),
});

export type SIPInputs = z.infer<typeof sipInputSchema>;

export function calculateSIP(values: SIPInputs) {
  const monthlyRate = values.expectedReturn / 100 / 12;
  const annualStepUp = values.stepUpPercent / 100;
  let corpus = 0;
  let totalInvestment = 0;
  const chartData: Array<Record<string, string | number>> = [];
  const yearlyRows: Array<Record<string, string | number | null>> = [];

  for (let year = 1; year <= values.years; year += 1) {
    const monthlyContribution =
      values.monthlySip * (1 + annualStepUp) ** (year - 1);
    const annualContribution = monthlyContribution * 12;

    for (let month = 0; month < 12; month += 1) {
      // Treat each installment as invested at the start of its month.
      corpus = (corpus + monthlyContribution) * (1 + monthlyRate);
      totalInvestment += monthlyContribution;
    }

    const estimatedReturns = corpus - totalInvestment;
    chartData.push({ year, invested: totalInvestment, corpus });
    yearlyRows.push({
      year: `Year ${year}`,
      monthlySip: monthlyContribution,
      annualContribution,
      totalInvested: totalInvestment,
      corpus,
      returns: estimatedReturns,
    });
  }

  const wealthMultiplier = corpus / totalInvestment;

  return {
    metrics: [
      {
        id: "final-corpus",
        label: "Final Corpus",
        value: corpus,
        format: "currency" as const,
        currency: "INR",
        detail: "Projected value at the end of the SIP period",
      },
      {
        id: "total-investment",
        label: "Total Investment",
        value: totalInvestment,
        format: "currency" as const,
        currency: "INR",
        detail: `${values.years} years of monthly contributions, including step-ups`,
      },
      {
        id: "estimated-returns",
        label: "Estimated Returns",
        value: corpus - totalInvestment,
        format: "currency" as const,
        currency: "INR",
        detail: "Projected growth above contributions",
      },
      {
        id: "wealth-multiplier",
        label: "Wealth Multiplier",
        value: `${wealthMultiplier.toFixed(2)}×`,
        format: "text" as const,
        detail: "Final corpus for each ₹1 invested",
      },
    ],
    chart: {
      title: "Your corpus over time",
      description:
        "Projected corpus compared with contributions invested to date.",
      xKey: "year",
      valueFormat: "currency" as const,
      currency: "INR",
      data: chartData,
      series: [
        { key: "invested", label: "Total invested", color: "#7894B8" },
        { key: "corpus", label: "Projected corpus", color: "#D4AF37" },
      ],
      kind: "area" as const,
    },
    yearTable: {
      title: "Year-wise projection",
      description:
        "The monthly installment steps up at the start of each year.",
      columns: [
        { key: "year", label: "Year", format: "text" as const },
        {
          key: "monthlySip",
          label: "Monthly SIP",
          format: "currency" as const,
          currency: "INR",
        },
        {
          key: "annualContribution",
          label: "Annual contribution",
          format: "currency" as const,
          currency: "INR",
        },
        {
          key: "totalInvested",
          label: "Total invested",
          format: "currency" as const,
          currency: "INR",
        },
        {
          key: "corpus",
          label: "Projected corpus",
          format: "currency" as const,
          currency: "INR",
        },
        {
          key: "returns",
          label: "Estimated returns",
          format: "currency" as const,
          currency: "INR",
        },
      ],
      rows: yearlyRows,
    },
  };
}

export const sipCalculatorDefinition: CalculatorDefinition<SIPInputs> = {
  id: "sip-calculator",
  title: "WealthTogether SIP Planner",
  description:
    "Explore how regular monthly investments may grow over time using your own assumptions. Compare different SIP scenarios for educational planning purposes. This planner provides illustrative estimates only and does not constitute investment advice.",
  schema: sipInputSchema,
  defaultValues: {
    monthlySip: 10_000,
    years: 10,
    expectedReturn: 12,
    stepUpPercent: 10,
  },
  fields: [
    {
      name: "monthlySip",
      label: "Monthly SIP",
      type: "currency",
      description: "Your starting contribution for each month.",
      prefix: "₹",
      min: 1,
      max: 100_000_000,
      step: 100,
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
      name: "expectedReturn",
      label: "Expected return",
      type: "percentage",
      description: "Illustrative annual rate, compounded monthly.",
      suffix: "% p.a.",
      min: 0,
      max: 50,
      step: 0.1,
    },
    {
      name: "stepUpPercent",
      label: "Annual step-up",
      type: "percentage",
      description: "Increase the monthly SIP by this percentage each year.",
      suffix: "% / year",
      min: 0,
      max: 100,
      step: 1,
    },
  ],
  calculate: calculateSIP,
};
