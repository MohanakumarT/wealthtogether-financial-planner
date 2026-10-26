import { z } from "zod";

import { familyProfileIds } from "@/features/family/model";

export const portfolioCategories = [
  { value: "mutual-funds", label: "Mutual Funds", color: "#4D78B8" },
  { value: "stocks", label: "Stocks", color: "#D4AF37" },
  { value: "fixed-deposits", label: "Fixed Deposits", color: "#4D9273" },
  { value: "ppf", label: "PPF", color: "#A879B6" },
  { value: "epf", label: "EPF", color: "#548AA6" },
  { value: "nps", label: "NPS", color: "#D88450" },
  { value: "gold", label: "Gold", color: "#C69B24" },
  { value: "cash", label: "Cash", color: "#8090A5" },
] as const;

const portfolioCategorySchema = z.enum([
  "mutual-funds",
  "stocks",
  "fixed-deposits",
  "ppf",
  "epf",
  "nps",
  "gold",
  "cash",
]);
const familyProfileIdSchema = z.enum(familyProfileIds).default("self");

function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const portfolioHoldingFieldsSchema = z.object({
  name: z.string().trim().min(1, "Enter an investment name.").max(100),
  profileId: familyProfileIdSchema,
  category: portfolioCategorySchema,
  investedAmount: z
    .number()
    .positive("Invested amount must be greater than zero.")
    .max(Number.MAX_SAFE_INTEGER),
  currentValue: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  investmentDate: z.iso.date(),
});

function validateInvestmentDate(
  values: { investmentDate: string },
  context: z.RefinementCtx,
) {
  if (values.investmentDate > localToday()) {
    context.addIssue({
      code: "custom",
      message: "Investment date cannot be in the future.",
      path: ["investmentDate"],
    });
  }
}

export const portfolioHoldingInputSchema =
  portfolioHoldingFieldsSchema.superRefine(validateInvestmentDate);

export const portfolioHoldingSchema = z
  .object({
    ...portfolioHoldingFieldsSchema.shape,
    id: z.string().min(1).max(100),
  })
  .superRefine(validateInvestmentDate);

export type PortfolioCategory = z.infer<typeof portfolioCategorySchema>;
export type PortfolioHoldingInput = z.infer<typeof portfolioHoldingInputSchema>;
export type PortfolioHolding = z.infer<typeof portfolioHoldingSchema>;

export type PortfolioCategorySummary = {
  category: PortfolioCategory;
  label: string;
  investedAmount: number;
  currentValue: number;
  gainLoss: number;
  allocation: number;
};

export function getCategoryLabel(category: PortfolioCategory) {
  return (
    portfolioCategories.find((option) => option.value === category)?.label ??
    category
  );
}

export function formatPortfolioCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPortfolioPercent(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value);
}

export function formatPortfolioDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function summarizePortfolio(holdings: PortfolioHolding[]) {
  const investedAmount = holdings.reduce(
    (total, holding) => total + holding.investedAmount,
    0,
  );
  const currentValue = holdings.reduce(
    (total, holding) => total + holding.currentValue,
    0,
  );
  const gainLoss = currentValue - investedAmount;

  const categorySummaries: PortfolioCategorySummary[] = portfolioCategories.map(
    ({ value, label }) => {
      const items = holdings.filter((holding) => holding.category === value);
      const categoryInvested = items.reduce(
        (total, holding) => total + holding.investedAmount,
        0,
      );
      const categoryCurrent = items.reduce(
        (total, holding) => total + holding.currentValue,
        0,
      );
      return {
        category: value,
        label,
        investedAmount: categoryInvested,
        currentValue: categoryCurrent,
        gainLoss: categoryCurrent - categoryInvested,
        allocation: currentValue > 0 ? categoryCurrent / currentValue : 0,
      };
    },
  );

  return {
    investedAmount,
    currentValue,
    gainLoss,
    gainLossPercent: investedAmount > 0 ? gainLoss / investedAmount : 0,
    holdingsCount: holdings.length,
    categorySummaries,
  };
}
