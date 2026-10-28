"use client";

import {
  Controller,
  FormProvider,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  LoaderCircle,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  consultationServices,
  financialGoals,
  meetingModes,
  riskProfiles,
} from "../constants/services";
import { useBookingWizard } from "../hooks/use-booking-wizard";
import type { ConsultationBookingInput } from "../validation/booking-schema";
import { AppointmentScheduler } from "./appointment-scheduler";
import { BookingConfirmation } from "./booking-confirmation";
import { BookingInput, ChoiceCards, ServiceChoice } from "./booking-fields";
import { BookingProgress } from "./booking-progress";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function GoalCheckboxes() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ConsultationBookingInput>();
  return (
    <Controller
      control={control}
      name="financialGoals"
      render={({ field }) => (
        <fieldset className="space-y-2">
          <legend className="text-foreground text-sm font-medium">
            Financial goals
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {financialGoals.map((goal) => {
              const selected = (field.value ?? []).includes(goal);
              return (
                <label
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs transition",
                    selected
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/30",
                  )}
                  key={goal}
                >
                  <input
                    checked={selected}
                    className="accent-primary size-4 shrink-0 rounded"
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(
                        event.target.checked
                          ? [...(field.value ?? []), goal]
                          : (field.value ?? []).filter((item) => item !== goal),
                      )
                    }
                    ref={field.ref}
                    type="checkbox"
                    value={goal}
                  />
                  <span>{goal}</span>
                </label>
              );
            })}
          </div>
          {typeof errors.financialGoals?.message === "string" ? (
            <p className="text-destructive text-xs" role="alert">
              {errors.financialGoals.message}
            </p>
          ) : null}
        </fieldset>
      )}
    />
  );
}

function NotesField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ConsultationBookingInput>();
  return (
    <div className="space-y-2">
      <label
        className="text-foreground block text-sm font-medium"
        htmlFor="consultation-notes"
      >
        What would you like to discuss during the consultation?
      </label>
      <textarea
        aria-describedby="consultation-notes-hint"
        aria-invalid={Boolean(errors.notes)}
        className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25 min-h-36 w-full resize-y rounded-xl border px-3.5 py-3 text-sm shadow-sm outline-none focus-visible:ring-2"
        id="consultation-notes"
        maxLength={1500}
        placeholder="Share the questions or decisions you would like to focus on."
        {...register("notes")}
      />
      <p className="text-muted-foreground text-xs" id="consultation-notes-hint">
        Please don’t include account numbers, passwords, or other sensitive
        credentials.
      </p>
      {errors.notes?.message ? (
        <p className="text-destructive text-xs" role="alert">
          {errors.notes.message}
        </p>
      ) : null}
    </div>
  );
}

