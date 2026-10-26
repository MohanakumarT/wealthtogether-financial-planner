"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCheck,
  CircleUserRound,
  Clock3,
  LoaderCircle,
  UsersRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { fetchAdminJson } from "@/features/admin/api";

type OverviewData = {
  stats: {
    totalClients: number;
    newEnquiries: number;
    bookedConsultations: number;
    completedConsultations: number;
  };
  latestEnquiries: Array<{
    id: string;
    name: string;
    email: string;
    topic: string;
    preferred_date: string;
    preferred_time: string;
    time_zone: string;
    status: string;
    created_at: string;
    client_id: string | null;
  }>;
};

const metrics = [
  {
    key: "totalClients",
    label: "Total clients",
    icon: UsersRound,
    tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  {
    key: "newEnquiries",
    label: "New enquiries",
    icon: CircleUserRound,
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    key: "bookedConsultations",
    label: "Booked consultations",
    icon: CalendarClock,
    tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  {
    key: "completedConsultations",
    label: "Completed consultations",
    icon: CheckCheck,
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
] as const;

function readableDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export function AdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetchAdminJson<OverviewData>("/api/admin/overview")
      .then(setData)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Dashboard could not be loaded.",
        ),
      );
  }, []);

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            WealthTogether Investments
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            Good to see you.
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            A clear view of client relationships and upcoming conversations.
          </p>
        </div>
        <Link
          className="bg-gold text-gold-foreground hover:bg-gold/90 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold"
          href="/admin/clients"
        >
          <CircleUserRound aria-hidden="true" className="size-4" />
          Add a client
        </Link>
      </div>

      {error ? (
        <p
          className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {!data && !error ? (
        <div className="text-muted-foreground flex items-center gap-2 py-10 text-sm">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Loading private workspace…
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ key, label, icon: Icon, tone }) => (
          <Card className="p-5" key={key}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-sm">{label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
                  {data?.stats[key] ?? "—"}
                </p>
              </div>
              <span
                className={`grid size-10 place-items-center rounded-xl ${tone}`}
              >
                <Icon aria-hidden="true" className="size-5" />
              </span>
            </div>
            <p className="text-muted-foreground mt-4 text-xs">
              Updated from your client records
            </p>
          </Card>
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.75fr)]">
        <Card className="overflow-hidden">
          <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold">Latest enquiries</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Recent consultation requests
              </p>
            </div>
            <Link
              className="text-primary inline-flex items-center gap-1 text-xs font-semibold hover:underline"
              href="/admin/consultations"
            >
              All consultations{" "}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
          {!data ? (
            <div className="text-muted-foreground p-6 text-sm">
              Enquiries will appear here.
            </div>
          ) : data.latestEnquiries.length === 0 ? (
            <div className="p-8 text-center">
              <Clock3
                aria-hidden="true"
                className="text-muted-foreground/60 mx-auto size-6"
              />
              <p className="mt-3 text-sm font-medium">No enquiries yet</p>
              <p className="text-muted-foreground mt-1 text-xs">
                New consultation requests will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {data.latestEnquiries.map((item) => (
                <li
                  className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  key={item.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.name}
                    </p>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {item.topic} · {item.email}
                    </p>
                  </div>
                  <div className="text-muted-foreground flex shrink-0 items-center gap-3 text-xs">
                    <span>{readableDate(item.preferred_date)}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 font-medium capitalize ${item.status === "pending" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : item.status === "confirmed" ? "bg-blue-500/10 text-blue-700 dark:text-blue-300" : item.status === "completed" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="bg-accent text-primary grid size-10 place-items-center rounded-xl">
            <CalendarClock aria-hidden="true" className="size-5" />
          </div>
          <h2 className="mt-5 text-base font-semibold">
            Keep every follow-up moving
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Search client profiles, record consultation outcomes, and set a
            follow-up status so every conversation has a clear next step.
          </p>
          <Link
            className="text-primary mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            href="/admin/clients"
          >
            Browse client list{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Card>
      </section>
    </div>
  );
}
