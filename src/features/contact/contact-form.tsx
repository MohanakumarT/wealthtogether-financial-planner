"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import {
  contactMessageSchema,
  contactSubjects,
  type ContactMessage,
  type ContactMessageInput,
} from "@/features/contact/schema";

const selectClassName =
  "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/25 flex h-11 w-full rounded-lg border px-3.5 text-sm shadow-sm outline-none focus-visible:ring-2";

function ContactInput({
  registration,
  ...props
}: Omit<React.ComponentProps<typeof InputField>, "inputRef"> & {
  registration: UseFormRegisterReturn;
}) {
  const { ref, ...inputProps } = registration;
  return <InputField inputRef={ref} {...inputProps} {...props} />;
}

export function ContactForm() {
  const [response, setResponse] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageInput, unknown, ContactMessage>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "general",
      message: "",
      consent: false,
      website: "",
    },
  });
  const name = register("name");
  const email = register("email");

  async function submit(values: ContactMessage) {
    setResponse(null);
    try {
      const result = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await result.json()) as { error?: string };
      if (!result.ok) {
        setResponse({
          kind: "error",
          text:
            data.error ??
            "Your message couldn’t be sent. Please use one of the contact options on this page.",
        });
        return;
      }
      setResponse({
        kind: "success",
        text: "Your message has been received. The WealthTogether team will be in touch.",
      });
      reset({
        name: "",
        email: "",
        subject: "general",
        message: "",
        consent: false,
        website: "",
      });
    } catch {
      setResponse({
        kind: "error",
        text: "We couldn’t connect to the contact service. Please try again or contact us directly.",
      });
    }
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(submit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <ContactInput
          autoComplete="name"
          error={errors.name?.message}
          label="Your name"
          registration={name}
          required
        />
        <ContactInput
          autoComplete="email"
          error={errors.email?.message}
          label="Email address"
          registration={email}
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label
          className="text-foreground block text-sm font-medium"
          htmlFor="contact-subject"
        >
          What can we help with?
        </label>
        <select
          aria-invalid={Boolean(errors.subject)}
          className={selectClassName}
          id="contact-subject"
          {...register("subject")}
        >
          {contactSubjects.map((subject) => (
            <option key={subject.value} value={subject.value}>
              {subject.label}
            </option>
          ))}
        </select>
        {errors.subject?.message ? (
          <p className="text-destructive text-xs" role="alert">
            {errors.subject.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label
          className="text-foreground block text-sm font-medium"
          htmlFor="contact-message"
        >
          Your message
        </label>
        <textarea
          aria-invalid={Boolean(errors.message)}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25 min-h-36 w-full resize-y rounded-lg border px-3.5 py-3 text-sm shadow-sm outline-none focus-visible:ring-2"
          id="contact-message"
          maxLength={3000}
          placeholder="Tell us how we can help. Please don’t include account numbers or passwords."
          {...register("message")}
        />
        {errors.message?.message ? (
          <p className="text-destructive text-xs" role="alert">
            {errors.message.message}
          </p>
        ) : null}
      </div>
      <input
        aria-hidden="true"
        autoComplete="off"
        className="absolute -left-[10000px] size-px overflow-hidden"
        tabIndex={-1}
        type="text"
        {...register("website")}
      />
      <div className="flex items-start gap-3">
        <input
          aria-invalid={Boolean(errors.consent)}
          className="border-input text-primary focus-visible:ring-ring accent-primary mt-0.5 size-4 shrink-0 rounded border focus-visible:ring-2 focus-visible:outline-none"
          id="contact-consent"
          type="checkbox"
          {...register("consent")}
        />
        <div>
          <label
            className="text-muted-foreground text-xs leading-5"
            htmlFor="contact-consent"
          >
            I agree that WealthTogether may use these details to respond to my
            message.
          </label>
          {errors.consent?.message ? (
            <p className="text-destructive mt-1 text-xs" role="alert">
              {errors.consent.message}
            </p>
          ) : null}
        </div>
      </div>
      {response ? (
        <div
          className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm leading-5 ${response.kind === "success" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-destructive/10 text-destructive"}`}
          role={response.kind === "success" ? "status" : "alert"}
        >
          {response.kind === "success" ? (
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
          ) : null}
          <span>{response.text}</span>
        </div>
      ) : null}
      <Button
        className="w-full"
        disabled={isSubmitting}
        size="lg"
        type="submit"
        variant="gold"
      >
        {isSubmitting ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Send aria-hidden="true" className="size-4" />
        )}
        {isSubmitting ? "Sending message…" : "Send message"}
      </Button>
    </form>
  );
}
