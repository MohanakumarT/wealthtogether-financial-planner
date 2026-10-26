import type { FieldValues } from "react-hook-form";

import type {
  CalculatorDefinition,
  CalculatorMetric,
  CalculatorResult,
} from "@/features/calculators/types";

const maximumContextLength = 12_000;

function selectRows(rows: Array<Record<string, string | number | null>>) {
  if (rows.length <= 4) return rows;
  const middle = Math.floor((rows.length - 1) / 2);
  return [rows[0], rows[middle], rows[rows.length - 1]];
}

function selectChartPoints(result: CalculatorResult) {
  return (result.charts ?? [result.chart]).map((chart) => {
    const { data } = chart;
    const selectedIndexes = new Set([
      0,
      Math.floor((data.length - 1) / 2),
      data.length - 1,
    ]);

    return {
      title: chart.title,
      series: chart.series.map(({ key, label }) => ({ key, label })),
      points: data.filter((_, index) => selectedIndexes.has(index)),
    };
  });
}

function metricSnapshot(metrics: CalculatorMetric[]) {
  return metrics.map(({ label, value, format, currency, detail }) => ({
    label,
    value,
    format,
    currency,
    detail,
  }));
}

export function createCalculatorAssistantContext<TValues extends FieldValues>(
  definition: CalculatorDefinition<TValues>,
  rawValues: TValues,
) {
  const parsed = definition.schema.safeParse(rawValues);
  if (!parsed.success) return null;

  try {
    const result = definition.calculate(parsed.data);
    const scenario: Record<string, unknown> = {
      calculator: definition.title,
      inputs: parsed.data,
      results: metricSnapshot(result.metrics),
      chartProjections: selectChartPoints(result),
      yearWiseExcerpt: {
        title: result.yearTable.title,
        rows: selectRows(result.yearTable.rows),
      },
      comparison: result.comparisonTable
        ? {
            title: result.comparisonTable.title,
            columns: result.comparisonTable.columns.map(({ key, label }) => ({
              key,
              label,
            })),
            rows: result.comparisonTable.rows,
          }
        : undefined,
    };

    const monthlyInputKey = ["monthlySip", "monthlyContribution"].find(
      (key) =>
        typeof (parsed.data as Record<string, unknown>)[key] === "number",
    );
    if (monthlyInputKey) {
      const amount = (parsed.data as Record<string, number>)[monthlyInputKey];
      const alternative = definition.schema.safeParse({
        ...parsed.data,
        [monthlyInputKey]: amount * 1.1,
      });
      if (alternative.success) {
        scenario.whatIf = {
          assumption:
            "Starting monthly contribution increased by 10%, with all other inputs unchanged.",
          inputs: { [monthlyInputKey]: amount * 1.1 },
          results: metricSnapshot(
            definition.calculate(alternative.data).metrics,
          ),
        };
      }
    }

    const context = JSON.stringify(scenario);
    return context.length <= maximumContextLength ? context : null;
  } catch {
    return null;
  }
}
