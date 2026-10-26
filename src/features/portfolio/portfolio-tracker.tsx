"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { familyProfileSeed } from "@/features/family/model";
import { useFamilyFinance } from "@/features/family/use-family-finance";
import { Card, CardContent } from "@/components/ui/card";
import { InputField } from "@/components/ui/input-field";
import { NumberCard } from "@/components/ui/number-card";
import { SelectField } from "@/components/ui/select-field";
import { HoldingForm } from "@/features/portfolio/holding-form";
import { downloadPortfolioSummaryPdf } from "@/features/portfolio/export-pdf";
import { PortfolioCharts } from "@/features/portfolio/portfolio-charts";
import {
  formatPortfolioCurrency,
  formatPortfolioDate,
  formatPortfolioPercent,
  getCategoryLabel,
  portfolioCategories,
  summarizePortfolio,
  type PortfolioHolding,
  type PortfolioHoldingInput,
} from "@/features/portfolio/model";
import { usePortfolio } from "@/features/portfolio/use-portfolio";

const filterOptions = [
  { value: "all", label: "All categories" },
  ...portfolioCategories.map(({ value, label }) => ({ value, label })),
];

function LoadingPortfolio() {
  return (
    <div
      aria-label="Loading portfolio"
      className="text-muted-foreground flex min-h-72 items-center justify-center gap-3 text-sm"
      role="status"
    >
      <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
      Loading your portfolio from this browser…
    </div>
  );
}

