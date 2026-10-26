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
  const { followUpStatus, ...fields } = input;
  return { ...fields, follow_up_status: followUpStatus };
}
