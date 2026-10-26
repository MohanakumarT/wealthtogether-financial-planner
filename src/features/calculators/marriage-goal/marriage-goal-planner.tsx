"use client";

import { CalculatorShell } from "@/features/calculators";
import { marriageGoalCalculatorDefinition } from "@/features/calculators/marriage-goal/definition";

export function MarriageGoalPlanner() {
  return <CalculatorShell definition={marriageGoalCalculatorDefinition} />;
}