function ReviewDetails() {
  const {
    control,
    getValues,
    register,
    formState: { errors },
  } = useFormContext<ConsultationBookingInput>();
  const values = useWatch({ control });
  const selectedService = consultationServices.find(
    (service) => service.id === values.serviceId,
  );
  const entries = (items: [string, string][]) => (
    <dl className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div className="min-w-0" key={label}>
          <dt className="text-muted-foreground text-[11px]">{label}</dt>
          <dd className="text-foreground mt-0.5 truncate text-xs font-medium">
            {value || "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
  const group = (title: string, items: [string, string][]) => (
    <div className="border-border border-t pt-4 first:border-0 first:pt-0">
      <h3 className="text-foreground text-sm font-semibold">{title}</h3>
      {entries(items)}
    </div>
  );
  const date = values.preferredDate
    ? new Date(values.preferredDate + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";
  const reviewed = getValues();
  const money = (value?: string) =>
    value ? currency.format(Number(value)) : "—";
  return (
    <div className="space-y-5">
      <div className="bg-muted/50 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              Selected service
            </p>
            <p className="text-foreground mt-1 text-sm font-semibold">
              {selectedService?.name ?? "—"}
            </p>
          </div>
          <p className="text-primary text-base font-bold">
            {selectedService?.priceLabel ?? "—"}
          </p>
        </div>
        {selectedService ? (
          <p className="text-muted-foreground mt-1 text-xs">
            {selectedService.duration} · {selectedService.mode}
          </p>
        ) : null}
      </div>
      <div className="space-y-4">
        {group("Personal details", [
          ["Name", reviewed.name],
          ["Email", reviewed.email],
          ["Mobile", reviewed.phone],
          ["WhatsApp", reviewed.whatsapp],
          ["Age", reviewed.age],
          ["Occupation", reviewed.occupation],
          ["Monthly income", money(reviewed.monthlyIncome)],
          ["City", reviewed.city],
        ])}
        {group("Financial details", [
          [
            "Invested before",
            reviewed.investmentExperience === "yes"
              ? "Yes"
              : reviewed.investmentExperience === "no"
                ? "No"
                : "—",
          ],
          ["Current monthly SIP", money(reviewed.monthlySip)],
          ["Financial goals", reviewed.financialGoals?.join(", ") ?? "—"],
          ["Monthly investment budget", money(reviewed.investmentBudget)],
          ["Risk profile", reviewed.riskProfile ?? "—"],
        ])}
        {group("Meeting details", [
          ["Preferred date", date],
          ["Preferred time", reviewed.preferredTime ?? "—"],
          ["Time zone", reviewed.timeZone ?? "—"],
          ["Meeting mode", reviewed.meetingMode ?? "—"],
        ])}
      </div>
      {values.notes ? (
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            Additional notes
          </p>
          <p className="text-foreground mt-2 text-xs leading-5 whitespace-pre-wrap">
            {values.notes}
          </p>
        </div>
      ) : null}
      <div className="border-border flex items-start gap-3 border-t pt-4">
        <input
          aria-invalid={Boolean(errors.consent)}
          className="accent-primary mt-0.5 size-4 shrink-0"
          id="booking-consent"
          type="checkbox"
          {...register("consent")}
        />
        <div>
          <label
            className="text-muted-foreground text-xs leading-5"
            htmlFor="booking-consent"
          >
            I agree that WealthTogether Investments may use these details to
            respond to and coordinate this consultation request.
          </label>
          {errors.consent?.message ? (
            <p className="text-destructive mt-1 text-xs" role="alert">
              {errors.consent.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StepContent({ step }: { step: number }) {
  switch (step) {
    case 0:
      return (
        <>
          <div>
            <h2 className="font-display text-2xl tracking-tight">
              Choose your service
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Select one option to shape your consultation.
            </p>
          </div>
          <ServiceChoice />
        </>
      );
    case 1:
      return (
        <>
          <div>
            <h2 className="font-display text-2xl tracking-tight">
              A little about you
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              We use these details to make the conversation relevant.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <BookingInput
              autoComplete="name"
              label="Full name"
              name="name"
              placeholder="Your name"
            />
            <BookingInput
              autoComplete="email"
              label="Email address"
              name="email"
              placeholder="you@example.com"
              type="email"
            />
            <BookingInput
              autoComplete="tel"
              hint="Include country code, if applicable."
              label="Mobile number"
              name="phone"
              placeholder="+91 98765 43210"
              type="tel"
            />
            <BookingInput
              autoComplete="tel"
              label="WhatsApp number"
              name="whatsapp"
              placeholder="+91 98765 43210"
              type="tel"
            />
            <BookingInput
              label="Age"
              name="age"
              placeholder="e.g. 32"
              type="number"
            />
            <BookingInput
              autoComplete="organization-title"
              label="Occupation"
              name="occupation"
              placeholder="e.g. Software engineer"
            />
            <BookingInput
              label="Monthly income (₹)"
              name="monthlyIncome"
              placeholder="e.g. 100000"
              type="number"
            />
            <BookingInput
              autoComplete="address-level2"
              label="City"
              name="city"
              placeholder="Your city"
            />
          </div>
        </>
      );
    case 2:
      return (
        <>
          <div>
            <h2 className="font-display text-2xl tracking-tight">
              Your financial profile
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              A few planning details help us prepare.
            </p>
          </div>
          <ChoiceCards
            label="Have you invested before?"
            name="investmentExperience"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <BookingInput
              hint="Enter 0 if you do not currently invest through SIPs."
              label="Current monthly SIP (₹)"
              name="monthlySip"
              placeholder="e.g. 10000"
              type="number"
            />
            <BookingInput
              hint="Approximate monthly amount you can invest."
              label="Investment budget (₹ / month)"
              name="investmentBudget"
              placeholder="e.g. 15000"
              type="number"
            />
          </div>
          <GoalCheckboxes />
          <ChoiceCards
            columns={3}
            label="Risk profile"
            name="riskProfile"
            options={riskProfiles.map((item) => ({ value: item, label: item }))}
          />
        </>
      );
    case 3:
      return (
        <>
          <div>
            <h2 className="font-display text-2xl tracking-tight">
              Schedule your meeting
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Choose a preferred date, time of day, and way to connect.
            </p>
          </div>
          <AppointmentScheduler />
          <ChoiceCards
            label="Meeting mode"
            name="meetingMode"
            options={meetingModes.map((item) => ({ value: item, label: item }))}
          />
        </>
      );
    case 4:
      return (
        <>
          <div>
            <h2 className="font-display text-2xl tracking-tight">
              Anything else to share?
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Optional context helps us prepare for your discussion.
            </p>
          </div>
          <NotesField />
          <div className="bg-muted/50 flex items-start gap-3 rounded-xl p-4">
            <CalendarDays
              aria-hidden="true"
              className="text-primary mt-0.5 size-4 shrink-0"
            />
            <p className="text-muted-foreground text-xs leading-5">
              Your selected date and time are preferences. We’ll contact you to
              confirm availability.
            </p>
          </div>
        </>
      );
    default:
      return (
        <>
          <div>
            <h2 className="font-display text-2xl tracking-tight">
              Review your request
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Check the details before sending your consultation request.
            </p>
          </div>
          <ReviewDetails />
        </>
      );
  }
}

export function ConsultationBookingWizard() {
  const wizard = useBookingWizard();
  const {
    form,
    step,
    next,
    back,
    submit,
    submitError,
    bookingReference,
    bookAnother,
  } = wizard;
  if (bookingReference) {
    const details = form.getValues();
    return (
      <BookingConfirmation
        date={details.preferredDate}
        onBookAnother={bookAnother}
        reference={bookingReference}
        time={details.preferredTime ?? ""}
        timeZone={details.timeZone}
      />
    );
  }
  return (
    <FormProvider {...form}>
      <Card className="border-border shadow-navy/5 shadow-xl">
        <CardContent className="p-5 sm:p-7">
          <form
            className="space-y-6"
            noValidate
            onSubmit={form.handleSubmit(submit)}
          >
            <BookingProgress currentStep={step} />
            <div aria-live="polite" className="min-h-[23rem] space-y-6 pt-2">
              <StepContent step={step} />
            </div>
            <input
              aria-hidden="true"
              autoComplete="off"
              className="pointer-events-none absolute -left-[10000px] size-px overflow-hidden"
              tabIndex={-1}
              type="text"
              {...form.register("website")}
            />
            {submitError ? (
              <div
                className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm"
                role="alert"
              >
                {submitError}
              </div>
            ) : null}
            <div className="border-border flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {step > 0 ? (
                  <Button onClick={back} type="button" variant="ghost">
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    Back
                  </Button>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    Takes about 3 minutes to complete.
                  </p>
                )}
              </div>
              {step < 5 ? (
                <Button onClick={next} type="button" variant="gold">
                  Continue
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
              ) : (
                <Button
                  disabled={form.formState.isSubmitting}
                  type="submit"
                  variant="gold"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send aria-hidden="true" className="size-4" />
                      Submit booking request
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-center text-[11px] leading-5">
              Your request starts with status Pending. We’ll contact you to
              confirm the appointment.
            </p>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
