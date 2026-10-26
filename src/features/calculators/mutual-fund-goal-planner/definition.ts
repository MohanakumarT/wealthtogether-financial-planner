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

export const mutualFundGoalTypes = [
  { value: "retirement", label: "Retirement" },
  { value: "child-education", label: "Child Education" },
  { value: "house", label: "House" },
  { value: "marriage", label: "Marriage" },
  { value: "car", label: "Car" },
  { value: "vacation", label: "Vacation" },
  { value: "wealth-creation", label: "Wealth Creation" },
] as const;

const goalTypeSchema = z.enum([
  "retirement",
  "child-education",
  "house",
  "marriage",
  "car",
  "vacation",
  "wealth-creation",
]);

export const mutualFundGoalPlannerInputSchema = z.object({
  goalType: goalTypeSchema,
  goalAmountToday: z.number().positive().max(100_000_000_000),
  yearsToGoal: z.number().int().min(1).max(80),
  inflation: z.number().min(0).max(30),
  currentSavings: z.number().min(0).max(10_000_000_000),
  monthlySip: z.number().min(0).max(100_000_000),
  comparisonSip: z.number().min(0).max(100_000_000),
  expectedAnnualReturn: z.number().min(0).max(30),
});

export type MutualFundGoalPlannerInputs = z.infer<
  typeof mutualFundGoalPlannerInputSchema
>;

