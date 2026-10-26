"use client";

import { Controller, type Control, type FieldValues } from "react-hook-form";

import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import type { CalculatorInputField as CalculatorInputFieldDefinition } from "@/features/calculators/types";

export function CalculatorField<TValues extends FieldValues>({
  control,
  definition,
}: {
  control: Control<TValues>;
  definition: CalculatorInputFieldDefinition<TValues>;
}) {
  return (
    <Controller
      control={control}
      name={definition.name}
      render={({ field, fieldState }) => {
        if (definition.type === "select") {
          return (
            <SelectField
              error={fieldState.error?.message}
              hint={definition.description}
              id={`calculator-${String(definition.name).replaceAll(".", "-")}`}
              label={definition.label}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              options={definition.options ?? []}
              selectRef={field.ref}
              value={
                field.value === null || field.value === undefined
                  ? ""
                  : String(field.value)
              }
            />
          );
        }

        const inputType =
          definition.type === "date"
            ? "date"
            : definition.type === "text"
              ? "text"
              : "number";
        return (
          <InputField
            error={fieldState.error?.message}
            hint={definition.description}
            id={`calculator-${String(definition.name).replaceAll(".", "-")}`}
            inputRef={field.ref}
            label={definition.label}
            leading={definition.prefix}
            max={definition.max}
            min={definition.min}
            name={field.name}
            onBlur={field.onBlur}
            onChange={(event) => {
              if (inputType !== "number") {
                field.onChange(event.currentTarget.value);
                return;
              }
              field.onChange(
                event.currentTarget.value === ""
                  ? undefined
                  : event.currentTarget.valueAsNumber,
              );
            }}
            placeholder={definition.placeholder}
            step={definition.step}
            trailing={definition.suffix}
            type={inputType}
            value={
              field.value === null || field.value === undefined
                ? ""
                : String(field.value)
            }
          />
        );
      }}
    />
  );
}
