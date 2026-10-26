"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle, LoaderCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
type Values = z.infer<typeof schema>;

export function AdminLoginForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function submit(values: Values) {
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) {
        setMessage(
          "We couldn't sign you in. Check your details and try again.",
        );
        return;
      }
      const access = await fetch("/api/admin/session", { cache: "no-store" });
      if (!access.ok) {
        await supabase.auth.signOut();
        setMessage("This account does not have administrator access.");
        return;
      }
      window.location.assign("/admin");
    } catch {
      setMessage(
        "The sign-in service could not be reached. Try again shortly.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      {!supabase ? (
        <p className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm">
          Supabase is not configured. Add the project URL and publishable key to
          the server environment before signing in.
        </p>
      ) : null}
      <InputField
        autoComplete="username"
        error={errors.email?.message}
        label="Administrator email"
        {...register("email")}
        type="email"
      />
      <InputField
        autoComplete="current-password"
        error={errors.password?.message}
        label="Password"
        {...register("password")}
        type="password"
      />
      {message ? (
        <p
          className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {message}
        </p>
      ) : null}
      <Button
        className="w-full"
        disabled={!supabase || busy}
        size="lg"
        type="submit"
        variant="gold"
      >
        {busy ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <ShieldCheck aria-hidden="true" className="size-4" />
        )}
        {busy ? "Checking access…" : "Sign in to admin"}
      </Button>
      <p className="text-muted-foreground text-center text-xs leading-5">
        Admin access is assigned by a WealthTogether owner. Client accounts
        cannot enter this workspace.
      </p>
    </form>
  );
}
