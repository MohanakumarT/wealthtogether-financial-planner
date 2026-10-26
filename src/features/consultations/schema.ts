import { z } from "zod";

export const consultationRequestSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name.").max(100),
    email: z.string().trim().email("Enter a valid email address.").max(320),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a phone number with country code.")
      .max(25)
      .regex(/^[+()0-9.\-\s]+$/, "Enter a valid phone number.")
      .refine(
        (phone) => (phone.match(/\d/g)?.length ?? 0) >= 7,
        "Enter at least 7 digits, including your country code.",
      ),
    topic: z.enum([
      "retirement",
      "investing",
      "home",
      "education",
      "family",
      "other",
    ]),
    preferredDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date."),
    preferredTime: z.enum(["morning", "midday", "afternoon", "evening"]),
    timeZone: z.string().trim().min(1).max(80),
    notes: z.string().trim().max(1000).optional().default(""),
    website: z.string().max(120).optional().default(""),
    consent: z
      .boolean()
      .refine((value) => value, "Please agree before sending your request."),
  })
  .refine(
    ({ preferredDate, timeZone }) => {
      try {
        const dateTimestamp = Date.parse(`${preferredDate}T00:00:00.000Z`);
        if (
          !Number.isFinite(dateTimestamp) ||
          new Date(dateTimestamp).toISOString().slice(0, 10) !== preferredDate
        ) {
          return false;
        }
        const today = new Intl.DateTimeFormat("en-CA", { timeZone }).format(
          new Date(),
        );
        return preferredDate >= today;
      } catch {
        return false;
      }
    },
    { message: "Choose today or a future date.", path: ["preferredDate"] },
  );

export type ConsultationRequestInput = z.input<
  typeof consultationRequestSchema
>;
export type ConsultationRequest = z.output<typeof consultationRequestSchema>;

export const consultationTopics = [
  { value: "retirement", label: "Retirement planning" },
  { value: "investing", label: "Investing and savings" },
  { value: "home", label: "Home purchase" },
  { value: "education", label: "Education planning" },
  { value: "family", label: "Family or life-event planning" },
  { value: "other", label: "Something else" },
] as const;

export const consultationTimes = [
  { value: "morning", label: "Morning" },
  { value: "midday", label: "Midday" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
] as const;
