"use client";

import { CalculatorShell } from "@/features/calculators";
import { lumpsumCalculatorDefinition } from "@/features/calculators/lumpsum/definition";

export function LumpsumCalculator() {
  return <CalculatorShell definition={lumpsumCalculatorDefinition} />;
}
