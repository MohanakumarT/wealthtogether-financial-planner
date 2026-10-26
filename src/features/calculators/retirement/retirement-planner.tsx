"use client";

import { CalculatorShell } from "@/features/calculators";
import { retirementCalculatorDefinition } from "@/features/calculators/retirement/definition";

export function RetirementPlanner() {
  return <CalculatorShell definition={retirementCalculatorDefinition} />;
}
