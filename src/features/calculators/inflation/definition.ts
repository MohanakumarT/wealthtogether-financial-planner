import { z } from "zod";

import type {
  CalculatorDefinition,
  CalculatorResult,
} from "@/features/calculators/types";

export const inflationInputSchema = z.object({
  presentAmount: z.number().positive().max(100_000_000_000),
  annualInflation: z.number().min(0).max(30),
  years: z.number().int().min(1).max(100),
});

export type InflationInputs = z.infer<typeof inflationInputSchema>;

export function calculateInflation(values: InflationInputs): CalculatorResult {
  const inflationFactor = (1 + values.annualInflation / 100) ** values.years;
  const futureValue = values.presentAmount * inflationFactor;
  const futurePurchasingPower = values.presentAmount / inflationFactor;

  const chartData: Array<Record<string, string | number>> = [];
  const timelineRows: Array<Record<string, string | number | null>> = [];
  for (let year = 0; year <= values.years; year += 1) {
    const factor = (1 + values.annualInflation / 100) ** year;
    const futureCost = values.presentAmount * factor;
    const purchasingPower = values.presentAmount / factor;
    chartData.push({ year, futureCost, purchasingPower });
    if (year === 0) continue;
    timelineRows.push({
      year: `Year ${year}`,
      inflationAdjustedCost: futureCost,
      purchasingPower,
      inflationFactor: factor,
    });
  }

  const chart = {
    title: "Inflation and purchasing power",
    description:
      "See how the future cost of today’s basket rises while a fixed amount’s real buying power changes.",
    xKey: "year",
    valueFormat: "currency" as const,
    currency: "INR",
    data: chartData,
    series: [
      {
        key: "futureCost",
        label: "Future value needed",
        color: "#D4AF37",
      },
      {
        key: "purchasingPower",
        label: "Purchasing power of fixed amount",
        color: "#4D78B8",
      },
    ],
    kind: "line" as const,
  };

  return {
    metrics: [
      {
        id: "present-value",
        label: "Present value",
        value: values.presentAmount,
        format: "currency",
        currency: "INR",
        detail: "Starting amount in today’s rupees",
      },
      {
        id: "future-value",
        label: "Future value",
        value: futureValue,
        format: "currency",
        currency: "INR",
        detail: `Amount needed in ${values.years} years to match today’s buying power`,
      },
      {
        id: "purchasing-power",
        label: "Purchasing power",
        value: futurePurchasingPower,
        format: "currency",
        currency: "INR",
        detail: `Today’s value of ₹${values.presentAmount.toLocaleString("en-IN")} held unchanged for ${values.years} years`,
      },
      {
        id: "inflation-assumption",
        label: "Annual inflation",
        value: values.annualInflation / 100,
        format: "percent",
        detail: `${values.years}-year projection`,
      },
    ],
    chart,
    yearTable: {
      title: "Inflation timeline",
      description:
        "Year-by-year change in the equivalent future amount and the buying power of a fixed nominal sum.",
      columns: [
        { key: "year", label: "Timeline", format: "text" },
        {
          key: "inflationAdjustedCost",
          label: "Future value needed",
          format: "currency",
          currency: "INR",
        },
        {
          key: "purchasingPower",
          label: "Purchasing power",
          format: "currency",
          currency: "INR",
        },
        {
          key: "inflationFactor",
          label: "Inflation multiplier",
          format: "number",
        },
      ],
      rows: timelineRows,
    },
  };
}

export const inflationCalculatorDefinition: CalculatorDefinition<InflationInputs> =
  {
    id: "inflation-calculator",
    title: "Inflation Calculator",
    description:
      "Understand how inflation can change the future cost of a goal and the real buying power of money you hold today.",
    schema: inflationInputSchema,
    defaultValues: {
      presentAmount: 1_000_000,
      annualInflation: 6,
      years: 10,
    },
    fields: [
      {
        name: "presentAmount",
        label: "Present amount",
        type: "currency",
        description: "The amount or cost in today’s money.",
        prefix: "₹",
        min: 1,
        max: 100_000_000_000,
        step: 10_000,
        wide: true,
      },
      {
        name: "annualInflation",
        label: "Annual inflation",
        type: "percentage",
        description: "The assumed annual rise in prices.",
        suffix: "% p.a.",
        min: 0,
        max: 30,
        step: 0.1,
      },
      {
        name: "years",
        label: "Time period",
        type: "number",
        description: "How far into the future to project.",
        suffix: "years",
        min: 1,
        max: 100,
        step: 1,
      },
    ],
    calculate: calculateInflation,
  };
