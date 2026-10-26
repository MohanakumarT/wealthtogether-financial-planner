import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(320),
  subject: z.enum([
    "general",
    "planning",
    "calculator",
    "account",
    "consultation",
    "other",
  ]),
  message: z.string().trim().min(10, "Add a little more detail.").max(3000),
  consent: z
    .boolean()
    .refine((value) => value, "Please agree before sending your message."),
  website: z.string().max(120).optional().default(""),
});

export type ContactMessageInput = z.input<typeof contactMessageSchema>;
export type ContactMessage = z.output<typeof contactMessageSchema>;

export const contactSubjects = [
  { value: "general", label: "General question" },
  { value: "planning", label: "Financial planning" },
  { value: "calculator", label: "Calculator support" },
  { value: "account", label: "Account support" },
  { value: "consultation", label: "Consultation request" },
  { value: "other", label: "Something else" },
] as const;
