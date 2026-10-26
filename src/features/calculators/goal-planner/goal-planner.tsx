"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Target, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalculatorActions } from "@/features/calculators/components/calculator-actions";
import { CalculatorField } from "@/features/calculators/components/calculator-field";
import { CalculatorResults } from "@/features/calculators/components/calculator-results";
import { useCalculatorActions } from "@/features/calculators/hooks/use-calculator-actions";
import { useSavedCalculation } from "@/features/calculators/hooks/use-saved-calculation";
import {
  calculateGoalPlanner,
  getGoalInputFields,
  goalCategories,
  goalPlannerCalculatorDefinition,
} from "@/features/calculators/goal-planner/definition";
import type {
  GoalCategory,
  GoalInput,
  GoalPlannerInputs,
} from "@/features/calculators/goal-planner/definition";
import type { CalculatorResult } from "@/features/calculators/types";

const maximumGoals = 8;

function createGoal(index: number): GoalInput {
  const category = goalCategories[index % goalCategories.length];
  return {
    name: `Goal ${index + 1}`,
    category: category.value,
    targetAmount: 1_000_000,
    years: 5,
    inflation: 6,
    expectedReturn: 8,
    currentSavings: 0,
  };
}

function categoryName(category: GoalCategory) {
  return (
    goalCategories.find((option) => option.value === category)?.label ??
    category
  );
}

export function GoalPlanner() {
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [calculatedValues, setCalculatedValues] =
    useState<GoalPlannerInputs | null>(null);
  const form = useForm<GoalPlannerInputs>({
    resolver: zodResolver(
      goalPlannerCalculatorDefinition.schema,
    ) as Resolver<GoalPlannerInputs>,
    defaultValues: goalPlannerCalculatorDefinition.defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goals",
  });
  const watchedGoals = useWatch({ control: form.control, name: "goals" });
  const actionDefinition = useMemo(
    () => ({
      ...goalPlannerCalculatorDefinition,
      fields: fields.flatMap((_, index) => getGoalInputFields(index)),
    }),
    [fields],
  );
  const actions = useCalculatorActions(
    actionDefinition,
    result,
    form.getValues(),
  );
  const restore = useCallback(
    (inputValues: unknown) => {
      const parsed =
        goalPlannerCalculatorDefinition.schema.safeParse(inputValues);
      if (!parsed.success) return false;
      try {
        const nextResult = calculateGoalPlanner(parsed.data);
        form.reset(parsed.data);
        setResult(nextResult);
        setCalculatedValues(parsed.data);
        return true;
      } catch {
        return false;
      }
    },
    [form],
  );
  const saved = useSavedCalculation(
    goalPlannerCalculatorDefinition,
    result,
    calculatedValues,
    restore,
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
  const goalsError = form.formState.errors.goals?.message;

  const calculate = form.handleSubmit((values) => {
    const nextResult = calculateGoalPlanner(values);
    setResult(nextResult);
    setCalculatedValues(values);
    form.reset(values);
  });

  const reset = () => {
    form.reset(goalPlannerCalculatorDefinition.defaultValues);
    setResult(null);
    setCalculatedValues(null);
    actions.clearMessage();
    saved.clear();
  };

  return (
    <section
      aria-labelledby="goal-planner-title"
      className="px-content mx-auto w-full max-w-7xl py-8 sm:py-12"
    >
      <div className="mb-7 max-w-3xl">
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          WealthTogether Investments
        </p>
        <h1
          className="font-display mt-2 text-3xl tracking-tight sm:text-4xl"
          id="goal-planner-title"
        >
          Goal Planner
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6 sm:text-base">
          Compare retirement, home, education, family, and lifestyle goals in
          one plan. Set assumptions for each goal and see their combined monthly
          savings commitment.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(20rem,.86fr)_minmax(0,1.14fr)] xl:gap-7">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Your goals</CardTitle>
            <CardDescription>
              Add at least two goals to compare. Each can have its own timeline
              and assumptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" noValidate onSubmit={calculate}>
              <div className="space-y-4">
                {fields.map((goal, index) => {
                  const category =
                    watchedGoals?.[index]?.category ?? "vacation";
                  const name =
                    watchedGoals?.[index]?.name ?? `Goal ${index + 1}`;
                  return (
                    <Card
                      className="border-border/80 bg-background/70"
                      key={goal.id}
                    >
                      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-4 sm:p-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="bg-accent text-accent-foreground grid size-10 shrink-0 place-items-center rounded-xl">
                            <Target aria-hidden="true" className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-muted-foreground text-xs">
                              {categoryName(category)} goal
                            </p>
                            <h3 className="truncate text-sm font-semibold">
                              {name || "Name this goal"}
                            </h3>
                          </div>
                        </div>
                        <Button
                          aria-label={`Remove ${name || `goal ${index + 1}`}`}
                          className="shrink-0"
                          disabled={fields.length <= 2}
                          onClick={() => remove(index)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
                        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                          {getGoalInputFields(index).map((definition) => (
                            <div
                              className={
                                definition.wide ? "sm:col-span-2" : undefined
                              }
                              key={String(definition.name)}
                            >
                              <CalculatorField
                                control={form.control}
                                definition={definition}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {goalsError ? (
                <p className="text-destructive text-sm" role="alert">
                  {goalsError}
                </p>
              ) : null}

              <Button
                className="w-full"
                disabled={fields.length >= maximumGoals}
                onClick={() => append(createGoal(fields.length))}
                type="button"
                variant="outline"
              >
                <Plus aria-hidden="true" className="size-4" />
                Add another goal
                <span className="text-muted-foreground ml-auto text-xs">
                  {fields.length}/{maximumGoals}
                </span>
              </Button>

              <div className="border-border space-y-3 border-t pt-5">
                <Button
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                  size="lg"
                  type="submit"
                  variant="gold"
                >
                  Compare goals
                </Button>
                <CalculatorActions
                  hasResult={Boolean(result)}
                  canSave={
                    Boolean(result && calculatedValues) &&
                    !form.formState.isDirty
                  }
                  authStatus={saved.status}
                  onPrepareSave={saved.prepareSave}
                  savedId={saved.savedId}
                  savedName={saved.savedName}
                  saveBusy={saved.busy}
                  saveMessage={saved.message}
                  loginHref="/auth/login?next=%2Fcalculators%2Fgoal-planner"
                  message={actions.message}
                  onDownload={actions.downloadPdf}
                  onReset={reset}
                  onShare={actions.share}
                  onSave={saved.save}
                />
              </div>
            </form>
          </CardContent>
        </Card>

        <div aria-live="polite" className="min-w-0 space-y-4">
          <CalculatorResults result={result} />
          <p className="text-muted-foreground px-1 text-[11px] leading-5">
            Projections are illustrative. Each goal is calculated independently
            using its inflation, expected return, and existing savings
            assumptions. Fees, taxes, and market variability are not included.
          </p>
        </div>
      </div>
    </section>
  );
}