function formatMonthlySip(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}/month`;
}

function getGoalLabel(goalType: MutualFundGoalPlannerInputs["goalType"]) {
  return (
    mutualFundGoalTypes.find((goal) => goal.value === goalType)?.label ??
    "Financial goal"
  );
}

function projectScenario(
  values: MutualFundGoalPlannerInputs,
  monthlySip: number,
  months: number,
  monthlyRate: number,
) {
  return projectMonthlyBalance(
    values.currentSavings,
    monthlySip,
    monthlyRate,
    months,
  );
}

export function calculateMutualFundGoalPlanner(
  values: MutualFundGoalPlannerInputs,
): CalculatorResult {
  const months = values.yearsToGoal * 12;
  const monthlyRate = values.expectedAnnualReturn / 100 / 12;
  const inflationRate = values.inflation / 100;
  const futureGoalAmount = futureValueAtAnnualRate(
    values.goalAmountToday,
    inflationRate,
    values.yearsToGoal,
  );
  const projectedCurrentSavings = projectScenario(
    values,
    0,
    months,
    monthlyRate,
  );
  const requiredMonthlySip = requiredMonthlyContribution(
    futureGoalAmount,
    projectedCurrentSavings,
    monthlyRate,
    months,
  );
  const corpusAtGoalForScenarioA = projectScenario(
    values,
    values.monthlySip,
    months,
    monthlyRate,
  );
  const corpusAtGoalForScenarioB = projectScenario(
    values,
    values.comparisonSip,
    months,
    monthlyRate,
  );
  const scenarioAAchievement = corpusAtGoalForScenarioA / futureGoalAmount;
  const scenarioBAchievement = corpusAtGoalForScenarioB / futureGoalAmount;
  const goalLabel = getGoalLabel(values.goalType);

  const chartData: Array<Record<string, string | number>> = [];
  const yearRows: Array<Record<string, string | number | null>> = [];
  for (let year = 0; year <= values.yearsToGoal; year += 1) {
    const monthsElapsed = year * 12;
    const futureGoalAtYear = futureValueAtAnnualRate(
      values.goalAmountToday,
      inflationRate,
      year,
    );
    const corpusA = projectScenario(
      values,
      values.monthlySip,
      monthsElapsed,
      monthlyRate,
    );
    const corpusB = projectScenario(
      values,
      values.comparisonSip,
      monthsElapsed,
      monthlyRate,
    );

    chartData.push({
      year: year === 0 ? "Today" : `Year ${year}`,
      goalTarget: futureGoalAtYear,
      scenarioACorpus: corpusA,
      scenarioBCorpus: corpusB,
    });
    yearRows.push({
      year: year === 0 ? "Today" : `Year ${year}`,
      futureGoalAmount: futureGoalAtYear,
      currentSavingsGrowth: projectScenario(
        values,
        0,
        monthsElapsed,
        monthlyRate,
      ),
      scenarioACorpus: corpusA,
      scenarioBCorpus: corpusB,
    });
  }

  const chart = {
    title: "Compare your goal progress",
    description:
      "See how two monthly SIP scenarios may grow against your inflation-adjusted goal.",
    xKey: "year",
    valueFormat: "currency" as const,
    currency: "INR",
    data: chartData,
    series: [
      {
        key: "goalTarget",
        label: "Inflation-adjusted goal",
        color: "#D4AF37",
      },
      {
        key: "scenarioACorpus",
        label: `Scenario A · ${formatMonthlySip(values.monthlySip)}`,
        color: "#4D78B8",
      },
      {
        key: "scenarioBCorpus",
        label: `Scenario B · ${formatMonthlySip(values.comparisonSip)}`,
        color: "#4D9273",
      },
    ],
    kind: "line" as const,
  };

  return {
    metrics: [
      {
        id: "future-goal-amount",
        label: "Inflation-adjusted goal amount",
        value: futureGoalAmount,
        format: "currency",
        currency: "INR",
        detail: `${goalLabel} goal in ${values.yearsToGoal} years`,
      },
      {
        id: "required-monthly-sip",
        label: "Required monthly SIP",
        value: requiredMonthlySip,
        format: "currency",
        currency: "INR",
        detail:
          "Estimated to reach the goal after projecting your current savings",
      },
      {
        id: "scenario-a-corpus",
        label: "Scenario A corpus",
        value: corpusAtGoalForScenarioA,
        format: "currency",
        currency: "INR",
        detail: `${formatMonthlySip(values.monthlySip)} at your return assumption`,
      },
      {
        id: "scenario-a-achievement",
        label: "Scenario A goal achievement",
        value: scenarioAAchievement,
        format: "percent",
        detail: "Projected corpus divided by the future goal amount",
      },
      {
        id: "scenario-b-corpus",
        label: "Scenario B corpus",
        value: corpusAtGoalForScenarioB,
        format: "currency",
        currency: "INR",
        detail: `${formatMonthlySip(values.comparisonSip)} at your return assumption`,
      },
      {
        id: "scenario-b-achievement",
        label: "Scenario B goal achievement",
        value: scenarioBAchievement,
        format: "percent",
        detail: "Projected corpus divided by the future goal amount",
      },
    ],
    chart,
    comparisonTable: {
      title: "Monthly SIP scenario comparison",
      description:
        "Both scenarios use the same current savings, time horizon, inflation, and annual return assumptions.",
      columns: [
        { key: "scenario", label: "Scenario", format: "text" },
        {
          key: "monthlySip",
          label: "Monthly SIP",
          format: "currency",
          currency: "INR",
        },
        {
          key: "projectedCorpus",
          label: "Corpus at goal year",
          format: "currency",
          currency: "INR",
        },
        {
          key: "goalAchievement",
          label: "Goal achievement",
          format: "percent",
        },
        {
          key: "aboveOrBelowGoal",
          label: "Above / below goal",
          format: "currency",
          currency: "INR",
        },
      ],
      rows: [
        {
          scenario: "Scenario A",
          monthlySip: values.monthlySip,
          projectedCorpus: corpusAtGoalForScenarioA,
          goalAchievement: scenarioAAchievement,
          aboveOrBelowGoal: corpusAtGoalForScenarioA - futureGoalAmount,
        },
        {
          scenario: "Scenario B",
          monthlySip: values.comparisonSip,
          projectedCorpus: corpusAtGoalForScenarioB,
          goalAchievement: scenarioBAchievement,
          aboveOrBelowGoal: corpusAtGoalForScenarioB - futureGoalAmount,
        },
      ],
    },
    yearTable: {
      title: "Year-wise corpus projection",
      description:
        "Projected values assume each monthly contribution is invested at the start of the month. These are illustrations, not guaranteed outcomes.",
      columns: [
        { key: "year", label: "Timeline", format: "text" },
        {
          key: "futureGoalAmount",
          label: "Inflation-adjusted goal",
          format: "currency",
          currency: "INR",
        },
        {
          key: "currentSavingsGrowth",
          label: "Current savings growth",
          format: "currency",
          currency: "INR",
        },
        {
          key: "scenarioACorpus",
          label: `Scenario A · ${formatMonthlySip(values.monthlySip)}`,
          format: "currency",
          currency: "INR",
        },
        {
          key: "scenarioBCorpus",
          label: `Scenario B · ${formatMonthlySip(values.comparisonSip)}`,
          format: "currency",
          currency: "INR",
        },
      ],
      rows: yearRows,
    },
  };
}

export const mutualFundGoalPlannerCalculatorDefinition: CalculatorDefinition<MutualFundGoalPlannerInputs> =
  {
    id: "mutual-fund-goal-planner",
    title: "Mutual Fund Goal Planner",
    description:
      "Plan a goal-based monthly SIP and compare two contribution scenarios using clear, illustrative assumptions.",
    schema: mutualFundGoalPlannerInputSchema,
    defaultValues: {
      goalType: "child-education",
      goalAmountToday: 2_500_000,
      yearsToGoal: 12,
      inflation: 6,
      currentSavings: 250_000,
      monthlySip: 10_000,
      comparisonSip: 15_000,
      expectedAnnualReturn: 10,
    },
    fields: [
      {
        name: "goalType",
        label: "Goal type",
        type: "select",
        options: mutualFundGoalTypes.map(({ value, label }) => ({
          value,
          label,
        })),
      },
      {
        name: "goalAmountToday",
        label: "Goal amount today",
        type: "currency",
        description: "Estimated cost of the goal in today’s rupees.",
        prefix: "₹",
        min: 1,
        max: 100_000_000_000,
        step: 10_000,
      },
      {
        name: "yearsToGoal",
        label: "Goal year",
        type: "number",
        description: "Enter how many years from today you plan to reach it.",
        suffix: "years from today",
        min: 1,
        max: 80,
        step: 1,
      },
      {
        name: "inflation",
        label: "Expected goal inflation",
        type: "percentage",
        description: "Illustrative annual increase in the goal cost.",
        suffix: "% p.a.",
        min: 0,
        max: 30,
        step: 0.1,
      },
      {
        name: "currentSavings",
        label: "Current savings for this goal",
        type: "currency",
        prefix: "₹",
        min: 0,
        max: 10_000_000_000,
        step: 10_000,
        wide: true,
      },
      {
        name: "monthlySip",
        label: "Scenario A monthly SIP",
        type: "currency",
        description: "First monthly contribution to compare.",
        prefix: "₹",
        min: 0,
        max: 100_000_000,
        step: 500,
      },
      {
        name: "comparisonSip",
        label: "Scenario B monthly SIP",
        type: "currency",
        description: "Compare a second monthly contribution.",
        prefix: "₹",
        min: 0,
        max: 100_000_000,
        step: 500,
      },
      {
        name: "expectedAnnualReturn",
        label: "Expected annual return",
        type: "percentage",
        description:
          "Illustrative annual return assumption, compounded monthly. Returns are not guaranteed.",
        suffix: "% p.a.",
        min: 0,
        max: 30,
        step: 0.1,
        wide: true,
      },
    ],
    calculate: calculateMutualFundGoalPlanner,
  };
