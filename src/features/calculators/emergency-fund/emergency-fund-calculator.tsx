"use client";

import { CalculatorShell } from "@/features/calculators";
import { emergencyFundCalculatorDefinition } from "@/features/calculators/emergency-fund/definition";

export function EmergencyFundCalculator() {
  return <CalculatorShell definition={emergencyFundCalculatorDefinition} />;
}
