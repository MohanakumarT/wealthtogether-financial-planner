"use client";

import { CalculatorShell } from "@/features/calculators";
import { stepUpSIPCalculatorDefinition } from "@/features/calculators/step-up-sip/definition";

export function StepUpSIPCalculator() {
  return <CalculatorShell definition={stepUpSIPCalculatorDefinition} />;
}
