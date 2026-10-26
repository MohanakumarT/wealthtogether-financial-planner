import type { CalculatorValueFormat } from "@/features/calculators/types";

export function formatCalculatorValue(
  value: number | string | null | undefined,
  format: CalculatorValueFormat = "number",
  currency = "USD",
) {
  if (value === null || value === undefined || value === "") return "—";
  if (format === "text" || typeof value === "string") return String(value);
  if (!Number.isFinite(value)) return "—";

  try {
    return new Intl.NumberFormat(
      currency.toUpperCase() === "INR" ? "en-IN" : "en-US",
      {
        style:
          format === "currency"
            ? "currency"
            : format === "percent"
              ? "percent"
              : "decimal",
        currency: format === "currency" ? currency : undefined,
        maximumFractionDigits: format === "currency" ? 0 : 2,
      },
    ).format(value);
  } catch {
    return String(value);
  }
}

export function formatCompactCalculatorValue(
  value: number,
  format: CalculatorValueFormat = "number",
  currency = "USD",
) {
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat(
      currency.toUpperCase() === "INR" ? "en-IN" : "en-US",
      {
        style: format === "currency" ? "currency" : "decimal",
        currency: format === "currency" ? currency : undefined,
        notation: "compact",
        maximumFractionDigits: 1,
      },
    ).format(value);
  } catch {
    return String(value);
  }
}
