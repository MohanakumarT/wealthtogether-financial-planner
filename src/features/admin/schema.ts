import { z } from "zod";

export const clientInputSchema = z.object({
  name: z.string().trim().min(2, "Enter the client's name.").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number.")
    .max(25)
    .regex(/^[+()0-9.\-\s]+$/, "Enter a valid phone number."),
  email: z.string().trim().email("Enter a valid email address.").max(320),
  city: z.string().trim().max(100).default(""),
  occupation: z.string().trim().max(100).default(""),
  goals: z.string().trim().max(3000).default(""),
  notes: z.string().trim().max(10000).default(""),
  followUpStatus: z.enum(["none", "due", "scheduled", "completed"]),
  dateOfBirth: z.union([z.literal(""), z.iso.date()]).default(""),
  income: z.coerce.number().finite().min(0).max(1_000_000_000).default(0),
  riskProfile: z
    .enum(["conservative", "moderate", "aggressive", "not_assessed"])
    .default("not_assessed"),
  status: z.enum(["lead", "interested", "active", "inactive"]).default("lead"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  nextFollowUpAt: z
    .string()
    .max(40)
    .refine(
      (value) => !value || !Number.isNaN(new Date(value).getTime()),
      "Enter a valid follow-up date.",
    )
    .default(""),
  monthlyRevenue: z.coerce
    .number()
    .finite()
    .min(0)
    .max(1_000_000_000)
    .default(0),
});

export const consultationInputSchema = z.object({
  topic: z.string().trim().min(2, "Add a consultation topic.").max(120),
  scheduledAt: z.iso.datetime({ offset: true }),
  status: z.enum(["booked", "completed", "cancelled"]),
  notes: z.string().trim().max(3000).default(""),
});

export const consultationStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "booked", "cancelled", "completed"]),
});

export type ClientInput = z.infer<typeof clientInputSchema>;
export type FollowUpStatus = ClientInput["followUpStatus"];
export type ConsultationInput = z.infer<typeof consultationInputSchema>;

export function clientInputToRecord(input: ClientInput) {
  const {
    followUpStatus,
    dateOfBirth,
    riskProfile,
    nextFollowUpAt,
    monthlyRevenue,
    ...fields
  } = input;
  return {
    ...fields,
    follow_up_status: followUpStatus,
    date_of_birth: dateOfBirth || null,
    risk_profile: riskProfile,
    next_follow_up_at: nextFollowUpAt
      ? new Date(nextFollowUpAt).toISOString()
      : null,
    monthly_revenue: monthlyRevenue,
  };
}
