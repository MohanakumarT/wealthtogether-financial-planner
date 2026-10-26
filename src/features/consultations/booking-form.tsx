"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import {
  consultationRequestSchema,
  consultationTimes,
  consultationTopics,
  type ConsultationRequest,
  type ConsultationRequestInput,
} from "@/features/consultations/schema";

function BookingField({
  registration,
  error,
  ...props
}: {
  registration: UseFormRegisterReturn;
  error?: string;
} & Omit<React.ComponentProps<typeof InputField>, "inputRef" | "error">) {
  const { ref, ...inputProps } = registration;
  return <InputField error={error} inputRef={ref} {...inputProps} {...props} />;
}

const selectClassName =
  "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/25 flex h-11 w-full rounded-lg border px-3.5 text-sm shadow-sm outline-none focus-visible:ring-2";

export function ConsultationBookingForm() {
  const [timeZone, setTimeZone] = useState("");
  const [minimumDate, setMinimumDate] = useState("");
  const [response, setResponse] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationRequestInput, unknown, ConsultationRequest>({
    resolver: zodResolver(consultationRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      topic: "retirement",
      preferredDate: "",
      preferredTime: "morning",
      timeZone: "",
      notes: "",
      website: "",
      consent: false,
    },
  });

  useEffect(() => {
    const browserTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const localToday = new Date();
    const today = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, "0")}-${String(localToday.getDate()).padStart(2, "0")}`;
    setTimeZone(browserTimeZone);
    setMinimumDate(today);
    setValue("timeZone", browserTimeZone, { shouldValidate: true });
  }, [setValue]);

  async function submit(values: ConsultationRequest) {
    setResponse(null);
    try {
      const result = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await result.json()) as { error?: string };
      if (!result.ok) {
        setResponse({
          kind: "error",
          text:
            data.error ??
            "Your request could not be sent. Please use one of the contact options on this page.",
        });
        return;
      }
      setResponse({
        kind: "success",
        text: "Your consultation request is in. We’ll follow up to confirm the date and time.",
      });
      reset({
        name: "",
        email: "",
        phone: "",
        topic: "retirement",
        preferredDate: "",
        preferredTime: "morning",
        timeZone,
        notes: "",
        website: "",
        consent: false,
      });
    } catch {
      setResponse({
        kind: "error",
        text: "We couldn’t connect to the booking service. Please try again or contact us directly.",
      });
    }
  }

  const name = register("name");
  const email = register("email");
  const phone = register("phone");
  const preferredDate = register("preferredDate");
  const notes = register("notes");
  const { ref: notesRef, ...notesRegistration } = notes;
  const website = register("website");
  const topic = register("topic");
  const preferredTime = register("preferredTime");
  const timeZoneField = register("timeZone");
  const consent = register("consent");

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(submit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <BookingField
          autoComplete="name"
          error={errors.name?.message}
          label="Full name"
          registration={name}
          required
        />
        <BookingField
          autoComplete="email"
          error={errors.email?.message}
          label="Email address"
          registration={email}
          required
          type="email"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <BookingField
          autoComplete="tel"
          error={errors.phone?.message}
          hint="Include your country code."
          label="Phone or WhatsApp number"
          placeholder="+91 98765 43210"
          registration={phone}
          required
          type="tel"
        />
        <div className="space-y-2">
          <label
            className="text-foreground block text-sm font-medium"
            htmlFor="consultation-topic"
          >
            Planning focus
          </label>
          <select
            aria-invalid={Boolean(errors.topic)}
            className={selectClassName}
            id="consultation-topic"
            {...topic}
          >
            {consultationTopics.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.topic?.message ? (
            <p className="text-destructive text-xs" role="alert">
              {errors.topic.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <BookingField
          error={errors.preferredDate?.message}
          label="Preferred date"
          min={minimumDate}
          registration={preferredDate}
          required
          type="date"
        />
        <div className="space-y-2">
          <label
            className="text-foreground block text-sm font-medium"
            htmlFor="consultation-time"
          >
            Preferred time
          </label>
          <select
            aria-invalid={Boolean(errors.preferredTime)}
            className={selectClassName}
            id="consultation-time"
            {...preferredTime}
          >
            {consultationTimes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-muted-foreground text-xs">
            {timeZone || "Your local time"}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <label
          className="text-foreground block text-sm font-medium"
          htmlFor="consultation-notes"
        >
          Anything you’d like us to know?
        </label>
        <textarea
          aria-invalid={Boolean(errors.notes)}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25 min-h-28 w-full resize-y rounded-lg border px-3.5 py-3 text-sm shadow-sm outline-none focus-visible:ring-2"
          id="consultation-notes"
          maxLength={1000}
          placeholder="Share a little context for the conversation."
          {...notesRegistration}
          ref={notesRef}
        />
        {errors.notes?.message ? (
          <p className="text-destructive text-xs" role="alert">
            {errors.notes.message}
          </p>
        ) : null}
      </div>
      <input
        aria-hidden="true"
        autoComplete="off"
        className="absolute -left-[10000px] size-px overflow-hidden"
        tabIndex={-1}
        type="text"
        {...website}
      />
      <input type="hidden" {...timeZoneField} />
      <div className="flex items-start gap-3">
        <input
          aria-invalid={Boolean(errors.consent)}
          className="border-input text-primary focus-visible:ring-ring accent-primary mt-0.5 size-4 shrink-0 rounded border focus-visible:ring-2 focus-visible:outline-none"
          id="consultation-consent"
          type="checkbox"
          {...consent}
        />
        <div>
          <label
            className="text-muted-foreground text-xs leading-5"
            htmlFor="consultation-consent"
          >
            I agree that WealthTogether may use these details to respond to this
            request. Please don’t include account numbers or passwords.
          </label>
          {errors.consent?.message ? (
            <p className="text-destructive mt-1 text-xs" role="alert">
              {errors.consent.message}
            </p>
          ) : null}
        </div>
      </div>
      {response ? (
        <div
          className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm leading-5 ${response.kind === "success" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-destructive/10 text-destructive"}`}
          role={response.kind === "success" ? "status" : "alert"}
        >
          {response.kind === "success" ? (
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
          ) : null}
          <span>{response.text}</span>
        </div>
      ) : null}
      <p className="text-muted-foreground text-xs leading-5">
        This is a preferred time request. We’ll confirm availability by email or
        WhatsApp.
      </p>
      <Button
        className="w-full"
        disabled={isSubmitting}
        size="lg"
        type="submit"
        variant="gold"
      >
        {isSubmitting ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Send aria-hidden="true" className="size-4" />
        )}
        {isSubmitting ? "Sending request…" : "Request a consultation"}
      </Button>
      <div className="text-muted-foreground flex items-center justify-center gap-2 text-[11px]">
        <CalendarDays aria-hidden="true" className="size-3.5" />
        No appointment is confirmed until we reply.
      </div>
    </form>
  );
}
