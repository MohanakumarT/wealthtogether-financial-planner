"use client";

import { useEffect, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { consultationSteps } from "../constants/services";
import {
  consultationBookingSchema,
  type ConsultationBookingInput,
  type ConsultationBookingValues,
} from "../validation/booking-schema";
import { createConsultationBooking } from "../services/booking-client";

const stepFields: FieldPath<ConsultationBookingInput>[][] = [
  ["serviceId"],
  [
    "name",
    "email",
    "phone",
    "whatsapp",
    "age",
    "occupation",
    "monthlyIncome",
    "city",
  ],
  [
    "investmentExperience",
    "monthlySip",
    "financialGoals",
    "investmentBudget",
    "riskProfile",
  ],
  ["preferredDate", "preferredTime", "meetingMode", "timeZone"],
  ["notes"],
  ["consent"],
];

export function useBookingWizard() {
  const [step, setStep] = useState(0);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<
    ConsultationBookingInput,
    unknown,
    ConsultationBookingValues
  >({
    resolver: zodResolver(consultationBookingSchema),
    mode: "onTouched",
    defaultValues: {
      serviceId: undefined,
      name: "",
      email: "",
      phone: "",
      whatsapp: "",
      age: "",
      occupation: "",
      monthlyIncome: "",
      city: "",
      investmentExperience: undefined,
      monthlySip: "0",
      financialGoals: [],
      investmentBudget: "",
      riskProfile: undefined,
      preferredDate: "",
      preferredTime: undefined,
      timeZone: "Asia/Kolkata",
      meetingMode: undefined,
      notes: "",
      consent: false,
      website: "",
    },
  });

  useEffect(() => {
    const browserTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    form.setValue("timeZone", browserTimeZone, { shouldValidate: true });
  }, [form]);

  async function next() {
    const valid = await form.trigger(stepFields[step]);
    if (valid) {
      setSubmitError(null);
      setStep((current) => Math.min(current + 1, consultationSteps.length - 1));
    }
  }

  function back() {
    setSubmitError(null);
    setStep((current) => Math.max(0, current - 1));
  }

  async function submit(values: ConsultationBookingValues) {
    setSubmitError(null);
    try {
      const reference = await createConsultationBooking(values);
      setBookingReference(reference);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Your request could not be saved. Please try again.",
      );
    }
  }

  function bookAnother() {
    setBookingReference(null);
    setSubmitError(null);
    setStep(0);
    form.reset({
      serviceId: undefined,
      name: "",
      email: "",
      phone: "",
      whatsapp: "",
      age: "",
      occupation: "",
      monthlyIncome: "",
      city: "",
      investmentExperience: undefined,
      monthlySip: "0",
      financialGoals: [],
      investmentBudget: "",
      riskProfile: undefined,
      preferredDate: "",
      preferredTime: undefined,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
      meetingMode: undefined,
      notes: "",
      consent: false,
      website: "",
    });
  }

  return {
    form,
    step,
    next,
    back,
    submit,
    submitError,
    bookingReference,
    bookAnother,
  };
}
