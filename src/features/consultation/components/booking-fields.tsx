"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Check, CircleHelp } from "lucide-react";

import { InputField } from "@/components/ui/input-field";
import { consultationServices } from "../constants/services";
import type { ConsultationBookingInput } from "../validation/booking-schema";

export function BookingInput({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  min,
  hint,
}: {
  name:
    | "name"
    | "email"
    | "phone"
    | "whatsapp"
    | "age"
    | "occupation"
    | "monthlyIncome"
    | "city"
    | "monthlySip"
    | "investmentBudget"
    | "preferredDate";
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  min?: string;
  hint?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ConsultationBookingInput>();
  const registration = register(name);
  const { ref, ...props } = registration;
  const error = errors[name]?.message;
  return (
    <InputField
      autoComplete={autoComplete}
      error={typeof error === "string" ? error : undefined}
      hint={hint}
      inputRef={ref}
      label={label}
      min={min}
      placeholder={placeholder}
      required
      type={type}
      {...props}
    />
  );
}

export function ServiceChoice() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ConsultationBookingInput>();
  return (
    <Controller
      control={control}
      name="serviceId"
      render={({ field }) => (
        <fieldset className="space-y-3">
          <legend className="text-foreground mb-1 text-sm font-semibold">
            Choose a service
          </legend>
          <div className="grid gap-3">
            {consultationServices.map((service) => {
              const selected = field.value === service.id;
              return (
                <label
                  className={`focus-within:ring-ring/40 relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition duration-200 focus-within:ring-2 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${selected ? "border-gold bg-gold/5 ring-gold/20 ring-2" : "border-border bg-card hover:border-primary/30"}`}
                  key={service.id}
                >
                  <input
                    className="sr-only"
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={() => field.onChange(service.id)}
                    ref={field.ref}
                    type="radio"
                    value={service.id}
                    checked={selected}
                  />
                  <span
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"}`}
                  >
                    {selected ? (
                      <Check aria-hidden="true" className="size-3.5" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <span className="text-foreground text-sm leading-5 font-semibold">
                        {service.name}
                      </span>
                      <span className="text-primary text-sm font-bold">
                        {service.priceLabel}
                      </span>
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs leading-5">
                      {service.description}
                    </span>
                    <span className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium">
                      <span>{service.duration}</span>
                      {service.mode ? <span>{service.mode}</span> : null}
                    </span>
                  </span>
                  {service.featured ? (
                    <span className="bg-gold text-gold-foreground absolute -top-2.5 right-3 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wide uppercase">
                      Popular
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>
          {errors.serviceId?.message ? (
            <p className="text-destructive text-xs" role="alert">
              {errors.serviceId.message}
            </p>
          ) : null}
        </fieldset>
      )}
    />
  );
}

export function ChoiceCards({
  name,
  label,
  options,
  columns = 2,
}: {
  name:
    "investmentExperience" | "riskProfile" | "preferredTime" | "meetingMode";
  label: string;
  options: { value: string; label: string; description?: string }[];
  columns?: 2 | 3;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<ConsultationBookingInput>();
  const error = errors[name]?.message;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <fieldset className="space-y-2">
          <legend className="text-foreground text-sm font-medium">
            {label}
          </legend>
          <div
            className={`grid gap-2 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}
          >
            {options.map((option) => {
              const selected = field.value === option.value;
              return (
                <label
                  className={`focus-within:ring-ring/40 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center text-sm transition focus-within:ring-2 ${selected ? "border-primary bg-primary/5 text-foreground ring-primary/10 ring-2" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}
                  key={option.value}
                >
                  <input
                    className="sr-only"
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={() => field.onChange(option.value)}
                    ref={field.ref}
                    type="radio"
                    value={option.value}
                    checked={selected}
                  />
                  <span className="font-medium">{option.label}</span>
                  {option.description ? (
                    <CircleHelp
                      aria-label={option.description}
                      className="text-muted-foreground size-3.5 shrink-0"
                    />
                  ) : null}
                </label>
              );
            })}
          </div>
          {typeof error === "string" ? (
            <p className="text-destructive text-xs" role="alert">
              {error}
            </p>
          ) : null}
        </fieldset>
      )}
    />
  );
}
