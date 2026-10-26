"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/components/ui/chart-card";
import {
  formatPortfolioCurrency,
  portfolioCategories,
  summarizePortfolio,
  type PortfolioHolding,
} from "@/features/portfolio/model";

const tooltipContentStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--popover-foreground)",
};
const tooltipItemStyle = { color: "var(--popover-foreground)" };
const tooltipLabelStyle = { color: "var(--muted-foreground)" };

function createTimeline(holdings: PortfolioHolding[]) {
  const monthCount = new Set(
    holdings.map((holding) => holding.investmentDate.slice(0, 7)),
  ).size;
  const period = monthCount > 48 ? "year" : "month";
  const totals = new Map<string, number>();

  for (const holding of holdings) {
    const key = holding.investmentDate.slice(0, period === "year" ? 4 : 7);
    totals.set(key, (totals.get(key) ?? 0) + holding.investedAmount);
  }

  let cumulativeInvested = 0;
  return [...totals.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([key, amount]) => {
      cumulativeInvested += amount;
      const [year, month] = key.split("-").map(Number);
      const label =
        period === "year"
          ? String(year)
          : new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            });
      return { period: label, amountInvested: amount, cumulativeInvested };
    });
}

export function PortfolioCharts({
  holdings,
}: {
  holdings: PortfolioHolding[];
}) {
  const summary = summarizePortfolio(holdings);
  const allocation = summary.categorySummaries.filter(
    (category) => category.currentValue > 0,
  );
  const distribution = summary.categorySummaries.filter(
    (category) => category.currentValue > 0 || category.investedAmount > 0,
  );
  const timeline = createTimeline(holdings);
  const annualTimeline =
    new Set(holdings.map((holding) => holding.investmentDate.slice(0, 7)))
      .size > 48;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard
        title="Asset allocation"
        description="Share of today’s portfolio value held in each category."
      >
        {allocation.length === 0 ? (
          <div className="text-muted-foreground grid min-h-64 place-items-center px-6 text-center text-sm leading-6">
            Add a current value above zero to see how your portfolio is
            allocated.
          </div>
        ) : (
          <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,.8fr)]">
            <div aria-label="Asset allocation by current value" role="img">
              <ResponsiveContainer height={260} width="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    dataKey="currentValue"
                    innerRadius={68}
                    nameKey="label"
                    outerRadius={96}
                    paddingAngle={2}
                    stroke="var(--card)"
                    strokeWidth={3}
                  >
                    {allocation.map((item) => (
                      <Cell
                        fill={
                          portfolioCategories.find(
                            (category) => category.value === item.category,
                          )?.color ?? "#8090A5"
                        }
                        key={item.category}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    formatter={(value) =>
                      formatPortfolioCurrency(Number(value ?? 0))
                    }
                    itemStyle={tooltipItemStyle}
                    labelStyle={tooltipLabelStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-1">
              {allocation.map((item) => {
                const color = portfolioCategories.find(
                  (category) => category.value === item.category,
                )?.color;
                return (
                  <li
                    className="flex min-w-0 items-center justify-between gap-2 text-xs"
                    key={item.category}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="text-muted-foreground shrink-0 tabular-nums">
                      {new Intl.NumberFormat("en-IN", {
                        style: "percent",
                        maximumFractionDigits: 0,
                      }).format(item.allocation)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Category-wise distribution"
        description="Compare invested principal with each category’s current value."
      >
        {distribution.length === 0 ? (
          <div className="text-muted-foreground grid min-h-64 place-items-center px-6 text-center text-sm leading-6">
            Category totals will appear when you add a holding.
          </div>
        ) : (
          <div
            aria-label="Invested and current value by asset category"
            role="img"
          >
            <ResponsiveContainer
              height={Math.max(270, distribution.length * 43)}
              width="100%"
            >
              <BarChart
                data={distribution}
                layout="vertical"
                margin={{ top: 8, right: 16, bottom: 4, left: 4 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  horizontal={false}
                />
                <XAxis
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-IN", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(Number(value))
                  }
                  tickLine={false}
                  type="number"
                />
                <YAxis
                  axisLine={false}
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  type="category"
                  width={104}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(value) =>
                    formatPortfolioCurrency(Number(value ?? 0))
                  }
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                />
                <Legend />
                <Bar
                  dataKey="investedAmount"
                  fill="#7894B8"
                  name="Invested"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="currentValue"
                  fill="#D4AF37"
                  name="Current value"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        className="xl:col-span-2"
        title="Investment timeline"
        description={`Cumulative invested principal by ${annualTimeline ? "year" : "investment month"}. Current values are not represented as historical valuations.`}
      >
        {timeline.length === 0 ? (
          <div className="text-muted-foreground grid min-h-64 place-items-center px-6 text-center text-sm leading-6">
            Your investment timeline will appear when you add holdings.
          </div>
        ) : (
          <div aria-label="Cumulative investment timeline" role="img">
            <ResponsiveContainer height={300} width="100%">
              <LineChart
                data={timeline}
                margin={{ top: 8, right: 16, bottom: 4, left: 8 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="period"
                  minTickGap={20}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-IN", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(Number(value))
                  }
                  tickLine={false}
                  width={68}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(value) =>
                    formatPortfolioCurrency(Number(value ?? 0))
                  }
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                />
                <Line
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  dataKey="cumulativeInvested"
                  dot={{ r: timeline.length > 24 ? 0 : 3 }}
                  isAnimationActive
                  name="Cumulative invested"
                  stroke="#D4AF37"
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
