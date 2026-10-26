"use client";

import { CalculatorShell } from "@/features/calculators";
import { housePurchaseCalculatorDefinition } from "@/features/calculators/house-purchase/definition";

export function HousePurchasePlanner() {
  return <CalculatorShell definition={housePurchaseCalculatorDefinition} />;
}
