"use client";

import { CalculatorShell } from "@/features/calculators";
import { inflationCalculatorDefinition } from "@/features/calculators/inflation/definition";

export function InflationCalculator() {
  return <CalculatorShell definition={inflationCalculatorDefinition} />;
}
