"use client";

import { useEffect, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ArrowLeft, ArrowRight, Clock3, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { appointmentTimeSlots } from "../constants/services";
import type { ConsultationBookingInput } from "../validation/booking-schema";

type AvailabilityResponse = { availableSlots?: string[]; error?: string };

function localDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function monthKey(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

export function AppointmentScheduler() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ConsultationBookingInput>();
  const selectedDate = useWatch({ control, name: "preferredDate" });
  const selectedTime = useWatch({ control, name: "preferredTime" });
  const timeZone = useWatch({ control, name: "timeZone" });
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = localDateKey(today);

  useEffect(() => {
    if (!selectedDate || !timeZone) {
      setAvailableSlots([]);
      setAvailabilityError(null);
      return;
    }

    const controller = new AbortController();
    setLoadingSlots(true);
    setAvailabilityError(null);
    const query = new URLSearchParams({ date: selectedDate, timeZone });

    fetch("/api/consultation-bookings/availability?" + query.toString(), {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as AvailabilityResponse;
        if (!response.ok) {
          throw new Error(
            result.error ?? "Appointment times could not be loaded.",
          );
        }
        return result;
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        const slots = (result.availableSlots ?? []).filter((slot) =>
          (appointmentTimeSlots as readonly string[]).includes(slot),
        );
        setAvailableSlots(slots);
        if (selectedTime && !slots.includes(selectedTime)) {
          setValue("preferredTime", undefined, { shouldValidate: true });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setAvailableSlots([]);
        setAvailabilityError(
          error instanceof Error
            ? error.message
            : "Appointment times could not be loaded.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSlots(false);
      });

    return () => controller.abort();
  }, [selectedDate, selectedTime, setValue, timeZone]);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const dateCells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (dateCells.length % 7 !== 0) dateCells.push(null);
  const monthLabel = month.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const previousMonth = new Date(year, monthIndex - 1, 1);
  const canGoBack = monthKey(previousMonth) >= monthKey(today);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">
          Pick a date and time
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Appointments are available Monday through Saturday. Times are shown in{" "}
          {timeZone || "your local time zone"}.
        </p>
      </div>

      <Controller
        control={control}
        name="preferredDate"
        render={({ field }) => (
          <fieldset className="space-y-3">
            <legend className="text-foreground text-sm font-semibold">
              Preferred date
            </legend>
            <div className="border-border bg-card rounded-2xl border p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <Button
                  aria-label="Previous month"
                  className="size-9"
                  disabled={!canGoBack}
                  onClick={() => setMonth(previousMonth)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                </Button>
                <p
                  aria-live="polite"
                  className="text-foreground text-sm font-semibold"
                >
                  {monthLabel}
                </p>
                <Button
                  aria-label="Next month"
                  className="size-9"
                  onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
              </div>
              <div className="mb-2 grid grid-cols-7 gap-1" aria-hidden="true">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <span
                      className="text-muted-foreground py-2 text-center text-[10px] font-semibold sm:text-xs"
                      key={day}
                    >
                      {day}
                    </span>
                  ),
                )}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {dateCells.map((day, index) => {
                  if (day === null)
                    return (
                      <span
                        aria-hidden="true"
                        className="aspect-square"
                        key={"empty-" + index}
                      />
                    );
                  const date = new Date(year, monthIndex, day);
                  const dateKey = localDateKey(date);
                  const sunday = date.getDay() === 0;
                  const past = dateKey < todayKey;
                  const disabled = sunday || past;
                  const selected = field.value === dateKey;
                  return (
                    <button
                      aria-pressed={selected}
                      className={cn(
                        "aspect-square rounded-xl text-xs font-medium transition sm:text-sm",
                        selected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : disabled
                            ? "text-muted-foreground/40 cursor-not-allowed"
                            : "text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                      )}
                      disabled={disabled}
                      key={dateKey}
                      onBlur={field.onBlur}
                      onClick={() => {
                        if (dateKey !== field.value) {
                          setValue("preferredTime", undefined, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                        field.onChange(dateKey);
                      }}
                      type="button"
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {errors.preferredDate?.message ? (
                <p className="text-destructive mt-3 text-xs" role="alert">
                  {errors.preferredDate.message}
                </p>
              ) : null}
            </div>
          </fieldset>
        )}
      />

      <fieldset className="space-y-3">
        <legend className="text-foreground text-sm font-semibold">
          Available time slots
        </legend>
        {!selectedDate ? (
          <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
            Select a date to see available times.
          </p>
        ) : loadingSlots ? (
          <div className="text-muted-foreground flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Checking available times…
          </div>
        ) : availabilityError ? (
          <p
            className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm"
            role="alert"
          >
            {availabilityError}
          </p>
        ) : availableSlots.length ? (
          <Controller
            control={control}
            name="preferredTime"
            render={({ field }) => (
              <div
                aria-label="Available appointment times"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                role="radiogroup"
              >
                {availableSlots.map((slot) => {
                  const selected = field.value === slot;
                  return (
                    <button
                      aria-checked={selected}
                      className={cn(
                        "flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:outline-none",
                        selected
                          ? "border-primary bg-primary/5 text-foreground ring-primary/15 ring-2"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                      key={slot}
                      onClick={() => field.onChange(slot)}
                      onBlur={field.onBlur}
                      role="radio"
                      type="button"
                    >
                      <Clock3 aria-hidden="true" className="size-4" />
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          />
        ) : (
          <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
            All times are booked for this date. Please choose another day.
          </p>
        )}
        {errors.preferredTime?.message ? (
          <p className="text-destructive text-xs" role="alert">
            {errors.preferredTime.message}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
