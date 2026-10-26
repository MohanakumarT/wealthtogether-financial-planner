"use client";

import { useEffect, useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { AlertCircle, LoaderCircle, X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { fetchAdminJson } from "@/features/admin/api";
import {
  clientInputSchema,
  type ClientInput,
  type FollowUpStatus,
} from "@/features/admin/schema";

export type AdminClient = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  occupation: string;
  goals: string;
  notes: string;
  follow_up_status: FollowUpStatus;
  created_at: string;
  updated_at: string;
};

function RegisteredField({
  label,
  registration,
  error,
  type = "text",
  ...props
}: {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  type?: string;
} & Omit<
  React.ComponentProps<typeof InputField>,
  "label" | "inputRef" | "error" | "type"
>) {
  const { ref, ...inputProps } = registration;
  return (
    <InputField
      error={error}
      inputRef={ref}
      label={label}
      type={type}
      {...inputProps}
      {...props}
    />
  );
}

const emptyClient: ClientInput = {
  name: "",
  phone: "",
  email: "",
  city: "",
  occupation: "",
  goals: "",
  notes: "",
  followUpStatus: "none",
};

export function ClientFormDialog({
  client,
  onClose,
  onSaved,
}: {
  client?: AdminClient;
  onClose: () => void;
  onSaved: () => void;
}) {
  const titleId = useId();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof clientInputSchema>, unknown, ClientInput>({
    resolver: zodResolver(clientInputSchema),
    defaultValues: client
      ? {
          name: client.name,
          phone: client.phone,
          email: client.email,
          city: client.city,
          occupation: client.occupation,
          goals: client.goals,
          notes: client.notes,
          followUpStatus: client.follow_up_status,
        }
      : emptyClient,
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function save(values: ClientInput) {
    setBusy(true);
    setMessage("");
    try {
      await fetchAdminJson(
        client ? `/api/admin/clients/${client.id}` : "/api/admin/clients",
        {
          method: client ? "PATCH" : "POST",
          body: JSON.stringify(values),
        },
      );
      onSaved();
      onClose();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Client record could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }

  const name = register("name");
  const email = register("email");
  const phone = register("phone");
  const city = register("city");
  const occupation = register("occupation");
  const followUp = register("followUpStatus");
  const goals = register("goals");
  const notes = register("notes");

  return (
    <div
      className="bg-navy/50 fixed inset-0 z-50 flex items-end justify-center p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="border-border bg-card max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7"
        role="dialog"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
              Client record
            </p>
            <h2
              className="font-display mt-2 text-2xl tracking-tight"
              id={titleId}
            >
              {client ? "Update client details" : "Add a new client"}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Contact details and planning context stay inside the protected
              admin workspace.
            </p>
          </div>
          <Button
            aria-label="Close form"
            disabled={busy}
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit(save)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <RegisteredField
              autoComplete="name"
              error={errors.name?.message}
              label="Full name"
              registration={name}
            />
            <RegisteredField
              autoComplete="tel"
              error={errors.phone?.message}
              label="Phone"
              registration={phone}
            />
            <RegisteredField
              autoComplete="email"
              error={errors.email?.message}
              label="Email"
              registration={email}
              type="email"
            />
            <RegisteredField
              autoComplete="address-level2"
              error={errors.city?.message}
              label="City"
              registration={city}
            />
            <RegisteredField
              autoComplete="organization-title"
              error={errors.occupation?.message}
              label="Occupation"
              registration={occupation}
            />
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                htmlFor="followUpStatus"
              >
                Follow-up status
              </label>
              <select
                className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/25 h-11 w-full rounded-lg border px-3.5 text-sm outline-none focus-visible:ring-2"
                id="followUpStatus"
                {...followUp}
              >
                <option value="none">No follow-up set</option>
                <option value="due">Follow-up due</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <TextAreaField
            error={errors.goals?.message}
            label="Financial goals"
            registration={goals}
            rows={3}
            placeholder="Retirement, education, home purchase…"
          />
          <TextAreaField
            error={errors.notes?.message}
            label="Private notes"
            registration={notes}
            rows={4}
            placeholder="Meeting notes and context for the team"
          />
          {message ? (
            <p
              className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
              role="alert"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              {message}
            </p>
          ) : null}
          <div className="border-border flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              disabled={busy}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={busy} type="submit" variant="gold">
              {busy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : null}
              {busy ? "Saving…" : client ? "Save changes" : "Create client"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TextAreaField({
  label,
  registration,
  error,
  rows,
  placeholder,
}: {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  rows: number;
  placeholder: string;
}) {
  const id = registration.name;
  const { ref, ...inputProps } = registration;
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <textarea
        aria-invalid={Boolean(error)}
        className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25 min-h-24 w-full resize-y rounded-lg border px-3.5 py-3 text-sm shadow-sm outline-none focus-visible:ring-2"
        id={id}
        maxLength={id === "goals" ? 3000 : 10000}
        placeholder={placeholder}
        ref={ref}
        rows={rows}
        {...inputProps}
      />
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
