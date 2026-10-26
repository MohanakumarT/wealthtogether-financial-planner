import { z } from "zod";

import type {
  CalculatorDefinition,
  CalculatorResult,
} from "@/features/calculators/types";
import {
  futureValueAtAnnualRate,
  projectMonthlyBalance,
  requiredMonthlyContribution,
} from "@/features/calculators/finance";

export const carPurchaseInputSchema = z.object({
  carCost: z.number().positive().max(100_000_000),
  yearsUntilPurchase: z.number().int().min(1).max(30),
  carInflation: z.number().min(0).max(20),
  downPaymentPercent: z.number().min(5).max(90),
  expectedReturn: z.number().min(0).max(30),
  currentSavings: z.number().min(0).max(1_000_000_000),
  loanInterest: z.number().min(0).max(40),
  loanTermYears: z.number().int().min(1).max(15),
});

export type CarPurchaseInputs = z.infer<typeof carPurchaseInputSchema>;

function getEMI(principal: number, annualRatePercent: number, months: number) {
  if (principal <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const growth = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * growth) / (growth - 1);
}

export function calculateCarPurchase(
  values: CarPurchaseInputs,
): CalculatorResult {
  const monthsUntilPurchase = values.yearsUntilPurchase * 12;
  const monthlyInvestmentRate = values.expectedReturn / 100 / 12;
  const futureCarCost = futureValueAtAnnualRate(
    values.carCost,
    values.carInflation / 100,
    values.yearsUntilPurchase,
  );
  const downPaymentTarget = futureCarCost * (values.downPaymentPercent / 100);
  const futureExistingSavings = projectMonthlyBalance(
    values.currentSavings,
    0,
    monthlyInvestmentRate,
    monthsUntilPurchase,
  );
  const cashSIP = requiredMonthlyContribution(
    futureCarCost,
    futureExistingSavings,
    monthlyInvestmentRate,
    monthsUntilPurchase,
  );
  const downPaymentSIP = requiredMonthlyContribution(
    downPaymentTarget,
    futureExistingSavings,
    monthlyInvestmentRate,
    monthsUntilPurchase,
  );
  const loanAmount = futureCarCost - downPaymentTarget;
  const loanMonths = values.loanTermYears * 12;
  const monthlyEMI = getEMI(loanAmount, values.loanInterest, loanMonths);
  const totalLoanInterest = monthlyEMI * loanMonths - loanAmount;
  const goalProgress = Math.min(
    100,
    (futureExistingSavings / downPaymentTarget) * 100,
  );

  const chartData: Array<Record<string, string | number>> = [];
  const timelineRows: Array<Record<string, string | number | null>> = [];
  for (let year = 0; year <= values.yearsUntilPurchase; year += 1) {
    const futurePrice = futureValueAtAnnualRate(
      values.carCost,
      values.carInflation / 100,
      year,
    );
    const currentDownPaymentGoal =
      futurePrice * (values.downPaymentPercent / 100);
    const downPaymentSavings = projectMonthlyBalance(
      values.currentSavings,
      downPaymentSIP,
      monthlyInvestmentRate,
      year * 12,
    );
    const cashSavings = projectMonthlyBalance(
      values.currentSavings,
      cashSIP,
      monthlyInvestmentRate,
      year * 12,
    );
    chartData.push({
      year,
      downPaymentSavings,
      cashSavings,
      downPaymentGoal: currentDownPaymentGoal,
      cashGoal: futurePrice,
    });
    if (year === 0) continue;
    timelineRows.push({
      year: `Year ${year}`,
      futureCarCost: futurePrice,
      downPaymentGoal: currentDownPaymentGoal,
      downPaymentSavings,
      cashSavings,
    });
  }

  const chart = {
    title: "Compare your car savings paths",
    description:
      "Projected savings for a cash purchase and a financed purchase compared with each goal over time.",
    xKey: "year",
    valueFormat: "currency" as const,
    currency: "INR",
    data: chartData,
    series: [
      {
        key: "downPaymentSavings",
        label: "Savings for down payment",
        color: "#4D78B8",
      },
      {
        key: "downPaymentGoal",
        label: "Down payment goal",
        color: "#D4AF37",
      },
      { key: "cashSavings", label: "Savings to buy cash", color: "#4D9273" },
      { key: "cashGoal", label: "Full car cost", color: "#A879B6" },
    ],
    kind: "line" as const,
  };

  return {
    metrics: [
      {
        id: "future-car-cost",
        label: "Future car cost",
        value: futureCarCost,
        format: "currency",
        currency: "INR",
        detail: `In ${values.yearsUntilPurchase} years at ${values.carInflation}% annual inflation`,
      },
      {
        id: "required-sip",
        label: "Required monthly SIP",
        value: downPaymentSIP,
        format: "currency",
        currency: "INR",
        detail: `To build the ${values.downPaymentPercent}% down payment`,
      },
      {
        id: "monthly-emi",
        label: "Estimated monthly EMI",
        value: monthlyEMI,
        format: "currency",
        currency: "INR",
        detail: `${values.loanTermYears}-year loan at ${values.loanInterest}% p.a.`,
      },
      {
        id: "goal-progress",
        label: "Down payment progress",
        value: `${goalProgress.toFixed(0)}%`,
        format: "text",
        detail: `Current savings projected to cover ${((futureExistingSavings / downPaymentTarget) * 100).toFixed(0)}% of the future target`,
      },
    ],
    chart,
    comparisonTable: {
      title: "Cash purchase vs financing",
      description:
        "Compare the monthly saving goal and vehicle loan costs under the selected assumptions.",
      columns: [
        { key: "scenario", label: "Scenario", format: "text" },
        {
          key: "savingsTarget",
          label: "Savings target",
          format: "currency",
          currency: "INR",
        },
        {
          key: "monthlySIP",
          label: "Monthly SIP",
          format: "currency",
          currency: "INR",
        },
        {
          key: "loanAmount",
          label: "Loan amount",
          format: "currency",
          currency: "INR",
        },
        {
          key: "monthlyEMI",
          label: "Monthly EMI",
          format: "currency",
          currency: "INR",
        },
        {
          key: "totalInterest",
          label: "Total loan interest",
          format: "currency",
          currency: "INR",
        },
      ],
      rows: [
        {
          scenario: "Save and buy with cash",
          savingsTarget: futureCarCost,
          monthlySIP: cashSIP,
          loanAmount: 0,
          monthlyEMI: 0,
          totalInterest: 0,
        },
        {
          scenario: `Save ${values.downPaymentPercent}% and finance the rest`,
          savingsTarget: downPaymentTarget,
          monthlySIP: downPaymentSIP,
          loanAmount,
          monthlyEMI,
          totalInterest: totalLoanInterest,
        },
      ],
    },
    yearTable: {
      title: "Car purchase savings timeline",
      description:
        "Annual progress for the cash and financed purchase paths, including their inflation-adjusted targets.",
      columns: [
        { key: "year", label: "Timeline", format: "text" },
        {
          key: "futureCarCost",
          label: "Estimated car cost",
          format: "currency",
          currency: "INR",
        },
        {
          key: "downPaymentGoal",
          label: "Down payment goal",
          format: "currency",
          currency: "INR",
        },
        {
          key: "downPaymentSavings",
          label: "Down payment savings",
          format: "currency",
          currency: "INR",
        },
        {
          key: "cashSavings",
          label: "Cash purchase savings",
          format: "currency",
          currency: "INR",
        },
      ],
      rows: timelineRows,
    },
  };
}

