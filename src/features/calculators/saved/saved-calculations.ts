import type { CalculatorMetric } from "@/features/calculators/types";

export type SavedCalculationRecord = {
  id: string;
  user_id: string;
  calculator_id: string;
  calculator_title: string;
  name: string;
  inputs: unknown;
  results: { metrics: CalculatorMetric[] };
  created_at: string;
  updated_at: string;
};

export const calculatorRoutes: Record<string, string> = {
  "sip-calculator": "sip",
  "lumpsum-calculator": "lumpsum",
  "step-up-sip-calculator": "step-up-sip",
  "retirement-planner": "retirement",
  "child-education-planner": "child-education",
  "house-purchase-planner": "house-purchase",
  "car-purchase-planner": "car-purchase",
  "marriage-goal-planner": "marriage-goal",
  "emergency-fund-calculator": "emergency-fund",
  "inflation-calculator": "inflation",
  "swp-calculator": "swp",
  "goal-planner": "goal-planner",
  "mutual-fund-goal-planner": "mutual-fund-goal-planner",
};
