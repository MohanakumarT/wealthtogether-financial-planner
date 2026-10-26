"use client";

import { lazy, Suspense } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { NumberCard } from "@/components/ui/number-card";
import { CalculatorYearTable } from "@/features/calculators/components/calculator-year-table";
import { formatCalculatorValue } from "@/features/calculators/format";
import type { CalculatorResult } from "@/features/calculators/types";

const CalculatorChart = lazy(() =>
  import("@/features/calculators/components/calculator-chart").then(
    (module) => ({ default: module.CalculatorChart }),
  ),
);

function ChartLoadingPlaceholder() {
  return (
    <Card aria-label="Loading chart" className="min-h-72 animate-pulse">
      <CardContent className="p-6">
        <div className="bg-muted h-5 w-48 rounded" />
        <div className="bg-muted mt-6 h-48 rounded-xl" />
      </CardContent>
    </Card>
  );
}

export function CalculatorResults({
  result,
}: {
  result: CalculatorResult | null;
}) {
  if (!result) {
    return (
      <Card className="flex min-h-72 items-center justify-center border-dashed shadow-none">
        <CardContent className="max-w-sm p-8 text-center">
          <p className="font-display text-2xl">
            Your results will appear here.
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Enter your assumptions and calculate a scenario to see the summary,
            chart, and year-by-year projection.
          </p>
        </CardContent>
      </Card>
    );
  }

  const charts = result.charts ?? [result.chart];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {result.metrics.map((metric) => (
          <NumberCard
            change={metric.change}
            changeDirection={metric.changeDirection}
            detail={metric.detail}
            key={metric.id}
            label={metric.label}
            value={formatCalculatorValue(
              metric.value,
              metric.format,
              metric.currency,
            )}
          />
        ))}
      </div>
      {charts.map((chart) => (
        <Suspense fallback={<ChartLoadingPlaceholder />} key={chart.title}>
          <CalculatorChart chart={chart} />
        </Suspense>
      ))}
      {result.comparisonTable ? (
        <CalculatorYearTable table={result.comparisonTable} />
      ) : null}
      <CalculatorYearTable table={result.yearTable} />
    </div>
  );
}
