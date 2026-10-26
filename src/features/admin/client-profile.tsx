"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Download,
  FileText,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  Trash2,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchAdminJson } from "@/features/admin/api";
import {
  ClientFormDialog,
  type AdminClient,
} from "@/features/admin/client-form-dialog";
import type { FollowUpStatus } from "@/features/admin/schema";
import { calculatorRoutes } from "@/features/calculators/saved/saved-calculations";
import type { CalculatorMetric } from "@/features/calculators/types";

type Consultation = {
  id: string;
  topic: string;
  scheduled_at: string;
  status: "booked" | "completed" | "cancelled";
  notes: string;
  created_at: string;
};
type Enquiry = {
  id: string;
  topic: string;
  preferred_date: string;
  preferred_time: string;
  time_zone: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
};
type Plan = {
  id: string;
  calculator_id: string;
  calculator_title: string;
  name: string;
  inputs: unknown;
  results: { metrics?: CalculatorMetric[] };
  created_at: string;
  updated_at: string;
};
type ProfileResponse = {
  client: AdminClient;
  consultations: Consultation[];
  requests: Enquiry[];
  plans: Plan[];
};

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
function followUpLabel(status: FollowUpStatus) {
  return {
    none: "No follow-up set",
    due: "Follow-up due",
    scheduled: "Follow-up scheduled",
    completed: "Follow-up complete",
  }[status];
}

