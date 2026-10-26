"use client";

import { CalculatorShell } from "@/features/calculators";
import { carPurchaseCalculatorDefinition } from "@/features/calculators/car-purchase/definition";

export function CarPurchasePlanner() {
  return <CalculatorShell definition={carPurchaseCalculatorDefinition} />;
}
