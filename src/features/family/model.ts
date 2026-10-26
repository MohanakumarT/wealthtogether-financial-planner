import { z } from "zod";

export const familyProfileIds = [
  "self",
  "spouse",
  "child-1",
  "child-2",
  "parents",
] as const;

export const familyProfileSeed = [
  { id: "self", name: "Self", color: "#4D78B8" },
  { id: "spouse", name: "Spouse", color: "#D4AF37" },
  { id: "child-1", name: "Child 1", color: "#4D9273" },
  { id: "child-2", name: "Child 2", color: "#A879B6" },
  { id: "parents", name: "Parents", color: "#D88450" },
] as const;

const idSchema = z.string().min(1).max(100);
const familyGoalSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(2).max(100),
  type: z.enum([
    "retirement",
    "education",
    "house",
    "marriage",
    "car",
    "vacation",
    "emergency",
    "other",
  ]),
  targetAmount: z.number().positive().max(Number.MAX_SAFE_INTEGER),
  savedAmount: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  targetDate: z.iso.date(),
});

const familyInsuranceSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(2).max(100),
  type: z.enum(["health", "life", "vehicle", "home", "other"]),
  coverageAmount: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  annualPremium: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  renewalDate: z.iso.date().or(z.literal("")),
});

const familyProfileSchema = z.object({
  id: z.enum(familyProfileIds),
  name: z.string().trim().min(1).max(80),
  monthlyExpenses: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  emergencySavings: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  emergencyFundMonths: z.union([
    z.literal(3),
    z.literal(6),
    z.literal(9),
    z.literal(12),
  ]),
  otherAssets: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  liabilities: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  goals: z.array(familyGoalSchema).max(100),
  insurance: z.array(familyInsuranceSchema).max(100),
});

export const familyFinanceDocumentSchema = z
  .object({
    version: z.literal(1),
    profiles: z.array(familyProfileSchema).length(familyProfileIds.length),
  })
  .superRefine(({ profiles }, context) => {
    const ids = profiles.map((profile) => profile.id);
    if (
      new Set(ids).size !== familyProfileIds.length ||
      familyProfileIds.some((id) => !ids.includes(id))
    ) {
      context.addIssue({
        code: "custom",
        path: ["profiles"],
        message: "Each family profile must appear exactly once.",
      });
    }
  });

export type FamilyProfileId = (typeof familyProfileIds)[number];
export type FamilyGoal = z.infer<typeof familyGoalSchema>;
export type FamilyInsurance = z.infer<typeof familyInsuranceSchema>;
export type FamilyProfile = z.infer<typeof familyProfileSchema>;
export type FamilyFinanceDocument = z.infer<typeof familyFinanceDocumentSchema>;

export function createFamilyDefaults(): FamilyFinanceDocument {
  return {
    version: 1,
    profiles: familyProfileSeed.map(({ id, name }) => ({
      id,
      name,
      monthlyExpenses: 0,
      emergencySavings: 0,
      emergencyFundMonths: 6,
      otherAssets: 0,
      liabilities: 0,
      goals: [],
      insurance: [],
    })),
  };
}

export function formatFamilyCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function familyProfileLabel(
  id: FamilyProfileId,
  profiles: FamilyProfile[],
) {
  return (
    profiles.find((profile) => profile.id === id)?.name ??
    familyProfileSeed.find((profile) => profile.id === id)?.name ??
    "Family member"
  );
}
