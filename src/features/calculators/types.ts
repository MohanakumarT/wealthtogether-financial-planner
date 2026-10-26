import type { DefaultValues, FieldValues, Path } from "react-hook-form";
import type { ZodType } from "zod";

export type CalculatorValueFormat = "currency" | "number" | "percent" | "text";

export type CalculatorInputField<TValues extends FieldValues> = {
  name: Path<TValues>;
  label: string;
  type: "number" | "currency" | "percentage" | "text" | "date" | "select";
  description?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number | "any";
  wide?: boolean;
  options?: Array<{ label: string; value: string }>;
  visibleWhen?: { field: Path<TValues>; equals: string | number | boolean };
};

export type CalculatorMetric = {
  id: string;
  label: string;
  value: number | string;
  format?: CalculatorValueFormat;
  currency?: string;
  detail?: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
};

export type CalculatorChartSeries = {
  key: string;
  label: string;
  color?: string;
};

export type CalculatorChart = {
  title: string;
  description?: string;
  xKey: string;
  valueFormat?: CalculatorValueFormat;
  currency?: string;
  data: Array<Record<string, string | number>>;
  series: CalculatorChartSeries[];
  kind?: "line" | "area" | "bar";
};

export type CalculatorTableColumn = {
  key: string;
  label: string;
  format?: CalculatorValueFormat;
  currency?: string;
};

export type CalculatorYearTable = {
  title: string;
  description?: string;
  columns: CalculatorTableColumn[];
  rows: Array<Record<string, string | number | null>>;
};

export type CalculatorResult = {
  metrics: CalculatorMetric[];
  chart: CalculatorChart;
  charts?: CalculatorChart[];
  yearTable: CalculatorYearTable;
  comparisonTable?: CalculatorYearTable;
};

export type CalculatorDefinition<TValues extends FieldValues> = {
  id: string;
  title: string;
  description?: string;
  schema: ZodType<TValues, TValues>;
  defaultValues: DefaultValues<TValues>;
  fields: CalculatorInputField<TValues>[];
  calculate: (values: TValues) => CalculatorResult;
};
