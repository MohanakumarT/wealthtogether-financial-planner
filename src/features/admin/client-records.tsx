"use client";

import { useState } from "react";
import {
  Check,
  CircleAlert,
  FileText,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchAdminJson } from "@/features/admin/api";

export type ClientGoalRecord = {
  id: string;
  goal_type: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  status: string;
  notes: string;
};
export type ClientInvestmentRecord = {
  id: string;
  investment_type: string;
  name: string;
  invested_amount: number;
  current_value: number;
  monthly_sip: number;
  investment_date: string | null;
  notes: string;
};
export type ClientInsuranceRecord = {
  id: string;
  insurance_type: string;
  provider: string;
  policy_name: string;
  cover_amount: number;
  annual_premium: number;
  renewal_date: string | null;
  notes: string;
};
export type ClientActivityRecord = {
  id: string;
  activity_type: string;
  title: string;
  details: string;
  occurred_at: string;
};
export type ClientTaskRecord = {
  id: string;
  title: string;
  details: string;
  due_at: string | null;
  priority: string;
  status: string;
};
export type ClientDocumentRecord = {
  id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  download_url: string | null;
};

type Props = {
  clientId: string;
  goals: ClientGoalRecord[];
  investments: ClientInvestmentRecord[];
  insurance: ClientInsuranceRecord[];
  activities: ClientActivityRecord[];
  tasks: ClientTaskRecord[];
  documents: ClientDocumentRecord[];
  onRefresh: () => void;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const shortDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date not set";

export function ClientRecords(props: Props) {
  const [kind, setKind] = useState("goal");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fileBusy, setFileBusy] = useState(false);

  async function saveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    const amount = (key: string) => Number(form.get(key) || 0);
    let body: Record<string, unknown>;
    if (kind === "goal") {
      body = {
        kind,
        title: value("title"),
        goal_type: value("category"),
        target_amount: amount("amount"),
        current_amount: amount("current"),
        target_date: value("date"),
        notes: value("details"),
      };
    } else if (kind === "investment") {
      body = {
        kind,
        name: value("title"),
        investment_type: value("category"),
        invested_amount: amount("amount"),
        current_value: amount("current"),
        monthly_sip: amount("monthly"),
        investment_date: value("date"),
        notes: value("details"),
      };
    } else if (kind === "insurance") {
      body = {
        kind,
        policy_name: value("title"),
        insurance_type: value("category"),
        provider: value("provider"),
        cover_amount: amount("amount"),
        annual_premium: amount("premium"),
        renewal_date: value("date"),
        notes: value("details"),
      };
    } else if (kind === "activity") {
      body = {
        kind,
        title: value("title"),
        activity_type: value("category"),
        details: value("details"),
      };
    } else {
      body = {
        kind,
        title: value("title"),
        details: value("details"),
        due_at: value("date") ? new Date(value("date")).toISOString() : "",
        priority: value("category"),
      };
    }
    try {
      await fetchAdminJson(`/api/admin/clients/${props.clientId}/records`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      formElement.reset();
      props.onRefresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The record could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(file?: File) {
    if (!file) return;
    setFileBusy(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const response = await fetch(
        `/api/admin/clients/${props.clientId}/documents`,
        {
          method: "POST",
          body: form,
        },
      );
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok)
        throw new Error(data?.error ?? "The document could not be uploaded.");
      props.onRefresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The document could not be uploaded.",
      );
    } finally {
      setFileBusy(false);
    }
  }

  async function remove(kind: string, recordId: string) {
    if (!window.confirm("Delete this client record?")) return;
    try {
      await fetchAdminJson(
        `/api/admin/clients/${props.clientId}/records/${recordId}?kind=${kind}`,
        { method: "DELETE" },
      );
      props.onRefresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The record could not be deleted.",
      );
    }
  }

  async function completeTask(task: ClientTaskRecord) {
    try {
      await fetchAdminJson(
        `/api/admin/clients/${props.clientId}/records/${task.id}?kind=task`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: task.status === "completed" ? "pending" : "completed",
          }),
        },
      );
      props.onRefresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The task could not be updated.",
      );
    }
  }

  const textField =
    "border-input bg-background text-foreground placeholder:text-muted-foreground h-10 w-full rounded-lg border px-3 text-sm";
  const select =
    "border-input bg-background text-foreground h-10 w-full rounded-lg border px-3 text-sm";
  const label = "text-muted-foreground mb-1.5 block text-xs font-medium";

  return (
    <section className="space-y-5">
      {error ? (
        <p
          className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          role="alert"
        >
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {error}
        </p>
      ) : null}
      <Card className="p-5 sm:p-6">
        <h2 className="text-base font-semibold">Add to client file</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Record goals, holdings, protection, conversations, and follow-up work.
        </p>
        <form className="mt-5 space-y-4" onSubmit={saveRecord}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label>
              <span className={label}>Record type</span>
              <select
                className={select}
                onChange={(event) => setKind(event.target.value)}
                value={kind}
              >
                <option value="goal">Financial goal</option>
                <option value="investment">Investment</option>
                <option value="insurance">Insurance</option>
                <option value="activity">Interaction / note</option>
                <option value="task">Follow-up task</option>
              </select>
            </label>
            <label className="sm:col-span-1">
              <span className={label}>
                {kind === "insurance"
                  ? "Policy name"
                  : kind === "investment"
                    ? "Investment name"
                    : kind === "activity" || kind === "task"
                      ? "Title"
                      : "Goal title"}
              </span>
              <input
                className={textField}
                maxLength={160}
                name="title"
                placeholder="Add a clear title"
                required
              />
            </label>
            <label>
              <span className={label}>
                {kind === "activity"
                  ? "Interaction type"
                  : kind === "task"
                    ? "Priority"
                    : "Category"}
              </span>
              <select className={select} name="category">
                {kind === "goal" ? (
                  <>
                    <option value="retirement">Retirement</option>
                    <option value="education">Kids education</option>
                    <option value="house">House</option>
                    <option value="car">Car</option>
                    <option value="emergency_fund">Emergency fund</option>
                    <option value="marriage">Marriage</option>
                    <option value="vacation">Vacation</option>
                    <option value="wealth_creation">Wealth creation</option>
                    <option value="other">Other</option>
                  </>
                ) : null}
                {kind === "investment" ? (
                  <>
                    <option value="mutual_fund">Mutual funds</option>
                    <option value="sip">SIP</option>
                    <option value="lumpsum">Lumpsum</option>
                  </>
                ) : null}
                {kind === "insurance" ? (
                  <>
                    <option value="life">Life</option>
                    <option value="health">Health</option>
                    <option value="term">Term</option>
                  </>
                ) : null}
                {kind === "activity" ? (
                  <>
                    <option value="note">Note</option>
                    <option value="meeting">Meeting</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="follow_up">Follow-up</option>
                  </>
                ) : null}
                {kind === "task" ? (
                  <>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                  </>
                ) : null}
              </select>
            </label>
            {kind === "insurance" ? (
              <label>
                <span className={label}>Provider</span>
                <input
                  className={textField}
                  maxLength={120}
                  name="provider"
                  placeholder="Insurer"
                />
              </label>
            ) : null}
            {kind === "goal" ||
            kind === "investment" ||
            kind === "insurance" ? (
              <label>
                <span className={label}>
                  {kind === "goal"
                    ? "Target amount (₹)"
                    : kind === "insurance"
                      ? "Cover amount (₹)"
                      : "Invested amount (₹)"}
                </span>
                <input
                  className={textField}
                  min="0"
                  name="amount"
                  required
                  type="number"
                />
              </label>
            ) : null}
            {kind === "goal" || kind === "investment" ? (
              <label>
                <span className={label}>
                  {kind === "goal" ? "Saved so far (₹)" : "Current value (₹)"}
                </span>
                <input
                  className={textField}
                  min="0"
                  name="current"
                  type="number"
                  defaultValue="0"
                />
              </label>
            ) : null}
            {kind === "investment" ? (
              <label>
                <span className={label}>Monthly SIP (₹)</span>
                <input
                  className={textField}
                  min="0"
                  name="monthly"
                  type="number"
                  defaultValue="0"
                />
              </label>
            ) : null}
            {kind === "insurance" ? (
              <label>
                <span className={label}>Annual premium (₹)</span>
                <input
                  className={textField}
                  min="0"
                  name="premium"
                  type="number"
                  defaultValue="0"
                />
              </label>
            ) : null}
            {kind === "goal" ||
            kind === "investment" ||
            kind === "insurance" ||
            kind === "task" ? (
              <label>
                <span className={label}>
                  {kind === "goal"
                    ? "Target date"
                    : kind === "investment"
                      ? "Investment date"
                      : kind === "insurance"
                        ? "Renewal date"
                        : "Due date"}
                </span>
                <input
                  className={textField}
                  name="date"
                  type={kind === "task" ? "datetime-local" : "date"}
                />
              </label>
            ) : null}
          </div>
          <label className="block">
            <span className={label}>Notes / details</span>
            <textarea
              className={`${textField} min-h-20 resize-y py-2.5`}
              maxLength={10000}
              name="details"
              placeholder="Add relevant context"
            />
          </label>
          <div className="flex justify-end">
            <Button disabled={busy} type="submit" variant="gold">
              {busy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : (
                <Plus aria-hidden="true" className="size-4" />
              )}
              Save record
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <RecordsCard title="Financial goals" count={props.goals.length}>
          {props.goals.map((item) => (
            <RecordRow
              key={item.id}
              title={item.title}
              detail={`${item.goal_type.replaceAll("_", " ")} · target ${currency.format(item.target_amount)} · saved ${currency.format(item.current_amount)}`}
              date={shortDate(item.target_date)}
              onDelete={() => remove("goal", item.id)}
            />
          ))}
        </RecordsCard>
        <RecordsCard title="Investments" count={props.investments.length}>
          {props.investments.map((item) => (
            <RecordRow
              key={item.id}
              title={item.name}
              detail={`${item.investment_type.replaceAll("_", " ")} · invested ${currency.format(item.invested_amount)} · current ${currency.format(item.current_value)}${item.monthly_sip ? ` · SIP ${currency.format(item.monthly_sip)}/mo` : ""}`}
              date={shortDate(item.investment_date)}
              onDelete={() => remove("investment", item.id)}
            />
          ))}
        </RecordsCard>
        <RecordsCard title="Insurance" count={props.insurance.length}>
          {props.insurance.map((item) => (
            <RecordRow
              key={item.id}
              title={item.policy_name}
              detail={`${item.insurance_type} · ${item.provider || "provider not recorded"} · cover ${currency.format(item.cover_amount)}`}
              date={`Renews ${shortDate(item.renewal_date)}`}
              onDelete={() => remove("insurance", item.id)}
            />
          ))}
        </RecordsCard>
        <RecordsCard title="Follow-up tasks" count={props.tasks.length}>
          {props.tasks.map((item) => (
            <div
              className="flex items-start justify-between gap-3 border-b py-3 last:border-0"
              key={item.id}
            >
              <button
                aria-label={
                  item.status === "completed" ? "Reopen task" : "Complete task"
                }
                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${item.status === "completed" ? "border-emerald-600 bg-emerald-600 text-white" : "border-border hover:border-primary text-transparent"}`}
                onClick={() => completeTask(item)}
                type="button"
              >
                <Check aria-hidden="true" className="size-3.5" />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${item.status === "completed" ? "text-muted-foreground line-through" : ""}`}
                >
                  {item.title}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {item.priority} priority · {shortDate(item.due_at)}
                </p>
              </div>
              <button
                aria-label={`Delete ${item.title}`}
                className="text-muted-foreground hover:text-destructive p-1"
                onClick={() => remove("task", item.id)}
                type="button"
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </div>
          ))}
        </RecordsCard>
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Client documents</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Private PDFs, Excel files, and images (up to 10 MB each).
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                accept="application/pdf,.xlsx,.xls,image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={fileBusy}
                onChange={(event) => {
                  void uploadFile(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
                type="file"
              />
              <span className="border-border hover:bg-muted inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium">
                {fileBusy ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                Upload
              </span>
            </label>
          </div>
          {props.documents.length ? (
            <ul className="divide-border mt-4 divide-y">
              {props.documents.map((document) => (
                <li
                  className="flex items-center justify-between gap-3 py-3"
                  key={document.id}
                >
                  <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {document.file_name}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {(document.file_size / 1024).toFixed(0)} KB ·{" "}
                      {shortDate(document.created_at)}
                    </p>
                  </div>
                  {document.download_url ? (
                    <a
                      className="text-primary text-xs font-semibold hover:underline"
                      href={document.download_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      Unavailable
                    </span>
                  )}
                  <button
                    aria-label={`Delete ${document.file_name}`}
                    className="text-muted-foreground hover:text-destructive p-1"
                    onClick={() => remove("document", document.id)}
                    type="button"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground mt-5 rounded-xl border border-dashed p-6 text-center text-sm">
              No documents uploaded.
            </p>
          )}
        </Card>
      </div>
    </section>
  );
}

function RecordsCard({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
          {count}
        </span>
      </div>
      <div className="mt-3">
        {count ? (
          children
        ) : (
          <p className="text-muted-foreground bg-muted/50 rounded-lg px-3 py-5 text-center text-sm">
            Nothing recorded yet.
          </p>
        )}
      </div>
    </Card>
  );
}

function RecordRow({
  title,
  detail,
  date,
  onDelete,
}: {
  title: string;
  detail: string;
  date: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-xs capitalize">
          {detail}
        </p>
        <p className="text-muted-foreground mt-1 text-[11px]">{date}</p>
      </div>
      <button
        aria-label={`Delete ${title}`}
        className="text-muted-foreground hover:text-destructive p-1"
        onClick={onDelete}
        type="button"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
