"use client";

import { useCallback, useEffect, useRef } from "react";

import { CalculatorActions } from "@/features/calculators/components/calculator-actions";
import { CalculatorField } from "@/features/calculators/components/calculator-field";
import { CalculatorResults } from "@/features/calculators/components/calculator-results";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCalculator } from "@/features/calculators/hooks/use-calculator";
import { useCalculatorActions } from "@/features/calculators/hooks/use-calculator-actions";
import { useSavedCalculation } from "@/features/calculators/hooks/use-saved-calculation";
import { calculatorRoutes } from "@/features/calculators/saved/saved-calculations";
import { createCalculatorAssistantContext } from "@/features/financial-assistant/context";
import { FinancialAssistant } from "@/features/financial-assistant/financial-assistant";
import type { CalculatorDefinition } from "@/features/calculators/types";
import type { FieldValues } from "react-hook-form";

function readFieldValue(values: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object")
      return (current as Record<string, unknown>)[key];
    return undefined;
  }, values);
}

export function CalculatorShell<TValues extends FieldValues>({
  definition,
}: {
  definition: CalculatorDefinition<TValues>;
}) {
  const calculator = useCalculator(definition);
  const watchedValues = calculator.form.watch();
  const visibleFields = definition.fields.filter((field) => {
    if (!field.visibleWhen) return true;
    return (
      readFieldValue(watchedValues, String(field.visibleWhen.field)) ===
      field.visibleWhen.equals
    );
  });
  const actions = useCalculatorActions(
    definition,
    calculator.result,
    calculator.form.getValues(),
  );
  const saved = useSavedCalculation(
    definition,
    calculator.result,
    calculator.calculatedValues,
    calculator.restore,
  );
  const getAssistantContext = useCallback(
    () =>
      createCalculatorAssistantContext(definition, calculator.form.getValues()),
    [calculator.form, definition],
  );
  const editRequested = useRef(false);
  const loadSavedCalculation = saved.load;

  useEffect(() => {
    if (editRequested.current) return;
    const id = new URLSearchParams(window.location.search).get("edit");
    if (!id) return;
    editRequested.current = true;
    void loadSavedCalculation(id);
  }, [loadSavedCalculation]);

  const route = calculatorRoutes[definition.id];
  const loginHref = route
    ? `/auth/login?next=${encodeURIComponent(`/calculators/${route}`)}`
    : "/auth/login?next=%2Fhistory";

  return (
    <section
      aria-labelledby="calculator-title"
      className="px-content mx-auto w-full max-w-7xl py-8 sm:py-12"
    >
      <div className="mb-7 max-w-3xl">
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          WealthTogether Investments
        </p>
        <h1
          className="font-display mt-2 text-3xl tracking-tight sm:text-4xl"
          id="calculator-title"
        >
          {definition.title}
        </h1>
        {definition.description ? (
          <p className="text-muted-foreground mt-3 text-sm leading-6 sm:text-base">
            {definition.description}
          </p>
        ) : null}
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(18rem,.78fr)_minmax(0,1.22fr)] xl:gap-7">
        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Explore your scenario</CardTitle>
            <CardDescription>
              Adjust the assumptions to see how the picture changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              noValidate
              onSubmit={calculator.calculate}
            >
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {visibleFields.map((field) => (
                  <div
                    className={
                      field.wide
                        ? "sm:col-span-2 lg:col-span-1 xl:col-span-2"
                        : undefined
                    }
                    key={String(field.name)}
                  >
                    <CalculatorField
                      control={calculator.form.control}
                      definition={field}
                    />
                  </div>
                ))}
              </div>
              {calculator.calculationError ? (
                <p className="text-destructive text-sm" role="alert">
                  {calculator.calculationError}
                </p>
              ) : null}
              <div className="border-border space-y-3 border-t pt-5">
                <Button
                  className="w-full"
                  disabled={calculator.form.formState.isSubmitting}
                  size="lg"
                  type="submit"
                  variant="gold"
                >
                  Calculate scenario
                </Button>
                <CalculatorActions
                  hasResult={Boolean(calculator.result)}
                  message={actions.message}
                  onDownload={actions.downloadPdf}
                  onReset={() => {
                    calculator.reset();
                    actions.clearMessage();
                    saved.clear();
                  }}
                  onShare={actions.share}
                  authStatus={saved.status}
                  onPrepareSave={saved.prepareSave}
                  savedId={saved.savedId}
                  savedName={saved.savedName}
                  saveBusy={saved.busy}
                  saveMessage={saved.message}
                  loginHref={loginHref}
                  onSave={saved.save}
                  canSave={
                    Boolean(calculator.result && calculator.calculatedValues) &&
                    !calculator.form.formState.isDirty
                  }
                />
              </div>
            </form>
          </CardContent>
        </Card>
        <div aria-live="polite" className="min-w-0 space-y-4">
          <CalculatorResults result={calculator.result} />
          <p className="text-muted-foreground px-1 text-[11px] leading-5">
            Estimates are illustrative and depend on the assumptions entered.
            They are for educational planning only and are not investment, tax,
            or legal advice.
          </p>
        </div>
      </div>
      <FinancialAssistant
        calculatorId={definition.id}
        calculatorName={definition.title}
        getContext={getAssistantContext}
      />
    </section>
  );
}