export function ClientProfile({ id }: { id: string }) {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminJson<ProfileResponse>(`/api/admin/clients/${id}`)
      .then(setData)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Client profile could not be loaded.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  async function deleteClient() {
    setDeleting(true);
    setDeleteError("");
    try {
      await fetchAdminJson(`/api/admin/clients/${id}`, { method: "DELETE" });
      window.location.assign("/admin/clients");
    } catch (reason) {
      setDeleteError(
        reason instanceof Error
          ? reason.message
          : "Client could not be deleted.",
      );
      setDeleting(false);
    }
  }

  async function exportReport() {
    if (!data) return;
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const left = 44;
    pdf.setFillColor(8, 27, 58);
    pdf.rect(0, 0, 595, 90, "F");
    pdf.setTextColor(212, 175, 55);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("WEALTHTOGETHER INVESTMENTS", left, 35);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(23);
    pdf.text("Client relationship report", left, 65);
    pdf.setTextColor(8, 27, 58);
    pdf.setFontSize(18);
    pdf.text(data.client.name, left, 125);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const lines = [
      `Email: ${data.client.email}`,
      `Phone: ${data.client.phone}`,
      `City: ${data.client.city || "Not provided"}`,
      `Occupation: ${data.client.occupation || "Not provided"}`,
      `Follow-up: ${followUpLabel(data.client.follow_up_status)}`,
      `Goals: ${data.client.goals || "Not recorded"}`,
      `Private notes: ${data.client.notes || "Not recorded"}`,
    ];
    let y = 148;
    for (const line of lines) {
      const wrapped = pdf.splitTextToSize(line, 500) as string[];
      pdf.text(wrapped, left, y);
      y += wrapped.length * 14 + 4;
    }
    autoTable(pdf, {
      startY: y + 10,
      head: [["Consultation history", "Date", "Status"]],
      body: [
        ...data.requests.map((item) => [
          item.topic,
          item.preferred_date,
          item.status,
        ]),
        ...data.consultations.map((item) => [
          item.topic,
          showDate(item.scheduled_at),
          item.status,
        ]),
      ],
      theme: "striped",
      headStyles: { fillColor: [8, 27, 58] },
      styles: { fontSize: 9, cellPadding: 6 },
    });
    const consultationsBottom = (
      pdf as InstanceType<typeof jsPDF> & { lastAutoTable?: { finalY: number } }
    ).lastAutoTable?.finalY;
    autoTable(pdf, {
      startY: (consultationsBottom ?? y) + 24,
      head: [["Saved financial plans", "Calculator", "Last updated"]],
      body: data.plans.map((plan) => [
        plan.name,
        plan.calculator_title,
        showDate(plan.updated_at),
      ]),
      theme: "striped",
      headStyles: { fillColor: [8, 27, 58] },
      styles: { fontSize: 9, cellPadding: 6 },
    });
    pdf.save(
      `${
        data.client.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "client"
      }-wealthtogether-report.pdf`,
    );
  }

  if (loading && !data)
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        Loading client profile…
      </div>
    );
  if (error || !data)
    return (
      <div className="space-y-4">
        <Link
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium"
          href="/admin/clients"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to clients
        </Link>
        <p
          className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm"
          role="alert"
        >
          {error || "Client profile could not be loaded."}
        </p>
      </div>
    );

  const { client } = data;
  const allHistory = [
    ...data.requests.map((item) => ({
      id: `r-${item.id}`,
      topic: item.topic,
      date: item.preferred_date,
      status: item.status,
      details: `${item.preferred_time} · ${item.time_zone}`,
      notes: item.notes || "",
      type: "Enquiry",
    })),
    ...data.consultations.map((item) => ({
      id: `c-${item.id}`,
      topic: item.topic,
      date: item.scheduled_at,
      status: item.status,
      details: "Consultation",
      notes: item.notes,
      type: "Team record",
    })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium"
          href="/admin/clients"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All clients
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportReport} variant="outline">
            <Download aria-hidden="true" className="size-4" />
            PDF report
          </Button>
          <Button onClick={() => setEditOpen(true)} variant="gold">
            Edit profile
          </Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="bg-navy px-5 py-7 text-white sm:px-8 sm:py-9">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <span className="text-gold grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10">
                <UserRound aria-hidden="true" className="size-7" />
              </span>
              <div>
                <p className="text-gold text-xs font-semibold tracking-[0.16em] uppercase">
                  Client profile
                </p>
                <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
                  {client.name}
                </h1>
                <p className="mt-2 text-sm text-white/65">
                  Client since {showDate(client.created_at)}
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
              {followUpLabel(client.follow_up_status)}
            </span>
          </div>
        </div>
        <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          <ContactItem
            icon={Phone}
            label="Phone"
            value={client.phone}
            href={`tel:${client.phone}`}
          />
          <ContactItem
            icon={Mail}
            label="Email"
            value={client.email}
            href={`mailto:${client.email}`}
          />
          <ContactItem
            icon={MapPin}
            label="City"
            value={client.city || "Not set"}
          />
          <ContactItem
            icon={BriefcaseBusiness}
            label="Occupation"
            value={client.occupation || "Not set"}
          />
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <SectionHeading icon={CircleAlert} title="Goals & planning notes" />
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <TextBlock
                title="Financial goals"
                value={client.goals}
                empty="No goals recorded yet."
              />
              <TextBlock
                title="Private notes"
                value={client.notes}
                empty="No private notes yet."
              />
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
              <div>
                <SectionHeading
                  icon={CalendarClock}
                  title="Consultation history"
                />
                <p className="text-muted-foreground mt-1 pl-8 text-xs">
                  {allHistory.length} recorded conversation
                  {allHistory.length === 1 ? "" : "s"}
                </p>
              </div>
              <Button
                onClick={() => setConsultationOpen(true)}
                size="sm"
                variant="outline"
              >
                <Plus aria-hidden="true" className="size-4" />
                Add meeting
              </Button>
            </div>
            {allHistory.length ? (
              <ul className="divide-border divide-y">
                {allHistory.map((item) => (
                  <li
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6"
                    key={item.id}
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.topic}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {item.type} · {item.details}
                      </p>
                      {item.notes ? (
                        <p className="text-muted-foreground mt-2 max-w-2xl text-xs leading-5 whitespace-pre-wrap">
                          {item.notes}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        {showDate(item.date)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 font-medium capitalize ${item.status === "completed" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : item.status === "booked" || item.status === "confirmed" ? "bg-blue-500/10 text-blue-700 dark:text-blue-300" : item.status === "pending" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-10 text-center">
                <CalendarClock
                  aria-hidden="true"
                  className="text-muted-foreground/60 mx-auto size-6"
                />
                <p className="mt-3 text-sm font-medium">
                  No conversations recorded
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Consultation requests and meetings will appear here.
                </p>
              </div>
            )}
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-border border-b px-5 py-4 sm:px-6">
              <SectionHeading icon={FileText} title="Saved financial plans" />
              <p className="text-muted-foreground mt-1 pl-8 text-xs">
                Plans saved from this client&apos;s account
              </p>
            </div>
            {data.plans.length ? (
              <ul className="divide-border divide-y">
                {data.plans.map((plan) => (
                  <PlanItem key={plan.id} plan={plan} />
                ))}
              </ul>
            ) : (
              <div className="px-6 py-10 text-center">
                <FileText
                  aria-hidden="true"
                  className="text-muted-foreground/60 mx-auto size-6"
                />
                <p className="mt-3 text-sm font-medium">
                  No saved plans linked
                </p>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
                  When a client account uses this email address, their saved
                  plans appear here.
                </p>
              </div>
            )}
          </Card>
          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <Shield aria-hidden="true" className="size-[18px]" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">
                  Private client workspace
                </h2>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
                  Personal details and meeting notes are available only to
                  assigned WealthTogether administrators.
                </p>
              </div>
            </div>
            <div className="border-border mt-5 border-t pt-4">
              <Button
                className="w-full justify-between"
                onClick={() => setConfirmDelete(true)}
                variant="outline"
              >
                <span className="text-destructive inline-flex items-center gap-2">
                  <Trash2 aria-hidden="true" className="size-4" />
                  Delete client record
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="text-muted-foreground size-4"
                />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {editOpen ? (
        <ClientFormDialog
          client={client}
          onClose={() => setEditOpen(false)}
          onSaved={load}
        />
      ) : null}
      {consultationOpen ? (
        <ConsultationDialog
          clientId={client.id}
          onClose={() => setConsultationOpen(false)}
          onSaved={() => {
            setConsultationOpen(false);
            load();
          }}
        />
      ) : null}
      {confirmDelete ? (
        <ConfirmDelete
          busy={deleting}
          error={deleteError}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={deleteClient}
        />
      ) : null}
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-xl">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        {href ? (
          <a
            className="mt-1 block truncate text-sm font-medium hover:underline"
            href={href}
          >
            {value}
          </a>
        ) : (
          <p className="mt-1 truncate text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}
function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: typeof FileText;
  title: string;
}) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold">
      <Icon aria-hidden="true" className="text-primary size-4" />
      {title}
    </h2>
  );
}
function TextBlock({
  title,
  value,
  empty,
}: {
  title: string;
  value: string;
  empty: string;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold">{title}</p>
      <p className="mt-2 min-h-10 text-sm leading-6 whitespace-pre-wrap">
        {value || <span className="text-muted-foreground">{empty}</span>}
      </p>
    </div>
  );
}

function PlanItem({ plan }: { plan: Plan }) {
  const [expanded, setExpanded] = useState(false);
  const route = calculatorRoutes[plan.calculator_id];
  const metrics = Array.isArray(plan.results?.metrics)
    ? plan.results.metrics
    : [];
  return (
    <li className="px-5 py-4 sm:px-6">
      <button
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {plan.name}
          </span>
          <span className="text-muted-foreground mt-1 block truncate text-xs">
            {plan.calculator_title} · Updated {showDate(plan.updated_at)}
          </span>
        </span>
        {expanded ? (
          <ChevronUp
            aria-hidden="true"
            className="text-muted-foreground mt-1 size-4 shrink-0"
          />
        ) : (
          <ChevronDown
            aria-hidden="true"
            className="text-muted-foreground mt-1 size-4 shrink-0"
          />
        )}
      </button>
      {expanded ? (
        <div className="bg-muted/60 mt-4 space-y-4 rounded-xl p-4">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              Key results
            </p>
            {metrics.length ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {metrics.slice(0, 6).map((metric) => (
                  <div
                    className="border-border bg-card rounded-lg border px-3 py-2"
                    key={metric.id}
                  >
                    <p className="text-muted-foreground text-[11px]">
                      {metric.label}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold">
                      {String(metric.value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground mt-2 text-xs">
                Plan result summary is unavailable.
              </p>
            )}
          </div>
          <details>
            <summary className="text-primary cursor-pointer text-xs font-semibold">
              View saved assumptions
            </summary>
            <pre className="bg-background mt-2 max-h-52 overflow-auto rounded-lg p-3 text-[11px] leading-5 break-all whitespace-pre-wrap">
              {JSON.stringify(plan.inputs, null, 2)}
            </pre>
          </details>
          {route ? (
            <Link
              className="text-primary inline-flex items-center gap-1 text-xs font-semibold hover:underline"
              href={`/calculators/${route}`}
            >
              Open calculator{" "}
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function ConsultationDialog({
  clientId,
  onClose,
  onSaved,
}: {
  clientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const date = new Date(scheduledAt);
      await fetchAdminJson("/api/admin/consultations", {
        method: "POST",
        body: JSON.stringify({
          clientId,
          topic,
          scheduledAt: date.toISOString(),
          status: "booked",
          notes,
        }),
      });
      onSaved();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Consultation could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="bg-navy/50 fixed inset-0 z-50 flex items-end justify-center p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <section
        aria-labelledby="new-consultation-title"
        aria-modal="true"
        className="border-border bg-card w-full rounded-t-3xl border p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-7"
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-primary text-xs font-semibold tracking-wide uppercase">
              Client history
            </p>
            <h2
              className="font-display mt-2 text-2xl"
              id="new-consultation-title"
            >
              Record consultation
            </h2>
          </div>
          <Button
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block space-y-2 text-sm font-medium">
            Topic
            <input
              className="border-input bg-background mt-2 h-11 w-full rounded-lg border px-3.5 text-sm font-normal"
              maxLength={120}
              minLength={2}
              onChange={(event) => setTopic(event.target.value)}
              required
              value={topic}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Date and time
            <input
              className="border-input bg-background mt-2 h-11 w-full rounded-lg border px-3.5 text-sm font-normal"
              onChange={(event) => setScheduledAt(event.target.value)}
              required
              type="datetime-local"
              value={scheduledAt}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Notes
            <textarea
              className="border-input bg-background mt-2 min-h-24 w-full rounded-lg border px-3.5 py-3 text-sm font-normal"
              maxLength={3000}
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </label>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <div className="border-border flex justify-end gap-2 border-t pt-4">
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
              ) : (
                <Check aria-hidden="true" className="size-4" />
              )}
              {busy ? "Saving…" : "Save consultation"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ConfirmDelete({
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  busy: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="bg-navy/50 fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm">
      <section
        aria-labelledby="delete-client-title"
        aria-modal="true"
        className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        role="dialog"
      >
        <div className="bg-destructive/10 text-destructive grid size-10 place-items-center rounded-xl">
          <Trash2 aria-hidden="true" className="size-5" />
        </div>
        <h2 className="mt-4 text-lg font-semibold" id="delete-client-title">
          Delete this client record?
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          This permanently removes the client and their consultation history.
          Saved plans remain with the client&apos;s account.
        </p>
        {error ? (
          <p className="text-destructive mt-3 text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button disabled={busy} onClick={onCancel} variant="outline">
            Keep record
          </Button>
          <Button disabled={busy} onClick={onConfirm} variant="default">
            {busy ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : null}
            Delete record
          </Button>
        </div>
      </section>
    </div>
  );
}
