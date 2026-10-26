"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  LoaderCircle,
  Search,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchAdminJson } from "@/features/admin/api";

type Status = "pending" | "confirmed" | "cancelled" | "completed" | "booked";
type Request = {
  id: string;
  client_id: string | null;
  name: string;
  email: string;
  phone: string;
  topic: string;
  preferred_date: string;
  preferred_time: string;
  time_zone: string;
  notes: string | null;
  status: Status;
  created_at: string;
};
type Manual = {
  id: string;
  client_id: string;
  topic: string;
  scheduled_at: string;
  status: "booked" | "completed" | "cancelled";
  notes: string;
  created_at: string;
  client: { name: string; email: string } | null;
};
type Data = { requests: Request[]; consultations: Manual[] };

const statuses: Status[] = ["pending", "confirmed", "completed", "cancelled"];
function showDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export function ConsultationsList() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [saving, setSaving] = useState("");

  function load() {
    setLoading(true);
    setError("");
    fetchAdminJson<Data>("/api/admin/consultations")
      .then(setData)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Consultations could not be loaded.",
        ),
      )
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const values = [
      ...data.requests.map((item) => ({
        id: item.id,
        source: "request" as const,
        clientId: item.client_id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        topic: item.topic,
        scheduled: `${item.preferred_date}T12:00:00`,
        details: `${item.preferred_time} · ${item.time_zone}`,
        notes: item.notes ?? "",
        status: item.status,
      })),
      ...data.consultations.map((item) => ({
        id: item.id,
        source: "manual" as const,
        clientId: item.client_id,
        name: item.client?.name ?? "Client",
        email: item.client?.email ?? "",
        phone: "",
        topic: item.topic,
        scheduled: item.scheduled_at,
        details: "Team recorded",
        notes: item.notes,
        status: item.status,
      })),
    ];
    return values
      .filter((item) => {
        const term = search.trim().toLowerCase();
        const matchesSearch =
          !term ||
          `${item.name} ${item.email} ${item.phone} ${item.topic}`
            .toLowerCase()
            .includes(term);
        const matchesStatus = status === "all" || item.status === status;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => Date.parse(b.scheduled) - Date.parse(a.scheduled));
  }, [data, search, status]);

  async function update(row: (typeof rows)[number], next: Status) {
    setSaving(row.id);
    setError("");
    try {
      await fetchAdminJson("/api/admin/consultations", {
        method: "PATCH",
        body: JSON.stringify({ id: row.id, source: row.source, status: next }),
      });
      setData((previous) =>
        previous
          ? {
              requests: previous.requests.map((item) =>
                item.id === row.id && row.source === "request"
                  ? { ...item, status: next }
                  : item,
              ),
              consultations: previous.consultations.map((item) =>
                item.id === row.id &&
                row.source === "manual" &&
                next !== "pending"
                  ? {
                      ...item,
                      status:
                        next === "completed" || next === "cancelled"
                          ? next
                          : "booked",
                    }
                  : item,
              ),
            }
          : previous,
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Status update failed.",
      );
    } finally {
      setSaving("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          Client conversations
        </p>
        <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
          Consultations
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Review enquiries, confirm bookings and record completed conversations.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickStat
          label="New enquiries"
          value={
            data?.requests.filter((item) => item.status === "pending").length
          }
          tone="text-amber-700 dark:text-amber-300"
        />
        <QuickStat
          label="Booked"
          value={
            (data?.requests.filter((item) => item.status === "confirmed")
              .length ?? 0) +
            (data?.consultations.filter((item) => item.status === "booked")
              .length ?? 0)
          }
          tone="text-blue-700 dark:text-blue-300"
        />
        <QuickStat
          label="Completed"
          value={
            (data?.requests.filter((item) => item.status === "completed")
              .length ?? 0) +
            (data?.consultations.filter((item) => item.status === "completed")
              .length ?? 0)
          }
          tone="text-emerald-700 dark:text-emerald-300"
        />
      </div>
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            />
            <Input
              aria-label="Search consultations"
              className="pl-10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search client or consultation topic"
              value={search}
            />
          </div>
          <select
            aria-label="Filter consultation status"
            className="border-input bg-background text-foreground h-11 rounded-lg border px-3.5 text-sm"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="all">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item[0]?.toUpperCase()}
                {item.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </Card>
      {error ? (
        <p
          className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <Card className="overflow-hidden">
        {loading && !data ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 p-12 text-sm">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Loading consultations…
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <CalendarDays
              aria-hidden="true"
              className="text-muted-foreground/60 mx-auto size-6"
            />
            <p className="mt-3 text-sm font-medium">
              No matching consultations
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              New enquiries from the booking page will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-border divide-y">
            {rows.map((row) => (
              <li
                className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
                key={`${row.source}-${row.id}`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="bg-accent text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                    <CalendarDays aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {row.topic}
                    </p>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {row.name} · {row.email}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {showDate(row.scheduled)} · {row.details}
                    </p>
                    {row.notes ? (
                      <p className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-5">
                        {row.notes}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-3">
                      {row.clientId ? (
                        <Link
                          className="text-primary inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                          href={`/admin/clients/${row.clientId}`}
                        >
                          <UserRound aria-hidden="true" className="size-3.5" />
                          Client profile
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Not linked to a client
                        </span>
                      )}
                      <span className="text-muted-foreground text-[11px]">
                        {row.source === "request"
                          ? "Booking request"
                          : "Team record"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <StatusBadge status={row.status} />
                  <label
                    className="sr-only"
                    htmlFor={`status-${row.source}-${row.id}`}
                  >
                    Change status for {row.name}
                  </label>
                  <div className="relative">
                    <select
                      className="border-input bg-background text-foreground h-9 appearance-none rounded-lg border py-1 pr-8 pl-3 text-xs"
                      disabled={saving === row.id}
                      id={`status-${row.source}-${row.id}`}
                      onChange={(event) =>
                        update(row, event.target.value as Status)
                      }
                      value={row.status}
                    >
                      {(row.source === "request"
                        ? statuses
                        : ["booked", "completed", "cancelled"]
                      ).map((item) => (
                        <option key={item} value={item}>
                          {item[0]?.toUpperCase()}
                          {item.slice(1)}
                        </option>
                      ))}
                    </select>
                    {saving === row.id ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="absolute top-1/2 right-2 size-3 -translate-y-1/2 animate-spin"
                      />
                    ) : (
                      <ChevronDown
                        aria-hidden="true"
                        className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2"
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <p className="text-muted-foreground text-xs leading-5">
        <Clock3 aria-hidden="true" className="mr-1 inline size-3.5" />
        Public requests are stored separately from team-recorded consultations.
        Updating a request changes its status and reporting counts.
      </p>
    </div>
  );
}

function QuickStat({
  label,
  value,
  tone,
}: {
  label: string;
  value?: number;
  tone: string;
}) {
  return (
    <Card className="flex items-center justify-between gap-3 p-4">
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className={`mt-2 text-2xl font-semibold tabular-nums ${tone}`}>
          {value ?? "—"}
        </p>
      </div>
      <Check aria-hidden="true" className={`size-4 ${tone}`} />
    </Card>
  );
}
function StatusBadge({ status }: { status: Status }) {
  const tone =
    status === "pending"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : status === "completed"
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        : status === "confirmed" || status === "booked"
          ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
          : "bg-muted text-muted-foreground";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${tone}`}
    >
      {status}
    </span>
  );
}
