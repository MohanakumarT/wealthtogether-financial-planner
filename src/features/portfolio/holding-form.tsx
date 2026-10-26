"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { familyProfileSeed } from "@/features/family/model";
import type { FamilyProfileId } from "@/features/family/model";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import {
  portfolioCategories,
  portfolioHoldingInputSchema,
  type PortfolioHolding,
  type PortfolioHoldingInput,
} from "@/features/portfolio/model";

type HoldingFormProps = {
  holding?: PortfolioHolding;
  ownerOptions: ReadonlyArray<{ id: FamilyProfileId; name: string }>;
  onSave: (values: PortfolioHoldingInput) => boolean;
  onCancel: () => void;
};

const categoryOptions = portfolioCategories.map(({ value, label }) => ({
  value,
  label,
}));
export function HoldingForm({
  holding,
  ownerOptions = familyProfileSeed,
  onSave,
  onCancel,
}: HoldingFormProps) {
  const form = useForm<
    z.input<typeof portfolioHoldingInputSchema>,
    unknown,
    PortfolioHoldingInput
  >({
    resolver: zodResolver(portfolioHoldingInputSchema),
    defaultValues: holding
      ? {
          name: holding.name,
          profileId: holding.profileId,
          category: holding.category,
          investedAmount: holding.investedAmount,
          currentValue: holding.currentValue,
          investmentDate: holding.investmentDate,
        }
      : {
          name: "",
          profileId: "self",
          category: "mutual-funds",
          investedAmount: undefined,
          currentValue: undefined,
          investmentDate: "",
        },
    mode: "onBlur",
  });

  const submit = form.handleSubmit((values) => {
    if (onSave(values)) form.reset(values);
  });

  return (
    <Card className="border-gold/40 shadow-card" id="portfolio-holding-form">
      <CardHeader className="pb-4">
        <CardTitle>{holding ? "Edit holding" : "Add a holding"}</CardTitle>
        <CardDescription>
          Enter the amounts shown by your provider. Values stay in this browser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" noValidate onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <InputField
                  autoComplete="off"
                  error={fieldState.error?.message}
                  id="portfolio-holding-name"
                  label="Investment name"
                  maxLength={100}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  placeholder="e.g. Retirement fund"
                  inputRef={field.ref}
                  value={field.value ?? ""}
                />
              )}
            />
            <Controller
              control={form.control}
              name="profileId"
              render={({ field, fieldState }) => (
                <SelectField
                  error={fieldState.error?.message}
                  id="portfolio-holding-owner"
                  label="Family member"
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  options={ownerOptions.map(({ id, name }) => ({
                    value: id,
                    label: name,
                  }))}
                  selectRef={field.ref}
                  value={field.value}
                />
              )}
            />
            <Controller
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <SelectField
                  error={fieldState.error?.message}
                  id="portfolio-holding-category"
                  label="Category"
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  options={categoryOptions}
                  selectRef={field.ref}
                  value={field.value}
                />
              )}
            />
            <Controller
              control={form.control}
              name="investmentDate"
              render={({ field, fieldState }) => (
                <InputField
                  error={fieldState.error?.message}
                  id="portfolio-holding-date"
                  label="Investment date"
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  inputRef={field.ref}
                  type="date"
                  value={field.value ?? ""}
                />
              )}
            />
            <Controller
              control={form.control}
              name="investedAmount"
              render={({ field, fieldState }) => (
                <InputField
                  error={fieldState.error?.message}
                  id="portfolio-invested-amount"
                  label="Invested amount"
                  leading="₹"
                  max={Number.MAX_SAFE_INTEGER}
                  min={0.01}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(
                      event.currentTarget.value === ""
                        ? undefined
                        : event.currentTarget.valueAsNumber,
                    )
                  }
                  inputRef={field.ref}
                  placeholder="0"
                  step="any"
                  type="number"
                  value={field.value ?? ""}
                />
              )}
            />
            <Controller
              control={form.control}
              name="currentValue"
              render={({ field, fieldState }) => (
                <InputField
                  error={fieldState.error?.message}
                  id="portfolio-current-value"
                  label="Current value"
                  leading="₹"
                  max={Number.MAX_SAFE_INTEGER}
                  min={0}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(
                      event.currentTarget.value === ""
                        ? undefined
                        : event.currentTarget.valueAsNumber,
                    )
                  }
                  inputRef={field.ref}
                  placeholder="0"
                  step="any"
                  type="number"
                  value={field.value ?? ""}
                />
              )}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={onCancel} type="button" variant="outline">
              Cancel
            </Button>
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
              variant="gold"
            >
              {holding ? "Save changes" : "Add holding"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