export const carPurchaseCalculatorDefinition: CalculatorDefinition<CarPurchaseInputs> =
  {
    id: "car-purchase-planner",
    title: "Car Purchase Planner",
    description:
      "Compare saving for a car outright with saving for a down payment and financing the balance.",
    schema: carPurchaseInputSchema,
    defaultValues: {
      carCost: 1_500_000,
      yearsUntilPurchase: 3,
      carInflation: 5,
      downPaymentPercent: 20,
      expectedReturn: 8,
      currentSavings: 100_000,
      loanInterest: 9,
      loanTermYears: 5,
    },
    fields: [
      {
        name: "carCost",
        label: "Car cost today",
        type: "currency",
        description: "Estimated on-road price in today’s money.",
        prefix: "₹",
        min: 1,
        max: 100_000_000,
        step: 10_000,
        wide: true,
      },
      {
        name: "yearsUntilPurchase",
        label: "Years until purchase",
        type: "number",
        suffix: "years",
        min: 1,
        max: 30,
        step: 1,
      },
      {
        name: "carInflation",
        label: "Car price inflation",
        type: "percentage",
        suffix: "% p.a.",
        min: 0,
        max: 20,
        step: 0.1,
      },
      {
        name: "downPaymentPercent",
        label: "Down payment",
        type: "percentage",
        description: "Percentage of the future car price.",
        suffix: "%",
        min: 5,
        max: 90,
        step: 1,
      },
      {
        name: "expectedReturn",
        label: "Expected return",
        type: "percentage",
        description: "Illustrative return for the car savings fund.",
        suffix: "% p.a.",
        min: 0,
        max: 30,
        step: 0.1,
      },
      {
        name: "currentSavings",
        label: "Current car savings",
        type: "currency",
        description: "Existing savings set aside for this purchase.",
        prefix: "₹",
        min: 0,
        max: 1_000_000_000,
        step: 10_000,
        wide: true,
      },
      {
        name: "loanInterest",
        label: "Car loan interest rate",
        type: "percentage",
        suffix: "% p.a.",
        min: 0,
        max: 40,
        step: 0.1,
      },
      {
        name: "loanTermYears",
        label: "Loan term",
        type: "number",
        suffix: "years",
        min: 1,
        max: 15,
        step: 1,
      },
    ],
    calculate: calculateCarPurchase,
  };
