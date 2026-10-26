"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LoaderCircle,
  Plus,
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchAdminJson } from "@/features/admin/api";

type Assignment = {
  user_id: string;
  role: "owner" | "admin" | "advisor" | "viewer";
  email: string;
  created_at: string;
};
type AssignmentResponse = { assignments: Assignment[] };
const roleOptions = ["admin", "advisor", "viewer"] as const;

const roleDescriptions = [
  {
    role: "Owner",
    access:
      "Full CRM access, manage roles and permissions, remove staff assignments.",
  },
  {
    role: "Admin",
    access:
      "Manage client records, consultations, documents, tasks, and exports.",
  },
  {
    role: "Advisor",
    access:
      "Create and update client records, consultations, notes, goals, and follow-ups. Client deletion remains restricted to admins and owners.",
  },
  {
    role: "Viewer",
    access: "Read-only access to client and consultation records.",
  },
];

export function AdminSettings() {
  const [data, setData] = useState<AssignmentResponse | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof roleOptions)[number]>("advisor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState("");

  const load = useCallback(() => {
    setError("");
    fetchAdminJson<AssignmentResponse>("/api/admin/settings/roles")
      .then(setData)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Role assignments could not be loaded.",
        ),
      );
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fetchAdminJson("/api/admin/settings/roles", {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      setEmail("");
      setNotice("Administrator access was assigned.");
      load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Access could not be assigned.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function update(
    userId: string,
    nextRole: (typeof roleOptions)[number],
  ) {
    setSavingId(userId);
    setError("");
    setNotice("");
    try {
      await fetchAdminJson("/api/admin/settings/roles", {
        method: "PATCH",
        body: JSON.stringify({ userId, role: nextRole }),
      });
      setNotice("Administrator role updated.");
      load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The role could not be updated.",
      );
    } finally {
      setSavingId("");
    }
  }

  async function remove(assignment: Assignment) {
    if (!window.confirm(`Remove CRM access for ${assignment.email}?`)) return;
    setSavingId(assignment.user_id);
    setError("");
    try {
      await fetchAdminJson(
        `/api/admin/settings/roles?userId=${encodeURIComponent(assignment.user_id)}`,
        { method: "DELETE" },
      );
      setNotice("CRM access removed.");
      load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Access could not be removed.",
      );
    } finally {
      setSavingId("");
    }
  }

  const field =
    "border-input bg-background text-foreground h-11 w-full rounded-lg border px-3.5 text-sm";
  return (
    <div className="space-y-6">
      <div>
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          Workspace access
        </p>
        <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
          Admin settings
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Manage the people who can access private client records and the level
          of access they receive.
        </p>
      </div>
      {error ? (
        <p
          className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p
          className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <Card className="overflow-hidden">
          <div className="border-border flex items-center gap-3 border-b p-5 sm:p-6">
            <span className="bg-accent text-primary grid size-10 place-items-center rounded-xl">
              <UsersRound className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold">Administrator access</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Role changes take effect on the next request.
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <form
              className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]"
              onSubmit={add}
            >
              <label className="sr-only" htmlFor="admin-email">
                Registered account email
              </label>
              <input
                autoComplete="email"
                className={field}
                id="admin-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Registered account email"
                required
                type="email"
                value={email}
              />
              <label className="sr-only" htmlFor="admin-role">
                New role
              </label>
              <select
                className={field}
                id="admin-role"
                onChange={(event) =>
                  setRole(event.target.value as (typeof roleOptions)[number])
                }
                value={role}
              >
                {roleOptions.map((item) => (
                  <option className="capitalize" key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <Button disabled={busy} type="submit" variant="gold">
                {busy ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Add access
              </Button>
            </form>
            <p className="text-muted-foreground mt-3 text-xs">
              The person must already have a WealthTogether account. Owner
              access is provisioned through a trusted Supabase admin process.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-muted/65 text-muted-foreground text-xs">
                  <tr>
                    <th className="rounded-l-lg px-3 py-3 font-medium">
                      Account
                    </th>
                    <th className="px-3 py-3 font-medium">Role</th>
                    <th className="px-3 py-3 font-medium">Added</th>
                    <th className="rounded-r-lg px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {data?.assignments.map((assignment) => (
                    <tr key={assignment.user_id}>
                      <td className="max-w-[260px] truncate px-3 py-3 font-medium">
                        {assignment.email}
                      </td>
                      <td className="px-3 py-3">
                        {assignment.role === "owner" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 capitalize dark:text-amber-300">
                            <ShieldCheck className="size-3.5" />
                            Owner
                          </span>
                        ) : (
                          <select
                            aria-label={`Role for ${assignment.email}`}
                            className="border-input bg-background text-foreground h-9 rounded-lg border px-2 text-xs capitalize"
                            disabled={savingId === assignment.user_id}
                            onChange={(event) =>
                              void update(
                                assignment.user_id,
                                event.target
                                  .value as (typeof roleOptions)[number],
                              )
                            }
                            value={assignment.role}
                          >
                            {roleOptions.map((item) => (
                              <option
                                className="capitalize"
                                key={item}
                                value={item}
                              >
                                {item}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="text-muted-foreground px-3 py-3 text-xs">
                        {new Date(assignment.created_at).toLocaleDateString(
                          "en-IN",
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {assignment.role !== "owner" ? (
                          <button
                            aria-label={`Remove access for ${assignment.email}`}
                            className="text-muted-foreground hover:text-destructive rounded-md p-2"
                            disabled={savingId === assignment.user_id}
                            onClick={() => void remove(assignment)}
                            type="button"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                  {data && data.assignments.length === 0 ? (
                    <tr>
                      <td
                        className="text-muted-foreground px-3 py-8 text-center"
                        colSpan={4}
                      >
                        No administrator assignments found.
                      </td>
                    </tr>
                  ) : null}
                  {!data ? (
                    <tr>
                      <td
                        className="text-muted-foreground px-3 py-8 text-center"
                        colSpan={4}
                      >
                        Loading assignments…
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-base font-semibold">Role permissions</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Access is checked on the server for every private page and API
            request.
          </p>
          <div className="mt-4 space-y-3">
            {roleDescriptions.map((item) => (
              <div
                className="border-border rounded-xl border p-3.5"
                key={item.role}
              >
                <p className="text-sm font-semibold">{item.role}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
                  {item.access}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
