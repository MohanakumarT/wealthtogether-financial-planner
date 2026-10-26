"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  Plus,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchAdminJson } from "@/features/admin/api";
import {
  ClientFormDialog,
  type AdminClient,
} from "@/features/admin/client-form-dialog";
import type { FollowUpStatus } from "@/features/admin/schema";

type ClientPageData = {
  clients: AdminClient[];
  total: number;
  page: number;
  pageSize: number;
};
const followLabels: Record<FollowUpStatus, string> = {
  none: "No follow-up",
  due: "Follow-up due",
  scheduled: "Scheduled",
  completed: "Completed",
};

function date(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export function ClientsList() {
  const [data, setData] = useState<ClientPageData | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [followUp, setFollowUp] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<"new" | AdminClient | null>(null);
  const refresh = useCallback(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("search", query);
    if (followUp !== "all") params.set("followUp", followUp);
    fetchAdminJson<ClientPageData>(`/api/admin/clients?${params}`)
      .then(setData)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Client records could not be loaded.",
        ),
      )
      .finally(() => setLoading(false));
  }, [page, query, followUp]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 20));
  const shown = data?.clients.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            Client relationships
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            Clients
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {data
              ? `${data.total.toLocaleString("en-IN")} private client records`
              : "Search and manage your client list."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => window.location.assign("/api/admin/clients/export")}
            variant="outline"
          >
            <ArrowDownToLine aria-hidden="true" className="size-4" />
            Export CSV
          </Button>
          <Button onClick={() => setDialog("new")} variant="gold">
            <Plus aria-hidden="true" className="size-4" />
            Add client
          </Button>
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            />
            <Input
              aria-label="Search clients"
              className="pl-10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone or city"
              value={search}
            />
          </div>
          <select
            aria-label="Filter by follow-up status"
            className="border-input bg-background text-foreground h-11 w-full rounded-lg border px-3.5 text-sm"
            onChange={(event) => {
              setFollowUp(event.target.value);
              setPage(1);
            }}
            value={followUp}
          >
            <option value="all">All follow-up statuses</option>
            <option value="due">Follow-up due</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="none">No follow-up set</option>
          </select>
        </div>
      </Card>

      {error ? (
        <p
          className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <Card className="overflow-hidden">
        {loading && !data ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 p-12 text-sm">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Loading client records…
          </div>
        ) : null}
        {!loading && shown === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="bg-accent text-primary mx-auto grid size-12 place-items-center rounded-2xl">
              <UsersRound aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 text-base font-semibold">
              {query || followUp !== "all"
                ? "No matching clients"
                : "Your client list starts here"}
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-6">
              {query || followUp !== "all"
                ? "Try a different search or follow-up status."
                : "Add a client to keep their goals, consultation history and saved plans together."}
            </p>
            {!query && followUp === "all" ? (
              <Button
                className="mt-5"
                onClick={() => setDialog("new")}
                variant="gold"
              >
                <Plus aria-hidden="true" className="size-4" />
                Add first client
              </Button>
            ) : null}
          </div>
        ) : null}
        {shown > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-muted/65 text-muted-foreground text-xs">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">Client</th>
                    <th className="px-5 py-3.5 font-medium">Phone</th>
                    <th className="px-5 py-3.5 font-medium">City</th>
                    <th className="px-5 py-3.5 font-medium">Follow-up</th>
                    <th className="px-5 py-3.5 font-medium">Last updated</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {data?.clients.map((client) => (
                    <tr className="hover:bg-muted/35" key={client.id}>
                      <td className="px-5 py-4">
                        <Link
                          className="flex items-center gap-3"
                          href={`/admin/clients/${client.id}`}
                        >
                          <span className="bg-accent text-primary grid size-9 shrink-0 place-items-center rounded-xl">
                            <UserRound aria-hidden="true" className="size-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">
                              {client.name}
                            </span>
                            <span className="text-muted-foreground mt-1 block truncate text-xs">
                              {client.email}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="text-muted-foreground px-5 py-4">
                        {client.phone}
                      </td>
                      <td className="text-muted-foreground px-5 py-4">
                        {client.city || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <FollowBadge status={client.follow_up_status} />
                      </td>
                      <td className="text-muted-foreground px-5 py-4">
                        {date(client.updated_at)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          className="text-primary text-xs font-semibold hover:underline"
                          href={`/admin/clients/${client.id}`}
                        >
                          View profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-border divide-y md:hidden">
              {data?.clients.map((client) => (
                <li className="p-4" key={client.id}>
                  <Link
                    className="flex items-start gap-3"
                    href={`/admin/clients/${client.id}`}
                  >
                    <span className="bg-accent text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                      <UserRound aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {client.name}
                      </span>
                      <span className="text-muted-foreground mt-1 block truncate text-xs">
                        {client.email}
                      </span>
                      <span className="mt-3 flex flex-wrap items-center gap-2">
                        <FollowBadge status={client.follow_up_status} />
                        <span className="text-muted-foreground text-xs">
                          {client.city || "City not set"}
                        </span>
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="text-muted-foreground mt-1 size-4 shrink-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Card>

      {data && data.total > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            Showing {((page - 1) * 20 + 1).toLocaleString("en-IN")}–
            {((page - 1) * 20 + shown).toLocaleString("en-IN")} of{" "}
            {data.total.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
              size="sm"
              variant="outline"
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Previous
            </Button>
            <span className="text-muted-foreground px-2 text-xs">
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page >= totalPages || loading}
              onClick={() => setPage(page + 1)}
              size="sm"
              variant="outline"
            >
              Next
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : null}
      {dialog ? (
        <ClientFormDialog
          client={dialog === "new" ? undefined : dialog}
          onClose={() => setDialog(null)}
          onSaved={refresh}
        />
      ) : null}
    </div>
  );
}

function FollowBadge({ status }: { status: FollowUpStatus }) {
  const colors =
    status === "due"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : status === "scheduled"
        ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
        : status === "completed"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${colors}`}
    >
      {followLabels[status]}
    </span>
  );
}
