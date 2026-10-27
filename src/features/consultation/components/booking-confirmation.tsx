"use client";

import Link from "next/link";
import { Check, ClipboardCheck, CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function BookingConfirmation({
  reference,
  date,
  time,
  timeZone,
  onBookAnother,
}: {
  reference: string;
  date: string;
  time: string;
  timeZone: string;
  onBookAnother: () => void;
}) {
  const formattedDate = date
    ? new Date(date + "T12:00:00.000Z").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone,
      })
    : date;
  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-14">
        <span className="grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <Check aria-hidden="true" className="size-8" />
        </span>
        <p className="text-primary mt-6 text-xs font-semibold tracking-[0.16em] uppercase">
          Request received
        </p>
        <h2 className="font-display text-foreground mt-2 max-w-lg text-3xl tracking-tight sm:text-4xl">
          We&apos;ve received your consultation request.
        </h2>
        <p className="text-muted-foreground mt-3 max-w-md text-sm leading-6">
          WealthTogether will confirm the meeting shortly.
        </p>
        <div className="bg-muted/60 mt-7 flex w-full max-w-sm items-center gap-3 rounded-2xl p-4 text-left">
          <CalendarClock
            aria-hidden="true"
            className="text-primary size-5 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs">Requested appointment</p>
            <p className="text-foreground mt-0.5 text-sm font-semibold">
              {formattedDate} · {time}
            </p>
            <p className="text-muted-foreground mt-0.5 text-[11px]">{timeZone}</p>
          </div>
        </div>
        <div className="bg-muted/60 mt-7 flex w-full max-w-sm items-center gap-3 rounded-2xl p-4 text-left">
          <ClipboardCheck
            aria-hidden="true"
            className="text-primary size-5 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs">Booking reference</p>
            <p className="text-foreground mt-0.5 font-mono text-base font-semibold">
              {reference}
            </p>
          </div>
        </div>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1" variant="gold">
            <Link href="/dashboard">
              <CalendarClock aria-hidden="true" className="size-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button className="flex-1" onClick={onBookAnother} variant="outline">
            Book Another Consultation
          </Button>
        </div>
        <p className="text-muted-foreground mt-6 text-xs">
          Your booking is currently pending confirmation.
        </p>
      </CardContent>
    </Card>
  );
}
