import { z } from "zod";

import type {
  CalculatorDefinition,
  CalculatorInputField,
  CalculatorResult,
} from "@/features/calculators/types";
import type { Path } from "react-hook-form";
import {
  futureValueAtAnnualRate,
  projectMonthlyBalance,
  requiredMonthlyContribution,
} from "@/features/calculators/finance";

export const goalCategories = [
  { value: "retirement", label: "Retirement" },
  { value: "house", label: "House" },
  { value: "education", label: "Education" },
  { value: "marriage", label: "Marriage" },
  { value: "car", label: "Car" },
  { value: "vacation", label: "Vacation" },
  { value: "emergency", label: "Emergency fund" },
] as const;

const goalCategoryValues = goalCategories.map((category) => category.value);
const goalCategorySchema = z.enum(
  goalCategoryValues as [GoalCategory, ...GoalCategory[]],
);

export type GoalCategory = (typeof goalCategories)[number]["value"];

const goalSchema = z.object({
  name: z.string().trim().min(1, "Add a name for this goal.").max(60),
  category: goalCategorySchema,
  targetAmount: z
    .number()
    .positive("Enter a goal amount greater than zero.")
    .max(100_000_000_000),
  years: z.number().int().min(1).max(80),
  inflation: z.number().min(0).max(30),
  expectedReturn: z.number().min(0).max(30),
  currentSavings: z.number().min(0).max(1_000_000_000),
});

export const goalPlannerInputSchema = z
  .object({
    goals: z
      .array(goalSchema)
      .min(2, "Add at least two goals to compare.")
      .max(8, "Compare up to eight goals at a time."),
  })
  .superRefine(({ goals }, context) => {
    const seenNames = new Map<string, number>();
    goals.forEach((goal, index) => {
      const normalized = goal.name.trim().toLocaleLowerCase();
      const earlierIndex = seenNames.get(normalized);
      if (earlierIndex !== undefined) {
        context.addIssue({
          code: "custom",
          message: "Give each goal a distinct name so you can compare them.",
          path: ["goals", index, "name"],
        });
      } else {
        seenNames.set(normalized, index);
      }
    });
  });

export type GoalPlannerInputs = z.infer<typeof goalPlannerInputSchema>;
export type GoalInput = GoalPlannerInputs["goals"][number];

export function getGoalInputFields(
  index: number,
): CalculatorInputField<GoalPlannerInputs>[] {
  const fieldPath = (field: string) =>
    `goals.${index}.${field}` as Path<GoalPlannerInputs>;

  return [
    {
      name: fieldPath("name"),
      label: `Goal ${index + 1} name`,
      type: "text",
      placeholder: "Give this goal a name",
      wide: true,
    },
    {
      name: fieldPath("category"),
      label: "Goal type",
      type: "select",
      options: goalCategories.map(({ label, value }) => ({ label, value })),
    },
    {
      name: fieldPath("targetAmount"),
      label: "Goal amount today",
      type: "currency",
      description: "Estimated target in today’s money.",
      prefix: "₹",
      min: 1,
      max: 100_000_000_000,
      step: 10_000,
    },
    {
      name: fieldPath("years"),
      label: "Years to goal",
      type: "number",
      suffix: "years",
      min: 1,
      max: 80,
      step: 1,
    },
    {
      name: fieldPath("inflation"),
      label: "Annual inflation",
      type: "percentage",
      suffix: "% p.a.",
      min: 0,
      max: 30,
      step: 0.1,
    },
    {
      name: fieldPath("expectedReturn"),
      label: "Expected return",
      type: "percentage",
      suffix: "% p.a.",
      min: 0,
      max: 30,
      step: 0.1,
    },
    {
      name: fieldPath("currentSavings"),
      label: "Current savings for goal",
      type: "currency",
      prefix: "₹",
      min: 0,
      max: 1_000_000_000,
      step: 10_000,
      wide: true,
    },
  ];
}

function calculateGoal(goal: GoalInput, index: number) {
  const months = goal.years * 12;
  const monthlyRate = goal.expectedReturn / 100 / 12;
  const futureTarget = futureValueAtAnnualRate(
    goal.targetAmount,
    goal.inflation / 100,
    goal.years,
  );
  const projectedExistingSavings = projectMonthlyBalance(
    goal.currentSavings,
    0,
    monthlyRate,
    months,
  );
  const requiredSIP = requiredMonthlyContribution(
    futureTarget,
    projectedExistingSavings,
    monthlyRate,
    months,
  );
  const category = goalCategories.find(
    (candidate) => candidate.value === goal.category,
  )!;

  return {
    ...goal,
    index,
    categoryLabel: category.label,
    futureTarget,
    projectedExistingSavings,
    requiredSIP,
    coverage: Math.min(1, projectedExistingSavings / futureTarget),
  };
}

