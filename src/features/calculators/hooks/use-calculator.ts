"use client";

import { useCallback, useState } from "react";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type {
  CalculatorDefinition,
  CalculatorResult,
} from "@/features/calculators/types";

export function useCalculator<TValues extends FieldValues>(
  definition: CalculatorDefinition<TValues>,
) {
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [calculatedValues, setCalculatedValues] = useState<TValues | null>(
    null,
  );
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const form = useForm<TValues>({
    resolver: zodResolver(definition.schema) as Resolver<TValues>,
    defaultValues: definition.defaultValues,

    // Validate only when the user submits the calculator.
    mode: "onSubmit",

    // After submission, update validation while typing.
    reValidateMode: "onChange",
  });

  const calculate = form.handleSubmit((values) => {
    try {
      const nextResult = definition.calculate(values);

      setResult(nextResult);
      setCalculatedValues(values);
      setCalculationError(null);

      // Keep entered values after calculation.
      form.reset(values);
    } catch {
      setResult(null);
      setCalculatedValues(null);
      setCalculationError(
        "We couldn’t calculate this scenario. Review your inputs and try again.",
      );
    }
  });

  const reset = useCallback(() => {
    form.reset(definition.defaultValues);
    setResult(null);
    setCalculatedValues(null);
    setCalculationError(null);
  }, [definition.defaultValues, form]);

  const restore = useCallback(
    (inputValues: unknown) => {
      const parsed = definition.schema.safeParse(inputValues);

      if (!parsed.success) {
        return false;
      }

      try {
        const nextResult = definition.calculate(parsed.data);

        form.reset(parsed.data);
        setResult(nextResult);
        setCalculatedValues(parsed.data);
        setCalculationError(null);

        return true;
      } catch {
        return false;
      }
    },
    [definition, form],
  );

  return {
    form,
    result,
    calculatedValues,
    calculationError,
    calculate,
    reset,
    restore,
  };
}