"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/auth/redirect";

const emailSchema = z.string().trim().email("Enter a valid email address.");
const passwordSchema = z.string().min(8, "Use at least 8 characters.");

const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your name.").max(80),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});
const emailOnlySchema = z.object({ email: emailSchema });
const passwordUpdateSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;
type LoginValues = z.infer<typeof loginSchema>;
type EmailValues = z.infer<typeof emailOnlySchema>;
type PasswordUpdateValues = z.infer<typeof passwordUpdateSchema>;

function AuthField({
  label,
  error,
  ...props
}: React.ComponentProps<typeof InputField>) {
  return <InputField label={label} error={error} {...props} />;
}

function Field({
  label,
  error,
  registration,
  ...props
}: {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
} & Omit<
  React.ComponentProps<typeof InputField>,
  "label" | "error" | "inputRef"
>) {
  const { ref, ...inputProps } = registration;
  return (
    <AuthField
      error={error}
      inputRef={ref}
      label={label}
      {...inputProps}
      {...props}
    />
  );
}

function FormMessage({
  message,
  success = false,
}: {
  message: string;
  success?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm leading-5 ${success ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-destructive/10 text-destructive"}`}
      role={success ? "status" : "alert"}
    >
      {success ? (
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      ) : (
        <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}

function SubmitButton({
  children,
  busy,
  disabled = false,
}: {
  children: string;
  busy: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      className="w-full"
      disabled={busy || disabled}
      size="lg"
      type="submit"
      variant="gold"
    >
      {busy ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : null}
      {busy ? "Please wait…" : children}
    </Button>
  );
}

function ConfigNotice() {
  return (
    <FormMessage message="Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your local environment, then restart the app." />
  );
}

export function SignupForm() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function submit(values: SignupValues) {
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=%2Fprofile`,
        },
      });
      if (error) {
        setMessage(error.message);
        setSuccess(false);
        return;
      }
      if (data.session) {
        window.location.assign("/profile");
        return;
      }
      setMessage(
        "Your account is ready. Check your inbox for a confirmation link to finish signing up.",
      );
      setSuccess(true);
    } catch {
      setMessage(
        "We couldn’t reach the authentication service. Check your connection and try again.",
      );
      setSuccess(false);
    } finally {
      setBusy(false);
    }
  }

  const fullName = register("fullName");
  const email = register("email");
  const password = register("password");
  const confirmPassword = register("confirmPassword");

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      {!supabase ? <ConfigNotice /> : null}
      <Field
        autoComplete="name"
        error={errors.fullName?.message}
        label="Full name"
        registration={fullName}
      />
      <Field
        autoComplete="email"
        error={errors.email?.message}
        label="Email address"
        registration={email}
        type="email"
      />
      <Field
        autoComplete="new-password"
        error={errors.password?.message}
        label="Password"
        registration={password}
        type="password"
      />
      <Field
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        label="Confirm password"
        registration={confirmPassword}
        type="password"
      />
      {message ? <FormMessage message={message} success={success} /> : null}
      <SubmitButton busy={busy} disabled={!supabase}>
        Create account
      </SubmitButton>
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          className="text-foreground font-semibold underline underline-offset-4"
          href="/auth/login"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function LoginForm({
  nextPath,
  callbackFailed = false,
}: {
  nextPath: string;
  callbackFailed?: boolean;
}) {
  const [message, setMessage] = useState(
    callbackFailed
      ? "That sign-in link could not be completed. Please sign in again or request a new link."
      : "",
  );
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function submit(values: LoginValues) {
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) {
        setMessage(
          "We couldn’t sign you in with those details. Check your email and password, then try again.",
        );
        return;
      }
      window.location.assign(safeRedirectPath(nextPath));
    } catch {
      setMessage(
        "We couldn’t reach the authentication service. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const email = register("email");
  const password = register("password");

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      {!supabase ? <ConfigNotice /> : null}
      <Field
        autoComplete="email"
        error={errors.email?.message}
        label="Email address"
        registration={email}
        type="email"
      />
      <div className="space-y-2">
        <div className="flex justify-end">
          <Link
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
            href="/auth/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <Field
          autoComplete="current-password"
          error={errors.password?.message}
          id="login-password"
          label="Password"
          registration={password}
          type="password"
        />
      </div>
      {message ? <FormMessage message={message} /> : null}
      <SubmitButton busy={busy} disabled={!supabase}>
        Sign in
      </SubmitButton>
      <p className="text-muted-foreground text-center text-sm">
        New to WealthTogether?{" "}
        <Link
          className="text-foreground font-semibold underline underline-offset-4"
          href="/auth/sign-up"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailValues>({ resolver: zodResolver(emailOnlySchema) });

  async function submit(values: EmailValues) {
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=%2Fauth%2Fupdate-password`,
        },
      );
      if (error) {
        setMessage(error.message);
        setSent(false);
        return;
      }
      setMessage(
        "If an account exists for that email, you’ll receive a password reset link shortly.",
      );
      setSent(true);
    } catch {
      setMessage(
        "We couldn’t reach the authentication service. Check your connection and try again.",
      );
      setSent(false);
    } finally {
      setBusy(false);
    }
  }

  const email = register("email");
  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      {!supabase ? <ConfigNotice /> : null}
      <Field
        autoComplete="email"
        error={errors.email?.message}
        label="Email address"
        registration={email}
        type="email"
      />
      {message ? <FormMessage message={message} success={sent} /> : null}
      <SubmitButton busy={busy} disabled={!supabase}>
        Send reset link
      </SubmitButton>
      <p className="text-muted-foreground text-center text-sm">
        Remembered your password?{" "}
        <Link
          className="text-foreground font-semibold underline underline-offset-4"
          href="/auth/login"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordUpdateValues>({
    resolver: zodResolver(passwordUpdateSchema),
  });

  async function submit(values: PasswordUpdateValues) {
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      window.location.assign("/profile");
    } catch {
      setMessage(
        "We couldn’t reach the authentication service. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const password = register("password");
  const confirmPassword = register("confirmPassword");
  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      {!supabase ? <ConfigNotice /> : null}
      <Field
        autoComplete="new-password"
        error={errors.password?.message}
        label="New password"
        registration={password}
        type="password"
      />
      <Field
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        label="Confirm new password"
        registration={confirmPassword}
        type="password"
      />
      {message ? <FormMessage message={message} /> : null}
      <SubmitButton busy={busy} disabled={!supabase}>
        Update password
      </SubmitButton>
    </form>
  );
}

export function ProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setMessage("Your name must be between 2 and 80 characters.");
      setSuccess(false);
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: trimmedName },
      });
      setMessage(error ? error.message : "Your profile has been updated.");
      setSuccess(!error);
    } catch {
      setMessage(
        "We couldn’t reach the authentication service. Check your connection and try again.",
      );
      setSuccess(false);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        window.location.assign("/");
        return;
      }
      setMessage(error.message);
      setSuccess(false);
    } catch {
      setMessage(
        "We couldn’t reach the authentication service. Check your connection and try again.",
      );
      setSuccess(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form className="space-y-5" onSubmit={saveProfile}>
        <InputField
          autoComplete="name"
          label="Full name"
          maxLength={80}
          minLength={2}
          onChange={(event) => setName(event.target.value)}
          required
          value={name}
        />
        <InputField
          autoComplete="email"
          label="Email address"
          readOnly
          value={email}
        />
        {message ? <FormMessage message={message} success={success} /> : null}
        <Button
          className="w-full"
          disabled={busy}
          size="lg"
          type="submit"
          variant="gold"
        >
          Save profile
        </Button>
      </form>
      <div className="border-border border-t pt-6">
        <p className="text-foreground text-sm font-semibold">Account access</p>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          Sign out of this device when you’re finished.
        </p>
        <Button
          className="mt-4 w-full"
          disabled={busy}
          onClick={signOut}
          type="button"
          variant="outline"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
