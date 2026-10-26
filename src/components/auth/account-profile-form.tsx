"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/input-field";
import { useAuth } from "@/components/auth/auth-provider";
import type { UserProfile } from "@/lib/auth/types";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter at least 2 characters.").max(80),
  phone: z.string().trim().max(25, "Use 25 characters or fewer."),
  dob: z.string(),
  occupation: z.string().trim().max(100, "Use 100 characters or fewer."),
  city: z.string().trim().max(100, "Use 100 characters or fewer."),
  country: z.string().trim().max(100, "Use 100 characters or fewer."),
  avatar: z.string().trim().max(2048, "Avatar URL is too long."),
  monthly_income: z.number().finite().min(0).max(1_000_000_000),
  current_monthly_sip: z.number().finite().min(0).max(1_000_000_000),
  risk_profile: z.enum([
    "conservative",
    "moderate",
    "aggressive",
    "not_assessed",
  ]),
});
type Values = z.infer<typeof schema>;

export function AccountProfileForm({
  profile,
  email,
}: {
  profile: UserProfile;
  email: string;
}) {
  const { refresh } = useAuth();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile.full_name,
      phone: profile.phone,
      dob: profile.dob ?? "",
      occupation: profile.occupation,
      city: profile.city,
      country: profile.country,
      avatar: profile.avatar,
      monthly_income: profile.monthly_income,
      current_monthly_sip: profile.current_monthly_sip,
      risk_profile: profile.risk_profile,
    },
  });

  async function save(values: Values) {
    setBusy(true);
    setSuccess(false);
    setMessage("");
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Profile update failed.");
      await refresh();
      setMessage(body.error ?? "Your profile has been updated.");
      setSuccess(!body.error);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Your profile could not be saved. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(save)}>
      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <p className="text-muted-foreground text-sm">
            Keep your contact details current for account and consultation
            updates.
          </p>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <InputField
            autoComplete="name"
            error={errors.full_name?.message}
            label="Full name"
            maxLength={80}
            {...register("full_name")}
          />
          <InputField
            autoComplete="email"
            label="Email address"
            readOnly
            value={email}
          />
          <InputField
            autoComplete="tel"
            error={errors.phone?.message}
            label="Phone"
            maxLength={25}
            {...register("phone")}
          />
          <InputField
            autoComplete="bday"
            error={errors.dob?.message}
            label="Date of birth"
            type="date"
            {...register("dob")}
          />
          <InputField
            autoComplete="organization-title"
            error={errors.occupation?.message}
            label="Occupation"
            maxLength={100}
            {...register("occupation")}
          />
          <InputField
            autoComplete="address-level2"
            error={errors.city?.message}
            label="City"
            maxLength={100}
            {...register("city")}
          />
          <InputField
            autoComplete="country-name"
            error={errors.country?.message}
            label="Country"
            maxLength={100}
            {...register("country")}
          />
          <InputField
            error={errors.avatar?.message}
            hint="Use a secure HTTPS image URL, or leave this blank."
            label="Avatar URL"
            maxLength={2048}
            type="url"
            {...register("avatar")}
          />
          <InputField
            error={errors.monthly_income?.message}
            hint="Used only for your planning snapshot when you choose to share it with the assistant."
            label="Monthly take-home income (₹)"
            min="0"
            step="1000"
            type="number"
            {...register("monthly_income", { valueAsNumber: true })}
          />
          <InputField
            error={errors.current_monthly_sip?.message}
            hint="Your total current monthly SIP contribution, if applicable."
            label="Current monthly SIP (₹)"
            min="0"
            step="500"
            type="number"
            {...register("current_monthly_sip", { valueAsNumber: true })}
          />
          <label className="text-foreground block space-y-2 text-sm font-medium">
            Risk profile
            <select
              className="border-input bg-background text-foreground mt-2 h-11 w-full rounded-lg border px-3.5 text-sm"
              {...register("risk_profile")}
            >
              <option value="not_assessed">Not assessed</option>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </label>
          {message ? (
            <p
              className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm sm:col-span-2 ${success ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-destructive/10 text-destructive"}`}
              role={success ? "status" : "alert"}
            >
              {success ? (
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4" />
              ) : (
                <AlertCircle aria-hidden="true" className="mt-0.5 size-4" />
              )}
              {message}
            </p>
          ) : null}
          <div className="flex justify-end sm:col-span-2">
            <Button disabled={busy} type="submit" variant="gold">
              {busy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : null}
              {busy ? "Saving profile…" : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
