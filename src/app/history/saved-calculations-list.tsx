"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCalculatorValue } from "@/features/calculators/format";
import {
  calculatorRoutes,
  type SavedCalculationRecord,
} from "@/features/calculators/saved/saved-calculations";

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

export function SavedCalculationsList({
  initialRecords,
  setupMessage,
}: {
  initialRecords: SavedCalculationRecord[];
  setupMessage?: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState(setupMessage ?? "");
  const visibleRecords = records.filter((record) =>
    `${record.name} ${record.calculator_title}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );

  async function duplicate(record: SavedCalculationRecord) {
    if (!supabase) return;
    setBusyId(record.id);
    setMessage("");
    const copyName = `${record.name.slice(0, 72)} (copy)`;
    try {
      const { data, error } = await supabase
        .from("saved_calculations")
        .insert({
          calculator_id: record.calculator_id,
          calculator_title: record.calculator_title,
          name: copyName,
          inputs: record.inputs,
          results: record.results,
        })
        .select("*")
        .single();
      if (error || !data) {
        setMessage(
          error?.message ?? "This calculation could not be duplicated.",
        );
        return;
      }
      setRecords((current) => [
        data as unknown as SavedCalculationRecord,
        ...current,
      ]);
      setMessage(`Created “${copyName}”.`);
    } catch {
      setMessage(
        "We couldn’t reach your saved calculations. Check your connection and try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function remove(record: SavedCalculationRecord) {
    if (
      !supabase ||
      !window.confirm(`Delete “${record.name}” from your history?`)
    )
      return;
    setBusyId(record.id);
    setMessage("");
    try {
      const { error } = await supabase
        .from("saved_calculations")
        .delete()
        .eq("id", record.id);
      if (error) {
        setMessage(error.message);
        return;
      }
      setRecords((current) => current.filter((item) => item.id !== record.id));
      setMessage(`Deleted “${record.name}”.`);
    } catch {
      setMessage(
        "We couldn’t reach your saved calculations. Check your connection and try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {records.length > 0 ? (
          <div className="max-w-md flex-1">
            <label
              className="text-foreground mb-2 block text-sm font-medium"
              htmlFor="history-search"
            >
              Search history
            </label>
            <input
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25 h-11 w-full rounded-lg border px-3.5 text-sm shadow-sm outline-none focus-visible:ring-2"
              id="history-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or calculator"
              type="search"
              value={search}
            />
          </div>
        ) : (
          <span />
        )}
        <p className="text-muted-foreground text-sm">
          {records.length}{" "}
          {records.length === 1 ? "calculation" : "calculations"}
        </p>
      </div>
      {message ? (
        <p
          aria-live="polite"
          className={`${setupMessage ? "text-destructive" : "text-muted-foreground"} text-sm`}
          role={setupMessage ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
      {records.length === 0 ? (
        setupMessage ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-display text-foreground text-2xl">
                Your saved plans are unavailable.
              </p>
              <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm leading-6">
                Resolve the issue above, then try loading your history again.
              </p>
              <Button asChild className="mt-5" variant="outline">
                <Link href="/history">Try again</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-display text-foreground text-2xl">
                Your planning history starts here.
              </p>
              <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm leading-6">
                Calculate a scenario, then save it to return to its inputs,
                update it, or make a copy.
              </p>
              <Button asChild className="mt-5" variant="gold">
                <Link href="/calculators/sip">Explore a calculator</Link>
              </Button>
            </CardContent>
          </Card>
        )
      ) : visibleRecords.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center text-sm">
            No saved calculations match “{search}”.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleRecords.map((record) => {
            const route = calculatorRoutes[record.calculator_id];
            return (
              <Card className="flex flex-col" key={record.id}>
                <CardContent className="flex h-full flex-col p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        {record.calculator_title}
                      </p>
                      <h2 className="text-foreground mt-1 truncate text-lg font-semibold">
                        {record.name}
                      </h2>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Updated {formatUpdatedAt(record.updated_at)}
                      </p>
                    </div>
                    {route ? (
                      <Button asChild size="sm" variant="gold">
                        <Link
                          href={`/calculators/${route}?edit=${encodeURIComponent(record.id)}`}
                        >
                          <Pencil aria-hidden="true" className="size-3.5" />
                          Edit
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                  {Array.isArray(record.results?.metrics) ? (
                    <div className="border-border mt-5 grid grid-cols-2 gap-3 border-t pt-4">
                      {record.results.metrics.slice(0, 2).map((metric) => (
                        <div className="min-w-0" key={metric.id}>
                          <p className="text-muted-foreground truncate text-xs">
                            {metric.label}
                          </p>
                          <p className="text-foreground mt-1 truncate text-sm font-semibold">
                            {formatCalculatorValue(
                              metric.value,
                              metric.format,
                              metric.currency,
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    <Button
                      disabled={busyId === record.id}
                      onClick={() => void duplicate(record)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Copy aria-hidden="true" className="size-3.5" />
                      Duplicate
                    </Button>
                    <Button
                      disabled={busyId === record.id}
                      onClick={() => void remove(record)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
