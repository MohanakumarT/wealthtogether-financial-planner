"use client";

import { CalculatorShell } from "@/features/calculators/components/calculator-shell";
import { mutualFundGoalPlannerCalculatorDefinition } from "@/features/calculators/mutual-fund-goal-planner/definition";

export function MutualFundGoalPlanner() {
  return (
    <CalculatorShell definition={mutualFundGoalPlannerCalculatorDefinition} />
  );
}
