"use client";

import { CalculatorShell } from "@/features/calculators";
import { educationCalculatorDefinition } from "@/features/calculators/education/definition";

export function ChildEducationPlanner() {
  return <CalculatorShell definition={educationCalculatorDefinition} />;
}
