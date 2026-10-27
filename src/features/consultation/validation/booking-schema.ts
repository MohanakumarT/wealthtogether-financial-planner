import { z } from "zod";

import {
  financialGoals,
  meetingModes,
  appointmentTimeSlots,
  riskProfiles,
} from "../constants/services";

const requiredAmount = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label.toLowerCase()}.`)
    .max(14)
    .regex(/^\d+(?:\.\d{1,2})?$/, `Enter a valid ${label.toLowerCase()}.`)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, {
      message: `${label} cannot be negative.`,
    });

export const consultationBookingSchema = z.object({
  serviceId: z.enum(
    [
      "investment-blueprint",
      "financial-freedom-cohort",
      "invest-through-wealthtogether",
    ],
    { error: "Choose a service to continue." },
  ),
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(320),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid mobile number.")
    .max(25)
    .regex(/^[+()0-9.\-\s]+$/, "Enter a valid mobile number.")
    .refine(
      (value) => (value.match(/\d/g)?.length ?? 0) >= 7,
      "Enter at least 7 digits.",
    ),
  whatsapp: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp number.")
    .max(25)
    .regex(/^[+()0-9.\-\s]+$/, "Enter a valid WhatsApp number.")
    .refine(
      (value) => (value.match(/\d/g)?.length ?? 0) >= 7,
      "Enter at least 7 digits.",
    ),
  age: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, "Enter your age.")
    .refine(
      (value) => Number(value) >= 18 && Number(value) <= 110,
      "Age must be between 18 and 110.",
    ),
  occupation: z.string().trim().min(2, "Enter your occupation.").max(100),
  monthlyIncome: requiredAmount("Monthly income"),
  city: z.string().trim().min(2, "Enter your city.").max(100),
  investmentExperience: z.enum(["yes", "no"], {
    error: "Please select an option.",
  }),
  monthlySip: requiredAmount("Current monthly SIP"),
  financialGoals: z
    .array(z.enum(financialGoals))
    .min(1, "Select at least one financial goal."),
  investmentBudget: requiredAmount("Investment budget"),
  riskProfile: z.enum(riskProfiles, { error: "Choose a risk profile." }),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a preferred date.")
    .refine((value) => {
      const date = new Date(`${value}T12:00:00.000Z`);
      return (
        Number.isFinite(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }, "Choose a valid date."),
  preferredTime: z.enum(appointmentTimeSlots, {
    error: "Choose an available appointment time.",
  }),
  timeZone: z
    .string()
    .trim()
    .min(1, "Choose your time zone.")
    .max(80)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Choose a valid time zone."),
  meetingMode: z.enum(meetingModes, { error: "Choose a meeting mode." }),
  notes: z
    .string()
    .trim()
    .max(1500, "Keep notes under 1,500 characters.")
    .default(""),
  consent: z
    .boolean()
    .refine((value) => value, "Please agree before submitting."),
  website: z.string().max(120).default(""),
}).superRefine((values, context) => {
  const selectedDate = new Date(`${values.preferredDate}T12:00:00.000Z`);
  if (Number.isFinite(selectedDate.getTime()) && selectedDate.getUTCDay() === 0) {
    context.addIssue({ code: "custom", message: "Appointments are available Monday through Saturday.", path: ["preferredDate"] });
  }

  try {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: values.timeZone }).format(new Date());
    if (values.preferredDate < today) {
      context.addIssue({ code: "custom", message: "Choose today or a future date.", path: ["preferredDate"] });
    }
  } catch {
    // The time-zone field already reports its own validation error.
  }
});

export type ConsultationBookingInput = z.input<
  typeof consultationBookingSchema
>;
export type ConsultationBookingValues = z.output<
  typeof consultationBookingSchema
>;
