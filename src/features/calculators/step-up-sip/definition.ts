import { z } from "zod";

import { calculateSIP } from "@/features/calculators/sip/definition";
import type {
  CalculatorDefinition,
  CalculatorResult,
} from "@/features/calculators/types";

export const stepUpSIPInputSchema = z
  .object({
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
    stepUpType: z.enum(["5", "10", "custom"]),
    customStepUp: z
      .number({ error: "Enter a custom step-up percentage." })
      .min(0, "Custom step-up cannot be below 0%.")
      .max(100, "Custom step-up must be 100% or less.")
      .optional(),
  })
  .superRefine((values, context) => {
    if (values.stepUpType === "custom" && values.customStepUp === undefined) {
      context.addIssue({
        code: "custom",
        message: "Enter your custom annual step-up percentage.",
        path: ["customStepUp"],
      });
    }
  });

export type StepUpSIPInputs = z.infer<typeof stepUpSIPInputSchema>;

function getStepUpRate(values: StepUpSIPInputs) {
  if (values.stepUpType === "custom") {
    if (values.customStepUp === undefined) {
      throw new Error("A custom step-up percentage is required.");
    }
    return values.customStepUp;
  }
  return Number(values.stepUpType);
}

function createScenario(
  values: StepUpSIPInputs,
  stepUpPercent: number,
  label: string,
) {
  const result = calculateSIP({
    monthlySip: values.monthlySip,
    years: values.years,
    expectedReturn: values.expectedReturn,
    stepUpPercent,
  });
  const finalCorpus = Number(
    result.metrics.find((metric) => metric.id === "final-corpus")?.value ?? 0,
  );
  const totalInvestment = Number(
    result.metrics.find((metric) => metric.id === "total-investment")?.value ??
      0,
  );
  const estimatedReturns = Number(
    result.metrics.find((metric) => metric.id === "estimated-returns")?.value ??
      0,
  );
  const color =
    stepUpPercent === 0
      ? "#91A0B4"
      : stepUpPercent === 5
        ? "#7894B8"
        : stepUpPercent === 10
          ? "#D4AF37"
          : "#4D9273";
  const key =
    stepUpPercent === 0
      ? "noStepUp"
      : `stepUp${String(stepUpPercent).replace(".", "_")}`;

  return {
    label,
    stepUpPercent,
    finalCorpus,
    totalInvestment,
    estimatedReturns,
    color,
    key,
    yearlyData: result.chart.data,
    yearTable: result.yearTable,
  };
}

export function calculateStepUpSIP(values: StepUpSIPInputs): CalculatorResult {
  const customRate = getStepUpRate(values);
  const scenarioOptions = [
    { rate: 0, label: "No step-up" },
    { rate: 5, label: "5% annual step-up" },
    { rate: 10, label: "10% annual step-up" },
    ...(values.stepUpType === "custom"
      ? [{ rate: customRate, label: `Custom (${customRate}% annual step-up)` }]
      : []),
  ];
  const uniqueOptions = Array.from(
    new Map(
      scenarioOptions.map((scenario) => [scenario.rate, scenario]),
    ).values(),
  );
  const scenarios = uniqueOptions.map((scenario) =>
    createScenario(values, scenario.rate, scenario.label),
  );
  const selectedStepUp = scenarios.find(
    (scenario) => scenario.stepUpPercent === customRate,
  )!;
  const chartData = Array.from({ length: values.years + 1 }, (_, year) => {
    const dataPoint: Record<string, string | number> = { year };
    for (const scenario of scenarios) {
      dataPoint[scenario.key] =
        year === 0 ? 0 : Number(scenario.yearlyData[year - 1]?.corpus ?? 0);
    }
    return dataPoint;
  });

  return {
    metrics: [
      {
        id: "final-corpus",
        label: "Final Corpus",
        value: selectedStepUp.finalCorpus,
        format: "currency",
        currency: "INR",
        detail: `${customRate}% annual step-up · ${values.years} years`,
      },
      {
        id: "total-investment",
        label: "Total Investment",
        value: selectedStepUp.totalInvestment,
        format: "currency",
        currency: "INR",
        detail: "Includes each annual step-up",
      },
      {
        id: "estimated-returns",
        label: "Estimated Returns",
        value: selectedStepUp.estimatedReturns,
        format: "currency",
        currency: "INR",
        detail: "Projected growth above contributions",
      },
      {
        id: "wealth-multiplier",
        label: "Wealth Multiplier",
        value: `${(selectedStepUp.finalCorpus / selectedStepUp.totalInvestment).toFixed(2)}×`,
        format: "text",
        detail: "Final corpus for each ₹1 invested",
      },
    ],
    chart: {
      title: "Compare corpus growth",
      description:
        "See how different annual step-up rates can change the projected corpus.",
      xKey: "year",
      valueFormat: "currency",
      currency: "INR",
      data: chartData,
      series: scenarios.map((scenario) => ({
        key: scenario.key,
        label: scenario.label,
        color: scenario.color,
      })),
      kind: "line",
    },
    comparisonTable: {
      title: "Step-up scenario comparison",
      description:
        "All scenarios use the same starting SIP, return assumption, and time period.",
      columns: [
        { key: "scenario", label: "Scenario", format: "text" },
        { key: "stepUpPercent", label: "Annual step-up", format: "percent" },
        {
          key: "totalInvestment",
          label: "Total investment",
          format: "currency",
          currency: "INR",
        },
        {
          key: "finalCorpus",
          label: "Final corpus",
          format: "currency",
          currency: "INR",
        },
        {
          key: "estimatedReturns",
          label: "Estimated returns",
          format: "currency",
          currency: "INR",
        },
      ],
      rows: scenarios.map((scenario) => ({
        scenario: scenario.label,
        stepUpPercent: scenario.stepUpPercent / 100,
        totalInvestment: scenario.totalInvestment,
        finalCorpus: scenario.finalCorpus,
        estimatedReturns: scenario.estimatedReturns,
      })),
    },
    yearTable: {
      ...selectedStepUp.yearTable,
      title: `Growth table · ${customRate}% annual step-up`,
      description: "Year-wise projection for the selected step-up scenario.",
    },
  };
}

export const stepUpSIPCalculatorDefinition: CalculatorDefinition<StepUpSIPInputs> =
  {
    id: "step-up-sip-calculator",
    title: "Step-up SIP Calculator",
    description:
      "Compare a steady SIP with annual 5%, 10%, or custom step-ups and see how a growing contribution could change your projected corpus.",
    schema: stepUpSIPInputSchema,
    defaultValues: {
      monthlySip: 10_000,
      years: 10,
      expectedReturn: 12,
      stepUpType: "5",
      customStepUp: 15,
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
        name: "stepUpType",
        label: "Annual step-up",
        type: "select",
        description: "Choose a standard increase or set your own.",
        options: [
          { label: "5% each year", value: "5" },
          { label: "10% each year", value: "10" },
          { label: "Custom percentage", value: "custom" },
        ],
      },
      {
        name: "customStepUp",
        label: "Custom step-up",
        type: "percentage",
        description: "Applied to the monthly SIP once each year.",
        suffix: "% / year",
        min: 0,
        max: 100,
        step: 0.1,
        visibleWhen: { field: "stepUpType", equals: "custom" },
      },
    ],
    calculate: calculateStepUpSIP,
  };