export function PortfolioTracker() {
  const portfolio = usePortfolio();
  const family = useFamilyFinance();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioHolding | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const summary = useMemo(
    () => summarizePortfolio(portfolio.holdings),
    [portfolio.holdings],
  );
  const filteredHoldings = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return [...portfolio.holdings]
      .filter(
        (holding) =>
          categoryFilter === "all" || holding.category === categoryFilter,
      )
      .filter(
        (holding) =>
          !normalizedQuery ||
          holding.name.toLocaleLowerCase().includes(normalizedQuery),
      )
      .sort((first, second) =>
        second.investmentDate.localeCompare(first.investmentDate),
      );
  }, [categoryFilter, portfolio.holdings, query]);

  useEffect(() => {
    if (!showForm) return;
    window.requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, [showForm]);

  function startAdd() {
    portfolio.clearError();
    setEditing(null);
    setShowForm(true);
  }

  function startEdit(holding: PortfolioHolding) {
    portfolio.clearError();
    setEditing(holding);
    setShowForm(true);
  }

  function saveHolding(values: PortfolioHoldingInput) {
    const saved = editing
      ? portfolio.update(editing.id, values)
      : portfolio.add(values);
    if (saved) {
      setShowForm(false);
      setEditing(null);
      setExportMessage(null);
    }
    return saved;
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
    portfolio.clearError();
  }

  async function exportPdf() {
    if (!portfolio.holdings.length) return;
    setIsExporting(true);
    setExportMessage(null);
    try {
      await downloadPortfolioSummaryPdf(
        portfolio.holdings,
        family.data.profiles.map(({ id, name }) => ({ id, name })),
      );
      setExportMessage("Portfolio summary downloaded as PDF.");
    } catch {
      setExportMessage("PDF export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  if (!portfolio.hydrated) return <LoadingPortfolio />;

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            Your investments, in one view
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            Portfolio tracker
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Add your holdings manually and compare invested amounts with the
            current values you enter.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!portfolio.holdings.length || isExporting}
            onClick={() => void exportPdf()}
            variant="outline"
          >
            {isExporting ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <Download aria-hidden="true" className="size-4" />
            )}
            Export PDF
          </Button>
          <Button onClick={startAdd} variant="gold">
            <Plus aria-hidden="true" className="size-4" />
            Add holding
          </Button>
        </div>
      </header>

      <div className="border-border bg-card text-muted-foreground flex items-start gap-3 rounded-xl border px-4 py-3 text-xs leading-5">
        <ShieldCheck
          aria-hidden="true"
          className="text-primary mt-0.5 size-4 shrink-0"
        />
        <p>
          Manual tracking only. Holdings are saved in this browser; no financial
          accounts are connected and no live prices are fetched.
        </p>
      </div>

      {portfolio.warning ? (
        <p
          className="border-border bg-secondary text-foreground rounded-lg border px-4 py-3 text-sm"
          role="status"
        >
          {portfolio.warning}
        </p>
      ) : null}
      {portfolio.error ? (
        <p
          className="border-destructive/40 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm"
          role="alert"
        >
          {portfolio.error}
        </p>
      ) : null}
      {exportMessage ? (
        <p className="text-muted-foreground text-sm" role="status">
          {exportMessage}
        </p>
      ) : null}

      <section
        aria-label="Portfolio overview"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <NumberCard
          detail={`${summary.holdingsCount} ${summary.holdingsCount === 1 ? "holding" : "holdings"}`}
          icon={WalletCards}
          label="Total invested"
          value={formatPortfolioCurrency(summary.investedAmount)}
        />
        <NumberCard
          detail="Based on the values you entered"
          icon={WalletCards}
          label="Current portfolio value"
          value={formatPortfolioCurrency(summary.currentValue)}
        />
        <NumberCard
          change={
            summary.investedAmount > 0
              ? formatPortfolioPercent(summary.gainLossPercent)
              : undefined
          }
          changeDirection={
            summary.gainLoss > 0
              ? "up"
              : summary.gainLoss < 0
                ? "down"
                : "neutral"
          }
          detail="Current value minus invested amount"
          icon={summary.gainLoss < 0 ? ArrowDownRight : ArrowUpRight}
          label="Overall gain / loss"
          value={formatPortfolioCurrency(summary.gainLoss)}
        />
      </section>

      {showForm ? (
        <div ref={formRef}>
          <HoldingForm
            holding={editing ?? undefined}
            key={editing?.id ?? "new-holding"}
            ownerOptions={family.data.profiles.map(({ id, name }) => ({
              id,
              name,
            }))}
            onCancel={cancelForm}
            onSave={saveHolding}
          />
        </div>
      ) : null}

      {portfolio.holdings.length > 0 ? (
        <PortfolioCharts holdings={portfolio.holdings} />
      ) : null}

      <section
        aria-labelledby="portfolio-holdings-heading"
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className="font-display text-2xl tracking-tight"
              id="portfolio-holdings-heading"
            >
              Your holdings
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {portfolio.holdings.length
                ? `${portfolio.holdings.length} ${portfolio.holdings.length === 1 ? "investment" : "investments"} tracked`
                : "Start by adding an investment you want to track."}
            </p>
          </div>
          {portfolio.holdings.length ? (
            <div className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_13rem]">
              <InputField
                label="Search holdings"
                leading={<Search aria-hidden="true" className="size-4" />}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search investment name"
                value={query}
              />
              <SelectField
                label="Filter by category"
                onChange={(event) => setCategoryFilter(event.target.value)}
                options={filterOptions}
                value={categoryFilter}
              />
            </div>
          ) : null}
        </div>

        {portfolio.holdings.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center px-6 py-12 text-center">
              <span className="bg-accent text-accent-foreground grid size-12 place-items-center rounded-2xl">
                <WalletCards aria-hidden="true" className="size-6" />
              </span>
              <h3 className="font-display mt-4 text-xl">
                Your portfolio starts here
              </h3>
              <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
                Add a mutual fund, stock, deposit, retirement account, gold, or
                cash holding to see your portfolio totals and allocation.
              </p>
              <Button className="mt-5" onClick={startAdd} variant="gold">
                <Plus aria-hidden="true" className="size-4" />
                Add your first holding
              </Button>
            </CardContent>
          </Card>
        ) : filteredHoldings.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <p className="font-semibold">No holdings match those filters.</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Try another name or category.
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setCategoryFilter("all");
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredHoldings.map((holding) => {
              const gainLoss = holding.currentValue - holding.investedAmount;
              const gainLossPercent = gainLoss / holding.investedAmount;
              const categoryColor = portfolioCategories.find(
                (category) => category.value === holding.category,
              )?.color;

              return (
                <Card key={holding.id}>
                  <CardContent className="grid gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-1 size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: categoryColor }}
                      />
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold sm:text-base">
                          {holding.name}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {getCategoryLabel(holding.category)}
                          <span aria-hidden="true" className="mx-2">
                            ·
                          </span>
                          {family.data.profiles.find(
                            (profile) => profile.id === holding.profileId,
                          )?.name ??
                            familyProfileSeed.find(
                              (profile) => profile.id === holding.profileId,
                            )?.name ??
                            "Self"}
                          <span aria-hidden="true" className="mx-2">
                            ·
                          </span>
                          Invested {formatPortfolioDate(holding.investmentDate)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:min-w-[29rem] sm:gap-5">
                      <div>
                        <p className="text-muted-foreground text-[10px] sm:text-xs">
                          Invested
                        </p>
                        <p className="mt-1 text-xs font-medium tabular-nums sm:text-sm">
                          {formatPortfolioCurrency(holding.investedAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] sm:text-xs">
                          Current value
                        </p>
                        <p className="mt-1 text-xs font-medium tabular-nums sm:text-sm">
                          {formatPortfolioCurrency(holding.currentValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] sm:text-xs">
                          Gain / loss
                        </p>
                        <p
                          className={`mt-1 text-xs font-semibold tabular-nums sm:text-sm ${gainLoss < 0 ? "text-destructive" : "text-emerald-700 dark:text-emerald-300"}`}
                        >
                          {formatPortfolioCurrency(gainLoss)}
                          <span className="text-[10px] font-medium sm:ml-1 sm:text-xs">
                            ({formatPortfolioPercent(gainLossPercent)})
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 sm:col-start-2">
                      {deletingId === holding.id ? (
                        <>
                          <span className="text-muted-foreground mr-1 text-xs">
                            Delete this holding?
                          </span>
                          <Button
                            onClick={() => {
                              portfolio.remove(holding.id);
                              setDeletingId(null);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Delete
                          </Button>
                          <Button
                            onClick={() => setDeletingId(null)}
                            size="sm"
                            variant="ghost"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            aria-label={`Edit ${holding.name}`}
                            onClick={() => startEdit(holding)}
                            size="sm"
                            variant="outline"
                          >
                            <Pencil aria-hidden="true" className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            aria-label={`Delete ${holding.name}`}
                            onClick={() => setDeletingId(holding.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2
                              aria-hidden="true"
                              className="text-destructive size-3.5"
                            />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