export function calculateGoalPlanner(
  values: GoalPlannerInputs,
): CalculatorResult {
  const goals = values.goals.map(calculateGoal);
  const totalFutureCorpus = goals.reduce(
    (total, goal) => total + goal.futureTarget,
    0,
  );
  const combinedMonthlySIP = goals.reduce(
    (total, goal) => total + goal.requiredSIP,
    0,
  );
  const totalProjectedSavings = goals.reduce(
    (total, goal) => total + goal.projectedExistingSavings,
    0,
  );

  const comparisonRows = goals.map((goal) => ({
    goal: goal.name,
    category: goal.categoryLabel,
    years: goal.years,
    targetToday: goal.targetAmount,
    futureTarget: goal.futureTarget,
    currentSavings: goal.projectedExistingSavings,
    requiredSIP: goal.requiredSIP,
    currentCoverage: goal.coverage,
  }));
  const comparisonData = goals.map((goal) => ({
    goal: goal.name,
    monthlySIP: goal.requiredSIP,
    futureCorpus: goal.futureTarget,
  }));

  const sipChart = {
    title: "Monthly SIP by goal",
    description:
      "Compare the estimated monthly contribution needed for each goal.",
    xKey: "goal",
    valueFormat: "currency" as const,
    currency: "INR",
    data: comparisonData,
    series: [
      { key: "monthlySIP", label: "Required monthly SIP", color: "#D4AF37" },
    ],
    kind: "bar" as const,
  };
  const corpusChart = {
    title: "Future corpus by goal",
    description:
      "Compare the inflation-adjusted target amount at each goal date.",
    xKey: "goal",
    valueFormat: "currency" as const,
    currency: "INR",
    data: comparisonData,
    series: [
      { key: "futureCorpus", label: "Future goal corpus", color: "#4D78B8" },
    ],
    kind: "bar" as const,
  };

  const timelineRows: Array<Record<string, string | number | null>> = [];
  for (const goal of goals) {
    const monthlyRate = goal.expectedReturn / 100 / 12;
    for (let year = 1; year <= goal.years; year += 1) {
      const futureTarget = futureValueAtAnnualRate(
        goal.targetAmount,
        goal.inflation / 100,
        year,
      );
      const projectedCorpus = projectMonthlyBalance(
        goal.currentSavings,
        goal.requiredSIP,
        monthlyRate,
        year * 12,
      );
      timelineRows.push({
        goal: goal.name,
        timeline: `Year ${year}`,
        futureTarget,
        projectedCorpus,
        monthlySIP: goal.requiredSIP,
      });
    }
  }

  return {
    metrics: [
      {
        id: "goal-count",
        label: "Goals compared",
        value: goals.length,
        format: "number",
        detail: "Across your selected life goals",
      },
      {
        id: "future-corpus",
        label: "Combined future corpus",
        value: totalFutureCorpus,
        format: "currency",
        currency: "INR",
        detail: "Sum of all inflation-adjusted goal targets",
      },
      {
        id: "combined-sip",
        label: "Combined monthly SIP",
        value: combinedMonthlySIP,
        format: "currency",
        currency: "INR",
        detail: "Total estimated contribution across goals",
      },
      {
        id: "existing-coverage",
        label: "Current savings coverage",
        value: `${((totalProjectedSavings / totalFutureCorpus) * 100).toFixed(0)}%`,
        format: "text",
        detail: "Projected value of current savings versus all future targets",
      },
    ],
    chart: sipChart,
    charts: [sipChart, corpusChart],
    comparisonTable: {
      title: "Goal comparison",
      description:
        "Review every goal’s target date, inflation-adjusted corpus, current savings, and estimated SIP side by side.",
      columns: [
        { key: "goal", label: "Goal", format: "text" },
        { key: "category", label: "Type", format: "text" },
        { key: "years", label: "Years", format: "number" },
        {
          key: "targetToday",
          label: "Goal amount today",
          format: "currency",
          currency: "INR",
        },
        {
          key: "futureTarget",
          label: "Future corpus",
          format: "currency",
          currency: "INR",
        },
        {
          key: "currentSavings",
          label: "Projected current savings",
          format: "currency",
          currency: "INR",
        },
        {
          key: "requiredSIP",
          label: "Monthly SIP",
          format: "currency",
          currency: "INR",
        },
        {
          key: "currentCoverage",
          label: "Current coverage",
          format: "percent",
        },
      ],
      rows: comparisonRows,
    },
    yearTable: {
      title: "Year-wise goal timelines",
      description:
        "Each goal is projected independently; rows continue through that goal’s target year.",
      columns: [
        { key: "goal", label: "Goal", format: "text" },
        { key: "timeline", label: "Timeline", format: "text" },
        {
          key: "monthlySIP",
          label: "Monthly SIP",
          format: "currency",
          currency: "INR",
        },
        {
          key: "futureTarget",
          label: "Future goal target",
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

export const goalPlannerCalculatorDefinition: CalculatorDefinition<GoalPlannerInputs> =
  {
    id: "goal-planner",
    title: "Goal Planner",
    description:
      "Bring your major goals into one view. Compare future costs, monthly SIPs, current savings, and target timelines side by side.",
    schema: goalPlannerInputSchema,
    defaultValues: {
      goals: [
        {
          name: "Retirement",
          category: "retirement",
          targetAmount: 30_000_000,
          years: 25,
          inflation: 6,
          expectedReturn: 10,
          currentSavings: 2_000_000,
        },
        {
          name: "Child education",
          category: "education",
          targetAmount: 2_500_000,
          years: 12,
          inflation: 8,
          expectedReturn: 10,
          currentSavings: 250_000,
        },
      ],
    },
    fields: [],
    calculate: calculateGoalPlanner,
  };
