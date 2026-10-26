"use client";

import { CalculatorShell } from "@/features/calculators";
import { swpCalculatorDefinition } from "@/features/calculators/swp/definition";

export function SWPCalculator() {
  return <CalculatorShell definition={swpCalculatorDefinition} />;
}
