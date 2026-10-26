"use client";

import { CalculatorShell } from "@/features/calculators";
import { sipCalculatorDefinition } from "@/features/calculators/sip/definition";

export function SIPCalculator() {
  return <CalculatorShell definition={sipCalculatorDefinition} />;
}
